/**
 * 纠纷仲裁服务
 * 支持用户发起纠纷、提交证据、平台仲裁、执行结果
 */

import { DatabaseService } from '../lib/db/service.js';

export type DisputeType = 'quality' | 'delivery' | 'payment' | 'communication' | 'other';
export type DisputeStatus = 'submitted' | 'under_review' | 'evidence_collection' | 'arbitration' | 'resolved' | 'appealed' | 'closed';
export type ArbitrationResult = 'user_win' | 'seller_win' | 'partial_refund' | 'mediation';

export interface DisputeCase {
  id: string;
  orderId: string;
  userId: string;
  sellerId: string;
  type: DisputeType;
  reason: string;
  description: string;
  evidence: string[];
  status: DisputeStatus;
  assignedTo?: string; // 仲裁员 ID
  result?: ArbitrationResult;
  resultReason?: string;
  createdAt: Date;
}

export class DisputeArbitrationService {
  private static instance: DisputeArbitrationService;
  private db: DatabaseService;

  private constructor() {
    this.db = DatabaseService.getInstance();
  }

  static getInstance(): DisputeArbitrationService {
    if (!DisputeArbitrationService.instance) {
      DisputeArbitrationService.instance = new DisputeArbitrationService();
    }
    return DisputeArbitrationService.instance;
  }

