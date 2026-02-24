import { WeChatClient } from "../../../wechat-mini/client.js";
import { WeChatConfig, OpenClawActivity } from "../../../wechat-mini/types.js";

/**
 * 微信小程序出站消息适配器
 * 将OpenClaw Activity转换为微信客服消息并发送
 */
export class WeChatOutboundAdapter {
  private client: WeChatClient;

  constructor(config: WeChatConfig) {
    this.client = new WeChatClient(config);
  }

  /**
   * 处理出站Activity
   */
  async handleActivity(activity: OpenClawActivity): Promise<boolean> {
    try {
      // 验证Activity格式
      if (!this.validateActivity(activity)) {
        console.error("无效的Activity格式:", activity);
        return false;
      }

      // 提取接收者OpenID
      const toUser = this.extractRecipient(activity);
      if (!toUser) {
        console.error("无法提取接收者:", activity);
        return false;
      }

      // 提取消息内容
      const content = this.extractContent(activity);
      if (!content) {
        console.error("无法提取消息内容:", activity);
        return false;
      }

      // 发送微信客服消息
      await this.client.sendCustomerMessage(toUser, content);

      console.log(`出站消息发送成功: ${toUser} -> ${content.substring(0, 50)}...`);
      return true;
    } catch (error) {
      console.error("处理出站Activity失败:", error);
      return false;
    }
  }

  /**
   * 验证Activity格式
   */
  private validateActivity(activity: OpenClawActivity): boolean {
    return (
      activity &&
      activity.type === "message" &&
      activity.from &&
      activity.to &&
      typeof activity.text === "string" &&
      activity.channel?.type === "wechat-mini"
    );
  }

  /**
   * 提取接收者OpenID
   */
  private extractRecipient(activity: OpenClawActivity): string | null {
    // 优先从to.id提取
    if (activity.to?.id) {
      return activity.to.id;
    }

    // 从channel.threadId提取
    if (activity.channel?.threadId) {
      return activity.channel.threadId;
    }

    // 从metadata中提取
    const metadata = activity.metadata;
    if (metadata && typeof metadata.wechatOpenId === "string") {
      return metadata.wechatOpenId;
    }

    return null;
  }

  /**
   * 提取消息内容
   */
  private extractContent(activity: OpenClawActivity): string {
    // 直接使用text字段
    if (activity.text) {
      return activity.text;
    }

    // 从metadata中提取
    const metadata = activity.metadata;
    if (metadata && typeof metadata.content === "string") {
      return metadata.content;
    }

    // 默认返回
    return "收到一条消息";
  }

  /**
   * 批量处理出站消息
   */
  async handleBatchActivities(activities: OpenClawActivity[]): Promise<{
    success: number;
    failed: number;
    results: Array<{ activity: OpenClawActivity; success: boolean; error?: string }>;
  }> {
    const results = [];

    for (const activity of activities) {
      try {
        const success = await this.handleActivity(activity);
        results.push({ activity, success, error: success ? undefined : "处理失败" });
      } catch (error) {
        results.push({
          activity,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failedCount = results.length - successCount;

    return {
      success: successCount,
      failed: failedCount,
      results,
    };
  }

  /**
   * 测试适配器
   */
  async testAdapter(testOpenId?: string): Promise<boolean> {
    const testActivity: OpenClawActivity = {
      type: "message",
      from: {
        id: "system",
        type: "bot",
        name: "Test Bot",
      },
      to: {
        id: testOpenId || "test_openid",
        type: "user",
        name: "Test User",
      },
      text: `测试出站消息 - ${new Date().toLocaleString()}`,
      timestamp: Date.now(),
      channel: {
        type: "wechat-mini",
        platform: "wechat",
        threadId: testOpenId || "test_openid",
      },
      metadata: {
        test: true,
      },
    };

    try {
      console.log("开始测试出站适配器...");
      const result = await this.handleActivity(testActivity);
      console.log(`测试结果: ${result ? "成功" : "失败"}`);
      return result;
    } catch (error) {
      console.error("测试出站适配器失败:", error);
      return false;
    }
  }
}

/**
 * 创建出站适配器实例
 */
export function createWeChatOutboundAdapter(config: WeChatConfig): WeChatOutboundAdapter {
  return new WeChatOutboundAdapter(config);
}

// 导出默认函数
export default createWeChatOutboundAdapter;
