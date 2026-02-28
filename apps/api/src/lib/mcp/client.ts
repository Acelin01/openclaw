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
      path.resolve(process.cwd(), "apps/api/src/mcp-server/index.ts"),
      path.resolve(process.cwd(), "src/mcp-server/index.ts"),
      path.resolve(process.cwd(), "../api/src/mcp-server/index.ts"),
    ];
    const distCandidates = [
      path.resolve(process.cwd(), "apps/api/dist/mcp-server/index.js"),
      path.resolve(process.cwd(), "dist/mcp-server/index.js"),
      path.resolve(process.cwd(), "../api/dist/mcp-server/index.js"),
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
    const transport = new StdioClientTransport({
      command: isTs ? "npx" : "node",
      args: isTs ? ["tsx", serverPath] : [serverPath],
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
    
    console.log(`Connected to MCP server: ${serverName} via ${isTs ? 'tsx' : 'node'}`);
    return client;
  }
}

/**
 * 封装一个通用的工具执行器，将 MCP 工具转换为 AI SDK 兼容的工具
 */
export async function executeMCPTool(serverName: string, toolName: string, args: any) {
  // Try MCP client first
  try {
    const manager = MCPClientManager.getInstance();
    const serverPath = MCPClientManager.getMCPServerPath();
    const client = await manager.getClient(serverName, serverPath);

    return await client.callTool({
      name: toolName,
      arguments: args,
    });
  } catch (error) {
    // If MCP client fails, try direct database service
    console.warn(`MCP client failed for ${toolName}, falling back to direct service:`, error?.message);
    return await executeToolDirectly(toolName, args);
  }
}

/**
 * Direct tool execution via DatabaseService (fallback when MCP server unavailable)
 */
async function executeToolDirectly(toolName: string, args: any) {
  const { DatabaseService } = await import('../db/service.js');
  const db = DatabaseService.getInstance();

  const toolMethodMap: Record<string, string> = {
    // Project management
    'project_create': 'createProject',
    'project_query': 'getProject',
    'task_create': 'createTask',
    'task_list': 'listTasks',
    'task_update_status': 'updateTaskStatus',
    'milestone_create': 'createMilestone',
    'milestone_monitor': 'monitorMilestones',
    'requirement_create': 'createRequirement',
    'defect_create': 'createDefect',
    'risk_create': 'createRisk',
    // Freelancer services
    'resume_create': 'createResume',
    'freelancer_register': 'registerFreelancer',
    'service_create': 'createService',
    'transaction_create': 'createTransaction',
    'contract_create': 'createContract',
    // Technical analysis
    'talent_match': 'matchTalent',
    'skill_analyzer': 'analyzeSkills',
    'marketplace_integrator': 'integrateMarketplace',
    'compliance_checker': 'checkCompliance',
    'growth_strategy_analyzer': 'analyzeGrowthStrategy',
    'ux_design_reviewer': 'reviewUXDesign',
    'devops_pipeline_optimizer': 'optimizeDevOps',
    // Agent collaboration
    'agent_collaboration_plan': 'planCollaboration',
    'agent_collaboration_start': 'startCollaboration',
    'collaboration_dispatch': 'dispatchCollaboration',
    // Document
    'document_query': 'listDocuments',
  };

  const methodName = toolMethodMap[toolName];
  if (!methodName) {
    throw new Error(`No direct method mapping for tool: ${toolName}`);
  }

  // Check if the method exists on the service
  const serviceSections = [
    db.projectManagement,
    db.taskManagement,
    db.milestoneManagement,
    db.requirementManagement,
    db.defectManagement,
    db.riskManagement,
    db.freelancerService,
    db.technicalAnalysis,
    db.agentCollaboration,
    db.documentService
  ];

  for (const service of serviceSections) {
    if (service && typeof service[methodName as keyof typeof service] === 'function') {
      return await (service[methodName as keyof typeof service] as Function).call(service, args, {
        userId: args.userId || 'system',
        token: 'direct-call'
      });
    }
  }

  throw new Error(`Method ${methodName} not found on any service`);
}
