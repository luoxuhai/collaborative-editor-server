import { Controller } from "egg";
import { v4 as uuidv4 } from "uuid";

export default class CommentController extends Controller {
  public async createComment() {
    const { app, ctx } = this;
    const { groupId, content, parentId, replyId } = ctx.request.body;
    const { userId } = ctx.state;

    const comment = await app.mysql.insert("comments", {
      id: uuidv4(),
      group_id: groupId,
      content,
      parent_id: parentId,
      reply_id: replyId ?? null,
      owner: userId,
      created_At: app.mysql.literals.now,
    });

    ctx.helper.success(ctx, { comment }, 201);
  }

  public async queryComments() {
    const { app, ctx } = this;
    const { groupId } = ctx.request.query;

    const comments = await app.mysql.select("comments", {
      where: { group_id: groupId, parent_id: groupId },
      orders: [["created_at", "desc"]],
    });

    await this.setOwnerAndReply(comments);

    const count = await app.mysql.count("comments", {
      group_id: groupId,
    });

    ctx.helper.success(ctx, { comments, count });
  }

  public async queryReplyList() {
    const { app, ctx } = this;
    const { commentId } = ctx.request.query;

    const comments = await app.mysql.select("comments", {
      where: { parent_id: commentId },
      orders: [["created_at", "asc"]],
    });

    await this.setOwnerAndReply(comments);

    ctx.helper.success(ctx, { comments });
  }

  public async deleteComment() {
    const { app, ctx } = this;
    const { commentId } = ctx.request.query;
    const { userId } = ctx.state;

    const comment = await app.mysql.get("comments", {
      id: commentId,
    });

    if (comment.owner === userId) {
      await app.mysql.query(
        "DELETE FROM comments WHERE id = ? OR parent_id = ? ",
        [commentId, commentId]
      );

      ctx.helper.success(ctx, 204);
    } else ctx.helper.success(ctx, 403);
  }

  private async setOwnerAndReply(comments, isReply = false) {
    for (const comment of comments) {
      comment.owner = await this.app.mysql.get("users", {
        id: comment.owner,
      });
      if (comment.reply_id && !isReply) {
        const replyComment = await this.app.mysql.get("comments", {
          id: comment.reply_id,
        });
        await this.setOwnerAndReply([replyComment], true);
        comment.reply = replyComment;
        delete comment.reply_id;
      }
    }
  }
}
