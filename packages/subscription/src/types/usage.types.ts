export interface SubscriptionUsageLog {
  id: string;
  userId: string;
  subscriptionId: string;
  usageType: UsageType;
  usageDetail?: UsageDetail;
  costAmount: number;
  remainingBalance?: number;
  createdAt: Date;
}

export type UsageType = "ai_chat" | "priority_match" | "premium_feature";

export interface UsageDetail {
  feature?: string;
  context?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface QuotaBalance {
  aiChat: {
    total: number;
    used: number;
    remaining: number;
  };
  priorityMatch: {
    total: number;
    used: number;
    remaining: number;
  };
  premiumFeatures: string[];
  expiresAt: Date;
}

export interface UsageStats {
  totalUsage: number;
  usageByType: Record<UsageType, number>;
  averageDailyUsage: number;
  topFeatures: Array<{ feature: string; usage: number }>;
}
