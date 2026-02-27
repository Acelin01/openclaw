import express from 'express';
import { Request, Response, Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import ExportService from '../services/export.js';

const router: Router = express.Router();
const exportService = ExportService.getInstance();

// Export data in various formats
router.post('/export/:type', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { type } = req.params;
    const { format = 'json', dateRange, filters } = req.body;

    // Validate export type
    const validTypes = ['transactions', 'users', 'performance', 'comprehensive'];
    if (!validTypes.includes(type!)) {
      res.status(400).json({
        success: false,
        message: '无效的导出类型'
      });
      return;
    }

    // Validate format
    const validFormats = ['csv', 'json', 'xlsx'];
    if (!validFormats.includes(format)) {
      res.status(400).json({
        success: false,
        message: '无效的导出格式'
      });
      return;
    }

    // Parse date range if provided
    let parsedDateRange;
    if (dateRange) {
      parsedDateRange = {
        start: new Date(dateRange.start),
        end: new Date(dateRange.end)
      };
    }

    // Generate report
    const reportData = await exportService.generateReport(
      type as any,
      {
        format: format as any,
        dateRange: parsedDateRange || { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() },
        filters
      }
    );

    // Convert data based on format
    let content: string;
    let contentType: string;
    let filename: string;

    switch (format) {
      case 'csv':
        const headers = exportService.generateReportHeaders(type!);
        let csvData = '';
        
        if (type === 'transactions') {
          csvData = exportService.convertToCSV(reportData.transactions, headers);
        } else if (type === 'users') {
          csvData = exportService.convertToCSV(reportData.users, headers);
        } else if (type === 'comprehensive') {
          // For comprehensive reports, include summary data
          csvData = `Summary\n`;
          csvData += `Total Transactions,${reportData.summary.totalTransactions}\n`;
          csvData += `Total Revenue,${reportData.summary.totalRevenue}\n`;
          csvData += `Total Users,${reportData.summary.totalUsers}\n`;
          csvData += `Completion Rate,${reportData.summary.completionRate}%\n\n`;
          csvData += `Transactions\n${exportService.convertToCSV(reportData.transactions, exportService.generateReportHeaders('transactions'))}\n\n`;
          csvData += `Users\n${exportService.convertToCSV(reportData.users, exportService.generateReportHeaders('users'))}`;
        }
        
        content = csvData;
        contentType = 'text/csv';
        filename = `uxin-${type}-report-${new Date().toISOString().split('T')[0]}.csv`;
        break;

      case 'json':
        content = exportService.convertToJSON(reportData);
        contentType = 'application/json';
        filename = `uxin-${type}-report-${new Date().toISOString().split('T')[0]}.json`;
        break;

      case 'xlsx':
        // For now, return JSON with a note about Excel format
        content = JSON.stringify({
          note: 'Excel format support coming soon',
          data: reportData
        }, null, 2);
        contentType = 'application/json';
        filename = `uxin-${type}-report-${new Date().toISOString().split('T')[0]}.json`;
        break;

      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    // Set headers for file download
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', Buffer.byteLength(content));

    res.send(content);

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      message: '导出失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get dashboard data
router.get('/dashboard', authenticateToken, async (_req: Request, res: Response): Promise<void> => {
  try {
    const dashboardData = await exportService.generateDashboardData();
    
    res.json({
      success: true,
      data: dashboardData,
      message: '仪表板数据获取成功'
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: '获取仪表板数据失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get available report types and formats
router.get('/config', authenticateToken, async (_req: Request, res: Response): Promise<void> => {
  try {
    const config = {
      reportTypes: [
        { id: 'transactions', name: '交易报告', description: '交易数据统计和分析' },
        { id: 'users', name: '用户报告', description: '用户增长和活跃度分析' },
        { id: 'performance', name: '性能报告', description: '系统性能和业务指标' },
        { id: 'comprehensive', name: '综合报告', description: '完整的业务数据概览' }
      ],
      exportFormats: [
        { id: 'csv', name: 'CSV格式', description: '适用于Excel和数据分析' },
        { id: 'json', name: 'JSON格式', description: '适用于系统集成和API' },
        { id: 'xlsx', name: 'Excel格式', description: '适用于高级报表和图表（即将推出）' }
      ],
      datePresets: [
        { id: 'today', name: '今天', days: 1 },
        { id: 'week', name: '最近7天', days: 7 },
        { id: 'month', name: '最近30天', days: 30 },
        { id: 'quarter', name: '最近90天', days: 90 },
        { id: 'year', name: '最近一年', days: 365 }
      ]
    };

    res.json({
      success: true,
      data: config,
      message: '导出配置获取成功'
    });
  } catch (error) {
    console.error('Config error:', error);
    res.status(500).json({
      success: false,
      message: '获取导出配置失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
