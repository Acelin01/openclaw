import type {
  SubscriptionUsageLog,
  UsageType,
  UsageStats,
  UsageDetail,
} from "../types/usage.types";
import type { CacheService } from "./types";

interface UsageRepository {
  create(data: any): Promise<SubscriptionUsageLog>;
  findByUserId(userId: string, filters?: any): Promise<SubscriptionUsageLog[]>;
}

export class UsageService {
  constructor(
    private usageRepo: UsageRepository,
    private cacheService: CacheService,
  ) {}

  async logUsage(
    subscriptionId: string,
    userId: string,
    type: UsageType,
    amount: number = 1,
    detail?: UsageDetail,
  ): Promise<SubscriptionUsageLog> {
    const log = await this.usageRepo.create({
      subscriptionId,
      userId,
      usageType: type,
      costAmount: amount,
      usageDetail: detail,
      createdAt: new Date(),
    });

    // 更新使用统计缓存
    await this.updateUsageStats(userId, type, amount);

    return log;
  }

  async getUsageLogs(
    userId: string,
    filters?: {
      type?: UsageType;
      dateRange?: { start: Date; end: Date };
      limit?: number;
    },
  ): Promise<SubscriptionUsageLog[]> {
    return await this.usageRepo.findByUserId(userId, filters);
  }

  async getUsageStats(
    userId: string,
    period: "day" | "week" | "month" = "month",
  ): Promise<UsageStats> {
    const cacheKey = `usage_stats:${userId}:${period}`;
    const cached = await this.cacheService.get<UsageStats>(cacheKey);
    if (cached) return cached;

    const stats = await this.calculateUsageStats(userId, period);
    await this.cacheService.set(cacheKey, stats, 300); // 5分钟缓存

    return stats;
  }

  private async calculateUsageStats(userId: string, period: string): Promise<UsageStats> {
    const dateRange = this.getPeriodDateRange(period);
    const logs = await this.usageRepo.findByUserId(userId, { dateRange });

    const stats: UsageStats = {
      totalUsage: logs.length,
      usageByType: {
        ai_chat: 0,
        priority_match: 0,
        premium_feature: 0,
      },
      averageDailyUsage: 0,
      topFeatures: [],
    };

    // 按类型统计
    logs.forEach((log) => {
      stats.usageByType[log.usageType]++;
    });

    // 计算日均使用量
    const days = Math.ceil(
      (dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24),
    );
    stats.averageDailyUsage = stats.totalUsage / Math.max(days, 1);

    // 统计热门功能
    const featureCount: Record<string, number> = {};
    logs.forEach((log) => {
      if (log.usageDetail?.feature) {
        featureCount[log.usageDetail.feature] = (featureCount[log.usageDetail.feature] || 0) + 1;
      }
    });

    stats.topFeatures = Object.entries(featureCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([feature, usage]) => ({ feature, usage }));

    return stats;
  }

  private getPeriodDateRange(period: string): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();

    switch (period) {
      case "day":
        start.setDate(end.getDate() - 1);
        break;
      case "week":
        start.setDate(end.getDate() - 7);
        break;
      case "month":
        start.setMonth(end.getMonth() - 1);
        break;
      default:
        start.setMonth(end.getMonth() - 1);
    }

    return { start, end };
  }

  private async updateUsageStats(userId: string, type: UsageType, amount: number): Promise<void> {
    // 这里可以实现更复杂的统计逻辑，如实时更新Redis中的统计计数
    const key = `usage_stats_realtime:${userId}:${type}`;
    if (this.cacheService.incrBy) {
      await this.cacheService.incrBy(key, amount);
    }
    if (this.cacheService.expire) {
      await this.cacheService.expire(key, 3600); // 1小时过期
    }
  }
}
