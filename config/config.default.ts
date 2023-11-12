import { EggAppConfig, EggAppInfo, PowerPartial } from "egg";
import * as path from "path";

export default (appInfo: EggAppInfo) => {
  const config = {} as PowerPartial<EggAppConfig>;

  // MySQL数据库配置
  config.mysql = {
    client: {
      host: "47.101.33.94",
      port: "3306",
      user: "collaborative",
      password: "NbkYZKcGpC27shJn",
      database: "collaborative",
    },
    app: true,
    agent: false,
  };

  // MongoDB数据库配置
  config.mongoose = {
    client: {
      url: "mongodb://47.101.33.94:27017/collaborative",
      options: {
        user: "lxh",
        pass: "123456",
        useNewUrlParser: true,
        useCreateIndex: true,
        autoIndex: true,
        useUnifiedTopology: true,
      },
    },
  };

  // Redis数据库配置
  config.redis = {
    client: {
      port: 6379,
      host: "47.101.33.94",
      password: undefined,
      db: 6,
    },
  };

  // override config from framework / plugin
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + "_1609724551144_3342";

  // add your egg config in here
  config.middleware = ["errorHandler"];

  config.cors = {
    origin: "*",
    credentials: false,
  };

  config.cluster = {
    listen: {
      port: 8080,
      hostname: "127.0.0.1",
    },
  };

  config.security = {
    csrf: {
      enable: false,
    },
  };

  config.doc = {
    collectionName: "docs",
  };

  config.multipart = {
    fileSize: "1mb",
    whitelist: [".jpg", ".jpeg", ".gif", ".png", ".bmp"],
  };

  config.io = {
    namespace: {
      "/message": {
        connectionMiddleware: [],
        packetMiddleware: [],
      },
    },
  };

  config.jwt = {
    secret: "_1558183894077_5026",
  };

  config.fileUrl = "https://ito.oss-cn-beijing.aliyuncs.com";

  config.oss = {
    client: {
      endpoint: "oss-cn-beijing.aliyuncs.com",
      accessKeyId: "LTAI0J1A8gjejrZi",
      accessKeySecret: "rwE4wb5r6yz6ASzTQXGwvAEQsi2oOr",
      region: "oss-cn-beijing",
      bucket: "ito",
      secure: true,
      timeout: "60s",
    },
  };

  config.static = {
    // 静态化访问前缀,如：`http://127.0.0.1:7001/static/images/logo.png`
    prefix: "/static",
    // 静态化目录,可以设置多个静态化目录
    dir: path.join(appInfo.baseDir, "app/public"),
    maxAge: 1000 * 60 * 60 * 24 * 30,
  };

  config.smtp = {
    host: "smtp.qq.com",
    secure: true,
    port: 465,
    auth: {
      user: "1852067571@qq.com",
      pass: "abdphkfmvoctbbhh",
    },
  };

  // add your special config in here
  const bizConfig = {
    sourceUrl: `https://github.com/eggjs/examples/tree/master/${appInfo.name}`,
  };

  // the return config will combines to EggAppConfig
  return {
    ...config,
    ...bizConfig,
  };
};
