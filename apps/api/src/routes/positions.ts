import express, { Router } from 'express';
import { Response } from 'express';
import { optionalAuthenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { DatabaseService } from '../lib/db/service.js';

const router: Router = express.Router();
const db = DatabaseService.getInstance();

router.post('/', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const userId = req.user?.id || data.userId; // Fallback for dev/test

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    let positionData: any = {};
    if (typeof data.content === 'string') {
      try {
        const parsed = JSON.parse(data.content);
        positionData = {
          title: parsed.title || 'Untitled Position',
          description: parsed.description || '',
          salaryMin: parsed.salaryMin,
          salaryMax: parsed.salaryMax,
          location: parsed.location,
          employmentType: parsed.type || parsed.employmentType,
          requirements: parsed.requirements,
          tags: parsed.tags,
          status: parsed.status || 'OPEN',
        };
      } catch (e) {
        console.warn('Failed to parse position content JSON', e);
        positionData = { ...data };
      }
    } else {
      positionData = { ...data };
    }
    
    // Explicitly select fields for Prisma
    const prismaData = {
      userId,
      title: positionData.title,
      description: positionData.description,
      location: positionData.location,
      employmentType: positionData.employmentType,
      salaryMin: positionData.salaryMin,
      salaryMax: positionData.salaryMax,
      requirements: positionData.requirements,
      tags: positionData.tags,
      status: positionData.status,
    };

    const position = await db.createPosition(prismaData);

    res.json({ success: true, data: position });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create position',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(String((req.query as any)['page'])) || 1;
    const limit = parseInt(String((req.query as any)['limit'])) || 10;
    const skip = (page - 1) * limit;

    const status = String((req.query as any)['status'] || '') || undefined;
    const userId = String((req.query as any)['userId'] || '') || undefined;
    const location = String((req.query as any)['location'] || '') || undefined;
    const search = String((req.query as any)['search'] || (req.query as any)['q'] || '') || undefined;

    const where: any = {};
    if (status) where['status'] = status;
    if (userId) where['userId'] = userId;
    if (location) where['location'] = location;
    if (search) where['search'] = search;

    const [list, total] = await Promise.all([
      db.getPositions(where, { skip, take: limit, sortBy: 'createdAt', sortOrder: 'desc' }),
      db.getPositionsCount(where)
    ]);

    res.json({
      success: true,
      data: {
        positions: list,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit) || 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取岗位列表失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
