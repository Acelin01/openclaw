import express, { Router } from 'express';
import { Response } from 'express';
import { z } from 'zod';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { DatabaseService } from '../lib/db/service.js';

const router: Router = express.Router();
const db = DatabaseService.getInstance();

// Validation schemas
const createTransactionSchema = z.object({
  inquiryId: z.string().min(1, '询价单ID不能为空').optional(),
  quotationId: z.string().min(1, '报价单ID不能为空').optional(),
  providerId: z.string().min(1, '服务商ID不能为空'),
  amount: z.number().positive('交易金额必须大于0'),
  currency: z.string().min(1, '货币类型不能为空'),
  paymentMethod: z.enum(['bank_transfer', 'credit_card', 'alipay', 'wechat_pay', 'paypal']).optional().default('bank_transfer'),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  contractData: z.any().optional(),
  milestones: z.array(z.any()).optional(),
}).refine(data => data.inquiryId || data.quotationId, {
  message: '询价单ID或报价单ID必须提供至少一个',
  path: ['inquiryId', 'quotationId']
});

const updateTransactionSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'disputed', 'refunded', 'in_progress', 'completed']).optional(),
  paymentStatus: z.enum(['pending', 'failed', 'refunded', 'completed']).optional(),
  amount: z.number().positive('交易金额必须大于0').optional(),
  currency: z.string().min(1, '货币类型不能为空').optional(),
  paymentMethod: z.enum(['bank_transfer', 'credit_card', 'alipay', 'wechat_pay', 'paypal']).optional(),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
});

const transactionQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'disputed']).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'amount', 'status']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  category: z.string().optional(),
});

