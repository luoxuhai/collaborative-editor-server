import "colors";
import { IBoot } from "egg";
import * as ShareDB from "sharedb";
import * as richText from "rich-text";
import * as WebSocket from "ws";
import * as sharedbMongo from "sharedb-mongo";
import * as WebSocketJSONStream from "@teamwork/websocket-json-stream";
import * as nodemailer from "nodemailer";
import * as smtpTransport from "nodemailer-smtp-transport";

ShareDB.types.register(richText.type);

function startServer(server: any, app: any) {
  app.ShareDBConnection = app.backend.connect();
  const wss = new WebSocket.Server({ server: server });
  wss.on("connection", (ws) => {
    const stream = new WebSocketJSONStream(ws);
    app.backend.listen(stream);
  });
  console.log("Listening on http://localhost:8080".green);
}

export default class AppBootHook implements IBoot {
  private readonly app: any;

  constructor(app: any) {
    this.app = app;
  }

  async serverDidReady() {
    this.app.axios = require('axios');
    this.app.backend = new ShareDB({
      db: sharedbMongo(`mongodb://47.101.33.94:27017/collaborative`, {
        mongoOptions: {
          user: "lxh",
          password: "123456",
        },
      }),
    });
    startServer(this.app.server, this.app);

    const transporter = nodemailer.createTransport(
      smtpTransport(this.app.config.smtp)
    );

    this.app.sendMail = async (mailOptions) => {
      return transporter.sendMail(mailOptions);
    };
  }
}
