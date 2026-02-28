import 'dotenv/config';
import '../mocks.js';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { ProjectApp } from "@uxin/projects/project-app";
import { FreelancerSkills } from "../../../../packages/agent-lib/src/skills/freelancer.js";
import { getProjectCollaborationTools } from "./tools/project-collaboration/index.js";
import { getFreelancerServiceTools } from "./tools/freelancer/index.js";
import { getAgentCollaborationTools } from "./tools/agent-collaboration/index.js";

type Tool = {
  name: string;
  description: string;
  inputSchema: unknown;
  handler: (args: unknown) => Promise<unknown>;
};

/**
 * 从 JWT Token 中提取用户 ID
 */
function extractUserIdFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return payload.userId || payload.id || payload.sub || null;
  } catch {
    return null;
  }
}

/**
 * 解析基础上下文配置
 */
function parseBaseContext() {
  const apiToken = process.env.UXIN_API_TOKEN || "uxin-service-secret-123";
  const apiBaseUrl = process.env.API_BASE_URL || process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  let userId = process.env.UXIN_USER_ID;

  // 尝试从 JWT Token 中提取 userId
  if (!userId && apiToken && apiToken.includes('.')) {
    const extractedId = extractUserIdFromToken(apiToken);
    if (extractedId) {
      console.error(`[MCP] Extracted userId from JWT: ${extractedId}`);
      userId = extractedId;
    }
  }

  // 默认 userId
  if (!userId) {
    userId = "mcp-system";
  }

  // 确保 API URL 可用
  process.env.SERVER_API_URL = apiBaseUrl;

  return {
    userId,
    token: apiToken,
    apiUrl: apiBaseUrl,
    isService: true,
  };
}

class UxinMCPServer {
  private server: Server;
  private projectApp: ProjectApp;
  private freelancerSkills: FreelancerSkills;
  private tools: Tool[] = [];
  private context: { userId: string; token: string; apiUrl: string; isService: boolean };

  constructor() {
    this.server = new Server(
      {
        name: "uxin-mcp",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.projectApp = new ProjectApp();
    this.freelancerSkills = new FreelancerSkills();
    this.context = parseBaseContext();
    this.initializeTools();
    this.setupHandlers();

    this.server.onerror = (error) => console.error("[MCP Error]", error);
    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private initializeTools() {
    console.error(
      `[MCP] Initializing tools with userId: ${this.context.userId}, apiUrl: ${this.context.apiUrl}`,
    );

    this.tools = [
      ...getProjectCollaborationTools(this.projectApp, {
        userId: this.context.userId,
        token: this.context.token
      }),
      ...getFreelancerServiceTools(this.freelancerSkills, {
        userId: this.context.userId,
        token: this.context.token
      }),
      ...getAgentCollaborationTools(this.projectApp, {
        userId: this.context.userId,
        token: this.context.token
      }),
    ];
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.tools.map((tool) => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
        })),
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      const tool = this.tools.find((item) => item.name === name);

      if (!tool) {
        throw new Error(`Unknown tool: ${name}`);
      }

      try {
        const result = await tool.handler(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unknown error';
        return {
          content: [
            {
              type: "text",
              text: `Error: ${message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Uxin MCP server running on stdio");
  }
}

const server = new UxinMCPServer();
server.run().catch((error) => console.error(error));
