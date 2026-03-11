/**
 * 订单路由 - 服务市场下单全流程
 * 对应文档：M03 服务市场全流程 (F03-01 ~ F03-12)
 */

import express, { Router } from 'express';
import { z } from 'zod';
import { DatabaseService } from '../lib/db/service.js';
import { authenticateToken, optionalAuthenticateToken } from '../middleware/auth.js';

const router: Router = express.Router();

// ════════════════════════════════════════
// Schema 定义
// ════════════════════════════════════════

const createOrderSchema = z.object({
  serviceId: z.string(),
  packageType: z.enum(['BASIC', 'PRO', 'ENTERPRISE']),
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(2000),
  estimatedHours: z.number().min(1).max(100),
  deliveryTime: z.enum(['URGENT', 'NORMAL', 'FLEXIBLE']),
  couponCode: z.string().optional(),
});

const updateOrderSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'DELIVERED', 'COMPLETED', 'CANCELLED']).optional(),
  description: z.string().optional(),
  estimatedHours: z.number().optional(),
});

const submitDeliverySchema = z.object({
  files: z.array(z.string()),
  message: z.string().optional(),
});

const acceptDeliverySchema = z.object({
  rating: z.number().min(1).max(5),
  review: z.string().optional(),
});

// ════════════════════════════════════════
// 获取服务列表 (F03-01 ~ F03-04)
// ════════════════════════════════════════

router.get('/services', optionalAuthenticateToken, async (req, res) => {
  try {
    const { category, search, sortBy, minPrice, maxPrice, rating, serviceType } = req.query;
    
    const db = DatabaseService.getInstance();
    if (!db.isAvailable()) {
      return res.status(500).json({ success: false, message: '数据库连接异常' });
    }

    // 基础查询
    let services = await db.query('SELECT * FROM services WHERE 1=1', []);

    // 筛选条件
    const params: any[] = [];
    let whereClause = 'WHERE 1=1';

    if (search) {
      params.push(`%${search}%`);
      whereClause += ' AND (name LIKE $' + params.length + ' OR description LIKE $' + params.length + ')';
    }

    if (category) {
      params.push(category);
      whereClause += ' AND category = $' + params.length;
    }

    if (serviceType) {
      params.push(serviceType);
      whereClause += ' AND service_type = $' + params.length;
    }

    if (minPrice) {
      params.push(Number(minPrice));
      whereClause += ' AND base_price >= $' + params.length;
    }

    if (maxPrice) {
      params.push(Number(maxPrice));
      whereClause += ' AND base_price <= $' + params.length;
    }

    // 排序
    let orderBy = 'ORDER BY created_at DESC';
    if (sortBy === 'sales') orderBy = 'ORDER BY total_sales DESC';
    if (sortBy === 'price_asc') orderBy = 'ORDER BY base_price ASC';
    if (sortBy === 'price_desc') orderBy = 'ORDER BY base_price DESC';
    if (sortBy === 'rating') orderBy = 'ORDER BY rating DESC';

    const query = `SELECT * FROM services ${whereClause} ${orderBy} LIMIT 50`;
    services = await db.query(query, params);

    return res.json({
      success: true,
      data: {
        services,
        total: services.length,
      }
    });
  } catch (error) {
    console.error('获取服务列表错误:', error);
    return res.status(500).json({
      success: false,
      message: '获取服务列表失败'
    });
  }
});

// ════════════════════════════════════════
// 获取服务详情 (F03-05)
// ════════════════════════════════════════

