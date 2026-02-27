import type { LanguageModelUsage } from "ai";
import type { UsageData } from "tokenlens/helpers";

export interface SubscriptionQuota {
  used: number;
  total: number;
  unit: string;
  label: string;
}

// Server-merged usage: base usage + TokenLens summary + optional modelId
export type AppUsage = LanguageModelUsage &
  UsageData & {
    modelId?: string;
    subscription?: SubscriptionQuota;
  };
