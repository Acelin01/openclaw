import { Router } from 'express';
import { Response } from 'express';
import { z } from 'zod';
import { DatabaseService } from '../lib/db/service.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

const router: Router = Router();

// Validation schemas
const serviceSchema = z.object({
  title: z.string().min(1, '服务标题不能为空').max(200, '服务标题不能超过200字符'),
  description: z.string().min(1, '服务描述不能为空').max(2000, '服务描述不能超过2000字符'),
  category: z.string().min(1, '服务分类不能为空'),
  price: z.number().positive('价格必须大于0'),
  currency: z.string().min(1, '货币类型不能为空').default('CNY'),
  unit: z.string().min(1, '计价单位不能为空').max(50, '计价单位不能超过50字符'),
  minQuantity: z.number().int().positive('最小起订量必须为正整数').optional().default(1),
  deliveryTime: z.number().int().positive('交付时间必须为正整数'),
  location: z.string().optional(),
  images: z.array(z.string().url('图片URL格式不正确')).optional().default([]),
  specifications: z.array(z.object({
    name: z.string().min(1, '规格名称不能为空'),
    value: z.string().min(1, '规格值不能为空')
  })).optional().default([]),
  tags: z.array(z.string().min(1, '标签不能为空')).optional().default([]),
});

const inquiryResponseSchema = z.object({
  quotationId: z.string().min(1, '报价单ID不能为空'),
  price: z.number().positive('报价必须大于0'),
  currency: z.string().min(1, '货币类型不能为空').default('CNY'),
  deliveryTime: z.number().int().positive('交付时间必须为正整数'),
  description: z.string().min(1, '报价说明不能为空').max(1000, '报价说明不能超过1000字符'),
  attachments: z.array(z.string().url('附件URL格式不正确')).optional().default([]),
  validUntil: z.string().datetime().optional(),
});

// 获取服务商仪表板概览数据
router.get('/provider/dashboard', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const db = DatabaseService.getInstance();
    
    // 验证用户是否为服务商
    const user = await db.getUserById(userId);
    if (!user || user.role !== 'PROVIDER') {
      res.status(403).json({ 
        success: false, 
        message: '只有服务商可以访问此功能' 
      });
      return;
    }

    // 获取服务商的统计数据
    const quotations = await db.getQuotations({ userId });
    const inquiries = await db.getInquiries({ userId: userId }); // 获取服务商响应的询价
    const transactions = await db.getTransactions({ providerId: userId });

    // 计算统计数据
    const totalQuotations = quotations.length;
    const totalInquiries = inquiries.length;
    const totalTransactions = transactions.length;
    const totalRevenue = transactions
      .filter((t: any) => t.status === 'COMPLETED')
      .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

    // 获取最近的活动
    const recentQuotations = quotations.slice(0, 5);
    const recentInquiries = inquiries.slice(0, 5);

    res.json({
      success: true,
      data: {
        overview: {
          totalQuotations,
          totalInquiries,
          totalTransactions,
          totalRevenue,
          averageQuotationPrice: totalQuotations > 0 ? 
            quotations.reduce((sum: number, q: any) => sum + (q.priceRangeMin || 0), 0) / totalQuotations : 0
        },
        recentActivity: {
          quotations: recentQuotations,
          inquiries: recentInquiries
        },
        analytics: {
          monthlyTrends: await getMonthlyTrends(userId, db),
          categoryDistribution: await getCategoryDistribution(userId, db),
          performanceMetrics: await getPerformanceMetrics(userId, db)
        }
      }
    });
  } catch (error) {
    console.error('获取服务商仪表板数据失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取仪表板数据失败',
      error: process.env['NODE_ENV'] === 'development' ? (error as Error).message : undefined
    });
  }
});

