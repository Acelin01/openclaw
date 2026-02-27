import { UserRole, ToolRegistry } from "@uxin/mcp";
import { projectCollaborationMCPTools, freelancerMCPTools, agentCollaborationMCPTools } from "./mcp-tools";

/**
 * aiChat 全局工具注册表，用于管理和路由 MCP 工具
 */
export const toolRegistry = new ToolRegistry();

/**
 * 将 AI SDK 格式的工具注册到 ToolRegistry 中
 * @param name 工具名称
 * @param aiTool AI SDK 格式的工具对象
 * @param capabilities 工具具备的能力标签
 */
function registerTool(name: string, aiTool: any, capabilities: string[] = []) {
  toolRegistry.register({
    name,
    description: aiTool.description,
    parameters: aiTool.inputSchema,
    handler: aiTool.execute,
    capabilities,
    requiredRole: UserRole.PROJECT_MANAGER, // 默认需要项目经理或以上权限
  });
}

// 注册项目协作 MCP 工具
Object.entries(projectCollaborationMCPTools).forEach(([name, tool]) => {
  registerTool(name, tool, ['project-collaboration', 'mcp', name]);
});

// 注册自由职业者服务 MCP 工具
Object.entries(freelancerMCPTools).forEach(([name, tool]) => {
  registerTool(name, tool, ['freelancer', 'mcp', name]);
});

Object.entries(agentCollaborationMCPTools).forEach(([name, tool]) => {
  registerTool(name, tool, ['agent-collaboration', 'mcp', name]);
});

/**
 * 获取所有已注册工具的 AI SDK 兼容格式对象
 * 方便在 streamText 的 tools 属性中使用
 */
export function getRegisteredTools() {
  const tools: Record<string, any> = {};
  
  toolRegistry.getAllTools().forEach(tool => {
    tools[tool.name] = {
      description: tool.description,
      parameters: tool.parameters,
      execute: tool.handler
    };
  });
  
  return tools;
}

/**
 * 根据能力标签获取工具集
 * @param capability 能力标签
 */
export function getToolsByCapability(capability: string) {
  const tools: Record<string, any> = {};
  
  toolRegistry.getAllTools().forEach(tool => {
    if (tool.capabilities?.includes(capability)) {
      tools[tool.name] = {
        description: tool.description,
        parameters: tool.parameters,
        execute: tool.handler
      };
    }
  });
  
  return tools;
}
