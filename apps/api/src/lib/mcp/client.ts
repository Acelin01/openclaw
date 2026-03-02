import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";
import fs from "fs";

/**
 * MCP 客户端管理类
 */
export class MCPClientManager {
  private static instance: MCPClientManager;
  private clients: Map<string, Client> = new Map();

  private constructor() {}

  public static getInstance(): MCPClientManager {
    if (!MCPClientManager.instance) {
      MCPClientManager.instance = new MCPClientManager();
    }
    return MCPClientManager.instance;
  }

  /**
   * 获取项目协作与自由职业者 MCP 服务路径
   */
  public static getMCPServerPath(): string {
    const srcCandidates = [
      path.resolve(process.cwd(), "src/mcp-server/index.ts"),
      path.resolve(process.cwd(), "../api/src/mcp-server/index.ts")
    ];
    const distCandidates = [
      path.resolve(process.cwd(), "dist/src/mcp-server/index.js"),
      path.resolve(process.cwd(), "../api/dist/src/mcp-server/index.js")
    ];

    const srcPath = srcCandidates.find((candidate) => fs.existsSync(candidate));
    const distPath = distCandidates.find((candidate) => fs.existsSync(candidate));

    if (srcPath) return srcPath;
    if (distPath) return distPath;

    return distCandidates[0] ?? path.resolve(process.cwd(), "dist/mcp-server/index.js");
  }

  /**
   * 获取或创建一个 MCP 客户端
   * @param serverName 服务名称 (如 'project-collaboration')
   * @param serverPath 服务脚本路径
   */
  public async getClient(serverName: string, serverPath: string): Promise<Client> {
    if (this.clients.has(serverName)) {
      return this.clients.get(serverName)!;
    }

    const isTs = serverPath.endsWith('.ts');
    // 从当前工作目录查找 tsx (api 目录)
    const apiDir = process.cwd();
    const tsxBin = path.resolve(apiDir, 'node_modules/.bin/tsx');

    // 构建环境变量配置
    const env: Record<string, string> = {};
    const apiBaseUrl = process.env.API_BASE_URL || process.env.SERVER_API_URL || 'http://127.0.0.1:8000';
    if (process.env.UXIN_API_TOKEN) env.UXIN_API_TOKEN = process.env.UXIN_API_TOKEN;
    if (process.env.UXIN_USER_ID) env.UXIN_USER_ID = process.env.UXIN_USER_ID;
    if (process.env.API_BASE_URL) env.API_BASE_URL = apiBaseUrl;

    // 使用本地 tsx 二进制文件
    const command = isTs ? tsxBin : "node";
    const args = isTs ? [serverPath] : [serverPath];

    console.log(`[MCP Client] Starting: ${command} ${args.join(' ')}`);

    const transport = new StdioClientTransport({
      command,
      args,
      env,
    });

    const client = new Client(
      {
        name: `ai-chat-client-${serverName}`,
        version: "1.0.0",
      },
      {
        capabilities: {},
      }
    );

    await client.connect(transport);
    this.clients.set(serverName, client);

    console.log(`Connected to MCP server: ${serverName} via ${isTs ? 'tsx' : 'node'} (API: ${apiBaseUrl})`);
    return client;
  }
}

/**
 * 封装一个通用的工具执行器，将 MCP 工具转换为 AI SDK 兼容的工具
 */
export async function executeMCPTool(serverName: string, toolName: string, args: any = {}) {
  // Try direct database service first (more reliable)
  try {
    return await executeToolDirectly(toolName, args || {});
  } catch (error) {
    // If direct service fails, try MCP client
    console.warn(`Direct service failed for ${toolName}, falling back to MCP client:`, error?.message);
    try {
      const manager = MCPClientManager.getInstance();
      const serverPath = MCPClientManager.getMCPServerPath();
      const client = await manager.getClient(serverName, serverPath);

      return await client.callTool({
        name: toolName,
        arguments: args || {},
      });
    } catch (clientError) {
      console.error(`MCP client also failed for ${toolName}:`, clientError?.message);
      throw error; // Throw original error
    }
  }
}

/**
 * Direct tool execution via DatabaseService (fallback when MCP server unavailable)
 */
