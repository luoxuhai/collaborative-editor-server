import { Context } from "egg";

async function setState(ctx) {
  const { app, header } = ctx;
  const { authorization } = header;
  const token = authorization && authorization.split(" ")[1];
  if (token) {
    try {
      const payload = await app.jwt.verify(token, app.config.jwt.secret);
      ctx.state = app.state = payload;
    } catch (err) {
      ctx.throw(403);
    }
  } else {
    if (!/getFileById/.test(ctx.path)) ctx.throw(422);
  }
}

export default function () {
  return async function authorization(ctx: Context, next: Function) {
    await setState(ctx);
    await next();
    // const { account, role: _role } = ctx.state;
    // if (account) {
    //   if (roleMap[_role] >= role) await next();
    //   else ctx.throw(403);
    // } else ctx.throw(401);
  };
}

export const roleMap = {
  guest: 0,
  admin: 1,
  root: 2,
};
