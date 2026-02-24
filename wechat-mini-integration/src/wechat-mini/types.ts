/**
 * 微信小程序配置
 */
export interface WeChatConfig {
  /** 小程序AppID */
  appId: string;
  /** 小程序AppSecret */
  appSecret: string;
  /** 消息校验Token */
  token: string;
  /** 消息加密Key */
  encodingAESKey?: string;
  /** Webhook服务器端口 */
  port?: number;
  /** 是否启用消息加密 */
  encryptMessage?: boolean;
}

/**
 * 微信消息类型
 */
export interface WeChatMessage {
  /** 发送者OpenID */
  FromUserName: string;
  /** 接收者OpenID（公众号） */
  ToUserName: string;
  /** 消息创建时间 */
  CreateTime: number;
  /** 消息类型 */
  MsgType: string;
  /** 消息内容 */
  Content?: string;
  /** 消息ID */
  MsgId?: string;
  /** 事件类型（如果是事件消息） */
  Event?: string;
  /** 事件KEY值 */
  EventKey?: string;
}

/**
 * 微信Webhook请求
 */
export interface WeChatWebhookRequest {
  /** 微信加密签名 */
  signature: string;
  /** 时间戳 */
  timestamp: string;
  /** 随机数 */
  nonce: string;
  /** 加密类型 */
  encrypt_type?: string;
  /** 消息签名 */
  msg_signature?: string;
  /** 消息体 */
  body: WeChatMessage;
}

/**
 * OpenClaw Activity格式
 */
export interface OpenClawActivity {
  /** 活动类型 */
  type: "message";
  /** 发送者 */
  from: {
    id: string;
    name?: string;
    type: "user" | "bot";
  };
  /** 接收者 */
  to: {
    id: string;
    name?: string;
    type: "channel" | "user";
  };
  /** 消息内容 */
  text: string;
  /** 时间戳 */
  timestamp: number;
  /** 渠道信息 */
  channel: {
    type: "wechat-mini";
    platform: "wechat";
    threadId?: string;
  };
  /** 元数据 */
  metadata?: Record<string, unknown>;
}

/**
 * 标准化配置
 */
export interface NormalizeConfig {
  /** 渠道类型 */
  channelType: string;
  /** 平台 */
  platform: string;
  /** 是否启用 */
  enabled: boolean;
}
