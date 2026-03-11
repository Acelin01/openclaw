/**
 * 计费结算服务
 * 支持：余额管理、实时扣费、账单生成、收益结算、提现处理
 */

import { DatabaseService } from '../lib/db/service.js';
import { EventEmitter } from 'events';

export interface BillingRecord {
  id: string;
  userId: string;
  orderId: string;
  type: 'charge' | 'deduction' | 'income' | 'withdrawal' | 'refund';
  amount: number;
  balance: number;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface UserBalance {
  userId: string;
  balance: number;
  frozenBalance: number;
  totalIncome: number;
  totalExpense: number;
  totalRecharge: number;
  totalWithdrawal: number;
  updatedAt: Date;
}

export interface BillingStats {
  currentBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  pendingWithdrawal: number;
  couponCount: number;
  couponTotalValue: number;
}

export interface DeductionRecord {
  id: string;
  time: string;
  orderId: string;
  server: string;
  type: string;
  duration: string;
  amount: number;
  balance: number;
  status: 'success' | 'charge' | 'warn' | 'pending';
}

export interface EarningsRecord {
  id: string;
  orderId: string;
  acceptTime: string;
  serviceFee: number;
  actualAmount: number;
  status: 'settled' | 'pending';
}

export interface WithdrawalRecord {
  id: string;
  userId: string;
  amount: number;
  bankName: string;
  bankAccount: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requestedAt: Date;
  processedAt?: Date;
  rejectedReason?: string;
}

export interface AutoRechargeConfig {
  userId: string;
  enabled: boolean;
  threshold: number;
  rechargeAmount: number;
  paymentMethod: 'alipay' | 'wechat' | 'bank';
}

export interface Coupon {
  id: string;
  userId: string;
  amount: number;
  name: string;
  condition: number;
  expiryDate: Date;
  used: boolean;
  usedAt?: Date;
}

export class BillingService extends EventEmitter {
  private static instance: BillingService;
  private db: DatabaseService;
  private activeTimers: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {
    super();
    this.db = DatabaseService.getInstance();
  }

  static getInstance(): BillingService {
    if (!BillingService.instance) {
      BillingService.instance = new BillingService();
    }
    return BillingService.instance;
  }

  // ════════════════════════════════════════
  // 余额管理
  // ════════════════════════════════════════

