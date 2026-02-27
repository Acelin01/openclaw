export interface SubscriptionPackage {
  id: string;
  name: string;
  description: string;
  type: PackageType;
  price: number;
  currency: string;
  durationDays: number;
  features: PackageFeatures;
  aiChatQuota?: number;
  priorityMatchQuota?: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export type PackageType = "ai_chat" | "priority_match" | "premium_features" | "combo";

export interface PackageFeatures {
  aiChat?: {
    quota: number;
    model: string; // 'gpt-4', 'claude-3', etc.
    dailyLimit?: number;
  };
  priorityMatch?: {
    quota: number;
    boostFactor: number; // 匹配优先级倍数
  };
  premiumFeatures?: string[]; // 高级功能列表
  support?: {
    level: "basic" | "premium" | "vip";
    responseTime: string;
  };
}

export interface CreatePackageData {
  name: string;
  description: string;
  type: PackageType;
  price: number;
  currency?: string;
  durationDays: number;
  features: PackageFeatures;
  aiChatQuota?: number;
  priorityMatchQuota?: number;
  sortOrder?: number;
}
