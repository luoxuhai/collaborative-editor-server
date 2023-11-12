import {  Controller } from "egg";
import _ from "lodash";

const clients = {};

class MessageController extends Controller {
  async broadcast() {
    const { ctx } = this;
    const message = ctx.args[0] || {};
    const {
      isConnect,
      payload: { courseId },
    } = message;
    const socket = ctx.socket;
    const client = socket.id;

    socket.on("disconnect", () => {
      _.remove(clients[courseId].users, (e) => e.id === client);
    });

    if (!courseId) return;

    if (!(courseId in clients)) {
      clients[courseId] = {};
      clients[courseId].users = [];
      clients[courseId].messages = [];
      clients[courseId].users.push(socket);
    }

    if (isConnect) {
      socket.emit(
        "messages",
        clients[courseId] ? clients[courseId].messages : []
      );
      if (!clients[courseId].users.some((e) => e.id === client)) {
        clients[courseId].users.push(socket);
      }
      return;
    }

    // FIXME: 初始化连接
    // if (isConnect) {
    //   clients[courseId].users.push(socket);
    //
    //   return;
    // }

    // 存入socket
    if (!clients[courseId].users.some((e) => e.id === client)) {
      clients[courseId].users.push(socket);
    }
    // 每个房间最多100条消息
    if (clients[courseId].messages.length > 100)
      clients[courseId].messages.shift();

    clients[courseId].messages.push(message);
    // 广播
    clients[courseId].users.forEach((e) => {
      if (e.id !== client) e.emit("broadcast", message);
    });

    // socket.broadcast.emit('broadcast', message);
  }
}

export default MessageController;
