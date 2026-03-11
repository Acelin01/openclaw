/**
 * 数据分析后台服务
 * 支持平台数据统计、用户行为分析、服务销售分析、财务报表
 */

import { DatabaseService } from '../lib/db/service.js';

export interface PlatformStats {
  totalUsers: number;
  totalSellers: number;
  totalServices: number;
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
  newUsersToday: number;
}

export interface SalesStats {
  totalSales: number;
  todaySales: number;
  weekSales: number;
  monthSales: number;
  topServices: any[];
  topSellers: any[];
}

export interface UserBehaviorStats {
  avgSessionDuration: number;
  avgOrdersPerUser: number;
  conversionRate: number;
  retentionRate: number;
  popularCategories: any[];
}

export interface FinancialStats {
  totalRevenue: number;
  platformFee: number;
  payouts: number;
  refunds: number;
  pendingWithdrawals: number;
  revenueByDay: any[];
}

export class AnalyticsDashboardService {
  private static instance: AnalyticsDashboardService;
  private db: DatabaseService;

  private constructor() {
    this.db = DatabaseService.getInstance();
  }

  static getInstance(): AnalyticsDashboardService {
    if (!AnalyticsDashboardService.instance) {
      AnalyticsDashboardService.instance = new AnalyticsDashboardService();
    }
    return AnalyticsDashboardService.instance;
  }

