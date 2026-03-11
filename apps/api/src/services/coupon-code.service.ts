/**
 * 优惠券码生成服务
 * 支持批量生成、自定义规则、有效期管理
 */

import { DatabaseService } from '../lib/db/service.js';
import { randomBytes } from 'crypto';

export interface CouponCodeConfig {
  prefix?: string;      // 前缀，如 "WELCOME"
  suffix?: string;      // 后缀，如 "2026"
  length?: number;      // 随机部分长度 (默认 8)
  amount: number;       // 券面金额
  conditionAmount: number; // 使用门槛
  expiryDate: Date;     // 有效期
  total: number;        // 生成数量
  name?: string;        // 优惠券名称
  description?: string; // 描述
}

export interface CouponCode {
  id: string;
  code: string;
  amount: number;
  conditionAmount: number;
  expiryDate: Date;
  used: boolean;
  usedBy?: string;
  usedAt?: Date;
  createdAt: Date;
}

export class CouponCodeService {
  private static instance: CouponCodeService;
  private db: DatabaseService;

  private constructor() {
    this.db = DatabaseService.getInstance();
  }

  static getInstance(): CouponCodeService {
    if (!CouponCodeService.instance) {
      CouponCodeService.instance = new CouponCodeService();
    }
    return CouponCodeService.instance;
  }

  // 批量生成优惠券码
  async generateCodes(config: CouponCodeConfig): Promise<string[]> {
    const codes: string[] = [];
    const insertedCodes: Array<{ code: string; data: any }> = [];

    for (let i = 0; i < config.total; i++) {
      const code = this.generateSingleCode(config);
      codes.push(code);

      insertedCodes.push({
        code,
        data: {
          amount: config.amount,
          conditionAmount: config.conditionAmount,
          expiryDate: config.expiryDate,
          name: config.name,
          description: config.description,
        },
      });
    }

    // 批量插入数据库
    await this.batchInsertCodes(insertedCodes);

    console.log(`[Coupon] 生成${config.total}张优惠券码`);
    return codes;
  }

  // 生成单个优惠券码
  private generateSingleCode(config: CouponCodeConfig): string {
    const randomLength = config.length || 8;
    const randomPart = this.generateRandomString(randomLength);
    
    const parts: string[] = [];
    
    if (config.prefix) {
      parts.push(config.prefix.toUpperCase());
    }
    
    parts.push(randomPart);
    
    if (config.suffix) {
      parts.push(config.suffix.toUpperCase());
    }

    return parts.join('-');
  }

