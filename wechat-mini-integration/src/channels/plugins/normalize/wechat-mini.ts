import { WeChatMessage, OpenClawActivity } from "../../../wechat-mini/types.js";

/**
 * 标准化微信消息为OpenClaw Activity格式
 * 参考OpenClaw的feishu插件实现
 */
export function normalizeWeChatMessage(wechatMsg: WeChatMessage): OpenClawActivity | null {
  try {
    // 只处理文本消息
    if (wechatMsg.MsgType !== "text" || !wechatMsg.Content) {
      console.log(`跳过非文本消息: ${wechatMsg.MsgType}`);
      return null;
    }

    // 提取消息信息
    const fromUser = wechatMsg.FromUserName; // 用户OpenID
    const toUser = wechatMsg.ToUserName; // 公众号OpenID
    const content = wechatMsg.Content;
    const timestamp = wechatMsg.CreateTime * 1000; // 转换为毫秒

    // 构建OpenClaw Activity
    const activity: OpenClawActivity = {
      type: "message",
      from: {
        id: fromUser,
        type: "user",
        name: `wechat_user_${fromUser.substring(0, 8)}`, // 简化显示
      },
      to: {
        id: toUser,
        type: "channel",
        name: "wechat-mini-program",
      },
      text: content,
      timestamp,
      channel: {
        type: "wechat-mini",
        platform: "wechat",
        threadId: fromUser, // 使用OpenID作为threadId
      },
      metadata: {
        wechatMsgId: wechatMsg.MsgId,
        wechatMsgType: wechatMsg.MsgType,
        original: wechatMsg,
      },
    };

    console.log(`标准化微信消息成功: ${fromUser} -> ${content.substring(0, 50)}...`);
    return activity;
  } catch (error) {
    console.error("标准化微信消息失败:", error);
    return null;
  }
}

/**
 * 批量标准化消息
 */
export function normalizeWeChatMessages(messages: WeChatMessage[]): OpenClawActivity[] {
  const activities: OpenClawActivity[] = [];

  for (const msg of messages) {
    const activity = normalizeWeChatMessage(msg);
    if (activity) {
      activities.push(activity);
    }
  }

  return activities;
}

/**
 * 验证微信消息格式
 */
export function validateWeChatMessage(msg: unknown): boolean {
  if (!msg || typeof msg !== "object") {
    return false;
  }
  const candidate = msg as Record<string, unknown>;
  return (
    typeof candidate.FromUserName === "string" &&
    typeof candidate.ToUserName === "string" &&
    typeof candidate.CreateTime === "number" &&
    typeof candidate.MsgType === "string"
  );
}

/**
 * 提取消息中的用户信息
 */
export function extractUserInfo(msg: WeChatMessage): {
  openId: string;
  isUser: boolean;
} {
  return {
    openId: msg.FromUserName,
    isUser: !msg.FromUserName.startsWith("gh_"), // 简单判断是否为用户
  };
}

// 导出默认函数
export default normalizeWeChatMessage;
