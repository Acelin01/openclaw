import express, { Router } from 'express';
import { Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { DatabaseService } from '../lib/db/service.js';

const router: Router = express.Router();
const db = DatabaseService.getInstance();

// Get all project tasks (with optional filters)
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const projectId = req.query.projectId as string;
    const requirementId = req.query.requirementId as string;
    const assigneeId = req.query.assigneeId as string;
    const status = req.query.status as string;
    
    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (requirementId) where.requirementId = requirementId;
    
    // Default to current user's tasks if no assigneeId is provided and it's a "my tasks" context
    // For now, let's allow explicit assigneeId or filter by current user if requested
    if (assigneeId) {
      where.assigneeId = assigneeId;
    } else if (req.query.mine === 'true' && req.user?.id) {
      where.assigneeId = req.user.id;
    }

    if (status) {
      if (status.includes(',')) {
        where.status = { in: status.split(',') };
      } else {
        where.status = status;
      }
    }

    const tasks = await db.getProjectTasks(where);
    res.json({ success: true, data: tasks });
  } catch (error) {
    console.error('Error fetching project tasks:', error);
    res.status(500).json({
      success: false,
      message: '获取任务失败',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
    });
  }
});

// Get task analysis
router.get('/analysis', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const [total, completed, inProgress] = await Promise.all([
      db.getProjectTasksCount({ assigneeId: userId }),
      db.getProjectTasksCount({ assigneeId: userId, status: 'COMPLETED' }),
      db.getProjectTasksCount({ assigneeId: userId, status: 'IN_PROGRESS' }),
    ]);

    res.json({
      success: true,
      data: {
        total,
        completed,
        inProgress,
        pending: total - completed - inProgress
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取任务分析失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get task by ID
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const task = await db.getProjectTaskById(id!);
    
    if (!task) {
      res.status(404).json({ success: false, message: '任务不存在' });
      return;
    }
    
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取任务详情失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create task
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const task = await db.createProjectTask(req.body);
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '创建任务失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update task
router.patch('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const task = await db.updateProjectTask(id!, req.body);
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新任务失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
