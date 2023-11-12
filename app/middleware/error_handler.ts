import { Context } from 'egg';

export default function () {
  return async function errorHandler(ctx: Context, next: Function) {
    try {
      await next();
    } catch (error) {
      ctx.status = error.status || 500;
      if (ctx.status >= 500) ctx.app.emit('error', error, ctx);
      ctx.body = {
        error: error.name,
        detail: error.errors || error.message,
      };
    }
  };
}