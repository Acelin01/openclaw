import { MCPTool as MCPToolType, AIApp as AIAppType, Agent as AgentType } from "@uxin/mcp";

export type MCPTool = MCPToolType;
export type AIApp = AIAppType;
export type Agent = AgentType;

export type AgentStatus = "idle" | "busy" | "error";
