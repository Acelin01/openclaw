import express, { Router } from 'express';
import { Response } from 'express';
import { optionalAuthenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { DatabaseService } from '../lib/db/service.js';

const router: Router = express.Router();
const db = DatabaseService.getInstance();

// Create iteration
router.post('/', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const userId = req.user?.id || data.ownerId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const iteration = await db.createIteration({
      ...data,
      ownerId: userId,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate)
    });

    res.json({ success: true, data: iteration });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create iteration',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get iteration by ID
router.get('/:id', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const iteration = await db.getIterationById(id || '');

    if (!iteration) {
      res.status(404).json({ success: false, message: 'Iteration not found' });
      return;
    }

    res.json({ success: true, data: iteration });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get iteration',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update iteration
router.put('/:id', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;

    const updateData: any = { ...data };
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);

    const iteration = await db.updateIteration(id || '', updateData, req.user?.id);

    res.json({ success: true, data: iteration });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update iteration',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete iteration
router.delete('/:id', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await db.deleteIteration(id || '');
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete iteration',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get iterations by project ID
router.get('/project/:projectId', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const iterations = await db.getIterationsByProjectId(projectId || '');
    res.json({ success: true, data: iterations });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get iterations',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get iteration work items
router.get('/:id/work-items', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const workItems = await db.getIterationWorkItems(id || '');
    res.json({ success: true, data: workItems });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get iteration work items',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update iteration work items status
router.put('/:id/work-items/status', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { itemIds, status } = req.body;

    if (!Array.isArray(itemIds) || !status) {
      res.status(400).json({ success: false, message: 'Invalid request body' });
      return;
    }

    const result = await db.updateIterationWorkItemsStatus(id || '', itemIds, status, req.user?.id);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update iteration work items status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Assign work item to iteration
router.post('/:id/work-items', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { itemId, type } = req.body;

    if (!itemId || !type) {
      res.status(400).json({ success: false, message: 'Invalid request body' });
      return;
    }

    const result = await db.assignWorkItemToIteration(id || '', itemId, type, req.user?.id);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to assign work item to iteration',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Remove work item from iteration
router.delete('/:id/work-items/:itemId', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { itemId } = req.params;
    const { type } = req.query; // Pass type as query param

    if (!type) {
      res.status(400).json({ success: false, message: 'Missing type query parameter' });
      return;
    }

    const result = await db.removeWorkItemFromIteration(itemId || '', String(type), req.user?.id);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to remove work item from iteration',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create iteration comment
router.post('/comments', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const userId = req.user?.id || data.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const comment = await db.createIterationComment({
      ...data,
      userId
    });

    res.json({ success: true, data: comment });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create iteration comment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get iteration comments
router.get('/:id/comments', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const comments = await db.getIterationComments(id || '');
    res.json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get iteration comments',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get iteration activities
router.get('/:id/activities', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const activities = await db.getIterationActivities(id || '');
    res.json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get iteration activities',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
