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

class UxinMCPServer {
  private server: Server;
  private projectApp: ProjectApp;
  private freelancerSkills: FreelancerSkills;
  private tools: Tool[] = [];

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
    this.initializeTools();
    this.setupHandlers();

    this.server.onerror = (error) => console.error("[MCP Error]", error);
    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private initializeTools() {
    if (!process.env.SERVER_API_URL && !process.env.NEXT_PUBLIC_API_URL) {
      process.env.SERVER_API_URL = 'http://127.0.0.1:8000';
    }

    const apiToken = process.env.UXIN_API_TOKEN || "uxin-service-secret-123";
    let userId = process.env.UXIN_USER_ID;

    if (!userId && apiToken && apiToken.includes('.')) {
      try {
        const payload = JSON.parse(Buffer.from(apiToken.split('.')[1], 'base64').toString());
        userId = payload.userId || payload.id || payload.sub;
        if (userId) {
          console.error(`[MCP Debug] Extracted userId from JWT: ${userId}`);
        }
      } catch (error) {
        console.error(`[MCP Debug] Failed to parse JWT for userId: ${String(error)}`);
      }
    }

    if (!userId) {
      userId = "mcp-system";
    }

    console.error(
      `Initializing tools with userId: ${userId}, hasToken: ${!!apiToken}, apiUrl: ${process.env.SERVER_API_URL}`,
    );

    this.tools = [
      ...getProjectCollaborationTools(this.projectApp, { userId, token: apiToken }),
      ...getFreelancerServiceTools(this.freelancerSkills, { userId, token: apiToken }),
      ...getAgentCollaborationTools(this.projectApp, { userId, token: apiToken }),
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
