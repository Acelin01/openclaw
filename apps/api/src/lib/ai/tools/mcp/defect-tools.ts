/**
 * 缺陷管理 MCP 工具
 */

import { z } from "zod";
import { executeMCPTool } from "../../../mcp/client";

export const defectManagementTools = {
  /**
   * 查询缺陷列表
   */
  defect_list: {
    description: "查询缺陷列表。参数：project_id(项目 ID), status(状态筛选), severity(严重程度), priority(优先级)",
    parameters: z.object({
      project_id: z.string().optional().describe("项目 ID"),
      iteration_id: z.string().optional().describe("迭代 ID"),
      status: z.enum(["open", "confirmed", "in_progress", "resolved", "closed", "rejected"]).optional().describe("状态"),
      severity: z.enum(["trivial", "minor", "major", "critical", "blocker"]).optional().describe("严重程度"),
      priority: z.enum(["low", "medium", "high"]).optional().describe("优先级"),
      assignee_id: z.string().optional().describe("负责人 ID"),
      limit: z.number().optional().describe("返回数量"),
      offset: z.number().optional().describe("偏移量")
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'defect_list', args)
  },

  /**
   * 查询缺陷详情
   */
  defect_get: {
    description: "查询缺陷详情。参数：defect_id(缺陷 ID)",
    parameters: z.object({
      defect_id: z.string().describe("缺陷 ID")
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'defect_get', args)
  },

  /**
   * 创建缺陷
   */
  defect_create: {
    description: "创建新缺陷。需要参数：project_id(项目 ID), title(标题), description(描述), severity(严重程度)",
    parameters: z.object({
      project_id: z.string().describe("项目 ID"),
      iteration_id: z.string().optional().describe("迭代 ID"),
      title: z.string().describe("缺陷标题"),
      description: z.string().describe("缺陷描述"),
      severity: z.enum(["trivial", "minor", "major", "critical", "blocker"]).describe("严重程度"),
      priority: z.enum(["low", "medium", "high"]).optional().describe("优先级"),
      status: z.enum(["open", "confirmed", "in_progress", "resolved", "closed", "rejected"]).optional().describe("状态"),
      reporter_id: z.string().optional().describe("报告人 ID"),
      assignee_id: z.string().optional().describe("负责人 ID"),
      steps_to_reproduce: z.array(z.string()).optional().describe("重现步骤"),
      expected_result: z.string().optional().describe("预期结果"),
      actual_result: z.string().optional().describe("实际结果")
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'defect_create', args)
  },

  /**
   * 更新缺陷
   */
  defect_update: {
    description: "更新缺陷。参数：defect_id(缺陷 ID), title(标题), description(描述), status(状态), severity(严重程度)",
    parameters: z.object({
      defect_id: z.string().describe("缺陷 ID"),
      title: z.string().optional().describe("标题"),
      description: z.string().optional().describe("描述"),
      status: z.enum(["open", "confirmed", "in_progress", "resolved", "closed", "rejected"]).optional().describe("状态"),
      severity: z.enum(["trivial", "minor", "major", "critical", "blocker"]).optional().describe("严重程度"),
      priority: z.enum(["low", "medium", "high"]).optional().describe("优先级"),
      assignee_id: z.string().optional().describe("负责人 ID"),
      resolution: z.string().optional().describe("解决方案"),
      fixed_in_version: z.string().optional().describe("修复版本")
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'defect_update', args)
  },

  /**
   * 删除缺陷
   */
  defect_delete: {
    description: "删除缺陷。参数：defect_id(缺陷 ID)",
    parameters: z.object({
      defect_id: z.string().describe("缺陷 ID")
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'defect_delete', args)
  }
};
