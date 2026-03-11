/**
 * 营销系统服务
 * 支持限时折扣、满减活动、推荐奖励、邀请好友等营销功能
 */

import { DatabaseService } from '../lib/db/service.js';

export type CampaignType = 'discount' | 'full_reduction' | 'referral' | 'coupon' | 'flash_sale';
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'ended';

export interface MarketingCampaign {
  id: string;
  name: string;
  type: CampaignType;
  description: string;
  rules: any;
  startDate: Date;
  endDate: Date;
  budget?: number;
  usedBudget?: number;
  status: CampaignStatus;
  createdAt: Date;
}

export interface ReferralReward {
  id: string;
  referrerId: string;
  refereeId: string;
  rewardAmount: number;
  status: 'pending' | 'completed' | 'expired';
  createdAt: Date;
}

export class MarketingService {
  private static instance: MarketingService;
  private db: DatabaseService;

  private constructor() {
    this.db = DatabaseService.getInstance();
  }

  static getInstance(): MarketingService {
    if (!MarketingService.instance) {
      MarketingService.instance = new MarketingService();
    }
    return MarketingService.instance;
  }

  // ===== 营销活动管理 =====

  // 创建营销活动
  async createCampaign(data: {
    name: string;
    type: CampaignType;
    description: string;
    rules: any;
    startDate: Date;
    endDate: Date;
    budget?: number;
  }): Promise<MarketingCampaign> {
    const id = `CMP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    await this.db.query(
      `INSERT INTO marketing_campaigns 
       (id, name, type, description, rules, start_date, end_date, budget, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'draft', NOW())`,
      [id, data.name, data.type, data.description, JSON.stringify(data.rules), data.startDate, data.endDate, data.budget]
    );

    return {
      id,
      name: data.name,
      type: data.type,
      description: data.description,
      rules: data.rules,
      startDate: data.startDate,
      endDate: data.endDate,
      budget: data.budget,
      usedBudget: 0,
      status: 'draft',
      createdAt: new Date(),
    };
  }

  // 启动活动
  async activateCampaign(campaignId: string): Promise<void> {
    await this.db.query(
      `UPDATE marketing_campaigns SET status = 'active' WHERE id = $1`,
      [campaignId]
    );
  }

  // 暂停活动
  async pauseCampaign(campaignId: string): Promise<void> {
    await this.db.query(
      `UPDATE marketing_campaigns SET status = 'paused' WHERE id = $1`,
      [campaignId]
    );
  }

  // 结束活动
  async endCampaign(campaignId: string): Promise<void> {
    await this.db.query(
      `UPDATE marketing_campaigns SET status = 'ended' WHERE id = $1`,
      [campaignId]
    );
  }

  // 获取活动列表
  async getCampaigns(status?: CampaignStatus): Promise<MarketingCampaign[]> {
    let query = `SELECT * FROM marketing_campaigns`;
    const params: any[] = [];

    if (status) {
      query += ` WHERE status = $1`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC`;

    const result = await this.db.query(query, params);
    return result.rows.map(row => this.mapToCampaign(row));
  }

  // ===== 限时折扣 =====

  // 创建限时折扣
  async createFlashSale(serviceId: string, data: {
    discountRate: number; // 折扣率 (0.1-0.9)
    maxQuantity: number;
    startDate: Date;
    endDate: Date;
  }): Promise<any> {
    const id = `FS-${Date.now()}`;

    await this.db.query(
      `INSERT INTO flash_sales 
       (id, service_id, discount_rate, max_quantity, sold_quantity, start_date, end_date, status, created_at)
       VALUES ($1, $2, $3, $4, 0, $5, $6, 'active', NOW())`,
      [id, serviceId, data.discountRate, data.maxQuantity, data.startDate, data.endDate]
    );

    return {
      id,
      serviceId,
      discountRate: data.discountRate,
      maxQuantity: data.maxQuantity,
      soldQuantity: 0,
      startDate: data.startDate,
      endDate: data.endDate,
    };
  }

  // 参与限时折扣
  async participateFlashSale(flashSaleId: string, userId: string): Promise<{ success: boolean; price?: number }> {
    const flashSale = await this.getFlashSale(flashSaleId);
    if (!flashSale) {
      return { success: false };
    }

    if (flashSale.soldQuantity >= flashSale.maxQuantity) {
      return { success: false };
    }

    const now = new Date();
    if (now < flashSale.start_date || now > flashSale.end_date) {
      return { success: false };
    }

    // 获取服务原价
    const service = await this.getService(flashSale.service_id);
    const discountedPrice = service.base_price * flashSale.discount_rate;

    // 增加销量
    await this.db.query(
      `UPDATE flash_sales SET sold_quantity = sold_quantity + 1 WHERE id = $1`,
      [flashSaleId]
    );

    return {
      success: true,
      price: discountedPrice,
    };
  }

  // ===== 满减活动 =====

  // 创建满减活动
  async createFullReduction(data: {
    minAmount: number;
    discountAmount: number;
    startDate: Date;
    endDate: Date;
  }): Promise<any> {
    const id = `FR-${Date.now()}`;

    await this.db.query(
      `INSERT INTO full_reduction_activities 
       (id, min_amount, discount_amount, start_date, end_date, status, created_at)
       VALUES ($1, $2, $3, $4, $5, 'active', NOW())`,
      [id, data.minAmount, data.discountAmount, data.startDate, data.endDate]
    );

    return {
      id,
      minAmount: data.minAmount,
      discountAmount: data.discountAmount,
      startDate: data.startDate,
      endDate: data.endDate,
    };
  }

