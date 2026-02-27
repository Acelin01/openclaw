"use client";

import { Button } from "@uxin/ui";
import { Check, Clock, User, AlertCircle, Link as LinkIcon } from "lucide-react";
import React, { useState } from "react";
import { ProjectTask, TaskPriority, TaskStatus, ProjectRequirement } from "../types";
import { Badge, cn } from "./shared-ui";

interface TaskListProps {
  tasks: ProjectTask[];
  requirements?: ProjectRequirement[];
  onTaskClick?: (task: ProjectTask) => void;
  onToggleTask?: (task: ProjectTask) => void;
  onCreateTask?: () => void;
  className?: string;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  requirements = [],
  onTaskClick,
  onToggleTask,
  onCreateTask,
  className,
}) => {
  const [activeFilter, setActiveFilter] = useState<TaskStatus | "ALL">("ALL");

  const filteredTasks =
    activeFilter === "ALL" ? tasks : tasks.filter((task) => task.status === activeFilter);

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.PENDING:
        return "待处理";
      case TaskStatus.IN_PROGRESS:
        return "进行中";
      case TaskStatus.COMPLETED:
        return "已完成";
      default:
        return status;
    }
  };

  const getPriorityVariant = (priority?: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return "high";
      case TaskPriority.MEDIUM:
        return "medium";
      case TaskPriority.LOW:
        return "low";
      default:
        return "default";
    }
  };

  return (
    <div
      className={cn(
        "bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden",
        className,
      )}
    >
      <div className="px-6 py-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 tracking-tight">任务清单</h3>
          <p className="text-xs text-zinc-500 mt-0.5">跟踪项目里程碑下的具体执行任务</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex bg-zinc-100 p-1 rounded-xl mr-2">
            {(["ALL", ...Object.values(TaskStatus)] as const).map((status) => (
              <Button
                key={status}
                variant="ghost"
                onClick={() => setActiveFilter(status)}
                className={cn(
                  "text-[10px] px-3 py-1.5 rounded-lg font-bold transition-all h-auto border-none",
                  activeFilter === status
                    ? "bg-white text-emerald-600 shadow-sm hover:bg-white"
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50",
                )}
              >
                {status === "ALL" ? "全部" : getStatusLabel(status as TaskStatus)}
              </Button>
            ))}
          </div>
          <Button
            onClick={onCreateTask}
            className="text-xs px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/10 active:scale-95 border-none h-auto"
          >
            + 分配新任务
          </Button>
        </div>
      </div>
      <div className="p-3">
        {filteredTasks.length > 0 ? (
          <div className="space-y-1">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center p-4 hover:bg-zinc-50 rounded-2xl transition-all group cursor-pointer border border-transparent hover:border-zinc-100"
                onClick={() => onTaskClick?.(task)}
              >
                <div
                  className={cn(
                    "w-6 h-6 border-2 rounded-lg flex items-center justify-center mr-4 transition-all duration-300",
                    task.status === TaskStatus.COMPLETED
                      ? "bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/20"
                      : "border-zinc-300 bg-white group-hover:border-emerald-500",
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleTask?.(task);
                  }}
                >
                  {task.status === TaskStatus.COMPLETED && (
                    <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                  )}
                </div>

                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center gap-3 mb-1">
                    <span
                      className={cn(
                        "text-[15px] font-bold transition-all",
                        task.status === TaskStatus.COMPLETED
                          ? "text-zinc-400 line-through"
                          : "text-zinc-800",
                      )}
                    >
                      {task.title}
                    </span>
                    <Badge variant={getPriorityVariant(task.priority)}>
                      {task.priority || "MEDIUM"}
                    </Badge>
                  </div>
                  {task.description && (
                    <p className="text-xs text-zinc-500 truncate mb-2 leading-relaxed">
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center text-[11px] font-medium text-zinc-400">
                      <Clock className="w-3.5 h-3.5 mr-1.5" />
                      <span>
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString("zh-CN")
                          : "未设置截止日期"}
                      </span>
                    </div>
                    {task.status && (
                      <div className="flex items-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        • {task.status}
                      </div>
                    )}
                    {task.requirementId && (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        <LinkIcon className="w-3 h-3" />
                        <span className="truncate max-w-[120px]">
                          {requirements.find((r) => r.id === task.requirementId)?.title ||
                            "未知需求"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {task.assigneeName && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100/50 rounded-xl border border-zinc-100 group-hover:bg-white group-hover:shadow-sm transition-all">
                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                        {task.assigneeName[0]}
                      </div>
                      <span className="text-xs font-bold text-zinc-600">{task.assigneeName}</span>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-zinc-300 hover:text-zinc-600 transition-colors opacity-0 group-hover:opacity-100 border-none"
                  >
                    <AlertCircle className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-zinc-200" />
            </div>
            <p className="text-zinc-400 font-medium">暂无待办任务</p>
          </div>
        )}
      </div>
    </div>
  );
};