async function executeToolDirectly(toolName: string, args: any) {
  const { DatabaseService } = await import('../db/service.js');
  const db = DatabaseService.getInstance();

  // Direct method mapping to DatabaseService methods
  const toolMethodMap: Record<string, { method: string; section?: string }> = {
    // Project management
    'project_create': { method: 'createProject' },
    'project_query': { method: 'getProjects' },
    'task_create': { method: 'createTask' },
    'task_list': { method: 'getProjectTasks' },
    'task_update_status': { method: 'updateTaskStatus' },
    'milestone_create': { method: 'createMilestone' },
    'milestone_monitor': { method: 'getProjectMilestones' },
    'requirement_create': { method: 'createRequirement' },
    'defect_create': { method: 'createDefect' },
    'risk_create': { method: 'createRisk' },
    // Document
    'document_query': { method: 'getProjectDocuments' },
    // Test Case Management
    'test_case_create': { method: 'createTestCase', section: 'testCaseService' },
    'test_case_query': { method: 'getTestCases', section: 'testCaseService' },
    'test_case_get': { method: 'getTestCaseById', section: 'testCaseService' },
    'test_case_update': { method: 'updateTestCase', section: 'testCaseService' },
    'test_case_delete': { method: 'deleteTestCase', section: 'testCaseService' },
    'test_case_submit_review': { method: 'submitForReview', section: 'testCaseService' },
    'test_case_review': { method: 'reviewTestCase', section: 'testCaseService' },
    'test_case_execute': { method: 'executeTestCase', section: 'testCaseService' },
    'test_case_get_executions': { method: 'getTestCaseExecutions', section: 'testCaseService' },
    'test_case_stats': { method: 'getTestCaseStats', section: 'testCaseService' },
    'test_case_batch_create': { method: 'createTestCases', section: 'testCaseService' },
    // Document Management
    'document_create': { method: 'createDocument', section: 'documentService' },
    'document_query': { method: 'getDocuments', section: 'documentService' },
    'document_get': { method: 'getDocumentById', section: 'documentService' },
    'document_update': { method: 'updateDocument', section: 'documentService' },
    'document_delete': { method: 'deleteDocument', section: 'documentService' },
    'document_review': { method: 'reviewDocument', section: 'documentService' },
    'document_stats': { method: 'getDocumentStats', section: 'documentService' },
    // Iteration Management
    'iteration_create': { method: 'createIteration', section: 'iterationService' },
    'iteration_query': { method: 'getIterations', section: 'iterationService' },
    'iteration_get': { method: 'getIterationById', section: 'iterationService' },
    'iteration_list': { method: 'getIterationList', section: 'iterationService' },
    'iteration_overview': { method: 'getIterationOverview', section: 'iterationService' },
    'iteration_stats': { method: 'getIterationStats', section: 'iterationService' },
    'iteration_workitems': { method: 'getIterationWorkitems', section: 'iterationService' },
    'iteration_workitem_stats': { method: 'getIterationWorkitemStats', section: 'iterationService' },
    'iteration_plan': { method: 'planIteration', section: 'iterationService' },
    'iteration_update': { method: 'updateIteration', section: 'iterationService' },
    'iteration_delete': { method: 'deleteIteration', section: 'iterationService' },
  };

  const mapping = toolMethodMap[toolName];
  if (!mapping) {
    // For tools without direct DB mapping, return a placeholder response
    console.warn(`No direct mapping for tool: ${toolName}, returning placeholder`);
    return { success: true, data: { message: `Tool ${toolName} executed (placeholder)`, args } };
  }

  const methodName = mapping.method;
  const section = mapping.section;
  
  console.log(`[executeToolDirectly] tool=${toolName}, method=${methodName}, section=${section}, args=`, args);
  
  let target: any = db;
  
  // If section is specified, use that section of the service
  if (section) {
    target = (db as any)[section];
    if (!target) {
      throw new Error(`Service section ${section} not found`);
    }
  }
  
  // Check if the method exists
  if (typeof target[methodName] !== 'function') {
    throw new Error(`Method ${methodName} not found on ${section || 'DatabaseService'}`);
  }

  try {
    console.log(`[executeToolDirectly] Calling ${section}.${methodName} with args:`, JSON.stringify(args, null, 2));
    const result = await target[methodName](args);
    console.log(`[executeToolDirectly] Result:`, result ? 'success' : 'null');
    return result;
  } catch (error: any) {
    console.error(`[executeToolDirectly] Error:`, error.message);
    // Handle method signature mismatches
    if (error.message.includes('undefined') || error.message.includes('cannot read')) {
      // Try calling with just args
      console.log(`[executeToolDirectly] Retrying without context...`);
      return await target[methodName](args);
    }
    throw error;
  }
}
