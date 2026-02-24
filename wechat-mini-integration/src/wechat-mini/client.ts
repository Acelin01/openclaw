import crypto from "node:crypto";
import { WeChatConfig } from "./types.js";

/**
 * 微信API客户端
 * 封装微信小程序API调用
 */
export class WeChatClient {
  private config: WeChatConfig;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(config: WeChatConfig) {
    this.config = config;
  }

  /**
   * 获取Access Token
   */
  async getAccessToken(): Promise<string> {
    // 如果token有效且未过期，直接返回
    const cached = this.accessToken;
    if (cached && Date.now() < this.tokenExpiresAt) {
      return cached;
    }

    try {
      const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.config.appId}&secret=${this.config.appSecret}`;
      const response = await fetch(url);
      const data = (await response.json()) as {
        access_token?: string;
        expires_in?: number;
        errcode?: number;
        errmsg?: string;
      };

      if (data.errcode) {
        throw new Error(`获取Access Token失败: ${data.errmsg}`);
      }
      if (!data.access_token || typeof data.expires_in !== "number") {
        throw new Error("获取Access Token失败: response missing access_token/expires_in");
      }

      this.accessToken = data.access_token;
      // 提前5分钟过期，避免边缘情况
      this.tokenExpiresAt = Date.now() + (data.expires_in - 300) * 1000;

      return this.accessToken;
    } catch (error) {
      console.error("获取微信Access Token失败:", error);
      throw error;
    }
  }

  /**
   * 发送客服消息
   */
  async sendCustomerMessage(toUser: string, content: string): Promise<void> {
    try {
      const token = await this.getAccessToken();
      const url = `https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=${token}`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          touser: toUser,
          msgtype: "text",
          text: { content },
        }),
      });
      const data = (await response.json()) as { errcode?: number; errmsg?: string };

      if (data.errcode && data.errcode !== 0) {
        throw new Error(`发送客服消息失败: ${data.errmsg}`);
      }

      console.log(`消息发送成功: ${toUser} -> ${content.substring(0, 50)}...`);
    } catch (error) {
      console.error("发送客服消息失败:", error);
      throw error;
    }
  }

  /**
   * 验证消息签名
   */
  verifySignature(signature: string, timestamp: string, nonce: string): boolean {
    const { token } = this.config;
    const arr = [token, timestamp, nonce];
    if (arr[0] > arr[1]) {
      [arr[0], arr[1]] = [arr[1], arr[0]];
    }
    if (arr[1] > arr[2]) {
      [arr[1], arr[2]] = [arr[2], arr[1]];
    }
    if (arr[0] > arr[1]) {
      [arr[0], arr[1]] = [arr[1], arr[0]];
    }
    const str = arr.join("");

    // 这里应该使用SHA1加密，简化示例
    const sha1 = crypto.createHash("sha1");
    sha1.update(str);
    const calculated = sha1.digest("hex");

    return calculated === signature;
  }

  /**
   * 获取用户信息（可选）
   */
  async getUserInfo(openid: string): Promise<unknown> {
    try {
      const token = await this.getAccessToken();
      const url = `https://api.weixin.qq.com/cgi-bin/user/info?access_token=${token}&openid=${openid}&lang=zh_CN`;
      const response = await fetch(url);
      const data = (await response.json()) as { errcode?: number; errmsg?: string };

      if (data.errcode && data.errcode !== 0) {
        throw new Error(`获取用户信息失败: ${data.errmsg}`);
      }

      return data;
    } catch (error) {
      console.error("获取用户信息失败:", error);
      throw error;
    }
  }
}
