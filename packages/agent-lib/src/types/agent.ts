export interface Agent {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  color?: string;
  prompt: string;
  mermaid: string;
  isCallableByOthers: boolean;
  identifier?: string;
  whenToCall?: string;
  selectedTools?: any;
  projectId?: string;
  requirementId?: string;
  taskId?: string;
  chatId?: string;
  documentId?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  project?: {
    id: string;
    name: string;
  };
}

export interface ProjectTeamMember {
  id: string;
  projectId: string;
  userId?: string;
  agentId?: string;
  role: string;
  joinedAt: Date;
  agent?: Agent;
}
