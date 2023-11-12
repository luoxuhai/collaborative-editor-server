import { Controller } from "egg";
import { v4 as uuidv4 } from "uuid";

export default class CollaborationController extends Controller {
  public async getCollaboration() {
    const { app, ctx } = this;
    const { userId } = ctx.state;

    const collaborationList = await app.mysql.select("collaboration", {
      where: { user_id: userId },
    });

    for (const collaboration of collaborationList) {
      collaboration.file = await app.mysql.get("files", {
        id: collaboration.file_id,
      });
      delete collaboration.file_id;
    }

    ctx.helper.success(ctx, {
      collaborationList,
    });
  }

  public async getCollaborator() {
    const { app, ctx } = this;
    const { id } = ctx.request.query;

    const file = await app.mysql.get("files", { id });
    const permission = await app.mysql.get("permission", {
      id: file.permission,
    });

    const editable = JSON.parse(permission.editable) ?? [];
    let whereStr = "";

    editable.forEach((item, index) => {
      whereStr = `${whereStr} id = '${item}' ${
        index === editable.length - 1 ? "" : "OR"
      } `;
    });

    const results = whereStr
      ? await app.mysql.query(`SELECT * FROM users WHERE ${whereStr}`)
      : [];

    ctx.helper.success(ctx, { users: results });
  }

  private isEmail(value) {
    return /@/.test(value);
  }

  public async addCollaborator() {
    const { app, ctx } = this;
    const { id, email } = ctx.request.body;
    const { userId } = ctx.state;

    const file = await app.mysql.get("files", {
      id,
    });

    const permission = await app.mysql.get("permission", {
      id: file.permission,
    });

    let where: any = {
      id: email,
    };

    if (this.isEmail(email)) {
      where = {
        email,
      };
    }

    const user = await app.mysql.get("users", where);

    if (user.id === userId) {
      ctx.throw(1000, 422);
    }

    if (!user) {
      ctx.throw(1001, 404);
    }

    const inviter = await app.mysql.get("users", {
      id: userId,
    });

    if (permission) {
      let editable = JSON.parse(permission.editable ?? []);

      editable = Array.from(new Set([...editable, user.id]));
      await app.mysql.update(
        "permission",
        { editable: JSON.stringify(editable) },
        {
          where: {
            id: file.permission,
          },
        }
      );
    }

    await app.mysql.insert("collaboration", {
      id: uuidv4(),
      created_at: app.mysql.literals.now,
      user_id: user.id,
      file_id: id,
    });

    if (this.isEmail(email)) {
      const url =
        (this.config.env === "prod"
          ? "https://editor.fastools.cn"
          : "http://localhost:8000") + `/docs/${file.id}`;

      app.sendMail({
        from: '"协同编辑" <1852067571@qq.com>',
        to: email,
        subject: "【协同编辑】协作邀请",
        html: `
        <p>亲爱的用户，您好！</p>
        <p>${inviter.nickname}将您添加为《${file.name}》文件的协作者，点击链接<a href="${url}">${url}</a>进入文件参与多人实时协作</p>
        `,
      });
    }

    ctx.helper.success(ctx);
  }

  public async deleteCollaborator() {
    const { app, ctx } = this;
    const { fileId, userId } = ctx.request.query;

    const file = await app.mysql.get("files", {
      id: fileId,
    });

    const permission = await app.mysql.get("permission", {
      id: file.permission,
    });

    let editable = JSON.parse(permission.editable);

    await app.mysql.update(
      "permission",
      { editable: JSON.stringify(editable.filter((item) => item !== userId)) },
      {
        where: {
          id: file.permission,
        },
      }
    );

    await app.mysql.delete("collaboration", {
      file_id: fileId,
      user_id: userId,
    });

    ctx.helper.success(ctx);
  }
}