  // 获取平台统计
  async getPlatformStats(): Promise<PlatformStats> {
    const result = await this.db.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'user') as total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'seller') as total_sellers,
        (SELECT COUNT(*) FROM services) as total_services,
        (SELECT COUNT(*) FROM orders) as total_orders,
        (SELECT COALESCE(SUM(amount), 0) FROM orders WHERE status = 'completed') as total_revenue,
        (SELECT COUNT(DISTINCT user_id) FROM orders WHERE created_at > NOW() - INTERVAL '7 days') as active_users,
        (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '1 day') as new_users_today
    `);

    const row = result.rows[0];
    return {
      totalUsers: parseInt(row.total_users),
      totalSellers: parseInt(row.total_sellers),
      totalServices: parseInt(row.total_services),
      totalOrders: parseInt(row.total_orders),
      totalRevenue: parseFloat(row.total_revenue),
      activeUsers: parseInt(row.active_users),
      newUsersToday: parseInt(row.new_users_today),
    };
  }

  // 获取销售统计
  async getSalesStats(period: 'today' | 'week' | 'month' | 'all' = 'all'): Promise<SalesStats> {
    let dateFilter = '';
    switch (period) {
      case 'today':
        dateFilter = "AND created_at > NOW() - INTERVAL '1 day'";
        break;
      case 'week':
        dateFilter = "AND created_at > NOW() - INTERVAL '7 days'";
        break;
      case 'month':
        dateFilter = "AND created_at > NOW() - INTERVAL '30 days'";
        break;
    }

    const result = await this.db.query(`
      SELECT 
        COUNT(*) as total_sales,
        COALESCE(SUM(amount), 0) as total_amount
      FROM orders 
      WHERE status = 'completed' ${dateFilter}
    `);

    const topServices = await this.db.query(`
      SELECT s.id, s.name, COUNT(o.id) as order_count, COALESCE(SUM(o.amount), 0) as revenue
      FROM services s
      LEFT JOIN orders o ON s.id = o.service_id AND o.status = 'completed'
      GROUP BY s.id, s.name
      ORDER BY order_count DESC
      LIMIT 10
    `);

    const topSellers = await this.db.query(`
      SELECT u.id, u.name, u.email, COUNT(o.id) as order_count, COALESCE(SUM(o.amount), 0) as revenue
      FROM users u
      LEFT JOIN services s ON u.id = s.seller_id
      LEFT JOIN orders o ON s.id = o.service_id AND o.status = 'completed'
      WHERE u.role = 'seller'
      GROUP BY u.id, u.name, u.email
      ORDER BY order_count DESC
      LIMIT 10
    `);

    return {
      totalSales: parseInt(result.rows[0].total_sales),
      todaySales: 0, // 单独查询
      weekSales: 0,
      monthSales: 0,
      topServices: topServices.rows,
      topSellers: topSellers.rows,
    };
  }

  // 获取用户行为统计
  async getUserBehaviorStats(): Promise<UserBehaviorStats> {
    const result = await this.db.query(`
      SELECT 
        (SELECT AVG(session_duration) FROM user_sessions) as avg_session,
        (SELECT AVG(order_count) FROM (SELECT user_id, COUNT(*) as order_count FROM orders GROUP BY user_id) t) as avg_orders,
        (SELECT COUNT(*)::float / NULLIF((SELECT COUNT(*) FROM visitors), 0) * 100 
         FROM orders) as conversion_rate,
        (SELECT COUNT(DISTINCT user_id) FROM orders WHERE created_at > NOW() - INTERVAL '30 days'
         AND user_id IN (SELECT user_id FROM orders WHERE created_at > NOW() - INTERVAL '60 days' 
         AND created_at <= NOW() - INTERVAL '30 days'))::float / 
         NULLIF((SELECT COUNT(DISTINCT user_id) FROM orders WHERE created_at > NOW() - INTERVAL '60 days' 
         AND created_at <= NOW() - INTERVAL '30 days'), 0) * 100 as retention_rate
    `);

    const popularCategories = await this.db.query(`
      SELECT category, COUNT(*) as count
      FROM services
      GROUP BY category
      ORDER BY count DESC
      LIMIT 10
    `);

    return {
      avgSessionDuration: parseFloat(result.rows[0].avg_session) || 0,
      avgOrdersPerUser: parseFloat(result.rows[0].avg_orders) || 0,
      conversionRate: parseFloat(result.rows[0].conversion_rate) || 0,
      retentionRate: parseFloat(result.rows[0].retention_rate) || 0,
      popularCategories: popularCategories.rows,
    };
  }

  // 获取财务统计
  async getFinancialStats(period: 'today' | 'week' | 'month' | 'all' = 'month'): Promise<FinancialStats> {
    let dateFilter = '';
    switch (period) {
      case 'today':
        dateFilter = "AND created_at > NOW() - INTERVAL '1 day'";
        break;
      case 'week':
        dateFilter = "AND created_at > NOW() - INTERVAL '7 days'";
        break;
      case 'month':
        dateFilter = "AND created_at > NOW() - INTERVAL '30 days'";
        break;
    }

    const result = await this.db.query(`
      SELECT 
        COALESCE(SUM(amount), 0) as total_revenue,
        COALESCE(SUM(amount * 0.12), 0) as platform_fee,
        COALESCE((SELECT SUM(amount) FROM withdrawals WHERE status = 'completed' ${dateFilter}), 0) as payouts,
        COALESCE((SELECT SUM(amount) FROM refunds WHERE status = 'completed' ${dateFilter}), 0) as refunds,
        COALESCE((SELECT SUM(amount) FROM withdrawals WHERE status IN ('pending', 'approved')), 0) as pending_withdrawals
      FROM orders 
      WHERE status = 'completed' ${dateFilter}
    `);

    const revenueByDay = await this.db.query(`
      SELECT DATE(created_at) as date, 
             COUNT(*) as orders, 
             COALESCE(SUM(amount), 0) as revenue
      FROM orders 
      WHERE status = 'completed' AND created_at > NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    return {
      totalRevenue: parseFloat(result.rows[0].total_revenue),
      platformFee: parseFloat(result.rows[0].platform_fee),
      payouts: parseFloat(result.rows[0].payouts),
      refunds: parseFloat(result.rows[0].refunds),
      pendingWithdrawals: parseFloat(result.rows[0].pending_withdrawals),
      revenueByDay: revenueByDay.rows,
    };
  }

  // 获取订单趋势
  async getOrderTrend(days: number = 30): Promise<any[]> {
    const result = await this.db.query(`
      SELECT DATE(created_at) as date,
             COUNT(*) as total_orders,
             COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
             COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
             COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
             COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as revenue
      FROM orders 
      WHERE created_at > NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    return result.rows;
  }

  // 获取用户增长趋势
  async getUserGrowthTrend(days: number = 30): Promise<any[]> {
    const result = await this.db.query(`
      SELECT DATE(created_at) as date,
             COUNT(*) as new_users,
             COUNT(CASE WHEN role = 'seller' THEN 1 END) as new_sellers
      FROM users 
      WHERE created_at > NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    return result.rows;
  }

  // 获取服务类别分布
  async getCategoryDistribution(): Promise<any[]> {
    const result = await this.db.query(`
      SELECT category,
             COUNT(*) as count,
             COALESCE(AVG(base_price), 0) as avg_price,
             COALESCE(SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END), 0) as active_count
      FROM services
      GROUP BY category
      ORDER BY count DESC
    `);

    return result.rows;
  }

  // 获取评价分布
  async getReviewDistribution(): Promise<any[]> {
    const result = await this.db.query(`
      SELECT rating, COUNT(*) as count
      FROM reviews
      WHERE status = 'visible'
      GROUP BY rating
      ORDER BY rating DESC
    `);

    return result.rows;
  }

  // 导出数据
  async exportData(type: 'orders' | 'users' | 'services' | 'financial', startDate: Date, endDate: Date): Promise<any[]> {
    let query = '';
    
    switch (type) {
      case 'orders':
        query = `
          SELECT * FROM orders 
          WHERE created_at BETWEEN $1 AND $2
          ORDER BY created_at DESC
        `;
        break;
      case 'users':
        query = `
          SELECT id, email, name, role, created_at, last_login 
          FROM users 
          WHERE created_at BETWEEN $1 AND $2
          ORDER BY created_at DESC
        `;
        break;
      case 'services':
        query = `
          SELECT * FROM services 
          WHERE created_at BETWEEN $1 AND $2
          ORDER BY created_at DESC
        `;
        break;
      case 'financial':
        query = `
          SELECT o.id, o.amount, o.status, o.created_at, 
                 u.email as user_email, s.name as service_name
          FROM orders o
          JOIN users u ON o.user_id = u.id
          JOIN services s ON o.service_id = s.id
          WHERE o.created_at BETWEEN $1 AND $2
          ORDER BY o.created_at DESC
        `;
        break;
    }

    const result = await this.db.query(query, [startDate, endDate]);
    return result.rows;
  }
}

export const analyticsDashboardService = AnalyticsDashboardService.getInstance();
