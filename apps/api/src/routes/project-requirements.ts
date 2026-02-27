import express, { Router } from 'express';
import { Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { DatabaseService } from '../lib/db/service.js';

const router: Router = express.Router();
const db = DatabaseService.getInstance();

// Get all project requirements
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const projectId = req.query.projectId as string;
    const where: any = {};
    if (projectId) where.projectId = projectId;

    const requirements = await db.getProjectRequirements(where);
    res.json({ success: true, data: requirements });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取需求失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create requirement
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const requirement = await db.createProjectRequirement(req.body);
    res.json({ success: true, data: requirement });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '创建需求失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update requirement
router.patch('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const requirement = await db.updateProjectRequirement(id!, req.body);
    res.json({ success: true, data: requirement });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新需求失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
