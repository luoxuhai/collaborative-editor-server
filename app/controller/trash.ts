import { Controller } from "egg";
import { getDocInstance } from "./file";

async function deleteDocContent(app, id) {
  return new Promise((resolve) => {
    const doc = getDocInstance(app, id);
    doc.fetch(() => {
      if (doc.type) {
        doc.del();
      }
      resolve(doc.data);
    });
  });
}

export default class TrashController extends Controller {
  public async getTrashFiles() {
    const { app, ctx } = this;
    const { userId } = ctx.state;

    const results = await app.mysql.select("trash", {
      where: { owner: userId },
    });

    ctx.helper.success(ctx, { files: results });
  }

  public async deleteTrashFile() {
    const { app, ctx } = this;
    const { id, empty } = ctx.request.query;

    let where: { id?: string } = { id };
    if (empty === "1") {
      where = {};
    }
    await app.mysql.delete("trash", where);
    app.mysql.delete("files", { parent_id: id });
    deleteDocContent(app, id);

    ctx.helper.success(ctx, {}, 204);
  }

  public async restoreTrashFile() {
    const { app, ctx } = this;
    const { id } = ctx.request.body;

    const result = await app.mysql.select("trash", { where: { id } });
    result[0] && (await app.mysql.insert("files", result[0]));
    await app.mysql.delete("trash", { id });

    ctx.helper.success(ctx, {});
  }
}
