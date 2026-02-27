import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { DatabaseService } from '../lib/db/service.js';
import { prisma } from '../lib/db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router: Router = Router();

// Validation schemas
const marketplaceQuerySchema = z.object({
  type: z.enum(['all', 'quotations', 'inquiries']).optional().default('all'),
  category: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'price', 'title']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// 获取市场广场数据（报价和询价）
router.get('/', async (req, res) => {
  try {
    // Validate query parameters
    const validationResult = marketplaceQuerySchema.safeParse(req.query);
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

    const { type, category, search, page, limit, sortBy, sortOrder } = validationResult.data;

    const pageNum = page;
    const limitNum = limit;
    const skip = (pageNum - 1) * limitNum;

    const db = DatabaseService.getInstance();
    
    let quotations: any[] = [];
    let inquiries: any[] = [];

    if (type === 'all' || type === 'quotations') {
      const where: any = {}
      if (category) where.category = category
      quotations = await db.getQuotations(where, { skip, take: limitNum, sortBy: sortBy as string, sortOrder: sortOrder as 'asc' | 'desc' })
    }

    if (type === 'all' || type === 'inquiries') {
      const where: any = {}
      if (category) where.category = category
      inquiries = await db.getInquiries(where, { skip, take: limitNum, sortBy: sortBy as string, sortOrder: sortOrder as 'asc' | 'desc' })
    }

    // 为报价补充封面图与套餐计划（用于最小价摘要）
    let coverMap: Record<string, string | undefined> = {}
    let packagesByQuotationId: Record<string, any[]> = {}
    let packagesByServiceId: Record<string, any[]> = {}
    try {
      if (prisma && quotations.length > 0) {
        const userIds = Array.from(new Set(quotations.map((q: any) => q.userId).filter(Boolean)))
        const quotationIds = Array.from(new Set(quotations.map((q: any) => q.id)))
        const serviceIds = Array.from(new Set((quotations.map((q: any) => (q as any).serviceId).filter(Boolean))))

        if (userIds.length > 0) {
          const profiles = await prisma.workerProfile.findMany({
            where: { userId: { in: userIds } },
            include: { services: true }
          })
          for (const p of profiles as any[]) {
            const svc = (p.services || []).find((s: any) => !!s.coverImageUrl) || (p.services || [])[0]
            coverMap[p.userId] = svc?.coverImageUrl || undefined
          }
        }

        const services = await prisma.workerService.findMany({
          where: {
            OR: [
              { quotationId: { in: quotationIds } },
              { id: { in: serviceIds } }
            ]
          },
          include: {
            packages: { include: { plans: true } }
          }
        })
        for (const s of services as any[]) {
          if (s.quotationId) packagesByQuotationId[s.quotationId] = s.packages || []
          packagesByServiceId[s.id] = s.packages || []
        }
      }
    } catch {}

    // 获取总数
    const quotationCount = type === 'all' || type === 'quotations' ? 
      await db.getQuotationsCount({ category: category as string, search: search as string }) : 0;
    
    const inquiryCount = type === 'all' || type === 'inquiries' ? 
      await db.getInquiriesCount({ category: category as string, search: search as string }) : 0;

    const totalCount = type === 'all' ? quotationCount + inquiryCount : 
      type === 'quotations' ? quotationCount : inquiryCount;

    res.json({
      success: true,
      data: {
        items: [
          ...quotations.map(q => ({ 
            ...q, 
            type: 'quotation', 
            coverImageUrl: coverMap[(q as any).userId],
            packages: packagesByQuotationId[(q as any).id] || packagesByServiceId[(q as any).serviceId] || []
          })),
          ...inquiries.map(i => ({ ...i, type: 'inquiry' }))
        ].sort((a, b) => {
          const aVal = new Date(a[sortBy as keyof typeof a] as string).getTime();
          const bVal = new Date(b[sortBy as keyof typeof b] as string).getTime();
          return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
        }),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          pages: Math.ceil(totalCount / limitNum)
        },
        counts: {
          quotations: quotationCount,
          inquiries: inquiryCount
        }
      }
    });
  } catch (error) {
    console.error('获取市场广场数据失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取市场广场数据失败',
      error: process.env['NODE_ENV'] === 'development' && error instanceof Error ? error.message : undefined
    });
  }
});

