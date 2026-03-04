/**
 * 项目管理 MCP 工具
 * 
 * 功能:
 * - 项目列表查询
 * - 项目详情查询
 * - 项目创建
 * - 项目更新
 * - 项目删除
 * - 项目概览
 */

import { z } from "zod";
import { executeMCPTool } from "../../../mcp/client";

export const projectManagementTools = {
  /**
   * 查询项目列表
   */
  project_list: {
    description: "查询项目列表。参数：status(状态筛选), user_id(用户 ID 筛选), limit(返回数量), offset(偏移量)",
    parameters: z.object({
      status: z.string().optional().describe("项目状态筛选"),
      user_id: z.string().optional().describe("用户 ID 筛选"),
      limit: z.number().optional().describe("返回数量限制"),
      offset: z.number().optional().describe("偏移量")
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'project_list', args)
  },

  /**
   * 查询项目详情
   */
  project_get: {
    description: "查询项目详情。参数：project_id(项目 ID)",
    parameters: z.object({
      project_id: z.string().describe("项目 ID")
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'project_get', args)
  },

  /**
   * 创建项目
   */
  project_create: {
    description: "创建新项目。需要参数：name(项目名称), description(描述), owner_id(负责人 ID), start_date(开始日期), end_date(结束日期)",
    parameters: z.object({
      name: z.string().describe("项目名称"),
      description: z.string().optional().describe("项目描述"),
      owner_id: z.string().describe("负责人 ID"),
      start_date: z.string().optional().describe("开始日期 (YYYY-MM-DD)"),
      end_date: z.string().optional().describe("结束日期 (YYYY-MM-DD)"),
      budget: z.number().optional().describe("预算"),
      status: z.string().optional().describe("项目状态")
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'project_create', args)
  },

  /**
   * 更新项目
   */
  project_update: {
    description: "更新项目信息。参数：project_id(项目 ID), name(名称), description(描述), status(状态), start_date(开始日期), end_date(结束日期)",
    parameters: z.object({
      project_id: z.string().describe("项目 ID"),
      name: z.string().optional().describe("项目名称"),
      description: z.string().optional().describe("项目描述"),
      status: z.string().optional().describe("项目状态"),
      start_date: z.string().optional().describe("开始日期"),
      end_date: z.string().optional().describe("结束日期"),
      budget: z.number().optional().describe("预算")
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'project_update', args)
  },

  /**
   * 删除项目
   */
  project_delete: {
    description: "删除项目。参数：project_id(项目 ID)",
    parameters: z.object({
      project_id: z.string().describe("项目 ID")
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'project_delete', args)
  },

  /**
   * 查询项目概览
   */
  project_overview: {
    description: "查询项目概览信息。参数：project_id(项目 ID)",
    parameters: z.object({
      project_id: z.string().describe("项目 ID")
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'project_overview', args)
  }
};
