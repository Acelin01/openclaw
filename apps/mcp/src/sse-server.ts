import express from "express";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { ProjectApp } from "@uxin/projects/project-app";
import { FreelancerSkills } from "../../../packages/agent-lib/src/skills/freelancer.js";
import { getProjectCollaborationTools } from "./tools/project-collaboration/index.js";
import { getFreelancerServiceTools } from "./tools/freelancer/index.js";
import { getAgentCollaborationTools } from "./tools/agent-collaboration/index.js";

/**
 * Uxin Multi-MCP SSE Server
 */
class UxinMultiMCPSSEServer {
  private app: express.Application;
  private projectApp: ProjectApp;
  private freelancerSkills: any;
  private servers: Map<string, Server> = new Map();
  // Store transports to handle POST messages
  private transportManagers: Map<string, Map<string, SSEServerTransport>> = new Map();

  constructor() {
    this.app = express();
    this.projectApp = new ProjectApp();
    this.freelancerSkills = new FreelancerSkills();
    // Initialize three distinct servers
    this.setupServer("project", "uxin-mcp", [
      ...getProjectCollaborationTools(this.projectApp, this.getBaseContext())
    ]);
    
    this.setupServer("freelancer", "uxin-mcp-freelancer", [
      ...getFreelancerServiceTools(this.freelancerSkills, this.getBaseContext())
    ]);
    
    this.setupServer("agent", "uxin-mcp-agent", [
      ...getAgentCollaborationTools(this.projectApp, this.getBaseContext())
    ]);
  }

  private getBaseContext() {
    const apiToken = process.env.UXIN_API_TOKEN || "uxin-service-secret-123";
    let userId = process.env.UXIN_USER_ID;

    // If userId is not provided but token is a JWT, try to extract userId from it
    if (!userId && apiToken && apiToken.includes('.')) {
      try {
        const payload = JSON.parse(Buffer.from(apiToken.split('.')[1], 'base64').toString());
        userId = payload.userId || payload.id || payload.sub;
        if (userId) {
          console.log(`[MCP SSE Debug] Extracted userId from JWT: ${userId}`);
        }
      } catch (e) {
        console.log(`[MCP SSE Debug] Failed to parse JWT for userId: ${e}`);
      }
    }

    return {
      userId: userId || "seed-user-linyi",
      token: apiToken,
      isService: true
    };
  }

  private setupServer(id: string, name: string, tools: any[]) {
    const server = new Server(
      { name, version: "1.0.0" },
      { capabilities: { tools: {} } }
    );

    const transports = new Map<string, SSEServerTransport>();
    this.transportManagers.set(id, transports);

    // Setup handlers for this specific server
    server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: tools.map(t => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema,
      }))
    }));

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      const tool = tools.find(t => t.name === name);
      if (!tool) throw new Error(`Unknown tool: ${name}`);

      try {
        console.log(`[MCP] Calling tool: ${name} with args:`, args);
        const result = await tool.handler(args);
        console.log(`[MCP] Tool ${name} result:`, JSON.stringify(result).substring(0, 500) + "...");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error: any) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }
    });

    server.onerror = (error) => console.error(`[MCP SSE Error - ${id}]`, error);
    this.servers.set(id, server);

    // Setup routes for this specific server
    this.app.get(`/${id}/sse`, async (_req, res) => {
      console.log(`New SSE connection for ${id}`);
      const transport = new SSEServerTransport(`/${id}/messages`, res);
      
      // The transport automatically generates a sessionId
      // We need to keep track of it to handle subsequent POST messages
      await server.connect(transport);
      
      const sessionId = (transport as any)._sessionId;
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
      const sessionId = req.query.sessionId as string;
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
        console.log(`  - SSE: http://localhost:3004/${id}/sse`);
        console.log(`  - MSG: http://localhost:3004/${id}/messages`);
      }
      console.log(`----------------------------------------------------------\n`);
    });
  }
}

const PORT = parseInt(process.env.MCP_PORT || "3004");
const multiServer = new UxinMultiMCPSSEServer();
multiServer.start(PORT);