// 获取服务商的服务列表
router.get('/provider/services', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { page = 1, limit = 10, status, category, search } = req.query;
    
    const db = DatabaseService.getInstance();
    
    // 验证用户是否为服务商
    const user = await db.getUserById(userId);
    if (!user || user.role !== 'PROVIDER') {
      res.status(403).json({ 
        success: false, 
        message: '只有服务商可以访问此功能' 
      });
      return;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // 构建查询条件
    const where: any = { userId };
    if (status) where.status = status;
    if (category) where.category = category;

    let quotations: any[] = await db.getQuotations(where, {
      skip,
      take: limitNum,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });

    // 应用搜索过滤
    if (search) {
      const searchLower = (search as string).toLowerCase();
      quotations = quotations.filter((q: any) => 
        q.title.toLowerCase().includes(searchLower) ||
        q.description.toLowerCase().includes(searchLower)
      );
    }

    const totalCount = await db.getQuotationsCount(where);

    res.json({
      success: true,
      data: {
        services: quotations,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          pages: Math.ceil(totalCount / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('获取服务商服务列表失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取服务列表失败',
      error: process.env['NODE_ENV'] === 'development' ? (error as Error).message : undefined
    });
  }
});

// 获取评论列表（支持按服务/服务商，分页；管理员可指定providerId）
router.get('/provider/reviews', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const db = DatabaseService.getInstance();
    const { page = 1, limit = 10, serviceId, providerId } = req.query as any;

    let targetProviderId = req.user!.id;
    if (req.user!.role === 'ADMIN' && providerId) {
      targetProviderId = String(providerId);
    }

    const pageNum = parseInt(String(page));
    const limitNum = parseInt(String(limit));
    const skip = (pageNum - 1) * limitNum;

    const where: any = { providerId: targetProviderId };
    if (serviceId) where.serviceId = String(serviceId);

    const [items, total] = await Promise.all([
      db.getReviews(where, { skip, take: limitNum, orderBy: { createdAt: 'desc' } }),
      db.getReviewsCount(where)
    ]);

    const breakdown: { [key: string]: number } = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    let sum = 0;
    for (const r of items as any[]) {
      const rating = Math.max(1, Math.min(5, Number(r.rating || 0)));
      const k = String(rating);
      breakdown[k] = (breakdown[k] || 0) + 1;
      sum += rating;
    }
    const average = items.length > 0 ? Number((sum / items.length).toFixed(2)) : 0;

    res.json({
      success: true,
      data: {
        reviews: items,
        summary: { average, breakdown },
        pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) }
      },
      message: '评论列表获取成功'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取评论失败', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// 获取建议列表（使用通知作为数据源；管理员可指定providerId）
router.get('/provider/suggestions', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const db = DatabaseService.getInstance();
    const { page = 1, limit = 10, providerId } = req.query as any;
    let targetProviderId = req.user!.id;
    if (req.user!.role === 'ADMIN' && providerId) {
      targetProviderId = String(providerId);
    }
    const pageNum = parseInt(String(page));
    const limitNum = parseInt(String(limit));
    const skip = (pageNum - 1) * limitNum;

    const notifications = await db.getNotifications({ userId: targetProviderId }, { skip, take: limitNum, orderBy: { createdAt: 'desc' } });
    const total = await db.getUnreadNotificationCount(targetProviderId) + (notifications.length || 0);

    res.json({
      success: true,
      data: { suggestions: notifications, pagination: { page: pageNum, limit: limitNum, total } },
      message: '建议列表获取成功'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取建议失败', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// 创建新服务
router.post('/provider/services', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    
    // Validate request body
    const validationResult = serviceSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: '输入数据验证失败',
        errors: validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
      return;
    }
    
    const serviceData = validationResult.data;
    const db = DatabaseService.getInstance();
    
    // 验证用户是否为服务商
    const user = await db.getUserById(userId);
    if (!user || user.role !== 'PROVIDER') {
      res.status(403).json({ 
        success: false, 
        message: '只有服务商可以创建服务' 
      });
      return;
    }

    const newService = await db.createQuotation({
      ...serviceData,
      userId,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.json({
      success: true,
      data: newService,
      message: '服务创建成功'
    });
  } catch (error) {
    console.error('创建服务失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '创建服务失败',
      error: process.env['NODE_ENV'] === 'development' ? (error as Error).message : undefined
    });
  }
});

// 更新服务
router.put('/provider/services/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ 
        success: false, 
        message: '服务ID不能为空' 
      });
      return;
    }
    const updateData = req.body;
    
    const db = DatabaseService.getInstance();
    
    // 验证服务归属
    const service = await db.getQuotationById(id!);
    if (!service || service.userId !== userId) {
      res.status(403).json({ 
        success: false, 
        message: '无权更新此服务' 
      });
      return;
    }

    const updatedService = await db.updateQuotation(id!, {
      ...updateData,
      updatedAt: new Date()
    });

    res.json({
      success: true,
      data: updatedService,
      message: '服务更新成功'
    });
  } catch (error) {
    console.error('更新服务失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '更新服务失败',
      error: process.env['NODE_ENV'] === 'development' ? (error as Error).message : undefined
    });
  }
});

