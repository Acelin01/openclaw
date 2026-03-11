/**
 * 计费结算 API 路由
 * 对应文档：M08 计费结算 (F08-01 ~ F08-12)
 */

import express, { Router } from 'express';
import { z } from 'zod';
import { billingService } from '../services/billing.service.js';
import { authenticateToken } from '../middleware/auth.js';
import { Parser } from 'json2csv';

const router: Router = express.Router();

// ════════════════════════════════════════
// Schema 定义
// ════════════════════════════════════════

const rechargeSchema = z.object({
  amount: z.number().min(1).max(50000),
  method: z.enum(['alipay', 'wechat', 'bank']),
});

const autoRechargeSchema = z.object({
  enabled: z.boolean(),
  threshold: z.number().min(10).max(1000),
  rechargeAmount: z.number().min(50).max(5000),
  paymentMethod: z.enum(['alipay', 'wechat', 'bank']),
});

const withdrawalSchema = z.object({
  amount: z.number().min(100).max(50000),
  bankName: z.string().min(1),
  bankAccount: z.string().min(10),
});

const couponRedeemSchema = z.object({
  code: z.string().min(1).max(50),
});

const exportSchema = z.object({
  format: z.enum(['csv', 'json', 'xlsx']),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  type: z.enum(['billing', 'earnings', 'withdrawal']),
});

// ════════════════════════════════════════
// 余额管理
// ════════════════════════════════════════

router.get('/balance', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const balance = await billingService.getBalance(userId);
    const stats = await billingService.getBillingStats(userId);
    
    res.json({
      success: true,
      data: {
        balance: balance || { balance: 0, frozenBalance: 0 },
        stats
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/recharge', authenticateToken, async (req, res) => {
  try {
    const { amount, method } = rechargeSchema.parse(req.body);
    const userId = (req as any).user.id;
    
    // TODO: 集成实际支付渠道
    const balance = await billingService.updateBalance(userId, amount, 'add');
    
    res.json({
      success: true,
      data: { balance, transactionId: `TXN-${Date.now()}` }
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ════════════════════════════════════════
// 自动充值配置
// ════════════════════════════════════════

router.get('/auto-recharge', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const config = await billingService.getAutoRechargeConfig(userId);
    
    res.json({
      success: true,
      data: config
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/auto-recharge', authenticateToken, async (req, res) => {
  try {
    const config = autoRechargeSchema.parse(req.body);
    const userId = (req as any).user.id;
    
    const updated = await billingService.updateAutoRechargeConfig(userId, config);
    
    res.json({
      success: true,
      data: updated
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ════════════════════════════════════════
// 实时扣费控制
// ════════════════════════════════════════

router.post('/billing/start', authenticateToken, async (req, res) => {
  try {
    const { orderId, ratePerHour, intervalSeconds } = req.body;
    const userId = (req as any).user.id;
    
    billingService.startBillingTimer(orderId, userId, ratePerHour, intervalSeconds);
    
    res.json({
      success: true,
      message: '计费已启动'
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/billing/stop', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = (req as any).user.id;
    
    billingService.stopBillingTimer(orderId);
    
    res.json({
      success: true,
      message: '计费已停止'
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/billing/status/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const status = billingService.getBillingStatus(orderId);
    
    res.json({
      success: true,
      data: status
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ════════════════════════════════════════
// 账单记录
// ════════════════════════════════════════

router.get('/records', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { limit, offset, startDate, endDate, type } = req.query;
    
    const records = await billingService.getBillingRecords(userId, {
      limit: limit ? parseInt(limit as string) : 50,
      offset: offset ? parseInt(offset as string) : 0,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      type: type as string
    });
    
    res.json({
      success: true,
      data: records
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ════════════════════════════════════════
// 收益管理
// ════════════════════════════════════════

router.get('/earnings', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { limit } = req.query;
    
    const records = await billingService.getEarningsRecords(
      userId,
      limit ? parseInt(limit as string) : 50
    );
    
    res.json({
      success: true,
      data: records
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ════════════════════════════════════════
// 提现管理
// ════════════════════════════════════════

router.post('/withdrawal', authenticateToken, async (req, res) => {
  try {
    const { amount, bankName, bankAccount } = withdrawalSchema.parse(req.body);
    const userId = (req as any).user.id;
    
    const withdrawal = await billingService.requestWithdrawal(userId, amount, bankName, bankAccount);
    
    res.json({
      success: true,
      data: withdrawal,
      message: '提现申请已提交，预计 T+1 工作日到账'
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/withdrawals', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { limit } = req.query;
    
    const records = await billingService.getWithdrawalRecords(
      userId,
      limit ? parseInt(limit as string) : 50
    );
    
    res.json({
      success: true,
      data: records
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ════════════════════════════════════════
// 优惠券管理
// ════════════════════════════════════════

router.get('/coupons', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const coupons = await billingService.getCoupons(userId);
    
    res.json({
      success: true,
      data: coupons
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/coupons/redeem', authenticateToken, async (req, res) => {
  try {
    const { code } = couponRedeemSchema.parse(req.body);
    const userId = (req as any).user.id;
    
    const coupon = await billingService.addCoupon(userId, code);
    
    if (!coupon) {
      return res.status(404).json({ success: false, message: '优惠券码无效或已过期' });
    }
    
    res.json({
      success: true,
      data: coupon,
      message: '兑换成功！'
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/coupons/:couponId/use', authenticateToken, async (req, res) => {
  try {
    const { couponId } = req.params;
    const userId = (req as any).user.id;
    
    await billingService.useCoupon(couponId, userId);
    
    res.json({
      success: true,
      message: '优惠券已使用'
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ════════════════════════════════════════
// 数据导出
// ════════════════════════════════════════

router.post('/export', authenticateToken, async (req, res) => {
  try {
    const { format, startDate, endDate, type } = exportSchema.parse(req.body);
    const userId = (req as any).user.id;
    
    let data: any[] = [];
    let filename = '';
    
    switch (type) {
      case 'billing':
        data = await billingService.getBillingRecords(userId, {
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          limit: 1000
        });
        filename = `billing_records_${Date.now()}`;
        break;
      case 'earnings':
        data = await billingService.getEarningsRecords(userId, 1000);
        filename = `earnings_records_${Date.now()}`;
        break;
      case 'withdrawal':
        data = await billingService.getWithdrawalRecords(userId, 1000);
        filename = `withdrawal_records_${Date.now()}`;
        break;
    }
    
    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
      return res.json({ success: true, data });
    }
    
    if (format === 'csv') {
      const parser = new Parser();
      const csv = parser.parse(data);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      return res.send(csv);
    }
    
    res.status(400).json({ success: false, message: '不支持的导出格式' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ════════════════════════════════════════
// 统计概览
// ════════════════════════════════════════

router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const stats = await billingService.getBillingStats(userId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
