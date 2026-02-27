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

    // Process content if it's a JSON string (from artifact)
    let resumeData: any = {};
    if (typeof data.content === 'string') {
      try {
        const parsed = JSON.parse(data.content);
        // Map common fields from artifact content to Resume model
        resumeData = {
          name: parsed.name || 'Untitled Resume',
          title: parsed.title,
          summary: parsed.summary,
          skills: parsed.skills,
          experiences: parsed.experiences,
          education: parsed.education,
          location: parsed.location,
          status: parsed.status || 'ACTIVE',
        };
      } catch (e) {
        console.warn('Failed to parse resume content JSON', e);
        resumeData = { ...data };
      }
    } else {
      resumeData = { ...data };
    }
    
    // Explicitly select fields for Prisma
    const prismaData = {
      userId,
      name: resumeData.name,
      title: resumeData.title,
      summary: resumeData.summary,
      skills: resumeData.skills,
      experiences: resumeData.experiences,
      education: resumeData.education,
      location: resumeData.location,
      status: resumeData.status,
    };

    const resume = await db.createResume(prismaData);

    res.json({ success: true, data: resume });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '创建简历失败',
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
    const search = String((req.query as any)['search'] || (req.query as any)['q'] || '') || undefined;

    const where: any = {};
    if (status) where['status'] = status;
    if (userId) where['userId'] = userId;
    if (search) where['search'] = search;

    const [list, total] = await Promise.all([
      db.getResumes(where, { skip, take: limit, sortBy: 'createdAt', sortOrder: 'desc' }),
      db.getResumesCount(where)
    ]);

    res.json({
      success: true,
      data: {
        resumes: list,
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
      message: '获取简历列表失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
