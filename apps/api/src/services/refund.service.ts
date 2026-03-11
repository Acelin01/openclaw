/**
 * 退款服务
 * 支持用户申请退款、平台审核、退款处理全流程
 */

import { DatabaseService } from '../lib/db/service.js';

export type RefundType = 'full' | 'partial';
export type RefundReason = 'quality' | 'delivery' | 'description' | 'other';
export type RefundStatus = 'pending' | 'approved' | 'rejected' | 'processing' | 'completed' | 'cancelled';

export interface RefundRequest {
  orderId: string;
  userId: string;
  type: RefundType;
  amount?: number; // 部分退款时必填
  reason: RefundReason;
  description: string;
  evidence?: string[]; // 证据图片 URL
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  message?: string;
}

export class RefundService {
  private static instance: RefundService;
  private db: DatabaseService;

  private constructor() {
    this.db = DatabaseService.getInstance();
  }

  static getInstance(): RefundService {
    if (!RefundService.instance) {
      RefundService.instance = new RefundService();
    }
    return RefundService.instance;
  }

  // 申请退款
  async applyRefund(request: RefundRequest): Promise<RefundResult> {
    const client = await this.db.getClient();
    
    try {
      await client.query('BEGIN');

      // 1. 验证订单存在且属于该用户
      const order = await this.getOrder(request.orderId);
      if (!order) {
        return { success: false, message: '订单不存在' };
      }

      if (order.user_id !== request.userId) {
        return { success: false, message: '无权操作此订单' };
      }

      // 2. 验证订单状态 (只有已支付/服务中的订单可退款)
      if (!['paid', 'in_progress'].includes(order.status)) {
        return { success: false, message: '当前订单状态不可申请退款' };
      }

      // 3. 检查是否已有退款申请
      const existingRefund = await this.getRefundByOrder(request.orderId);
      if (existingRefund) {
        return { success: false, message: '该订单已有退款申请' };
      }

      // 4. 生成退款 ID
      const refundId = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // 5. 确定退款金额
      const refundAmount = request.type === 'full' ? order.amount : (request.amount || 0);
      if (refundAmount <= 0 || refundAmount > order.amount) {
        return { success: false, message: '退款金额无效' };
      }

      // 6. 创建退款记录
      await this.createRefundRecord(refundId, request, refundAmount);

      // 7. 冻结订单金额 (防止服务商提现)
      await this.freezeOrderAmount(request.orderId, refundAmount);

      await client.query('COMMIT');

      // 8. 发送通知
      await this.notifyRefundApplied(request.orderId, refundId, request.userId);

      console.log(`[Refund] 退款申请成功：${refundId}, 金额：¥${refundAmount}`);

      return {
        success: true,
        refundId,
        message: '退款申请已提交，平台将在 1-3 个工作日内审核',
      };

    } catch (error: any) {
      await client.query('ROLLBACK');
      console.error('[Refund] 申请失败:', error.message);
      return { success: false, message: error.message };
    } finally {
      client.release();
    }
  }

  // 审核退款 (平台管理员)
  async reviewRefund(refundId: string, adminId: string, decision: 'approved' | 'rejected', reason?: string): Promise<RefundResult> {
    const client = await this.db.getClient();
    
    try {
      await client.query('BEGIN');

      const refund = await this.getRefund(refundId);
      if (!refund) {
        return { success: false, message: '退款记录不存在' };
      }

      if (refund.status !== 'pending') {
        return { success: false, message: '退款状态不是待审核' };
      }

      // 更新退款状态
      await this.updateRefundStatus(refundId, decision === 'approved' ? 'approved' : 'rejected', {
        adminId,
        reviewReason: reason,
      });

      if (decision === 'rejected') {
        // 拒绝退款，解冻金额
        await this.unfreezeOrderAmount(refund.order_id, refund.amount);
      } else {
        // 批准退款，进入打款流程
        await this.updateRefundStatus(refundId, 'processing', {});
      }

      await client.query('COMMIT');

      // 发送通知
      await this.notifyRefundReviewed(refund.user_id, refundId, decision, reason);

      return { success: true };

    } catch (error: any) {
      await client.query('ROLLBACK');
      return { success: false, message: error.message };
    } finally {
      client.release();
    }
  }

