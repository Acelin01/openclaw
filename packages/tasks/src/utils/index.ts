import { TaskStatus, TaskPriority } from "../types";

export const getStatusColor = (status: TaskStatus | string) => {
  switch (status.toLowerCase()) {
    case "completed":
    case "done":
      return "text-green-600 bg-green-50 border-green-200";
    case "in_progress":
    case "doing":
      return "text-blue-600 bg-blue-50 border-blue-200";
    case "todo":
    case "pending":
      return "text-gray-600 bg-gray-50 border-gray-200";
    case "blocked":
      return "text-red-600 bg-red-50 border-red-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
};

export const getPriorityColor = (priority: TaskPriority | string) => {
  switch (priority.toLowerCase()) {
    case "high":
    case "urgent":
      return "text-red-600 bg-red-50";
    case "medium":
      return "text-orange-600 bg-orange-50";
    case "low":
      return "text-blue-600 bg-blue-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
};

export const formatProgress = (progress: number) => {
  return `${Math.min(100, Math.max(0, progress))}%`;
};