router.get('/services/:id', optionalAuthenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const db = DatabaseService.getInstance();
    if (!db.isAvailable()) {
      return res.status(500).json({ success: false, message: '数据库连接异常' });
    }

    const service = await db.query('SELECT * FROM services WHERE id = $1', [id]);
    
    if (!service || service.length === 0) {
      return res.status(404).json({
        success: false,
        message: '服务不存在'
      });
    }

    // 获取套餐信息
    const packages = await db.query(
      'SELECT * FROM service_packages WHERE service_id = $1 ORDER BY price ASC',
      [id]
    );

    // 获取评价
    const reviews = await db.query(
      'SELECT r.*, u.name as user_name, u.avatar_url FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.service_id = $1 ORDER BY r.created_at DESC LIMIT 10',
      [id]
    );

    // 获取服务者信息
    const seller = await db.query(
      'SELECT id, name, avatar_url, certification_status, response_time FROM users WHERE id = $1',
      [service[0].seller_id]
    );

    return res.json({
      success: true,
      data: {
        service: service[0],
        packages,
        reviews,
        seller: seller[0],
      }
    });
  } catch (error) {
    console.error('获取服务详情错误:', error);
    return res.status(500).json({
      success: false,
      message: '获取服务详情失败'
    });
  }
});

// ════════════════════════════════════════
// 收藏/取消收藏服务 (F03-06)
// ════════════════════════════════════════

router.post('/services/:id/favorite', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const db = DatabaseService.getInstance();
    if (!db.isAvailable()) {
      return res.status(500).json({ success: false, message: '数据库连接异常' });
    }

    // 检查是否已收藏
    const existing = await db.query(
      'SELECT * FROM favorites WHERE user_id = $1 AND service_id = $2',
      [userId, id]
    );

    if (existing && existing.length > 0) {
      // 取消收藏
      await db.query('DELETE FROM favorites WHERE user_id = $1 AND service_id = $2', [userId, id]);
      return res.json({ success: true, message: '已取消收藏', data: { favorited: false } });
    } else {
      // 添加收藏
      await db.query(
        'INSERT INTO favorites (user_id, service_id) VALUES ($1, $2)',
        [userId, id]
      );
      return res.json({ success: true, message: '已加入收藏', data: { favorited: true } });
    }
  } catch (error) {
    console.error('收藏服务错误:', error);
    return res.status(500).json({
      success: false,
      message: '操作失败'
    });
  }
});

// ════════════════════════════════════════
// 获取收藏列表 (F03-06)
// ════════════════════════════════════════

router.get('/favorites', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    
    const db = DatabaseService.getInstance();
    if (!db.isAvailable()) {
      return res.status(500).json({ success: false, message: '数据库连接异常' });
    }

    const favorites = await db.query(
      `SELECT f.*, s.name, s.description, s.base_price, s.icon, u.name as seller_name
       FROM favorites f
       JOIN services s ON f.service_id = s.id
       JOIN users u ON s.seller_id = u.id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [userId]
    );

    return res.json({
      success: true,
      data: { favorites }
    });
  } catch (error) {
    console.error('获取收藏列表错误:', error);
    return res.status(500).json({
      success: false,
      message: '获取收藏列表失败'
    });
  }
});

// ════════════════════════════════════════
// 创建订单 (F03-09)
// ════════════════════════════════════════

router.post('/', authenticateToken, async (req: any, res) => {
  try {
    const validation = createOrderSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: '参数验证失败',
        errors: validation.error.errors
      });
    }

    const { serviceId, packageType, title, description, estimatedHours, deliveryTime, couponCode } = validation.data;
    const userId = req.user.id;
    
    const db = DatabaseService.getInstance();
    if (!db.isAvailable()) {
      return res.status(500).json({ success: false, message: '数据库连接异常' });
    }

    // 获取服务信息
    const service = await db.query('SELECT * FROM services WHERE id = $1', [serviceId]);
    if (!service || service.length === 0) {
      return res.status(404).json({ success: false, message: '服务不存在' });
    }

    // 获取套餐价格
    const pkg = await db.query(
      'SELECT * FROM service_packages WHERE service_id = $1 AND type = $2',
      [serviceId, packageType]
    );
    
    const unitPrice = pkg.length > 0 ? pkg[0].price : service[0].base_price;
    const serviceFee = unitPrice * estimatedHours * 0.1; // 10% 平台服务费
    const totalAmount = unitPrice * estimatedHours + serviceFee;

    // 生成订单号
    const orderNo = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase();

    // 创建订单
    const result = await db.query(
      `INSERT INTO orders (
        order_no, user_id, service_id, package_type, title, description,
        unit_price, estimated_hours, service_fee, total_amount,
        delivery_time, status, payment_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        orderNo, userId, serviceId, packageType, title, description,
        unitPrice, estimatedHours, serviceFee, totalAmount,
        deliveryTime, 'PENDING', 'UNPAID'
      ]
    );

    // 记录订单日志
    await db.query(
      'INSERT INTO order_logs (order_id, status, message) VALUES ($1, $2, $3)',
      [result[0].id, 'PENDING', '订单创建成功，等待支付']
    );

    return res.json({
      success: true,
      message: '订单创建成功',
      data: {
        order: result[0],
      }
    });
  } catch (error) {
    console.error('创建订单错误:', error);
    return res.status(500).json({
      success: false,
      message: '创建订单失败'
    });
  }
});

