/**
 * 测试用例管理 MCP 工具
 */

import { tool } from "ai";
import { z } from "zod";
import { executeMCPTool } from "../../../mcp/client";

export const testCaseManagementTools = {
  // ==================== 测试用例创建 ====================
  
  test_case_create: {
    description: "创建测试用例。需要参数：title(标题), description(描述), type(类型), priority(优先级), projectId(项目 ID), steps(测试步骤), expectedResult(预期结果)",
    parameters: z.object({
      title: z.string().describe("测试用例标题"),
      description: z.string().optional().describe("测试用例描述"),
      type: z.enum(["FUNCTIONAL", "INTEGRATION", "PERFORMANCE", "SECURITY", "REGRESSION", "ACCEPTANCE"]).optional().describe("测试类型"),
      priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional().describe("优先级"),
      projectId: z.string().optional().describe("项目 ID"),
      collaborationId: z.string().optional().describe("协作 ID"),
      precondition: z.string().optional().describe("前置条件"),
      steps: z.array(z.object({
        step: z.string(),
        action: z.string(),
        expected: z.string(),
      })).optional().describe("测试步骤"),
      expectedResult: z.string().optional().describe("预期结果"),
      tags: z.array(z.string()).optional().describe("标签"),
      assigneeId: z.string().optional().describe("指派人 ID"),
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'test_case_create', args),
  },

  test_case_submit_review: {
    description: "提交测试用例审核。需要参数：test_case_id(测试用例 ID)",
    parameters: z.object({
      test_case_id: z.string().describe("测试用例 ID"),
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'test_case_submit_review', args),
  },

  test_case_review: {
    description: "审核测试用例。需要参数：test_case_id(测试用例 ID), status(审核状态：APPROVED/REJECTED), reviewComment(审核意见)",
    parameters: z.object({
      test_case_id: z.string().describe("测试用例 ID"),
      status: z.enum(["APPROVED", "REJECTED"]).describe("审核状态"),
      reviewComment: z.string().optional().describe("审核意见"),
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'test_case_review', args),
  },

  test_case_execute: {
    description: "执行测试用例。需要参数：test_case_id(测试用例 ID), status(执行状态), result(实际结果), notes(备注)",
    parameters: z.object({
      test_case_id: z.string().describe("测试用例 ID"),
      status: z.enum(["PENDING", "PASSED", "FAILED", "BLOCKED", "SKIPPED"]).describe("执行状态"),
      result: z.string().optional().describe("实际结果"),
      notes: z.string().optional().describe("备注"),
      duration: z.number().optional().describe("执行时长 (分钟)"),
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'test_case_execute', args),
  },

  // ==================== 测试用例查询 ====================

  test_case_query: {
    description: "查询测试用例。参数可选：project_id(项目 ID), status(状态), priority(优先级), type(类型), assignee_id(指派人)",
    parameters: z.object({
      project_id: z.string().optional().describe("项目 ID"),
      collaboration_id: z.string().optional().describe("协作 ID"),
      status: z.enum(["DRAFT", "PENDING_REVIEW", "APPROVED", "REJECTED", "ARCHIVED"]).optional().describe("状态"),
      priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional().describe("优先级"),
      type: z.enum(["FUNCTIONAL", "INTEGRATION", "PERFORMANCE", "SECURITY", "REGRESSION", "ACCEPTANCE"]).optional().describe("类型"),
      assignee_id: z.string().optional().describe("指派人 ID"),
      search: z.string().optional().describe("搜索关键词"),
      limit: z.number().optional().describe("返回数量限制"),
      offset: z.number().optional().describe("偏移量"),
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'test_case_query', args),
  },

  test_case_get: {
    description: "获取测试用例详情。需要参数：test_case_id(测试用例 ID)",
    parameters: z.object({
      test_case_id: z.string().describe("测试用例 ID"),
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'test_case_get', args),
  },

  test_case_get_executions: {
    description: "获取测试用例执行历史。需要参数：test_case_id(测试用例 ID)",
    parameters: z.object({
      test_case_id: z.string().describe("测试用例 ID"),
      limit: z.number().optional().describe("返回数量限制"),
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'test_case_get_executions', args),
  },

  test_case_stats: {
    description: "获取测试用例统计信息。参数可选：project_id(项目 ID), collaboration_id(协作 ID)",
    parameters: z.object({
      project_id: z.string().optional().describe("项目 ID"),
      collaboration_id: z.string().optional().describe("协作 ID"),
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'test_case_stats', args),
  },

  // ==================== 测试用例更新 ====================

  test_case_update: {
    description: "更新测试用例。需要参数：test_case_id(测试用例 ID), 其他可选更新字段",
    parameters: z.object({
      test_case_id: z.string().describe("测试用例 ID"),
      title: z.string().optional().describe("标题"),
      description: z.string().optional().describe("描述"),
      priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional().describe("优先级"),
      type: z.enum(["FUNCTIONAL", "INTEGRATION", "PERFORMANCE", "SECURITY", "REGRESSION", "ACCEPTANCE"]).optional().describe("类型"),
      steps: z.array(z.any()).optional().describe("测试步骤"),
      expectedResult: z.string().optional().describe("预期结果"),
      tags: z.array(z.string()).optional().describe("标签"),
      assigneeId: z.string().optional().describe("指派人 ID"),
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'test_case_update', args),
  },

  test_case_delete: {
    description: "删除测试用例。需要参数：test_case_id(测试用例 ID)",
    parameters: z.object({
      test_case_id: z.string().describe("测试用例 ID"),
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'test_case_delete', args),
  },

  // ==================== 批量操作 ====================

  test_case_batch_create: {
    description: "批量创建测试用例。需要参数：test_cases(测试用例数组)",
    parameters: z.object({
      test_cases: z.array(z.object({
        title: z.string(),
        description: z.string().optional(),
        type: z.enum(["FUNCTIONAL", "INTEGRATION", "PERFORMANCE", "SECURITY", "REGRESSION", "ACCEPTANCE"]).optional(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
        projectId: z.string().optional(),
        steps: z.array(z.any()).optional(),
        expectedResult: z.string().optional(),
      })).describe("测试用例数组"),
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'test_case_batch_create', args),
  },
};
