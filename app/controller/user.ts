import { Controller } from "egg";

class UserController extends Controller {
  async login() {
    const { ctx } = this;
    const { email, verificationCode, access_token } = ctx.request.body;

    let token, user;

    if (access_token) {
      [token, user] = await ctx.service.user.QQlogin(access_token);
    }

    if (email)
      [token, user] = await ctx.service.user.login(
        email,
        "email",
        verificationCode
      );

    ctx.helper.success(ctx, { user, token }, token ? 200 : 422);
  }

  async sendVerifyCode() {
    const { ctx, app } = this;
    const { email } = ctx.request.query;

    const verifyCode = await ctx.service.user.sendEmailVerifyCode(email);

    await app.redis.set(email, verifyCode[0]!, "EX", 240);

    ctx.status = verifyCode ? 204 : 500;
    console.log(verifyCode);
  }

  async getUserInfoByToken() {
    const { ctx } = this;

    const user = await ctx.service.user.show(ctx.state.userId);

    ctx.helper.success(ctx, { user });
  }

  async getUserInfoById() {
    const { ctx } = this;
    const { id } = ctx.request.query;

    const user = await ctx.service.user.show(id);

    ctx.helper.success(ctx, { user });
  }

  async index() {
    const { ctx } = this;

    const result = await ctx.service.user.index();

    ctx.body = result;
  }

  async updateEmail() {
    const { ctx, app } = this;
    const { email } = ctx.request.body;
    const { userId } = ctx.state;

    await app.mysql.update(
      "users",
      { email },
      {
        where: {
          id: userId,
        },
      }
    );

    ctx.helper.success(ctx);
  }

  async star() {
    const { ctx, app } = this;
    const { id, operate } = ctx.request.body;
    const { userId } = ctx.state;

    const user = await app.mysql.get("users", { id: userId });
    let newStars;
    if (operate === "add") {
      newStars = (user.stars ? [...user.stars.split(","), id] : [id]).join(",");
    } else if (operate === "remove") {
      newStars = user.stars
        .split(",")
        .filter((item) => item !== id)
        .join(",");
    }

    await app.mysql.update(
      "users",
      { stars: newStars },
      { where: { id: userId } }
    );

    ctx.helper.success(ctx, { stars: newStars.split(",") });
  }
}

export default UserController;


