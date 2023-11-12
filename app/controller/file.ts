import { Controller } from "egg";
import { v4 as uuidv4 } from "uuid";

export function getDocInstance(app, id) {
  return app.ShareDBConnection.get(app.config.doc.collectionName, id);
}

async function createDocContent(app, docId, userId) {
  return new Promise((resolve, reject) => {
    const doc = getDocInstance(app, docId);
    doc.fetch((err) => {
      if (err) reject(err);
      if (doc.type === null) {
        doc.create(
          [{ insert: "欢迎使用!", attributes: { author: userId } }],
          "rich-text",
          () => {
            if (err) {
              reject(err);
            } else resolve(doc.data);
          }
        );
      } else {
        resolve(doc.data);
      }
    });
  });
}

function getPermission(permission, userId, owner) {
  const isOwner = owner === userId;
  delete permission.id;
  permission.editable =
    isOwner ||
    JSON.parse(permission.editable ?? "[]").some((id) => id === userId);

  for (const key in permission) {
    if (typeof permission[key] === "number")
      permission[key] = permission.editable || permission[key] === 1;
  }

  return permission;
}

export default class FileController extends Controller {
  public async getFilesByParent() {
    const { app, ctx } = this;
    const { parentId } = ctx.request.query;
    const { userId } = ctx.state;

    const files = await app.mysql.select("files", {
      where: { parent_id: parentId || null, owner: userId },
    });

    const result = await app.mysql.get("users", {
      id: userId,
    });

    for (const [index, file] of files.entries()) {
      const permission = await app.mysql.get("permission", {
        id: file.permission,
      });

      files[index].permission = permission
        ? getPermission(permission, userId, "")
        : {};
      files[index].isStar =
        !!result.stars && result.stars.split(",").includes(file.id);
    }

    ctx.helper.success(ctx, {
      files,
    });
  }

  public async getFilesByName() {
    const { app, ctx } = this;
    const { name } = ctx.request.query;

    const results = name
      ? await app.mysql.query(`SELECT * FROM files WHERE name LIKE '%${name}%'`)
      : [];

    ctx.helper.success(ctx, { files: results });
  }

  public async getFileById() {
    const { app, ctx } = this;
    const { id } = ctx.request.query;
    const { userId = '' } = ctx.state;

    const file = await app.mysql.get("files", {
      id,
    });
    const permission = await app.mysql.get("permission", {
      id: file.permission,
    });

    ctx.helper.success(ctx, {
      file: {
        ...file,
        permission: permission
          ? getPermission(
              JSON.parse(JSON.stringify(permission)),
              userId,
              file.owner
            )
          : userId === file.owner
          ? {
              commentable: true,
              copyable: true,
              readable: true,
              editable: true,
            }
          : {},
      },
    });
  }

  public async getStarFiles() {
    const { app, ctx } = this;

    let whereStr = "";
    const user = await app.mysql.get("users", {
      id: ctx.state.userId,
    });

    if (user.stars) {
      const starsArr = user.stars.split(",");
      starsArr.forEach((item, index) => {
        whereStr = `${whereStr} id = '${item}' ${
          index === starsArr.length - 1 ? "" : "OR"
        } `;
      });
    }

    const results = whereStr
      ? await app.mysql.query(`SELECT * FROM files WHERE ${whereStr}`)
      : [];

    ctx.helper.success(ctx, {
      files: results.map((res) => ({
        ...res,
        isStar: true,
      })),
    });
  }

  public async createFile() {
    const { app, ctx } = this;
    const { parentId, name, type } = ctx.request.body;
    const { userId } = ctx.state;

    const permissionData = {
      id: uuidv4(),
      editable: JSON.stringify([]),
    };
    await app.mysql.insert("permission", permissionData);

    const data = {
      id: uuidv4(),
      name: name || "",
      type,
      parent_id: parentId,
      owner: userId,
      permission: permissionData.id,
    };
    const result = await app.mysql.insert("files", data);

    if (type === "doc") {
      await this.createDoc(data, userId);
    }

    if (result.affectedRows === 1)
      ctx.helper.success(ctx, {
        [type]: data,
      });
  }

  public async createDoc(data, userId: string) {
    const { app } = this;
    try {
      await createDocContent(app, data.id, userId);
    } catch {
      await app.mysql.delete("files", { id: data.id });
    }
  }

  public async deleteFile() {
    const { app, ctx } = this;
    const { id } = ctx.request.query;

    const data = await app.mysql.get("files", { id });
    data && (await app.mysql.insert("trash", data));
    const result = await app.mysql.delete("files", { id });

    if (result.affectedRows === 1) ctx.helper.success(ctx, {}, 204);
  }

  public async updateFile() {
    const { app, ctx } = this;
    const { id, name } = ctx.request.body;

    const result = await app.mysql.update("files", { name }, { where: { id } });

    if (result.affectedRows === 1) ctx.helper.success(ctx);
  }

  public async sharePermission() {
    const { app, ctx } = this;
    const { id, ...permission } = ctx.request.body;

    const file = await app.mysql.get("files", { id });

    await app.mysql.update("permission", permission, {
      where: { id: file.permission },
    });

    ctx.helper.success(ctx);
  }
}
