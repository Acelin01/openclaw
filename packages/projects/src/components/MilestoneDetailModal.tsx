import { Button } from "@uxin/ui";
import {
  X,
  Clock,
  MessageSquare,
  History,
  ChevronDown,
  ChevronUp,
  Edit2,
  Calendar,
  Flag,
  MoreHorizontal,
  AlignLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import React, { useState } from "react";
import { ProjectMilestone, MilestoneStatus } from "../types";
import { cn } from "./shared-ui";

interface MilestoneDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestone: ProjectMilestone | null;
  onUpdate?: (id: string, updates: Partial<ProjectMilestone>) => Promise<void>;
}

export const MilestoneDetailModal: React.FC<MilestoneDetailModalProps> = ({
  isOpen,
  onClose,
  milestone,
  onUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<"activity" | "comments" | "history">("activity");
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(true);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState(milestone?.description || "");

  if (!isOpen || !milestone) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case MilestoneStatus.PENDING:
        return "bg-blue-100 text-blue-700 border-blue-200";
      case MilestoneStatus.COMPLETED:
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case MilestoneStatus.DELAYED:
        return "bg-rose-100 text-rose-700 border-rose-200";
      default:
        return "bg-zinc-100 text-zinc-700 border-zinc-200";
    }
  };

  const handleUpdateDescription = async () => {
    if (onUpdate && milestone) {
      await onUpdate(milestone.id, { description });
      setIsEditingDescription(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <Flag className="w-5 h-5 text-amber-500" />
            </div>
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-xs font-bold rounded border border-amber-100">
                MS-{milestone.id.slice(0, 6).toUpperCase()}
              </span>
              <h2 className="text-lg font-bold text-zinc-900 line-clamp-1">{milestone.title}</h2>
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
              {/* Description Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                    <AlignLeft className="w-4 h-4 text-zinc-400" />
                    里程碑描述
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
                      className="w-full min-h-[300px] p-4 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                      placeholder="详述里程碑的目标、关键产出及验收标准..."
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
                        className="bg-amber-500 hover:bg-amber-600 text-white"
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
                        !isDescriptionExpanded && "max-h-[300px] mask-gradient",
                      )}
                    >
                      {milestone.description || "暂无详细描述"}
                    </div>
                    {milestone.description && milestone.description.length > 500 && (
                      <button
                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                        className="w-full mt-2 py-1 flex items-center justify-center text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors"
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
                        ? "text-amber-600"
                        : "text-zinc-500 hover:text-zinc-700",
                    )}
                  >
                    动态
                    {activeTab === "activity" && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("comments")}
                    className={cn(
                      "px-4 py-3 text-sm font-medium transition-all relative",
                      activeTab === "comments"
                        ? "text-amber-600"
                        : "text-zinc-500 hover:text-zinc-700",
                    )}
                  >
                    讨论
                    {activeTab === "comments" && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("history")}
                    className={cn(
                      "px-4 py-3 text-sm font-medium transition-all relative",
                      activeTab === "history"
                        ? "text-amber-600"
                        : "text-zinc-500 hover:text-zinc-700",
                    )}
                  >
                    修订记录
                    {activeTab === "history" && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
                    )}
                  </button>
                </div>

                <div className="py-4">
                  {activeTab === "activity" && (
                    <div className="space-y-6">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                          <Flag className="w-4 h-4 text-zinc-400" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-zinc-900">系统</span>
                            <span className="text-xs text-zinc-400">设置了该里程碑</span>
                            <span className="text-xs text-zinc-400">
                              {new Date(milestone.createdAt).toLocaleString("zh-CN")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {activeTab === "comments" && (
                    <div className="flex flex-col items-center justify-center py-10 text-zinc-400">
                      <MessageSquare className="w-10 h-10 mb-2 opacity-20" />
                      <p className="text-sm">暂无讨论内容</p>
                    </div>
                  )}
                  {activeTab === "history" && (
                    <div className="flex flex-col items-center justify-center py-10 text-zinc-400">
                      <History className="w-10 h-10 mb-2 opacity-20" />
                      <p className="text-sm">暂无修订记录</p>
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
                  当前状态
                </label>
                <select
                  className={cn(
                    "w-full px-3 py-1.5 rounded-lg border text-sm font-bold flex items-center justify-center gap-2 cursor-pointer focus:ring-2 focus:ring-offset-1 focus:ring-amber-500/20",
                    getStatusColor(milestone.status),
                  )}
                  value={milestone.status}
                  onChange={(e) =>
                    onUpdate?.(milestone.id, { status: e.target.value as MilestoneStatus })
                  }
                >
                  {Object.values(MilestoneStatus).map((status) => (
                    <option key={status} value={status}>
                      {status === MilestoneStatus.COMPLETED
                        ? "已完成"
                        : status === MilestoneStatus.PENDING
                          ? "进行中"
                          : "已延期"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Properties Grid */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> 截止日期
                  </label>
                  <input
                    type="date"
                    className="w-full text-sm font-medium text-zinc-700 bg-transparent border-none focus:ring-0 cursor-pointer hover:bg-zinc-100 rounded px-1 py-1 transition-colors"
                    value={
                      milestone.dueDate
                        ? new Date(milestone.dueDate).toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      onUpdate?.(milestone.id, {
                        dueDate: e.target.value ? new Date(e.target.value) : undefined,
                      })
                    }
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> 创建日期
                  </label>
                  <div className="text-sm font-medium text-zinc-500 px-1">
                    {new Date(milestone.createdAt).toLocaleDateString("zh-CN")}
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-3 pt-4 border-t border-zinc-100">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3" /> 达成进度
                  </label>
                  <span className="text-xs font-bold text-zinc-600">
                    {milestone.status === MilestoneStatus.COMPLETED ? "100%" : "50%"}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-500",
                      milestone.status === MilestoneStatus.COMPLETED
                        ? "bg-emerald-500"
                        : "bg-amber-500",
                    )}
                    style={{
                      width: milestone.status === MilestoneStatus.COMPLETED ? "100%" : "50%",
                    }}
                  />
                </div>
              </div>

              {/* Resolution Info */}
              {milestone.status === MilestoneStatus.COMPLETED && (
                <div className="pt-4 border-t border-zinc-100">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">目标已达成</span>
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
