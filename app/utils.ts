export function generateRandom(start, end) {
  const length = end - start;
  const num = parseInt(String(Math.random() * length));
  return num;
}

export async function getUnionid(app, access_token) {
  const { data } = await app.axios.get("https://graph.qq.com/oauth2.0/me", {
    params: {
      access_token,
      unionid: 1,
    },
  });

  return JSON.parse(data.replace(/callback\(|\)|;/g, ""));
}

export async function getUserInfo(app, access_token, openid) {
  const { data } = await app.axios.get(
    "https://graph.qq.com/user/get_user_info",
    {
      params: {
        access_token,
        oauth_consumer_key: "101854393",
        openid,
      },
    }
  );

  return data;
}
