import type { SubscriptionPackage } from "../types/package.types";
import type {
  UserSubscription,
  SubscriptionStatus,
  PurchaseData,
  PaymentResult,
  PaymentMethod,
} from "../types/subscription.types";
import type { QuotaBalance, UsageType } from "../types/usage.types";
import type { CacheService } from "./types";

interface SubscriptionRepository {
  findActiveByUserId(userId: string): Promise<UserSubscription | null>;
  findByUserId(userId: string, filters?: any): Promise<UserSubscription[]>;
  findById(id: string): Promise<UserSubscription | null>;
  create(data: any): Promise<UserSubscription>;
  update(id: string, data: Partial<UserSubscription>): Promise<UserSubscription | null>;
}

interface PackageService {
  getPackageById(id: string): Promise<SubscriptionPackage | null>;
}

interface UsageService {
  logUsage(
    subscriptionId: string,
    userId: string,
    type: UsageType,
    amount: number,
    detail?: any,
  ): Promise<any>;
}

interface PaymentService {
  processPayment(data: {
    userId: string;
    amount: number;
    currency: string;
    paymentMethod: PaymentMethod;
    description: string;
  }): Promise<PaymentResult>;
  cancelPayment(paymentId: string): Promise<boolean>;
}

export class SubscriptionService {
  constructor(
    private subscriptionRepo: SubscriptionRepository,
    private packageService: PackageService,
    private usageService: UsageService,
    private paymentService: PaymentService,
    private cacheService: CacheService,
  ) {}

  async purchasePackage(userId: string, data: PurchaseData): Promise<UserSubscription> {
    // 1. 验证套餐有效性
    const pkg = await this.packageService.getPackageById(data.packageId);
    if (!pkg || !pkg.isActive) {
      throw new Error("套餐不存在或已下架");
    }

    // 2. 检查用户现有套餐
    const existingSubscription = await this.getActiveSubscription(userId);
    if (existingSubscription) {
      throw new Error("用户已有有效套餐，请先取消或等待到期");
    }

    // 3. 处理支付流程
    const paymentResult = await this.paymentService.processPayment({
      userId,
      amount: pkg.price,
      currency: pkg.currency,
      paymentMethod: data.paymentMethod,
      description: `购买套餐: ${pkg.name}`,
    });

    if (!paymentResult.success) {
      throw new Error("支付处理失败");
    }

    // 4. 创建订阅记录
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + pkg.durationDays * 24 * 60 * 60 * 1000);

    const subscription = await this.subscriptionRepo.create({
      userId,
      packageId: data.packageId,
      status: "active",
      startDate,
      endDate,
      aiChatUsed: 0,
      priorityMatchUsed: 0,
      autoRenew: data.autoRenew || false,
      paymentStatus: "paid",
      paymentId: paymentResult.paymentId,
      totalAmount: pkg.price,
    });

    // 5. 清除缓存
    await this.cacheService.del(`user_subscription:${userId}`);

    return subscription;
  }

  async getActiveSubscription(userId: string): Promise<UserSubscription | null> {
    const cacheKey = `user_subscription:${userId}`;
    const cached = await this.cacheService.get<UserSubscription>(cacheKey);
    if (cached) return cached;

    const subscription = await this.subscriptionRepo.findActiveByUserId(userId);
    if (subscription) {
      await this.cacheService.set(cacheKey, subscription, 60); // 1分钟缓存
    }
    return subscription;
  }

  async useQuota(userId: string, type: UsageType, amount: number = 1): Promise<boolean> {
    const subscription = await this.getActiveSubscription(userId);
    if (!subscription) {
      return false; // 用户没有有效套餐
    }

    // 检查配额余额
    const hasQuota = await this.checkQuota(subscription, type, amount);
    if (!hasQuota) {
      return false;
    }

    // 扣除配额并记录使用日志
    await this.deductQuota(subscription, type, amount);
    await this.usageService.logUsage(subscription.id, userId, type, amount);

    return true;
  }

  private async checkQuota(
    subscription: UserSubscription,
    type: UsageType,
    amount: number,
  ): Promise<boolean> {
    const pkg = await this.packageService.getPackageById(subscription.packageId);
    if (!pkg) return false;

    switch (type) {
      case "ai_chat":
        return subscription.aiChatUsed + amount <= (pkg.aiChatQuota || 0);
      case "priority_match":
        return subscription.priorityMatchUsed + amount <= (pkg.priorityMatchQuota || 0);
      case "premium_feature":
        return !!(pkg.features.premiumFeatures && pkg.features.premiumFeatures.length > 0);
      default:
        return false;
    }
  }

  private async deductQuota(
    subscription: UserSubscription,
    type: UsageType,
    amount: number,
  ): Promise<void> {
    const updateData: Partial<UserSubscription> = {};

    switch (type) {
      case "ai_chat":
        updateData.aiChatUsed = subscription.aiChatUsed + amount;
        break;
      case "priority_match":
        updateData.priorityMatchUsed = subscription.priorityMatchUsed + amount;
        break;
    }

    await this.subscriptionRepo.update(subscription.id, updateData);
    await this.cacheService.del(`user_subscription:${subscription.userId}`);
  }

  async getQuotaBalance(userId: string): Promise<QuotaBalance> {
    const subscription = await this.getActiveSubscription(userId);
    if (!subscription) {
      return {
        aiChat: { total: 0, used: 0, remaining: 0 },
        priorityMatch: { total: 0, used: 0, remaining: 0 },
        premiumFeatures: [],
        expiresAt: new Date(),
      };
    }

    const pkg = await this.packageService.getPackageById(subscription.packageId);
    if (!pkg) {
      throw new Error("套餐信息不存在");
    }

    return {
      aiChat: {
        total: pkg.aiChatQuota || 0,
        used: subscription.aiChatUsed,
        remaining: (pkg.aiChatQuota || 0) - subscription.aiChatUsed,
      },
      priorityMatch: {
        total: pkg.priorityMatchQuota || 0,
        used: subscription.priorityMatchUsed,
        remaining: (pkg.priorityMatchQuota || 0) - subscription.priorityMatchUsed,
      },
      premiumFeatures: pkg.features.premiumFeatures || [],
      expiresAt: subscription.endDate,
    };
  }

  async getUserSubscriptions(userId: string, filters?: any): Promise<UserSubscription[]> {
    return await this.subscriptionRepo.findByUserId(userId, filters);
  }

  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    const subscription = await this.subscriptionRepo.findById(subscriptionId);
    if (!subscription) {
      throw new Error("订阅不存在");
    }

    if (subscription.status !== "active") {
      throw new Error("只能取消有效的订阅");
    }

    const result = await this.subscriptionRepo.update(subscriptionId, {
      status: "cancelled",
      updatedAt: new Date(),
    });

    await this.cacheService.del(`user_subscription:${subscription.userId}`);
    return result !== null;
  }
}
