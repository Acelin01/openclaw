export interface Agent {
  id: string;
  name: string;
  description?: string;
  color?: string;
  prompt: string;
  mermaid: string;
  isCallableByOthers: boolean;
  identifier?: string;
  avatar?: string;
  whenToCall?: string;
  selectedTools?: any;
  userId?: string;
  departmentId?: string;
  createdAt: string;
  updatedAt: string;
  skills?: Agent[];
  skillOf?: Agent[];
  mcpTools?: MCPTool[];
}

export interface MCPTool {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  publisher?: string;
  skills?: string[];
  config?: any;
  rating: number;
  isBuiltIn: boolean;
  creatorId?: string;
  creator?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  agents?: Agent[];
  relatedTools?: MCPTool[];
  toolOf?: MCPTool[];
  createdAt: string;
  updatedAt: string;
}

export interface AIApp {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  status: "DRAFT" | "PUBLISHED";
  type: "PROJECT" | "TOOL";
  config?: any;
  agents?: Agent[];
  mcpTools?: MCPTool[];
  createdAt: string;
  updatedAt: string;
}

export type AgentStatus = "idle" | "busy" | "error";
