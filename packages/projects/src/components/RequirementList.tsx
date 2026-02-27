"use client";

import { Button } from "@uxin/ui";
import { FileText, Clock, AlertCircle, Layers, User as UserIcon } from "lucide-react";
import React, { useState } from "react";
import { ProjectRequirement, RequirementPriority, RequirementStatus, ProjectTask } from "../types";
import { Badge, cn } from "./shared-ui";

interface RequirementListProps {
  requirements: ProjectRequirement[];
  tasks?: ProjectTask[];
  onRequirementClick?: (requirement: ProjectRequirement) => void;
  onCreateRequirement?: () => void;
  onViewLandscape?: () => void;
  className?: string;
}

export const RequirementList: React.FC<RequirementListProps> = ({
  requirements,
  tasks = [],
  onRequirementClick,
  onCreateRequirement,
  onViewLandscape,
  className,
}) => {
  const [activeFilter, setActiveFilter] = useState("ALL");

  const filters = [
    { id: "ALL", label: "全部" },
    { id: "PENDING", label: "待处理" },
    { id: "IN_PROGRESS", label: "进行中" },
    { id: "COMPLETED", label: "已完成" },
  ];

  const filteredRequirements =
    activeFilter === "ALL"
      ? requirements
      : requirements.filter((req) => req.status === activeFilter);

  return (
    <div
      className={cn(
        "bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden",
        className,
      )}
    >
      <div className="px-6 py-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 tracking-tight">需求列表</h3>
          <p className="text-xs text-zinc-500 mt-0.5">管理项目核心功能与业务需求</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex bg-zinc-100 p-1 rounded-xl mr-2">
            {filters.map((f) => (
              <Button
                key={f.id}
                variant="ghost"
                onClick={() => setActiveFilter(f.id)}
                className={cn(
                  "text-[10px] px-3 py-1.5 rounded-lg font-bold transition-all h-auto border-none",
                  activeFilter === f.id
                    ? "bg-white text-emerald-600 shadow-sm hover:bg-white"
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50",
                )}
              >
                {f.label}
              </Button>
            ))}
          </div>
          <Button
            onClick={onViewLandscape}
            variant="outline"
            className="text-xs px-4 py-2 border-zinc-200 text-zinc-600 rounded-xl font-bold hover:bg-zinc-50 transition-all flex items-center gap-2 h-auto"
          >
            <Layers className="w-4 h-4" />
            全景图
          </Button>
          <Button
            onClick={onCreateRequirement}
            className="text-xs px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/10 active:scale-95 border-none h-auto"
          >
            + 新增需求
          </Button>
        </div>
      </div>
      <div className="divide-y divide-zinc-100">
        {filteredRequirements.length > 0 ? (
          filteredRequirements.map((req) => {
            const associatedTasks = tasks.filter((t) => t.requirementId === req.id);
            const completedTasks = associatedTasks.filter((t) => t.status === "COMPLETED");
            const progress =
              associatedTasks.length > 0
                ? Math.round((completedTasks.length / associatedTasks.length) * 100)
                : req.status === "COMPLETED"
                  ? 100
                  : 0;

            return (
              <div
                key={req.id}
                className="p-6 flex items-start hover:bg-emerald-50/30 transition-all cursor-pointer group"
                onClick={() => onRequirementClick?.(req)}
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center mr-5 flex-shrink-0 transition-all group-hover:scale-110",
                    req.type === "project"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-blue-50 text-blue-600",
                  )}
                >
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-3">
                      <h4 className="text-base font-bold text-zinc-900 truncate group-hover:text-emerald-600 transition-colors">
                        {req.title}
                      </h4>
                      <Badge variant={(req.priority?.toLowerCase() as any) || "default"}>
                        {req.priority || "MEDIUM"}
                      </Badge>
                    </div>
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                      {req.status || "PENDING"}
                    </span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex-1 max-w-md">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                          完成进度
                        </span>
                        <span className="text-[10px] text-zinc-600 font-bold">{progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full transition-all duration-500",
                            progress === 100 ? "bg-emerald-500" : "bg-blue-500",
                          )}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {req.assigneeName && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100/50 rounded-xl border border-zinc-100 group-hover:bg-white group-hover:shadow-sm transition-all">
                          {req.assigneeAvatar ? (
                            <img src={req.assigneeAvatar} alt="" className="w-5 h-5 rounded-full" />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                              {req.assigneeName[0]}
                            </div>
                          )}
                          <span className="text-xs font-bold text-zinc-600">
                            {req.assigneeName}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-medium">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-zinc-200" />
            </div>
            <p className="text-zinc-400 font-medium">暂无相关需求</p>
          </div>
        )}
      </div>
    </div>
  );
};
