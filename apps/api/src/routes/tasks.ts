import express, { Router } from 'express';
import { Response } from 'express';
import { z } from 'zod';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { DatabaseService } from '../lib/db/service.js';

const router: Router = express.Router();
const db = DatabaseService.getInstance();

const createTaskSchema = z.object({
  type: z.enum(['PROJECT_RESUME_MATCHING', 'RESUME_JOB_APPLICATION', 'SERVICE_QUOTE_REQUIREMENT']),
  priority: z.number().int().min(0).optional().default(0),
  payload: z.any().optional(),
});

router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(String((req.query as any)['page'])) || 1;
    const limit = parseInt(String((req.query as any)['limit'])) || 10;
    const skip = (page - 1) * limit;
    const type = String((req.query as any)['type'] || '') || undefined;
    const status = String((req.query as any)['status'] || '') || undefined;

    const where: any = {};
    if (type) where['type'] = type;
    if (status) where['status'] = status.toUpperCase();

    const list = await db.getTasks(where, { skip, take: limit, sortBy: 'createdAt', sortOrder: 'desc' });

    res.json({
      success: true,
      data: list,
      pagination: {
        page,
        limit,
        total: list.length,
        pages: Math.ceil(list.length / limit) || 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取任务列表失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parsed = createTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: '参数错误',
        error: parsed.error.flatten()
      });
      return;
    }
    const payload = parsed.data;
    const created = await db.createTask({ ...payload, status: 'PENDING' });
    res.json({ success: true, data: created });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '创建任务失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
