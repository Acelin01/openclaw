import type { AgentToolResult } from "@mariozechner/pi-agent-core";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { Type } from "@sinclair/typebox";
import type { OpenClawConfig } from "../config/config.js";
import type { McpServerConfig } from "../config/types.openclaw.js";
import type { GatewayMessageChannel } from "../utils/message-channel.js";
import type { AnyAgentTool } from "./tools/common.js";
import { resolvePluginTools } from "../plugins/tools.js";
import { resolveSessionAgentId } from "./agent-scope.js";
import { createAgentsListTool } from "./tools/agents-list-tool.js";
import { createBrowserTool } from "./tools/browser-tool.js";
import { createCanvasTool } from "./tools/canvas-tool.js";
import { jsonResult } from "./tools/common.js";
import { createCronTool } from "./tools/cron-tool.js";
import { createGatewayTool } from "./tools/gateway-tool.js";
import { createImageTool } from "./tools/image-tool.js";
import { createMessageTool } from "./tools/message-tool.js";
import { createNodesTool } from "./tools/nodes-tool.js";
import { createSessionStatusTool } from "./tools/session-status-tool.js";
import { createSessionsHistoryTool } from "./tools/sessions-history-tool.js";
import { createSessionsListTool } from "./tools/sessions-list-tool.js";
import { createSessionsSendTool } from "./tools/sessions-send-tool.js";
import { createSessionsSpawnTool } from "./tools/sessions-spawn-tool.js";
import { createTtsTool } from "./tools/tts-tool.js";
import { createWebFetchTool, createWebSearchTool } from "./tools/web-tools.js";

const McpToolsListParamsSchema = Type.Object(
  {
    server: Type.String(),
  },
  { additionalProperties: false },
);

const McpToolCallParamsSchema = Type.Object(
  {
    server: Type.String(),
    name: Type.String(),
    args: Type.Optional(Type.Object({}, { additionalProperties: true })),
  },
  { additionalProperties: false },
);

const mcpClients = new Map<string, Promise<{ client: Client; transport: StdioClientTransport }>>();

function normalizeMcpServerName(value: string) {
  return value.trim();
}

function resolveMcpServer(config: OpenClawConfig | undefined, name: string): McpServerConfig {
  const server = config?.mcpServers?.[name];
  if (!server) {
    throw new Error(`Unknown MCP server: ${name}`);
  }
  return server;
}

function toEnvRecord(env: NodeJS.ProcessEnv, overrides?: Record<string, string>) {
  const resolved: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    if (typeof value === "string") {
      resolved[key] = value;
    }
  }
  if (overrides) {
    for (const [key, value] of Object.entries(overrides)) {
      if (typeof value === "string") {
        resolved[key] = value;
      }
    }
  }
  return resolved;
}

function isAgentToolResult(value: unknown): value is AgentToolResult<unknown> {
  if (!value || typeof value !== "object") {
    return false;
  }
  const record = value as { content?: unknown };
  return Array.isArray(record.content);
}

async function getMcpClient(params: {
  name: string;
  config?: OpenClawConfig;
}): Promise<{ client: Client; transport: StdioClientTransport }> {
  const normalized = normalizeMcpServerName(params.name);
  const existing = mcpClients.get(normalized);
  if (existing) {
    return existing;
  }
  const promise = (async () => {
    const server = resolveMcpServer(params.config, normalized);
    const transport = new StdioClientTransport({
      command: server.command,
      args: server.args ?? [],
      env: toEnvRecord(process.env, server.env),
      cwd: server.cwd,
    });
    const client = new Client(
      {
        name: `openclaw-mcp-${normalized}`,
        version: "1.0.0",
      },
      {
        capabilities: {},
      },
    );
    await client.connect(transport);
    return { client, transport };
  })();
  mcpClients.set(normalized, promise);
  return promise;
}

function createMcpTools(options?: { config?: OpenClawConfig }): AnyAgentTool[] {
  const servers = options?.config?.mcpServers;
  if (!servers || Object.keys(servers).length === 0) {
    return [];
  }

  return [
    {
      label: "MCP Tools",
      name: "mcp_tools_list",
      description: "List tools from a configured MCP server.",
      parameters: McpToolsListParamsSchema,
      execute: async (_toolCallId, params) => {
        const serverName = params.server;
        const { client } = await getMcpClient({ name: serverName, config: options?.config });
        const result = await client.listTools();
        return jsonResult(result);
      },
    },
    {
      label: "MCP Tools",
      name: "mcp_tool_call",
      description: "Call a tool on a configured MCP server.",
      parameters: McpToolCallParamsSchema,
      execute: async (_toolCallId, params) => {
        const serverName = params.server;
        const { client } = await getMcpClient({ name: serverName, config: options?.config });
        const result = await client.callTool({
          name: params.name,
          arguments: params.args ?? {},
        });
        if (isAgentToolResult(result)) {
          return result;
        }
        return jsonResult(result);
      },
    },
  ];
}

