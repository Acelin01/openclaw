import express, { Router } from 'express';
import { Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { getPrisma } from '../lib/db/index.js';
import { DatabaseService } from '../lib/db/service.js';

const router: Router = express.Router();

// Get workbench apps
router.get('/apps', authenticateToken, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const db = DatabaseService.getInstance();
    if (!db.isAvailable()) {
      return res.status(503).json({ success: false, message: '数据库连接不可用' });
    }
    const prisma = getPrisma();
    const apps = await prisma.workbenchApp.findMany({
        orderBy: { sortOrder: 'asc' }
    });
    return res.json({ success: true, data: apps });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: '获取应用列表失败', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get user tasks
router.get('/tasks', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const db = DatabaseService.getInstance();
    if (!db.isAvailable()) {
      return res.status(503).json({ success: false, message: '数据库连接不可用' });
    }

    const prisma = getPrisma();
    const tasks = await prisma.userTask.findMany({
      where: { userId },
      orderBy: { dueDate: 'asc' }
    });
    return res.json({ success: true, data: tasks });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: '获取任务列表失败', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

export default router;