// 获取热门服务（按浏览量排序）
router.get('/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const limitNum = parseInt(limit as string);

    const db = DatabaseService.getInstance();
    
    // 获取热门报价
    const popularQuotations = await db.getQuotations({}, {
      sortBy: 'createdAt',
      sortOrder: 'desc',
      take: limitNum
    });
    let coverMap: Record<string, string | undefined> = {}
    try {
      if (prisma && popularQuotations.length > 0) {
        const userIds = Array.from(new Set(popularQuotations.map((q: any) => q.userId).filter(Boolean)))
        if (userIds.length > 0) {
          const profiles = await prisma.workerProfile.findMany({
            where: { userId: { in: userIds } },
            include: { services: true }
          })
          for (const p of profiles as any[]) {
            const svc = (p.services || []).find((s: any) => !!s.coverImageUrl) || (p.services || [])[0]
            coverMap[p.userId] = svc?.coverImageUrl || undefined
          }
        }
      }
    } catch {}

    // 套餐联动（按 quotationId 或 serviceId）
    let packagesByQuotationId: Record<string, any[]> = {}
    let packagesByServiceId: Record<string, any[]> = {}
    try {
      if (prisma && popularQuotations.length > 0) {
        const quotationIds = Array.from(new Set(popularQuotations.map((q: any) => q.id)))
        const serviceIds = Array.from(new Set((popularQuotations.map((q: any) => (q as any).serviceId).filter(Boolean))))
        const services = await prisma.workerService.findMany({
          where: {
            OR: [
              { quotationId: { in: quotationIds } },
              { id: { in: serviceIds } }
            ]
          },
          include: { packages: { include: { plans: true } } }
        })
        for (const s of services as any[]) {
          if (s.quotationId) packagesByQuotationId[s.quotationId] = s.packages || []
          packagesByServiceId[s.id] = s.packages || []
        }
      }
    } catch {}

    const withCovers = popularQuotations.map((q: any) => ({ 
      ...q, 
      coverImageUrl: coverMap[q.userId],
      packages: packagesByQuotationId[q.id] || packagesByServiceId[(q as any).serviceId] || []
    }))

    res.json({
      success: true,
      data: withCovers
    });
  } catch (error) {
    console.error('获取热门服务失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取热门服务失败',
      error: process.env['NODE_ENV'] === 'development' && error instanceof Error ? (error as Error).message : undefined
    });
  }
});

