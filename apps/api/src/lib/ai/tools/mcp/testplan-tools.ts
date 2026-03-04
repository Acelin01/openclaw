/**
 * 测试计划 MCP 工具
 */

import { z } from "zod";
import { executeMCPTool } from "../../../mcp/client";

export const testPlanManagementTools = {
  /**
   * 查询测试计划列表
   */
  test_plan_list: {
    description: "查询测试计划列表。参数：project_id(项目 ID), status(状态筛选)",
    parameters: z.object({
      project_id: z.string().optional().describe("项目 ID"),
      status: z.enum(["DRAFT", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional().describe("状态"),
      limit: z.number().optional().describe("返回数量"),
      offset: z.number().optional().describe("偏移量")
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'test_plan_list', args)
  },

  /**
   * 查询测试计划概览
   */
  test_plan_overview: {
    description: "查询测试计划概览。参数：test_plan_id(测试计划 ID)",
    parameters: z.object({
      test_plan_id: z.string().describe("测试计划 ID")
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'test_plan_overview', args)
  },

  /**
   * 查询测试计划用例
   */
  test_plan_cases: {
    description: "查询测试计划中的用例。参数：test_plan_id(测试计划 ID)",
    parameters: z.object({
      test_plan_id: z.string().describe("测试计划 ID")
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'test_plan_cases', args)
  }
};