export function createOpenClawTools(options?: {
  sandboxBrowserBridgeUrl?: string;
  allowHostBrowserControl?: boolean;
  agentSessionKey?: string;
  agentChannel?: GatewayMessageChannel;
  agentAccountId?: string;
  /** Delivery target (e.g. telegram:group:123:topic:456) for topic/thread routing. */
  agentTo?: string;
  /** Thread/topic identifier for routing replies to the originating thread. */
  agentThreadId?: string | number;
  /** Group id for channel-level tool policy inheritance. */
  agentGroupId?: string | null;
  /** Group channel label for channel-level tool policy inheritance. */
  agentGroupChannel?: string | null;
  /** Group space label for channel-level tool policy inheritance. */
  agentGroupSpace?: string | null;
  agentDir?: string;
  sandboxRoot?: string;
  workspaceDir?: string;
  sandboxed?: boolean;
  config?: OpenClawConfig;
  pluginToolAllowlist?: string[];
  /** Current channel ID for auto-threading (Slack). */
  currentChannelId?: string;
  /** Current thread timestamp for auto-threading (Slack). */
  currentThreadTs?: string;
  /** Reply-to mode for Slack auto-threading. */
  replyToMode?: "off" | "first" | "all";
  /** Mutable ref to track if a reply was sent (for "first" mode). */
  hasRepliedRef?: { value: boolean };
  /** If true, the model has native vision capability */
  modelHasVision?: boolean;
  /** Explicit agent ID override for cron/hook sessions. */
  requesterAgentIdOverride?: string;
}): AnyAgentTool[] {
  const imageTool = options?.agentDir?.trim()
    ? createImageTool({
        config: options?.config,
        agentDir: options.agentDir,
        sandboxRoot: options?.sandboxRoot,
        modelHasVision: options?.modelHasVision,
      })
    : null;
  const webSearchTool = createWebSearchTool({
    config: options?.config,
    sandboxed: options?.sandboxed,
  });
  const webFetchTool = createWebFetchTool({
    config: options?.config,
    sandboxed: options?.sandboxed,
  });
  const mcpTools = createMcpTools({ config: options?.config });
  const tools: AnyAgentTool[] = [
    createBrowserTool({
      sandboxBridgeUrl: options?.sandboxBrowserBridgeUrl,
      allowHostControl: options?.allowHostBrowserControl,
    }),
    createCanvasTool(),
    createNodesTool({
      agentSessionKey: options?.agentSessionKey,
      config: options?.config,
    }),
    createCronTool({
      agentSessionKey: options?.agentSessionKey,
    }),
    createMessageTool({
      agentAccountId: options?.agentAccountId,
      agentSessionKey: options?.agentSessionKey,
      config: options?.config,
      currentChannelId: options?.currentChannelId,
      currentChannelProvider: options?.agentChannel,
      currentThreadTs: options?.currentThreadTs,
      replyToMode: options?.replyToMode,
      hasRepliedRef: options?.hasRepliedRef,
      sandboxRoot: options?.sandboxRoot,
    }),
    createTtsTool({
      agentChannel: options?.agentChannel,
      config: options?.config,
    }),
    createGatewayTool({
      agentSessionKey: options?.agentSessionKey,
      config: options?.config,
    }),
    createAgentsListTool({
      agentSessionKey: options?.agentSessionKey,
      requesterAgentIdOverride: options?.requesterAgentIdOverride,
    }),
    createSessionsListTool({
      agentSessionKey: options?.agentSessionKey,
      sandboxed: options?.sandboxed,
    }),
    createSessionsHistoryTool({
      agentSessionKey: options?.agentSessionKey,
      sandboxed: options?.sandboxed,
    }),
    createSessionsSendTool({
      agentSessionKey: options?.agentSessionKey,
      agentChannel: options?.agentChannel,
      sandboxed: options?.sandboxed,
    }),
    createSessionsSpawnTool({
      agentSessionKey: options?.agentSessionKey,
      agentChannel: options?.agentChannel,
      agentAccountId: options?.agentAccountId,
      agentTo: options?.agentTo,
      agentThreadId: options?.agentThreadId,
      agentGroupId: options?.agentGroupId,
      agentGroupChannel: options?.agentGroupChannel,
      agentGroupSpace: options?.agentGroupSpace,
      sandboxed: options?.sandboxed,
      requesterAgentIdOverride: options?.requesterAgentIdOverride,
    }),
    createSessionStatusTool({
      agentSessionKey: options?.agentSessionKey,
      config: options?.config,
    }),
    ...(webSearchTool ? [webSearchTool] : []),
    ...(webFetchTool ? [webFetchTool] : []),
    ...(imageTool ? [imageTool] : []),
    ...mcpTools,
  ];

  const pluginTools = resolvePluginTools({
    context: {
      config: options?.config,
      workspaceDir: options?.workspaceDir,
      agentDir: options?.agentDir,
      agentId: resolveSessionAgentId({
        sessionKey: options?.agentSessionKey,
        config: options?.config,
      }),
      sessionKey: options?.agentSessionKey,
      messageChannel: options?.agentChannel,
      agentAccountId: options?.agentAccountId,
      sandboxed: options?.sandboxed,
    },
    existingToolNames: new Set(tools.map((tool) => tool.name)),
    toolAllowlist: options?.pluginToolAllowlist,
  });

  return [...tools, ...pluginTools];
}
