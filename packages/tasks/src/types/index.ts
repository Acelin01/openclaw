export type TaskPriority = "high" | "medium" | "low";
export type TaskStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "unassigned"
  | "PLANNING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "ON_HOLD";

export interface SubTask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assigneeId?: string;
  assigneeName?: string;
  estimatedHours?: number;
  completedHours?: number;
  dueDate?: Date | string;
}

export interface Task {
  id: string;
  projectId?: string;
  requirementId?: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  assigneeId?: string;
  assigneeName?: string;
  estimatedHours?: number;
  complexity?: string;
  progress: number;
  startDate?: Date | string;
  endDate?: Date | string;
  dueDate?: Date | string;
  subtasks?: SubTask[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  skills?: string[];
  availability?: number; // 0-100
  workload?: number; // Current number of tasks or hours
}

export interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  totalHours: number;
  completionRate: number;
}
