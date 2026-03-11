/**
 * 服务验收标准服务
 * 定义服务交付的验收标准、自动验收机制、超时处理
 */

import { DatabaseService } from '../lib/db/service.js';

export interface AcceptanceCriteria {
  id: string;
  orderId: string;
  deliverables: string[];      // 交付物列表
  qualityStandards: string[];  // 质量标准
  deadline: Date;              // 交付期限
  revisionCount: number;       // 修改次数
  autoAcceptDays: number;      // 自动验收天数
  createdAt: Date;
}

export interface DeliveryProof {
  files: string[];             // 交付文件 URL
  description: string;         // 交付说明
  deliveredAt: Date;
}

export class AcceptanceCriteriaService {
  private static instance: AcceptanceCriteriaService;
  private db: DatabaseService;

  private constructor() {
    this.db = DatabaseService.getInstance();
  }

  static getInstance(): AcceptanceCriteriaService {
    if (!AcceptanceCriteriaService.instance) {
      AcceptanceCriteriaService.instance = new AcceptanceCriteriaService();
    }
    return AcceptanceCriteriaService.instance;
  }

  // 创建验收标准 (订单创建时)
  async createCriteria(orderId: string, criteria: {
    deliverables: string[];
    qualityStandards: string[];
    deadline: Date;
    revisionCount: number;
    autoAcceptDays: number;
  }): Promise<AcceptanceCriteria> {
    const id = `AC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    await this.db.query(
      `INSERT INTO acceptance_criteria 
       (id, order_id, deliverables, quality_standards, deadline, revision_count, auto_accept_days, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [
        id,
        orderId,
        JSON.stringify(criteria.deliverables),
        JSON.stringify(criteria.qualityStandards),
        criteria.deadline,
        criteria.revisionCount,
        criteria.autoAcceptDays || 7, // 默认 7 天自动验收
      ]
    );

    return {
      id,
      orderId,
      ...criteria,
      createdAt: new Date(),
    };
  }

  // 服务商交付
  async deliver(orderId: string, sellerId: string, proof: DeliveryProof): Promise<{ success: boolean; message?: string }> {
    const order = await this.getOrder(orderId);
    if (!order) {
      return { success: false, message: '订单不存在' };
    }

    if (order.seller_id !== sellerId) {
      return { success: false, message: '无权交付此订单' };
    }

    if (order.status !== 'in_progress') {
      return { success: false, message: '订单状态不是服务中' };
    }

    // 更新订单状态为待验收
    await this.db.query(
      `UPDATE orders 
       SET status = 'pending_acceptance', 
           delivery_proof = $1,
           delivered_at = NOW()
       WHERE id = $2`,
      [JSON.stringify(proof), orderId]
    );

    // 发送通知给用户
    await this.notifyDelivery(order.user_id, orderId);

    // 启动自动验收计时器
    await this.startAutoAcceptTimer(orderId);

    return { success: true };
  }

  // 用户确认验收
  async accept(orderId: string, userId: string): Promise<{ success: boolean; message?: string }> {
    const order = await this.getOrder(orderId);
    if (!order) {
      return { success: false, message: '订单不存在' };
    }

    if (order.user_id !== userId) {
      return { success: false, message: '无权验收此订单' };
    }

    if (order.status !== 'pending_acceptance') {
      return { success: false, message: '订单状态不是待验收' };
    }

    // 取消自动验收计时器
    await this.cancelAutoAcceptTimer(orderId);

    // 更新订单状态为已完成
    await this.completeOrder(orderId);

    return { success: true };
  }

  // 用户拒绝验收 (需要修改)
  async reject(orderId: string, userId: string, reason: string): Promise<{ success: boolean; message?: string }> {
    const order = await this.getOrder(orderId);
    if (!order) {
      return { success: false, message: '订单不存在' };
    }

    if (order.user_id !== userId) {
      return { success: false, message: '无权操作此订单' };
    }

    if (order.status !== 'pending_acceptance') {
      return { success: false, message: '订单状态不是待验收' };
    }

    // 检查验收标准
    const criteria = await this.getCriteriaByOrder(orderId);
    if (!criteria) {
      return { success: false, message: '未找到验收标准' };
    }

    // 检查修改次数
    const currentRevisions = order.revision_count || 0;
    if (currentRevisions >= criteria.revisionCount) {
      return { 
        success: false, 
        message: `已达到最大修改次数 (${criteria.revisionCount}次)` 
      };
    }

    // 更新订单状态为需要修改
    await this.db.query(
      `UPDATE orders 
       SET status = 'revision_required', 
           revision_count = revision_count + 1,
           rejection_reason = $1
       WHERE id = $2`,
      [reason, orderId]
    );

    // 取消自动验收计时器
    await this.cancelAutoAcceptTimer(orderId);

    // 通知服务商
    await this.notifyRejection(order.seller_id, orderId, reason);

    return { success: true };
  }

