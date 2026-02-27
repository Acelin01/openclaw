import type { CreatePackageData } from "../types/package.types";
import type { PurchaseData } from "../types/subscription.types";

export class Validators {
  /**
   * 验证套餐数据
   */
  static validatePackageData(data: CreatePackageData): void {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error("套餐名称不能为空");
    }

    if (!data.description || data.description.trim().length === 0) {
      throw new Error("套餐描述不能为空");
    }

    if (
      !data.type ||
      !["ai_chat", "priority_match", "premium_features", "combo"].includes(data.type)
    ) {
      throw new Error("无效的套餐类型");
    }

    if (data.price < 0) {
      throw new Error("套餐价格不能为负数");
    }

    if (data.durationDays <= 0) {
      throw new Error("套餐有效期必须大于0天");
    }

    if (!data.features || typeof data.features !== "object") {
      throw new Error("套餐功能配置不能为空");
    }
  }

  /**
   * 验证购买数据
   */
  static validatePurchaseData(data: PurchaseData): void {
    if (!data.packageId) {
      throw new Error("套餐ID不能为空");
    }

    if (!data.paymentMethod || !data.paymentMethod.type) {
      throw new Error("支付方式不能为空");
    }

    const validPaymentTypes = ["stripe", "alipay", "wechat", "bank_transfer"];
    if (!validPaymentTypes.includes(data.paymentMethod.type)) {
      throw new Error("无效的支付方式");
    }
  }

  /**
   * 验证用户ID
   */
  static validateUserId(userId: string): void {
    if (!userId || userId.trim().length === 0) {
      throw new Error("用户ID不能为空");
    }

    // 简单的UUID格式验证
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      throw new Error("无效的用户ID格式");
    }
  }

  /**
   * 验证配额使用
   */
  static validateQuotaUsage(amount: number): void {
    if (amount <= 0) {
      throw new Error("使用数量必须大于0");
    }

    if (!Number.isInteger(amount)) {
      throw new Error("使用数量必须是整数");
    }
  }
}
