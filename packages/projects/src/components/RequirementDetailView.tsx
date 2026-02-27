"use client";

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
  FileText,
  Link as LinkIcon,
  CheckCircle2,
  MoreHorizontal,
  AlignLeft,
  BarChart2,
  Target,
} from "lucide-react";
import React, { useState } from "react";
import {
  ProjectRequirement,
  RequirementStatus,
  RequirementPriority,
  ProjectTeamMember,
  ProjectTask,
  TaskStatus,
} from "../types";
import { cn } from "./shared-ui";

export interface RequirementDetailViewProps {
  requirement: ProjectRequirement;
  onClose?: () => void;
  onUpdate?: (id: string, updates: Partial<ProjectRequirement>) => Promise<void>;
  members?: ProjectTeamMember[];
  tasks?: ProjectTask[];
  defects?: any[];
  risks?: any[];
  onTaskClick?: (task: any) => void;
  onDefectClick?: (defect: any) => void;
  onRiskClick?: (risk: any) => void;
  className?: string;
}

export const RequirementDetailView: React.FC<RequirementDetailViewProps> = ({
  requirement,
  onClose,
  onUpdate,
  members = [],
  tasks = [],
  defects = [],
  risks = [],
  onTaskClick,
  onDefectClick,
  onRiskClick,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<"activity" | "comments" | "history">("activity");
  const [expandedSection, setExpandedSection] = useState<"tasks" | "defects" | "risks" | null>(
    null,
  );
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(true);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState(requirement?.description || "");

  const getStatusColor = (status?: string) => {
    switch (status) {
      case RequirementStatus.PENDING:
        return "bg-zinc-100 text-zinc-700 border-zinc-200";
      case RequirementStatus.IN_PROGRESS:
        return "bg-blue-100 text-blue-700 border-blue-200";
      case RequirementStatus.COMPLETED:
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default:
        return "bg-zinc-100 text-zinc-700 border-zinc-200";
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case RequirementPriority.HIGH:
        return "text-rose-600 bg-rose-50";
      case RequirementPriority.MEDIUM:
        return "text-amber-600 bg-amber-50";
      case RequirementPriority.LOW:
        return "text-emerald-600 bg-emerald-50";
      default:
        return "text-zinc-600 bg-zinc-50";
    }
  };

  const handleUpdateDescription = async () => {
    if (onUpdate && requirement) {
      await onUpdate(requirement.id, { description });
      setIsEditingDescription(false);
    }
  };

  const associatedTasks = tasks.filter((t) => t.requirementId === requirement.id);
  const associatedDefects = defects.filter((d) => d.requirementId === requirement.id);
  const associatedRisks = risks.filter((r) => r.requirementId === requirement.id);

  const toggleSection = (section: "tasks" | "defects" | "risks") => {
    setExpandedSection(expandedSection === section ? null : section);
  };
  const completedTasks = associatedTasks.filter((t) => t.status === TaskStatus.COMPLETED);
  const calculatedProgress =
    associatedTasks.length > 0
      ? Math.round((completedTasks.length / associatedTasks.length) * 100)
      : requirement.status === RequirementStatus.COMPLETED
        ? 100
        : 0;

  return (
    <div className={cn("bg-white flex flex-col overflow-hidden h-full", className)}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-xs font-bold rounded border border-emerald-100">
              REQ-{requirement.id.slice(0, 6).toUpperCase()}
            </span>
            <h2 className="text-lg font-bold text-zinc-900 line-clamp-1">{requirement.title}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-600">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 border-r border-zinc-100 custom-scrollbar">
          <div className="space-y-8">
            {/* Description Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <AlignLeft className="w-4 h-4 text-zinc-400" />
                  需求详述
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
                    className="w-full min-h-[300px] p-4 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    placeholder="详述业务背景、功能需求、非功能需求及验收标准..."
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
                      className="bg-emerald-500 hover:bg-emerald-600 text-white"
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
                    {requirement.description || "暂无详细描述"}
                  </div>
                  {requirement.description && requirement.description.length > 500 && (
                    <button
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      className="w-full mt-2 py-1 flex items-center justify-center text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
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

            {/* Related Items Section */}
            <div className="space-y-4 pt-6 border-t border-zinc-100">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-zinc-400" />
                关联项
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div
                  onClick={() => toggleSection("tasks")}
                  className={cn(
                    "p-3 rounded-lg border flex items-center justify-between group cursor-pointer transition-all",
                    expandedSection === "tasks"
                      ? "bg-blue-50 border-blue-200"
                      : "bg-zinc-50 border-zinc-100 hover:bg-white hover:border-blue-200",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 font-bold text-xs">
                      T
                    </div>
                    <span className="text-xs font-medium text-zinc-600">
                      关联任务 ({associatedTasks.length})
                    </span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-zinc-300 group-hover:text-blue-500 transition-transform",
                      expandedSection === "tasks" && "rotate-180",
                    )}
                  />
                </div>
                <div
                  onClick={() => toggleSection("defects")}
                  className={cn(
                    "p-3 rounded-lg border flex items-center justify-between group cursor-pointer transition-all",
                    expandedSection === "defects"
                      ? "bg-rose-50 border-rose-200"
                      : "bg-zinc-50 border-zinc-100 hover:bg-white hover:border-rose-200",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center text-rose-500 font-bold text-xs">
                      D
                    </div>
                    <span className="text-xs font-medium text-zinc-600">
                      关联缺陷 ({associatedDefects.length})
                    </span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-zinc-300 group-hover:text-rose-500 transition-transform",
                      expandedSection === "defects" && "rotate-180",
                    )}
                  />
                </div>
                <div
                  onClick={() => toggleSection("risks")}
                  className={cn(
                    "p-3 rounded-lg border flex items-center justify-between group cursor-pointer transition-all",
                    expandedSection === "risks"
                      ? "bg-amber-50 border-amber-200"
                      : "bg-zinc-50 border-zinc-100 hover:bg-white hover:border-amber-200",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-500 font-bold text-xs">
                      R
                    </div>
                    <span className="text-xs font-medium text-zinc-600">
                      关联风险 ({associatedRisks.length})
                    </span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-zinc-300 group-hover:text-amber-500 transition-transform",
                      expandedSection === "risks" && "rotate-180",
                    )}
                  />
                </div>
              </div>

              {/* Expanded Section List */}
              {expandedSection === "tasks" && (
                <div className="mt-2 space-y-2 animate-in slide-in-from-top-2 duration-200">
                  {associatedTasks.length > 0 ? (
                    associatedTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => onTaskClick?.(task)}
                        className="flex items-center justify-between p-3 bg-white border border-zinc-100 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-zinc-400 bg-zinc-50 px-1.5 py-0.5 rounded">
                            #{task.id.slice(0, 6)}
                          </span>
                          <span className="text-sm text-zinc-700 group-hover:text-blue-600 transition-colors">
                            {task.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
                              task.status === TaskStatus.COMPLETED
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-blue-50 text-blue-600",
                            )}
                          >
                            {task.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-zinc-400 text-sm bg-zinc-50/50 rounded-lg border border-dashed border-zinc-200">
                      暂无关联任务
                    </div>
                  )}
                </div>
              )}

              {expandedSection === "defects" && (
                <div className="mt-2 space-y-2 animate-in slide-in-from-top-2 duration-200">
                  {associatedDefects.length > 0 ? (
                    associatedDefects.map((defect) => (
                      <div
                        key={defect.id}
                        onClick={() => onDefectClick?.(defect)}
                        className="flex items-center justify-between p-3 bg-white border border-zinc-100 rounded-lg hover:border-rose-300 hover:shadow-sm transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-zinc-400 bg-zinc-50 px-1.5 py-0.5 rounded">
                            #{defect.id.slice(0, 6)}
                          </span>
                          <span className="text-sm text-zinc-700 group-hover:text-rose-600 transition-colors">
                            {defect.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
                              defect.status === "RESOLVED" || defect.status === "CLOSED"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-rose-50 text-rose-600",
                            )}
                          >
                            {defect.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-zinc-400 text-sm bg-zinc-50/50 rounded-lg border border-dashed border-zinc-200">
                      暂无关联缺陷
                    </div>
                  )}
                </div>
              )}

              {expandedSection === "risks" && (
                <div className="mt-2 space-y-2 animate-in slide-in-from-top-2 duration-200">
                  {associatedRisks.length > 0 ? (
                    associatedRisks.map((risk) => (
                      <div
                        key={risk.id}
                        onClick={() => onRiskClick?.(risk)}
                        className="flex items-center justify-between p-3 bg-white border border-zinc-100 rounded-lg hover:border-amber-300 hover:shadow-sm transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-zinc-400 bg-zinc-50 px-1.5 py-0.5 rounded">
                            RISK-{risk.id.slice(0, 4)}
                          </span>
                          <span className="text-sm text-zinc-700 group-hover:text-amber-600 transition-colors">
                            {risk.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
                              risk.status === "CLOSED"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-amber-50 text-amber-600",
                            )}
                          >
                            {risk.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-zinc-400 text-sm bg-zinc-50/50 rounded-lg border border-dashed border-zinc-200">
                      暂无关联风险
                    </div>
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
                      ? "text-emerald-600"
                      : "text-zinc-500 hover:text-zinc-700",
                  )}
                >
                  动态
                  {activeTab === "activity" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("comments")}
                  className={cn(
                    "px-4 py-3 text-sm font-medium transition-all relative",
                    activeTab === "comments"
                      ? "text-emerald-600"
                      : "text-zinc-500 hover:text-zinc-700",
                  )}
                >
                  讨论
                  {activeTab === "comments" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={cn(
                    "px-4 py-3 text-sm font-medium transition-all relative",
                    activeTab === "history"
                      ? "text-emerald-600"
                      : "text-zinc-500 hover:text-zinc-700",
                  )}
                >
                  修订记录
                  {activeTab === "history" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
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
                          <span className="text-xs text-zinc-400">录入了需求</span>
                          <span className="text-xs text-zinc-400">
                            {new Date(requirement.createdAt).toLocaleString("zh-CN")}
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
                  "w-full px-3 py-1.5 rounded-lg border text-sm font-bold flex items-center justify-center gap-2 cursor-pointer focus:ring-2 focus:ring-offset-1 focus:ring-emerald-500/20",
                  getStatusColor(requirement.status),
                )}
                value={requirement.status}
                onChange={(e) =>
                  onUpdate?.(requirement.id, { status: e.target.value as RequirementStatus })
                }
              >
                {Object.values(RequirementStatus).map((status) => (
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
                  <Flag className="w-3.5 h-3.5" /> 优先级
                </label>
                <select
                  className={cn(
                    "w-full text-xs font-bold bg-transparent border-none focus:ring-0 cursor-pointer hover:bg-zinc-100 rounded px-1 py-1 transition-colors",
                    getPriorityColor(requirement.priority),
                  )}
                  value={requirement.priority}
                  onChange={(e) =>
                    onUpdate?.(requirement.id, { priority: e.target.value as RequirementPriority })
                  }
                >
                  {Object.values(RequirementPriority).map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" /> 需求类型
                </label>
                <div className="text-sm font-medium text-zinc-700 px-1 capitalize">
                  {requirement.type || "Project Core"}
                </div>
              </div>

              <div className="space-y-1 pt-4 border-t border-zinc-100">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5" /> 负责人
                </label>
                <select
                  className="w-full text-sm font-medium text-zinc-700 bg-transparent border-none focus:ring-0 cursor-pointer hover:bg-zinc-100 rounded px-1 py-1 transition-colors"
                  value={requirement.assigneeId || ""}
                  onChange={(e) => {
                    const member = members.find(
                      (m) => m.userId === e.target.value || m.agentId === e.target.value,
                    );
                    if (onUpdate && requirement) {
                      onUpdate(requirement.id, {
                        assigneeId: e.target.value,
                        assigneeName: member?.user?.name || member?.agent?.name || "Unknown",
                        assigneeAvatar: member?.user?.avatarUrl,
                      });
                    }
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
                  <Calendar className="w-3.5 h-3.5" /> 创建日期
                </label>
                <div className="text-sm font-medium text-zinc-500 px-1">
                  {new Date(requirement.createdAt).toLocaleDateString("zh-CN")}
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-3 pt-4 border-t border-zinc-100">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart2 className="w-3 h-3" /> 迭代进度
                </label>
                <span className="text-xs font-bold text-zinc-600">{calculatedProgress}%</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-500",
                    calculatedProgress === 100 ? "bg-emerald-500" : "bg-blue-500",
                  )}
                  style={{ width: `${calculatedProgress}%` }}
                />
              </div>
              {associatedTasks.length > 0 && (
                <p className="text-[10px] text-zinc-400 text-center">
                  基于 {associatedTasks.length} 个关联任务 (已完成 {completedTasks.length} 个)
                </p>
              )}
            </div>

            {/* Resolution Info */}
            {requirement.status === RequirementStatus.COMPLETED && (
              <div className="pt-4 border-t border-zinc-100">
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">已实现</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
