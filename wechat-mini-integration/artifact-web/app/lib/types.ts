export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export interface ProjectTask {
  id: string;
  description: string;
  status: TaskStatus;
}

export interface ProjectRequirement {
  id: string;
  content: string;
}

export interface ProjectData {
  requirements: ProjectRequirement[];
  tasks: ProjectTask[];
}
