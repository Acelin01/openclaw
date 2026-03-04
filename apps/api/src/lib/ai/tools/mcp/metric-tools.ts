/**
 * 项目度量 MCP 工具
 */

import { z } from "zod";
import { executeMCPTool } from "../../../mcp/client";

export const metricManagementTools = {
  /**
   * 查询项目度量数据
   */
  project_metric_query: {
    description: "查询项目度量数据。参数：project_id(项目 ID), metric_type(度量类型), period(周期)",
    parameters: z.object({
      project_id: z.string().describe("项目 ID"),
      metric_type: z.enum(["total_tasks", "completed_tasks", "total_defects", "open_defects", "total_requirements", "completed_requirements"]).optional().describe("度量类型"),
      period: z.enum(["daily", "weekly", "monthly"]).optional().describe("统计周期"),
      start_date: z.string().optional().describe("开始日期"),
      end_date: z.string().optional().describe("结束日期")
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'project_metric_query', args)
  },

  /**
   * 查询工时统计
   */
  workhour_query: {
    description: "查询工时统计。参数：project_id(项目 ID), user_id(用户 ID), start_date(开始日期), end_date(结束日期)",
    parameters: z.object({
      project_id: z.string().optional().describe("项目 ID"),
      user_id: z.string().optional().describe("用户 ID"),
      start_date: z.string().optional().describe("开始日期"),
      end_date: z.string().optional().describe("结束日期"),
      group_by: z.enum(["user", "task", "date"]).optional().describe("分组方式")
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'workhour_query', args)
  }
};
