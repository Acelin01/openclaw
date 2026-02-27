import React from "react";
import { Task } from "../types";
import { TaskCard } from "./TaskCard";

interface TaskListProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  emptyMessage?: string;
  loading?: boolean;
  className?: string;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onTaskClick,
  emptyMessage = "暂无任务",
  loading = false,
  className = "",
}) => {
  if (loading) {
    return (
      <div className={`flex flex-col gap-4 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 text-gray-400 ${className}`}>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onClick={onTaskClick} />
      ))}
    </div>
  );
};
