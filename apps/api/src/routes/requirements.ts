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

    let inquiryData: any = {};
    if (typeof data.content === 'string') {
      try {
        const parsed = JSON.parse(data.content);
        inquiryData = {
          title: parsed.title || 'Untitled Requirement',
          description: parsed.description || '',
          category: parsed.category || 'General',
          budgetMin: parsed.budgetMin,
          budgetMax: parsed.budgetMax,
          deadline: parsed.deadline,
          requirements: parsed.requirements,
          deliverables: parsed.deliverables,
          location: parsed.location,
          status: parsed.status || 'ACTIVE',
        };
      } catch (e) {
        console.warn('Failed to parse requirement content JSON', e);
        inquiryData = { ...data };
      }
    } else {
      inquiryData = { ...data };
    }
    
    // Explicitly select fields for Prisma
    const prismaData = {
      userId,
      title: inquiryData.title,
      description: inquiryData.description,
      category: inquiryData.category,
      budgetMin: inquiryData.budgetMin,
      budgetMax: inquiryData.budgetMax,
      deadline: inquiryData.deadline,
      requirements: inquiryData.requirements,
      deliverables: inquiryData.deliverables,
      location: inquiryData.location,
      status: inquiryData.status,
    };

    const inquiry = await db.createInquiry(prismaData);

    res.json({ success: true, data: inquiry });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create requirement',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