// ════════════════════════════════════════
// 获取订单详情 (F03-10)
// ════════════════════════════════════════

router.get('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const db = DatabaseService.getInstance();
    if (!db.isAvailable()) {
      return res.status(500).json({ success: false, message: '数据库连接异常' });
    }

    const order = await db.query(
      `SELECT o.*, s.name as service_name, s.icon, u.name as seller_name, u.avatar_url as seller_avatar
       FROM orders o
       JOIN services s ON o.service_id = s.id
       JOIN users u ON o.seller_id = u.id
       WHERE o.id = $1 AND (o.user_id = $2 OR o.seller_id = $2)`,
      [id, userId]
    );

    if (!order || order.length === 0) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }

    // 获取订单日志
    const logs = await db.query(
      'SELECT * FROM order_logs WHERE order_id = $1 ORDER BY created_at ASC',
      [id]
    );

    // 获取任务列表
    const tasks = await db.query(
      'SELECT * FROM order_tasks WHERE order_id = $1 ORDER BY sort_order ASC',
      [id]
    );

    return res.json({
      success: true,
      data: {
        order: order[0],
        logs,
        tasks,
      }
    });
  } catch (error) {
    console.error('获取订单详情错误:', error);
    return res.status(500).json({
      success: false,
      message: '获取订单详情失败'
    });
  }
});

// ════════════════════════════════════════
// 更新订单 (F03-10)
// ════════════════════════════════════════

