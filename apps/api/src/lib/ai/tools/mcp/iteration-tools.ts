/**
 * 迭代管理 MCP 工具
 * 支持迭代创建、查询、规划、概览等功能
 */

import { z } from "zod";
import { executeMCPTool } from "../../../mcp/client";

export const iterationManagementTools = {
  // ==================== 迭代创建 ====================
  
  iteration_create: {
    description: "创建新迭代。需要参数：title(迭代标题), project_id(项目 ID), start_date(开始日期), end_date(结束日期)",
    parameters: z.object({
      title: z.string().describe("迭代标题"),
      project_id: z.string().describe("项目 ID"),
      start_date: z.string().describe("开始日期 (YYYY-MM-DD)"),
      end_date: z.string().describe("结束日期 (YYYY-MM-DD)"),
      description: z.string().optional().describe("迭代描述"),
      goal: z.string().optional().describe("迭代目标"),
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'iteration_create', args),
  },

  // ==================== 迭代查询 ====================

  iteration_query: {
    description: "查询迭代。参数可选：project_id(项目 ID), status(状态), search(搜索关键词)",
    parameters: z.object({
      project_id: z.string().optional().describe("项目 ID"),
      status: z.enum(["planning", "active", "completed", "archived"]).optional().describe("状态"),
      search: z.string().optional().describe("搜索关键词"),
      limit: z.number().optional().describe("返回数量限制"),
      offset: z.number().optional().describe("偏移量"),
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'iteration_query', args),
  },

  iteration_get: {
    description: "获取迭代详情。需要参数：iteration_id(迭代 ID)",
    parameters: z.object({
      iteration_id: z.string().describe("迭代 ID"),
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'iteration_get', args),
  },

  iteration_list: {
    description: "获取迭代列表。参数可选：project_id(项目 ID), include_stats(是否包含统计)",
    parameters: z.object({
      project_id: z.string().describe("项目 ID"),
      include_stats: z.boolean().optional().describe("是否包含统计信息"),
      limit: z.number().optional().describe("返回数量限制"),
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'iteration_list', args),
  },

  // ==================== 迭代概览/统计 ====================

  iteration_overview: {
    description: "获取迭代概览（统计分析）。需要参数：iteration_id(迭代 ID)",
    parameters: z.object({
      iteration_id: z.string().describe("迭代 ID"),
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'iteration_overview', args),
  },

  iteration_stats: {
    description: "获取迭代统计数据。需要参数：iteration_id(迭代 ID)",
    parameters: z.object({
      iteration_id: z.string().describe("迭代 ID"),
      include_trend: z.boolean().optional().describe("是否包含趋势数据"),
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'iteration_stats', args),
  },

  // ==================== 迭代工作项 ====================

  iteration_workitems: {
    description: "查询迭代工作项（需求、任务、缺陷）。需要参数：iteration_id(迭代 ID), type(类型：requirement/task/defect/all)",
    parameters: z.object({
      iteration_id: z.string().describe("迭代 ID"),
      type: z.enum(["requirement", "task", "defect", "all"]).optional().describe("工作项类型"),
      status: z.string().optional().describe("状态筛选"),
      assignee_id: z.string().optional().describe("负责人 ID"),
      limit: z.number().optional().describe("返回数量限制"),
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'iteration_workitems', args),
  },

  iteration_workitem_stats: {
    description: "获取迭代工作项统计。需要参数：iteration_id(迭代 ID)",
    parameters: z.object({
      iteration_id: z.string().describe("迭代 ID"),
      group_by: z.enum(["type", "status", "priority", "assignee"]).optional().describe("分组方式"),
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'iteration_workitem_stats', args),
  },

  // ==================== 迭代规划 ====================

  iteration_plan: {
    description: "迭代规划（批量关联工作项）。需要参数：iteration_id(迭代 ID), requirement_ids(需求 ID 数组), task_ids(任务 ID 数组), defect_ids(缺陷 ID 数组)",
    parameters: z.object({
      iteration_id: z.string().describe("迭代 ID"),
      requirement_ids: z.array(z.string()).optional().describe("需求 ID 数组"),
      task_ids: z.array(z.string()).optional().describe("任务 ID 数组"),
      defect_ids: z.array(z.string()).optional().describe("缺陷 ID 数组"),
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'iteration_plan', args),
  },

  // ==================== 迭代更新 ====================

  iteration_update: {
    description: "更新迭代。需要参数：iteration_id(迭代 ID), 其他可选更新字段",
    parameters: z.object({
      iteration_id: z.string().describe("迭代 ID"),
      title: z.string().optional().describe("标题"),
      description: z.string().optional().describe("描述"),
      goal: z.string().optional().describe("目标"),
      start_date: z.string().optional().describe("开始日期"),
      end_date: z.string().optional().describe("结束日期"),
      status: z.enum(["planning", "active", "completed", "archived"]).optional().describe("状态"),
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'iteration_update', args),
  },

  iteration_delete: {
    description: "删除迭代。需要参数：iteration_id(迭代 ID)",
    parameters: z.object({
      iteration_id: z.string().describe("迭代 ID"),
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'iteration_delete', args),
  },
};