// 删除服务
router.delete('/provider/services/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    
    const db = DatabaseService.getInstance();
    
    // 验证服务归属
    const service = await db.getQuotationById(id!);
    if (!service || service.userId !== userId) {
      res.status(403).json({ 
        success: false, 
        message: '无权删除此服务' 
      });
      return;
    }

    await db.deleteQuotation(id!);

    res.json({
      success: true,
      message: '服务删除成功'
    });
  } catch (error) {
    console.error('删除服务失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '删除服务失败',
      error: process.env['NODE_ENV'] === 'development' ? (error as Error).message : undefined
    });
  }
});

// 获取服务商的询价列表
router.get('/provider/inquiries', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { page = 1, limit = 10, status, search } = req.query;
    
    const db = DatabaseService.getInstance();
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // 获取服务商收到的询价（基于服务商的服务）
    const services = await db.getQuotations({ userId });

    let inquiries: any[] = await db.getInquiries({
      status: status as string,
      skip,
      take: limitNum,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });

    // 过滤与服务商服务相关的询价
    inquiries = inquiries.filter((inquiry: any) => 
      inquiry.category && services.some((s: any) => s.category === inquiry.category)
    );

    // 应用搜索过滤
    if (search) {
      const searchLower = (search as string).toLowerCase();
      inquiries = inquiries.filter((inquiry: any) => 
        inquiry.title.toLowerCase().includes(searchLower) ||
        inquiry.description.toLowerCase().includes(searchLower)
      );
    }

    res.json({
      success: true,
      data: {
        inquiries,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: inquiries.length,
          pages: Math.ceil(inquiries.length / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('获取服务商询价列表失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取询价列表失败',
      error: process.env['NODE_ENV'] === 'development' ? (error as Error).message : undefined
    });
  }
});

// 响应询价
router.post('/provider/inquiries/:id/respond', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '用户未认证'
      });
    }
    
    // Validate request body
    const validationResult = inquiryResponseSchema.safeParse(req.body);
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
    
    const responseData = validationResult.data;
    
    const userId = req.user!.id;
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: '询价ID不能为空'
      });
    }
    
    const { quotationId, price } = responseData;
    
    const db = DatabaseService.getInstance();
    
    // 验证服务商是否有权限响应此询价
    const inquiry = await db.getInquiryById(id);
    if (!inquiry) {
      return res.status(404).json({ 
        success: false, 
        message: '询价不存在' 
      });
    }

    // 验证报价单归属
    const quotation = await db.getQuotationById(quotationId);
    if (!quotation || quotation.userId !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: '无权使用此报价单响应' 
      });
    }

    // 创建响应
    const response = await db.createInquiryResponse({
      inquiryId: id,
      providerId: userId,
      quotationId,
      price,
      status: 'PENDING',
      createdAt: new Date()
    });

    return res.json({
      success: true,
      data: response,
      message: '响应提交成功'
    });
  } catch (error) {
    console.error('响应询价失败:', error);
    return res.status(500).json({ 
      success: false, 
      message: '响应询价失败',
      error: process.env['NODE_ENV'] === 'development' ? (error as Error).message : undefined
    });
  }
});