  // 处理退款 (财务打款)
  async processRefund(refundId: string): Promise<RefundResult> {
    const client = await this.db.getClient();
    
    try {
      await client.query('BEGIN');

      const refund = await this.getRefund(refundId);
      if (!refund) {
        return { success: false, message: '退款记录不存在' };
      }

      if (refund.status !== 'approved' && refund.status !== 'processing') {
        return { success: false, message: '退款状态不是已批准' };
      }

      // 获取用户支付方式
      const paymentMethod = await this.getUserPaymentMethod(refund.user_id);
      
      // 调用支付渠道退款
      const refundResult = await this.refundToPaymentChannel(
        refund.order_id,
        refund.amount,
        paymentMethod
      );

      if (!refundResult.success) {
        throw new Error(refundResult.message || '退款失败');
      }

      // 更新退款状态
      await this.updateRefundStatus(refundId, 'completed', {
        transactionId: refundResult.transactionId,
        refundedAt: new Date(),
      });

      // 解冻剩余金额 (如果是部分退款)
      if (refund.type === 'partial') {
        const order = await this.getOrder(refund.order_id);
        const remainingAmount = order.amount - refund.amount;
        if (remainingAmount > 0) {
          await this.unfreezeOrderAmount(refund.order_id, remainingAmount);
          // 将剩余金额给服务商
          await this.releaseToSeller(refund.order_id, remainingAmount);
        }
      }

      await client.query('COMMIT');

      // 发送通知
      await this.notifyRefundCompleted(refund.user_id, refundId, refund.amount);

      console.log(`[Refund] 退款完成：${refundId}, 金额：¥${refund.amount}`);

      return { success: true };

    } catch (error: any) {
      await client.query('ROLLBACK');
      return { success: false, message: error.message };
    } finally {
      client.release();
    }
  }

  // 取消退款申请 (用户主动取消)
  async cancelRefund(refundId: string, userId: string): Promise<RefundResult> {
    const refund = await this.getRefund(refundId);
    
    if (!refund) {
      return { success: false, message: '退款记录不存在' };
    }

    if (refund.user_id !== userId) {
      return { success: false, message: '无权操作此退款' };
    }

    if (refund.status !== 'pending') {
      return { success: false, message: '退款已进入审核流程，无法取消' };
    }

    await this.updateRefundStatus(refundId, 'cancelled', {});
    await this.unfreezeOrderAmount(refund.order_id, refund.amount);

    return { success: true };
  }

  // 获取用户的退款列表
  async getUserRefunds(userId: string, limit: number = 20): Promise<any[]> {
    const result = await this.db.query(
      `SELECT * FROM refunds WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }

  // 获取订单的退款记录
  async getRefundByOrder(orderId: string): Promise<any> {
    const result = await this.db.query(
      `SELECT * FROM refunds WHERE order_id = $1`,
      [orderId]
    );
    return result.rows[0];
  }

  // 获取退款详情
  async getRefund(refundId: string): Promise<any> {
    const result = await this.db.query(
      `SELECT * FROM refunds WHERE id = $1`,
      [refundId]
    );
    return result.rows[0];
  }

  // 获取待审核退款列表
  async getPendingRefunds(limit: number = 50): Promise<any[]> {
    const result = await this.db.query(
      `SELECT * FROM refunds WHERE status = 'pending' ORDER BY created_at ASC LIMIT $1`,
      [limit]
    );
    return result.rows;
  }

  // 获取退款统计
  async getRefundStats(): Promise<any> {
    const result = await this.db.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COALESCE(SUM(amount), 0) as total_amount,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as refunded_amount
       FROM refunds`
    );
    return result.rows[0];
  }

