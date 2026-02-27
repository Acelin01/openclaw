import express from "express";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
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

class UxinMultiMCPSSEServer {
  private app: express.Application;
  private projectApp: ProjectApp;
  private freelancerSkills: FreelancerSkills;
  private servers: Map<string, Server> = new Map();
  private transportManagers: Map<string, Map<string, SSEServerTransport>> = new Map();

  constructor() {
    this.app = express();
    this.projectApp = new ProjectApp();
    this.freelancerSkills = new FreelancerSkills();
    this.setupServer("project", "uxin-mcp", [
      ...getProjectCollaborationTools(this.projectApp, this.getBaseContext()),
    ]);
    this.setupServer("freelancer", "uxin-mcp-freelancer", [
      ...getFreelancerServiceTools(this.freelancerSkills, this.getBaseContext()),
    ]);
    this.setupServer("agent", "uxin-mcp-agent", [
      ...getAgentCollaborationTools(this.projectApp, this.getBaseContext()),
    ]);
  }

  private getBaseContext() {
    const apiToken = process.env.UXIN_API_TOKEN || "uxin-service-secret-123";
    let userId = process.env.UXIN_USER_ID;

    if (!userId && apiToken && apiToken.includes('.')) {
      try {
        const payload = JSON.parse(Buffer.from(apiToken.split('.')[1], 'base64').toString());
        userId = payload.userId || payload.id || payload.sub;
        if (userId) {
          console.log(`[MCP SSE Debug] Extracted userId from JWT: ${userId}`);
        }
      } catch (error) {
        console.log(`[MCP SSE Debug] Failed to parse JWT for userId: ${String(error)}`);
      }
    }

    return {
      userId: userId || "seed-user-linyi",
      token: apiToken,
      isService: true,
    };
  }

  private setupServer(id: string, name: string, tools: Tool[]) {
    const server = new Server(
      { name, version: "1.0.0" },
      { capabilities: { tools: {} } },
    );

    const transports = new Map<string, SSEServerTransport>();
    this.transportManagers.set(id, transports);

    server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      })),
    }));

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      const tool = tools.find((item) => item.name === name);
      if (!tool) {
        throw new Error(`Unknown tool: ${name}`);
      }

      try {
        console.log(`[MCP] Calling tool: ${name} with args:`, args);
        const result = await tool.handler(args);
        console.log(`[MCP] Tool ${name} result:`, JSON.stringify(result).substring(0, 500) + "...");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unknown error';
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    });

    server.onerror = (error) => console.error(`[MCP SSE Error - ${id}]`, error);
    this.servers.set(id, server);

    this.app.get(`/${id}/sse`, async (_req, res) => {
      console.log(`New SSE connection for ${id}`);
      const transport = new SSEServerTransport(`/${id}/messages`, res);
      await server.connect(transport);
      const sessionId = (transport as unknown as { _sessionId?: string })._sessionId;
      if (sessionId) {
        transports.set(sessionId, transport);
        console.log(`Session ${sessionId} started for ${id}`);
      }

      res.on('close', () => {
        if (sessionId) {
          transports.delete(sessionId);
          console.log(`Session ${sessionId} closed for ${id}`);
        }
      });
    });

    this.app.post(`/${id}/messages`, async (req, res) => {
      const sessionId = typeof req.query.sessionId === 'string' ? req.query.sessionId : "";
      if (!sessionId) {
        res.status(400).send("Missing sessionId");
        return;
      }

      const transport = transports.get(sessionId);
      if (!transport) {
        res.status(404).send("Session not found");
        return;
      }

      await transport.handlePostMessage(req, res);
    });
  }

  public start(port: number) {
    this.app.listen(port, () => {
      console.log(`\n🚀 Uxin Multi-MCP Server running at http://localhost:${port}`);
      console.log(`----------------------------------------------------------`);
      for (const id of this.servers.keys()) {
        console.log(`${id.toUpperCase()} Server:`);
        console.log(`  - SSE: http://localhost:${port}/${id}/sse`);
        console.log(`  - MSG: http://localhost:${port}/${id}/messages`);
      }
      console.log(`----------------------------------------------------------\n`);
    });
  }
}

const port = Number.parseInt(process.env.MCP_PORT || "3004", 10);
const multiServer = new UxinMultiMCPSSEServer();
multiServer.start(port);
