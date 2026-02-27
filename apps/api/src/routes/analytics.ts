import { Router, Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.js';
import { authenticateToken } from '../middleware/auth.js';
import { AnalyticsFilters } from '@uxin/types';
import { DatabaseService } from '../lib/db/service.js';

const router: Router = Router();
const analyticsService = new AnalyticsService();

// Track user activity (for internal use or authenticated users)
router.post('/track', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { activityType, metadata } = req.body;
    const userId = (req as any).user!.id;

    if (!activityType) {
      res.status(400).json({ 
        success: false, 
        error: 'Activity type is required' 
      });
      return;
    }

    await analyticsService.trackUserActivity(userId, activityType, metadata);
    
    res.json({ 
      success: true, 
      message: 'Activity tracked successfully' 
    });
  } catch (error) {
    console.error('Error tracking activity:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to track activity' 
    });
  }
});

// Get user activity history
router.get('/activity/:userId', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { startDate, endDate, activityType, limit } = req.query;

    if (!userId) {
      res.status(400).json({ 
        success: false, 
        error: 'User ID is required' 
      });
      return;
    }

    // Users can only view their own activity unless they're admin
    if ((req as any).user!.role !== 'admin' && (req as any).user!.id !== userId) {
      res.status(403).json({ 
        success: false, 
        error: 'Access denied' 
      });
      return;
    }

    const filters: AnalyticsFilters = {
      startDate: startDate as string,
      endDate: endDate as string,
      activityType: activityType as string,
      ...(limit && { limit: parseInt(limit as string) })
    };

    const activities = await analyticsService.getUserActivity(userId, filters);
    
    res.json({ 
      success: true, 
      data: activities 
    });
  } catch (error) {
    console.error('Error getting user activity:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get user activity' 
    });
  }
});

// Get service metrics (for service providers)
router.get('/services/:serviceId/metrics', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { serviceId } = req.params;
    const { startDate, endDate } = req.query;

    if (!serviceId) {
      res.status(400).json({ 
        success: false, 
        error: 'Service ID is required' 
      });
      return;
    }

    // For now, allow any authenticated user to view service metrics
    // In a real implementation, you'd verify service ownership
    const filters: AnalyticsFilters = {
      startDate: startDate as string,
      endDate: endDate as string
    };

    const metrics = await analyticsService.getServiceMetrics(serviceId, filters);
    
    res.json({ 
      success: true, 
      data: metrics 
    });
  } catch (error) {
    console.error('Error getting service metrics:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get service metrics' 
    });
  }
});

// Get popular services
router.get('/popular-services', async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, limit } = req.query;

    const filters: AnalyticsFilters = {
      startDate: startDate as string,
      endDate: endDate as string,
      ...(limit && { limit: parseInt(limit as string) })
    };

    const popularServices = await analyticsService.getPopularServices(filters);
    
    res.json({ 
      success: true, 
      data: popularServices 
    });
  } catch (error) {
    console.error('Error getting popular services:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get popular services' 
    });
  }
});

// Get user engagement metrics (admin only)
router.get('/user-engagement', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if ((req as any).user!.role !== 'admin') {
      res.status(403).json({ 
        success: false, 
        error: 'Access denied' 
      });
      return;
    }

    const { startDate, endDate } = req.query;

    const filters: AnalyticsFilters = {
      startDate: startDate as string,
      endDate: endDate as string
    };

    const engagement = await analyticsService.getUserEngagement(filters);
    
    res.json({ 
      success: true, 
      data: engagement 
    });
  } catch (error) {
    console.error('Error getting user engagement:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get user engagement' 
    });
  }
});

// Get analytics summary (admin only)
router.get('/summary', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if ((req as any).user!.role !== 'admin') {
      res.status(403).json({ 
        success: false, 
        error: 'Access denied' 
      });
      return;
    }

    const { startDate, endDate } = req.query;

    const filters: AnalyticsFilters = {
      startDate: startDate as string,
      endDate: endDate as string
    };

    const summary = await analyticsService.getAnalyticsSummary(filters);
    
    res.json({ 
      success: true, 
      data: summary 
    });
  } catch (error) {
    console.error('Error getting analytics summary:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get analytics summary' 
    });
  }
});

// Export analytics data (admin only)
router.get('/export/:format', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if ((req as any).user!.role !== 'admin') {
      res.status(403).json({ 
        success: false, 
        error: 'Access denied' 
      });
      return;
    }

    const { format } = req.params;
    const { startDate, endDate } = req.query;

    if (format !== 'csv' && format !== 'json') {
      res.status(400).json({ 
        success: false, 
        error: 'Invalid format. Must be csv or json' 
      });
      return;
    }

    const filters: AnalyticsFilters = {
      startDate: startDate as string,
      endDate: endDate as string
    };

    const exportedData = await analyticsService.exportAnalyticsData(format as 'csv' | 'json', filters);
    
    const filename = `analytics-${new Date().toISOString().split('T')[0]}.${format}`;
    
    res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(exportedData);
  } catch (error) {
    console.error('Error exporting analytics data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to export analytics data' 
    });
  }
});

