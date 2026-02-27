import { ToolRegistry, UserRole } from "@uxin/mcp/server";
import { tool } from "ai";
import { 
  projectCollaborationMCPTools, 
  businessSupportMCPTools, 
  technicalAnalysisMCPTools, 
  orchestrationMCPTools 
} from "./mcp-tools";

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
  console.log(`Registering tool: ${name}`);
  const parameters = aiTool.parameters || aiTool.inputSchema;
  console.log(`[Registry Debug] Registering tool ${name} with parameters:`, !!parameters);
  
  let rawTool = aiTool;
  if (aiTool.execute && aiTool.parameters && !aiTool.inputSchema) {
    const toolConfig: any = {
      description: aiTool.description,
      inputSchema: aiTool.parameters,
      execute: aiTool.execute
    };
    rawTool = tool(toolConfig);
  }

  toolRegistry.register({
    name,
    description: aiTool.description,
    parameters: parameters,
    handler: aiTool.execute,
    capabilities,
    requiredRole: UserRole.PROJECT_MANAGER,
    rawTool: rawTool
  });
}

// 注册项目协作 MCP 工具
Object.entries(projectCollaborationMCPTools).forEach(([name, tool]) => {
  registerTool(name, tool, ['project-collaboration', 'mcp', name]);
});

// 注册业务支持 MCP 工具
Object.entries(businessSupportMCPTools).forEach(([name, tool]) => {
  registerTool(name, tool, ['business-support', 'mcp', name]);
});

// 注册技术分析 MCP 工具
Object.entries(technicalAnalysisMCPTools).forEach(([name, tool]) => {
  registerTool(name, tool, ['technical-analysis', 'mcp', name]);
});

// 注册编排 MCP 工具
Object.entries(orchestrationMCPTools).forEach(([name, tool]) => {
  registerTool(name, tool, ['orchestration', 'mcp', name]);
});

/**
 * 获取所有已注册工具的 AI SDK 兼容格式对象
 * 方便在 streamText 的 tools 属性中使用
 */
export function getRegisteredTools() {
  const tools: Record<string, any> = {};
  
  toolRegistry.getAllTools().forEach(tool => {
    console.log(`Getting registered tool: ${tool.name}, has parameters: ${!!tool.parameters}`);
    
    // 如果有原始工具对象，直接使用它
    if (tool.rawTool) {
      console.log(`[Registry Debug] Using rawTool for ${tool.name}`);
      // 检查 rawTool.parameters 的类型
      if (tool.rawTool.parameters && typeof tool.rawTool.parameters === 'object') {
        console.log(`[Registry Debug] rawTool.parameters for ${tool.name} type:`, typeof tool.rawTool.parameters);
        // 如果是 Zod 模式，尝试打印它的描述（如果是 ZodSchema，会有 _def 属性）
        if ((tool.rawTool.parameters as any)._def) {
          console.log(`[Registry Debug] rawTool.parameters for ${tool.name} is ZodSchema`);
        }
      }
      tools[tool.name] = tool.rawTool;
    } else {
      console.log(`[Registry Debug] Constructing tool object for ${tool.name}`);
      tools[tool.name] = {
        description: tool.description,
        parameters: tool.parameters,
        execute: tool.handler
      };
    }
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
