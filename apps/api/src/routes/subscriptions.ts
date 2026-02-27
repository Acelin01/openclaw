import express, { Router, Response } from 'express';
import { getPrisma } from '../lib/db/index.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

const router: Router = express.Router();

// 获取用户当前有效的订阅及使用情况
router.get('/mine', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const prisma = getPrisma();
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // 获取用户当前有效订阅
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        endDate: {
          gt: new Date()
        }
      },
      include: {
        package: true
      }
    });

    if (!subscription) {
      return res.json(null);
    }

    // 计算剩余配额
    const aiChatRemaining = Math.max((subscription.package.aiChatQuota || 0) - subscription.aiChatUsed, 0);
    const priorityMatchRemaining = Math.max((subscription.package.priorityMatchQuota || 0) - subscription.priorityMatchUsed, 0);

    return res.json({
      id: subscription.id,
      status: subscription.status,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      aiChatUsed: subscription.aiChatUsed,
      priorityMatchUsed: subscription.priorityMatchUsed,
      package: {
        id: subscription.package.id,
        name: subscription.package.name,
        type: subscription.package.type,
        aiChatQuota: subscription.package.aiChatQuota,
        priorityMatchQuota: subscription.package.priorityMatchQuota,
        features: subscription.package.features
      },
      quotaBalance: {
        aiChat: {
          total: subscription.package.aiChatQuota || 0,
          used: subscription.aiChatUsed,
          remaining: aiChatRemaining
        },
        priorityMatch: {
          total: subscription.package.priorityMatchQuota || 0,
          used: subscription.priorityMatchUsed,
          remaining: priorityMatchRemaining
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
