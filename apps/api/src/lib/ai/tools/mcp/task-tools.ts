/**
 * 任务管理 MCP 工具
 */

import { z } from "zod";
import { executeMCPTool } from "../../../mcp/client";

export const taskManagementTools = {
  /**
   * 查询任务列表
   */
  task_list: {
    description: "查询任务列表。参数：project_id(项目 ID), status(状态筛选), priority(优先级筛选), assignee_id(负责人)",
    parameters: z.object({
      project_id: z.string().optional().describe("项目 ID"),
      requirement_id: z.string().optional().describe("需求 ID"),
      status: z.enum(["todo", "in_progress", "done", "blocked"]).optional().describe("状态"),
      priority: z.enum(["low", "medium", "high", "critical"]).optional().describe("优先级"),
      assignee_id: z.string().optional().describe("负责人 ID"),
      limit: z.number().optional().describe("返回数量"),
      offset: z.number().optional().describe("偏移量")
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'task_list', args)
  },

  /**
   * 查询任务详情
   */
  task_get: {
    description: "查询任务详情。参数：task_id(任务 ID)",
    parameters: z.object({
      task_id: z.string().describe("任务 ID")
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'task_get', args)
  },

  /**
   * 创建任务
   */
  task_create: {
    description: "创建新任务。需要参数：project_id(项目 ID), title(标题), description(描述), priority(优先级)",
    parameters: z.object({
      project_id: z.string().describe("项目 ID"),
      requirement_id: z.string().optional().describe("需求 ID"),
      title: z.string().describe("任务标题"),
      description: z.string().optional().describe("任务描述"),
      priority: z.enum(["low", "medium", "high", "critical"]).describe("优先级"),
      status: z.enum(["todo", "in_progress", "done", "blocked"]).optional().describe("状态"),
      assignee_id: z.string().optional().describe("负责人 ID"),
      due_date: z.string().optional().describe("截止日期"),
      estimated_hours: z.number().optional().describe("预估工时"),
      dependencies: z.array(z.string()).optional().describe("依赖任务")
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'task_create', args)
  },

  /**
   * 更新任务
   */
  task_update: {
    description: "更新任务。参数：task_id(任务 ID), title(标题), description(描述), status(状态), priority(优先级)",
    parameters: z.object({
      task_id: z.string().describe("任务 ID"),
      title: z.string().optional().describe("标题"),
      description: z.string().optional().describe("描述"),
      status: z.enum(["todo", "in_progress", "done", "blocked"]).optional().describe("状态"),
      priority: z.enum(["low", "medium", "high", "critical"]).optional().describe("优先级"),
      assignee_id: z.string().optional().describe("负责人 ID"),
      due_date: z.string().optional().describe("截止日期"),
      estimated_hours: z.number().optional().describe("预估工时"),
      progress: z.number().optional().describe("进度百分比")
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'task_update', args)
  },

  /**
   * 删除任务
   */
  task_delete: {
    description: "删除任务。参数：task_id(任务 ID)",
    parameters: z.object({
      task_id: z.string().describe("任务 ID")
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'task_delete', args)
  },

  /**
   * 更新任务状态
   */
  task_update_status: {
    description: "更新任务状态。参数：task_id(任务 ID), status(状态)",
    parameters: z.object({
      task_id: z.string().describe("任务 ID"),
      status: z.enum(["todo", "in_progress", "done", "blocked"]).describe("状态"),
      progress: z.number().optional().describe("进度百分比")
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'task_update_status', args)
  }
};
