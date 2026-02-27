import type { UserSubscription, SubscriptionStatus } from "../types/subscription.types";

export class SubscriptionRepository {
  constructor(private db: any) {}

  async findActiveByUserId(userId: string): Promise<UserSubscription | null> {
    const subscription = await this.db.userSubscription.findFirst({
      where: {
        userId,
        status: "ACTIVE",
        endDate: {
          gt: new Date(),
        },
      },
      include: {
        package: true,
      },
    });

    return subscription ? this.mapToDomain(subscription) : null;
  }

  async findByUserId(userId: string, filters?: any): Promise<UserSubscription[]> {
    const where: any = { userId };

    if (filters?.status) {
      where.status = filters.status.toUpperCase();
    }

    if (filters?.dateRange) {
      where.createdAt = {
        gte: filters.dateRange.start,
        lte: filters.dateRange.end,
      };
    }

    const subscriptions = await this.db.userSubscription.findMany({
      where,
      include: {
        package: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return subscriptions.map(this.mapToDomain);
  }

  async findById(id: string): Promise<UserSubscription | null> {
    const subscription = await this.db.userSubscription.findUnique({
      where: { id },
      include: {
        package: true,
      },
    });

    return subscription ? this.mapToDomain(subscription) : null;
  }

  async create(data: any): Promise<UserSubscription> {
    const subscription = await this.db.userSubscription.create({
      data: {
        userId: data.userId,
        packageId: data.packageId,
        status: data.status.toUpperCase(),
        startDate: data.startDate,
        endDate: data.endDate,
        aiChatUsed: data.aiChatUsed || 0,
        priorityMatchUsed: data.priorityMatchUsed || 0,
        autoRenew: data.autoRenew || false,
        paymentStatus: data.paymentStatus.toUpperCase(),
        paymentId: data.paymentId,
        totalAmount: data.totalAmount,
      },
      include: {
        package: true,
      },
    });

    return this.mapToDomain(subscription);
  }

  async update(id: string, data: Partial<UserSubscription>): Promise<UserSubscription | null> {
    const updateData: any = {};

    if (data.status !== undefined) updateData.status = data.status.toUpperCase();
    if (data.aiChatUsed !== undefined) updateData.aiChatUsed = data.aiChatUsed;
    if (data.priorityMatchUsed !== undefined) updateData.priorityMatchUsed = data.priorityMatchUsed;
    if (data.autoRenew !== undefined) updateData.autoRenew = data.autoRenew;
    if (data.paymentStatus !== undefined)
      updateData.paymentStatus = data.paymentStatus.toUpperCase();
    if (data.paymentId !== undefined) updateData.paymentId = data.paymentId;

    const subscription = await this.db.userSubscription.update({
      where: { id },
      data: updateData,
      include: {
        package: true,
      },
    });

    return this.mapToDomain(subscription);
  }

  private mapToDomain(prismaSubscription: any): UserSubscription {
    return {
      id: prismaSubscription.id,
      userId: prismaSubscription.userId,
      packageId: prismaSubscription.packageId,
      status: prismaSubscription.status.toLowerCase() as SubscriptionStatus,
      startDate: prismaSubscription.startDate,
      endDate: prismaSubscription.endDate,
      aiChatUsed: prismaSubscription.aiChatUsed,
      priorityMatchUsed: prismaSubscription.priorityMatchUsed,
      autoRenew: prismaSubscription.autoRenew,
      paymentStatus: prismaSubscription.paymentStatus.toLowerCase() as any,
      paymentId: prismaSubscription.paymentId,
      totalAmount: Number(prismaSubscription.totalAmount),
      createdAt: prismaSubscription.createdAt,
      updatedAt: prismaSubscription.updatedAt,
      package: prismaSubscription.package
        ? {
            id: prismaSubscription.package.id,
            name: prismaSubscription.package.name,
            description: prismaSubscription.package.description,
            type: prismaSubscription.package.type.toLowerCase() as any,
            price: Number(prismaSubscription.package.price),
            currency: prismaSubscription.package.currency,
            durationDays: prismaSubscription.package.durationDays,
            features: prismaSubscription.package.features,
            aiChatQuota: prismaSubscription.package.aiChatQuota,
            priorityMatchQuota: prismaSubscription.package.priorityMatchQuota,
            isActive: prismaSubscription.package.isActive,
            sortOrder: prismaSubscription.package.sortOrder,
            createdAt: prismaSubscription.package.createdAt,
            updatedAt: prismaSubscription.package.updatedAt,
          }
        : undefined,
    };
  }
}