// 获取最新发布（按创建时间排序）
router.get('/latest', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const limitNum = parseInt(limit as string);

    const db = DatabaseService.getInstance();
    
    // 获取最新报价
    const latestQuotations = await db.getQuotations({}, {
      sortBy: 'createdAt',
      sortOrder: 'desc',
      take: limitNum
    });

    // 获取最新询价
    const latestInquiries = await db.getInquiries({}, {
      sortBy: 'createdAt',
      sortOrder: 'desc',
      take: limitNum
    });

    let coverMap: Record<string, string | undefined> = {}
    try {
      if (prisma && latestQuotations.length > 0) {
        const userIds = Array.from(new Set(latestQuotations.map((q: any) => q.userId).filter(Boolean)))
        if (userIds.length > 0) {
          const profiles = await prisma.workerProfile.findMany({
            where: { userId: { in: userIds } },
            include: { services: true }
          })
          for (const p of profiles as any[]) {
            const svc = (p.services || []).find((s: any) => !!s.coverImageUrl) || (p.services || [])[0]
            coverMap[p.userId] = svc?.coverImageUrl || undefined
          }
        }
      }
    } catch {}

    // 套餐联动（按 quotationId 或 serviceId）
    let packagesByQuotationId: Record<string, any[]> = {}
    let packagesByServiceId: Record<string, any[]> = {}
    try {
      if (prisma && latestQuotations.length > 0) {
        const quotationIds = Array.from(new Set(latestQuotations.map((q: any) => q.id)))
        const serviceIds = Array.from(new Set((latestQuotations.map((q: any) => (q as any).serviceId).filter(Boolean))))
        const services = await prisma.workerService.findMany({
          where: {
            OR: [
              { quotationId: { in: quotationIds } },
              { id: { in: serviceIds } }
            ]
          },
          include: { packages: { include: { plans: true } } }
        })
        for (const s of services as any[]) {
          if (s.quotationId) packagesByQuotationId[s.quotationId] = s.packages || []
          packagesByServiceId[s.id] = s.packages || []
        }
      }
    } catch {}

    const allItems = [
      ...latestQuotations.map((q: any) => ({ ...q, type: 'quotation', coverImageUrl: coverMap[q.userId], packages: packagesByQuotationId[q.id] || packagesByServiceId[(q as any).serviceId] || [] })),
      ...latestInquiries.map((i: any) => ({ ...i, type: 'inquiry' }))
    ]
      .sort((a, b) => new Date((b as any).createdAt).getTime() - new Date((a as any).createdAt).getTime())
      .slice(0, limitNum);

    res.json({
      success: true,
      data: allItems
    });
  } catch (error) {
    console.error('获取最新发布失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取最新发布失败',
      error: process.env['NODE_ENV'] === 'development' && error instanceof Error ? (error as Error).message : undefined
    });
  }
});

// 获取单个服务详情（公开）
router.get('/services/:id', async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: '服务ID不能为空' });
      return;
    }
    if (!prisma) {
      res.status(500).json({ success: false, message: '数据库连接失败' });
      return;
    }

    const s = await prisma.workerService.findUnique({
      where: { id },
      include: {
        worker: {
          select: {
            user: { select: { id: true, name: true, avatarUrl: true, isVerified: true } },
            rating: true,
            reviewCount: true,
            isVerified: true,
            badges: true,
          },
        },
        packages: { include: { plans: true } },
        faqs: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
        reviews: {
          include: { customer: { select: { id: true, name: true, avatarUrl: true } } },
          orderBy: [{ createdAt: 'desc' }],
        },
      },
    });

    if (!s) {
      res.status(404).json({ success: false, message: '服务不存在' });
      return;
    }

    const provider = s.worker?.user
      ? {
          id: s.worker.user.id,
          name: s.worker.user.name,
          avatarUrl: s.worker.user.avatarUrl || '',
          verified: !!s.worker.user.isVerified,
          level:
            typeof s.worker?.rating === 'number' && s.worker.rating >= 4.8 ? 'Top Rated' : undefined,
        }
      : undefined;

    const data = {
      id: s.id,
      title: s.title,
      description: s.description,
      images: s.coverImageUrl ? [s.coverImageUrl] : [],
      coverImageUrl: s.coverImageUrl || '',
      price: s.priceAmount,
      currency: s.priceCurrency,
      unit: s.unit || '/项目',
      rating: s.rating ?? s.worker?.rating ?? 0,
      totalReviews: s.reviewCount ?? s.worker?.reviewCount ?? 0,
      deliveryTime: s.deliveryTime || '',
      tags: Array.isArray(s.tags as any) ? (s.tags as any) : [],
      features: Array.isArray(s.features as any) ? (s.features as any) : undefined,
      provider,
      packages: s.packages || [],
      faqs: s.faqs || [],
      reviews: (s.reviews || []).map((r: { id: string; rating: number; title?: string | null; content: string; customer?: { id: string; name: string; avatarUrl: string | null } | null; createdAt: Date }) => ({
        id: r.id,
        rating: r.rating,
        title: r.title || '',
        content: r.content,
        customer: r.customer ? { id: r.customer.id, name: r.customer.name, avatarUrl: r.customer.avatarUrl || '' } : undefined,
        createdAt: r.createdAt.toISOString(),
      })),
    };

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取服务详情失败',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// 获取分类列表
router.get('/categories', async (_req, res) => {
  try {
    const db = DatabaseService.getInstance();
    
    // 获取报价分类
    const quotationCategories = await db.getQuotationCategories();
    
    // 获取询价分类
    const inquiryCategories = await db.getInquiryCategories();

    res.json({
      success: true,
      data: {
        quotations: quotationCategories,
        inquiries: inquiryCategories
      }
    });
  } catch (error) {
    console.error('获取分类列表失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取分类列表失败',
      error: process.env['NODE_ENV'] === 'development' && error instanceof Error ? (error as Error).message : undefined
    });
  }
});

