import type { Iteration } from "@uxin/iteration-lib";

export interface Project {
  id: string;
  userId: string;
  name: string;
  avatarUrl?: string;
  description: string;
  tags?: string[];
  status?: ProjectStatus;
  location?: string;
  budgetMin?: number;
  budgetMax?: number;
  progress: number;
  memberCount: number;
  startDate?: Date;
  endDate?: Date;
  dueDate?: Date;
  documents?: any[];
  createdAt: Date;
  updatedAt: Date;

  // Relations
  requirements?: ProjectRequirement[];
  tasks?: ProjectTask[];
  risks?: ProjectRisk[];
  defects?: ProjectDefect[];
  milestones?: ProjectMilestone[];
  conversations?: any[];
  schedules?: any[];
  projectDocuments?: any[];
  positions?: any[];
  transactions?: any[];
  members?: ProjectTeamMember[];
  milestonesList?: any[];
  activities?: any[];
  approvals?: any[];
  financials?: any[];
  qna?: any[];
  financialReports?: any[];

  // Admin Config
  isAdminEnabled?: boolean;
  adminToken?: string;
  adminConfigs?: Array<{
    id: string;
    name: string;
    url: string;
    token?: string;
    schema?: any;
    status?: "idle" | "pending" | "generating" | "ready" | "error";
  }>;

  // Iterations
  iterations?: Iteration[];
}

export interface ProjectRequirement {
  id: string;
  projectId?: string;
  iterationId?: string;
  title: string;
  description?: string;
  priority?: RequirementPriority;
  status?: RequirementStatus;
  type?: "project" | "independent";
  assigneeId?: string;
  assigneeName?: string;
  assigneeAvatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectTask {
  id: string;
  projectId?: string;
  requirementId?: string;
  iterationId?: string;
  assigneeId?: string;
  assigneeName?: string;
  assigneeAvatar?: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  progress: number;
  estimatedHours?: number;
  startDate?: Date;
  endDate?: Date;
  dueDate?: Date;
  subtasks?: any[];
  createdAt: Date;
  updatedAt: Date;
}

export enum ProjectStatus {
  PLANNING = "规划中",
  IN_PROGRESS = "进行中",
  REVIEW = "评审中",
  COMPLETED = "已完成",
  ON_HOLD = "暂停",
  CANCELLED = "已取消",
}

export interface ProjectTeamMember {
  id: string;
  projectId: string;
  userId?: string;
  agentId?: string;
  role: string;
  joinedAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  agent?: {
    id: string;
    name: string;
    identifier?: string;
    prompt?: string;
    mermaid?: string;
  };
}

export enum RequirementPriority {
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
}

export enum RequirementStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

export enum TaskPriority {
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
}

export enum TaskStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

export interface ProjectRisk {
  id: string;
  projectId: string;
  requirementId?: string;
  title: string;
  description?: string;
  level: RiskLevel;
  status: RiskStatus;
  ownerId?: string;
  probability: RiskProbability;
  impact: RiskImpact;
  mitigationPlan?: string;
  createdAt: Date;
  updatedAt: Date;
  owner?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

export enum RiskLevel {
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
}

export enum RiskStatus {
  OPEN = "OPEN",
  MITIGATED = "MITIGATED",
  CLOSED = "CLOSED",
}

export enum RiskProbability {
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
}

export enum RiskImpact {
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
}

export interface ProjectDefect {
  id: string;
  projectId: string;
  iterationId?: string;
  requirementId?: string;
  title: string;
  description?: string;
  status: DefectStatus;
  severity: DefectSeverity;
  priority: DefectPriority;
  reporterId?: string;
  assigneeId?: string;
  createdAt: Date;
  updatedAt: Date;
  reporter?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  assignee?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

export enum DefectStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
  REJECTED = "REJECTED",
}

export enum DefectSeverity {
  CRITICAL = "CRITICAL",
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
}

export enum DefectPriority {
  IMMEDIATE = "IMMEDIATE",
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  dueDate?: Date;
  status: MilestoneStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum MilestoneStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  DELAYED = "DELAYED",
}
