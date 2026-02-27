import { Button } from "@uxin/ui";
import {
  X,
  Clock,
  MessageSquare,
  History,
  ChevronDown,
  ChevronUp,
  Edit2,
  User as UserIcon,
  Calendar,
  Flag,
  Layout,
  Link as LinkIcon,
  CheckCircle2,
  MoreHorizontal,
  AlignLeft,
  BarChart2,
} from "lucide-react";
import React, { useState } from "react";
import { ProjectTask, TaskStatus, TaskPriority } from "../types";
import { cn } from "./shared-ui";

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: ProjectTask | null;
  onUpdate?: (id: string, updates: Partial<ProjectTask>) => Promise<void>;
  members?: any[];
  iterations?: any[];
  requirements?: any[];
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  task,
  onUpdate,
  members = [],
  iterations = [],
  requirements = [],
}) => {
  const [activeTab, setActiveTab] = useState<"activity" | "comments" | "history">("activity");
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(true);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState(task?.description || "");

  if (!isOpen || !task) return null;

  const getStatusColor = (status?: string) => {
    switch (status) {
      case TaskStatus.PENDING:
        return "bg-zinc-100 text-zinc-700 border-zinc-200";
      case TaskStatus.IN_PROGRESS:
        return "bg-blue-100 text-blue-700 border-blue-200";
      case TaskStatus.COMPLETED:
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default:
        return "bg-zinc-100 text-zinc-700 border-zinc-200";
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return "text-rose-600 bg-rose-50";
      case TaskPriority.MEDIUM:
        return "text-amber-600 bg-amber-50";
      case TaskPriority.LOW:
        return "text-emerald-600 bg-emerald-50";
      default:
        return "text-zinc-600 bg-zinc-50";
    }
  };

  const handleUpdateDescription = async () => {
    if (onUpdate && task) {
      await onUpdate(task.id, { description });
      setIsEditingDescription(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Layout className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-bold rounded border border-blue-100">
                #{task.id.slice(0, 8)}
              </span>
              <h2 className="text-lg font-bold text-zinc-900 line-clamp-1">{task.title}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-zinc-600"
            >
              <MoreHorizontal className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6 border-r border-zinc-100">
            <div className="space-y-8">
              {/* Requirement Association */}
              {task.requirementId && (
                <div className="flex items-center gap-2 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                  <LinkIcon className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                    关联需求:
                  </span>
                  <span className="text-sm font-medium text-blue-700">
                    {requirements.find((r) => r.id === task.requirementId)?.title || "未知需求"}
                  </span>
                </div>
              )}

              {/* Description Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                    <AlignLeft className="w-4 h-4 text-zinc-400" />
                    描述
                  </h3>
                  {!isEditingDescription && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingDescription(true)}
                      className="text-xs text-blue-600 hover:text-blue-700 h-7 px-2"
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1" />
                      编辑
                    </Button>
                  )}
                </div>

                {isEditingDescription ? (
                  <div className="space-y-3">
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full min-h-[200px] p-3 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="描述任务的详细内容、目标、验收标准等..."
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditingDescription(false)}
                      >
                        取消
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleUpdateDescription}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        保存
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div
                      className={cn(
                        "text-sm text-zinc-600 leading-relaxed whitespace-pre-wrap transition-all duration-300 overflow-hidden",
                        !isDescriptionExpanded && "max-h-[200px] mask-gradient",
                      )}
                    >
                      {task.description || "暂无描述"}
                    </div>
                    {task.description && task.description.length > 300 && (
                      <button
                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                        className="w-full mt-2 py-1 flex items-center justify-center text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        {isDescriptionExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4 mr-1" /> 收起
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 mr-1" /> 展开更多
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Tabs Section */}
              <div className="space-y-4">
                <div className="flex border-b border-zinc-100">
                  <button
                    onClick={() => setActiveTab("activity")}
                    className={cn(
                      "px-4 py-3 text-sm font-medium transition-all relative",
                      activeTab === "activity"
                        ? "text-blue-600"
                        : "text-zinc-500 hover:text-zinc-700",
                    )}
                  >
                    活动
                    {activeTab === "activity" && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("comments")}
                    className={cn(
                      "px-4 py-3 text-sm font-medium transition-all relative",
                      activeTab === "comments"
                        ? "text-blue-600"
                        : "text-zinc-500 hover:text-zinc-700",
                    )}
                  >
                    评论
                    {activeTab === "comments" && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("history")}
                    className={cn(
                      "px-4 py-3 text-sm font-medium transition-all relative",
                      activeTab === "history"
                        ? "text-blue-600"
                        : "text-zinc-500 hover:text-zinc-700",
                    )}
                  >
                    历史记录
                    {activeTab === "history" && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                    )}
                  </button>
                </div>

                <div className="py-4">
                  {activeTab === "activity" && (
                    <div className="space-y-6">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                          <UserIcon className="w-4 h-4 text-zinc-400" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-zinc-900">系统</span>
                            <span className="text-xs text-zinc-400">创建了任务</span>
                            <span className="text-xs text-zinc-400">
                              {new Date(task.createdAt).toLocaleString("zh-CN")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {activeTab === "comments" && (
                    <div className="flex flex-col items-center justify-center py-10 text-zinc-400">
                      <MessageSquare className="w-10 h-10 mb-2 opacity-20" />
                      <p className="text-sm">暂无评论</p>
                    </div>
                  )}
                  {activeTab === "history" && (
                    <div className="flex flex-col items-center justify-center py-10 text-zinc-400">
                      <History className="w-10 h-10 mb-2 opacity-20" />
                      <p className="text-sm">暂无历史记录</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 bg-zinc-50/50 overflow-y-auto p-6 shrink-0 border-l border-zinc-100">
            <div className="space-y-6">
              {/* Status */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  状态
                </label>
                <select
                  className={cn(
                    "w-full px-3 py-1.5 rounded-lg border text-sm font-bold flex items-center justify-center gap-2 cursor-pointer focus:ring-2 focus:ring-offset-1 focus:ring-blue-500/20",
                    getStatusColor(task.status),
                  )}
                  value={task.status}
                  onChange={(e) => onUpdate?.(task.id, { status: e.target.value as TaskStatus })}
                >
                  {Object.values(TaskStatus).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Properties Grid */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <UserIcon className="w-3 h-3" /> 负责人
                  </label>
                  <select
                    className="w-full text-sm font-medium text-zinc-700 bg-transparent border-none focus:ring-0 cursor-pointer hover:bg-zinc-100 rounded px-1 py-1 transition-colors"
                    value={task.assigneeId || ""}
                    onChange={(e) => {
                      const member = members.find(
                        (m) => m.userId === e.target.value || m.agentId === e.target.value,
                      );
                      onUpdate?.(task.id, {
                        assigneeId: e.target.value,
                        assigneeName: member?.user?.name || member?.agent?.name || "Unknown",
                        assigneeAvatar: member?.user?.avatarUrl,
                      });
                    }}
                  >
                    <option value="">未指派</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.userId || member.agentId}>
                        {member.user?.name || member.agent?.name} ({member.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Flag className="w-3.5 h-3.5" /> 优先级
                  </label>
                  <select
                    className={cn(
                      "w-full text-xs font-bold bg-transparent border-none focus:ring-0 cursor-pointer hover:bg-zinc-100 rounded px-1 py-1 transition-colors",
                      getPriorityColor(task.priority),
                    )}
                    value={task.priority}
                    onChange={(e) =>
                      onUpdate?.(task.id, { priority: e.target.value as TaskPriority })
                    }
                  >
                    {Object.values(TaskPriority).map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> 预估工时
                  </label>
                  <input
                    type="number"
                    className="w-full text-sm font-medium text-zinc-700 bg-transparent border-none focus:ring-0 cursor-pointer hover:bg-zinc-100 rounded px-1 py-1 transition-colors"
                    value={task.estimatedHours || 0}
                    onChange={(e) =>
                      onUpdate?.(task.id, { estimatedHours: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <LinkIcon className="w-3 h-3" /> 相关需求
                  </label>
                  <select
                    className="w-full text-sm font-medium text-zinc-700 bg-transparent border-none focus:ring-0 cursor-pointer hover:bg-zinc-100 rounded px-1 py-1 transition-colors"
                    value={task.requirementId || ""}
                    onChange={(e) => onUpdate?.(task.id, { requirementId: e.target.value })}
                  >
                    <option value="">未关联需求</option>
                    {requirements.map((req) => (
                      <option key={req.id} value={req.id}>
                        {req.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Layout className="w-3 h-3" /> 迭代
                  </label>
                  <select
                    className="w-full text-sm font-medium text-zinc-700 bg-transparent border-none focus:ring-0 cursor-pointer hover:bg-zinc-100 rounded px-1 py-1 transition-colors"
                    value={task.iterationId || ""}
                    onChange={(e) => onUpdate?.(task.id, { iterationId: e.target.value })}
                  >
                    <option value="">未关联迭代</option>
                    {iterations.map((iteration) => (
                      <option key={iteration.id} value={iteration.id}>
                        {iteration.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" /> 截止日期
                  </label>
                  <input
                    type="date"
                    className="w-full text-sm font-medium text-zinc-500 bg-transparent border-none focus:ring-0 cursor-pointer hover:bg-zinc-100 rounded px-1 py-1 transition-colors"
                    value={task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""}
                    onChange={(e) =>
                      onUpdate?.(task.id, {
                        dueDate: e.target.value ? new Date(e.target.value) : undefined,
                      })
                    }
                  />
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-3 pt-4 border-t border-zinc-100">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart2 className="w-3 h-3" /> 进度
                  </label>
                  <span className="text-xs font-bold text-zinc-600">{task.progress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  className="w-full h-1.5 bg-zinc-100 rounded-full appearance-none cursor-pointer accent-blue-500"
                  value={task.progress}
                  onChange={(e) => onUpdate?.(task.id, { progress: parseInt(e.target.value) })}
                />
              </div>

              {/* Resolution Info */}
              {task.status === TaskStatus.COMPLETED && (
                <div className="pt-4 border-t border-zinc-100">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">已完成</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