// Get all transactions (with authentication)
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Validate query parameters
    const validationResult = transactionQuerySchema.safeParse(req.query);
    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: '查询参数验证失败',
        errors: validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
      return;
    }

    const { 
      page, 
      limit, 
      search,
      status, 
      sortBy,
      sortOrder,
      startDate,
      endDate,
      category
    } = validationResult.data;
    
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: '用户未认证'
      });
      return;
    }
    
    const userId = req.user.id;
    const userRole = req.user.role;
    
    let where: any = {};
    
    // Filter by user role
    if (userRole === 'customer') {
      where.customerId = userId;
    } else if (userRole === 'provider') {
      where.providerId = userId;
    }

    // Search functionality
    if (search) {
      where.OR = [
        { id: { contains: search } },
        { customer: { name: { contains: search } } },
        { provider: { name: { contains: search } } },
        { quotation: { title: { contains: search } } }
      ];
    }
    
    // Filter by status
    if (status) {
      where.status = status;
    }
    
    // Filter by category (if provided)
    if (category) {
      where.category = category;
    }
    
    // Filter by date range
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string);
      }
    }
    
    // Get transactions with pagination
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    
    const [transactions, total] = await Promise.all([
      db.getTransactions(where, { 
        skip, 
        take, 
        orderBy: { [sortBy as string]: sortOrder },
        include: {
          customer: true,
          provider: true,
          quotation: true,
          inquiry: true
        }
      }),
      db.getTransactionsCount(where)
    ]);
    
    const totalPages = Math.ceil(total / take);
    
    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages,
          hasNext: Number(page) < totalPages,
          hasPrev: Number(page) > 1
        }
      },
      message: '交易列表获取成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取交易列表失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get transaction by ID
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({
        success: false,
        message: '交易ID不能为空'
      });
      return;
    }
    
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: '用户未认证'
      });
      return;
    }
    
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const transaction = await db.getTransactionById(id);
    
    if (!transaction) {
      res.status(404).json({
        success: false,
        message: '交易不存在'
      });
      return;
    }
    
    // Check if user has access to this transaction
    if (userRole === 'customer' && transaction.customerId !== userId) {
      res.status(403).json({
        success: false,
        message: '无权访问此交易'
      });
      return;
    }
    
    if (userRole === 'provider' && transaction.providerId !== userId) {
      res.status(403).json({
        success: false,
        message: '无权访问此交易'
      });
      return;
    }
    
    res.json({
      success: true,
      data: transaction,
      message: '交易详情获取成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取交易详情失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create transaction
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '用户未认证'
      });
    }
    
    // Validate request body
    const validationResult = createTransactionSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: '输入数据验证失败',
        errors: validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    
    const {
      inquiryId,
      quotationId,
      amount,
      currency = 'CNY',
      providerId,
      contractData,
      milestones
    } = validationResult.data;
    
    const customerId = req.user.id;
    
    // Validate required fields
    if (!inquiryId && !quotationId) {
      return res.status(400).json({
        success: false,
        message: '询价单ID或报价单ID必须提供至少一个'
      });
    }
    
    if (!providerId) {
      return res.status(400).json({
        success: false,
        message: '服务商ID不能为空'
      });
    }
    
    // Verify that the inquiry/quotation belongs to the customer
    if (inquiryId) {
      const inquiry = await db.getInquiryById(inquiryId);
      if (!inquiry || inquiry.userId !== customerId) {
        return res.status(403).json({
          success: false,
          message: '无权创建此交易的询价单'
        });
      }
    }
    
    if (quotationId) {
      const quotation = await db.getQuotationById(quotationId);
      if (!quotation || quotation.userId !== providerId) {
        return res.status(403).json({
          success: false,
          message: '报价单信息验证失败'
        });
      }
    }
    
    // Create transaction
    const transactionData: any = {
      customerId,
      providerId,
      amount,
      currency,
      contractData,
      milestones,
      status: 'pending',
      paymentStatus: 'pending'
    };
    
    if (inquiryId) transactionData.inquiryId = inquiryId;
    if (quotationId) transactionData.quotationId = quotationId;
    
    const transaction = await db.createTransaction(transactionData);
    
    return res.json({
      success: true,
      data: transaction,
      message: '交易创建成功'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: '创建交易失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update transaction status
router.put('/:id/status', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: '交易ID不能为空'
      });
    }
    
    // Validate request body
    const validationResult = updateTransactionSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: '输入数据验证失败',
        errors: validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    
    const { status, paymentStatus } = validationResult.data;
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '用户未认证'
      });
    }
    
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const transaction = await db.getTransactionById(id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: '交易不存在'
      });
    }
    
    // Check authorization
    if (userRole === 'customer' && transaction.customerId !== userId) {
      return res.status(403).json({
        success: false,
        message: '无权更新此交易状态'
      });
    }
    
    if (userRole === 'provider' && transaction.providerId !== userId) {
      return res.status(403).json({
        success: false,
        message: '无权更新此交易状态'
      });
    }
    
    // Validate status transitions
    const validStatusTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['in_progress', 'cancelled'],
      in_progress: ['completed', 'disputed'],
      completed: ['disputed'],
      disputed: ['refunded', 'completed'],
      refunded: [],
      cancelled: []
    };
    
    if (status && !validStatusTransitions[transaction.status as keyof typeof validStatusTransitions]?.includes(status as never)) {
      return res.status(400).json({
        success: false,
        message: `无效的状态转换: ${transaction.status} -> ${status}`
      });
    }
    
    const updatedTransaction = await db.updateTransaction(id, {
      status: status || transaction.status,
      paymentStatus: paymentStatus || transaction.paymentStatus,
      ...(status === 'in_progress' && { startedAt: new Date() }),
      ...(status === 'completed' && { completedAt: new Date() })
    });
    
    return res.json({
      success: true,
      data: updatedTransaction,
      message: '交易状态更新成功'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: '更新交易状态失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update transaction milestones
router.put('/:id/milestones', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { milestones } = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: '交易ID不能为空'
      });
    }
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '用户未认证'
      });
    }
    
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const transaction = await db.getTransactionById(id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: '交易不存在'
      });
    }
    
    // Check authorization
    if (userRole === 'customer' && transaction.customerId !== userId) {
      return res.status(403).json({
        success: false,
        message: '无权更新此交易里程碑'
      });
    }
    
    if (userRole === 'provider' && transaction.providerId !== userId) {
      return res.status(403).json({
        success: false,
        message: '无权更新此交易里程碑'
      });
    }
    
    const updatedTransaction = await db.updateTransaction(id, { milestones });
    
    return res.json({
      success: true,
      data: updatedTransaction,
      message: '交易里程碑更新成功'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: '更新交易里程碑失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get transaction statistics
router.get('/stats/summary', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '用户未认证'
      });
    }
    
    const userId = req.user.id;
    const userRole = req.user.role;
    
    let where: any = {};
    
    if (userRole === 'customer') {
      where.customerId = userId;
    } else if (userRole === 'provider') {
      where.providerId = userId;
    }
    
    const transactions = await db.getTransactions(where);
    
    // Calculate detailed statistics
    const total = transactions.length;
    const pending = transactions.filter((t: any) => t.status === 'pending').length;
    const inProgress = transactions.filter((t: any) => t.status === 'in_progress').length;
    const completed = transactions.filter((t: any) => t.status === 'completed').length;
    const disputed = transactions.filter((t: any) => t.status === 'disputed').length;
    const cancelled = transactions.filter((t: any) => t.status === 'cancelled').length;
    const refunded = transactions.filter((t: any) => t.status === 'refunded').length;
    
    const totalAmount = transactions
      .filter((t: any) => t.status === 'completed')
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    
    const avgTransactionValue = completed > 0 ? totalAmount / completed : 0;
    
    // Calculate completion rate
    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    
    // Calculate average response time (mock data for now)
    const avgResponseTime = '2.5小时';
    
    // Calculate monthly growth (mock data)
    const monthlyGrowth = 15.2;
    
    const stats = {
      overview: {
        total,
        pending,
        inProgress,
        completed,
        disputed,
        cancelled,
        refunded
      },
      financial: {
        totalAmount,
        avgTransactionValue: Math.round(avgTransactionValue),
        completionRate: Math.round(completionRate * 100) / 100,
        monthlyGrowth: Math.round(monthlyGrowth * 100) / 100
      },
      performance: {
        avgResponseTime,
        successRate: Math.round((100 - (disputed / total) * 100) * 100) / 100
      }
    };
    
    return res.json({
      success: true,
      data: stats,
      message: '交易统计获取成功'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: '获取交易统计失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get transaction trends and analytics
router.get('/stats/trends', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '用户未认证'
      });
    }
    
    const userId = req.user.id;
    const userRole = req.user.role;
    const { period = '30d' } = req.query;
    
    let where: any = {};
    
    if (userRole === 'customer') {
      where.customerId = userId;
    } else if (userRole === 'provider') {
      where.providerId = userId;
    }
    
    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    where.createdAt = { gte: startDate };
    
    const transactions = await db.getTransactions(where);
    
    // Generate daily trends
    const dailyTrends: { [key: string]: { date: string; count: number; amount: number; completed: number } } = {};
    const categoryBreakdown: { [key: string]: { category: string; count: number; amount: number } } = {};
    const statusTimeline: { [key: string]: { date: string; pending: number; confirmed: number; in_progress: number; completed: number; disputed: number; refunded: number } } = {};
    
    transactions.forEach((transaction: any) => {
      const date = new Date(transaction.createdAt).toISOString().split('T')[0];
      
      if (!date) return;
      
      // Daily trends
      if (!dailyTrends[date]) {
        dailyTrends[date] = {
          date,
          count: 0,
          amount: 0,
          completed: 0
        };
      }
      
      dailyTrends[date].count++;
      dailyTrends[date].amount += transaction.amount;
      
      if (transaction.status === 'completed') {
        dailyTrends[date].completed++;
      }
      
      // Category breakdown (skip for now as transaction doesn't have category field)
      // This would need to be implemented by joining with quotations/inquiries
      // const category = transaction.category || '其他';
      // if (!categoryBreakdown[category]) {
      //   categoryBreakdown[category] = {
      //     category,
      //     count: 0,
      //     amount: 0,
      //     avgAmount: 0
      //   };
      // }
      // 
      // categoryBreakdown[category].count++;
      // categoryBreakdown[category].amount += transaction.amount;
      
      // Status timeline
      if (!statusTimeline[date]) {
        statusTimeline[date] = {
          date,
          pending: 0,
          confirmed: 0,
          in_progress: 0,
          completed: 0,
          disputed: 0,
          refunded: 0
        };
      }
      
      if (statusTimeline[date]) {
        statusTimeline[date][transaction.status as keyof typeof statusTimeline[string]]++;
      }
    });
    
    // Calculate average amounts for categories (skip for now)
    // Object.keys(categoryBreakdown).forEach(category => {
    //   const data = categoryBreakdown[category];
    //   data.avgAmount = Math.round(data.amount / data.count);
    // });
    
    const trends = {
      daily: Object.values(dailyTrends).sort((a, b) => a.date.localeCompare(b.date)),
      categories: Object.values(categoryBreakdown),
      statusTimeline: Object.values(statusTimeline).sort((a, b) => a.date.localeCompare(b.date))
    };
    
    return res.json({
      success: true,
      data: trends,
      message: '交易趋势数据获取成功'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: '获取交易趋势失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