router.patch('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const validation = updateOrderSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: '参数验证失败',
        errors: validation.error.errors
      });
    }

    const db = DatabaseService.getInstance();
    if (!db.isAvailable()) {
      return res.status(500).json({ success: false, message: '数据库连接异常' });
    }

    // 检查订单权限
    const order = await db.query(
      'SELECT * FROM orders WHERE id = $1 AND (user_id = $2 OR seller_id = $2)',
      [id, userId]
    );

    if (!order || order.length === 0) {
      return res.status(404).json({ success: false, message: '订单不存在' });
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(validation.data).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: '没有可更新的字段' });
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);
    
    const result = await db.query(
      `UPDATE orders SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    // 记录日志
    if (validation.data.status) {
      await db.query(
        'INSERT INTO order_logs (order_id, status, message) VALUES ($1, $2, $3)',
        [id, validation.data.status, `订单状态更新为 ${validation.data.status}`]
      );
    }

    return res.json({
      success: true,
      message: '订单更新成功',
      data: { order: result[0] }
    });
  } catch (error) {
    console.error('更新订单错误:', error);
    return res.status(500).json({
      success: false,
      message: '更新订单失败'
    });
  }
});

// ════════════════════════════════════════
// 提交交付物 (F03-10)
// ════════════════════════════════════════

router.post('/:id/deliver', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const validation = submitDeliverySchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: '参数验证失败',
        errors: validation.error.errors
      });
    }

    const { files, message } = validation.data;
    
    const db = DatabaseService.getInstance();
    if (!db.isAvailable()) {
      return res.status(500).json({ success: false, message: '数据库连接异常' });
    }

    // 检查订单权限（只有服务者可以提交交付物）
    const order = await db.query(
      'SELECT * FROM orders WHERE id = $1 AND seller_id = $2',
      [id, userId]
    );

    if (!order || order.length === 0) {
      return res.status(404).json({ success: false, message: '订单不存在或无权限' });
    }

    // 更新订单状态
    await db.query(
      'UPDATE orders SET status = $1, delivery_files = $2, delivery_message = $3, delivered_at = NOW() WHERE id = $4',
      ['DELIVERED', JSON.stringify(files), message, id]
    );

    // 记录日志
    await db.query(
      'INSERT INTO order_logs (order_id, status, message) VALUES ($1, $2, $3)',
      [id, 'DELIVERED', '服务者已提交交付物，等待客户验收']
    );

    return res.json({
      success: true,
      message: '交付物提交成功',
    });
  } catch (error) {
    console.error('提交交付物错误:', error);
    return res.status(500).json({
      success: false,
      message: '提交交付物失败'
    });
  }
});

// ════════════════════════════════════════
// 验收订单 (F03-10)
// ════════════════════════════════════════

router.post('/:id/accept', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const validation = acceptDeliverySchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: '参数验证失败',
        errors: validation.error.errors
      });
    }

    const { rating, review } = validation.data;
    
    const db = DatabaseService.getInstance();
    if (!db.isAvailable()) {
      return res.status(500).json({ success: false, message: '数据库连接异常' });
    }

    // 检查订单权限（只有客户可以验收）
    const order = await db.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (!order || order.length === 0) {
      return res.status(404).json({ success: false, message: '订单不存在或无权限' });
    }

    // 更新订单状态
    await db.query(
      'UPDATE orders SET status = $1, completed_at = NOW() WHERE id = $2',
      ['COMPLETED', id]
    );

    // 创建评价
    await db.query(
      'INSERT INTO reviews (order_id, service_id, user_id, rating, review) VALUES ($1, $2, $3, $4, $5)',
      [id, order[0].service_id, userId, rating, review || '']
    );

    // 记录日志
    await db.query(
      'INSERT INTO order_logs (order_id, status, message) VALUES ($1, $2, $3)',
      [id, 'COMPLETED', '客户已验收，订单完成']
    );

    return res.json({
      success: true,
      message: '订单验收成功',
    });
  } catch (error) {
    console.error('验收订单错误:', error);
    return res.status(500).json({
      success: false,
      message: '验收订单失败'
    });
  }
});

// ════════════════════════════════════════
// 获取我的订单列表
// ════════════════════════════════════════

router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 20 } = req.query;
    
    const db = DatabaseService.getInstance();
    if (!db.isAvailable()) {
      return res.status(500).json({ success: false, message: '数据库连接异常' });
    }

    const offset = (Number(page) - 1) * Number(limit);
    const params: any[] = [userId];
    let whereClause = 'WHERE o.user_id = $1 OR o.seller_id = $1';
    let paramIndex = 2;

    if (status) {
      params.push(status);
      whereClause += ` AND o.status = $${paramIndex}`;
      paramIndex++;
    }

    const query = `
      SELECT o.*, s.name as service_name, s.icon, 
             u.name as seller_name, u.avatar_url as seller_avatar
      FROM orders o
      JOIN services s ON o.service_id = s.id
      JOIN users u ON o.seller_id = u.id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(Number(limit), offset);
    const orders = await db.query(query, params);

    // 获取总数
    const countQuery = `SELECT COUNT(*) FROM orders o ${whereClause}`;
    const countResult = await db.query(countQuery, params.slice(0, paramIndex - 2));

    return res.json({
      success: true,
      data: {
        orders,
        total: Number(countResult[0].count),
        page: Number(page),
        limit: Number(limit),
      }
    });
  } catch (error) {
    console.error('获取订单列表错误:', error);
    return res.status(500).json({
      success: false,
      message: '获取订单列表失败'
    });
  }
});

export default router;