  // 计算满减优惠
  async calculateFullReduction(amount: number): Promise<{ eligible: boolean; discount?: number }> {
    const now = new Date();
    
    const result = await this.db.query(
      `SELECT * FROM full_reduction_activities 
       WHERE status = 'active' 
       AND start_date <= $1 
       AND end_date >= $1
       ORDER BY discount_amount DESC
       LIMIT 1`,
      [now]
    );

    if (result.rows.length === 0) {
      return { eligible: false };
    }

    const activity = result.rows[0];
    if (amount < activity.min_amount) {
      return { eligible: false };
    }

    return {
      eligible: true,
      discount: activity.discount_amount,
    };
  }

  // ===== 推荐奖励 =====

  // 生成邀请码
  async generateReferralCode(userId: string): Promise<string> {
    const code = `REF-${userId}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    await this.db.query(
      `INSERT INTO referral_codes (user_id, code, created_at) VALUES ($1, $2, NOW())
       ON CONFLICT (user_id) DO UPDATE SET code = $2`,
      [userId, code]
    );

    return code;
  }

  // 使用邀请码
  async useReferralCode(code: string, newUserId: string): Promise<{ success: boolean; reward?: number }> {
    const referral = await this.db.query(
      `SELECT * FROM referral_codes WHERE code = $1`,
      [code]
    );

    if (referral.rows.length === 0) {
      return { success: false };
    }

    const referrerId = referral.rows[0].user_id;
    const rewardAmount = 50; // 奖励金额

    // 创建奖励记录
    await this.db.query(
      `INSERT INTO referral_rewards 
       (referrer_id, referee_id, reward_amount, status, created_at)
       VALUES ($1, $2, $3, 'pending', NOW())`,
      [referrerId, newUserId, rewardAmount]
    );

    // 给双方发放优惠券
    await this.issueReferralCoupons(referrerId, newUserId);

    return {
      success: true,
      reward: rewardAmount,
    };
  }

  // 发放推荐优惠券
  private async issueReferralCoupons(referrerId: string, refereeId: string): Promise<void> {
    // 给邀请人发放优惠券
    await this.db.query(
      `INSERT INTO coupons (user_id, amount, name, expiry_date, created_at)
       VALUES ($1, 100, '邀请好友奖励', NOW() + INTERVAL '30 days', NOW())`,
      [referrerId]
    );

    // 给被邀请人发放优惠券
    await this.db.query(
      `INSERT INTO coupons (user_id, amount, name, expiry_date, created_at)
       VALUES ($1, 50, '新人礼包', NOW() + INTERVAL '30 days', NOW())`,
      [refereeId]
    );
  }

  // 获取推荐统计
  async getReferralStats(userId: string): Promise<any> {
    const result = await this.db.query(
      `SELECT 
        COUNT(*) as total_referrals,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COALESCE(SUM(reward_amount), 0) as total_rewards
       FROM referral_rewards
       WHERE referrer_id = $1`,
      [userId]
    );

    return result.rows[0];
  }

  // ===== 营销数据统计 =====

  // 获取营销活动统计
  async getCampaignStats(campaignId?: string): Promise<any> {
    let whereClause = '';
    let params: any[] = [];

    if (campaignId) {
      whereClause = 'WHERE id = $1';
      params = [campaignId];
    }

    const result = await this.db.query(
      `SELECT 
        COUNT(*) as total_campaigns,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'ended' THEN 1 END) as ended,
        COALESCE(SUM(budget), 0) as total_budget,
        COALESCE(SUM(used_budget), 0) as used_budget
       FROM marketing_campaigns ${whereClause}`,
      params
    );

    return result.rows[0];
  }

  // 获取限时折扣统计
  async getFlashSaleStats(): Promise<any> {
    const result = await this.db.query(
      `SELECT 
        COUNT(*) as total_sales,
        COALESCE(SUM(sold_quantity), 0) as total_sold,
        COALESCE(SUM(max_quantity), 0) as total_quantity,
        COALESCE(AVG(discount_rate), 0) as avg_discount
       FROM flash_sales`
    );

    return result.rows[0];
  }

  // ===== 私有方法 =====

  private mapToCampaign(row: any): MarketingCampaign {
    return {
      id: row.id,
      name: row.name,
      type: row.type,
      description: row.description,
      rules: JSON.parse(row.rules),
      startDate: row.start_date,
      endDate: row.end_date,
      budget: row.budget,
      usedBudget: row.used_budget,
      status: row.status,
      createdAt: row.created_at,
    };
  }

  private async getFlashSale(flashSaleId: string): Promise<any> {
    const result = await this.db.query(
      `SELECT * FROM flash_sales WHERE id = $1`,
      [flashSaleId]
    );
    return result.rows[0];
  }

  private async getService(serviceId: string): Promise<any> {
    const result = await this.db.query(
      `SELECT * FROM services WHERE id = $1`,
      [serviceId]
    );
    return result.rows[0];
  }
}

export const marketingService = MarketingService.getInstance();
