import express, { Router } from 'express';
import { Response } from 'express';
import { z } from 'zod';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { DatabaseService } from '../lib/db/service.js';

const router: Router = express.Router();
const db = DatabaseService.getInstance();

const scheduleSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  startTime: z.string().transform(str => new Date(str)),
  endTime: z.string().transform(str => new Date(str)),
  type: z.enum(['MEETING', 'TASK', 'VIDEO', 'EVENT']).default('EVENT'),
  location: z.string().optional(),
  isAllDay: z.boolean().default(false),
  metadata: z.any().optional(),
  taskId: z.string().optional(),
});

router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!db.isAvailable()) {
      res.status(503).json({ success: false, message: '数据库连接不可用' });
      return;
    }
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: '未授权' });
      return;
    }

    const startTimeStr = req.query.startTime as string;
    const endTimeStr = req.query.endTime as string;

    const where: any = { userId };
    if (startTimeStr && endTimeStr) {
      where.startTime = { gte: new Date(startTimeStr) };
      where.endTime = { lte: new Date(endTimeStr) };
    }

    const list = await db.getSchedules(where);
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取日程失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: '未授权' });
      return;
    }

    const parsed = scheduleSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: '参数错误', error: parsed.error.flatten() });
      return;
    }

    const data = { ...parsed.data, userId };
    const created = await db.createSchedule(data);
    res.json({ success: true, data: created });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '创建日程失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: 'ID is required' });
      return;
    }
    const userId = req.user?.id;
    
    const existing = await db.getScheduleById(id);
    if (!existing || (existing as any).userId !== userId) {
      res.status(404).json({ success: false, message: '日程不存在或无权修改' });
      return;
    }

    const parsed = scheduleSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: '参数错误', error: parsed.error.flatten() });
      return;
    }

    const updated = await db.updateSchedule(id as string, parsed.data);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新日程失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: 'ID is required' });
      return;
    }
    const userId = req.user?.id;

    const existing = await db.getScheduleById(id);
    if (!existing || (existing as any).userId !== userId) {
      res.status(404).json({ success: false, message: '日程不存在或无权删除' });
      return;
    }

    await db.deleteSchedule(id as string);
    res.json({ success: true, message: '日程已删除' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除日程失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
