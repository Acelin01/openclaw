"use client";

import { Button } from "@uxin/ui";
import {
  Bug,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  User,
  ShieldAlert,
  Zap,
  ArrowUpCircle,
  Link as LinkIcon,
} from "lucide-react";
import React, { useState } from "react";
import {
  ProjectDefect,
  DefectStatus,
  DefectSeverity,
  DefectPriority,
  ProjectRequirement,
} from "../types";
import { Badge, cn } from "./shared-ui";

interface DefectListProps {
  defects: ProjectDefect[];
  requirements?: ProjectRequirement[];
  onDefectClick?: (defect: ProjectDefect) => void;
  onCreateDefect?: () => void;
  className?: string;
}

export const DefectList: React.FC<DefectListProps> = ({
  defects,
  requirements = [],
  onDefectClick,
  onCreateDefect,
  className,
}) => {
  const [activeFilter, setActiveFilter] = useState<DefectStatus | "ALL">("ALL");

  const filteredDefects =
    activeFilter === "ALL" ? defects : defects.filter((defect) => defect.status === activeFilter);

  const getSeverityVariant = (severity: DefectSeverity) => {
    switch (severity) {
      case DefectSeverity.CRITICAL:
        return "critical";
      case DefectSeverity.HIGH:
        return "high";
      case DefectSeverity.MEDIUM:
        return "medium";
      case DefectSeverity.LOW:
        return "low";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: DefectStatus) => {
    switch (status) {
      case DefectStatus.OPEN:
        return <AlertCircle className="w-4 h-4 text-rose-500" />;
      case DefectStatus.IN_PROGRESS:
        return <Clock className="w-4 h-4 text-amber-500" />;
      case DefectStatus.RESOLVED:
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case DefectStatus.CLOSED:
        return <XCircle className="w-4 h-4 text-zinc-400" />;
      case DefectStatus.REJECTED:
        return <ShieldAlert className="w-4 h-4 text-zinc-400" />;
      default:
        return <Bug className="w-4 h-4 text-zinc-400" />;
    }
  };

  const getStatusLabel = (status: DefectStatus) => {
    switch (status) {
      case DefectStatus.OPEN:
        return "待处理";
      case DefectStatus.IN_PROGRESS:
        return "处理中";
      case DefectStatus.RESOLVED:
        return "已解决";
      case DefectStatus.CLOSED:
        return "已关闭";
      case DefectStatus.REJECTED:
        return "已拒绝";
      default:
        return status;
    }
  };

  const getPriorityIcon = (priority: DefectPriority) => {
    switch (priority) {
      case DefectPriority.IMMEDIATE:
        return <Zap className="w-3 h-3 text-rose-500" />;
      case DefectPriority.HIGH:
        return <ArrowUpCircle className="w-3 h-3 text-amber-500" />;
      default:
        return null;
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
          <h3 className="text-lg font-bold text-zinc-900 tracking-tight">项目缺陷</h3>
          <p className="text-xs text-zinc-500 mt-0.5">跟踪并管理项目开发过程中的缺陷和问题</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex bg-zinc-100 p-1 rounded-xl mr-2">
            {(["ALL", ...Object.values(DefectStatus)] as const).map((status) => (
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
                {status === "ALL" ? "全部" : getStatusLabel(status as DefectStatus)}
              </Button>
            ))}
          </div>
          <Button
            onClick={onCreateDefect}
            className="text-xs px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/10 active:scale-95 border-none h-auto"
          >
            + 报告缺陷
          </Button>
        </div>
      </div>

      <div className="p-3">
        {defects && defects.length > 0 ? (
          <div className="space-y-1">
            {filteredDefects.map((defect) => (
              <div
                key={defect.id}
                className="flex flex-col p-4 hover:bg-zinc-50 rounded-2xl transition-all group cursor-pointer border border-transparent hover:border-zinc-100"
                onClick={() => onDefectClick?.(defect)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300",
                        defect.status === DefectStatus.CLOSED
                          ? "bg-zinc-100"
                          : "bg-white border border-zinc-200 group-hover:border-emerald-500",
                      )}
                    >
                      {getStatusIcon(defect.status)}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-[15px] font-bold transition-all",
                            defect.status === DefectStatus.CLOSED
                              ? "text-zinc-400"
                              : "text-zinc-800",
                          )}
                        >
                          {defect.title}
                        </span>
                        <Badge variant={getSeverityVariant(defect.severity)}>
                          {defect.severity}
                        </Badge>
                        {getPriorityIcon(defect.priority)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {defect.assignee && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100/50 rounded-xl border border-zinc-100 group-hover:bg-white group-hover:shadow-sm transition-all">
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                          {defect.assignee.name[0]}
                        </div>
                        <span className="text-xs font-bold text-zinc-600">
                          {defect.assignee.name}
                        </span>
                      </div>
                    )}
                    <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-emerald-500 transition-colors" />
                  </div>
                </div>

                <div className="ml-11">
                  {defect.description && (
                    <p className="text-xs text-zinc-500 mb-3 leading-relaxed line-clamp-2">
                      {defect.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
                      <span className="text-zinc-400">状态:</span>
                      <span className="font-bold">{getStatusLabel(defect.status)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
                      <span className="text-zinc-400">优先级:</span>
                      <span className="font-bold">{defect.priority}</span>
                    </div>
                    {defect.reporter && (
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
                        <span className="text-zinc-400">报告人:</span>
                        <span>{defect.reporter.name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
                      <span className="text-zinc-400">创建于:</span>
                      <span>{new Date(defect.createdAt).toLocaleDateString()}</span>
                    </div>
                    {defect.requirementId && (
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        <LinkIcon className="w-3 h-3" />
                        <span className="text-blue-400">需求:</span>
                        <span className="font-bold truncate max-w-[150px]">
                          {requirements.find((r) => r.id === defect.requirementId)?.title ||
                            "未知需求"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
              <Bug className="w-8 h-8 text-zinc-200" />
            </div>
            <p className="text-zinc-400 font-medium">暂未发现项目缺陷</p>
            <p className="text-xs text-zinc-300 mt-1">保持代码质量，及时修复发现的问题</p>
          </div>
        )}
      </div>
    </div>
  );
};
