import { ChatMessage, ConversationContext } from "./types";

export class ConversationManager {
  private conversations: Map<string, ConversationContext>;
  private maxHistorySize: number;

  constructor(maxHistorySize: number = 100) {
    this.conversations = new Map();
    this.maxHistorySize = maxHistorySize;
  }

  getContext(userId: string): ConversationContext {
    if (!this.conversations.has(userId)) {
      this.conversations.set(userId, {
        userId,
        messages: [],
        metadata: {
          createdAt: new Date(),
          lastActivity: new Date(),
          conversationCount: 0,
        },
      });
    }

    const context = this.conversations.get(userId)!;
    context.metadata.lastActivity = new Date();

    return context;
  }

  addMessage(userId: string, message: ChatMessage): void {
    const context = this.getContext(userId);

    // 添加消息到历史记录
    context.messages.push(message);

    // 限制历史记录大小
    if (context.messages.length > this.maxHistorySize) {
      context.messages = context.messages.slice(-this.maxHistorySize);
    }

    // 更新对话计数
    context.metadata.conversationCount = context.messages.length;
    context.metadata.lastActivity = new Date();
  }

  getHistory(userId: string, limit: number = 50): ChatMessage[] {
    const context = this.getContext(userId);
    return context.messages.slice(-limit);
  }

  getLastMessage(userId: string): ChatMessage | null {
    const context = this.getContext(userId);
    return context.messages.length > 0 ? context.messages[context.messages.length - 1] : null;
  }

  getLastUserMessage(userId: string): ChatMessage | null {
    const context = this.getContext(userId);
    return (
      context.messages
        .slice()
        .reverse()
        .find((msg) => msg.role === "user") || null
    );
  }

  getLastAssistantMessage(userId: string): ChatMessage | null {
    const context = this.getContext(userId);
    return (
      context.messages
        .slice()
        .reverse()
        .find((msg) => msg.role === "assistant") || null
    );
  }

  clearConversation(userId: string): void {
    this.conversations.set(userId, {
      userId,
      messages: [],
      metadata: {
        createdAt: new Date(),
        lastActivity: new Date(),
        conversationCount: 0,
      },
    });
  }

  getConversationSummary(userId: string): string {
    const context = this.getContext(userId);
    const userMessages = context.messages.filter((msg) => msg.role === "user");
    const assistantMessages = context.messages.filter((msg) => msg.role === "assistant");

    return (
      `对话统计：\n` +
      `- 用户消息数：${userMessages.length}\n` +
      `- 助手回复数：${assistantMessages.length}\n` +
      `- 总消息数：${context.messages.length}\n` +
      `- 开始时间：${context.metadata.createdAt.toLocaleString()}\n` +
      `- 最后活动：${context.metadata.lastActivity.toLocaleString()}`
    );
  }

  getRecentTopics(userId: string, limit: number = 5): string[] {
    const context = this.getContext(userId);
    const recentMessages = context.messages.slice(-20); // 最近20条消息

    const topics: string[] = [];

    for (const message of recentMessages) {
      if (message.role === "user") {
        // 提取关键词作为话题
        const keywords = this.extractKeywords(message.content);
        topics.push(...keywords);
      }
    }

    // 去重并返回最常见的话题
    const topicCounts = topics.reduce(
      (acc, topic) => {
        acc[topic] = (acc[topic] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(topicCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([topic]) => topic);
  }

  private extractKeywords(text: string): string[] {
    // 简单的关键词提取逻辑
    const keywords = [
      "订单",
      "客户",
      "产品",
      "库存",
      "销售",
      "采购",
      "财务",
      "查询",
      "统计",
      "报表",
      "分析",
      "数据",
      "集成",
      "API",
      "接口",
      "系统",
      "价格",
      "成本",
      "利润",
      "收入",
      "支出",
    ];

    return keywords.filter((keyword) => text.includes(keyword));
  }

  getAllConversations(): Map<string, ConversationContext> {
    return new Map(this.conversations);
  }

  getActiveConversations(timeWindow: number = 30 * 60 * 1000): string[] {
    const now = new Date();
    const activeUserIds: string[] = [];

    for (const [userId, context] of this.conversations) {
      const timeSinceLastActivity = now.getTime() - context.metadata.lastActivity.getTime();
      if (timeSinceLastActivity <= timeWindow) {
        activeUserIds.push(userId);
      }
    }

    return activeUserIds;
  }

  cleanupInactiveConversations(timeWindow: number = 24 * 60 * 60 * 1000): number {
    const now = new Date();
    let removedCount = 0;

    for (const [userId, context] of this.conversations) {
      const timeSinceLastActivity = now.getTime() - context.metadata.lastActivity.getTime();
      if (timeSinceLastActivity > timeWindow) {
        this.conversations.delete(userId);
        removedCount++;
      }
    }

    return removedCount;
  }

  exportConversation(userId: string): string {
    const context = this.getContext(userId);
    const conversationData = {
      userId,
      messages: context.messages,
      metadata: context.metadata,
    };

    return JSON.stringify(conversationData, null, 2);
  }

  importConversation(conversationData: string): void {
    try {
      const data = JSON.parse(conversationData);

      if (data.userId && data.messages && data.metadata) {
        this.conversations.set(data.userId, {
          userId: data.userId,
          messages: data.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
          metadata: {
            ...data.metadata,
            createdAt: new Date(data.metadata.createdAt),
            lastActivity: new Date(data.metadata.lastActivity),
          },
        });
      }
    } catch (error) {
      console.error("Failed to import conversation:", error);
      throw new Error("Invalid conversation data format");
    }
  }
}
