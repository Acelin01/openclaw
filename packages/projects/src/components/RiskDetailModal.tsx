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
  AlertTriangle,
  MoreHorizontal,
  AlignLeft,
  BarChart2,
  ShieldAlert,
  Zap,
  Target,
  Link as LinkIcon,
} from "lucide-react";
import React, { useState } from "react";
import {
  ProjectRisk,
  RiskLevel,
  RiskStatus,
  RiskProbability,
  RiskImpact,
  ProjectTeamMember,
} from "../types";
import { cn } from "./shared-ui";

interface RiskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  risk: ProjectRisk | null;
  onUpdate?: (id: string, updates: Partial<ProjectRisk>) => Promise<void>;
  members?: ProjectTeamMember[];
  requirements?: any[];
}

export const RiskDetailModal: React.FC<RiskDetailModalProps> = ({
  isOpen,
  onClose,
  risk,
  onUpdate,
  members = [],
  requirements = [],
}) => {
  const [activeTab, setActiveTab] = useState<"activity" | "comments" | "history">("activity");
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(true);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState(risk?.description || "");
  const [isEditingMitigation, setIsEditingMitigation] = useState(false);
  const [mitigationPlan, setMitigationPlan] = useState(risk?.mitigationPlan || "");

  if (!isOpen || !risk) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case RiskStatus.OPEN:
        return "bg-rose-100 text-rose-700 border-rose-200";
      case RiskStatus.MITIGATED:
        return "bg-amber-100 text-amber-700 border-amber-200";
      case RiskStatus.CLOSED:
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default:
        return "bg-zinc-100 text-zinc-700 border-zinc-200";
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case RiskLevel.HIGH:
        return "text-rose-600 bg-rose-50";
      case RiskLevel.MEDIUM:
        return "text-amber-600 bg-amber-50";
      case RiskLevel.LOW:
        return "text-emerald-600 bg-emerald-50";
      default:
        return "text-zinc-600 bg-zinc-50";
    }
  };

  const handleUpdateDescription = async () => {
    if (onUpdate && risk) {
      await onUpdate(risk.id, { description });
      setIsEditingDescription(false);
    }
  };

  const handleUpdateMitigation = async () => {
    if (onUpdate && risk) {
      await onUpdate(risk.id, { mitigationPlan });
      setIsEditingMitigation(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
            </div>
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-xs font-bold rounded border border-rose-100">
                RISK-{risk.id.slice(0, 6).toUpperCase()}
              </span>
              <h2 className="text-lg font-bold text-zinc-900 line-clamp-1">{risk.title}</h2>
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
              {risk.requirementId && (
                <div className="flex items-center gap-2 p-3 bg-amber-50/50 rounded-lg border border-amber-100">
                  <LinkIcon className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    关联需求:
                  </span>
                  <span className="text-sm font-medium text-amber-700">
                    {requirements.find((r) => r.id === risk.requirementId)?.title || "未知需求"}
                  </span>
                </div>
              )}

              {/* Description Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                    <AlignLeft className="w-4 h-4 text-zinc-400" />
                    风险描述
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
                      className="w-full min-h-[150px] p-4 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                      placeholder="详述风险产生的背景、原因及潜在影响..."
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
                        className="bg-rose-500 hover:bg-rose-600 text-white"
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
                      {risk.description || "暂无详细描述"}
                    </div>
                    {risk.description && risk.description.length > 300 && (
                      <button
                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                        className="w-full mt-2 py-1 flex items-center justify-center text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
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

              {/* Mitigation Plan Section */}
              <div className="space-y-4 pt-6 border-t border-zinc-100">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-zinc-400" />
                    缓解/应对方案
                  </h3>
                  {!isEditingMitigation && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingMitigation(true)}
                      className="text-xs text-blue-600 hover:text-blue-700 h-7 px-2"
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1" />
                      编辑
                    </Button>
                  )}
                </div>

                {isEditingMitigation ? (
                  <div className="space-y-3">
                    <textarea
                      value={mitigationPlan}
                      onChange={(e) => setMitigationPlan(e.target.value)}
                      className="w-full min-h-[150px] p-4 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      placeholder="详述缓解措施、规避方案或应急预案..."
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditingMitigation(false)}
                      >
                        取消
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleUpdateMitigation}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                      >
                        保存
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50/50 rounded-lg border border-emerald-100/50 text-sm text-zinc-600 leading-relaxed whitespace-pre-wrap">
                    {risk.mitigationPlan || "暂无应对方案"}
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
                        ? "text-rose-600"
                        : "text-zinc-500 hover:text-zinc-700",
                    )}
                  >
                    动态
                    {activeTab === "activity" && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("comments")}
                    className={cn(
                      "px-4 py-3 text-sm font-medium transition-all relative",
                      activeTab === "comments"
                        ? "text-rose-600"
                        : "text-zinc-500 hover:text-zinc-700",
                    )}
                  >
                    讨论
                    {activeTab === "comments" && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("history")}
                    className={cn(
                      "px-4 py-3 text-sm font-medium transition-all relative",
                      activeTab === "history"
                        ? "text-rose-600"
                        : "text-zinc-500 hover:text-zinc-700",
                    )}
                  >
                    修订记录
                    {activeTab === "history" && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500" />
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
                            <span className="text-xs text-zinc-400">识别了该风险</span>
                            <span className="text-xs text-zinc-400">
                              {new Date(risk.createdAt).toLocaleString("zh-CN")}
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
                  风险状态
                </label>
                <select
                  className={cn(
                    "w-full px-3 py-1.5 rounded-lg border text-sm font-bold flex items-center justify-center gap-2 cursor-pointer focus:ring-2 focus:ring-offset-1 focus:ring-rose-500/20",
                    getStatusColor(risk.status),
                  )}
                  value={risk.status}
                  onChange={(e) => onUpdate?.(risk.id, { status: e.target.value as RiskStatus })}
                >
                  {Object.values(RiskStatus).map((status) => (
                    <option key={status} value={status}>
                      {status === RiskStatus.OPEN
                        ? "开放"
                        : status === RiskStatus.MITIGATED
                          ? "已缓解"
                          : "已关闭"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Properties Grid */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" /> 风险级别
                  </label>
                  <select
                    className={cn(
                      "w-full text-xs font-bold bg-transparent border-none focus:ring-0 cursor-pointer hover:bg-zinc-100 rounded px-1 py-1 transition-colors",
                      getLevelColor(risk.level),
                    )}
                    value={risk.level}
                    onChange={(e) => onUpdate?.(risk.id, { level: e.target.value as RiskLevel })}
                  >
                    {Object.values(RiskLevel).map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart2 className="w-3.5 h-3.5" /> 发生概率
                  </label>
                  <select
                    className="w-full text-sm font-medium text-zinc-700 bg-transparent border-none focus:ring-0 cursor-pointer hover:bg-zinc-100 rounded px-1 py-1 transition-colors capitalize"
                    value={risk.probability}
                    onChange={(e) =>
                      onUpdate?.(risk.id, { probability: e.target.value as RiskProbability })
                    }
                  >
                    {Object.values(RiskProbability).map((prob) => (
                      <option key={prob} value={prob}>
                        {prob}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" /> 影响程度
                  </label>
                  <select
                    className="w-full text-sm font-medium text-zinc-700 bg-transparent border-none focus:ring-0 cursor-pointer hover:bg-zinc-100 rounded px-1 py-1 transition-colors capitalize"
                    value={risk.impact}
                    onChange={(e) => onUpdate?.(risk.id, { impact: e.target.value as RiskImpact })}
                  >
                    {Object.values(RiskImpact).map((impact) => (
                      <option key={impact} value={impact}>
                        {impact}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <LinkIcon className="w-3 h-3" /> 关联需求
                  </label>
                  <select
                    className="w-full text-sm font-medium text-zinc-700 bg-transparent border-none focus:ring-0 cursor-pointer hover:bg-zinc-100 rounded px-1 py-1 transition-colors"
                    value={risk.requirementId || ""}
                    onChange={(e) => onUpdate?.(risk.id, { requirementId: e.target.value })}
                  >
                    <option value="">未关联需求</option>
                    {requirements.map((req) => (
                      <option key={req.id} value={req.id}>
                        {req.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 pt-4 border-t border-zinc-100">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5" /> 责任人
                  </label>
                  <select
                    className="w-full text-sm font-medium text-zinc-700 bg-transparent border-none focus:ring-0 cursor-pointer hover:bg-zinc-100 rounded px-1 py-1 transition-colors"
                    value={risk.ownerId || ""}
                    onChange={(e) => {
                      const member = members.find(
                        (m) => m.userId === e.target.value || m.agentId === e.target.value,
                      );
                      onUpdate?.(risk.id, {
                        ownerId: e.target.value,
                        owner: member
                          ? {
                              id: e.target.value,
                              name: member.user?.name || member.agent?.name || "Unknown",
                              avatarUrl: member.user?.avatarUrl,
                            }
                          : undefined,
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
                    <Calendar className="w-3.5 h-3.5" /> 识别日期
                  </label>
                  <div className="text-sm font-medium text-zinc-500 px-1">
                    {new Date(risk.createdAt).toLocaleDateString("zh-CN")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
