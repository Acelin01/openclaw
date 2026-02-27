import express, { Router, Response } from 'express';
import { optionalAuthenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { DatabaseService } from '../lib/db/service.js';

const router: Router = express.Router();
const db = DatabaseService.getInstance();

// Applications
router.get('/applications', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const role = req.query['role'] as string | undefined; // 'candidate' or 'interviewer'
    const where: any = {};
    
    if (userId) {
      if (role === 'candidate') {
        where.userId = userId;
      } else if (role === 'interviewer') {
        where.position = { userId };
      }
    }

    const applications = await db.getRecruitmentApplications(where);
    return res.json({ success: true, data: applications });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to get applications', error });
  }
});

router.post('/applications', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    
    const { positionId, resumeId } = req.body;
    const application = await db.createRecruitmentApplication({
      positionId,
      resumeId,
      userId,
      status: 'NEW'
    });
    return res.json({ success: true, data: application });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create application', error });
  }
});

// Matches
router.get('/matches/:positionId', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { positionId } = req.params;
    if (!positionId) return res.status(400).json({ success: false, message: 'Position ID is required' });
    const matches = await db.getTalentMatches(positionId);
    return res.json({ success: true, data: matches });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to get matches', error });
  }
});

// Interviews
router.get('/interviews', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const role = req.query['role'] as string | undefined;
    const where: any = {};

    if (userId) {
      if (role === 'candidate') {
        where.candidateId = userId;
      } else {
        where.interviewerId = userId;
      }
    }

    const interviews = await db.getInterviews(where);
    return res.json({ success: true, data: interviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to get interviews', error });
  }
});

router.post('/interviews', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const interview = await db.createInterview(req.body);
    return res.json({ success: true, data: interview });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to schedule interview', error });
  }
});

// Settings
router.get('/settings', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    
    const settings = await db.getRecruitmentSettings(userId);
    return res.json({ success: true, data: settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to get settings', error });
  }
});

router.post('/settings', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    
    const settings = await db.upsertRecruitmentSettings(userId, req.body);
    return res.json({ success: true, data: settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update settings', error });
  }
});

// Addresses
router.get('/addresses', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    
    const addresses = await db.getAddresses(userId);
    return res.json({ success: true, data: addresses });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to get addresses', error });
  }
});

router.post('/addresses', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    
    const address = await db.upsertAddress(userId, req.body);
    return res.json({ success: true, data: address });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update address', error });
  }
});

export default router;
