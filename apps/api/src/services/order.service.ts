/**
 * Order Service
 * 订单服务 - 订单管理全流程
 */

import { DatabaseService } from '../lib/db/service.js';

export type OrderStatus = 'pending_pay' | 'pending_take' | 'active' | 'review' | 'done' | 'disputed' | 'cancelled';

export interface OrderTask {
  name: string;
  hours: number;
  status: 'done' | 'active' | 'pending';
  progress: number;
}

export interface OrderDelivery {
  name: string;
  type: 'file' | 'link' | 'text';
  content: string;
  taskId?: string;
  deliveredAt: Date;
}

export class OrderService {
  private static instance: OrderService;
  private db: DatabaseService;

  private constructor() {
    this.db = DatabaseService.getInstance();
  }

  static getInstance(): OrderService {
    if (!OrderService.instance) {
      OrderService.instance = new OrderService();
    }
    return OrderService.instance;
  }

  // 创建订单
  async createOrder(userId: string, data: {
    serviceId: string;
    packageType: string;
    requirements: string;
    prepayment: number;
  }): Promise<string> {
    const client = await this.db.getClient();
    
    try {
      await client.query('BEGIN');

      const orderNo = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      // 获取服务信息
      const service = await this.getService(data.serviceId);
      if (!service) {
        throw new Error('服务不存在');
      }

      // 创建订单
      const result = await client.query(
        `INSERT INTO orders 
         (order_no, user_id, seller_id, service_id, package_type, requirements, prepayment, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending_pay', NOW())
         RETURNING *`,
        [orderNo, userId, service.seller_id, data.serviceId, data.packageType, data.requirements, data.prepayment]
      );

      // 扣减用户余额
      await client.query(
        `UPDATE user_balances SET balance = balance - $1 WHERE user_id = $2`,
        [data.prepayment, userId]
      );

      // 记录账单
      await client.query(
        `INSERT INTO billing_records (user_id, order_id, type, amount, balance, description, created_at)
         VALUES ($1, $2, 'deduction', $3, $4, '订单预付款', NOW())`,
        [userId, result.rows[0].id, data.prepayment, data.prepayment]
      );

      await client.query('COMMIT');
      return result.rows[0].id;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // 获取订单列表
  async getOrders(userId: string, filter: {
    status?: string;
    search?: string;
    amountRange?: string;
    sortBy?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    let query = `SELECT o.*, s.name as service_name, s.icon as service_icon,
                        u.name as seller_name, u.title as seller_title, u.rating as seller_rating
                 FROM orders o
                 JOIN services s ON o.service_id = s.id
                 JOIN users u ON o.seller_id = u.id
                 WHERE o.user_id = $1`;
    
    const params: any[] = [userId];
    let paramIndex = 2;

    if (filter.status && filter.status !== 'all') {
      query += ` AND o.status = $${paramIndex++}`;
      params.push(filter.status);
    }

    if (filter.search) {
      query += ` AND (o.order_no ILIKE $${paramIndex} OR s.name ILIKE $${paramIndex})`;
      params.push(`%${filter.search}%`);
      paramIndex++;
    }

    if (filter.amountRange && filter.amountRange !== 'all') {
      const [min, max] = filter.amountRange.split('-');
      if (max) {
        query += ` AND o.amount BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
        params.push(Number(min), Number(max));
        paramIndex += 2;
      } else {
        query += ` AND o.amount >= $${paramIndex++}`;
        params.push(Number(min));
      }
    }

    // 排序
    switch (filter.sortBy) {
      case 'highest':
        query += ` ORDER BY o.amount DESC`;
        break;
      case 'expiring':
        query += ` ORDER BY o.deadline ASC`;
        break;
      default:
        query += ` ORDER BY o.created_at DESC`;
    }

    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(filter.limit || 50, filter.offset || 0);

    const result = await this.db.query(query, params);
    return result.rows;
  }

  // 获取订单详情
  async getOrderDetail(orderId: string): Promise<any> {
    const result = await this.db.query(
      `SELECT o.*, s.name as service_name, s.icon as service_icon,
              u.name as seller_name, u.title as seller_title, u.rating as seller_rating
       FROM orders o
       JOIN services s ON o.service_id = s.id
       JOIN users u ON o.seller_id = u.id
       WHERE o.id = $1`,
      [orderId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const order = result.rows[0];

    // 获取任务列表
    const tasks = await this.getOrderTasks(orderId);
    // 获取交付物
    const deliveries = await this.getOrderDeliveries(orderId);

    return {
      ...order,
      tasks,
      deliveries,
    };
  }

  // 获取统计数据
  async getStats(userId: string): Promise<any> {
    const result = await this.db.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status IN ('pending_pay', 'pending_take') THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'review' THEN 1 END) as review,
        COUNT(CASE WHEN status = 'done' THEN 1 END) as done,
        COUNT(CASE WHEN status = 'disputed' THEN 1 END) as disputed,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
        COALESCE(SUM(amount), 0) as total_amount
       FROM orders
       WHERE user_id = $1`,
      [userId]
    );

    return result.rows[0];
  }

  // 取消订单
  async cancelOrder(orderId: string, userId: string, reason: string): Promise<void> {
    const order = await this.getOrder(orderId);
    if (!order) {
      throw new Error('订单不存在');
    }

    if (order.user_id !== userId) {
      throw new Error('无权操作此订单');
    }

    if (order.status !== 'pending_pay') {
      throw new Error('只有待支付状态的订单可以直接取消');
    }

    const client = await this.db.getClient();
    
    try {
      await client.query('BEGIN');

      // 更新订单状态
      await client.query(
        `UPDATE orders SET status = 'cancelled', cancelled_at = NOW(), cancel_reason = $1 WHERE id = $2`,
        [reason, orderId]
      );

      // 退还余额
      await client.query(
        `UPDATE user_balances SET balance = balance + $1 WHERE user_id = $2`,
        [order.prepayment, userId]
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // 确认验收
  async acceptOrder(orderId: string, userId: string): Promise<void> {
    const order = await this.getOrder(orderId);
    if (!order) {
      throw new Error('订单不存在');
    }

    if (order.user_id !== userId) {
      throw new Error('无权操作此订单');
    }

    if (order.status !== 'review') {
      throw new Error('订单状态不是待验收');
    }

    const client = await this.db.getClient();
    
    try {
      await client.query('BEGIN');

      // 更新订单状态
      await client.query(
        `UPDATE orders SET status = 'done', completed_at = NOW() WHERE id = $1`,
        [orderId]
      );

      // 结算给服务商
      const settlementAmount = order.prepayment * 0.88; // 扣除 12% 平台费
      await client.query(
        `UPDATE user_balances SET balance = balance + $1 WHERE user_id = $2`,
        [settlementAmount, order.seller_id]
      );

      // 记录收益
      await client.query(
        `INSERT INTO earnings (order_id, user_id, service_fee, platform_fee, actual_amount, status, created_at)
         VALUES ($1, $2, $3, $4, $5, 'settled', NOW())`,
        [orderId, order.seller_id, order.prepayment, order.prepayment * 0.12, settlementAmount]
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // 拒绝验收
  async rejectOrder(orderId: string, userId: string, reason: string): Promise<void> {
    const order = await this.getOrder(orderId);
    if (!order) {
      throw new Error('订单不存在');
    }

    if (order.user_id !== userId) {
      throw new Error('无权操作此订单');
    }

    if (order.status !== 'review') {
      throw new Error('订单状态不是待验收');
    }

    // 检查修改次数
    if (order.revision_count >= 3) {
      throw new Error('已达到最大修改次数');
    }

    await this.db.query(
      `UPDATE orders 
       SET status = 'active', revision_count = revision_count + 1, rejection_reason = $1
       WHERE id = $2`,
      [reason, orderId]
    );
  }

  // 提交评价
  async submitReview(orderId: string, userId: string, data: {
    rating: number;
    comment: string;
    anonymous: boolean;
  }): Promise<void> {
    const order = await this.getOrder(orderId);
    if (!order) {
      throw new Error('订单不存在');
    }

    // 检查是否已评价
    const existing = await this.getReview(orderId, userId);
    if (existing) {
      throw new Error('已提交过评价');
    }

    await this.db.query(
      `INSERT INTO reviews (order_id, user_id, rating, comment, is_anonymous, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [orderId, userId, data.rating, data.comment, data.anonymous]
    );

    // 更新服务商评分
    await this.updateSellerRating(order.seller_id);
  }

  // 获取订单任务
  private async getOrderTasks(orderId: string): Promise<OrderTask[]> {
    const result = await this.db.query(
      `SELECT * FROM order_tasks WHERE order_id = $1 ORDER BY sort_order`,
      [orderId]
    );
    return result.rows;
  }

  // 获取订单交付物
  private async getOrderDeliveries(orderId: string): Promise<OrderDelivery[]> {
    const result = await this.db.query(
      `SELECT * FROM order_deliveries WHERE order_id = $1 ORDER BY delivered_at DESC`,
      [orderId]
    );
    return result.rows;
  }

  // 获取订单
  private async getOrder(orderId: string): Promise<any> {
    const result = await this.db.query(
      `SELECT * FROM orders WHERE id = $1`,
      [orderId]
    );
    return result.rows[0];
  }

  // 获取服务
  private async getService(serviceId: string): Promise<any> {
    const result = await this.db.query(
      `SELECT * FROM services WHERE id = $1`,
      [serviceId]
    );
    return result.rows[0];
  }

  // 获取评价
  private async getReview(orderId: string, userId: string): Promise<any> {
    const result = await this.db.query(
      `SELECT * FROM reviews WHERE order_id = $1 AND user_id = $2`,
      [orderId, userId]
    );
    return result.rows[0];
  }

  // 更新服务商评分
  private async updateSellerRating(sellerId: string): Promise<void> {
    const result = await this.db.query(
      `SELECT AVG(rating) as avg_rating, COUNT(*) as count
       FROM reviews r
       JOIN orders o ON r.order_id = o.id
       WHERE o.seller_id = $1 AND r.status = 'visible'`,
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

export const orderService = OrderService.getInstance();