export default router;

router.get('/bot-stats', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { days = '7' } = req.query as { days?: string };
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - Number(days) * 24 * 60 * 60 * 1000);

    const filters: AnalyticsFilters = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };

    const metrics = await analyticsService.getInteractionMetrics(filters);
    const totalMessages = metrics.length;
    const conversations = new Set<string>();
    let successfulOperations = 0;
    let failedOperations = 0;
    let totalLatency = 0;
    let latencyCount = 0;
    const intentCounts: Record<string, { count: number; success: number }> = {};

    metrics.forEach((m: any) => {
      if (m.conversationId) conversations.add(m.conversationId);
      if (m.intent) {
        const key = String(m.intent);
        intentCounts[key] = intentCounts[key] || { count: 0, success: 0 };
        intentCounts[key].count++;
        if (m.success) intentCounts[key].success++;
        if (key === 'business_operation') {
          if (m.success) successfulOperations++; else failedOperations++;
        }
      }
      if (typeof m.latencyMs === 'number') {
        totalLatency += m.latencyMs;
        latencyCount++;
      }
    });

    const averageResponseTime = latencyCount > 0 ? Math.round((totalLatency / latencyCount) / 100) / 10 : 0;
    const topIntents = Object.entries(intentCounts)
      .map(([intent, data]) => ({ intent, count: data.count, successRate: Math.round((data.success / data.count) * 1000) / 10 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const dailyMap: Record<string, { conversations: Set<string>; operations: number }> = {};
    metrics.forEach((m: any) => {
      const iso = new Date(m.createdAt || Date.now()).toISOString();
      const d = iso.substring(0, 10);
      if (!dailyMap[d]) dailyMap[d] = { conversations: new Set(), operations: 0 };
      if (m.conversationId) dailyMap[d].conversations.add(m.conversationId as string);
      if (m.intent === 'business_operation') dailyMap[d].operations += 1;
    });

    const dailyStats = Object.entries(dailyMap)
      .map(([date, v]) => ({ date, conversations: v.conversations.size, operations: v.operations }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-5);

    const engagement = await analyticsService.getUserEngagement({ startDate: startDate.toISOString(), endDate: endDate.toISOString() });

    res.json({
      success: true,
      data: {
        totalConversations: conversations.size,
        totalMessages,
        successfulOperations,
        failedOperations,
        averageResponseTime,
        activeUsers: engagement.activeUsers,
        topIntents,
        dailyStats,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取机器人统计失败' });
  }
});

router.get('/mobile-overview', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = '30d' } = req.query as { period?: string };
    const now = new Date();
    let startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    if (period === '7d') startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    if (period === '90d') startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const summary = await analyticsService.getAnalyticsSummary({ startDate: startDate.toISOString(), endDate: now.toISOString() });
    const engagement = await analyticsService.getUserEngagement({ startDate: startDate.toISOString(), endDate: now.toISOString() });
    const popularServices = await analyticsService.getPopularServices({ startDate: startDate.toISOString(), endDate: now.toISOString(), limit: 3 });

    const db = DatabaseService.getInstance();
    const latestItems = await db.getQuotations({ sortBy: 'createdAt', sortOrder: 'desc', take: 5 });

    const overview = {
      totalUsers: summary.totalUsers,
      totalRevenue: summary.totalRevenue,
      totalConversations: summary.totalBookings,
      totalServices: summary.totalServices,
      userGrowth: 0,
      revenueGrowth: 0,
      conversationGrowth: 0,
      serviceGrowth: 0,
    };

    const top = popularServices.map(s => ({
      id: s.service.id,
      name: s.service.title,
      category: s.service.category,
      views: s.viewCount,
      conversions: s.bookingCount,
      revenue: s.totalRevenue,
      rating: s.averageRating,
    }));

    const activities = latestItems.map((i: any) => ({
      id: i.id,
      type: 'service',
      title: i.title,
      description: i.description,
      timestamp: new Date(i.createdAt).toLocaleString('zh-CN'),
      impact: 'medium' as const,
    }));

    res.json({
      success: true,
      data: {
        overview,
        userBehavior: {
          dailyActiveUsers: engagement.activeUsers,
          weeklyActiveUsers: engagement.activeUsers,
          monthlyActiveUsers: engagement.activeUsers,
          avgSessionDuration: 0,
          bounceRate: 0,
          userRetention: 0,
        },
        businessMetrics: {
          conversionRate: 0,
          avgOrderValue: 0,
          customerLifetimeValue: 0,
          acquisitionCost: 0,
          churnRate: 0,
          netPromoterScore: 0,
        },
        topServices: top,
        recentActivities: activities,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取移动端概览失败' });
  }
});
