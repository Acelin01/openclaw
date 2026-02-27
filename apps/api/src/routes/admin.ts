import express, { Router } from 'express';
import { Request, Response } from 'express';
import { prisma } from '../lib/db/index.js';
import { DatabaseService } from '../lib/db/service.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router: Router = express.Router();

// Get dashboard stats
router.get('/dashboard', authenticateToken, authorizeRoles('ADMIN'), async (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        totalUsers: 100,
        totalQuotations: 50,
        totalInquiries: 75,
        totalTransactions: 25,
        pendingReviews: 10,
        recentActivities: []
      },
      message: '仪表板数据获取成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取仪表板数据失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all users (admin)
router.get('/users', authenticateToken, authorizeRoles('ADMIN'), async (req: Request, res: Response) => {
  try {
    const page = parseInt(String((req.query as any)['page'])) || 1;
    const limit = parseInt(String((req.query as any)['limit'])) || 10;
    const skip = (page - 1) * limit;
    const search = String((req.query as any)['search'] || (req.query as any)['q'] || '');
    const role = String((req.query as any)['role'] || '');
    const status = String((req.query as any)['status'] || '');

    let users: any[] = [];
    let total = 0;

    if (prisma) {
      const where: any = {};
      if (role) where['role'] = role;
      if (status === 'verified') where['isVerified'] = true;
      if (status === 'unverified') where['isVerified'] = false;
      if (search) {
        where['OR'] = [
          { email: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
        ];
      }
      const [list, count] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            avatarUrl: true,
            phone: true,
            isVerified: true,
            createdAt: true,
            updatedAt: true
          }
        }),
          prisma.user.count({ where })
      ]);
      users = list as any[];
      total = count;
    } else {
      const db = DatabaseService.getInstance();
      let all = (await db.getUsers(role ? { role } : {}, {})) as any[];
      if (status === 'verified') all = all.filter((u: any) => !!u['isVerified']);
      if (status === 'unverified') all = all.filter((u: any) => !u['isVerified']);
      if (search) {
        const s = search.toLowerCase();
        all = all.filter((u: any) =>
          String(u['email'] || '').toLowerCase().includes(s) ||
          String(u['name'] || '').toLowerCase().includes(s)
        );
      }
      total = all.length;
      users = all.slice(skip, skip + limit);
    }

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit) || 1,
        }
      },
      message: '用户列表获取成功'
    });
  } catch (error) {
    console.error('CRITICAL ERROR in GET /api/v1/admin/users:', error);
    res.status(500).json({
      success: false,
      message: '获取用户列表失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete user (admin)
router.delete('/users/:id', authenticateToken, authorizeRoles('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!prisma) {
      res.status(500).json({ success: false, message: 'Database connection failed' });
      return;
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ success: false, message: '用户不存在' });
      return;
    }

    // Delete user
    await prisma.user.delete({ where: { id } });

    res.json({
      success: true,
      message: '用户删除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除用户失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all chats (admin)
router.get('/chats', authenticateToken, authorizeRoles('ADMIN'), async (req: Request, res: Response) => {
  try {
    const page = parseInt(String((req.query as any)['page'])) || 1;
    const limit = parseInt(String((req.query as any)['limit'])) || 10;
    const skip = (page - 1) * limit;
    const search = String((req.query as any)['search'] || (req.query as any)['q'] || '');
    const userId = String((req.query as any)['userId'] || '');

    if (!prisma) {
       res.status(500).json({ success: false, message: 'Database connection failed' });
       return;
    }

    const where: any = {};
    if (userId) where['userId'] = userId;
    if (search) {
      where['title'] = { contains: search, mode: 'insensitive' };
    }

    const [list, total] = await Promise.all([
      prisma.chat.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              email: true,
              name: true,
              avatarUrl: true
            }
          }
        }
      }),
      prisma.chat.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        chats: list,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit) || 1,
        }
      },
      message: '会话列表获取成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取会话列表失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});


// Get chat details (admin)
router.get('/chats/:id', authenticateToken, authorizeRoles('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!prisma) {
        throw new Error('Database connection failed');
    }

    const chat = await prisma.chat.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    email: true,
                    name: true,
                    avatarUrl: true
                }
            },
            messages: {
                orderBy: { createdAt: 'asc' },
                include: {
                    votes: true
                }
            },
            documents: {
                orderBy: { createdAt: 'desc' }
            },
            streams: {
                orderBy: { createdAt: 'desc' }
            },
            votes: true
        }
    });

    if (!chat) {
        return res.status(404).json({
            success: false,
            message: 'Chat not found'
        });
    }

    // Extract document IDs from messages (for backward compatibility or embedded references)
    const documentIds = new Set<string>();
    for (const msg of chat.messages) {
        if (Array.isArray(msg.parts)) {
            for (const part of msg.parts) {
                const p = part as any;
                if (p && typeof p === 'object' && p.output && typeof p.output === 'object' && p.output.id) {
                     documentIds.add(p.output.id);
                }
                // Also check for tool invocations that might be stored differently
                if (p && p.type === 'tool-invocation' && p.toolInvocation && p.toolInvocation.result && p.toolInvocation.result.id) {
                    documentIds.add(p.toolInvocation.result.id);
                }
            }
        }
    }

    // Combine linked documents and referenced documents
    const linkedDocuments = chat.documents || [];
    const referencedDocuments = documentIds.size > 0 ? await prisma.document.findMany({
        where: { id: { in: Array.from(documentIds) } },
        orderBy: { createdAt: 'desc' }
    }) : [];

    // Deduplicate documents
    const documentsMap = new Map<string, any>();
    
    // Add linked documents first
    for (const doc of linkedDocuments) {
        documentsMap.set(doc.id, doc);
    }
    
    // Add referenced documents (if not already present)
    for (const doc of referencedDocuments) {
        if (!documentsMap.has(doc.id)) {
            documentsMap.set(doc.id, doc);
        }
    }
    
    const documents = Array.from(documentsMap.values());

    return res.json({
      success: true,
      data: {
        ...chat,
        documents
      },
      message: '会话详情获取成功'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: '获取会话详情失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get user documents (admin)
router.get('/users/:id/documents', authenticateToken, authorizeRoles('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const limit = parseInt(String((req.query as any)['limit'])) || 5;
    const cursor = String((req.query as any)['cursor'] || '');

    if (!prisma) {
        throw new Error('Database connection failed');
    }

    const query: any = {
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
        take: limit + 1
    };

    if (cursor) {
        query.cursor = { id: cursor };
        query.skip = 1; // Skip the cursor itself
    }

    const documents = await prisma.document.findMany(query);

    const hasMore = documents.length > limit;
    const data = documents.slice(0, limit);
    const nextCursor = hasMore && data.length > 0 ? data[data.length - 1]?.id : undefined;

    res.json({
        success: true,
        data: {
            documents: data,
            hasMore,
            nextCursor
        }
    });
  } catch (error) {
    res.status(500).json({
        success: false,
        message: 'Failed to fetch user documents',
        error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all quotations (admin)
router.get('/quotations', async (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        quotations: [],
        total: 0,
        page: 1,
        limit: 20
      },
      message: '报价单列表获取成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取报价单列表失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all inquiries (admin)
router.get('/inquiries', async (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        inquiries: [],
        total: 0,
        page: 1,
        limit: 20
      },
      message: '询价单列表获取成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取询价单列表失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});



export default router;

// AI Provider Keys Management
router.get('/ai-keys', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const { userId, provider, active } = req.query as any;
    const where: any = {};
    if (userId) where.userId = String(userId);
    if (provider) where.provider = String(provider);
    if (active !== undefined) where.active = String(active) === 'true';
    const list = await prisma?.aIProviderKey.findMany({ where, orderBy: { createdAt: 'desc' } }) || [];
    res.json({ success: true, data: list, message: 'AI密钥列表获取成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取AI密钥失败', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/ai-keys', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const { userId, provider, apiKey, region, active = true } = req.body || {};
    if (!provider || !apiKey) {
      res.status(400).json({ success: false, message: 'provider与apiKey为必填' });
      return;
    }
    const created = await prisma?.aIProviderKey.create({ data: { userId, provider, apiKey, region, active } });
    res.json({ success: true, data: created, message: 'AI密钥创建成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '创建AI密钥失败', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.put('/ai-keys/:id/disable', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await prisma?.aIProviderKey.update({ where: { id }, data: { active: false } });
    res.json({ success: true, data: updated, message: 'AI密钥已禁用' });
  } catch (error) {
    res.status(500).json({ success: false, message: '禁用AI密钥失败', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Seed minimal data
router.post('/seed', authenticateToken, authorizeRoles('ADMIN'), async (_req, res) => {
  try {
    const adminEmail = 'admin@example.com';
    const admin = await prisma?.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: { email: adminEmail, name: 'Admin', role: 'ADMIN', password: '' }
    });
    const key = process.env['DASHSCOPE_API_KEY'] || process.env['ALIBABA_API_KEY'] || '';
    if (key) {
      await prisma?.aIProviderKey.create({ data: { userId: admin?.id, provider: 'deepseek', apiKey: key, region: process.env['DASHSCOPE_REGION'] || 'cn', active: true } });
    }
    res.json({ success: true, message: '种子数据执行完成', data: { adminId: admin?.id } });
  } catch (error) {
    res.status(500).json({ success: false, message: '种子数据执行失败', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/modules', authenticateToken, authorizeRoles('ADMIN'), async (_req: Request, res: Response) => {
  try {
    const db = DatabaseService.getInstance();
    const list = await db.getModules();
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取模块列表失败', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/modules', authenticateToken, authorizeRoles('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { key, name, description, enabled = true } = req.body || {};
    if (!key || !name) {
      res.status(400).json({ success: false, message: 'key与name为必填' });
      return;
    }
    const db = DatabaseService.getInstance();
    const created = await db.createModule({ key, name, description, enabled });
    res.json({ success: true, data: created, message: '模块创建成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '创建模块失败', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.put('/modules/:id', authenticateToken, authorizeRoles('ADMIN'), async (req: Request, res: Response) => {
  try {
    const id = String((req.params as any)?.id || '');
    if (!id) {
      res.status(400).json({ success: false, message: '模块ID不能为空' });
      return;
    }
    const db = DatabaseService.getInstance();
    const updated = await db.updateModule(id, req.body || {});
    if (!updated) {
      res.status(404).json({ success: false, message: '模块不存在' });
      return;
    }
    res.json({ success: true, data: updated, message: '模块更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '更新模块失败', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.delete('/modules/:id', authenticateToken, authorizeRoles('ADMIN'), async (req: Request, res: Response) => {
  try {
    const id = String((req.params as any)?.id || '');
    if (!id) {
      res.status(400).json({ success: false, message: '模块ID不能为空' });
      return;
    }
    const db = DatabaseService.getInstance();
    const deleted = await db.deleteModule(id);
    if (!deleted) {
      res.status(404).json({ success: false, message: '模块不存在' });
      return;
    }
    res.json({ success: true, data: deleted, message: '模块已删除' });
  } catch (error) {
    res.status(500).json({ success: false, message: '删除模块失败', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});
// Get all worker services (admin)
router.get('/services', authenticateToken, authorizeRoles('ADMIN'), async (req: Request, res: Response) => {
  try {
    const page = parseInt(String((req.query as any)['page'])) || 1;
    const limit = parseInt(String((req.query as any)['limit'])) || 10;
    const skip = (page - 1) * limit;
    const search = String((req.query as any)['search'] || (req.query as any)['q'] || '');
    const category = String((req.query as any)['category'] || '');
    const status = String((req.query as any)['status'] || '');

    if (!prisma) {
      res.status(500).json({ success: false, message: '数据库连接失败' });
      return;
    }

    const where: any = {};
    if (category) where['category'] = category;
    if (status) where['status'] = status as any;
    if (search) {
      where['OR'] = [
        { title: { contains: search } },
        { description: { contains: search } },
        { category: { contains: search } }
      ];
    }

    const [list, total] = await Promise.all([
      prisma.workerService.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          worker: { select: { 
            user: { select: { id: true, name: true, avatarUrl: true } },
            rating: true, reviewCount: true, isVerified: true, badges: true
          } },
          packages: { include: { plans: true } },
          quotations: true,
          reviews: { include: { customer: { select: { id: true, name: true, avatarUrl: true } } } },
          faqs: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] }
        }
      }),
      prisma.workerService.count({ where })
    ]);

    const items = (list as any[]).map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      category: s.category,
      priceAmount: s.priceAmount,
      priceCurrency: s.priceCurrency,
      unit: s.unit,
      status: s.status,
      coverImageUrl: s.coverImageUrl,
      providerId: s.worker?.user?.id,
      providerName: s.worker?.user?.name,
      providerAvatarUrl: s.worker?.user?.avatarUrl,
      providerVerified: s.worker?.isVerified,
      providerRating: s.worker?.rating,
      providerReviewCount: s.worker?.reviewCount,
      providerBadges: s.worker?.badges,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      packages: s.packages,
      quotations: s.quotations,
      reviews: s.reviews,
      faqs: s.faqs
    }));

    res.json({
      success: true,
      data: {
        items,
        pages: Math.ceil(total / limit) || 1,
        total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取服务列表失败', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/services/:id', authenticateToken, authorizeRoles('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!prisma) {
      res.status(500).json({ success: false, message: '数据库连接失败' });
      return;
    }
    const s = await prisma.workerService.findUnique({
      where: { id },
      include: {
        worker: { select: { user: { select: { id: true, name: true, avatarUrl: true } }, rating: true, reviewCount: true, isVerified: true, badges: true } },
        packages: { include: { plans: true } },
        quotations: true,
        reviews: { include: { customer: { select: { id: true, name: true, avatarUrl: true } } } },
        faqs: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] }
      }
    });
    if (!s) {
      res.status(404).json({ success: false, message: '服务不存在' });
      return;
    }
    const item: any = {
      id: s.id,
      title: s.title,
      description: s.description,
      category: s.category,
      priceAmount: s.priceAmount,
      priceCurrency: s.priceCurrency,
      unit: s.unit,
      status: s.status,
      coverImageUrl: s.coverImageUrl,
      providerId: s.worker?.user?.id,
      providerName: s.worker?.user?.name,
      providerAvatarUrl: s.worker?.user?.avatarUrl,
      providerVerified: s.worker?.isVerified,
      providerRating: s.worker?.rating,
      providerReviewCount: s.worker?.reviewCount,
      providerBadges: s.worker?.badges,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      packages: s.packages,
      quotations: s.quotations,
      reviews: s.reviews,
      faqs: s.faqs
    };
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取服务详情失败', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Update service status
router.put('/services/:id', authenticateToken, authorizeRoles('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status?: string };
    if (!status) {
      res.status(400).json({ success: false, message: '缺少状态参数' });
      return;
    }
    if (!prisma) {
      res.status(500).json({ success: false, message: '数据库连接失败' });
      return;
    }
    const updated = await prisma.workerService.update({ where: { id }, data: { status: status as any } });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: '更新服务状态失败', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Delete service
router.delete('/services/:id', authenticateToken, authorizeRoles('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!prisma) {
      res.status(500).json({ success: false, message: '数据库连接失败' });
      return;
    }
    // 删除相关套餐计划
    const pkg = await prisma.servicePackage.findMany({ where: { serviceId: id }, select: { id: true } });
    const pkgIds = pkg.map(p => p.id);
    if (pkgIds.length > 0) {
      await prisma.servicePackagePlan.deleteMany({ where: { packageId: { in: pkgIds } } });
      await prisma.servicePackage.deleteMany({ where: { id: { in: pkgIds } } });
    }
    // 删除服务
    await prisma.workerService.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: '删除服务失败', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Service FAQs CRUD & Sort
router.get('/services/:id/faqs', authenticateToken, authorizeRoles('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!prisma) { res.status(500).json({ success: false, message: '数据库连接失败' }); return; }
    const faqs = await prisma.serviceFAQ.findMany({ where: { serviceId: id }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] });
    res.json({ success: true, data: faqs, message: 'FAQ获取成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取FAQ失败', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/services/:id/faqs', authenticateToken, authorizeRoles('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { question, answer } = req.body || {};
    if (!question || !answer) { res.status(400).json({ success: false, message: '问题与答案为必填' }); return; }
    if (!prisma) { res.status(500).json({ success: false, message: '数据库连接失败' }); return; }
    const maxOrder = await prisma.serviceFAQ.aggregate({ where: { serviceId: id }, _max: { sortOrder: true } });
    const sortOrder = ((maxOrder?._max?.sortOrder) ?? 0) + 1;
    const created = await prisma.serviceFAQ.create({ data: { question, answer, sortOrder, service: { connect: { id } } } });
    res.json({ success: true, data: created, message: 'FAQ创建成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '创建FAQ失败', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.put('/services/:serviceId/faqs/:faqId', authenticateToken, authorizeRoles('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { serviceId, faqId } = req.params as any;
    const { question, answer } = req.body || {};
    if (!prisma) { res.status(500).json({ success: false, message: '数据库连接失败' }); return; }
    const faq = await prisma.serviceFAQ.findUnique({ where: { id: faqId } });
    if (!faq || faq.serviceId !== serviceId) { res.status(404).json({ success: false, message: 'FAQ不存在' }); return; }
    const updated = await prisma.serviceFAQ.update({ where: { id: faqId }, data: { question, answer } });
    res.json({ success: true, data: updated, message: 'FAQ更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '更新FAQ失败', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.delete('/services/:serviceId/faqs/:faqId', authenticateToken, authorizeRoles('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { serviceId, faqId } = req.params as any;
    if (!prisma) { res.status(500).json({ success: false, message: '数据库连接失败' }); return; }
    const faq = await prisma.serviceFAQ.findUnique({ where: { id: faqId } });
    if (!faq || faq.serviceId !== serviceId) { res.status(404).json({ success: false, message: 'FAQ不存在' }); return; }
    await prisma.serviceFAQ.delete({ where: { id: faqId } });
    res.json({ success: true, message: 'FAQ已删除' });
  } catch (error) {
    res.status(500).json({ success: false, message: '删除FAQ失败', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/services/:id/faqs/sort', authenticateToken, authorizeRoles('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { order } = req.body as any;
    if (!Array.isArray(order) || order.length === 0) { res.status(400).json({ success: false, message: '排序数组不能为空' }); return; }
    if (!prisma) { res.status(500).json({ success: false, message: '数据库连接失败' }); return; }
    const faqs = await prisma.serviceFAQ.findMany({ where: { serviceId: id }, select: { id: true } });
    const set = new Set(faqs.map(f => f.id));
    const filtered = order.filter((fid: string) => set.has(fid));
    const p = prisma!;
    await Promise.all(filtered.map((fid: string, idx: number) => p.serviceFAQ.update({ where: { id: fid }, data: { sortOrder: idx + 1 } })));
    res.json({ success: true, message: 'FAQ排序已更新' });
  } catch (error) {
    res.status(500).json({ success: false, message: '更新FAQ排序失败', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Users aggregate stats: pending providers (unverified), inactive users (not verified), total users
router.get('/users/stats', authenticateToken, authorizeRoles('ADMIN'), async (_req: Request, res: Response) => {
  try {
    if (!prisma) { res.status(500).json({ success: false, message: '数据库连接失败' }); return; }
    const [pendingProviders, inactiveUsers, totalUsers] = await Promise.all([
      prisma.user.count({ where: { role: 'PROVIDER', isVerified: false } }),
      prisma.user.count({ where: { isVerified: false } }),
      prisma.user.count(),
    ]);
    res.json({ success: true, data: { pendingProviders, inactiveUsers, totalUsers } });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取用户聚合统计失败', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});
