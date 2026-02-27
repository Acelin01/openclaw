import { Router } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import {
  getChatsByUserId,
  deleteAllChatsByUserId,
} from '../lib/db/queries.js';
import { DatabaseService } from '../lib/db/service.js';

const router: Router = Router();

// GET /api/v1/history
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
        const db = DatabaseService.getInstance();
        if (!db.isAvailable()) {
            res.status(503).json({ error: '数据库连接不可用' });
            return;
        }
        if (!req.user) {
             res.status(401).json({ error: 'Unauthorized' });
             return;
        }
        const { id } = req.user;
        const { limit = '10', starting_after, ending_before, project_id } = req.query;

        if (starting_after && ending_before) {
            res.status(400).json({ error: 'Only one of starting_after or ending_before can be provided.' });
            return;
        }

        const chats = await getChatsByUserId({
            id,
            limit: parseInt(limit as string, 10),
            startingAfter: starting_after as string,
            endingBefore: ending_before as string,
            projectId: project_id as string,
        });

        res.json(chats);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// DELETE /api/v1/history
router.delete('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
        if (!req.user) {
             res.status(401).json({ error: 'Unauthorized' });
             return;
        }
        const { id } = req.user;
        const result = await deleteAllChatsByUserId({ userId: id });
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to delete history' });
    }
});

export default router;
