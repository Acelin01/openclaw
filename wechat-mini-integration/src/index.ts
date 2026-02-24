/**
 * 微信小程序对接OpenClaw - 主入口文件
 *
 * 提供完整的集成接口，包括：
 * 1. Webhook服务器启动
 * 2. 消息处理管道
 * 3. OpenClaw集成
 * 4. 配置管理
 */

import { createWeChatOutboundAdapter } from "./channels/plugins/outbound/wechat-mini.js";
import { WeChatMiniConfig, validateWeChatMiniConfig } from "./config/zod-schema.providers-core.js";
import { createMessageSender } from "./wechat-mini/send.js";
import { WeChatWebhookServer, startWeChatWebhook } from "./wechat-mini/server.js";
import { WeChatConfig } from "./wechat-mini/types.js";

/**
 * 微信小程序集成管理器
 */
export class WeChatMiniIntegration {
  private server: WeChatWebhookServer | null = null;
  private config: WeChatMiniConfig;
  private isRunning = false;

  constructor(config: Partial<WeChatMiniConfig> = {}) {
    this.config = validateWeChatMiniConfig(config);
  }

  /**
   * 启动集成
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn("集成已经在运行中");
      return;
    }

    try {
      console.log("启动微信小程序集成...");

      // 提取基础配置
      const wechatConfig: WeChatConfig = {
        appId: this.config.config.appId,
        appSecret: this.config.config.appSecret,
        token: this.config.config.token,
        encodingAESKey: this.config.config.encodingAESKey,
        port: this.config.config.port,
        encryptMessage: this.config.config.encryptMessage,
      };

      // 启动Webhook服务器
      this.server = startWeChatWebhook(wechatConfig);
      this.isRunning = true;

      console.log("微信小程序集成启动成功");
      console.log(
        `Webhook URL: http://localhost:${wechatConfig.port}${this.config.config.webhookPath}`,
      );

      // 显示配置摘要
      this.logConfigSummary();
    } catch (error) {
      console.error("启动微信小程序集成失败:", error);
      throw error;
    }
  }

  /**
   * 停止集成
   */
  async stop(): Promise<void> {
    if (!this.isRunning || !this.server) {
      console.warn("集成未运行");
      return;
    }

    try {
      console.log("停止微信小程序集成...");
      this.server.stop();
      this.server = null;
      this.isRunning = false;
      console.log("微信小程序集成已停止");
    } catch (error) {
      console.error("停止微信小程序集成失败:", error);
      throw error;
    }
  }

  /**
   * 获取消息发送器
   */
  getMessageSender() {
    const wechatConfig: WeChatConfig = {
      appId: this.config.config.appId,
      appSecret: this.config.config.appSecret,
      token: this.config.config.token,
    };

    return createMessageSender(wechatConfig);
  }

  /**
   * 获取出站适配器
   */
  getOutboundAdapter() {
    const wechatConfig: WeChatConfig = {
      appId: this.config.config.appId,
      appSecret: this.config.config.appSecret,
      token: this.config.config.token,
    };

    return createWeChatOutboundAdapter(wechatConfig);
  }

  /**
   * 获取当前配置
   */
  getConfig(): WeChatMiniConfig {
    return { ...this.config };
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<WeChatMiniConfig>): void {
    const oldConfig = this.config;
    this.config = validateWeChatMiniConfig({
      ...oldConfig,
      ...newConfig,
    });

    console.log("配置已更新");

    // 如果服务器正在运行且端口有变化，需要重启
    if (this.isRunning && oldConfig.config.port !== this.config.config.port) {
      console.log("检测到端口变化，需要重启服务器");
      void this.restart();
    }
  }

  /**
   * 重启集成
   */
  async restart(): Promise<void> {
    console.log("重启微信小程序集成...");
    await this.stop();
    await this.start();
  }

  /**
   * 检查运行状态
   */
  getStatus(): {
    isRunning: boolean;
    config: WeChatMiniConfig;
    serverInfo?: {
      port: number;
      webhookPath: string;
    };
  } {
    return {
      isRunning: this.isRunning,
      config: this.config,
      serverInfo: this.isRunning
        ? {
            port: this.config.config.port,
            webhookPath: this.config.config.webhookPath,
          }
        : undefined,
    };
  }

  /**
   * 测试集成
   */
  async testIntegration(testOpenId?: string): Promise<boolean> {
    try {
      console.log("开始测试集成...");

      // 测试消息发送
      const sender = this.getMessageSender();
      await sender.testSend(testOpenId);

      // 测试出站适配器
      const adapter = this.getOutboundAdapter();
      const adapterResult = await adapter.testAdapter(testOpenId);

      console.log(`集成测试完成: ${adapterResult ? "成功" : "部分失败"}`);
      return adapterResult;
    } catch (error) {
      console.error("集成测试失败:", error);
      return false;
    }
  }

  /**
   * 记录配置摘要
   */
  private logConfigSummary(): void {
    const { config, messageHandling, security, integration } = this.config;

    console.log("\n=== 配置摘要 ===");
    console.log(`应用ID: ${config.appId ? "已设置" : "未设置"}`);
    console.log(`服务器端口: ${config.port}`);
    console.log(`Webhook路径: ${config.webhookPath}`);
    console.log(`消息加密: ${config.encryptMessage ? "启用" : "禁用"}`);
    console.log(`最大消息长度: ${messageHandling.maxMessageLength}字符`);
    console.log(`签名验证: ${security.verifySignature ? "启用" : "禁用"}`);
    console.log(`HTTPS要求: ${security.requireHttps ? "是" : "否"}`);
    console.log(`自动分发: ${(integration.openclaw?.autoDispatch ?? false) ? "启用" : "禁用"}`);
    console.log("================\n");
  }
}

/**
 * 创建集成实例
 */
export function createWeChatMiniIntegration(
  config: Partial<WeChatMiniConfig> = {},
): WeChatMiniIntegration {
  return new WeChatMiniIntegration(config);
}

/**
 * 快速启动函数
 */
export async function quickStart(
  config: Partial<WeChatMiniConfig> = {},
): Promise<WeChatMiniIntegration> {
  const integration = createWeChatMiniIntegration(config);
  await integration.start();
  return integration;
}

// 导出所有类型和函数
export * from "./wechat-mini/types.js";
export * from "./wechat-mini/client.js";
export * from "./wechat-mini/server.js";
export * from "./wechat-mini/send.js";
export * from "./channels/plugins/normalize/wechat-mini.js";
export * from "./channels/plugins/outbound/wechat-mini.js";
export * from "./config/zod-schema.providers-core.js";

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("微信小程序对接OpenClaw - 独立运行模式");

  // 从环境变量读取配置
  const config: Partial<WeChatMiniConfig> = {
    config: {
      appId: process.env.WECHAT_APP_ID || "",
      appSecret: process.env.WECHAT_APP_SECRET || "",
      token: process.env.WECHAT_TOKEN || "default_token",
      port: parseInt(process.env.PORT || "3000"),
      encryptMessage: false,
      webhookPath: "/wechat/webhook",
      retry: {},
      logging: {},
    },
  };

  if (!config.config?.appId || !config.config?.appSecret) {
    console.error("错误: 请设置WECHAT_APP_ID和WECHAT_APP_SECRET环境变量");
    console.error("示例:");
    console.error("  export WECHAT_APP_ID=your_app_id");
    console.error("  export WECHAT_APP_SECRET=your_app_secret");
    console.error("  export WECHAT_TOKEN=your_token");
    console.error("  export PORT=3000");
    process.exit(1);
  }

  const integration = createWeChatMiniIntegration(config);
  integration.start().catch(console.error);
}
