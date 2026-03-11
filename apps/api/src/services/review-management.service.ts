/**
 * 评价管理服务
 * 支持评价举报、删除、修改、置顶等功能
 */

import { DatabaseService } from '../lib/db/service.js';

export type ReviewReportReason = 'spam' | 'abusive' | 'fake' | 'irrelevant' | 'other';
export type ReviewStatus = 'visible' | 'hidden' | 'deleted' | 'under_review';

export interface ReviewReport {
  id: string;
  reviewId: string;
  reporterId: string;
  reason: ReviewReportReason;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: Date;
}

export class ReviewManagementService {
  private static instance: ReviewManagementService;
  private db: DatabaseService;

  private constructor() {
    this.db = DatabaseService.getInstance();
  }

  static getInstance(): ReviewManagementService {
    if (!ReviewManagementService.instance) {
      ReviewManagementService.instance = new ReviewManagementService();
    }
    return ReviewManagementService.instance;
  }

  // 举报评价
  async reportReview(reviewId: string, reporterId: string, data: {
    reason: ReviewReportReason;
    description?: string;
  }): Promise<ReviewReport> {
    const id = `RPT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // 验证评价存在
    const review = await this.getReview(reviewId);
    if (!review) {
      throw new Error('评价不存在');
    }

    // 检查是否已举报
    const existing = await this.getReportByUser(reviewId, reporterId);
    if (existing) {
      throw new Error('您已举报过此评价');
    }

    await this.db.query(
      `INSERT INTO review_reports 
       (id, review_id, reporter_id, reason, description, status, created_at)
       VALUES ($1, $2, $3, $4, $5, 'pending', NOW())`,
      [id, reviewId, reporterId, data.reason, data.description]
    );

    // 如果举报次数过多，自动隐藏评价
    await this.checkAutoHide(reviewId);

    return {
      id,
      reviewId,
      reporterId,
      reason: data.reason,
      description: data.description,
      status: 'pending',
      createdAt: new Date(),
    };
  }

  // 处理举报 (管理员)
  async processReport(reportId: string, adminId: string, decision: 'approve' | 'reject'): Promise<void> {
    const report = await this.getReport(reportId);
    if (!report) {
      throw new Error('举报记录不存在');
    }

    if (report.status !== 'pending') {
      throw new Error('举报已处理');
    }

    await this.db.query(
      `UPDATE review_reports SET status = 'reviewed', reviewed_by = $1 WHERE id = $2`,
      [adminId, reportId]
    );

    if (decision === 'approve') {
      // 隐藏评价
      await this.updateReviewStatus(report.review_id, 'hidden');
      await this.db.query(
        `UPDATE review_reports SET status = 'resolved' WHERE id = $1`,
        [reportId]
      );
    } else {
      await this.db.query(
        `UPDATE review_reports SET status = 'resolved' WHERE id = $1`,
        [reportId]
      );
    }
  }

  // 删除评价 (管理员)
  async deleteReview(reviewId: string, adminId: string, reason: string): Promise<void> {
    const review = await this.getReview(reviewId);
    if (!review) {
      throw new Error('评价不存在');
    }

    await this.db.query(
      `UPDATE reviews 
       SET status = 'deleted', 
           deleted_by = $1, 
           delete_reason = $2,
           deleted_at = NOW()
       WHERE id = $3`,
      [adminId, reason, reviewId]
    );

    // 更新服务商评分
    await this.recalculateSellerRating(review.seller_id);
  }

  // 修改评价 (用户)
  async updateReview(reviewId: string, userId: string, data: {
    rating?: number;
    comment?: string;
  }): Promise<void> {
    const review = await this.getReview(reviewId);
    if (!review) {
      throw new Error('评价不存在');
    }

    if (review.user_id !== userId) {
      throw new Error('无权修改此评价');
    }

    if (review.status !== 'visible') {
      throw new Error('评价状态不可修改');
    }

    // 检查修改时限 (7 天内)
    const daysSinceCreated = (new Date().getTime() - new Date(review.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreated > 7) {
      throw new Error('评价已超过修改时限 (7 天)');
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.rating !== undefined) {
      updates.push(`rating = $${paramIndex++}`);
      values.push(data.rating);
    }

    if (data.comment !== undefined) {
      updates.push(`comment = $${paramIndex++}`);
      values.push(data.comment);
    }

    updates.push(`updated_at = NOW()`);

    await this.db.query(
      `UPDATE reviews SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      [...values, reviewId]
    );

