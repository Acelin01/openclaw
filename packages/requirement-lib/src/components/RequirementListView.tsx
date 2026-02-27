"use client";

import { FileText, Clock, AlertCircle, ChevronRight, Layers } from "lucide-react";
import React from "react";
import { cn } from "../lib/utils";
import { ProjectRequirement, RequirementPriority, RequirementStatus } from "../types";
import { PriorityBadge, StatusBadge } from "./Badges";

interface RequirementListViewProps {
  requirements: ProjectRequirement[];
  onRequirementClick?: (requirement: ProjectRequirement) => void;
  className?: string;
  onAddClick?: () => void;
}

export const RequirementListView: React.FC<RequirementListViewProps> = ({
  requirements,
  onRequirementClick,
  className,
  onAddClick,
}) => {
  const [activeFilter, setActiveFilter] = React.useState("ALL");

  const filters = [
    { id: "ALL", label: "全部" },
    { id: "TODO", label: "待处理" },
    { id: "IN_PROGRESS", label: "进行中" },
    { id: "DONE", label: "已完成" },
  ];

  const filteredRequirements =
    activeFilter === "ALL"
      ? requirements
      : requirements.filter((req) => req.status === activeFilter);

  return (
    <div
      className={cn(
        "bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden",
        className,
      )}
    >
      <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            需求列表
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">管理项目核心功能与业务需求</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl mr-2">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={cn(
                  "text-[10px] px-3 py-1.5 rounded-lg font-bold transition-all",
                  activeFilter === f.id
                    ? "bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          {onAddClick && (
            <button
              onClick={onAddClick}
              className="text-xs px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/10 active:scale-95"
            >
              + 新增需求
            </button>
          )}
        </div>
      </div>
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {filteredRequirements.length > 0 ? (
          filteredRequirements.map((req) => (
            <div
              key={req.id}
              className="p-6 flex items-start hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-all cursor-pointer group"
              onClick={() => onRequirementClick?.(req)}
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center mr-5 flex-shrink-0 transition-all group-hover:scale-110",
                  req.type === "FEATURE"
                    ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                    : req.type === "BUG"
                      ? "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                      : "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
                )}
              >
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-3">
                    <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-emerald-600 transition-colors">
                      {req.title}
                    </h4>
                    <PriorityBadge priority={req.priority} />
                    <StatusBadge status={req.status} />
                  </div>
                  <div className="flex items-center gap-2">
                    {req.subItems && req.subItems.length > 0 && (
                      <div className="flex items-center text-[10px] font-bold text-zinc-400 bg-zinc-50 dark:bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-100 dark:border-zinc-800">
                        <Layers className="w-3 h-3 mr-1" />
                        {req.subItems.filter((s) => s.status === "DONE").length}/
                        {req.subItems.length}
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 line-clamp-2 leading-relaxed">
                  {req.description || "暂无描述"}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center text-xs font-medium text-zinc-400">
                      <Clock className="w-3.5 h-3.5 mr-1.5" />
                      <span>
                        {new Date(req.createdAt).toLocaleDateString("zh-CN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide",
                        req.type === "FEATURE"
                          ? "bg-emerald-100/50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                          : "bg-blue-100/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
                      )}
                    >
                      {req.type}
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                    查看详情 <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-zinc-200 dark:text-zinc-800" />
            </div>
            <p className="text-zinc-400 font-medium">暂无相关需求</p>
          </div>
        )}
      </div>
    </div>
  );
};
