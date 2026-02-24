import { WeChatClient } from "./client.js";
import { WeChatConfig } from "./types.js";

/**
 * 消息发送管理器
 */
export class MessageSender {
  private client: WeChatClient;

  constructor(config: WeChatConfig) {
    this.client = new WeChatClient(config);
  }

  /**
   * 发送文本消息
   */
  async sendTextMessage(toUser: string, content: string): Promise<void> {
    try {
      await this.client.sendCustomerMessage(toUser, content);
    } catch (error) {
      console.error("发送文本消息失败:", error);
      throw error;
    }
  }

  /**
   * 批量发送消息
   */
  async sendBatchMessages(messages: Array<{ toUser: string; content: string }>): Promise<void> {
    const results = [];

    for (const message of messages) {
      try {
        await this.sendTextMessage(message.toUser, message.content);
        results.push({ ...message, success: true });
      } catch (error) {
        results.push({
          ...message,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // 记录发送结果
    const successCount = results.filter((r) => r.success).length;
    const failCount = results.length - successCount;

    console.log(`批量发送完成: 成功 ${successCount} 条, 失败 ${failCount} 条`);

    if (failCount > 0) {
      console.warn(
        "失败的消息:",
        results.filter((r) => !r.success),
      );
    }
  }

  /**
   * 处理OpenClaw出站消息
   */
  async handleOutboundMessage(activity: unknown): Promise<void> {
    try {
      if (!activity || typeof activity !== "object") {
        throw new Error("Invalid activity format");
      }
      const candidate = activity as Record<string, unknown>;
      const to = candidate.to;
      const text = candidate.text;

      if (
        !to ||
        typeof to !== "object" ||
        !text ||
        typeof text !== "string" ||
        !(to as Record<string, unknown>).id ||
        typeof (to as Record<string, unknown>).id !== "string"
      ) {
        throw new Error("Invalid activity format");
      }

      // 假设to.id是微信OpenID
      const openId = (to as Record<string, unknown>).id as string;

      await this.sendTextMessage(openId, text);

      console.log(`成功处理出站消息: ${openId} -> ${text.substring(0, 50)}...`);
    } catch (error) {
      console.error("处理出站消息失败:", error);
      throw error;
    }
  }

  /**
   * 测试消息发送
   */
  async testSend(testOpenId?: string): Promise<void> {
    const testId = testOpenId || "test_openid";
    const testContent = `测试消息 - ${new Date().toLocaleString()}`;

    try {
      console.log("开始测试消息发送...");
      await this.sendTextMessage(testId, testContent);
      console.log("测试消息发送成功");
    } catch (error) {
      console.error("测试消息发送失败:", error);
      throw error;
    }
  }
}

/**
 * 创建消息发送器
 */
export function createMessageSender(config: WeChatConfig): MessageSender {
  return new MessageSender(config);
}

// 导出默认实例创建函数
export default createMessageSender;
