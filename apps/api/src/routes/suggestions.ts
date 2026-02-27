import { Router } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import {
  getSuggestionsByDocumentId,
} from '../lib/db/queries.js';

const router: Router = Router();

// GET /api/v1/suggestions?documentId=...
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
        const { documentId } = req.query;
        if (!documentId || typeof documentId !== 'string') {
            res.status(400).json({ error: 'Parameter documentId is required' });
            return;
        }

        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const suggestions = await getSuggestionsByDocumentId({ documentId });
        
        if (suggestions.length === 0) {
             res.json([]);
             return;
        }

        const suggestion = suggestions[0];
        if (suggestion && suggestion.userId !== req.user.id) {
            res.status(403).json({ error: 'Unauthorized' });
            return;
        }

        res.json(suggestions);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch suggestions' });
    }
});

export default router;
