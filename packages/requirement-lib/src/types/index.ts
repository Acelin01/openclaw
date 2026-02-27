export enum RequirementPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export enum RequirementStatus {
  DRAFT = "DRAFT",
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  REVIEW = "REVIEW",
  DONE = "DONE",
  CANCELLED = "CANCELLED",
}

export enum RequirementType {
  FEATURE = "FEATURE",
  BUG = "BUG",
  TASK = "TASK",
  SUB_TASK = "SUB_TASK",
  IMPROVEMENT = "IMPROVEMENT",
}

export enum RequirementWorkType {
  DEVELOPMENT = "DEVELOPMENT",
  DESIGN = "DESIGN",
  TESTING = "TESTING",
  DOCUMENTATION = "DOCUMENTATION",
  MEETING = "MEETING",
  OTHER = "OTHER",
}

export interface RequirementSubItem {
  id: string;
  title: string;
  description?: string;
  status: string;
  requirementId: string;
  createdAt: string;
  updatedAt: string;
}

export interface RequirementActivity {
  id: string;
  action: string;
  details?: any;
  userId: string;
  user?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  createdAt: string;
}

export interface RequirementReview {
  id: string;
  rating: number;
  comment?: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  createdAt: string;
}

export interface RequirementLink {
  id: string;
  targetType: string;
  targetId?: string;
  description?: string;
  url?: string;
  createdAt: string;
}

export interface RequirementWorkLog {
  id: string;
  hours: number;
  description?: string;
  date: string;
  type: RequirementWorkType;
  userId: string;
  user?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  createdAt: string;
}

export interface ProjectRequirement {
  id: string;
  title: string;
  description?: string;
  priority: RequirementPriority;
  status: RequirementStatus;
  type: RequirementType;
  projectId: string;
  creatorId?: string;
  assigneeId?: string;
  assignee?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  subItems?: RequirementSubItem[];
  activities?: RequirementActivity[];
  reviews?: RequirementReview[];
  links?: RequirementLink[];
  workLogs?: RequirementWorkLog[];
  createdAt: string;
  updatedAt: string;
}

export interface RequirementStats {
  counts: {
    subItems: number;
    tasks: number;
    activities: number;
    reviews: number;
    links: number;
    workLogs: number;
  };
  totalHours: number;
  subItemProgress: number;
  linkStats: Record<string, number>;
}
