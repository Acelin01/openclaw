import { EventEmitter } from "events";

export interface UserBehavior {
  userId: string;
  sessionId: string;
  pageUrl: string;
  timestamp: number;
  action:
    | "message_sent"
    | "message_received"
    | "widget_opened"
    | "widget_closed"
    | "voice_used"
    | "file_uploaded"
    | "quick_reply_used";
  metadata?: Record<string, any>;
}

export interface ConversationMetrics {
  totalMessages: number;
  userMessages: number;
  botMessages: number;
  averageResponseTime: number;
  conversationDuration: number;
  satisfactionScore?: number;
  resolved: boolean;
}

export interface BusinessInsights {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  peakHours: Array<{ hour: number; users: number }>;
  topPages: Array<{ url: string; visits: number; avgDuration: number }>;
  userRetention: Array<{ day: number; retention: number }>;
  conversionRates: {
    widgetOpen: number;
    messageSent: number;
    conversationCompleted: number;
  };
}

export interface RealTimeAnalytics {
  activeUsers: number;
  activeConversations: number;
  messagesPerMinute: number;
  averageResponseTime: number;
  topIntents: Array<{ intent: string; count: number }>;
  userSatisfaction: number;
}

export interface AnalyticsConfig {
  enabled: boolean;
  retentionDays: number;
  aggregationInterval: number;
  realTimeUpdates: boolean;
}

export class AdvancedAnalytics extends EventEmitter {
  private behaviors: UserBehavior[] = [];
  private conversations: Map<string, ConversationMetrics> = new Map();
  private config: AnalyticsConfig;
  private sessionStartTimes: Map<string, number> = new Map();
  private messageTimestamps: Map<string, number[]> = new Map();

  constructor(
    config: AnalyticsConfig = {
      enabled: true,
      retentionDays: 90,
      aggregationInterval: 300000, // 5 minutes
      realTimeUpdates: true,
    },
  ) {
    super();
    this.config = config;
    this.startAggregationTimer();
  }

  // 记录用户行为
  trackBehavior(behavior: UserBehavior): void {
    if (!this.config.enabled) return;

    this.behaviors.push(behavior);
    this.processBehavior(behavior);

    if (this.config.realTimeUpdates) {
      this.emit("behavior_tracked", behavior);
    }
  }

  // 处理行为数据
  private processBehavior(behavior: UserBehavior): void {
    switch (behavior.action) {
      case "widget_opened":
        this.sessionStartTimes.set(behavior.sessionId, behavior.timestamp);
        break;
      case "widget_closed":
        this.calculateSessionDuration(behavior);
        break;
      case "message_sent":
        this.recordUserMessage(behavior);
        break;
      case "message_received":
        this.recordBotMessage(behavior);
        break;
    }
  }

  // 记录用户消息
  private recordUserMessage(behavior: UserBehavior): void {
    const conversationId = behavior.sessionId;
    const metrics =
      this.conversations.get(conversationId) || this.createNewConversationMetrics(conversationId);

    metrics.userMessages++;
    metrics.totalMessages++;
    this.updateResponseTime(behavior, "user");
    this.conversations.set(conversationId, metrics);
  }

  // 记录机器人消息
  private recordBotMessage(behavior: UserBehavior): void {
    const conversationId = behavior.sessionId;
    const metrics =
      this.conversations.get(conversationId) || this.createNewConversationMetrics(conversationId);

    metrics.botMessages++;
    metrics.totalMessages++;
    this.updateResponseTime(behavior, "bot");
    this.conversations.set(conversationId, metrics);
  }

  // 创建新的会话指标
  private createNewConversationMetrics(conversationId: string): ConversationMetrics {
    return {
      totalMessages: 0,
      userMessages: 0,
      botMessages: 0,
      averageResponseTime: 0,
      conversationDuration: 0,
      resolved: false,
    };
  }

  // 更新响应时间
  private updateResponseTime(behavior: UserBehavior, sender: "user" | "bot"): void {
    const timestamps = this.messageTimestamps.get(behavior.sessionId) || [];
    timestamps.push(behavior.timestamp);
    this.messageTimestamps.set(behavior.sessionId, timestamps);

    if (timestamps.length >= 2) {
      const lastTwoTimestamps = timestamps.slice(-2);
      const responseTime = lastTwoTimestamps[1] - lastTwoTimestamps[0];

      const conversationId = behavior.sessionId;
      const metrics = this.conversations.get(conversationId);
      if (metrics) {
        metrics.averageResponseTime = (metrics.averageResponseTime + responseTime) / 2;
      }
    }
  }

