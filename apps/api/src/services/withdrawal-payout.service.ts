/**
 * 提现打款服务
 * 实现自动/手动打款到银行卡
 */

import { DatabaseService } from '../lib/db/service.js';

export interface PayoutRequest {
  withdrawalId: string;
  userId: string;
  amount: number;
  bankName: string;
  bankAccount: string;
  bankCode?: string;
}

export interface PayoutResult {
  success: boolean;
  transactionId?: string;
  message?: string;
  paidAt?: Date;
}

export class WithdrawalPayoutService {
  private static instance: WithdrawalPayoutService;
  private db: DatabaseService;

  private constructor() {
    this.db = DatabaseService.getInstance();
  }

  static getInstance(): WithdrawalPayoutService {
    if (!WithdrawalPayoutService.instance) {
      WithdrawalPayoutService.instance = new WithdrawalPayoutService();
    }
    return WithdrawalPayoutService.instance;
  }

  // 执行打款
  async executePayout(request: PayoutRequest): Promise<PayoutResult> {
    try {
      // 1. 验证提现记录
      const withdrawal = await this.getWithdrawal(request.withdrawalId);
      if (!withdrawal) {
        return { success: false, message: '提现记录不存在' };
      }

      if (withdrawal.status !== 'approved') {
        return { success: false, message: '提现状态不是已审核' };
      }

      // 2. 调用银行 API 打款
      const bankResult = await this.transferToBank(request);
      
      if (!bankResult.success) {
        throw new Error(bankResult.message || '银行打款失败');
      }

      // 3. 更新提现状态
      await this.updateWithdrawalStatus(request.withdrawalId, 'completed', {
        transactionId: bankResult.transactionId,
        paidAt: bankResult.paidAt,
      });

      // 4. 扣减冻结余额
      await this.debitFrozenBalance(request.userId, request.amount);

      // 5. 记录打款日志
      await this.logPayout(request, bankResult);

      console.log(`[Payout] 打款成功：用户 ${request.userId}, 金额 ¥${request.amount}`);

      return {
        success: true,
        transactionId: bankResult.transactionId,
        paidAt: bankResult.paidAt,
      };

    } catch (error: any) {
      console.error(`[Payout] 打款失败:`, error.message);
      
      // 记录失败
      await this.logPayoutFailure(request, error.message);

      return {
        success: false,
        message: error.message,
      };
    }
  }

  // 银行转账 (模拟，实际需对接银行 API)
  private async transferToBank(request: PayoutRequest): Promise<PayoutResult> {
    // TODO: 对接实际银行 API
    // 目前返回模拟成功
    
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const paidAt = new Date();

    console.log(`[Payout] 模拟银行转账：${request.bankName} ${request.bankAccount} ¥${request.amount}`);

    return {
      success: true,
      transactionId,
      paidAt,
    };
  }

  // 获取提现记录
  private async getWithdrawal(withdrawalId: string): Promise<any> {
    const result = await this.db.query(
      `SELECT * FROM withdrawals WHERE id = $1`,
      [withdrawalId]
    );
    return result.rows[0];
  }

  // 更新提现状态
  private async updateWithdrawalStatus(
    withdrawalId: string,
    status: string,
    metadata: any
  ): Promise<void> {
    await this.db.query(
      `UPDATE withdrawals 
       SET status = $1, 
           transaction_id = $2,
           paid_at = $3,
           processed_at = NOW()
       WHERE id = $4`,
      [status, metadata.transactionId, metadata.paidAt, withdrawalId]
    );
  }

  // 扣减冻结余额
  private async debitFrozenBalance(userId: string, amount: number): Promise<void> {
    await this.db.query(
      `UPDATE user_balances 
       SET frozen_balance = frozen_balance - $1 
       WHERE user_id = $2`,
      [amount, userId]
    );
  }

  // 记录打款日志
  private async logPayout(request: PayoutRequest, result: PayoutResult): Promise<void> {
    await this.db.query(
      `INSERT INTO payout_logs 
       (withdrawal_id, user_id, amount, status, transaction_id, paid_at, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [request.withdrawalId, request.userId, request.amount, 'success', result.transactionId, result.paidAt]
    );
  }

  // 记录失败日志
  private async logPayoutFailure(request: PayoutRequest, reason: string): Promise<void> {
    await this.db.query(
      `INSERT INTO payout_logs 
       (withdrawal_id, user_id, amount, status, reason, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [request.withdrawalId, request.userId, request.amount, 'failed', reason]
    );
  }

  // 批量打款 (用于财务手动处理)
  async batchPayout(withdrawalIds: string[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const withdrawalId of withdrawalIds) {
      const withdrawal = await this.getWithdrawal(withdrawalId);
      if (!withdrawal) continue;

      const request: PayoutRequest = {
        withdrawalId,
        userId: withdrawal.user_id,
        amount: withdrawal.amount,
        bankName: withdrawal.bank_name,
        bankAccount: withdrawal.bank_account,
      };

      const result = await this.executePayout(request);
      if (result.success) {
        success++;
      } else {
        failed++;
      }
    }

    return { success, failed };
  }

  // 获取待打款列表
  async getPendingPayouts(limit: number = 50): Promise<any[]> {
    const result = await this.db.query(
      `SELECT * FROM withdrawals WHERE status = 'approved' ORDER BY approved_at ASC LIMIT $1`,
      [limit]
    );
    return result.rows;
  }

  // 撤销打款 (打款失败时)
  async reversePayout(withdrawalId: string, reason: string): Promise<boolean> {
    const client = await this.db.getClient();
    try {
      await client.query('BEGIN');

      // 恢复冻结余额
      const withdrawal = await this.getWithdrawal(withdrawalId);
      await client.query(
        `UPDATE user_balances SET frozen_balance = frozen_balance + $1 WHERE user_id = $2`,
        [withdrawal.amount, withdrawal.user_id]
      );

      // 更新提现状态为失败
      await client.query(
        `UPDATE withdrawals SET status = 'rejected', rejected_reason = $1 WHERE id = $2`,
        [reason, withdrawalId]
      );

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export const withdrawalPayoutService = WithdrawalPayoutService.getInstance();
