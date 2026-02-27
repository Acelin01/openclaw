"use client";

import { Badge } from "@uxin/ui";
import {
  CheckCircle2,
  Circle,
  Clock,
  ListTodo,
  ChevronDown,
  ChevronUp,
  Eye,
  Play,
  MoreHorizontal,
} from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";

interface Task {
  id: string;
  title: string;
  status: "pending" | "in_progress" | "completed" | "进行中" | "已完成" | "active" | string;
  priority: "low" | "medium" | "high" | string;
  description?: string;
  assignee?: string;
  risk?: string;
  estimatedHours?: number | string;
  dueDate?: string;
}

interface TaskListProps {
  tasks: Task[];
  title?: string;
  onViewTask?: (task: Task) => void;
  onExecuteTask?: (task: Task) => void;
}

export function TaskList({
  tasks = [],
  title = "任务分解",
  onViewTask,
  onExecuteTask,
}: TaskListProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const formatPriority = (priority?: string) => {
    const p = String(priority || "").toLowerCase();
    if (p === "high" || p === "h") return "高";
    if (p === "low" || p === "l") return "低";
    if (p === "medium" || p === "m") return "中";
    return priority || "未设置";
  };

  const formatStatus = (status?: string) => {
    const s = String(status || "").toLowerCase();
    if (s === "completed" || s === "done" || s === "已完成" || s === "finished") return "已完成";
    if (s === "in_progress" || s === "processing" || s === "进行中" || s === "active")
      return "进行中";
    if (s === "failed" || s === "失败" || s === "cancelled") return "失败";
    if (s === "pending" || s === "to_do" || s === "待处理") return "待处理";
    return status || "待处理";
  };

  if (!tasks || !Array.isArray(tasks)) {
    return null;
  }

  // Filter out invalid tasks to prevent crashes
  const validTasks = tasks.filter((t) => t && typeof t === "object");

  const completedCount = validTasks.filter((t) => {
    const s = String(t.status || "").toLowerCase();
    return s === "completed" || s === "done" || s === "已完成" || s === "finished";
  }).length;

  const totalCount = validTasks.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="tasklist-message self-start max-w-[85%] mb-3 bg-white rounded-[10px] border border-[#edf2f7] shadow-[0_2px_8px_rgba(0,0,0,0.05)] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
      <div
        className="tasklist-header flex items-center justify-between p-[12px_16px] bg-[#f8fafc] border-b border-[#e2e8f0] cursor-pointer transition-colors hover:bg-[#f1f5f9]"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="tasklist-header-left flex items-center gap-[10px]">
          <div className="tasklist-icon w-8 h-8 rounded-lg bg-[#f0fff4] text-[#19be6b] flex items-center justify-center text-sm border border-[#c6f6d5]">
            <ListTodo size={16} />
          </div>
          <span className="tasklist-title text-sm font-semibold text-[#2d3748]">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="tasklist-progress text-xs text-[#718096] bg-[#edf2f7] px-2 py-0.5 rounded-full">
            完成度 {progress}%
          </span>
          <div
            className={cn(
              "tasklist-toggle text-[#a0aec0] transition-transform duration-300",
              !isExpanded && "rotate-180",
            )}
          >
            <ChevronUp size={14} />
          </div>
        </div>
      </div>

      <div
        className={cn(
          "tasklist-content transition-all duration-500 ease-in-out bg-white overflow-hidden",
          isExpanded ? "p-[18px] max-h-none" : "p-0 max-h-0",
        )}
      >
        <div className="task-list flex flex-col gap-3">
          {validTasks.map((task, index) => {
            const s = String(task.status || "").toLowerCase();
            const isCompleted =
              s === "completed" || s === "done" || s === "已完成" || s === "finished";
            const isInProgress =
              s === "in_progress" || s === "processing" || s === "进行中" || s === "active";
            const isPending = s === "pending" || s === "to_do" || s === "待处理";
            const isFailed = s === "failed" || s === "失败" || s === "cancelled";

            return (
              <div
                key={task.id || index}
                className={cn(
                  "task-item flex items-start p-[14px] bg-white rounded-lg border border-[#e2e8f0] transition-all hover:bg-[#f8fafc] hover:border-[#cbd5e0]",
                  isCompleted && "bg-[#f0fff4] border-[#c6f6d5]",
                  isInProgress && "bg-[#f0f9ff] border-[#bee3f8]",
                  isPending && "bg-[#fff4e6] border-[#fed7aa]",
                  isFailed && "bg-[#fee] border-[#fed7d7]",
                )}
              >
                <div
                  className={cn(
                    "task-status w-5 h-5 rounded-[4px] mr-3 flex items-center justify-center shrink-0 mt-[2px]",
                    isCompleted && "bg-[#19be6b] text-white text-[10px]",
                    isInProgress && "border-2 border-[#2d8cf0] text-[#2d8cf0] text-[10px]",
                    isPending && "bg-[#f1f5f9] border-2 border-[#cbd5e0]",
                    isFailed && "bg-[#ed4014] text-white text-[10px]",
                  )}
                >
                  {isCompleted && <CheckCircle2 size={12} />}
                  {isInProgress && <Clock size={12} className="animate-pulse" />}
                  {isFailed && <Circle size={12} />}
                </div>

                <div className="task-info flex-1">
                  <div
                    className={cn(
                      "task-name text-[13px] font-semibold text-[#2d3748] mb-1.5",
                      isCompleted && "text-[#2d3748]",
                    )}
                  >
                    {task.title}
                  </div>
                  <div className="flex flex-wrap gap-1 text-[10px] text-[#718096]">
                    <Badge variant="secondary">状态: {formatStatus(task.status)}</Badge>
                    <Badge variant="secondary">优先级: {formatPriority(task.priority)}</Badge>
                    <Badge variant="secondary">风险: {task.risk || "未设置"}</Badge>
                    <Badge variant="secondary">预估工时: {task.estimatedHours ?? "未设置"}</Badge>
                  </div>
                  {task.description && (
                    <div className="task-description text-xs text-[#718096] leading-[1.4]">
                      {task.description}
                    </div>
                  )}
                  {task.assignee && (
                    <div className="mt-1 text-[10px] text-[#718096]">负责人: {task.assignee}</div>
                  )}
                </div>

                <div className="task-actions flex gap-1.5 ml-2.5 shrink-0">
                  <button
                    onClick={() => onViewTask?.(task)}
                    className="task-action-btn w-7 h-7 rounded-md bg-white border border-[#e2e8f0] flex items-center justify-center text-[#718096] hover:bg-[#f7fafc] hover:text-[#4a5568] transition-all"
                  >
                    <Eye size={12} />
                  </button>
                  <button
                    onClick={() => onExecuteTask?.(task)}
                    className="task-action-btn w-7 h-7 rounded-md bg-white border border-[#e2e8f0] flex items-center justify-center text-[#718096] hover:bg-[#f7fafc] hover:text-[#4a5568] transition-all"
                  >
                    <Play size={12} />
                  </button>
                  <button className="task-action-btn w-7 h-7 rounded-md bg-white border border-[#e2e8f0] flex items-center justify-center text-[#718096] hover:bg-[#f7fafc] hover:text-[#4a5568] transition-all">
                    <MoreHorizontal size={12} />
                  </button>
                </div>
              </div>
            );
          })}
          {tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-[#a0aec0] opacity-60">
              <ListTodo size={32} className="mb-2 opacity-20" />
              <p className="text-xs">暂无任务</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