// 获取服务商的交易记录
router.get('/provider/transactions', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { page = 1, limit = 10, status } = req.query;
    
    const db = DatabaseService.getInstance();
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { providerId: userId };
    if (status) where.status = status;

    const transactions = await db.getTransactions(where, {
      skip,
      take: limitNum,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });

    const totalCount = await db.getTransactionsCount(where);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          pages: Math.ceil(totalCount / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('获取交易记录失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取交易记录失败',
      error: process.env['NODE_ENV'] === 'development' ? (error as Error).message : undefined
    });
  }
});

// 获取服务商分析数据
router.get('/provider/analytics', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { period = '30d' } = req.query;
    
    const db = DatabaseService.getInstance();
    
    const analytics = await getProviderAnalytics(userId, period as string, db);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('获取分析数据失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取分析数据失败',
      error: process.env['NODE_ENV'] === 'development' ? (error as Error).message : undefined
    });
  }
});

// 辅助函数：获取月度趋势
async function getMonthlyTrends(_userId: string, _db: DatabaseService) {
  // 模拟月度趋势数据
  const months = ['1月', '2月', '3月', '4月', '5月', '6月'];
  return months.map(month => ({
    month,
    quotations: Math.floor(Math.random() * 20) + 5,
    inquiries: Math.floor(Math.random() * 15) + 3,
    transactions: Math.floor(Math.random() * 10) + 1,
    revenue: Math.floor(Math.random() * 50000) + 10000
  }));
}

// 辅助函数：获取分类分布
async function getCategoryDistribution(userId: string, db: DatabaseService) {
  const quotations = await db.getQuotations({ userId });
  const categories: Record<string, number> = {};
  
  quotations.forEach((q: any) => {
    categories[q.category] = (categories[q.category] || 0) + 1;
  });
  
  return Object.entries(categories).map(([category, count]) => ({
    category,
    count,
    percentage: Math.round((count / quotations.length) * 100)
  }));
}

// 辅助函数：获取性能指标
async function getPerformanceMetrics(userId: string, db: DatabaseService) {
  const quotations = await db.getQuotations({ userId });
  const transactions = await db.getTransactions({ providerId: userId });
  
  const totalQuotations = quotations.length;
  const totalTransactions = transactions.length;
  const completedTransactions = transactions.filter((t: any) => t.status === 'COMPLETED').length;
  
  return {
    conversionRate: totalQuotations > 0 ? Math.round((totalTransactions / totalQuotations) * 100) : 0,
    completionRate: totalTransactions > 0 ? Math.round((completedTransactions / totalTransactions) * 100) : 0,
    averageResponseTime: '2.5小时',
    customerSatisfaction: 4.8
  };
}

// 辅助函数：获取服务商分析数据
async function getProviderAnalytics(userId: string, _period: string, db: DatabaseService) {
  return {
    overview: await getMonthlyTrends(userId, db),
    categories: await getCategoryDistribution(userId, db),
    performance: await getPerformanceMetrics(userId, db)
  };
}

// 获取服务商的订单列表
router.get('/provider/orders', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { page = 1, limit = 10, status } = req.query;
    
    const db = DatabaseService.getInstance();
    
    // 验证用户是否为服务商
    const user = await db.getUserById(userId);
    if (!user || user.role !== 'PROVIDER') {
      res.status(403).json({ 
        success: false, 
        message: '只有服务商可以访问此功能' 
      });
      return;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // 获取服务商的服务ID列表
    const services = await db.getQuotations({ userId });
    const serviceIds = services.map((s: any) => s.id);

    if (serviceIds.length === 0) {
      res.json({
        success: true,
        data: {
          orders: [],
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: 0,
            pages: 0
          }
        }
      });
      return;
    }

    // 构建订单查询条件
    const where: any = {
      serviceId: { in: serviceIds }
    };
    if (status) where.status = status;

    // 获取订单列表
    const orders = await db.getTransactions(where, {
      skip,
      take: limitNum,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      include: {
        service: true,
        transactions: true
      }
    });

    const totalCount = await db.getTransactionsCount(where);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          pages: Math.ceil(totalCount / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('获取服务商订单列表失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取订单列表失败',
      error: process.env['NODE_ENV'] === 'development' ? (error as Error).message : undefined
    });
  }
});

