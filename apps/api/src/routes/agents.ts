import express, { Router, Response } from 'express';
import { optionalAuthenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { DatabaseService } from '../lib/db/service.js';

const router: Router = express.Router();
const db = DatabaseService.getInstance();

// Create an agent
router.post('/', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const userId = req.user?.id || data.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const agent = await db.createAgent({
      ...data,
      userId
    });

    res.json({ success: true, data: agent });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create agent',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get agent list
router.get('/', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.query.userId as string || req.user?.id;
    const projectId = req.query.projectId as string;
    const requirementId = req.query.requirementId as string;
    const taskId = req.query.taskId as string;
    const chatId = req.query.chatId as string;
    const identifier = req.query.identifier as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (userId) {
      where.OR = [
        { userId },
        { isCallableByOthers: true },
        { projects: { some: { members: { some: { userId } } } } },
        { associatedUsers: { some: { id: userId } } }
      ];
    } else {
      where.isCallableByOthers = true;
    }
    if (projectId) where.projects = { some: { id: projectId } };
    if (requirementId) where.requirements = { some: { id: requirementId } };
    if (taskId) where.tasks = { some: { id: taskId } };
    if (chatId) where.chats = { some: { id: chatId } };
    if (identifier) where.identifier = identifier;

    const agents = await db.getAgents(where, {
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    res.json({ success: true, data: agents, page, limit });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agents',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get agent by ID
router.get('/:id', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: 'Agent ID is required' });
      return;
    }
    const agent = await db.getAgentById(id);

    if (!agent) {
      res.status(404).json({ success: false, message: 'Agent not found' });
      return;
    }

    res.json({ success: true, data: agent });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agent',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update an agent
router.patch('/:id', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: 'Agent ID is required' });
      return;
    }
    const data = req.body;

    const agent = await db.updateAgent(id, data);
    res.json({ success: true, data: agent });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update agent',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete an agent
router.delete('/:id', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: 'Agent ID is required' });
      return;
    }
    await db.deleteAgent(id);
    res.json({ success: true, message: 'Agent deleted successfully' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete agent',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
