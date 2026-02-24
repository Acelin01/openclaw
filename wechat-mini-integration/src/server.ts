import { startWeChatWebhook } from "./wechat-mini/server.js";
import { WeChatConfig } from "./wechat-mini/types.js";

const config: WeChatConfig = {
  appId: process.env.WECHAT_APP_ID || "your_app_id",
  appSecret: process.env.WECHAT_APP_SECRET || "your_app_secret",
  token: process.env.WECHAT_TOKEN || "your_token",
  port: parseInt(process.env.PORT || "3000", 10),
  encodingAESKey: process.env.WECHAT_AES_KEY,
  encryptMessage: process.env.WECHAT_ENCRYPT === "true",
};

startWeChatWebhook(config);
