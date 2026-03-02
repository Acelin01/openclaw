/**
 * 文档管理 MCP 工具
 */

import { z } from "zod";
import { executeMCPTool } from "../../../mcp/client";

export const documentManagementTools = {
  // ==================== 文档创建 ====================
  
  document_create: {
    description: "创建文档。需要参数：title(标题), content(内容), kind(类型), projectId(项目 ID 可选)",
    parameters: z.object({
      title: z.string().describe("文档标题"),
      content: z.string().describe("文档内容 (JSON 格式)"),
      kind: z.enum(["testcase", "requirement", "project", "position", "resume", "service", "milestone"]).describe("文档类型"),
      description: z.string().optional().describe("文档描述"),
      projectId: z.string().optional().describe("项目 ID"),
      chatId: z.string().optional().describe("聊天 ID"),
      agentId: z.string().optional().describe("智能体 ID"),
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'document_create', args),
  },

  // ==================== 文档查询 ====================

  document_query: {
    description: "查询文档。参数可选：kind(类型), status(状态), project_id(项目 ID), search(搜索关键词)",
    parameters: z.object({
      kind: z.enum(["testcase", "requirement", "project", "position", "resume", "service", "text", "code", "sheet"]).optional().describe("文档类型"),
      status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional().describe("审核状态"),
      project_id: z.string().optional().describe("项目 ID"),
      search: z.string().optional().describe("搜索关键词"),
      limit: z.number().optional().describe("返回数量限制"),
      offset: z.number().optional().describe("偏移量"),
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'document_query', args),
  },

  document_get: {
    description: "获取文档详情。需要参数：document_id(文档 ID)",
    parameters: z.object({
      document_id: z.string().describe("文档 ID"),
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'document_get', args),
  },

  document_stats: {
    description: "获取文档统计信息。参数可选：project_id(项目 ID), user_id(用户 ID)",
    parameters: z.object({
      project_id: z.string().optional().describe("项目 ID"),
      user_id: z.string().optional().describe("用户 ID"),
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'document_stats', args),
  },

  // ==================== 文档审核 ====================

  document_review: {
    description: "审核文档。需要参数：document_id(文档 ID), status(审核状态), comment(审核意见)",
    parameters: z.object({
      document_id: z.string().describe("文档 ID"),
      status: z.enum(["APPROVED", "REJECTED"]).describe("审核状态"),
      comment: z.string().optional().describe("审核意见"),
      reviewer_id: z.string().describe("审核人 ID"),
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'document_review', args),
  },

  // ==================== 文档更新 ====================

  document_update: {
    description: "更新文档。需要参数：document_id(文档 ID), 其他可选更新字段",
    parameters: z.object({
      document_id: z.string().describe("文档 ID"),
      title: z.string().optional().describe("标题"),
      content: z.string().optional().describe("内容"),
      status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional().describe("状态"),
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'document_update', args),
  },

  document_delete: {
    description: "删除文档。需要参数：document_id(文档 ID)",
    parameters: z.object({
      document_id: z.string().describe("文档 ID"),
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'document_delete', args),
  },
};
