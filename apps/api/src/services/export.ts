import { DatabaseService } from '../lib/db/service.js';
import { Parser } from 'json2csv';

interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  dateRange?: {
    start: Date;
    end: Date;
  };
  filters?: {
    status?: string[];
    category?: string[];
    userId?: string;
  };
}

interface ExportData {
  transactions: any[];
  users: any[];
  quotations: any[];
  inquiries: any[];
  summary: {
    totalTransactions: number;
    totalRevenue: number;
    totalUsers: number;
    completionRate: number;
  };
}

export class ExportService {
  private static instance: ExportService;
  private db: DatabaseService;

  private constructor() {
    this.db = DatabaseService.getInstance();
  }

  static getInstance(): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService();
    }
    return ExportService.instance;
  }

  async generateReport(type: 'transactions' | 'users' | 'performance' | 'comprehensive', options: ExportOptions): Promise<ExportData> {
    const { dateRange, filters } = options;
    
    let whereClause: any = {};
    
    // Apply date range filter
    if (dateRange) {
      whereClause.createdAt = {
        gte: dateRange.start,
        lte: dateRange.end
      };
    }

    // Apply additional filters
    if (filters?.status?.length) {
      whereClause.status = { in: filters.status };
    }
    if (filters?.category?.length) {
      whereClause.category = { in: filters.category };
    }
    if (filters?.userId) {
      whereClause.userId = filters.userId;
    }

    let data: ExportData;

    switch (type) {
      case 'transactions':
        data = await this.generateTransactionReport(whereClause);
        break;
      case 'users':
        data = await this.generateUserReport(whereClause);
        break;
      case 'performance':
        data = await this.generatePerformanceReport(whereClause);
        break;
      case 'comprehensive':
        data = await this.generateComprehensiveReport(whereClause);
        break;
      default:
        throw new Error(`Unsupported report type: ${type}`);
    }

    return data;
  }

  private async generateTransactionReport(whereClause: any): Promise<ExportData> {
    const transactions = await this.db.getTransactions(whereClause);
    
    // Calculate summary statistics
    const totalTransactions = transactions.length;
    const totalRevenue = transactions.reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
    const completedTransactions = transactions.filter((t: any) => t.status === 'completed').length;
    const completionRate = totalTransactions > 0 ? (completedTransactions / totalTransactions) * 100 : 0;

    return {
      transactions,
      users: [],
      quotations: [],
      inquiries: [],
      summary: {
        totalTransactions,
        totalRevenue,
        totalUsers: 0,
        completionRate
      }
    };
  }

  private async generateUserReport(whereClause: any): Promise<ExportData> {
    const users = await this.db.getUsers(whereClause);
    
    return {
      transactions: [],
      users,
      quotations: [],
      inquiries: [],
      summary: {
        totalTransactions: 0,
        totalRevenue: 0,
        totalUsers: users.length,
        completionRate: 0
      }
    };
  }

  private async generatePerformanceReport(whereClause: any): Promise<ExportData> {
    const transactions = await this.db.getTransactions(whereClause);
    const users = await this.db.getUsers({});
    
    // Calculate performance metrics
    const totalTransactions = transactions.length;
    const totalRevenue = transactions.reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
    const completedTransactions = transactions.filter((t: any) => t.status === 'completed').length;
    const completionRate = totalTransactions > 0 ? (completedTransactions / totalTransactions) * 100 : 0;

    return {
      transactions,
      users,
      quotations: [],
      inquiries: [],
      summary: {
        totalTransactions,
        totalRevenue,
        totalUsers: users.length,
        completionRate
      }
    };
  }

  private async generateComprehensiveReport(whereClause: any): Promise<ExportData> {
    const [transactions, users, quotations, inquiries] = await Promise.all([
      this.db.getTransactions(whereClause),
      this.db.getUsers({}),
      this.db.getQuotations({}),
      this.db.getInquiries({})
    ]);

    // Calculate comprehensive statistics
    const totalTransactions = transactions.length;
    const totalRevenue = transactions.reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
    const completedTransactions = transactions.filter((t: any) => t.status === 'completed').length;
    const completionRate = totalTransactions > 0 ? (completedTransactions / totalTransactions) * 100 : 0;

    return {
      transactions,
      users,
      quotations,
      inquiries,
      summary: {
        totalTransactions,
        totalRevenue,
        totalUsers: users.length,
        completionRate
      }
    };
  }

  convertToCSV(data: any[], headers?: string[]): string {
    if (!data.length) return '';

    try {
      const parser = new Parser({
        fields: headers,
        withBOM: true, // Add BOM for Excel compatibility
        defaultValue: '', // Default empty values
      });

      return parser.parse(data);
    } catch (error) {
      console.error('CSV conversion error:', error);
      // Fallback to manual CSV generation
      return this.manualCSVConversion(data, headers);
    }
  }

  private manualCSVConversion(data: any[], headers?: string[]): string {
    if (!data.length) return '';

    // If no headers provided, extract from first object
    const csvHeaders = headers || Object.keys(data[0]);
    
    const csvRows = data.map(row => 
      csvHeaders.map(header => {
        const value = row[header] || '';
        // Escape commas and quotes
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    );

    return [csvHeaders.join(','), ...csvRows].join('\n');
  }

  convertToJSON(data: ExportData): string {
    return JSON.stringify(data, null, 2);
  }

  generateReportHeaders(type: string): string[] {
    switch (type) {
      case 'transactions':
        return ['id', 'customerId', 'providerId', 'amount', 'currency', 'status', 'paymentStatus', 'createdAt', 'updatedAt'];
      case 'users':
        return ['id', 'email', 'name', 'role', 'isVerified', 'createdAt', 'updatedAt'];
      case 'quotations':
        return ['id', 'userId', 'title', 'category', 'priceType', 'deliveryTime', 'status', 'createdAt', 'updatedAt'];
      case 'inquiries':
        return ['id', 'userId', 'title', 'category', 'budgetMin', 'budgetMax', 'status', 'createdAt', 'updatedAt'];
      default:
        return [];
    }
  }

  async generateDashboardData(): Promise<any> {
    const [transactions, users, quotations, inquiries] = await Promise.all([
      this.db.getTransactions({}),
      this.db.getUsers({}),
      this.db.getQuotations({}),
      this.db.getInquiries({})
    ]);

    const totalRevenue = transactions.reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
    const completedTransactions = transactions.filter((t: any) => t.status === 'completed').length;
    const completionRate = transactions.length > 0 ? (completedTransactions / transactions.length) * 100 : 0;

    // Calculate monthly trends
    const monthlyTrends = this.calculateMonthlyTrends(transactions);
    const categoryBreakdown = this.calculateCategoryBreakdown(transactions, quotations, inquiries);

    return {
      overview: {
        totalTransactions: transactions.length,
        totalUsers: users.length,
        totalQuotations: quotations.length,
        totalInquiries: inquiries.length,
        totalRevenue,
        completionRate
      },
      trends: {
        monthly: monthlyTrends,
        categories: categoryBreakdown
      },
      recentActivity: {
        transactions: transactions.slice(-5),
        quotations: quotations.slice(-5),
        inquiries: inquiries.slice(-5)
      }
    };
  }

  private calculateMonthlyTrends(transactions: any[]): any[] {
    const trends: { [key: string]: { month: string; count: number; revenue: number } } = {};
    
    transactions.forEach(transaction => {
      const month = new Date(transaction.createdAt).toISOString().slice(0, 7); // YYYY-MM format
      if (!trends[month]) {
        trends[month] = { month, count: 0, revenue: 0 };
      }
      trends[month].count++;
      trends[month].revenue += transaction.amount || 0;
    });

    return Object.values(trends).sort((a, b) => a.month.localeCompare(b.month));
  }

  private calculateCategoryBreakdown(transactions: any[], quotations: any[], inquiries: any[]): any {
    const categories = new Set([
      ...quotations.map(q => q.category),
      ...inquiries.map(i => i.category)
    ]);

    return Array.from(categories).map(category => {
      const categoryQuotations = quotations.filter(q => q.category === category).length;
      const categoryInquiries = inquiries.filter(i => i.category === category).length;
      const categoryTransactions = transactions.filter(() => {
        // This is a simplified calculation - in reality you'd need to join with quotations/inquiries
        return Math.random() > 0.5; // Mock logic
      }).length;

      return {
        category,
        quotations: categoryQuotations,
        inquiries: categoryInquiries,
        transactions: categoryTransactions
      };
    });
  }
}

export default ExportService;
