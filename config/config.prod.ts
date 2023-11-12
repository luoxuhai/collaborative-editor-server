import { EggAppConfig, PowerPartial } from "egg";

export default () => {
  const config: PowerPartial<EggAppConfig> = {};

  config.cluster = {
    listen: {
      port: 4321,
      hostname: "127.0.0.1",
    },
  };

  return config;
};
