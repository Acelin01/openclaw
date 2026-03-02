/**
 * 里程碑管理 MCP 工具（带审核流程）
 * 
 * 流程说明:
 * 1. 创建里程碑时，先创建 milestone 类型的文档，状态为 PENDING
 * 2. 审核人审核文档（APPROVED/REJECTED）
 * 3. 审核通过后，直接调用 DatabaseService 创建里程碑记录
 */

import { z } from "zod";
import { executeMCPTool } from "../../../mcp/client";

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
        title: args.title,
        content: JSON.stringify({
          projectId: args.project_id,
          title: args.title,
          description: args.description,
          assigneeId: args.assignee_id,
          dueDate: args.due_date,
          status: args.status || 'notstarted'
        }),
        kind: 'milestone' as const,
        projectId: args.project_id,
        status: 'PENDING' as const
      };

      console.log('[milestone_create] Creating milestone document:', documentData);
      
      // 创建文档
      const documentResult = await executeMCPTool('uxin-mcp', 'document_create', documentData);
      
      if (!documentResult.success) {
        throw new Error(`创建里程碑文档失败：${documentResult.error}`);
      }

      return {
        success: true,
        message: '里程碑创建申请已提交，等待审核',
        data: {
          documentId: documentResult.data?.id,
          status: 'PENDING_REVIEW',
          milestone: documentResult.data
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
   * 更新里程碑
   */
  milestone_update: {
    description: "更新里程碑信息。参数：milestone_id(里程碑 ID), title(标题), description(描述), assignee_id(负责人), due_date(计划完成时间), status(状态)",
    parameters: z.object({
      milestone_id: z.string().describe("里程碑 ID"),
      title: z.string().optional().describe("里程碑标题"),
      description: z.string().optional().describe("里程碑描述"),
      assignee_id: z.string().optional().describe("负责人 ID"),
      due_date: z.string().optional().describe("计划完成时间 (YYYY-MM-DD)"),
      status: z.enum(["notstarted", "progress", "completed", "canceled"]).optional().describe("状态")
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'milestone_update', args)
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
