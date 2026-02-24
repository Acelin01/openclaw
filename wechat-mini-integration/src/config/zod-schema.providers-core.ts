import { z } from "zod";

/**
 * 微信小程序配置Schema
 * 参考OpenClaw的配置系统设计
 */
export const wechatMiniConfigSchema = z.object({
  /** 渠道类型 */
  type: z.literal("wechat-mini"),

  /** 渠道名称 */
  name: z.string().min(1).default("微信小程序"),

  /** 是否启用 */
  enabled: z.boolean().default(true),

  /** 微信小程序配置 */
  config: z.object({
    /** 小程序AppID */
    appId: z.string().min(1).describe("微信小程序AppID"),

    /** 小程序AppSecret */
    appSecret: z.string().min(1).describe("微信小程序AppSecret"),

    /** 消息校验Token */
    token: z.string().min(1).describe("消息校验Token"),

    /** 消息加密Key（可选） */
    encodingAESKey: z.string().optional().describe("消息加密Key"),

    /** Webhook服务器端口 */
    port: z.number().int().min(1).max(65535).default(3000),

    /** 是否启用消息加密 */
    encryptMessage: z.boolean().default(false),

    /** Webhook URL路径 */
    webhookPath: z.string().default("/wechat/webhook"),

    /** 重试配置 */
    retry: z
      .object({
        /** 最大重试次数 */
        maxAttempts: z.number().int().min(0).default(3),

        /** 重试延迟（毫秒） */
        delayMs: z.number().int().min(0).default(1000),

        /** 退避因子 */
        backoffFactor: z.number().min(1).default(2),
      })
      .partial()
      .default({}),

    /** 日志配置 */
    logging: z
      .object({
        /** 是否启用详细日志 */
        verbose: z.boolean().default(false),

        /** 是否记录消息内容 */
        logMessages: z.boolean().default(true),

        /** 是否记录错误 */
        logErrors: z.boolean().default(true),
      })
      .partial()
      .default({}),
  }),

  /** 消息处理配置 */
  messageHandling: z
    .object({
      /** 最大消息长度 */
      maxMessageLength: z.number().int().min(1).max(2048).default(1024),

      /** 是否截断超长消息 */
      truncateLongMessages: z.boolean().default(true),

      /** 消息处理超时（毫秒） */
      timeoutMs: z.number().int().min(1000).default(10000),

      /** 支持的Message类型 */
      supportedMsgTypes: z.array(z.string()).default(["text"]),

      /** 是否自动回复 */
      autoReply: z.boolean().default(false),

      /** 自动回复消息 */
      autoReplyMessage: z.string().default("消息已收到，正在处理中..."),
    })
    .partial()
    .default({}),

  /** 安全配置 */
  security: z
    .object({
      /** 是否验证签名 */
      verifySignature: z.boolean().default(true),

      /** 允许的IP地址（白名单） */
      allowedIps: z.array(z.string().min(1)).default([]),

      /** 请求频率限制 */
      rateLimit: z
        .object({
          /** 时间窗口（秒） */
          windowSeconds: z.number().int().min(1).default(60),

          /** 最大请求数 */
          maxRequests: z.number().int().min(1).default(100),
        })
        .partial()
        .default({}),

      /** 是否启用HTTPS */
      requireHttps: z.boolean().default(true),

      /** SSL证书配置 */
      ssl: z
        .object({
          certPath: z.string().optional(),
          keyPath: z.string().optional(),
        })
        .optional(),
    })
    .partial()
    .default({}),

  /** 集成配置 */
  integration: z
    .object({
      /** OpenClaw Runtime集成 */
      openclaw: z
        .object({
          /** 是否自动分发消息 */
          autoDispatch: z.boolean().default(true),

          /** 分发超时（毫秒） */
          dispatchTimeoutMs: z.number().int().min(1000).default(5000),

          /** 是否等待回复 */
          waitForReply: z.boolean().default(false),

          /** 回复超时（毫秒） */
          replyTimeoutMs: z.number().int().min(1000).max(30000).default(10000),
        })
        .partial()
        .default({}),

      /** 数据库集成 */
      database: z
        .object({
          /** 是否保存消息历史 */
          saveHistory: z.boolean().default(false),

          /** 历史记录保留天数 */
          retentionDays: z.number().int().min(1).default(30),
        })
        .optional(),
    })
    .partial()
    .default({}),
});

/**
 * 微信小程序配置类型
 */
export type WeChatMiniConfig = z.infer<typeof wechatMiniConfigSchema>;

/**
 * 默认配置
 */
export const defaultWeChatMiniConfig: WeChatMiniConfig = {
  type: "wechat-mini",
  name: "微信小程序",
  enabled: true,
  config: {
    appId: "",
    appSecret: "",
    token: "",
    port: 3000,
    encryptMessage: false,
    webhookPath: "/wechat/webhook",
    retry: {
      maxAttempts: 3,
      delayMs: 1000,
      backoffFactor: 2,
    },
    logging: {
      verbose: false,
      logMessages: true,
      logErrors: true,
    },
  },
  messageHandling: {
    maxMessageLength: 1024,
    truncateLongMessages: true,
    timeoutMs: 10000,
    supportedMsgTypes: ["text"],
    autoReply: false,
    autoReplyMessage: "消息已收到，正在处理中...",
  },
  security: {
    verifySignature: true,
    allowedIps: [],
    rateLimit: {
      windowSeconds: 60,
      maxRequests: 100,
    },
    requireHttps: true,
  },
  integration: {
    openclaw: {
      autoDispatch: true,
      dispatchTimeoutMs: 5000,
      waitForReply: false,
      replyTimeoutMs: 10000,
    },
  },
};

/**
 * 验证配置
 */
export function validateWeChatMiniConfig(config: unknown): WeChatMiniConfig {
  try {
    return wechatMiniConfigSchema.parse(config);
  } catch (error) {
    console.error("微信小程序配置验证失败:", error);
    throw error;
  }
}

/**
 * 合并配置
 */
export function mergeWeChatMiniConfig(
  base: Partial<WeChatMiniConfig>,
  overrides: Partial<WeChatMiniConfig>,
): WeChatMiniConfig {
  return {
    ...defaultWeChatMiniConfig,
    ...base,
    ...overrides,
    config: {
      ...defaultWeChatMiniConfig.config,
      ...base.config,
      ...overrides.config,
    },
    messageHandling: {
      ...defaultWeChatMiniConfig.messageHandling,
      ...base.messageHandling,
      ...overrides.messageHandling,
    },
    security: {
      ...defaultWeChatMiniConfig.security,
      ...base.security,
      ...overrides.security,
    },
    integration: {
      ...defaultWeChatMiniConfig.integration,
      ...base.integration,
      ...overrides.integration,
    },
  };
}

/**
 * 生成示例配置
 */
export function generateExampleConfig(): WeChatMiniConfig {
  return {
    ...defaultWeChatMiniConfig,
    config: {
      ...defaultWeChatMiniConfig.config,
      appId: "wx1234567890abcdef",
      appSecret: "your_app_secret_here",
      token: "your_token_here",
    },
  };
}
