import { Context } from "egg";

export function success<T>(ctx: Context, data: T, status: number = 200) {
  ctx.status = status;
  if (data)
    ctx.body = {
      ...data,
      base: {},
    };
}
