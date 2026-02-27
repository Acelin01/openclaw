import { clsx, type ClassValue } from "clsx";
import { Calendar, User, Clock, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import React from "react";
import { twMerge } from "tailwind-merge";
import { Task, SubTask, TaskPriority, TaskStatus } from "../types";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
  className?: string;
}

const priorityColors: Record<TaskPriority, string> = {
  high: "bg-red-50 text-red-600 border-red-100",
  medium: "bg-amber-50 text-amber-600 border-amber-100",
  low: "bg-green-50 text-green-600 border-green-100",
};

const statusIcons: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 className="w-4 h-4 text-green-500" />,
  COMPLETED: <CheckCircle2 className="w-4 h-4 text-green-500" />,
  in_progress: <Clock className="w-4 h-4 text-blue-500" />,
  IN_PROGRESS: <Clock className="w-4 h-4 text-blue-500" />,
  not_started: <Circle className="w-4 h-4 text-slate-400" />,
  unassigned: <AlertCircle className="w-4 h-4 text-slate-400" />,
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, className }) => {
  const isCompleted = task.status === "completed" || task.status === "COMPLETED";

  return (
    <div
      onClick={() => onClick?.(task)}
      className={cn(
        "bg-white rounded-xl p-5 mb-5 shadow-sm border-l-4 transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer",
        isCompleted ? "border-green-500 opacity-90" : "border-blue-500",
        className,
      )}
    >
      <div className="flex justify-between items-start mb-3">
        <h3
          className={cn(
            "text-lg font-semibold text-slate-800 flex-1",
            isCompleted && "line-through text-slate-400",
          )}
        >
          {task.title}
        </h3>
        <span
          className={cn(
            "px-3 py-1 rounded-full text-xs font-bold uppercase border",
            priorityColors[task.priority],
          )}
        >
          {task.priority}
        </span>
      </div>

      <p
        className={cn("text-slate-600 mb-4 line-clamp-2", isCompleted && "line-through opacity-70")}
      >
        {task.description}
      </p>

      <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-4">
        <div className="flex items-center gap-1.5">
          <User className="w-4 h-4 text-blue-500" />
          <span>{task.assigneeName || "未分配"}</span>
        </div>
        {task.dueDate && (
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>
              {typeof task.dueDate === "string" ? task.dueDate : task.dueDate.toLocaleDateString()}
            </span>
          </div>
        )}
        {task.estimatedHours && (
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>{task.estimatedHours}h</span>
          </div>
        )}
      </div>

      {task.subtasks && task.subtasks.length > 0 && (
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex flex-col gap-3 mt-4">
            {task.subtasks.map((subtask) => (
              <div
                key={subtask.id}
                className={cn(
                  "flex items-center p-3.5 bg-slate-50 rounded-lg border-l-4 border-slate-400 transition-all hover:bg-blue-50 hover:translate-x-1",
                  (subtask.status === "completed" || subtask.status === "COMPLETED") &&
                    "bg-green-50 border-green-500",
                )}
              >
                <div className="mr-3">{statusIcons[subtask.status] || statusIcons.not_started}</div>
                <div className="flex-1">
                  <div className="font-semibold text-sm text-slate-800">{subtask.title}</div>
                  <div className="flex gap-4 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" /> {subtask.assigneeName || "未分配"}
                    </span>
                    {subtask.estimatedHours && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {subtask.estimatedHours}h
                      </span>
                    )}
                  </div>
                </div>
                <div
                  className={cn(
                    "px-2 py-1 rounded text-[10px] font-bold uppercase",
                    subtask.status === "completed" || subtask.status === "COMPLETED"
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-200 text-slate-700",
                  )}
                >
                  {subtask.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
