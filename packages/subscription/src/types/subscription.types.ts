export interface UserSubscription {
  id: string;
  userId: string;
  packageId: string;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  aiChatUsed: number;
  priorityMatchUsed: number;
  autoRenew: boolean;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
  package?: SubscriptionPackage;
}

export type SubscriptionStatus = "active" | "expired" | "cancelled" | "pending";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface PurchaseData {
  packageId: string;
  autoRenew?: boolean;
  paymentMethod: PaymentMethod;
}

export interface SubscriptionFilters {
  userId?: string;
  status?: SubscriptionStatus;
  packageType?: PackageType;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface PaymentMethod {
  type: "stripe" | "alipay" | "wechat" | "bank_transfer";
  details?: Record<string, any>;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  error?: string;
}

import type { SubscriptionPackage } from "./package.types";
import type { PackageType } from "./package.types";
