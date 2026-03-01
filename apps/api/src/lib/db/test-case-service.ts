/**
 * 测试用例管理服务
 * 提供测试用例的创建、查询、审核、执行等功能
 */

import { prisma } from './index.js';
import type { TestCase, TestCaseStatus, TestCasePriority, TestCaseType } from '@prisma/client';

interface TestCaseCreateData {
  title: string;
  description?: string;
  type?: TestCaseType;
  priority?: TestCasePriority;
  projectId?: string;
  collaborationId?: string;
  testSuiteId?: string;
  precondition?: string;
  steps?: any[];
  expectedResult?: string;
  tags?: string[];
  assigneeId?: string;
  userId?: string;
}

interface TestCaseReviewData {
  status: 'APPROVED' | 'REJECTED';
  reviewComment?: string;
  reviewerId: string;
}

interface TestCaseExecutionData {
  testCaseId: string;
  executedById?: string;
  status: 'PENDING' | 'PASSED' | 'FAILED' | 'BLOCKED' | 'SKIPPED';
  result?: string;
  notes?: string;
  duration?: number;
}

export class TestCaseService {
  /**
   * 创建测试用例
   */
  async createTestCase(data: TestCaseCreateData, context?: any) {
    if (!prisma) throw new Error('Database not available');

    const testCase = await prisma.testCase.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type || 'FUNCTIONAL',
        priority: data.priority || 'MEDIUM',
        status: 'DRAFT',
        projectId: data.projectId,
        collaborationId: data.collaborationId,
        testSuiteId: data.testSuiteId,
        precondition: data.precondition,
        steps: data.steps || [],
        expectedResult: data.expectedResult,
        tags: data.tags || [],
        assigneeId: data.assigneeId || context?.userId,
      },
      include: {
        project: true,
        assignee: true,
        testSuite: true,
      },
    });

    return testCase;
  }

  /**
   * 查询测试用例
   */
  async getTestCases(where: any = {}, options: any = {}) {
    if (!prisma) return [];

    const { skip = 0, take = 50, sortBy = 'createdAt', sortOrder = 'desc' } = options || {};
    const query: any = {
      where,
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
      include: {
        project: true,
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        executions: {
          take: 1,
          orderBy: { executedAt: 'desc' },
        },
      },
    };

    // 支持搜索
    if (where.search) {
      const search = where.search;
      delete query.where.search;
      query.where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    return prisma.testCase.findMany(query);
  }

  /**
   * 根据 ID 获取测试用例
   */
  async getTestCaseById(id: string) {
    if (!prisma) return null;

    return prisma.testCase.findUnique({
      where: { id },
      include: {
        project: true,
        collaboration: true,
        testSuite: true,
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        executions: {
          orderBy: { executedAt: 'desc' },
          include: {
            executedBy: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * 更新测试用例
   */
  async updateTestCase(id: string, data: Partial<TestCase>) {
    if (!prisma) throw new Error('Database not available');

    return prisma.testCase.update({
      where: { id },
      data,
    });
  }

  /**
   * 提交测试用例审核
   */
  async submitForReview(id: string, userId: string) {
    if (!prisma) throw new Error('Database not available');

    return prisma.testCase.update({
      where: { id },
      data: {
        status: 'PENDING_REVIEW',
        reviewedAt: null,
        reviewComment: null,
      },
    });
  }

  /**
   * 审核测试用例
   */
  async reviewTestCase(id: string, data: TestCaseReviewData) {
    if (!prisma) throw new Error('Database not available');

    return prisma.testCase.update({
      where: { id },
      data: {
        status: data.status,
        reviewerId: data.reviewerId,
        reviewedAt: new Date(),
        reviewComment: data.reviewComment,
      },
    });
  }

  /**
   * 执行测试用例
   */
  async executeTestCase(data: TestCaseExecutionData) {
    if (!prisma) throw new Error('Database not available');

    const execution = await prisma.testCaseExecution.create({
      data: {
        testCaseId: data.testCaseId,
        executedById: data.executedById,
        status: data.status,
        result: data.result,
        notes: data.notes,
        duration: data.duration || 0,
      },
      include: {
        executedBy: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    // 更新测试用例的实际结果
    if (data.result) {
      await prisma.testCase.update({
        where: { id: data.testCaseId },
        data: {
          actualResult: data.result,
          status: data.status === 'PASSED' ? 'APPROVED' : data.status === 'FAILED' ? 'REJECTED' : undefined,
        },
      });
    }

    return execution;
  }

  /**
   * 获取测试用例执行历史
   */
  async getTestCaseExecutions(testCaseId: string, options: any = {}) {
    if (!prisma) return [];

    const { skip = 0, take = 20 } = options || {};

    return prisma.testCaseExecution.findMany({
      where: { testCaseId },
      skip,
      take,
      orderBy: { executedAt: 'desc' },
      include: {
        executedBy: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  /**
   * 批量创建测试用例
   */
  async createTestCases(data: TestCaseCreateData[]) {
    if (!prisma) throw new Error('Database not available');

    const testCases = await Promise.all(
      data.map((item) =>
        prisma.testCase.create({
          data: {
            title: item.title,
            description: item.description,
            type: item.type || 'FUNCTIONAL',
            priority: item.priority || 'MEDIUM',
            status: 'DRAFT',
            projectId: item.projectId,
            collaborationId: item.collaborationId,
            testSuiteId: item.testSuiteId,
            precondition: item.precondition,
            steps: item.steps || [],
            expectedResult: item.expectedResult,
            tags: item.tags || [],
            assigneeId: item.assigneeId,
          },
        })
      )
    );

    return testCases;
  }

  /**
   * 删除测试用例
   */
  async deleteTestCase(id: string) {
    if (!prisma) throw new Error('Database not available');

    return prisma.testCase.delete({
      where: { id },
    });
  }

  /**
   * 获取测试用例统计
   */
  async getTestCaseStats(projectId?: string, collaborationId?: string) {
    if (!prisma) return null;

    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (collaborationId) where.collaborationId = collaborationId;

    const total = await prisma.testCase.count({ where });
    const byStatus = await prisma.testCase.groupBy({
      by: ['status'],
      where,
      _count: true,
    });
    const byPriority = await prisma.testCase.groupBy({
      by: ['priority'],
      where,
      _count: true,
    });
    const byType = await prisma.testCase.groupBy({
      by: ['type'],
      where,
      _count: true,
    });

    return {
      total,
      byStatus: Object.fromEntries(byStatus.map((item) => [item.status, item._count])),
      byPriority: Object.fromEntries(byPriority.map((item) => [item.priority, item._count])),
      byType: Object.fromEntries(byType.map((item) => [item.type, item._count])),
    };
  }
}

export default TestCaseService;
