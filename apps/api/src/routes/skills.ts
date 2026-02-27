import express, { Router, Response } from 'express';
import { optionalAuthenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { DatabaseService } from '../lib/db/service.js';

const router: Router = express.Router();
const db = DatabaseService.getInstance();

// Create a Skill
router.post('/', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const data = req.body;
    // Basic validation
    if (!data.name || !data.mcpToolId) {
      res.status(400).json({ success: false, message: 'Name and mcpToolId are required' });
      return;
    }

    const skill = await db.createSkill(data);

    res.json({ success: true, data: skill });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create skill',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get Skill list
router.get('/', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const mcpToolId = req.query.mcpToolId as string;
    const search = req.query.search as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (mcpToolId) where.mcpToolId = mcpToolId;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ];
    }

    const skills = await db.getSkills(where, {
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    res.json({ success: true, data: skills, page, limit });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch skills',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get Skill by ID
router.get('/:id', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: 'Skill ID is required' });
      return;
    }
    const skill = await db.getSkillById(id);

    if (!skill) {
      res.status(404).json({ success: false, message: 'Skill not found' });
      return;
    }

    res.json({ success: true, data: skill });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch skill',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update a Skill
router.patch('/:id', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: 'Skill ID is required' });
      return;
    }
    const data = req.body;

    const skill = await db.updateSkill(id, data);
    res.json({ success: true, data: skill });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update skill',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete a Skill
router.delete('/:id', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: 'Skill ID is required' });
      return;
    }
    await db.deleteSkill(id);
    res.json({ success: true, message: 'Skill deleted successfully' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete skill',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