  // 计算会话时长
  private calculateSessionDuration(behavior: UserBehavior): void {
    const startTime = this.sessionStartTimes.get(behavior.sessionId);
    if (startTime) {
      const duration = behavior.timestamp - startTime;
      const conversationId = behavior.sessionId;
      const metrics = this.conversations.get(conversationId);

      if (metrics) {
        metrics.conversationDuration = duration;
      }

      this.sessionStartTimes.delete(behavior.sessionId);
    }
  }

  // 获取实时分析数据
  getRealTimeAnalytics(): RealTimeAnalytics {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    const recentBehaviors = this.behaviors.filter((b) => b.timestamp >= oneMinuteAgo);
    const activeUsers = new Set(recentBehaviors.map((b) => b.userId)).size;
    const activeConversations = new Set(recentBehaviors.map((b) => b.sessionId)).size;

    const messageBehaviors = recentBehaviors.filter(
      (b) => b.action === "message_sent" || b.action === "message_received",
    );

    const responseTimes = this.getRecentResponseTimes(oneMinuteAgo);
    const averageResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 0;

    return {
      activeUsers,
      activeConversations,
      messagesPerMinute: messageBehaviors.length,
      averageResponseTime,
      topIntents: this.getTopIntents(),
      userSatisfaction: this.calculateUserSatisfaction(),
    };
  }

  // 获取最近响应时间
  private getRecentResponseTimes(since: number): number[] {
    const responseTimes: number[] = [];

    this.conversations.forEach((metrics, conversationId) => {
      const timestamps = this.messageTimestamps.get(conversationId) || [];
      const recentTimestamps = timestamps.filter((t) => t >= since);

      for (let i = 1; i < recentTimestamps.length; i++) {
        responseTimes.push(recentTimestamps[i] - recentTimestamps[i - 1]);
      }
    });

    return responseTimes;
  }

