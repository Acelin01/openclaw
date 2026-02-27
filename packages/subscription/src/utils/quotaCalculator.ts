import type { SubscriptionPackage } from "../types/package.types";

export class QuotaCalculator {
  /**
   * 计算配额使用率
   */
  static calculateUsageRate(used: number, total: number): number {
    if (total === 0) return 0;
    return Math.min((used / total) * 100, 100);
  }

  /**
   * 检查配额是否充足
   */
  static hasSufficientQuota(used: number, total: number, requested: number): boolean {
    return used + requested <= total;
  }

  /**
   * 计算剩余配额
   */
  static calculateRemainingQuota(used: number, total: number): number {
    return Math.max(total - used, 0);
  }

  /**
   * 计算配额到期时间
   */
  static calculateExpiryDate(startDate: Date, durationDays: number): Date {
    const expiryDate = new Date(startDate);
    expiryDate.setDate(expiryDate.getDate() + durationDays);
    return expiryDate;
  }

  /**
   * 检查套餐是否过期
   */
  static isPackageExpired(endDate: Date): boolean {
    return new Date() > endDate;
  }

  /**
   * 计算套餐剩余天数
   */
  static calculateRemainingDays(endDate: Date): number {
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(diffDays, 0);
  }
}
