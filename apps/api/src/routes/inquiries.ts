import express, { Router } from 'express';
import { Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { DatabaseService } from '../lib/db/service.js';

const router: Router = express.Router();
const db = DatabaseService.getInstance();
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(String((req.query as any)['page'])) || 1;
    const limit = parseInt(String((req.query as any)['limit'])) || 10;
    const skip = (page - 1) * limit;

    const category = String((req.query as any)['category'] || '') || undefined;
    const status = String((req.query as any)['status'] || '') || undefined;
    const customerId = String((req.query as any)['customerId'] || '') || undefined;
    const search = String((req.query as any)['search'] || (req.query as any)['q'] || '') || undefined;

    const where: any = {};
    if (category) where['category'] = category;
    if (status) where['status'] = status;
    if (customerId) where['userId'] = customerId;
    if (search) where['search'] = search;

    const [list, total] = await Promise.all([
      db.getInquiries(where, { skip, take: limit, sortBy: 'createdAt', sortOrder: 'desc' }),
      db.getInquiriesCount(where)
    ]);

    const inquiries = await Promise.all(
      (list as any[]).map(async (i: any) => {
        const user = i.user || (i.userId ? await db.getUserById(i.userId) : null);
        return {
          id: i.id,
          title: i.title,
          description: i.description,
          category: i.category,
          budgetMin: i.budgetMin ?? i.budget ?? undefined,
          budgetMax: i.budgetMax ?? i.budget ?? undefined,
          deadline: i.deadline ?? i.updatedAt ?? i.createdAt,
          status: i.status,
          customerId: i.userId,
          customer: user ? { id: (user as any).id, name: (user as any).name, email: (user as any).email } : undefined,
          createdAt: i.createdAt,
          updatedAt: i.updatedAt,
        };
      })
    );

    res.json({
      success: true,
      data: {
        inquiries,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit) || 1,
        }
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
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const inquiry = await db.getInquiryById(id);
    if (!inquiry) {
      res.status(404).json({ success: false, message: '询价单不存在' });
      return;
    }
    const user = (inquiry as any).user || ((inquiry as any).userId ? await db.getUserById((inquiry as any).userId) : null);
    res.json({
      success: true,
      data: {
        inquiry: {
          ...inquiry,
          customer: user ? { id: (user as any).id, name: (user as any).name, email: (user as any).email } : undefined,
        }
      },
      message: '询价单详情获取成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取询价单详情失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const body = req.body || {};
    const created = await db.createInquiry({
      title: body.title,
      description: body.description,
      category: body.category,
      budget: body.budget ?? body.budgetMin ?? 0,
      customerId: body.userId ?? (req.user?.id || ''),
      status: body.status ?? 'ACTIVE',
      tags: body.tags ?? [],
      createdAt: new Date(),
      updatedAt: new Date()
    } as any);
    res.json({ success: true, data: created, message: '询价单创建成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '创建询价单失败', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});
router.patch('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const updates = req.body || {};
    const updated = await db.updateInquiry(id, updates);
    if (!updated) {
      res.status(404).json({ success: false, message: '询价单不存在' });
      return;
    }
    res.json({ success: true, data: updated, message: '询价单更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '更新询价单失败', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const ok = await db.deleteInquiry(id);
    if (!ok) {
      res.status(404).json({ success: false, message: '询价单不存在或已删除' });
      return;
    }
    res.json({ success: true, message: '询价单删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '删除询价单失败', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;
