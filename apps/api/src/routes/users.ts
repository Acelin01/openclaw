import express, { Router } from 'express';
import { Response } from 'express';
import { prisma } from '../lib/db/index.js';
import { DatabaseService } from '../lib/db/service.js';
import bcrypt from 'bcryptjs';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/auth.js';

const router: Router = express.Router();

// Get current user
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = DatabaseService.getInstance();
    if (!db.isAvailable()) {
      return res.status(503).json({ success: false, message: '数据库连接不可用' });
    }
    // 这里需要从认证中间件获取用户ID
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '用户未认证'
      });
    }

    const user = await db.getUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    return res.json({
      success: true,
      data: {
        id: (user as any).id,
        email: (user as any).email,
        name: (user as any).name,
        role: (user as any).role,
        avatarUrl: (user as any).avatarUrl,
        phone: (user as any).phone,
        isVerified: (user as any).isVerified,
        createdAt: (user as any).createdAt,
        updatedAt: (user as any).updatedAt,
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: '获取用户信息失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all users (admin only)
router.get('/', authenticateToken, authorizeRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = DatabaseService.getInstance();
    if (!db.isAvailable()) {
      return res.status(503).json({ success: false, message: '数据库连接不可用' });
    }
    const page = parseInt(String((req.query as any)['page'])) || 1;
    const limit = parseInt(String((req.query as any)['limit'])) || 10;
    const skip = (page - 1) * limit;
    const search = String((req.query as any)['search'] || (req.query as any)['q'] || '');
    const role = String((req.query as any)['role'] || '');
    const status = String((req.query as any)['status'] || '');

    let users: any[] = [];
    let total = 0;

    const where: any = {};
    if (role) where['role'] = role;
    if (status === 'verified') where['isVerified'] = true;
    if (status === 'unverified') where['isVerified'] = false;
    if (status === 'suspended') where['isSuspended'] = true;
    if (search) {
      where['OR'] = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [list, count] = await Promise.all([
      prisma!.user.findMany({
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
          isSuspended: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma!.user.count({ where })
    ]);
    users = list as any[];
    total = count;

    return res.json({
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
    console.error('CRITICAL ERROR in GET /api/v1/users:', error);
    return res.status(500).json({
      success: false,
      message: '获取用户列表失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/', authorizeRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = DatabaseService.getInstance();
    if (!db.isAvailable()) {
      return res.status(503).json({ success: false, message: '数据库连接不可用' });
    }
    const { email, password, name, role, phone, teamId } = req.body || {};
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: '邮箱、密码、姓名为必填项' });
    }

    const existing = await db.getUserByEmail(String(email));
    if (existing) {
      return res.status(409).json({ success: false, message: '用户已存在' });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);
    const data: any = {
      email: String(email),
      name: String(name),
      password: hashedPassword,
      role: typeof role === 'string' ? role : 'CUSTOMER',
      phone: phone ?? undefined,
      teamId: teamId ?? undefined,
    };

    const user = await db.createUser(data);
    const result = {
      id: (user as any).id,
      email: (user as any).email,
      name: (user as any).name,
      role: (user as any).role,
      avatarUrl: (user as any).avatarUrl,
      phone: (user as any).phone,
      isVerified: (user as any).isVerified,
      createdAt: (user as any).createdAt,
      updatedAt: (user as any).updatedAt,
    };

    return res.status(201).json({ success: true, data: result, message: '用户创建成功' });
  } catch (error) {
    return res.status(500).json({ success: false, message: '创建用户失败', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = DatabaseService.getInstance();
    if (!db.isAvailable()) {
      return res.status(503).json({ success: false, message: '数据库连接不可用' });
    }
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: '用户ID不能为空'
      });
    }
    
    const user = await prisma!.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        phone: true,
        isVerified: true,
        isSuspended: true,
        createdAt: true,
        workerProfile: {
          include: {
            services: {
              include: {
                packages: {
                  include: { plans: true }
                }
              }
            },
            experiences: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    return res.json({ 
      success: true, 
      data: user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: '获取用户信息失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = DatabaseService.getInstance();
    if (!db.isAvailable()) {
      return res.status(503).json({ success: false, message: '数据库连接不可用' });
    }
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '用户未认证'
      });
    }

    const { name, phone, avatarUrl } = req.body;

    const user = await prisma!.user.update({
      where: { id: userId },
      data: {
        name,
        phone,
        avatarUrl,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        phone: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return res.json({ 
      success: true, 
      data: user,
      message: '用户资料已更新'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: '更新用户资料失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Change password
router.put('/password', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '用户未认证'
      });
    }

    const { currentPassword, newPassword } = req.body;

    if (!prisma) {
      return res.status(500).json({
        success: false,
        message: '数据库连接失败'
      });
    }

    // 获取当前用户信息
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true }
    });

    if (!user || !user.password) {
      return res.status(400).json({
        success: false,
        message: '用户密码不存在'
      });
    }

    // 验证当前密码
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: '当前密码错误'
      });
    }

    // 加密新密码
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    if (!prisma) {
      return res.status(500).json({
        success: false,
        message: '数据库连接失败'
      });
    }

    // 更新密码
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    return res.json({ 
      success: true, 
      message: '密码修改成功'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: '修改密码失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get user's quotations
router.get('/:id/quotations', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: '用户ID不能为空'
      });
    }
    
    const page = parseInt((req.query as any)['page'] as string) || 1;
    const limit = parseInt((req.query as any)['limit'] as string) || 10;
    const skip = (page - 1) * limit;

    if (!prisma) {
      return res.status(500).json({
        success: false,
        message: '数据库连接失败'
      });
    }

    const [quotations, total] = await Promise.all([
      prisma.quotation.findMany({
        where: { userId: id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            }
          }
        }
      }),
      prisma.quotation.count({ where: { userId: id } })
    ]);

    return res.json({
      success: true,
      data: {
        quotations,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: '获取用户报价单失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get user's inquiries
router.get('/:id/inquiries', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: '用户ID不能为空'
      });
    }
    
    const page = parseInt((req.query as any)['page'] as string) || 1;
    const limit = parseInt((req.query as any)['limit'] as string) || 10;
    const skip = (page - 1) * limit;

    if (!prisma) {
      return res.status(500).json({
        success: false,
        message: '数据库连接失败'
      });
    }

    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        where: { userId: id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            }
          }
        }
      }),
      prisma.inquiry.count({ where: { userId: id } })
    ]);

    return res.json({
      success: true,
      data: {
        inquiries,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: '获取用户询价单失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.patch('/:id', authenticateToken, authorizeRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role, isVerified, isSuspended, name, phone, avatarUrl, workerProfile, teamId } = req.body || {};

    if (!prisma) {
      return res.status(500).json({ success: false, message: '数据库连接失败' });
    }

    const data: any = {};
    if (role !== undefined) data.role = role;
    if (isVerified !== undefined) data.isVerified = !!isVerified;
    if (isSuspended !== undefined) data.isSuspended = !!isSuspended;
    if (name !== undefined) data.name = name;
    if (phone !== undefined) data.phone = phone;
    if (avatarUrl !== undefined) data.avatarUrl = avatarUrl;
    if (teamId !== undefined) data.teamId = teamId;

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        phone: true,
        isVerified: true,
        isSuspended: true,
        createdAt: true,
        updatedAt: true,
        workerProfile: {
          include: {
            services: true,
            experiences: true
          }
        }
      }
    });

    if (workerProfile && prisma) {
      const allowedKeys = [
        'title','bio','rating','reviewCount','location','languages','skills','badges',
        'hourlyRateAmount','hourlyRateCurrency','hourlyRateUnit','responseTimeValue','responseTimeUnit',
        'isVerified','verifiedBy','verifiedDomains'
      ];
      const profileData: any = {};
      for (const key of allowedKeys) {
        if (key in workerProfile) {
          profileData[key] = (workerProfile as any)[key];
        }
      }
      if (Object.keys(profileData).length > 0) {
        await prisma.workerProfile.upsert({
          where: { userId: id },
          update: profileData,
          create: { userId: id, ...profileData }
        });
      }
    }

    return res.json({ success: true, data: user, message: '用户更新成功' });
  } catch (error) {
    return res.status(500).json({ success: false, message: '更新用户失败', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Admin: delete user
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!prisma) {
      return res.status(500).json({ success: false, message: '数据库连接失败' });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Handle Worker Profile Cascading (Must be done before deleting profile)
      const workerProfile = await tx.workerProfile.findUnique({ where: { userId: id } });
      if (workerProfile) {
          const services = await tx.workerService.findMany({ where: { workerId: workerProfile.id } });
          const serviceIds = services.map(s => s.id);
          
          if (serviceIds.length > 0) {
              // Delete Service FAQs
              await tx.serviceFAQ.deleteMany({ where: { serviceId: { in: serviceIds } } });

              // Delete Service Packages and Plans
              const packages = await tx.servicePackage.findMany({ where: { serviceId: { in: serviceIds } } });
              const packageIds = packages.map(p => p.id);
              if (packageIds.length > 0) {
                  await tx.servicePackagePlan.deleteMany({ where: { packageId: { in: packageIds } } });
                  await tx.servicePackage.deleteMany({ where: { id: { in: packageIds } } });
              }
              
              // Delete Services
              await tx.workerService.deleteMany({ where: { id: { in: serviceIds } } });
          }

          // Delete Experiences
          await tx.workerExperience.deleteMany({ where: { workerId: workerProfile.id } });
          
          // Finally delete profile
          await tx.workerProfile.delete({ where: { id: workerProfile.id } });
      }

      // Delete other related data
      await tx.quotation.deleteMany({ where: { userId: id } });
      await tx.inquiry.deleteMany({ where: { userId: id } });
      // Delete transactions where user is customer or provider
      await tx.transaction.deleteMany({ 
        where: { 
          OR: [
            { customerId: id },
            { providerId: id }
          ]
        } 
      });
      await tx.aIConversation.deleteMany({ where: { userId: id } });
      await tx.message.deleteMany({ where: { senderId: id } });
      
      // Delete Chat related entities (v2)
      const userChats = await tx.chat.findMany({ where: { userId: id }, select: { id: true } });
      if (userChats.length > 0) {
          const chatIds = userChats.map(c => c.id);
          // Delete entities that depend on Chat
          // Note: use try-catch for models that might not be in the generated client if schema is out of sync
          try { await (tx as any).chatMessage.deleteMany({ where: { chatId: { in: chatIds } } }); } catch(e) {}
          try { await (tx as any).vote.deleteMany({ where: { chatId: { in: chatIds } } }); } catch(e) {}
          try { await (tx as any).stream.deleteMany({ where: { chatId: { in: chatIds } } }); } catch(e) {}
          try { await (tx as any).chat.deleteMany({ where: { id: { in: chatIds } } }); } catch(e) {}
      }

      // Handle optional tables if they exist in schema but might not be used or are optional
      try { await tx.userSubscription.deleteMany({ where: { userId: id } }); } catch (e) {}
      try { await tx.subscriptionUsageLog.deleteMany({ where: { userId: id } }); } catch (e) {}
      try { await tx.userSession.deleteMany({ where: { userId: id } }); } catch (e) {}
      try { await tx.userEvent.deleteMany({ where: { userId: id } }); } catch (e) {}
      try { await tx.chatInteractionMetrics.deleteMany({ where: { userId: id } }); } catch (e) {}
      try { await tx.notification.deleteMany({ where: { userId: id } }); } catch (e) {}
      try { await tx.aIProviderKey.deleteMany({ where: { userId: id } }); } catch (e) {}
      try { await tx.review.deleteMany({ 
        where: { 
          OR: [
            { customerId: id }, 
            { providerId: id }
          ] 
        } 
      }); } catch (e) {}
      
      // Documents are linked to User, delete them
      try { await tx.document.deleteMany({ where: { userId: id } }); } catch (e) {}
      try { await tx.suggestion.deleteMany({ where: { userId: id } }); } catch (e) {}

      await tx.user.delete({ where: { id } });
    });

    return res.json({ success: true, message: '用户及相关数据删除成功' });
  } catch (error) {
    return res.status(500).json({ success: false, message: '删除用户失败', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;
