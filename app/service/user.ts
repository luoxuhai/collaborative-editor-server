import { Service } from "egg";
import { generateRandom, getUnionid, getUserInfo } from "../utils";
import { v4 as uuidv4 } from "uuid";

const expiresIn = "90d";

class UserService extends Service {
  async create(payload) {
    const { ctx, app } = this;

    const user = await ctx.model.User.create(payload);

    const token = app.jwt.sign(
      { openId: payload.openId },
      app.config.jwt.secret,
      {
        expiresIn,
      }
    );

    return [user, token];
  }

  async QQlogin(access_token) {
    const { app } = this;

    const { openid } = await getUnionid(app, access_token);
    const { nickname, figureurl_qq } = await getUserInfo(
      app,
      access_token,
      openid
    );

    const result = await this.update(
      { account: openid },
      {
        account: openid,
        nickname,
        avatar: figureurl_qq.replace("http", "https"),
      }
    );

    const token = app.jwt.sign(
      { account: openid, userId: result.id },
      app.config.jwt.secret,
      {
        expiresIn,
      }
    );

    return [token, result];
  }

  async login(account, accountType, verificationCode) {
    const { app } = this;

    let result;

    const localVerifyCode = await app.redis.get(account);

    if (verificationCode === String(localVerifyCode)) {
      result = await this.update(
        { account: account },
        {
          account: account,
          account_type: accountType,
          email: account,
          nickname: account,
          avatar: "",
        }
      );

      app.redis.del(account);
    } else {
      return [null];
    }

    const token = app.jwt.sign(
      { account, userId: result.id },
      app.config.jwt.secret,
      {
        expiresIn,
      }
    );

    return [token, result];
  }

  async sendEmailVerifyCode(email) {
    const { app } = this;
    const code = generateRandom(1000, 9999).toString();
    try {
      await app.sendMail({
        from: '"协同编辑" <1852067571@qq.com>',
        to: email,
        subject: "协同编辑登录验证码",
        html: `
        <p>亲爱的用户，您好！</p>
        <p>您的绑定验证码是：<h2>${code}</h2></p>
        <p>感谢您的访问，祝您使用愉快！</p>
        `,
      });
      return [code, email];
    } catch (error) {
      console.log(error);
      return [null, email];
    }
  }

  async update(where, newData) {
    const { app } = this;

    let result = await app.mysql.get("users", {
      account: where.account,
    });

    if (result) {
      await app.mysql.update("users", newData, { where });
    } else {
      await app.mysql.insert("users", { ...newData, id: uuidv4() });
    }

    return await app.mysql.get("users", {
      account: where.account,
    });
  }

  async show(id) {
    const { app } = this;

    const results = await app.mysql.get("users", {
      id,
    });

    return results;
  }

  async index() {
    const { ctx } = this;

    const result = await ctx.model.User.find({});

    return result;
  }
}

export default UserService;
