export enum IterationStatus {
  PLANNING = "PLANNING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  ARCHIVED = "ARCHIVED",
}

export interface IterationWorkItem {
  id: string;
  title: string;
  status: string;
  type: "requirement" | "task" | "defect" | "Requirement" | "Task" | "Defect" | "Bug"; // Allow variations for now
  priority?: string;
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  estimatedHours?: number;
  actualHours?: number;

  // For Tree View
  parentId?: string;

  // For Gantt View
  startDate?: string | Date;
  endDate?: string | Date;
}

export interface Iteration {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  goals?: string[]; // 新增：迭代目标
  status: IterationStatus;
  startDate: string | Date;
  endDate: string | Date;
  ownerId?: string;
  owner?: {
    id: string;
    name: string;
    avatar?: string;
  };
  estimatedHours?: number;
  actualHours?: number;
  progress?: number;

  // Relations
  workItems?: IterationWorkItem[];
  requirements?: IterationWorkItem[];
  tasks?: IterationWorkItem[];
  defects?: IterationWorkItem[];
  comments?: IterationComment[];
  activities?: IterationActivity[];

  _count?: {
    requirements: number;
    tasks: number;
    defects: number;
  };

  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IterationComment {
  id: string;
  content: string;
  userId: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string | Date;
  replies?: IterationComment[];
}

export interface IterationActivity {
  id: string;
  action: string;
  content?: string;
  userId: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string | Date;
}
