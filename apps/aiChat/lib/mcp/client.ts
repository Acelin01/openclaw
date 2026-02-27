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
    // 优先使用 src 下的源码，如果不存在则尝试 dist
    const srcPath = path.resolve(process.cwd(), "../mcp/src/index.ts");
    const distPath = path.resolve(process.cwd(), "../mcp/dist/index.js");
    
    // 在开发环境下，如果源码存在则使用 tsx 运行源码
    if (process.env.NODE_ENV === 'development' && fs.existsSync(srcPath)) {
      return srcPath;
    }
    
    return distPath;
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
  const manager = MCPClientManager.getInstance();
  const serverPath = MCPClientManager.getMCPServerPath();
  const client = await manager.getClient(serverName, serverPath);
  
  return await client.callTool({
    name: toolName,
    arguments: args,
  });
}
