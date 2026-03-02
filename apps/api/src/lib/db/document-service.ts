/**
 * 文档管理服务
 * 提供文档的创建、审核、查询等功能
 */

import { prisma } from './index.js';
import type { Document, DocumentStatus, Document_kind } from '@prisma/client';
import { TestCaseService } from './test-case-service.js';

interface DocumentCreateData {
  title: string;
  content: string;
  kind: Document_kind;
  userId: string;
  projectId?: string;
  chatId?: string;
  agentId?: string;
  description?: string;
}

interface DocumentReviewData {
  documentId: string;
  status: 'APPROVED' | 'REJECTED';
  reviewerId: string;
  comment?: string;
}

export class DocumentService {
  private testCaseService: TestCaseService;

  constructor() {
    this.testCaseService = new TestCaseService();
  }

  /**
   * 创建文档（状态：待审核）
   */
  async createDocument(data: DocumentCreateData) {
    if (!prisma) throw new Error('Database not available');

    const document = await prisma.document.create({
      data: {
        title: data.title,
        content: data.content,
        kind: data.kind,
        userId: data.userId || 'admin-user-id', // 默认用户 ID
        projectId: data.projectId,
        chatId: data.chatId,
        agentId: data.agentId,
        status: 'PENDING', // 默认为待审核状态
        createdAt: new Date(),
      },
      include: {
        user: true,
        project: true,
      },
    });

    return document;
  }

  /**
   * 查询文档
   */
  async getDocuments(where: any = {}, options: any = {}) {
    if (!prisma) return [];

    const { skip = 0, take = 50, sortBy = 'createdAt', sortOrder = 'desc' } = options || {};
    const query: any = {
      where,
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        project: true,
      },
    };

    // 支持按类型筛选
    if (where.kind) {
      query.where.kind = where.kind;
    }

    // 支持按状态筛选
    if (where.status) {
      query.where.status = where.status;
    }

    // 支持搜索
    if (where.search) {
      const search = where.search;
      delete query.where.search;
      query.where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    return prisma.document.findMany(query);
  }

  /**
   * 根据 ID 获取文档
   */
  async getDocumentById(id: string) {
    if (!prisma) return null;

    return prisma.document.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        project: true,
      },
    });
  }

  /**
   * 审核文档
   * 审核通过后创建对应的数据表记录
   */
  async reviewDocument(data: DocumentReviewData) {
    if (!prisma) throw new Error('Database not available');

    const document = await prisma.document.findUnique({
      where: { id: data.documentId },
    });

    if (!document) {
      throw new Error('Document not found');
    }

    // 更新文档状态
    const updatedDoc = await prisma.document.update({
      where: { id: data.documentId },
      data: {
        status: data.status,
      },
    });

    // 如果审核通过，创建对应的数据表记录
    if (data.status === 'APPROVED') {
      await this._createDataFromDocument(document);
    }

    return updatedDoc;
  }

  /**
   * 根据文档创建对应的数据表记录
   */
  private async _createDataFromDocument(document: Document) {
    try {
      const content = JSON.parse(document.content || '{}');

      switch (document.kind) {
        case 'testcase':
          // 创建测试用例
          await this.testCaseService.createTestCase(
            {
              title: document.title,
              description: content.description,
              type: content.type,
              priority: content.priority,
              projectId: document.projectId,
              precondition: content.precondition,
              steps: content.steps,
              expectedResult: content.expectedResult,
              tags: content.tags,
            },
            { userId: document.userId }
          );
          break;

        case 'requirement':
          // 创建项目需求（如果需求服务存在）
          // await this.requirementService.createRequirement({...});
          break;

        // 可以添加更多类型的支持
        default:
          console.log(`Unknown document kind: ${document.kind}`);
      }
    } catch (error) {
      console.error('Failed to create data from document:', error);
      throw error;
    }
  }

  /**
   * 获取文档统计
   */
  async getDocumentStats(projectId?: string, userId?: string) {
    if (!prisma) return null;

    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (userId) where.userId = userId;

    const total = await prisma.document.count({ where });
    const byStatus = await prisma.document.groupBy({
      by: ['status'],
      where,
      _count: true,
    });
    const byKind = await prisma.document.groupBy({
      by: ['kind'],
      where,
      _count: true,
    });

    return {
      total,
      byStatus: Object.fromEntries(byStatus.map((item) => [item.status, item._count])),
      byKind: Object.fromEntries(byKind.map((item) => [item.kind, item._count])),
    };
  }

  /**
   * 删除文档
   */
  async deleteDocument(id: string) {
    if (!prisma) throw new Error('Database not available');

    return prisma.document.delete({
      where: { id },
    });
  }

  /**
   * 更新文档
   */
  async updateDocument(id: string, data: Partial<Document>) {
    if (!prisma) throw new Error('Database not available');

    return prisma.document.update({
      where: { id },
      data,
    });
  }
}

export default DocumentService;