  // 自动验收 (超时未确认)
  async autoAccept(orderId: string): Promise<void> {
    const order = await this.getOrder(orderId);
    if (!order) return;

    if (order.status !== 'pending_acceptance') return;

    console.log(`[Acceptance] 自动验收订单：${orderId}`);

    await this.completeOrder(orderId);
  }

  // 完成订单
  private async completeOrder(orderId: string): Promise<void> {
    const client = await this.db.getClient();
    
    try {
      await client.query('BEGIN');

      // 更新订单状态
      await client.query(
        `UPDATE orders 
         SET status = 'completed', 
             completed_at = NOW()
         WHERE id = $1`,
        [orderId]
      );

      // 获取订单金额
      const order = await this.getOrder(orderId);
      
      // 结算给服务商
      await client.query(
        `UPDATE user_balances 
         SET balance = balance + $1 
         WHERE user_id = $2`,
        [order.amount * 0.88, order.seller_id] // 扣除 12% 平台抽成
      );

      // 记录收益
      await client.query(
        `INSERT INTO earnings 
         (order_id, user_id, service_fee, platform_fee, actual_amount, status, created_at)
         VALUES ($1, $2, $3, $4, $5, 'settled', NOW())`,
        [orderId, order.seller_id, order.amount, order.amount * 0.12, order.amount * 0.88]
      );

      await client.query('COMMIT');

      // 发送通知
      await this.notifyOrderCompleted(order.user_id, orderId);
      await this.notifyPaymentReceived(order.seller_id, orderId, order.amount * 0.88);

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // 启动自动验收计时器
  private async startAutoAcceptTimer(orderId: string): Promise<void> {
    const criteria = await this.getCriteriaByOrder(orderId);
    if (!criteria) return;

    const delay = criteria.autoAcceptDays * 24 * 60 * 60 * 1000; // 转换为毫秒

    setTimeout(async () => {
      await this.autoAccept(orderId);
    }, delay);

    // 记录计时器
    await this.db.query(
      `INSERT INTO auto_accept_timers (order_id, trigger_at) 
       VALUES ($1, NOW() + INTERVAL '${criteria.autoAcceptDays} days')`,
      [orderId]
    );
  }

  // 取消自动验收计时器
  private async cancelAutoAcceptTimer(orderId: string): Promise<void> {
    await this.db.query(
      `DELETE FROM auto_accept_timers WHERE order_id = $1`,
      [orderId]
    );
  }

  // 获取验收标准
  async getCriteriaByOrder(orderId: string): Promise<AcceptanceCriteria | null> {
    const result = await this.db.query(
      `SELECT * FROM acceptance_criteria WHERE order_id = $1`,
      [orderId]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.id,
      orderId: row.order_id,
      deliverables: JSON.parse(row.deliverables),
      qualityStandards: JSON.parse(row.quality_standards),
      deadline: row.deadline,
      revisionCount: row.revision_count,
      autoAcceptDays: row.auto_accept_days,
      createdAt: row.created_at,
    };
  }

  // 获取待验收订单
  async getPendingAcceptanceOrders(userId: string): Promise<any[]> {
    const result = await this.db.query(
      `SELECT * FROM orders 
       WHERE user_id = $1 AND status = 'pending_acceptance'
       ORDER BY delivered_at ASC`,
      [userId]
    );
    return result.rows;
  }

  // 获取验收统计
  async getAcceptanceStats(userId: string): Promise<any> {
    const result = await this.db.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'pending_acceptance' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'revision_required' THEN 1 END) as revision,
        AVG(revision_count) as avg_revisions
       FROM orders
       WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0];
  }

  // 辅助方法
  private async getOrder(orderId: string): Promise<any> {
    const result = await this.db.query(
      `SELECT * FROM orders WHERE id = $1`,
      [orderId]
    );
    return result.rows[0];
  }

  private async notifyDelivery(userId: string, orderId: string): Promise<void> {
    console.log(`[Notification] 交付通知：用户${userId}, 订单${orderId}`);
  }

  private async notifyRejection(sellerId: string, orderId: string, reason: string): Promise<void> {
    console.log(`[Notification] 拒绝通知：服务商${sellerId}, 订单${orderId}, 原因${reason}`);
  }

  private async notifyOrderCompleted(userId: string, orderId: string): Promise<void> {
    console.log(`[Notification] 订单完成通知：用户${userId}, 订单${orderId}`);
  }

  private async notifyPaymentReceived(sellerId: string, orderId: string, amount: number): Promise<void> {
    console.log(`[Notification] 收款通知：服务商${sellerId}, 订单${orderId}, 金额¥${amount}`);
  }
}

export const acceptanceCriteriaService = AcceptanceCriteriaService.getInstance();
