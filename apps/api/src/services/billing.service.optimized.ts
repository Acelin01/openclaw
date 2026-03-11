/**
 * 计费结算服务 - 优化版
 * 新增：扣费上限保护、并发锁、慢查询日志、性能监控
 */

import { DatabaseService } from '../lib/db/service.js';
import { EventEmitter } from 'events';

// 并发锁 Map
const billingLocks = new Map<string, boolean>();
const LOCK_TIMEOUT = 5000; // 5 秒超时

// 性能监控
interface PerformanceMetrics {
  queryCount: number;
  slowQueries: number;
  avgQueryTime: number;
  lastQueryTime: number;
}

const metrics: PerformanceMetrics = {
  queryCount: 0,
  slowQueries: 0,
  avgQueryTime: 0,
  lastQueryTime: 0,
};

const SLOW_QUERY_THRESHOLD = 100; // 100ms 视为慢查询

export class BillingServiceOptimized extends EventEmitter {
  private static instance: BillingServiceOptimized;
  private db: DatabaseService;
  private activeTimers: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {
    super();
    this.db = DatabaseService.getInstance();
  }

  static getInstance(): BillingServiceOptimized {
    if (!BillingServiceOptimized.instance) {
      BillingServiceOptimized.instance = new BillingServiceOptimized();
    }
    return BillingServiceOptimized.instance;
  }

  // ════════════════════════════════════════
  // 性能监控装饰器
  // ════════════════════════════════════════

