import { tool } from "ai";
import { z } from "zod";
import { executeMCPTool } from "../../../mcp/client";

/**
 * 里程碑管理 MCP 工具
 */
export const milestoneManagementTools = {
  /**
   * 查询里程碑列表
   */
  milestone_list: {
    description: "查询里程碑列表。参数：project_id(项目 ID), status(状态筛选：notstarted/progress/completed/canceled), assignee_id(负责人筛选)",
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
   * 创建里程碑
   */
  milestone_create: {
    description: "创建新里程碑。需要参数：project_id(项目 ID), title(标题), description(描述), assignee_id(负责人 ID), due_date(计划完成时间)",
    parameters: z.object({
      project_id: z.string().describe("项目 ID"),
      title: z.string().describe("里程碑标题"),
      description: z.string().optional().describe("里程碑描述"),
      assignee_id: z.string().describe("负责人 ID"),
      due_date: z.string().describe("计划完成时间 (YYYY-MM-DD)"),
      status: z.enum(["notstarted", "progress", "completed", "canceled"]).optional().describe("状态")
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'milestone_create', args)
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
  }
};