  // 获取热门意图
  private getTopIntents(): Array<{ intent: string; count: number }> {
    const intents: Map<string, number> = new Map();

    this.behaviors
      .filter((b) => b.metadata?.intent)
      .forEach((b) => {
        const intent = b.metadata?.intent;
        if (intent) {
          intents.set(intent, (intents.get(intent) || 0) + 1);
        }
      });

    return Array.from(intents.entries())
      .map(([intent, count]) => ({ intent, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  // 计算用户满意度
  private calculateUserSatisfaction(): number {
    const totalConversations = this.conversations.size;
    if (totalConversations === 0) return 0;

    let totalSatisfaction = 0;
    let conversationsWithRating = 0;

    this.conversations.forEach((metrics) => {
      if (metrics.satisfactionScore !== undefined) {
        totalSatisfaction += metrics.satisfactionScore;
        conversationsWithRating++;
      }
    });

    return conversationsWithRating > 0 ? totalSatisfaction / conversationsWithRating : 0;
  }

  // 获取业务洞察
  getBusinessInsights(): BusinessInsights {
    const now = Date.now();
    const dayAgo = now - 86400000;
    const weekAgo = now - 604800000;
    const monthAgo = now - 2592000000;

    return {
      dailyActiveUsers: this.getActiveUsers(dayAgo),
      weeklyActiveUsers: this.getActiveUsers(weekAgo),
      monthlyActiveUsers: this.getActiveUsers(monthAgo),
      peakHours: this.getPeakHours(),
      topPages: this.getTopPages(),
      userRetention: this.getUserRetention(),
      conversionRates: this.getConversionRates(),
    };
  }

  // 获取活跃用户数
  private getActiveUsers(since: number): number {
    return new Set(this.behaviors.filter((b) => b.timestamp >= since).map((b) => b.userId)).size;
  }

  // 获取高峰时段
  private getPeakHours(): Array<{ hour: number; users: number }> {
    const hourStats: Map<number, Set<string>> = new Map();

    this.behaviors.forEach((b) => {
      const hour = new Date(b.timestamp).getHours();
      if (!hourStats.has(hour)) {
        hourStats.set(hour, new Set());
      }
      hourStats.get(hour)!.add(b.userId);
    });

    return Array.from(hourStats.entries())
      .map(([hour, users]) => ({ hour, users: users.size }))
      .sort((a, b) => b.users - a.users)
      .slice(0, 24);
  }

  // 获取热门页面
  private getTopPages(): Array<{ url: string; visits: number; avgDuration: number }> {
    const pageStats: Map<string, { visits: number; totalDuration: number; sessions: Set<string> }> =
      new Map();

    this.behaviors.forEach((b) => {
      if (!pageStats.has(b.pageUrl)) {
        pageStats.set(b.pageUrl, { visits: 0, totalDuration: 0, sessions: new Set() });
      }

      const stats = pageStats.get(b.pageUrl)!;
      stats.visits++;
      stats.sessions.add(b.sessionId);
    });

    return Array.from(pageStats.entries())
      .map(([url, stats]) => ({
        url,
        visits: stats.visits,
        avgDuration: stats.totalDuration / stats.visits,
      }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10);
  }

  // 获取用户留存
  private getUserRetention(): Array<{ day: number; retention: number }> {
    const retention: Array<{ day: number; retention: number }> = [];

    for (let day = 1; day <= 30; day++) {
      const dayStart = Date.now() - day * 86400000;
      const dayEnd = dayStart + 86400000;

      const usersThatDay = new Set(
        this.behaviors
          .filter((b) => b.timestamp >= dayStart && b.timestamp < dayEnd)
          .map((b) => b.userId),
      );

      const retainedUsers = new Set(
        this.behaviors.filter((b) => b.timestamp >= dayStart && b.userId).map((b) => b.userId),
      );

      const retentionRate =
        usersThatDay.size > 0 ? (retainedUsers.size / usersThatDay.size) * 100 : 0;

      retention.push({ day, retention: retentionRate });
    }

    return retention;
  }

  // 获取转化率
  private getConversionRates(): {
    widgetOpen: number;
    messageSent: number;
    conversationCompleted: number;
  } {
    const totalSessions = new Set(this.behaviors.map((b) => b.sessionId)).size;
    const sessionsWithWidgetOpen = new Set(
      this.behaviors.filter((b) => b.action === "widget_opened").map((b) => b.sessionId),
    ).size;

    const sessionsWithMessage = new Set(
      this.behaviors.filter((b) => b.action === "message_sent").map((b) => b.sessionId),
    ).size;

    const completedConversations = Array.from(this.conversations.values()).filter(
      (m) => m.resolved,
    ).length;

    return {
      widgetOpen: totalSessions > 0 ? (sessionsWithWidgetOpen / totalSessions) * 100 : 0,
      messageSent:
        sessionsWithWidgetOpen > 0 ? (sessionsWithMessage / sessionsWithWidgetOpen) * 100 : 0,
      conversationCompleted:
        sessionsWithMessage > 0 ? (completedConversations / sessionsWithMessage) * 100 : 0,
    };
  }

  // 获取会话分析
  getConversationAnalytics(conversationId: string): ConversationMetrics | undefined {
    return this.conversations.get(conversationId);
  }

  // 获取所有会话分析
  getAllConversationAnalytics(): Map<string, ConversationMetrics> {
    return new Map(this.conversations);
  }

  // 设置会话满意度
  setConversationSatisfaction(conversationId: string, score: number): void {
    const metrics = this.conversations.get(conversationId);
    if (metrics) {
      metrics.satisfactionScore = score;
      this.conversations.set(conversationId, metrics);
    }
  }

  // 标记会话为已解决
  markConversationResolved(conversationId: string): void {
    const metrics = this.conversations.get(conversationId);
    if (metrics) {
      metrics.resolved = true;
      this.conversations.set(conversationId, metrics);
    }
  }

  // 启动聚合定时器
  private startAggregationTimer(): void {
    if (this.config.aggregationInterval > 0) {
      setInterval(() => {
        this.aggregateData();
      }, this.config.aggregationInterval);
    }
  }

  // 聚合数据
  private aggregateData(): void {
    const cutoffTime = Date.now() - this.config.retentionDays * 86400000;

    // 清理旧数据
    this.behaviors = this.behaviors.filter((b) => b.timestamp >= cutoffTime);

    // 清理旧的会话数据
    this.conversations.forEach((metrics, conversationId) => {
      const conversationBehaviors = this.behaviors.filter((b) => b.sessionId === conversationId);
      if (conversationBehaviors.length === 0) {
        this.conversations.delete(conversationId);
        this.messageTimestamps.delete(conversationId);
      }
    });

    this.emit("data_aggregated", {
      behaviorsCount: this.behaviors.length,
      conversationsCount: this.conversations.size,
    });
  }

  // 导出分析数据
  exportAnalytics(): string {
    return JSON.stringify(
      {
        behaviors: this.behaviors,
        conversations: Array.from(this.conversations.entries()),
        businessInsights: this.getBusinessInsights(),
        realTimeAnalytics: this.getRealTimeAnalytics(),
      },
      null,
      2,
    );
  }

  // 获取配置
  getConfig(): AnalyticsConfig {
    return { ...this.config };
  }

  // 更新配置
  updateConfig(config: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...config };

    if (config.aggregationInterval !== undefined) {
      this.startAggregationTimer();
    }

    this.emit("config_updated", this.config);
  }
}
