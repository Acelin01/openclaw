import { DatabaseService } from '../lib/db/service.js';
import { UserActivity, ServiceMetrics, AnalyticsFilters, AnalyticsSummary, PopularService, UserEngagement } from '@uxin/types';

export class AnalyticsService {
  private db: DatabaseService;

  constructor() {
    this.db = DatabaseService.getInstance();
  }

  async trackUserActivity(
    userId: string,
    activityType: 'page_view' | 'service_view' | 'search' | 'booking' | 'review' | 'message',
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await this.db.createUserActivity({
        userId,
        activityType,
        metadata: metadata ? JSON.stringify(metadata) : null,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error tracking user activity:', error);
      throw new Error('Failed to track user activity');
    }
  }

  // 会话管理
  async startSession(params: {
    userId?: string;
    sessionId: string;
    ipAddress?: string;
    userAgent?: string;
    device?: string;
    browser?: string;
    os?: string;
    language?: string;
    referrer?: string;
  }): Promise<any> {
    return this.db.createUserSession(params);
  }

  async endSession(sessionId: string): Promise<any> {
    return this.db.endUserSession(sessionId);
  }

  // 用户事件
  async trackEvent(
    userId: string | undefined,
    sessionId: string | undefined,
    eventType: 'page_view' | 'widget_open' | 'message_send' | 'quick_reply_click' | 'file_upload' | 'voice_start' | 'voice_end' | 'click' | 'view' | 'login' | 'signup',
    properties?: Record<string, any>,
    timestamp?: Date
  ): Promise<void> {
    await this.db.createUserEvent({
      ...(userId && { userId }),
      ...(sessionId && { sessionId }),
      eventType,
      properties,
      timestamp,
    });
  }

  async getUserEvents(filters: AnalyticsFilters & { eventType?: string } = {}): Promise<any[]> {
    const { startDate, endDate, userId, limit = 200, activityType } = filters;
    return this.db.getUserEvents({
      ...(userId && { userId }),
      ...(activityType && { eventType: activityType }),
      ...(startDate && { dateFrom: new Date(startDate) }),
      ...(endDate && { dateTo: new Date(endDate) }),
      limit,
    });
  }

  // 交互指标
  async recordInteractionMetric(params: {
    userId?: string;
    sessionId?: string;
    conversationId?: string;
    messageId?: string;
    role: 'user' | 'ai' | 'system';
    inputTokens?: number;
    outputTokens?: number;
    latencyMs?: number;
    sentimentScore?: number;
    intent?: string;
    success?: boolean;
  }): Promise<void> {
    await this.db.createInteractionMetric({
      ...(params.userId && { userId: params.userId }),
      ...(params.sessionId && { sessionId: params.sessionId }),
      ...(params.conversationId && { conversationId: params.conversationId }),
      ...(params.messageId && { messageId: params.messageId }),
      role: params.role,
      ...(typeof params.inputTokens === 'number' && { inputTokens: params.inputTokens }),
      ...(typeof params.outputTokens === 'number' && { outputTokens: params.outputTokens }),
      ...(typeof params.latencyMs === 'number' && { latencyMs: params.latencyMs }),
      ...(typeof params.sentimentScore === 'number' && { sentimentScore: params.sentimentScore }),
      ...(params.intent && { intent: params.intent }),
      ...(typeof params.success === 'boolean' && { success: params.success }),
    });
  }

  async getInteractionMetrics(filters: AnalyticsFilters & { sessionId?: string } = {}): Promise<any[]> {
    const { startDate, endDate, userId, serviceId, limit = 200, sessionId } = filters;
    return this.db.getInteractionMetrics({
      ...(userId && { userId }),
      ...(serviceId && { conversationId: serviceId }),
      ...(sessionId && { sessionId }),
      ...(startDate && { dateFrom: new Date(startDate) }),
      ...(endDate && { dateTo: new Date(endDate) }),
      limit,
    });
  }

  // 业务指标统计与趋势
  async calculateAndStoreDailyBusinessMetrics(date: Date = new Date()): Promise<void> {
    // Revenue & bookings from quotations with accepted status
    const quotations = await this.db.getQuotations({ status: 'accepted' });
    const dailyQuotations = quotations.filter((q: any) => {
      const d = new Date(q.createdAt);
      return d.toDateString() === date.toDateString();
    });
    const bookings = dailyQuotations.length;
    const revenue = dailyQuotations.reduce((sum: number, q: any) => sum + (q.priceAmount || 0), 0);

    await this.db.upsertBusinessMetric({ metricKey: 'bookings', period: 'DAILY', value: bookings, date });
    await this.db.upsertBusinessMetric({ metricKey: 'revenue', period: 'DAILY', value: revenue, date });

    // Active users from activities/events
    const activities = await this.db.getUserActivities({ startDate: new Date(date.toDateString()), endDate: new Date(date.toDateString()) });
    const activeUserIds = new Set(activities.map((a: any) => a.user_id));
    await this.db.upsertBusinessMetric({ metricKey: 'active_users', period: 'DAILY', value: activeUserIds.size, date });

    // Conversion: bookings / service_views
    const serviceViews = activities.filter((a: any) => a.activity_type === 'service_view').length;
    const conversionRate = serviceViews > 0 ? (bookings / serviceViews) * 100 : 0;
    await this.db.upsertBusinessMetric({ metricKey: 'conversion_rate', period: 'DAILY', value: conversionRate, date });
  }

  async getBusinessMetrics(metricKey: string, startDate?: string | Date, endDate?: string | Date): Promise<{ date: Date; value: number }[]> {
    const rows = await this.db.getBusinessMetrics({
      metricKey,
      period: 'DAILY',
      ...(startDate && { dateFrom: new Date(startDate) }),
      ...(endDate && { dateTo: new Date(endDate) }),
    });
    return rows.map((r: any) => ({ date: new Date(r.date), value: r.value }));
  }

  async getUserActivity(
    userId: string,
    filters: AnalyticsFilters = {}
  ): Promise<UserActivity[]> {
    try {
      const { startDate, endDate, activityType, limit = 50 } = filters;
      
      const activities = await this.db.getUserActivities({
        userId,
        ...(activityType && { activityType }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        limit
      });
      
      return activities.map((activity: any) => ({
        id: activity.id,
        userId: activity.user_id,
        activityType: activity.activity_type,
        metadata: activity.metadata ? JSON.parse(activity.metadata) : null,
        createdAt: activity.created_at,
        updatedAt: activity.updated_at
      }));
    } catch (error) {
      console.error('Error getting user activity:', error);
      throw new Error('Failed to get user activity');
    }
  }

  async getServiceMetrics(
    serviceId: string,
    filters: AnalyticsFilters = {}
  ): Promise<ServiceMetrics> {
    try {
      const { startDate, endDate } = filters;
      
      // Get basic service info (using quotations as services)
      const service = await this.db.getQuotationById(serviceId);
      if (!service) {
        throw new Error('Service not found');
      }

      // Get view count from user activities
      const activities = await this.db.getUserActivities({
        activityType: 'service_view',
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) })
      });
      
      const viewCount = activities.filter((activity: any) => {
        const metadata = activity.metadata ? JSON.parse(activity.metadata) : {};
        return metadata.serviceId === serviceId;
      }).length;

      // Get booking count and revenue from quotations
      const quotations = await this.db.getQuotations({
        id: serviceId,
        status: 'accepted'
      });
      
      const bookingCount = quotations.length;
      const totalRevenue = quotations.reduce((sum: number, quotation: any) => {
        return sum + (quotation.priceAmount || 0);
      }, 0);

      // Get average rating from reviews
      // Note: This would need a getReviewsByServiceId method, for now we'll use mock data
      const averageRating = 4.5; // Mock rating
      const reviewCount = 12; // Mock review count

      return {
        serviceId,
        viewCount,
        bookingCount,
        totalRevenue,
        averageRating,
        reviewCount,
        conversionRate: viewCount > 0 ? (bookingCount / viewCount) * 100 : 0
      };
    } catch (error) {
      console.error('Error getting service metrics:', error);
      throw new Error('Failed to get service metrics');
    }
  }

  async getPopularServices(
    filters: AnalyticsFilters = {}
  ): Promise<PopularService[]> {
    try {
      const { startDate, endDate, limit = 10 } = filters;
      
      // Get all service view activities
      const activities = await this.db.getUserActivities({
        activityType: 'service_view',
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) })
      });
      
      // Count views by service
      const serviceViews: Record<string, number> = {};
      activities.forEach((activity: any) => {
        const metadata = activity.metadata ? JSON.parse(activity.metadata) : {};
        const serviceId = metadata.serviceId;
        if (serviceId) {
          serviceViews[serviceId] = (serviceViews[serviceId] || 0) + 1;
        }
      });
      
      // Sort by view count and get top services
      const sortedServices = Object.entries(serviceViews)
        .sort(([,a], [,b]) => b - a)
        .slice(0, limit);
      
      const result: PopularService[] = [];
      
      for (const [serviceId, viewCount] of sortedServices) {
        const q = await this.db.getQuotationById(serviceId);
        if (q) {
          const mapped: any = {
            id: q.id,
            userId: q.userId,
            title: q.title,
            description: q.description,
            category: q.category,
            priceType: (q.priceType || 'fixed').toLowerCase() as 'fixed' | 'hourly' | 'custom',
            deliveryTime: q.deliveryTime,
            includes: q.includes || [],
            excludes: q.excludes || [],
            requirements: q.requirements || [],
            views: 0,
            status: (q.status || 'active').toLowerCase() as 'active' | 'paused' | 'expired',
            aiGenerated: !!q.aiGenerated,
            createdAt: new Date(q.createdAt),
            updatedAt: new Date(q.updatedAt)
          };
          if (q.priceAmount != null) mapped.priceAmount = q.priceAmount;
          if (q.priceRangeMin != null) mapped.priceRangeMin = q.priceRangeMin;
          if (q.priceRangeMax != null) mapped.priceRangeMax = q.priceRangeMax;
          if (q.aiConversationId != null) mapped.aiConversationId = q.aiConversationId;
          const metrics = await this.getServiceMetrics(serviceId, filters);
          result.push({
            service: mapped,
            viewCount,
            bookingCount: metrics.bookingCount,
            averageRating: metrics.averageRating,
            totalRevenue: metrics.totalRevenue
          });
        }
      }

      return result;
    } catch (error) {
      console.error('Error getting popular services:', error);
      throw new Error('Failed to get popular services');
    }
  }

  async getUserEngagement(
    filters: AnalyticsFilters = {}
  ): Promise<UserEngagement> {
    try {
      const { startDate, endDate } = filters;
      
      // Get total users
      // Note: This would need a getUsersCount method, for now we'll use mock data
      const totalUsers = 1000; // Mock total users

      // Get active users (users with activity in the period)
      const activities = await this.db.getUserActivities({
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) })
      });
      
      const activeUserIds = new Set(activities.map((activity: any) => activity.user_id));
      const activeUsers = activeUserIds.size;

      // Get new users
      // Note: This would need a getNewUsersCount method, for now we'll use mock data
      const newUsers = 50; // Mock new users

      return {
        totalUsers,
        activeUsers,
        newUsers,
        engagementRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0
      };
    } catch (error) {
      console.error('Error getting user engagement:', error);
      throw new Error('Failed to get user engagement');
    }
  }

  async getAnalyticsSummary(
    filters: AnalyticsFilters = {}
  ): Promise<AnalyticsSummary> {
    try {
      // Get total bookings from quotations
      const quotations = await this.db.getQuotations({
        status: 'accepted'
      });
      
      const totalBookings = quotations.length;
      const totalRevenue = quotations.reduce((sum: number, quotation: any) => {
        return sum + (quotation.priceAmount || 0);
      }, 0);

      // Get total services
      const totalServices = await this.db.getQuotationsCount();

      // Get user engagement
      const userEngagement = await this.getUserEngagement(filters);

      // Get popular services
      const popularServices = await this.getPopularServices({ ...filters, limit: 5 });

      return {
        totalBookings,
        totalRevenue,
        totalServices,
        totalUsers: userEngagement.totalUsers,
        activeUsers: userEngagement.activeUsers,
        newUsers: userEngagement.newUsers,
        popularServices
      };
    } catch (error) {
      console.error('Error getting analytics summary:', error);
      throw new Error('Failed to get analytics summary');
    }
  }

  async exportAnalyticsData(
    format: 'csv' | 'json',
    filters: AnalyticsFilters = {}
  ): Promise<string> {
    try {
      const summary = await this.getAnalyticsSummary(filters);
      const popularServices = await this.getPopularServices(filters);
      const userEngagement = await this.getUserEngagement(filters);
      const revenueTrend = await this.getBusinessMetrics('revenue', filters.startDate, filters.endDate);
      const bookingsTrend = await this.getBusinessMetrics('bookings', filters.startDate, filters.endDate);
      const activeUsersTrend = await this.getBusinessMetrics('active_users', filters.startDate, filters.endDate);

      const data = {
        summary,
        popularServices,
        userEngagement,
        trends: {
          revenue: revenueTrend,
          bookings: bookingsTrend,
          activeUsers: activeUsersTrend,
        },
        generatedAt: new Date().toISOString()
      };

      if (format === 'json') {
        return JSON.stringify(data, null, 2);
      } else {
        // Convert to CSV
        let csv = 'Metric,Value\n';
        csv += `Total Bookings,${summary.totalBookings}\n`;
        csv += `Total Revenue,${summary.totalRevenue}\n`;
        csv += `Total Services,${summary.totalServices}\n`;
        csv += `Total Users,${summary.totalUsers}\n`;
        csv += `Active Users,${summary.activeUsers}\n`;
        csv += `New Users,${summary.newUsers}\n`;
        csv += `Engagement Rate,${userEngagement.engagementRate.toFixed(2)}%\n`;
        
        csv += '\nPopular Services\n';
        csv += 'Service Title,Views,Bookings,Rating,Revenue\n';
        popularServices.forEach(service => {
          csv += `${service.service.title},${service.viewCount},${service.bookingCount},${service.averageRating.toFixed(1)},${service.totalRevenue}\n`;
        });

        return csv;
      }
    } catch (error) {
      console.error('Error exporting analytics data:', error);
      throw new Error('Failed to export analytics data');
    }
  }
}
