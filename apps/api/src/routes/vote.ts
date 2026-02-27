import { Router } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import {
  getChatById,
  getVotesByChatId,
  voteMessage,
  ensureGuestUser,
} from '../lib/db/queries.js';

const router: Router = Router();

// GET /api/v1/vote?chatId=...
router.get('/', async (req: AuthenticatedRequest, res) => {
    try {
        const { chatId } = req.query;
        if (!chatId || typeof chatId !== 'string') {
            res.status(400).json({ error: 'Parameter chatId is required' });
            return;
        }

        // Handle guest user
        let userId = req.user?.id;
        if (!userId) {
            const guestId = 'guest-user-id';
            const guestEmail = 'guest@example.com';
            await ensureGuestUser(guestId, guestEmail);
            userId = guestId;
        }

        const chat = await getChatById({ id: chatId });
        
        if (!chat) {
             // For new chats not yet saved to DB, return empty votes instead of 404
             res.json([]);
             return;
        }

        if (chat.userId !== userId) {
            res.status(403).json({ error: 'Unauthorized' });
            return;
        }

        const votes = await getVotesByChatId({ id: chatId });
        res.json(votes);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch votes' });
    }
});

// PATCH /api/v1/vote
router.patch('/', async (req: AuthenticatedRequest, res) => {
    try {
        const { chatId, messageId, type } = req.body;
        
        if (!chatId || !messageId || !type) {
             res.status(400).json({ error: 'Parameters chatId, messageId, and type are required' });
             return;
        }

        // Handle guest user
        let userId = req.user?.id;
        if (!userId) {
            const guestId = 'guest-user-id';
            const guestEmail = 'guest@example.com';
            await ensureGuestUser(guestId, guestEmail);
            userId = guestId;
        }

        const chat = await getChatById({ id: chatId });
        
        if (!chat) {
             res.status(404).json({ error: 'Chat not found' });
             return;
        }

        if (chat.userId !== userId) {
            res.status(403).json({ error: 'Unauthorized' });
            return;
        }

        await voteMessage({
            chatId,
            messageId,
            type: type as 'up' | 'down',
        });

        res.json({ message: 'Message voted' });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to vote' });
    }
});

export default router;
