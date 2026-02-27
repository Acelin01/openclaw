import type { SubscriptionPackage } from "../types/package.types";

export class PriceCalculator {
  /**
   * 计算折扣价格
   */
  static calculateDiscountedPrice(originalPrice: number, discountPercentage: number): number {
    return originalPrice * (1 - discountPercentage / 100);
  }

  /**
   * 计算每日平均价格
   */
  static calculateDailyPrice(totalPrice: number, durationDays: number): number {
    if (durationDays === 0) return 0;
    return totalPrice / durationDays;
  }

  /**
   * 计算组合套餐价格
   */
  static calculateComboPrice(
    packages: SubscriptionPackage[],
    discountPercentage: number = 10,
  ): number {
    const totalPrice = packages.reduce((sum, pkg) => sum + pkg.price, 0);
    return this.calculateDiscountedPrice(totalPrice, discountPercentage);
  }

  /**
   * 格式化价格显示
   */
  static formatPrice(amount: number, currency: string = "CNY"): string {
    const currencySymbols: Record<string, string> = {
      CNY: "¥",
      USD: "$",
      EUR: "€",
      GBP: "£",
    };

    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${amount.toFixed(2)}`;
  }

  /**
   * 计算按比例退款金额
   */
  static calculateProRatedRefund(totalAmount: number, usedDays: number, totalDays: number): number {
    if (totalDays === 0) return 0;
    const remainingDays = Math.max(totalDays - usedDays, 0);
    return (totalAmount * remainingDays) / totalDays;
  }
}
