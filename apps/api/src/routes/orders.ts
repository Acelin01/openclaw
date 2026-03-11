/**
 * Orders Routes
 * 订单系统 API 路由
 */

import express, { Router } from 'express';
import { z } from 'zod';
import { orderService } from '../services/order.service.js';
import { authenticateToken } from '../middleware/auth.js';

const router: Router = express.Router();

// Schema 定义
const createOrderSchema = z.object({
  serviceId: z.string(),
  packageType: z.string(),
  requirements: z.string().min(10).max(2000),
  prepayment: z.number().min(100),
});

const cancelOrderSchema = z.object({
  reason: z.string().min(1).max(500),
});

const modifyRequestSchema = z.object({
  content: z.string().min(1).max(2000),
});

const rejectOrderSchema = z.object({
  reason: z.string().min(1).max(500),
});

const submitReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(1).max(2000),
  anonymous: z.boolean(),
});

const submitDisputeSchema = z.object({
  reason: z.string().min(1).max(500),
  evidence: z.array(z.string()),
});

const submitDeliverySchema = z.object({
  name: z.string(),
  files: z.array(z.string()).optional(),
  link: z.string().optional(),
  description: z.string(),
});

const exportOrdersSchema = z.object({
  format: z.enum(['csv', 'excel', 'pdf']),
  startDate: z.string(),
  endDate: z.string(),
  fields: z.array(z.string()),
});

// ════════════════════════════════════════
// 获取订单列表
// ════════════════════════════════════════

router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { status, search, amountRange, sortBy, limit, offset } = req.query;

    const orders = await orderService.getOrders(userId, {
      status: status as string,
      search: search as string,
      amountRange: amountRange as string,
      sortBy: sortBy as string,
      limit: limit ? parseInt(limit as string) : 50,
      offset: offset ? parseInt(offset as string) : 0,
    });

    res.json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ════════════════════════════════════════
// 获取订单详情
// ════════════════════════════════════════

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const order = await orderService.getOrderDetail(id);
    if (!order) {
      return res.status(404).json({ success: false, message: '订单不存在' });
    }

    if (order.user_id !== userId) {
      return res.status(403).json({ success: false, message: '无权访问此订单' });
    }

    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ════════════════════════════════════════
// 获取统计数据
// ════════════════════════════════════════

router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const stats = await orderService.getStats(userId);
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ════════════════════════════════════════
// 创建订单
// ════════════════════════════════════════

router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const data = createOrderSchema.parse(req.body);

    const orderId = await orderService.createOrder(userId, data);
    res.status(201).json({ success: true, data: { orderId } });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// ════════════════════════════════════════
// 取消订单
// ════════════════════════════════════════

router.post('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { reason } = cancelOrderSchema.parse(req.body);

    await orderService.cancelOrder(id, userId, reason);
    res.json({ success: true, message: '订单已取消' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// ════════════════════════════════════════
// 修改请求
// ════════════════════════════════════════

router.post('/:id/modify', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = modifyRequestSchema.parse(req.body);

    // TODO: 实现修改请求逻辑
    res.json({ success: true, message: '修改请求已提交' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// ════════════════════════════════════════
// 确认验收
// ════════════════════════════════════════

router.post('/:id/accept', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    await orderService.acceptOrder(id, userId);
    res.json({ success: true, message: '验收通过，款项将 T+1 日结算' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ════════════════════════════════════════
// 拒绝验收
// ════════════════════════════════════════

router.post('/:id/reject', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { reason } = rejectOrderSchema.parse(req.body);

    await orderService.rejectOrder(id, userId, reason);
    res.json({ success: true, message: '已拒绝验收，任务已重新开启' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// ════════════════════════════════════════
// 提交评价
// ════════════════════════════════════════

router.post('/:id/review', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const data = submitReviewSchema.parse(req.body);

    await orderService.submitReview(id, userId, data);
    res.json({ success: true, message: '评价已提交，正在 AI 审核中' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// ════════════════════════════════════════
// 提交申诉
// ════════════════════════════════════════

router.post('/:id/dispute', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const data = submitDisputeSchema.parse(req.body);

    // TODO: 实现申诉逻辑
    res.json({ success: true, message: '申诉已提交，AI 仲裁流程已启动' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// ════════════════════════════════════════
// 提交交付物
// ════════════════════════════════════════

router.post('/:id/delivery', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const data = submitDeliverySchema.parse(req.body);

    // TODO: 实现交付物提交逻辑
    res.json({ success: true, message: '交付物已提交' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// ════════════════════════════════════════
// 导出订单
// ════════════════════════════════════════

router.post('/export', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const data = exportOrdersSchema.parse(req.body);

    // TODO: 实现导出逻辑
    res.json({ success: true, message: '导出功能开发中' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