    // 重新计算评分
    await this.recalculateSellerRating(review.seller_id);
  }

  // 置顶评价 (管理员)
  async pinReview(reviewId: string, adminId: string): Promise<void> {
    await this.db.query(
      `UPDATE reviews SET is_pinned = true, pinned_at = NOW() WHERE id = $1`,
      [reviewId]
    );
  }

  // 取消置顶
  async unpinReview(reviewId: string): Promise<void> {
    await this.db.query(
      `UPDATE reviews SET is_pinned = false WHERE id = $1`,
      [reviewId]
    );
  }

  // 获取评价列表 (带筛选)
  async getReviews(filters: {
    sellerId?: string;
    userId?: string;
    status?: ReviewStatus;
    minRating?: number;
    maxRating?: number;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    let query = `SELECT * FROM reviews WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.sellerId) {
      query += ` AND seller_id = $${paramIndex++}`;
      params.push(filters.sellerId);
    }

    if (filters.userId) {
      query += ` AND user_id = $${paramIndex++}`;
      params.push(filters.userId);
    }

    if (filters.status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(filters.status);
    }

    if (filters.minRating !== undefined) {
      query += ` AND rating >= $${paramIndex++}`;
      params.push(filters.minRating);
    }

    if (filters.maxRating !== undefined) {
      query += ` AND rating <= $${paramIndex++}`;
      params.push(filters.maxRating);
    }

    query += ` ORDER BY is_pinned DESC, created_at DESC`;

    if (filters.limit) {
      query += ` LIMIT $${paramIndex++}`;
      params.push(filters.limit);
    }

    if (filters.offset) {
      query += ` OFFSET $${paramIndex++}`;
      params.push(filters.offset);
    }

    const result = await this.db.query(query, params);
    return result.rows;
  }

  // 获取举报列表
  async getReports(status?: string, limit: number = 50): Promise<ReviewReport[]> {
    let query = `SELECT * FROM review_reports`;
    const params: any[] = [];

    if (status) {
      query += ` WHERE status = $1`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await this.db.query(query, params);
    return result.rows.map(row => this.mapToReport(row));
  }

  // 获取评价统计
  async getReviewStats(sellerId?: string): Promise<any> {
    const whereClause = sellerId ? 'WHERE seller_id = $1' : '';
    const params = sellerId ? [sellerId] : [];

    const result = await this.db.query(
      `SELECT 
        COUNT(*) as total,
        AVG(rating) as avg_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star,
        COUNT(CASE WHEN status = 'hidden' THEN 1 END) as hidden,
        COUNT(CASE WHEN is_pinned = true THEN 1 END) as pinned
       FROM reviews ${whereClause}`,
      params
    );

    return result.rows[0];
  }

  // ===== 私有方法 =====

  private async getReview(reviewId: string): Promise<any> {
    const result = await this.db.query(
      `SELECT * FROM reviews WHERE id = $1`,
      [reviewId]
    );
    return result.rows[0];
  }

  private async getReport(reportId: string): Promise<ReviewReport | null> {
    const result = await this.db.query(
      `SELECT * FROM review_reports WHERE id = $1`,
      [reportId]
    );
    return result.rows.length > 0 ? this.mapToReport(result.rows[0]) : null;
  }

  private async getReportByUser(reviewId: string, userId: string): Promise<ReviewReport | null> {
    const result = await this.db.query(
      `SELECT * FROM review_reports WHERE review_id = $1 AND reporter_id = $2`,
      [reviewId, userId]
    );
    return result.rows.length > 0 ? this.mapToReport(result.rows[0]) : null;
  }

  private mapToReport(row: any): ReviewReport {
    return {
      id: row.id,
      reviewId: row.review_id,
      reporterId: row.reporter_id,
      reason: row.reason,
      description: row.description,
      status: row.status,
      createdAt: row.created_at,
    };
  }

  private async updateReviewStatus(reviewId: string, status: ReviewStatus): Promise<void> {
    await this.db.query(
      `UPDATE reviews SET status = $1 WHERE id = $2`,
      [status, reviewId]
    );
  }

  private async checkAutoHide(reviewId: string): Promise<void> {
    const result = await this.db.query(
      `SELECT COUNT(*) as count FROM review_reports WHERE review_id = $1 AND status != 'resolved'`,
      [reviewId]
    );

    const count = parseInt(result.rows[0].count);
    if (count >= 3) {
      // 举报次数达到 3 次，自动隐藏
      await this.updateReviewStatus(reviewId, 'hidden');
    }
  }

  private async recalculateSellerRating(sellerId: string): Promise<void> {
    const result = await this.db.query(
      `SELECT AVG(rating) as avg_rating, COUNT(*) as count 
       FROM reviews 
       WHERE seller_id = $1 AND status = 'visible'`,
      [sellerId]
    );

    const avgRating = parseFloat(result.rows[0].avg_rating) || 0;
    const count = parseInt(result.rows[0].count);

    await this.db.query(
      `UPDATE users SET rating = $1, review_count = $2 WHERE id = $3`,
      [avgRating, count, sellerId]
    );
  }
}

export const reviewManagementService = ReviewManagementService.getInstance();