// 获取单个报价详情
router.get('/quotations/:id', async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const db = DatabaseService.getInstance();
    
    const quotation = await db.getQuotationById(id);
    
    if (!quotation) {
      res.status(404).json({ 
        success: false, 
        message: '报价不存在' 
      });
      return;
    }

    // 增加浏览量
    await db.incrementQuotationViews(id);

    // 关联服务套餐（按 quotationId 或 serviceId 匹配）
    let serviceWithPackages: any = null;
    try {
      if (prisma) {
        const svc = await prisma.workerService.findFirst({
          where: {
            OR: [
              { quotationId: id },
              { id: (quotation as any).serviceId || '' }
            ]
          },
          include: {
            packages: { include: { plans: true } }
          }
        });
        if (svc) serviceWithPackages = svc;
      }
    } catch {}

    const data = serviceWithPackages ? { ...quotation, packages: (serviceWithPackages.packages || []) } : quotation;

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('获取报价详情失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取报价详情失败',
      error: process.env['NODE_ENV'] === 'development' && error instanceof Error ? (error as Error).message : undefined
    });
  }
});

// 获取单个询价详情
router.get('/inquiries/:id', async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const db = DatabaseService.getInstance();
    
    const inquiry = await db.getInquiryById(id);
    
    if (!inquiry) {
      res.status(404).json({ 
        success: false, 
        message: '询价不存在' 
      });
      return;
    }

    // 增加浏览量
    await db.incrementInquiryViews(id);

    res.json({
      success: true,
      data: inquiry
    });
  } catch (error) {
    console.error('获取询价详情失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取询价详情失败',
      error: process.env['NODE_ENV'] === 'development' && error instanceof Error ? (error as Error).message : undefined
    });
  }
});

// 获取单个服务详情
router.get('/services/:id', async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    if (!prisma) {
      res.status(500).json({ success: false, message: '数据库未连接' });
      return;
    }

    const service = await prisma.workerService.findUnique({
      where: { id },
      include: {
        worker: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true
              }
            }
          }
        },
        packages: { include: { plans: true } },
        reviews: { include: { customer: { select: { id: true, name: true, avatarUrl: true } } } },
        quotation: true
      }
    });

    if (!service) {
      res.status(404).json({ success: false, message: '服务不存在' });
      return;
    }

    const providerUser = (service as any).worker?.user;
    const faqs = await prisma.serviceFAQ.findMany({ where: { serviceId: id }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] });
  const data = {
      id: service.id,
      title: service.title,
      description: service.description,
      longDescription: undefined,
      price: service.priceAmount,
      currency: (service.priceCurrency || 'USD').toUpperCase(),
      category: { id: service.category || '其他', name: service.category || '其他' },
      provider: {
        id: providerUser?.id || service.workerId,
        name: providerUser?.name || '',
        email: providerUser?.email || '',
        avatar: providerUser?.avatarUrl || '',
        rating: (service.worker as any)?.rating || service.rating || undefined,
        totalReviews: (service.worker as any)?.reviewCount || service.reviewCount || 0,
        verified: !!(service.worker as any)?.isVerified
      },
      images: service.coverImageUrl ? [service.coverImageUrl] : [],
      specifications: [],
      tags: Array.isArray(service.tags) ? (service.tags as any) : [],
      features: Array.isArray((service as any).features) ? ((service as any).features as any) : [],
      status: service.status || 'ACTIVE',
      createdAt: service.createdAt.toISOString(),
      deliveryTime: undefined,
      location: (service.worker as any)?.location || undefined,
      rating: service.rating || undefined,
      totalOrders: undefined,
      packages: (service as any).packages,
      faqs: faqs
    } as any;

    res.json({ success: true, data });
  } catch (error) {
    console.error('获取服务详情失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取服务详情失败',
      error: process.env['NODE_ENV'] === 'development' && error instanceof Error ? error.message : undefined
    });
  }
});

