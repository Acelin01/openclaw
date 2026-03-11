/**
 * 自动充值服务
 * 实现余额低于阈值时自动扣款充值
 */

import { DatabaseService } from '../lib/db/service.js';
import { paymentService } from './payment-channels.js';
import { billingService } from './billing.service.js';

export interface AutoRechargeConfig {
  userId: string;
  enabled: boolean;
  threshold: number;
  rechargeAmount: number;
  paymentMethod: 'alipay' | 'wechat' | 'bank';
  paymentToken?: string;
}

export interface AutoRechargeLog {
  id: string;
  userId: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  reason?: string;
  createdAt: Date;
}

export class AutoRechargeService {
  private static instance: AutoRechargeService;
  private db: DatabaseService;
  private checkInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.db = DatabaseService.getInstance();
  }

  static getInstance(): AutoRechargeService {
    if (!AutoRechargeService.instance) {
      AutoRechargeService.instance = new AutoRechargeService();
    }
    return AutoRechargeService.instance;
  }

  // 启动自动检查 (每 5 分钟检查一次)
  startAutoCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(async () => {
      await this.checkAllUsers();
    }, 5 * 60 * 1000);

    console.log('[AutoRecharge] 自动检查已启动 (每 5 分钟)');
  }

  stopAutoCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // 检查所有用户的余额
  private async checkAllUsers(): Promise<void> {
    try {
      const configs = await this.getAllEnabledConfigs();
      
      for (const config of configs) {
        await this.checkUserBalance(config);
      }
    } catch (error) {
      console.error('[AutoRecharge] 检查失败:', error);
    }
  }

  // 检查单个用户余额
  private async checkUserBalance(config: AutoRechargeConfig): Promise<void> {
    const balance = await billingService.getBalance(config.userId);
    
    if (!balance || balance.balance >= config.threshold) {
      return;
    }

    console.log(`[AutoRecharge] 用户 ${config.userId} 余额不足，触发自动充值`);

    // 执行自动充值
    await this.executeAutoRecharge(config, balance.balance);
  }

  // 执行自动充值
  private async executeAutoRecharge(config: AutoRechargeConfig, currentBalance: number): Promise<void> {
    const logId = `ar-${Date.now()}-${config.userId}`;
    
    try {
      // 记录充值日志
      await this.logRecharge(logId, config.userId, config.rechargeAmount, 'pending');

      // 检查是否有支付授权
      if (!config.paymentToken) {
        throw new Error('用户未授权自动扣款');
      }

      // 调用支付服务扣款
      const paymentResult = await paymentService.executeAutoPayment(
        config.userId,
        config.rechargeAmount,
        config.paymentMethod,
        config.paymentToken
      );

      if (!paymentResult.success) {
        throw new Error(paymentResult.message || '扣款失败');
      }

      // 更新余额
      await billingService.updateBalance(config.userId, config.rechargeAmount, 'add');

      // 更新日志
      await this.logRecharge(logId, config.userId, config.rechargeAmount, 'success');

      console.log(`[AutoRecharge] 用户 ${config.userId} 自动充值成功 ¥${config.rechargeAmount}`);

      // 发送通知
      await this.sendNotification(config.userId, {
        type: 'auto_recharge_success',
        amount: config.rechargeAmount,
        newBalance: currentBalance + config.rechargeAmount,
      });

    } catch (error: any) {
      console.error(`[AutoRecharge] 用户 ${config.userId} 自动充值失败:`, error.message);
      
      // 记录失败
      await this.logRecharge(logId, config.userId, config.rechargeAmount, 'failed', error.message);

      // 发送通知
      await this.sendNotification(config.userId, {
        type: 'auto_recharge_failed',
        amount: config.rechargeAmount,
        reason: error.message,
      });
    }
  }

  // 获取所有启用的配置
  private async getAllEnabledConfigs(): Promise<AutoRechargeConfig[]> {
    const result = await this.db.query(
      `SELECT * FROM auto_recharge_configs WHERE enabled = true`
    );
    return result.rows;
  }

  // 记录充值日志
  private async logRecharge(
    id: string,
    userId: string,
    amount: number,
    status: 'pending' | 'success' | 'failed',
    reason?: string
  ): Promise<void> {
    await this.db.query(
      `INSERT INTO auto_recharge_logs (id, user_id, amount, status, reason, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [id, userId, amount, status, reason]
    );
  }

  // 发送通知
  private async sendNotification(userId: string, data: any): Promise<void> {
    // TODO: 集成通知服务
    console.log('[AutoRecharge] 发送通知:', userId, data);
  }

  // 获取用户的自动充值配置
  async getUserConfig(userId: string): Promise<AutoRechargeConfig | null> {
    const result = await this.db.query(
      `SELECT * FROM auto_recharge_configs WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0] || null;
  }

  // 更新用户配置
  async updateConfig(userId: string, config: Partial<AutoRechargeConfig>): Promise<AutoRechargeConfig> {
    const existing = await this.getUserConfig(userId);

    if (existing) {
      const result = await this.db.query(
        `UPDATE auto_recharge_configs 
         SET enabled = $1, threshold = $2, recharge_amount = $3, payment_method = $4, payment_token = $5, updated_at = NOW()
         WHERE user_id = $6 RETURNING *`,
        [
          config.enabled ?? existing.enabled,
          config.threshold ?? existing.threshold,
          config.rechargeAmount ?? existing.rechargeAmount,
          config.paymentMethod ?? existing.paymentMethod,
          config.paymentToken ?? existing.paymentToken,
          userId,
        ]
      );
      return result.rows[0];
    } else {
      const result = await this.db.query(
        `INSERT INTO auto_recharge_configs 
         (user_id, enabled, threshold, recharge_amount, payment_method, payment_token, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *`,
        [
          userId,
          config.enabled ?? false,
          config.threshold ?? 100,
          config.rechargeAmount ?? 300,
          config.paymentMethod ?? 'alipay',
          config.paymentToken,
        ]
      );
      return result.rows[0];
    }
  }

  // 获取充值日志
  async getRechargeLogs(userId: string, limit: number = 20): Promise<AutoRechargeLog[]> {
    const result = await this.db.query(
      `SELECT * FROM auto_recharge_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }
}

export const autoRechargeService = AutoRechargeService.getInstance();
