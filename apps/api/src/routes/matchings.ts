import express, { Router } from 'express';
import { Response } from 'express';
import { optionalAuthenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { DatabaseService } from '../lib/db/service.js';

const router: Router = express.Router();
const db = DatabaseService.getInstance();

router.post('/', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const userId = req.user?.id || data.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    let taskData: any = {};
    if (typeof data.content === 'string') {
      try {
        const parsed = JSON.parse(data.content);
        taskData = {
          type: parsed.type || 'PROJECT_RESUME_MATCHING',
          priority: parsed.priority || 0,
          payload: parsed.payload || parsed, // Use entire parsed content as payload if payload not explicit
          status: parsed.status || 'PENDING',
        };
      } catch (e) {
        console.warn('Failed to parse matching content JSON', e);
        taskData = { ...data };
      }
    } else {
      taskData = { ...data };
    }
    
    // Explicitly select fields for Prisma
    const prismaData = {
      type: taskData.type,
      priority: taskData.priority,
      payload: taskData.payload,
      status: taskData.status,
    };

    const task = await db.createTask(prismaData);

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create matching task',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