  // 发起纠纷
  async createDispute(orderId: string, userId: string, data: {
    type: DisputeType;
    reason: string;
    description: string;
    evidence?: string[];
  }): Promise<DisputeCase> {
    const client = await this.db.getClient();
    
    try {
      await client.query('BEGIN');

      // 验证订单
      const order = await this.getOrder(orderId);
      if (!order) {
        throw new Error('订单不存在');
      }

      if (order.user_id !== userId) {
        throw new Error('无权操作此订单');
      }

      // 检查是否已有纠纷
      const existing = await this.getDisputeByOrder(orderId);
      if (existing) {
        throw new Error('该订单已有纠纷案例');
      }

      // 生成纠纷 ID
      const id = `DSP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // 创建纠纷案例
      await this.db.query(
        `INSERT INTO dispute_cases 
         (id, order_id, user_id, seller_id, type, reason, description, evidence, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'submitted', NOW())`,
        [id, orderId, userId, order.seller_id, data.type, data.reason, data.description, data.evidence ? JSON.stringify(data.evidence) : null]
      );

      // 冻结订单资金
      await this.db.query(
        `UPDATE orders SET status = 'disputed', disputed_at = NOW() WHERE id = $1`,
        [orderId]
      );

      await client.query('COMMIT');

      // 分配仲裁员
      await this.assignArbitrator(id);

      // 发送通知
      await this.notifyDisputeCreated(orderId, id, userId, order.seller_id);

      console.log(`[Dispute] 纠纷创建：${id}, 订单：${orderId}`);

      return {
        id,
        orderId,
        userId,
        sellerId: order.seller_id,
        type: data.type,
        reason: data.reason,
        description: data.description,
        evidence: data.evidence || [],
        status: 'submitted',
        createdAt: new Date(),
      };

    } catch (error: any) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // 提交证据
  async submitEvidence(disputeId: string, userId: string, evidence: string[]): Promise<void> {
    const dispute = await this.getDispute(disputeId);
    if (!dispute) {
      throw new Error('纠纷案例不存在');
    }

    if (dispute.userId !== userId && dispute.sellerId !== userId) {
      throw new Error('无权提交证据');
    }

    if (!['submitted', 'evidence_collection'].includes(dispute.status)) {
      throw new Error('当前状态不可提交证据');
    }

    const existingEvidence = dispute.evidence || [];
    const updatedEvidence = [...existingEvidence, ...evidence];

    await this.db.query(
      `UPDATE dispute_cases SET evidence = $1, updated_at = NOW() WHERE id = $2`,
      [JSON.stringify(updatedEvidence), disputeId]
    );

    // 更新状态
    await this.updateDisputeStatus(disputeId, 'evidence_collection');
  }

  // 仲裁裁决
  async makeArbitration(disputeId: string, arbitratorId: string, result: ArbitrationResult, reason: string): Promise<void> {
    const client = await this.db.getClient();
    
    try {
      await client.query('BEGIN');

      const dispute = await this.getDispute(disputeId);
      if (!dispute) {
        throw new Error('纠纷案例不存在');
      }

      if (dispute.assignedTo !== arbitratorId) {
        throw new Error('无权仲裁此案例');
      }

      // 更新纠纷状态
      await this.db.query(
        `UPDATE dispute_cases 
         SET status = 'resolved', 
             result = $1, 
             result_reason = $2,
             resolved_at = NOW(),
             resolved_by = $3
         WHERE id = $4`,
        [result, reason, arbitratorId, disputeId]
      );

      // 执行裁决结果
      await this.executeArbitrationResult(dispute, result);

      await client.query('COMMIT');

      // 发送通知
      await this.notifyArbitrationResult(disputeId, dispute.userId, dispute.sellerId, result);

      console.log(`[Dispute] 仲裁完成：${disputeId}, 结果：${result}`);

    } catch (error: any) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // 申诉
  async appealDispute(disputeId: string, userId: string, reason: string): Promise<void> {
    const dispute = await this.getDispute(disputeId);
    if (!dispute) {
      throw new Error('纠纷案例不存在');
    }

    if (dispute.userId !== userId && dispute.sellerId !== userId) {
      throw new Error('无权申诉');
    }

    if (dispute.status !== 'resolved') {
      throw new Error('只有已裁决的案例可以申诉');
    }

    await this.db.query(
      `UPDATE dispute_cases SET status = 'appealed', appeal_reason = $1 WHERE id = $2`,
      [reason, disputeId]
    );

    // 重新分配高级仲裁员
    await this.assignSeniorArbitrator(disputeId);
  }

  // 获取用户的纠纷列表
  async getUserDisputes(userId: string, limit: number = 20): Promise<DisputeCase[]> {
    const result = await this.db.query(
      `SELECT * FROM dispute_cases 
       WHERE user_id = $1 OR seller_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows.map(row => this.mapToDispute(row));
  }

  // 获取待仲裁案例
  async getPendingArbitration(limit: number = 50): Promise<DisputeCase[]> {
    const result = await this.db.query(
      `SELECT * FROM dispute_cases 
       WHERE status IN ('submitted', 'evidence_collection') 
       ORDER BY created_at ASC 
       LIMIT $1`,
      [limit]
    );
    return result.rows.map(row => this.mapToDispute(row));
  }

  // 获取纠纷统计
  async getDisputeStats(): Promise<any> {
    const result = await this.db.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'submitted' THEN 1 END) as submitted,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
        COUNT(CASE WHEN result = 'user_win' THEN 1 END) as user_win,
        COUNT(CASE WHEN result = 'seller_win' THEN 1 END) as seller_win,
        COUNT(CASE WHEN result = 'partial_refund' THEN 1 END) as partial_refund
       FROM dispute_cases`
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

  private async getDispute(disputeId: string): Promise<DisputeCase | null> {
    const result = await this.db.query(
      `SELECT * FROM dispute_cases WHERE id = $1`,
      [disputeId]
    );
    return result.rows.length > 0 ? this.mapToDispute(result.rows[0]) : null;
  }

  private async getDisputeByOrder(orderId: string): Promise<DisputeCase | null> {
    const result = await this.db.query(
      `SELECT * FROM dispute_cases WHERE order_id = $1`,
      [orderId]
    );
    return result.rows.length > 0 ? this.mapToDispute(result.rows[0]) : null;
  }

  private mapToDispute(row: any): DisputeCase {
    return {
      id: row.id,
      orderId: row.order_id,
      userId: row.user_id,
      sellerId: row.seller_id,
      type: row.type,
      reason: row.reason,
      description: row.description,
      evidence: row.evidence ? JSON.parse(row.evidence) : [],
      status: row.status,
      assignedTo: row.assigned_to,
      result: row.result,
      resultReason: row.result_reason,
      createdAt: row.created_at,
    };
  }

  private async updateDisputeStatus(disputeId: string, status: DisputeStatus): Promise<void> {
    await this.db.query(
      `UPDATE dispute_cases SET status = $1, updated_at = NOW() WHERE id = $2`,
      [status, disputeId]
    );
  }

  private async assignArbitrator(disputeId: string): Promise<void> {
    // 随机分配仲裁员
    const result = await this.db.query(
      `SELECT id FROM users WHERE role = 'arbitrator' ORDER BY RANDOM() LIMIT 1`
    );

    if (result.rows.length > 0) {
      await this.db.query(
        `UPDATE dispute_cases SET assigned_to = $1, status = 'under_review' WHERE id = $2`,
        [result.rows[0].id, disputeId]
      );
    }
  }

  private async assignSeniorArbitrator(disputeId: string): Promise<void> {
    // 分配高级仲裁员
    const result = await this.db.query(
      `SELECT id FROM users WHERE role = 'senior_arbitrator' ORDER BY RANDOM() LIMIT 1`
    );

    if (result.rows.length > 0) {
      await this.db.query(
        `UPDATE dispute_cases SET assigned_to = $1 WHERE id = $2`,
        [result.rows[0].id, disputeId]
      );
    }
  }

  private async executeArbitrationResult(dispute: DisputeCase, result: ArbitrationResult): Promise<void> {
    const order = await this.getOrder(dispute.orderId);
    if (!order) return;

    switch (result) {
      case 'user_win':
        // 全额退款给用户
        await this.db.query(
          `UPDATE user_balances SET balance = balance + $1 WHERE user_id = $2`,
          [order.amount, dispute.userId]
        );
        break;

      case 'seller_win':
        // 全额支付给服务商
        await this.db.query(
          `UPDATE user_balances SET balance = balance + $1 WHERE user_id = $2`,
          [order.amount * 0.88, dispute.sellerId] // 扣除 12% 平台费
        );
        break;

      case 'partial_refund':
        // 部分退款 (50%)
        const refundAmount = order.amount * 0.5;
        await this.db.query(
          `UPDATE user_balances SET balance = balance + $1 WHERE user_id = $2`,
          [refundAmount, dispute.userId]
        );
        await this.db.query(
          `UPDATE user_balances SET balance = balance + $1 WHERE user_id = $2`,
          [(order.amount - refundAmount) * 0.88, dispute.sellerId]
        );
        break;

      case 'mediation':
        // 调解处理 (协商结果)
        break;
    }

    // 更新订单状态
    await this.db.query(
      `UPDATE orders SET status = 'disputed_resolved' WHERE id = $1`,
      [dispute.orderId]
    );
  }

  private async notifyDisputeCreated(orderId: string, disputeId: string, userId: string, sellerId: string): Promise<void> {
    console.log(`[Notification] 纠纷通知：订单${orderId}, 纠纷${disputeId}`);
  }

  private async notifyArbitrationResult(disputeId: string, userId: string, sellerId: string, result: ArbitrationResult): Promise<void> {
    console.log(`[Notification] 仲裁结果通知：纠纷${disputeId}, 结果${result}`);
  }
}

export const disputeArbitrationService = DisputeArbitrationService.getInstance();