  // 生成随机字符串
  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 排除易混淆字符
    const randomBytes = randomBytes(length);
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars[randomBytes[i] % chars.length];
    }
    
    return result;
  }

  // 批量插入数据库
  private async batchInsertCodes(codes: Array<{ code: string; data: any }>): Promise<void> {
    const client = await this.db.getClient();
    
    try {
      await client.query('BEGIN');

      for (const { code, data } of codes) {
        const id = `coupon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        await client.query(
          `INSERT INTO coupon_codes 
           (id, code, amount, condition_amount, expiry_date, name, description, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
          [
            id,
            code,
            data.amount,
            data.conditionAmount,
            data.expiryDate,
            data.name,
            data.description,
          ]
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // 验证优惠券码
  async validateCode(code: string, userId: string): Promise<{ valid: boolean; coupon?: any; error?: string }> {
    const coupon = await this.getCouponByCode(code);

    if (!coupon) {
      return { valid: false, error: '优惠券码不存在' };
    }

    if (coupon.used) {
      return { valid: false, error: '优惠券码已使用' };
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      return { valid: false, error: '优惠券码已过期' };
    }

    // 检查用户是否已使用过同类型优惠券
    const userUsage = await this.getUserUsage(userId, coupon.amount);
    if (userUsage > 0) {
      return { valid: false, error: '您已使用过此类优惠券' };
    }

    return { valid: true, coupon };
  }

  // 使用优惠券码
  async useCode(code: string, userId: string): Promise<boolean> {
    const validation = await this.validateCode(code, userId);
    
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    await this.db.query(
      `UPDATE coupon_codes 
       SET used = true, used_by = $1, used_at = NOW()
       WHERE code = $2`,
      [userId, code]
    );

    // 添加到用户优惠券列表
    await this.addToUserCoupons(userId, validation.coupon);

    return true;
  }

  // 添加到用户优惠券
  private async addToUserCoupons(userId: string, coupon: any): Promise<void> {
    const id = `user-coupon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    await this.db.query(
      `INSERT INTO coupons 
       (id, user_id, amount, condition_amount, expiry_date, name, description, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [
        id,
        userId,
        coupon.amount,
        coupon.condition_amount,
        coupon.expiry_date,
        coupon.name,
        coupon.description,
      ]
    );
  }

  // 获取优惠券码
  private async getCouponByCode(code: string): Promise<any> {
    const result = await this.db.query(
      `SELECT * FROM coupon_codes WHERE code = $1`,
      [code]
    );
    return result.rows[0];
  }

  // 获取用户已使用某金额优惠券的次数
  private async getUserUsage(userId: string, amount: number): Promise<number> {
    const result = await this.db.query(
      `SELECT COUNT(*) as count FROM coupons 
       WHERE user_id = $1 AND amount = $2 AND used = true`,
      [userId, amount]
    );
    return parseInt(result.rows[0].count);
  }

  // 获取未使用的优惠券码
  async getAvailableCodes(limit: number = 100): Promise<CouponCode[]> {
    const result = await this.db.query(
      `SELECT * FROM coupon_codes 
       WHERE used = false AND expiry_date > NOW() 
       ORDER BY created_at DESC 
       LIMIT $1`,
      [limit]
    );
    return result.rows.map(row => this.mapToCouponCode(row));
  }

  // 获取已过期的优惠券码
  async getExpiredCodes(limit: number = 100): Promise<CouponCode[]> {
    const result = await this.db.query(
      `SELECT * FROM coupon_codes 
       WHERE expiry_date < NOW() 
       ORDER BY expiry_date ASC 
       LIMIT $1`,
      [limit]
    );
    return result.rows.map(row => this.mapToCouponCode(row));
  }

  // 获取已使用的优惠券码
  async getUsedCodes(limit: number = 100): Promise<CouponCode[]> {
    const result = await this.db.query(
      `SELECT * FROM coupon_codes 
       WHERE used = true 
       ORDER BY used_at DESC 
       LIMIT $1`,
      [limit]
    );
    return result.rows.map(row => this.mapToCouponCode(row));
  }

  // 获取优惠券统计
  async getStats(): Promise<any> {
    const result = await this.db.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN used = false AND expiry_date > NOW() THEN 1 END) as available,
        COUNT(CASE WHEN used = true THEN 1 END) as used,
        COUNT(CASE WHEN expiry_date < NOW() THEN 1 END) as expired,
        SUM(amount) as total_amount,
        SUM(CASE WHEN used = true THEN amount ELSE 0 END) as used_amount
       FROM coupon_codes`
    );
    return result.rows[0];
  }

  // 映射数据库记录
  private mapToCouponCode(row: any): CouponCode {
    return {
      id: row.id,
      code: row.code,
      amount: parseFloat(row.amount),
      conditionAmount: parseFloat(row.condition_amount),
      expiryDate: row.expiry_date,
      used: row.used,
      usedBy: row.used_by,
      usedAt: row.used_at,
      createdAt: row.created_at,
    };
  }

  // 删除优惠券码
  async deleteCode(code: string): Promise<boolean> {
    const result = await this.db.query(
      `DELETE FROM coupon_codes WHERE code = $1`,
      [code]
    );
    return result.rowCount > 0;
  }

  // 批量删除过期优惠券码
  async deleteExpiredCodes(): Promise<number> {
    const result = await this.db.query(
      `DELETE FROM coupon_codes WHERE expiry_date < NOW()`
    );
    return result.rowCount || 0;
  }
}

export const couponCodeService = CouponCodeService.getInstance();
