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

    let serviceData: any = {};
    if (typeof data.content === 'string') {
      try {
        const parsed = JSON.parse(data.content);
        serviceData = {
          title: parsed.title || 'Untitled Service',
          description: parsed.description || '',
          category: parsed.category || 'General',
          priceType: parsed.priceType || 'FIXED',
          priceAmount: parsed.priceAmount,
          priceRangeMin: parsed.priceRangeMin,
          priceRangeMax: parsed.priceRangeMax,
          deliveryTime: parsed.deliveryTime,
          includes: parsed.includes,
          excludes: parsed.excludes,
          requirements: parsed.requirements,
          status: parsed.status || 'ACTIVE',
        };
      } catch (e) {
        console.warn('Failed to parse service content JSON', e);
        serviceData = { ...data };
      }
    } else {
      serviceData = { ...data };
    }
    
    // Explicitly select fields for Prisma
    const prismaData = {
      userId,
      title: serviceData.title,
      description: serviceData.description,
      category: serviceData.category,
      priceType: serviceData.priceType,
      priceAmount: serviceData.priceAmount,
      priceRangeMin: serviceData.priceRangeMin,
      priceRangeMax: serviceData.priceRangeMax,
      deliveryTime: serviceData.deliveryTime,
      includes: serviceData.includes,
      excludes: serviceData.excludes,
      requirements: serviceData.requirements,
      status: serviceData.status,
    };

    const service = await db.createQuotation(prismaData);

    res.json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create service',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