  // ===== 私有方法 =====

  private async getOrder(orderId: string): Promise<any> {
    const result = await this.db.query(
      `SELECT * FROM orders WHERE id = $1`,
      [orderId]
    );
    return result.rows[0];
  }

  private async createRefundRecord(refundId: string, request: RefundRequest, amount: number): Promise<void> {
    await this.db.query(
      `INSERT INTO refunds 
       (id, order_id, user_id, type, amount, reason, description, evidence, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', NOW())`,
      [refundId, request.orderId, request.userId, request.type, amount, request.reason, request.description, request.evidence ? JSON.stringify(request.evidence) : null]
    );
  }

  private async freezeOrderAmount(orderId: string, amount: number): Promise<void> {
    await this.db.query(
      `UPDATE orders SET frozen_amount = COALESCE(frozen_amount, 0) + $1 WHERE id = $2`,
      [amount, orderId]
    );
  }

  private async unfreezeOrderAmount(orderId: string, amount: number): Promise<void> {
    await this.db.query(
      `UPDATE orders SET frozen_amount = COALESCE(frozen_amount, 0) - $1 WHERE id = $2`,
      [amount, orderId]
    );
  }

  private async updateRefundStatus(refundId: string, status: RefundStatus, metadata: any): Promise<void> {
    const updates: string[] = ['status = $1'];
    const values: any[] = [status];
    let paramIndex = 2;

    if (metadata.adminId) {
      updates.push(`reviewed_by = $${paramIndex++}`);
      values.push(metadata.adminId);
    }

    if (metadata.reviewReason) {
      updates.push(`review_reason = $${paramIndex++}`);
      values.push(metadata.reviewReason);
    }

    if (metadata.transactionId) {
      updates.push(`transaction_id = $${paramIndex++}`);
      values.push(metadata.transactionId);
    }

    if (metadata.refundedAt) {
      updates.push(`refunded_at = $${paramIndex++}`);
      values.push(metadata.refundedAt);
    }

    updates.push(`updated_at = NOW()`);

    await this.db.query(
      `UPDATE refunds SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      [...values, refundId]
    );
  }

  private async getUserPaymentMethod(userId: string): Promise<string> {
    const result = await this.db.query(
      `SELECT payment_method FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );
    return result.rows[0]?.payment_method || 'alipay';
  }

  private async refundToPaymentChannel(orderId: string, amount: number, paymentMethod: string): Promise<{ success: boolean; transactionId?: string; message?: string }> {
    // TODO: 调用实际支付渠道退款 API
    // 目前返回模拟成功
    const transactionId = `REFUND-${Date.now()}`;
    
    console.log(`[Refund] 调用${paymentMethod}退款：订单${orderId}, 金额¥${amount}`);
    
    return {
      success: true,
      transactionId,
    };
  }

  private async releaseToSeller(orderId: string, amount: number): Promise<void> {
    // 将剩余金额释放给服务商
    const order = await this.getOrder(orderId);
    if (order) {
      await this.db.query(
        `UPDATE user_balances SET balance = balance + $1 WHERE user_id = $2`,
        [amount, order.seller_id]
      );
    }
  }

  private async notifyRefundApplied(orderId: string, refundId: string, userId: string): Promise<void> {
    // TODO: 发送通知
    console.log(`[Notification] 退款申请通知：用户${userId}, 订单${orderId}, 退款${refundId}`);
  }

  private async notifyRefundReviewed(userId: string, refundId: string, decision: 'approved' | 'rejected', reason?: string): Promise<void> {
    // TODO: 发送通知
    console.log(`[Notification] 退款审核通知：用户${userId}, 退款${refundId}, 结果${decision}`);
  }

  private async notifyRefundCompleted(userId: string, refundId: string, amount: number): Promise<void> {
    // TODO: 发送通知
    console.log(`[Notification] 退款完成通知：用户${userId}, 退款${refundId}, 金额¥${amount}`);
  }
}

export const refundService = RefundService.getInstance();
