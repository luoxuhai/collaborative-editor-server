import { Controller } from "egg";
import { IncomingMessage } from "http";
import * as fs from "fs";
import * as path from "path";
import * as pump from "mz-modules/pump";
import { v4 as uuidv4 } from "uuid";

class EditorController extends Controller {
  public async uploadImage() {
    const { ctx } = this;
    const req = ctx.req as { parts: any } & IncomingMessage;
    req.parts = ctx.multipart();
    const filePath = "app/public/images";
    let filename;
    let stream;

    try {
      while ((stream = await req.parts()) != null) {
        filename = `${uuidv4()}.${stream.filename.split(".").pop()}`;
        const target = path.join(this.config.baseDir, filePath, filename);
        const writeStream = fs.createWriteStream(target);
        await pump(stream, writeStream);
      }
      const localPath = path.join(filePath, filename);
      const result = await ctx.oss.put(
        `collaborative-editor/images/${filename}`,
        localPath,
        {
          meta: {
            "Cache-Control": "public, max-age=31536000",
          },
        }
      );
      fs.unlink(localPath, () => null);

      ctx.body = {
        imgUrl: `${result.url}?x-oss-process=style/s`,
      };
    } catch (error) {
      throw Error(error);
    }
  }
}

module.exports = EditorController;
