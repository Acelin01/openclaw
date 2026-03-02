/**
 * 需求管理 MCP 工具
 */

import { z } from "zod";
import { executeMCPTool } from "../../../mcp/client";

export const requirementManagementTools = {
  /**
   * 查询需求列表
   */
  requirement_list: {
    description: "查询需求列表。参数：project_id(项目 ID), status(状态筛选), priority(优先级筛选), limit(返回数量)",
    parameters: z.object({
      project_id: z.string().optional().describe("项目 ID"),
      status: z.enum(["draft", "review", "approved", "in_progress", "completed", "rejected"]).optional().describe("状态"),
      priority: z.enum(["low", "medium", "high", "critical"]).optional().describe("优先级"),
      limit: z.number().optional().describe("返回数量"),
      offset: z.number().optional().describe("偏移量")
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'requirement_list', args)
  },

  /**
   * 查询需求详情
   */
  requirement_get: {
    description: "查询需求详情。参数：requirement_id(需求 ID)",
    parameters: z.object({
      requirement_id: z.string().describe("需求 ID")
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'requirement_get', args)
  },

  /**
   * 创建需求
   */
  requirement_create: {
    description: "创建新需求。需要参数：project_id(项目 ID), title(标题), description(描述), priority(优先级), status(状态)",
    parameters: z.object({
      project_id: z.string().describe("项目 ID"),
      title: z.string().describe("需求标题"),
      description: z.string().optional().describe("需求描述"),
      priority: z.enum(["low", "medium", "high", "critical"]).describe("优先级"),
      status: z.enum(["draft", "review", "approved", "in_progress", "completed", "rejected"]).optional().describe("状态"),
      assignee_id: z.string().optional().describe("负责人 ID"),
      estimated_hours: z.number().optional().describe("预估工时"),
      acceptance_criteria: z.array(z.string()).optional().describe("验收标准")
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'requirement_create', args)
  },

  /**
   * 更新需求
   */
  requirement_update: {
    description: "更新需求。参数：requirement_id(需求 ID), title(标题), description(描述), priority(优先级), status(状态)",
    parameters: z.object({
      requirement_id: z.string().describe("需求 ID"),
      title: z.string().optional().describe("标题"),
      description: z.string().optional().describe("描述"),
      priority: z.enum(["low", "medium", "high", "critical"]).optional().describe("优先级"),
      status: z.enum(["draft", "review", "approved", "in_progress", "completed", "rejected"]).optional().describe("状态"),
      assignee_id: z.string().optional().describe("负责人 ID"),
      estimated_hours: z.number().optional().describe("预估工时")
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'requirement_update', args)
  },

  /**
   * 删除需求
   */
  requirement_delete: {
    description: "删除需求。参数：requirement_id(需求 ID)",
    parameters: z.object({
      requirement_id: z.string().describe("需求 ID")
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'requirement_delete', args)
  }
};
