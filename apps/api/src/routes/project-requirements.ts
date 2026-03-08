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

// Get requirement by ID
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const requirement = await db.getProjectRequirementById(id);
    
    if (!requirement) {
      res.status(404).json({ success: false, message: '需求不存在' });
      return;
    }
    
    res.json({ success: true, data: requirement });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取需求详情失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete requirement
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await db.deleteProjectRequirement(id);
    res.json({ success: true, message: '需求已删除' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除需求失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Search requirements
router.get('/search/:query', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { query } = req.params;
    const { skip, take, projectId } = req.query;
    const options = {
      skip: skip ? parseInt(skip as string) : 0,
      take: take ? parseInt(take as string) : 20,
      projectId: projectId as string
    };
    
    const requirements = await db.searchRequirements(query, options);
    res.json({ success: true, data: requirements });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '搜索需求失败',
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