  async getBalance(userId: string): Promise<UserBalance | null> {
    try {
      const result = await this.db.query(
        'SELECT * FROM user_balances WHERE user_id = $1',
        [userId]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching balance:', error);
      return null;
    }
  }

  async updateBalance(userId: string, amount: number, type: 'add' | 'subtract'): Promise<UserBalance | null> {
    const client = await this.db.getClient();
    try {
      await client.query('BEGIN');
      
      const balanceResult = await client.query(
        'SELECT * FROM user_balances WHERE user_id = $1 FOR UPDATE',
        [userId]
      );

      let balance: UserBalance;
      if (balanceResult.rows.length === 0) {
        // Create new balance record
        const insertResult = await client.query(
          `INSERT INTO user_balances (user_id, balance, frozen_balance, total_income, total_expense, total_recharge, total_withdrawal, updated_at)
           VALUES ($1, $2, 0, 0, 0, $3, 0, NOW()) RETURNING *`,
          [userId, type === 'add' ? amount : 0, type === 'add' ? amount : 0]
        );
        balance = insertResult.rows[0];
      } else {
        balance = balanceResult.rows[0];
        const newBalance = type === 'add' ? balance.balance + amount : balance.balance - amount;
        
        const updateResult = await client.query(
          `UPDATE user_balances 
           SET balance = $1, 
               total_${type === 'add' ? 'recharge' : 'expense'} = total_${type === 'add' ? 'recharge' : 'expense'} + $2,
               updated_at = NOW()
           WHERE user_id = $3 RETURNING *`,
          [newBalance, Math.abs(amount), userId]
        );
        balance = updateResult.rows[0];
      }

      // Record transaction
      await client.query(
        `INSERT INTO billing_records (user_id, type, amount, balance, description, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [userId, type === 'add' ? 'charge' : 'deduction', amount, balance.balance, `${type === 'add' ? '充值' : '扣费'} ¥${amount}`]
      );

      await client.query('COMMIT');
      this.emit('balance:updated', { userId, balance: balance.balance, type });
      return balance;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating balance:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // ════════════════════════════════════════
  // 实时扣费
  // ════════════════════════════════════════

  startBillingTimer(orderId: string, userId: string, ratePerHour: number, intervalSeconds: number = 6): void {
    this.stopBillingTimer(orderId);
    
    const ratePerInterval = (ratePerHour / 3600) * intervalSeconds;
    let totalCost = 0;
    let elapsedSeconds = 0;

    const timer = setInterval(async () => {
      elapsedSeconds += intervalSeconds;
      totalCost += ratePerInterval;

      try {
        const balance = await this.getBalance(userId);
        if (!balance || balance.balance < totalCost) {
          this.emit('billing:low_balance', { orderId, userId, currentBalance: balance?.balance || 0, required: totalCost });
          this.stopBillingTimer(orderId);
          return;
        }

        await this.updateBalance(userId, ratePerInterval, 'subtract');
        
        this.emit('billing:tick', {
          orderId,
          userId,
          elapsedSeconds,
          currentCost: totalCost,
          ratePerInterval,
          balance: balance.balance - totalCost
        });
      } catch (error) {
        console.error('Billing timer error:', error);
        this.emit('billing:error', { orderId, userId, error });
      }
    }, intervalSeconds * 1000);

    this.activeTimers.set(orderId, timer);
    this.emit('billing:started', { orderId, userId, ratePerHour, intervalSeconds });
  }

  stopBillingTimer(orderId: string): void {
    const timer = this.activeTimers.get(orderId);
    if (timer) {
      clearInterval(timer);
      this.activeTimers.delete(orderId);
      this.emit('billing:stopped', { orderId });
    }
  }

  getBillingStatus(orderId: string): { running: boolean; elapsedSeconds?: number } {
    const running = this.activeTimers.has(orderId);
    return { running };
  }

  // ════════════════════════════════════════
  // 账单查询
  // ════════════════════════════════════════

  async getBillingRecords(userId: string, options: {
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
    type?: string;
  } = {}): Promise<BillingRecord[]> {
    const { limit = 50, offset = 0, startDate, endDate, type } = options;
    
    let whereClause = 'WHERE user_id = $1';
    const params: any[] = [userId];
    let paramIndex = 2;

    if (startDate) {
      whereClause += ` AND created_at >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      whereClause += ` AND created_at <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    if (type) {
      whereClause += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    const result = await this.db.query(
      `SELECT * FROM billing_records ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return result.rows;
  }

  async getBillingStats(userId: string): Promise<BillingStats> {
    const balance = await this.getBalance(userId);
    
    // Get monthly income and expense
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthlyResult = await this.db.query(
      `SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as monthly_income,
        SUM(CASE WHEN type = 'deduction' OR type = 'charge' THEN amount ELSE 0 END) as monthly_expense
       FROM billing_records
       WHERE user_id = $1 AND created_at >= $2`,
      [userId, startOfMonth]
    );

    // Get pending withdrawal
    const withdrawalResult = await this.db.query(
      `SELECT COALESCE(SUM(amount), 0) as pending_withdrawal
       FROM withdrawals
       WHERE user_id = $1 AND status IN ('pending', 'processing')`,
      [userId]
    );

    // Get coupons
    const couponResult = await this.db.query(
      `SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total_value
       FROM coupons
       WHERE user_id = $1 AND used = false AND expiry_date > NOW()`,
      [userId]
    );

    return {
      currentBalance: balance?.balance || 0,
      monthlyIncome: parseFloat(monthlyResult.rows[0]?.monthly_income || 0),
      monthlyExpense: parseFloat(monthlyResult.rows[0]?.monthly_expense || 0),
      pendingWithdrawal: parseFloat(withdrawalResult.rows[0]?.pending_withdrawal || 0),
      couponCount: parseInt(couponResult.rows[0]?.count || 0),
      couponTotalValue: parseFloat(couponResult.rows[0]?.total_value || 0)
    };
  }

  // ════════════════════════════════════════
  // 收益管理
  // ════════════════════════════════════════

  async addEarnings(userId: string, orderId: string, serviceFee: number, platformRate: number = 0.12): Promise<void> {
    const platformFee = serviceFee * platformRate;
    const actualAmount = serviceFee - platformFee;
    
    const client = await this.db.getClient();
    try {
      await client.query('BEGIN');
      
      // Record earnings
      await client.query(
        `INSERT INTO earnings (user_id, order_id, service_fee, platform_fee, actual_amount, status, created_at)
         VALUES ($1, $2, $3, $4, $5, 'pending', NOW())`,
        [userId, orderId, serviceFee, platformFee, actualAmount]
      );

      await client.query('COMMIT');
      this.emit('earnings:added', { userId, orderId, serviceFee, actualAmount });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async settleEarnings(userId: string, earningsId: string): Promise<void> {
    const client = await this.db.getClient();
    try {
      await client.query('BEGIN');
      
      // Get earnings record
      const result = await client.query(
        'SELECT * FROM earnings WHERE id = $1 AND user_id = $2',
        [earningsId, userId]
      );
      
      if (result.rows.length === 0) {
        throw new Error('Earnings record not found');
      }

      const earnings = result.rows[0];
      
      // Update earnings status
      await client.query(
        `UPDATE earnings SET status = 'settled', settled_at = NOW() WHERE id = $1`,
        [earningsId]
      );

      // Add to user balance
      await this.updateBalance(userId, earnings.actual_amount, 'add');

      await client.query('COMMIT');
      this.emit('earnings:settled', { userId, earningsId, amount: earnings.actual_amount });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getEarningsRecords(userId: string, limit: number = 50): Promise<EarningsRecord[]> {
    const result = await this.db.query(
      `SELECT e.*, o.accept_time 
       FROM earnings e
       LEFT JOIN orders o ON e.order_id = o.id
       WHERE e.user_id = $1
       ORDER BY e.created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows.map(row => ({
      id: row.id,
      orderId: row.order_id,
      acceptTime: row.accept_time ? new Date(row.accept_time).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-',
      serviceFee: parseFloat(row.service_fee),
      actualAmount: row.status === 'settled' ? parseFloat(row.actual_amount) : 0,
      status: row.status
    }));
  }

  // ════════════════════════════════════════
  // 提现管理
  // ════════════════════════════════════════

  async requestWithdrawal(userId: string, amount: number, bankName: string, bankAccount: string): Promise<WithdrawalRecord> {
    const balance = await this.getBalance(userId);
    
    if (!balance || balance.balance < amount) {
      throw new Error('Insufficient balance');
    }

    if (amount < 100) {
      throw new Error('Minimum withdrawal amount is ¥100');
    }

    if (amount > 50000) {
      throw new Error('Maximum withdrawal amount is ¥50,000');
    }

    const client = await this.db.getClient();
    try {
      await client.query('BEGIN');
      
      // Freeze the amount
      await client.query(
        `UPDATE user_balances SET frozen_balance = frozen_balance + $1, balance = balance - $1 WHERE user_id = $2`,
        [amount, userId]
      );

      // Create withdrawal request
      const result = await client.query(
        `INSERT INTO withdrawals (user_id, amount, bank_name, bank_account, status, requested_at)
         VALUES ($1, $2, $3, $4, 'pending', NOW()) RETURNING *`,
        [userId, amount, bankName, bankAccount]
      );

      await client.query('COMMIT');
      this.emit('withdrawal:requested', { userId, amount, bankName });
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getWithdrawalRecords(userId: string, limit: number = 50): Promise<WithdrawalRecord[]> {
    const result = await this.db.query(
      `SELECT * FROM withdrawals WHERE user_id = $1 ORDER BY requested_at DESC LIMIT $2`,
      [userId, limit]
    );

    return result.rows;
  }

  // ════════════════════════════════════════
  // 自动充值配置
  // ════════════════════════════════════════

  async getAutoRechargeConfig(userId: string): Promise<AutoRechargeConfig | null> {
    const result = await this.db.query(
      'SELECT * FROM auto_recharge_configs WHERE user_id = $1',
      [userId]
    );
    return result.rows[0] || null;
  }

  async updateAutoRechargeConfig(userId: string, config: Partial<AutoRechargeConfig>): Promise<AutoRechargeConfig> {
    const existing = await this.getAutoRechargeConfig(userId);
    
    if (existing) {
      const result = await this.db.query(
        `UPDATE auto_recharge_configs 
         SET enabled = $1, threshold = $2, recharge_amount = $3, payment_method = $4, updated_at = NOW()
         WHERE user_id = $5 RETURNING *`,
        [config.enabled ?? existing.enabled, config.threshold ?? existing.threshold, config.rechargeAmount ?? existing.rechargeAmount, config.paymentMethod ?? existing.paymentMethod, userId]
      );
      return result.rows[0];
    } else {
      const result = await this.db.query(
        `INSERT INTO auto_recharge_configs (user_id, enabled, threshold, recharge_amount, payment_method, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *`,
        [userId, config.enabled ?? false, config.threshold ?? 100, config.rechargeAmount ?? 300, config.paymentMethod ?? 'alipay']
      );
      return result.rows[0];
    }
  }

  // ════════════════════════════════════════
  // 优惠券管理
  // ════════════════════════════════════════

  async getCoupons(userId: string): Promise<Coupon[]> {
    const result = await this.db.query(
      `SELECT * FROM coupons WHERE user_id = $1 ORDER BY used, expiry_date`,
      [userId]
    );
    return result.rows;
  }

  async useCoupon(couponId: string, userId: string): Promise<void> {
    await this.db.query(
      `UPDATE coupons SET used = true, used_at = NOW() WHERE id = $1 AND user_id = $2`,
      [couponId, userId]
    );
  }

  async addCoupon(userId: string, code: string): Promise<Coupon | null> {
    const result = await this.db.query(
      `SELECT * FROM coupon_codes WHERE code = $1 AND used = false AND expiry_date > NOW()`,
      [code]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const couponCode = result.rows[0];
    
    const client = await this.db.getClient();
    try {
      await client.query('BEGIN');
      
      // Mark code as used
      await client.query(
        `UPDATE coupon_codes SET used = true, used_by = $1, used_at = NOW() WHERE id = $2`,
        [userId, couponCode.id]
      );

      // Add coupon to user
      const couponResult = await client.query(
        `INSERT INTO coupons (user_id, amount, name, condition_amount, expiry_date, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
        [userId, couponCode.amount, couponCode.name, couponCode.condition_amount, couponCode.expiry_date]
      );

      await client.query('COMMIT');
      return couponResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export const billingService = BillingService.getInstance();