  private async monitoredQuery<T>(
    query: string,
    params: any[],
    operation: string
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      const result = await this.db.query(query, params);
      
      const queryTime = Date.now() - startTime;
      metrics.queryCount++;
      metrics.lastQueryTime = queryTime;
      metrics.avgQueryTime = (metrics.avgQueryTime * (metrics.queryCount - 1) + queryTime) / metrics.queryCount;
      
      // 慢查询日志
      if (queryTime > SLOW_QUERY_THRESHOLD) {
        metrics.slowQueries++;
        console.warn(`[SlowQuery] ${operation}: ${queryTime}ms - ${query.substring(0, 100)}...`);
        
        // 性能告警
        if (queryTime > 1000) {
          console.error(`[PerformanceAlert] 严重慢查询：${queryTime}ms - ${operation}`);
          this.emit('performance:alert', {
            type: 'slow_query',
            queryTime,
            operation,
            query: query.substring(0, 200)
          });
        }
      }
      
      return result as T;
    } catch (error) {
      const queryTime = Date.now() - startTime;
      console.error(`[QueryError] ${operation}: ${queryTime}ms - ${error}`);
      throw error;
    }
  }

  // ════════════════════════════════════════
  // 并发锁机制
  // ════════════════════════════════════════

  private async acquireLock(key: string): Promise<boolean> {
    const existingLock = billingLocks.get(key);
    if (existingLock) {
      console.warn(`[Lock] 获取锁失败：${key} (已被占用)`);
      return false;
    }
    
    billingLocks.set(key, true);
    
    // 自动释放锁 (防止死锁)
    setTimeout(() => {
      billingLocks.delete(key);
    }, LOCK_TIMEOUT);
    
    return true;
  }

  private releaseLock(key: string): void {
    billingLocks.delete(key);
  }

  // ════════════════════════════════════════
  // 余额管理 (带并发锁)
  // ════════════════════════════════════════

  async updateBalance(userId: string, amount: number, type: 'add' | 'subtract'): Promise<any> {
    const lockKey = `balance:${userId}`;
    
    // 获取并发锁
    const acquired = await this.acquireLock(lockKey);
    if (!acquired) {
      throw new Error('获取锁失败，请稍后重试');
    }

    try {
      const client = await this.db.getClient();
      try {
        await client.query('BEGIN');
        
        const balanceResult = await client.query(
          'SELECT * FROM user_balances WHERE user_id = $1 FOR UPDATE',
          [userId]
        );

        let balance: any;
        if (balanceResult.rows.length === 0) {
          const insertResult = await client.query(
            `INSERT INTO user_balances (user_id, balance, frozen_balance, total_income, total_expense, total_recharge, total_withdrawal, updated_at)
             VALUES ($1, $2, 0, 0, 0, $3, 0, NOW()) RETURNING *`,
            [userId, type === 'add' ? amount : 0, type === 'add' ? amount : 0]
          );
          balance = insertResult.rows[0];
        } else {
          balance = balanceResult.rows[0];
          const newBalance = type === 'add' ? balance.balance + amount : balance.balance - amount;
          
          // ════════════════════════════════════════
          // 扣费上限保护 (防止余额负数)
          // ════════════════════════════════════════
          if (type === 'subtract' && newBalance < 0) {
            await client.query('ROLLBACK');
            const error = new Error(`余额不足：当前 ¥${balance.balance}, 需要 ¥${amount}`);
            this.emit('billing:insufficient_balance', { userId, currentBalance: balance.balance, required: amount });
            throw error;
          }
          
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

        await client.query('COMMIT');
        this.emit('balance:updated', { userId, balance: balance.balance, type });
        return balance;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } finally {
      this.releaseLock(lockKey);
    }
  }

  // ════════════════════════════════════════
  // 实时扣费 (带余额检查和并发保护)
  // ════════════════════════════════════════

  startBillingTimer(orderId: string, userId: string, ratePerHour: number, intervalSeconds: number = 6): void {
    this.stopBillingTimer(orderId);
    
    const ratePerInterval = (ratePerHour / 3600) * intervalSeconds;
    let totalCost = 0;
    let elapsedSeconds = 0;
    let consecutiveFailures = 0;
    const MAX_FAILURES = 3; // 最大失败次数

    const timer = setInterval(async () => {
      elapsedSeconds += intervalSeconds;
      totalCost += ratePerInterval;

      try {
        // 获取当前余额
        const balanceResult = await this.monitoredQuery<any>(
          'SELECT balance FROM user_balances WHERE user_id = $1',
          [userId],
          'balance_check'
        );

        if (!balanceResult.rows[0] || balanceResult.rows[0].balance < ratePerInterval) {
          this.emit('billing:low_balance', { 
            orderId, 
            userId, 
            currentBalance: balanceResult.rows[0]?.balance || 0, 
            required: ratePerInterval 
          });
          this.stopBillingTimer(orderId);
          return;
        }

        // 扣费 (带并发锁)
        await this.updateBalance(userId, ratePerInterval, 'subtract');
        consecutiveFailures = 0; // 重置失败计数
        
        this.emit('billing:tick', {
          orderId,
          userId,
          elapsedSeconds,
          currentCost: totalCost,
          ratePerInterval,
          balance: balanceResult.rows[0].balance - ratePerInterval
        });
      } catch (error: any) {
        consecutiveFailures++;
        console.error(`[BillingError] 扣费失败 (${consecutiveFailures}/${MAX_FAILURES}):`, error.message);
        
        if (consecutiveFailures >= MAX_FAILURES) {
          console.error(`[BillingError] 连续失败 ${MAX_FAILURES} 次，停止计费`);
          this.emit('billing:error', { orderId, userId, error: error.message, consecutiveFailures });
          this.stopBillingTimer(orderId);
        }
      }
    }, intervalSeconds * 1000);

    this.activeTimers.set(orderId, timer);
    this.emit('billing:started', { orderId, userId, ratePerHour, intervalSeconds });
  }

  // ════════════════════════════════════════
  // 性能监控 API
  // ════════════════════════════════════════

  getPerformanceMetrics(): PerformanceMetrics {
    return { ...metrics };
  }

  resetMetrics(): void {
    metrics.queryCount = 0;
    metrics.slowQueries = 0;
    metrics.avgQueryTime = 0;
    metrics.lastQueryTime = 0;
  }

  getActiveLocks(): string[] {
    return Array.from(billingLocks.keys());
  }

  // ════════════════════════════════════════
  // 其他方法 (简化，使用父类实现)
  // ════════════════════════════════════════

  stopBillingTimer(orderId: string): void {
    const timer = this.activeTimers.get(orderId);
    if (timer) {
      clearInterval(timer);
      this.activeTimers.delete(orderId);
      this.emit('billing:stopped', { orderId });
    }
  }

  async getBalance(userId: string): Promise<any> {
    const result = await this.monitoredQuery<any>(
      'SELECT * FROM user_balances WHERE user_id = $1',
      [userId],
      'get_balance'
    );
    return result.rows[0] || null;
  }
}

export const billingServiceOptimized = BillingServiceOptimized.getInstance();
