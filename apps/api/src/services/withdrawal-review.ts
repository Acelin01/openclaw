/**
 * 提现审核服务
 * 支持：自动审核、人工审核、批量处理
 */

import { DatabaseService } from '../lib/db/service.js';

export type WithdrawalStatus = 'pending' | 'processing' | 'approved' | 'rejected' | 'completed';
export type ReviewLevel = 'auto' | 'manual' | 'senior';

export interface WithdrawalReview {
  id: string;
  withdrawalId: string;
  reviewerId?: string;
  reviewLevel: ReviewLevel;
  decision: 'approved' | 'rejected';
  reason?: string;
  reviewedAt: Date;
}

export interface WithdrawalRule {
  minAmount: number;
  maxAmount: number;
  reviewLevel: ReviewLevel;
  autoApproveLimit: number;
}

export class WithdrawalReviewService {
  private static instance: WithdrawalReviewService;
  private db: DatabaseService;
  private rules: WithdrawalRule[];

  private constructor() {
    this.db = DatabaseService.getInstance();
    this.rules = this.loadRules();
  }

  static getInstance(): WithdrawalReviewService {
    if (!WithdrawalReviewService.instance) {
      WithdrawalReviewService.instance = new WithdrawalReviewService();
    }
    return WithdrawalReviewService.instance;
  }

  private loadRules(): WithdrawalRule[] {
    return [
      { minAmount: 0, maxAmount: 500, reviewLevel: 'auto', autoApproveLimit: 500 },
      { minAmount: 501, maxAmount: 5000, reviewLevel: 'manual', autoApproveLimit: 0 },
      { minAmount: 5001, maxAmount: 50000, reviewLevel: 'senior', autoApproveLimit: 0 },
    ];
  }

  // ════════════════════════════════════════
  // 自动审核
  // ════════════════════════════════════════

  async autoReview(withdrawalId: string): Promise<{ approved: boolean; reason?: string }> {
    const withdrawal = await this.getWithdrawal(withdrawalId);
    if (!withdrawal) {
      return { approved: false, reason: '提现记录不存在' };
    }

    // 检查提现状态
    if (withdrawal.status !== 'pending') {
      return { approved: false, reason: '提现状态不是待审核' };
    }

    // 获取审核规则
    const rule = this.getRuleForAmount(withdrawal.amount);
    
    // 自动审核通过
    if (rule.reviewLevel === 'auto' && withdrawal.amount <= rule.autoApproveLimit) {
      // 检查用户历史提现记录
      const history = await this.getUserWithdrawalHistory(withdrawal.userId);
      const completedCount = history.filter(w => w.status === 'completed').length;
      const rejectedCount = history.filter(w => w.status === 'rejected').length;

      // 新用户或有拒绝记录的需人工审核
      if (completedCount < 3 || rejectedCount > 0) {
        return { approved: false, reason: '需人工审核' };
      }

      // 检查当日提现次数
      const todayWithdrawals = history.filter(w => {
        const today = new Date().toDateString();
        return new Date(w.requestedAt).toDateString() === today;
      });

      if (todayWithdrawals.length >= 3) {
        return { approved: false, reason: '今日提现次数已达上限' };
      }

      // 自动审核通过
      await this.approveWithdrawal(withdrawalId, 'system', '自动审核通过');
      return { approved: true };
    }

    return { approved: false, reason: '需人工审核' };
  }

  // ════════════════════════════════════════
  // 人工审核
  // ════════════════════════════════════════

  async manualReview(
    withdrawalId: string,
    reviewerId: string,
    decision: 'approved' | 'rejected',
    reason?: string
  ): Promise<boolean> {
    const withdrawal = await this.getWithdrawal(withdrawalId);
    if (!withdrawal) {
      return false;
    }

    if (decision === 'approved') {
      await this.approveWithdrawal(withdrawalId, reviewerId, reason);
    } else {
      await this.rejectWithdrawal(withdrawalId, reviewerId, reason);
    }

    return true;
  }

  private async approveWithdrawal(withdrawalId: string, reviewerId: string, reason?: string): Promise<void> {
    const client = await this.db.getClient();
    try {
      await client.query('BEGIN');

      // 更新提现状态
      await client.query(
        `UPDATE withdrawals SET status = 'approved', processed_at = NOW() WHERE id = $1`,
        [withdrawalId]
      );

      // 创建审核记录
      await client.query(
        `INSERT INTO withdrawal_reviews (withdrawal_id, reviewer_id, decision, reason, reviewed_at)
         VALUES ($1, $2, 'approved', $3, NOW())`,
        [withdrawalId, reviewerId, reason]
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private async rejectWithdrawal(withdrawalId: string, reviewerId: string, reason: string): Promise<void> {
    const client = await this.db.getClient();
    try {
      await client.query('BEGIN');

      // 更新提现状态
      await client.query(
        `UPDATE withdrawals SET status = 'rejected', rejected_reason = $1, processed_at = NOW() WHERE id = $2`,
        [reason, withdrawalId]
      );

      // 解冻余额
      const withdrawal = await this.getWithdrawal(withdrawalId);
      if (withdrawal) {
        await client.query(
          `UPDATE user_balances SET frozen_balance = frozen_balance - $1 WHERE user_id = $2`,
          [withdrawal.amount, withdrawal.userId]
        );
      }

      // 创建审核记录
      await client.query(
        `INSERT INTO withdrawal_reviews (withdrawal_id, reviewer_id, decision, reason, reviewed_at)
         VALUES ($1, $2, 'rejected', $3, NOW())`,
        [withdrawalId, reviewerId, reason]
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // ════════════════════════════════════════
  // 批量处理
  // ════════════════════════════════════════

  async batchAutoReview(): Promise<{ approved: number; pending: number }> {
    const pendingWithdrawals = await this.getPendingWithdrawals();
    let approvedCount = 0;

    for (const withdrawal of pendingWithdrawals) {
      const result = await this.autoReview(withdrawal.id);
      if (result.approved) {
        approvedCount++;
      }
    }

    return {
      approved: approvedCount,
      pending: pendingWithdrawals.length - approvedCount,
    };
  }

  // ════════════════════════════════════════
  // 数据库操作
  // ════════════════════════════════════════

  private async getWithdrawal(withdrawalId: string): Promise<any> {
    const result = await this.db.query('SELECT * FROM withdrawals WHERE id = $1', [withdrawalId]);
    return result.rows[0];
  }

  private async getPendingWithdrawals(): Promise<any[]> {
    const result = await this.db.query(
      `SELECT * FROM withdrawals WHERE status = 'pending' ORDER BY requested_at ASC`
    );
    return result.rows;
  }

  private async getUserWithdrawalHistory(userId: string): Promise<any[]> {
    const result = await this.db.query(
      `SELECT * FROM withdrawals WHERE user_id = $1 ORDER BY requested_at DESC LIMIT 50`,
      [userId]
    );
    return result.rows;
  }

  private getRuleForAmount(amount: number): WithdrawalRule {
    return this.rules.find(r => amount >= r.minAmount && amount <= r.maxAmount) || this.rules[0];
  }
}

export const withdrawalReviewService = WithdrawalReviewService.getInstance();
