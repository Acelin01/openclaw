/**
 * 评价回复服务
 * 支持服务商回复用户评价
 */

import { DatabaseService } from '../lib/db/service.js';

export interface ReviewReply {
  id: string;
  reviewId: string;
  sellerId: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
}

export class ReviewReplyService {
  private static instance: ReviewReplyService;
  private db: DatabaseService;

  private constructor() {
    this.db = DatabaseService.getInstance();
  }

  static getInstance(): ReviewReplyService {
    if (!ReviewReplyService.instance) {
      ReviewReplyService.instance = new ReviewReplyService();
    }
    return ReviewReplyService.instance;
  }

  // 添加回复
  async addReply(reviewId: string, sellerId: string, content: string): Promise<ReviewReply> {
    const replyId = `reply-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // 验证评价存在且属于该服务商
    const review = await this.getReview(reviewId);
    if (!review) {
      throw new Error('评价不存在');
    }

    if (review.seller_id !== sellerId) {
      throw new Error('无权回复此评价');
    }

    // 检查是否已有回复
    const existingReply = await this.getReplyByReview(reviewId);
    if (existingReply) {
      throw new Error('该评价已有回复');
    }

    // 创建回复
    await this.createReply(replyId, reviewId, sellerId, content);

    // 通知用户
    await this.notifyUser(review.user_id, reviewId, replyId);

    return {
      id: replyId,
      reviewId,
      sellerId,
      content,
      createdAt: new Date(),
    };
  }

  // 更新回复
  async updateReply(replyId: string, sellerId: string, content: string): Promise<void> {
    const reply = await this.getReply(replyId);
    if (!reply) {
      throw new Error('回复不存在');
    }

    if (reply.seller_id !== sellerId) {
      throw new Error('无权修改此回复');
    }

    await this.db.query(
      `UPDATE review_replies SET content = $1, updated_at = NOW() WHERE id = $2`,
      [content, replyId]
    );
  }

  // 删除回复
  async deleteReply(replyId: string, sellerId: string): Promise<void> {
    const reply = await this.getReply(replyId);
    if (!reply) {
      throw new Error('回复不存在');
    }

    if (reply.seller_id !== sellerId) {
      throw new Error('无权删除此回复');
    }

    await this.db.query(
      `DELETE FROM review_replies WHERE id = $1`,
      [replyId]
    );
  }

  // 获取评价的回复
  async getReplyByReview(reviewId: string): Promise<ReviewReply | null> {
    const result = await this.db.query(
      `SELECT * FROM review_replies WHERE review_id = $1`,
      [reviewId]
    );
    
    if (result.rows.length === 0) return null;

    return this.mapToReply(result.rows[0]);
  }

  // 获取服务商的回复列表
  async getSellerReplies(sellerId: string, limit: number = 20): Promise<ReviewReply[]> {
    const result = await this.db.query(
      `SELECT * FROM review_replies WHERE seller_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [sellerId, limit]
    );

    return result.rows.map(row => this.mapToReply(row));
  }

  // 获取评价信息
  private async getReview(reviewId: string): Promise<any> {
    const result = await this.db.query(
      `SELECT * FROM reviews WHERE id = $1`,
      [reviewId]
    );
    return result.rows[0];
  }

  // 获取回复信息
  private async getReply(replyId: string): Promise<any> {
    const result = await this.db.query(
      `SELECT * FROM review_replies WHERE id = $1`,
      [replyId]
    );
    return result.rows[0];
  }

  // 创建回复记录
  private async createReply(id: string, reviewId: string, sellerId: string, content: string): Promise<void> {
    await this.db.query(
      `INSERT INTO review_replies (id, review_id, seller_id, content, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [id, reviewId, sellerId, content]
    );
  }

  // 通知用户
  private async notifyUser(userId: string, reviewId: string, replyId: string): Promise<void> {
    // TODO: 集成通知服务
    console.log(`[ReviewReply] 通知用户 ${userId}: 您的评价已收到回复`);
  }

  // 映射数据库记录到对象
  private mapToReply(row: any): ReviewReply {
    return {
      id: row.id,
      reviewId: row.review_id,
      sellerId: row.seller_id,
      content: row.content,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  // 统计回复数量
  async getReplyCount(sellerId: string): Promise<number> {
    const result = await this.db.query(
      `SELECT COUNT(*) as count FROM review_replies WHERE seller_id = $1`,
      [sellerId]
    );
    return parseInt(result.rows[0].count);
  }

  // 获取回复统计
  async getReplyStats(sellerId: string): Promise<any> {
    const result = await this.db.query(
      `SELECT 
        COUNT(*) as total_replies,
        AVG(LENGTH(content)) as avg_length,
        COUNT(DISTINCT review_id) as unique_reviews
       FROM review_replies
       WHERE seller_id = $1`,
      [sellerId]
    );

    return result.rows[0];
  }
}

export const reviewReplyService = ReviewReplyService.getInstance();
