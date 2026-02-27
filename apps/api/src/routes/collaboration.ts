
import express, { Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { createSkillService } from '@uxin/skill';

const router = express.Router();

// Initialize the skill service
// In a real app, this might be a singleton initialized elsewhere
const skillService = createSkillService();

/**
 * POST /api/v1/collaboration/process
 * Start the full collaboration workflow for a project goal
 */
router.post('/process', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { goal } = req.body;
    
    if (!goal) {
      res.status(400).json({ 
        success: false, 
        message: 'Goal is required' 
      });
      return;
    }

    console.log(`[API] Starting collaboration process for goal: ${goal}`);
    
    // Execute the full flow: PreCheck -> Feedback -> Decompose -> Execute -> Evolution
    const result = await skillService.flowManager.processProject(goal);

    res.json({
      success: true,
      data: {
        result,
        timestamp: new Date().toISOString()
      },
      message: 'Collaboration workflow completed successfully'
    });

  } catch (error) {
    console.error('[API] Collaboration workflow failed:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during collaboration workflow',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * POST /api/v1/collaboration/precheck
 * Run only the pre-check phase
 */
router.post('/precheck', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { goal } = req.body;
    
    if (!goal) {
      res.status(400).json({ 
        success: false, 
        message: 'Goal is required' 
      });
      return;
    }

    const result = await skillService.preCheckEngine.executePreCheck([{ text: goal }]);

    res.json({
      success: true,
      data: result,
      message: 'Pre-check completed'
    });

  } catch (error) {
    console.error('[API] Pre-check failed:', error);
    res.status(500).json({
      success: false,
      message: 'Pre-check failed',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;