// 更新订单状态（服务商操作）
router.put('/provider/orders/:id/status', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { status } = req.body;
    
    if (!id) {
      res.status(400).json({ 
        success: false, 
        message: '订单ID不能为空' 
      });
      return;
    }

    if (!status) {
      res.status(400).json({ 
        success: false, 
        message: '订单状态不能为空' 
      });
      return;
    }

    const db = DatabaseService.getInstance();
    
    // 验证用户是否为服务商
    const user = await db.getUserById(userId);
    if (!user || user.role !== 'PROVIDER') {
      res.status(403).json({ 
        success: false, 
        message: '只有服务商可以访问此功能' 
      });
      return;
    }

    // 获取订单信息
    const order = await db.getTransactionById(id);
    if (!order) {
      res.status(404).json({ 
        success: false, 
        message: '订单不存在' 
      });
      return;
    }

    // 验证订单是否属于当前服务商
    const quotation = await db.getQuotationById(order.quotationId);
    if (!quotation || quotation.userId !== userId) {
      res.status(403).json({ 
        success: false, 
        message: '无权更新此订单' 
      });
      return;
    }

    // 更新订单状态
    const updatedOrder = await db.updateTransaction(id, {
      status
    });

    // 如果订单完成，创建交易记录
    if (status === 'COMPLETED') {
      await db.createTransaction({
        inquiryId: order.inquiryId,
        quotationId: order.quotationId,
        customerId: order.customerId,
        providerId: order.providerId,
        amount: order.amount,
        currency: order.currency,
        status: 'completed',
        paymentStatus: 'completed'
      });
    }

    res.json({
      success: true,
      data: updatedOrder,
      message: '订单状态更新成功'
    });
  } catch (error) {
    console.error('更新订单状态失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '更新订单状态失败',
      error: process.env['NODE_ENV'] === 'development' ? (error as Error).message : undefined
    });
  }
});

// 获取服务商订单统计
router.get('/provider/orders/stats', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    
    const db = DatabaseService.getInstance();
    
    // 验证用户是否为服务商
    const user = await db.getUserById(userId);
    if (!user || user.role !== 'PROVIDER') {
      res.status(403).json({ 
        success: false, 
        message: '只有服务商可以访问此功能' 
      });
      return;
    }

    // 获取服务商的服务ID列表
    const services = await db.getQuotations({ userId });
    const serviceIds = services.map((s: any) => s.id);

    if (serviceIds.length === 0) {
      res.json({
        success: true,
        data: {
          totalOrders: 0,
          pendingOrders: 0,
          completedOrders: 0,
          totalRevenue: 0,
          monthlyRevenue: 0,
          averageOrderValue: 0
        }
      });
      return;
    }

    // 获取订单统计
    const where = { serviceId: { in: serviceIds } };
    const allOrders = await db.getTransactions(where);
    
    const pendingOrders = allOrders.filter((o: any) => o.status === 'PENDING').length;
    const completedOrders = allOrders.filter((o: any) => o.status === 'COMPLETED').length;
    const totalRevenue = allOrders
      .filter((o: any) => o.status === 'COMPLETED')
      .reduce((sum: number, o: any) => sum + (o.amount || 0), 0);

    // 计算本月收入（简化计算）
    const currentMonth = new Date().getMonth();
    const monthlyRevenue = allOrders
      .filter((o: any) => {
        const orderDate = new Date(o.createdAt);
        return o.status === 'COMPLETED' && orderDate.getMonth() === currentMonth;
      })
      .reduce((sum: number, o: any) => sum + (o.amount || 0), 0);

    const averageOrderValue = allOrders.length > 0 ? totalRevenue / allOrders.length : 0;

    res.json({
      success: true,
      data: {
        totalOrders: allOrders.length,
        pendingOrders,
        completedOrders,
        totalRevenue,
        monthlyRevenue,
        averageOrderValue
      }
    });
  } catch (error) {
    console.error('获取服务商订单统计失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取订单统计失败',
      error: process.env['NODE_ENV'] === 'development' ? (error as Error).message : undefined
    });
  }
});

export default router;
