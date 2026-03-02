/**
 * 里程碑管理 MCP 工具（带审核流程）
 * 
 * 流程说明:
 * 1. 创建里程碑时，先创建 milestone 类型的文档，状态为 PENDING
 * 2. 审核人审核文档（APPROVED/REJECTED）
 * 3. 审核通过后，直接调用 DatabaseService 创建里程碑记录
 * 
 * 更新流程:
 * 1. 更新里程碑时，先创建 milestone_update 类型的文档，状态为 PENDING
 * 2. 文档包含变更对比
 * 3. 审核人审核文档（APPROVED/REJECTED）
 * 4. 审核通过后，直接调用 DatabaseService 更新里程碑记录
 */

import { z } from "zod";
import { executeMCPTool } from "../../../mcp/client";

/**
 * 比较变更并生成变更列表
 */
function getChanges(original: any, updated: any) {
  const changes: any[] = [];
  
  const fields = ['title', 'description', 'assigneeId', 'dueDate', 'status'];
  
  for (const field of fields) {
    if (original[field] !== updated[field]) {
      changes.push({
        field,
        oldValue: original[field],
        newValue: updated[field]
      });
    }
  }
  
  return changes;
}

export const milestoneManagementTools = {
  /**
   * 创建里程碑（需要审核）
   * 
   * 流程:
   * 1. 创建 milestone 类型文档，状态为 PENDING
   * 2. 文档包含里程碑的所有信息（标题、描述、负责人、计划时间等）
   * 3. 等待审核人审核
   * 4. 审核通过后自动创建数据库记录
   */
  milestone_create: {
    description: "创建新里程碑（需要审核）。需要参数：project_id(项目 ID), title(标题), description(描述), assignee_id(负责人 ID), due_date(计划完成时间)",
    parameters: z.object({
      project_id: z.string().describe("项目 ID"),
      title: z.string().describe("里程碑标题"),
      description: z.string().optional().describe("里程碑描述"),
      assignee_id: z.string().describe("负责人 ID"),
      due_date: z.string().describe("计划完成时间 (YYYY-MM-DD)"),
      status: z.enum(["notstarted", "progress", "completed", "canceled"]).optional().describe("状态")
    }),
    execute: async (args: any) => {
      // 第一步：创建 milestone 类型文档
      const documentData = {
        title: args.title || '未命名里程碑',
        content: JSON.stringify({
          projectId: args.project_id,
          title: args.title,
          description: args.description,
          assigneeId: args.assignee_id,
          dueDate: args.due_date,
          status: args.status || 'notstarted'
        }),
        kind: 'milestone',
        projectId: args.project_id,
        userId: args.user_id || '19e0a8e1-cad9-420d-9d10-5cc5be8fb2f0',
        status: 'PENDING'
      };

      console.log('[milestone_create] Creating milestone document:', JSON.stringify(documentData, null, 2));
      
      try {
        // 创建文档
        const documentResult = await executeMCPTool('uxin-mcp', 'document_create', documentData);
        console.log('[milestone_create] Document result:', JSON.stringify(documentResult, null, 2));
        
        // 检查返回结果
        if (!documentResult) {
          throw new Error('创建文档返回空结果');
        }
        
        // 处理不同的返回格式
        const docId = documentResult.data?.id || documentResult.id || documentResult.documentId;
        const isSuccess = documentResult.success !== false && docId;
        
        if (!isSuccess) {
          const errorMsg = documentResult.error || documentResult.message || '未知错误';
          throw new Error(`创建里程碑文档失败：${errorMsg}`);
        }

        console.log('[milestone_create] Document created successfully, ID:', docId);
        
        return {
          success: true,
          message: '里程碑创建申请已提交，等待审核',
          data: {
            documentId: docId,
            status: 'PENDING_REVIEW',
            milestone: documentResult.data || documentResult
          }
        };
      } catch (error: any) {
        console.error('[milestone_create] Error:', error.message);
        console.error('[milestone_create] Stack:', error.stack);
        throw error;
      }
      };
    }
  },

  /**
   * 审核里程碑
   * 
   * 流程:
   * 1. 审核 milestone 类型文档
   * 2. 如果审核通过 (APPROVED)，直接调用 DatabaseService 创建里程碑记录
   * 3. 如果审核拒绝 (REJECTED)，文档状态更新为 REJECTED
   */
  milestone_review: {
    description: "审核里程碑。需要参数：document_id(文档 ID), status(审核状态：APPROVED/REJECTED), comment(审核意见), reviewer_id(审核人 ID)",
    parameters: z.object({
      document_id: z.string().describe("文档 ID"),
      status: z.enum(["APPROVED", "REJECTED"]).describe("审核状态"),
      comment: z.string().optional().describe("审核意见"),
      reviewer_id: z.string().describe("审核人 ID")
    }),
    execute: async (args: any) => {
      console.log('[milestone_review] Reviewing milestone document:', args);

      // 第一步：审核文档
      const reviewResult = await executeMCPTool('uxin-mcp', 'document_review', {
        document_id: args.document_id,
        status: args.status,
        comment: args.comment,
        reviewer_id: args.reviewer_id
      });

      if (!reviewResult.success) {
        throw new Error(`审核失败：${reviewResult.error}`);
      }

      // 第二步：如果审核通过，直接调用 DatabaseService 创建数据库记录
      if (args.status === 'APPROVED') {
        // 获取文档详情
        const docDetail = await executeMCPTool('uxin-mcp', 'document_get', {
          document_id: args.document_id
        });

        if (!docDetail.success || !docDetail.data?.content) {
          throw new Error('获取文档详情失败');
        }

        // 解析文档内容
        const milestoneData = JSON.parse(docDetail.data.content);

        // 直接调用 DatabaseService 创建里程碑（内部 API 操作）
        const { DatabaseService } = await import('../../../db/service.js');
        const db = DatabaseService.getInstance();
        
        if (!db.isAvailable()) {
          throw new Error('数据库连接不可用');
        }

        try {
          const milestone = await db.createMilestone({
            project_id: milestoneData.projectId,
            title: milestoneData.title,
            description: milestoneData.description,
            assignee_id: milestoneData.assigneeId,
            due_date: milestoneData.dueDate,
            status: milestoneData.status || 'notstarted'
          });

          return {
            success: true,
            message: '里程碑审核通过并已创建',
            data: {
              documentId: args.document_id,
              milestoneId: milestone.id,
              milestone: milestone
            }
          };
        } catch (error: any) {
          throw new Error(`创建数据库记录失败：${error.message}`);
        }
      }

      return {
        success: true,
        message: `里程碑审核${args.status === 'APPROVED' ? '通过' : '拒绝'}`,
        data: {
          documentId: args.document_id,
          status: args.status
        }
      };
    }
  },

  /**
   * 查询里程碑列表
   */
  milestone_list: {
    description: "查询里程碑列表。参数：project_id(项目 ID), status(状态筛选), assignee_id(负责人筛选)",
    parameters: z.object({
      project_id: z.string().optional().describe("项目 ID"),
      status: z.enum(["notstarted", "progress", "completed", "canceled"]).optional().describe("状态筛选"),
      assignee_id: z.string().optional().describe("负责人 ID"),
      limit: z.number().optional().describe("返回数量限制"),
      offset: z.number().optional().describe("偏移量")
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'milestone_list', args)
  },

  /**
   * 查询里程碑详情
   */
  milestone_get: {
    description: "查询里程碑详情。参数：milestone_id(里程碑 ID)",
    parameters: z.object({
      milestone_id: z.string().describe("里程碑 ID")
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'milestone_get', args)
  },

  /**
   * 更新里程碑（需要审核）
   * 
   * 流程:
   * 1. 创建 milestone_update 类型文档，状态为 PENDING
   * 2. 文档包含更新的所有信息
   * 3. 等待审核人审核
   * 4. 审核通过后自动更新数据库记录
   */
  milestone_update: {
    description: "更新里程碑信息（需要审核）。需要参数：milestone_id(里程碑 ID), title(标题), description(描述), assignee_id(负责人), due_date(计划完成时间), status(状态), reviewer_id(审核人 ID)",
    parameters: z.object({
      milestone_id: z.string().describe("里程碑 ID"),
      title: z.string().optional().describe("里程碑标题"),
      description: z.string().optional().describe("里程碑描述"),
      assignee_id: z.string().optional().describe("负责人 ID"),
      due_date: z.string().optional().describe("计划完成时间 (YYYY-MM-DD)"),
      status: z.enum(["notstarted", "progress", "completed", "canceled"]).optional().describe("状态"),
      reviewer_id: z.string().optional().describe("审核人 ID")
    }),
    execute: async (args: any) => {
      // 第一步：获取原里程碑信息
      const { DatabaseService } = await import('../../../db/service.js');
      const db = DatabaseService.getInstance();
      
      if (!db.isAvailable()) {
        throw new Error('数据库连接不可用');
      }

      const originalMilestone = await db.getMilestoneById(args.milestone_id);
      
      if (!originalMilestone) {
        throw new Error(`里程碑不存在：${args.milestone_id}`);
      }

      // 第二步：创建 milestone_update 类型文档
      const updateData = {
        title: args.title ?? originalMilestone.title,
        description: args.description ?? originalMilestone.description,
        assigneeId: args.assignee_id ?? originalMilestone.assigneeId,
        dueDate: args.due_date ?? originalMilestone.dueDate,
        status: args.status ?? originalMilestone.status
      };

      const documentData = {
        title: `更新里程碑：${originalMilestone.title}`,
        content: JSON.stringify({
          milestoneId: args.milestone_id,
          originalData: {
            title: originalMilestone.title,
            description: originalMilestone.description,
            assigneeId: originalMilestone.assigneeId,
            dueDate: originalMilestone.dueDate,
            status: originalMilestone.status
          },
          updateData: updateData,
          changes: getChanges(originalMilestone, updateData)
        }),
        kind: 'milestone_update' as const,
        projectId: originalMilestone.projectId,
        status: 'PENDING' as const
      };

      console.log('[milestone_update] Creating update document:', documentData);
      
      // 创建文档
      const documentResult = await executeMCPTool('uxin-mcp', 'document_create', documentData);
      
      if (!documentResult.success) {
        throw new Error(`创建更新文档失败：${documentResult.error}`);
      }

      return {
        success: true,
        message: '里程碑更新申请已提交，等待审核',
        data: {
          documentId: documentResult.data?.id,
          status: 'PENDING_REVIEW',
          milestoneId: args.milestone_id
        }
      };
    }
  },

  /**
   * 审核里程碑更新
   * 
   * 流程:
   * 1. 审核 milestone_update 类型文档
   * 2. 如果审核通过 (APPROVED)，更新数据库记录
   * 3. 如果审核拒绝 (REJECTED)，文档状态更新为 REJECTED
   */
  milestone_update_review: {
    description: "审核里程碑更新。需要参数：document_id(文档 ID), status(审核状态：APPROVED/REJECTED), comment(审核意见), reviewer_id(审核人 ID)",
    parameters: z.object({
      document_id: z.string().describe("文档 ID"),
      status: z.enum(["APPROVED", "REJECTED"]).describe("审核状态"),
      comment: z.string().optional().describe("审核意见"),
      reviewer_id: z.string().describe("审核人 ID")
    }),
    execute: async (args: any) => {
      console.log('[milestone_update_review] Reviewing milestone update document:', args);

      // 第一步：审核文档
      const reviewResult = await executeMCPTool('uxin-mcp', 'document_review', {
        document_id: args.document_id,
        status: args.status,
        comment: args.comment,
        reviewer_id: args.reviewer_id
      });

      if (!reviewResult.success) {
        throw new Error(`审核失败：${reviewResult.error}`);
      }

      // 第二步：如果审核通过，更新数据库记录
      if (args.status === 'APPROVED') {
        // 获取文档详情
        const docDetail = await executeMCPTool('uxin-mcp', 'document_get', {
          document_id: args.document_id
        });

        if (!docDetail.success || !docDetail.data?.content) {
          throw new Error('获取文档详情失败');
        }

        // 解析文档内容
        const updateData = JSON.parse(docDetail.data.content);

        // 直接调用 DatabaseService 更新里程碑（内部 API 操作）
        const { DatabaseService } = await import('../../../db/service.js');
        const db = DatabaseService.getInstance();
        
        if (!db.isAvailable()) {
          throw new Error('数据库连接不可用');
        }

        try {
          const milestone = await db.updateMilestone(updateData.milestoneId, updateData.updateData);

          return {
            success: true,
            message: '里程碑更新审核通过并已更新',
            data: {
              documentId: args.document_id,
              milestoneId: updateData.milestoneId,
              milestone: milestone,
              changes: updateData.changes
            }
          };
        } catch (error: any) {
          throw new Error(`更新数据库记录失败：${error.message}`);
        }
      }

      return {
        success: true,
        message: `里程碑更新审核${args.status === 'APPROVED' ? '通过' : '拒绝'}`,
        data: {
          documentId: args.document_id,
          status: args.status
        }
      };
    }
  },

  /**
   * 查询待审核的里程碑更新
   */
  milestone_update_pending_review: {
    description: "查询待审核的里程碑更新列表。参数：project_id(项目 ID), reviewer_id(审核人 ID)",
    parameters: z.object({
      project_id: z.string().optional().describe("项目 ID"),
      reviewer_id: z.string().optional().describe("审核人 ID"),
      limit: z.number().optional().describe("返回数量限制")
    }),
    execute: async (args: any) => {
      // 查询状态为 PENDING 的 milestone_update 类型文档
      return executeMCPTool('uxin-mcp', 'document_query', {
        kind: 'milestone_update',
        status: 'PENDING',
        project_id: args.project_id,
        limit: args.limit || 20
      });
    }
  },

  /**
   * 删除里程碑
   */
  milestone_delete: {
    description: "删除里程碑。参数：milestone_id(里程碑 ID)",
    parameters: z.object({
      milestone_id: z.string().describe("里程碑 ID")
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'milestone_delete', args)
  },

  /**
   * 监控里程碑状态
   */
  milestone_monitor: {
    description: "监控项目里程碑状态。获取项目所有里程碑的当前进展、截止日期及风险状态。参数：project_id(项目 ID)",
    parameters: z.object({
      project_id: z.string().describe("项目 ID")
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'milestone_monitor', args)
  },

  /**
   * 查询待审核的里程碑
   */
  milestone_pending_review: {
    description: "查询待审核的里程碑列表。参数：project_id(项目 ID), reviewer_id(审核人 ID)",
    parameters: z.object({
      project_id: z.string().optional().describe("项目 ID"),
      reviewer_id: z.string().optional().describe("审核人 ID"),
      limit: z.number().optional().describe("返回数量限制")
    }),
    execute: async (args: any) => {
      // 查询状态为 PENDING 的 milestone 类型文档
      return executeMCPTool('uxin-mcp', 'document_query', {
        kind: 'milestone',
        status: 'PENDING',
        project_id: args.project_id,
        limit: args.limit || 20
      });
    }
  }
};
