import express, { Router, Response } from 'express';
import { optionalAuthenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { DatabaseService } from '../lib/db/service.js';

const router: Router = express.Router();
const db = DatabaseService.getInstance();

// Create an MCP Tool
router.post('/', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const userId = req.user?.id || data.creatorId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const tool = await db.createMCPTool({
      ...data,
      creatorId: userId
    });

    res.json({ success: true, data: tool });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create MCP tool',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get MCP Tool list
router.get('/', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const isBuiltIn = req.query.isBuiltIn === 'true' ? true : req.query.isBuiltIn === 'false' ? false : undefined;
    const creatorId = req.query.creatorId as string;
    const agentId = req.query.agentId as string;
    const search = req.query.search as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (isBuiltIn !== undefined) where.isBuiltIn = isBuiltIn;
    if (creatorId) where.creatorId = creatorId;
    if (agentId) where.agents = { some: { id: agentId } };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ];
    }

    const tools = await db.getMCPTools(where, {
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    res.json({ success: true, data: tools, page, limit });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch MCP tools',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get MCP Tool by ID
router.get('/:id', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: 'Tool ID is required' });
      return;
    }
    const tool = await db.getMCPToolById(id);

    if (!tool) {
      res.status(404).json({ success: false, message: 'MCP tool not found' });
      return;
    }

    res.json({ success: true, data: tool });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch MCP tool',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update an MCP Tool
router.patch('/:id', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: 'Tool ID is required' });
      return;
    }
    const data = req.body;

    const tool = await db.updateMCPTool(id, data);
    res.json({ success: true, data: tool });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update MCP tool',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete an MCP Tool
router.delete('/:id', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: 'Tool ID is required' });
      return;
    }
    await db.deleteMCPTool(id);
    res.json({ success: true, message: 'MCP tool deleted successfully' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete MCP tool',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