// 收藏/取消收藏报价
router.post('/quotations/:id/favorite', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const { action = 'toggle' } = req.body;

    const db = DatabaseService.getInstance();
    
    let result;
    if (action === 'add') {
      result = await db.addFavoriteQuotation(userId, id!);
    } else if (action === 'remove') {
      result = await db.removeFavoriteQuotation(userId, id!);
    } else {
      result = await db.toggleFavoriteQuotation(userId, id!);
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('收藏报价失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '收藏报价失败',
      error: process.env['NODE_ENV'] === 'development' && error instanceof Error ? (error as Error).message : undefined
    });
  }
});

// 收藏/取消收藏询价
router.post('/inquiries/:id/favorite', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const { action = 'toggle' } = req.body;

    const db = DatabaseService.getInstance();
    
    let result;
    if (action === 'add') {
      result = await db.addFavoriteInquiry(userId, id!);
    } else if (action === 'remove') {
      result = await db.removeFavoriteInquiry(userId, id!);
    } else {
      result = await db.toggleFavoriteInquiry(userId, id!);
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('收藏询价失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '收藏询价失败',
      error: process.env['NODE_ENV'] === 'development' && error instanceof Error ? (error as Error).message : undefined
    });
  }
});

// 获取用户的收藏列表
router.get('/favorites', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { type = 'all' } = req.query;

    const db = DatabaseService.getInstance();
    
    let favorites: any[] = [];
    
    if (type === 'all' || type === 'quotations') {
      const favoriteQuotations = await db.getFavoriteQuotations(userId);
      favorites = [...favorites, ...favoriteQuotations.map((q: any) => ({ ...q, type: 'quotation' }))];
    }
    
    if (type === 'all' || type === 'inquiries') {
      const favoriteInquiries = await db.getFavoriteInquiries(userId);
      favorites = [...favorites, ...favoriteInquiries.map((i: any) => ({ ...i, type: 'inquiry' }))];
    }

    res.json({
      success: true,
      data: favorites
    });
  } catch (error) {
    console.error('获取收藏列表失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取收藏列表失败',
      error: process.env['NODE_ENV'] === 'development' && error instanceof Error ? (error as Error).message : undefined
    });
  }
});

// 获取推荐工作者
router.get('/workers/featured', async (_req: Request, res: Response): Promise<void> => {
  try {
    if (!prisma) {
      res.status(500).json({ success: false, message: '数据库未连接' });
      return;
    }

      const workers = await prisma.user.findMany({
        where: {
          role: 'PROVIDER',
          workerProfile: {
            isNot: null
          }
        },
        take: 4,
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          workerProfile: {
            include: {
              services: {
                include: {
                  packages: { include: { plans: true } }
                }
              },
              experiences: true
            }
          }
        }
      });

    res.json({
      success: true,
      data: workers
    });
  } catch (error) {
    console.error('获取推荐工作者失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取推荐工作者失败',
      error: process.env['NODE_ENV'] === 'development' && error instanceof Error ? error.message : undefined
    });
  }
});

export default router;
