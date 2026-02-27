import type { SubscriptionUsageLog, UsageType } from "../types/usage.types";

export class UsageRepository {
  constructor(private db: any) {}

  async create(data: any): Promise<SubscriptionUsageLog> {
    const log = await this.db.subscriptionUsageLog.create({
      data: {
        userId: data.userId,
        subscriptionId: data.subscriptionId,
        usageType: data.usageType.toUpperCase(),
        usageDetail: data.usageDetail,
        costAmount: data.costAmount || 1,
        remainingBalance: data.remainingBalance,
      },
    });

    return this.mapToDomain(log);
  }

  async findByUserId(userId: string, filters?: any): Promise<SubscriptionUsageLog[]> {
    const where: any = { userId };

    if (filters?.type) {
      where.usageType = filters.type.toUpperCase();
    }

    if (filters?.dateRange) {
      where.createdAt = {
        gte: filters.dateRange.start,
        lte: filters.dateRange.end,
      };
    }

    const logs = await this.db.subscriptionUsageLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: filters?.limit || 100,
    });

    return logs.map(this.mapToDomain);
  }

  private mapToDomain(prismaLog: any): SubscriptionUsageLog {
    return {
      id: prismaLog.id,
      userId: prismaLog.userId,
      subscriptionId: prismaLog.subscriptionId,
      usageType: prismaLog.usageType.toLowerCase() as UsageType,
      usageDetail: prismaLog.usageDetail,
      costAmount: prismaLog.costAmount,
      remainingBalance: prismaLog.remainingBalance,
      createdAt: prismaLog.createdAt,
    };
  }
}
