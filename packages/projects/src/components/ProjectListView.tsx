"use client";

import { cn, Button } from "@uxin/ui";
import { Plus, Search, Filter, Briefcase, SlidersHorizontal, LayoutGrid, List } from "lucide-react";
import React, { useState } from "react";
import { Project } from "../types";
import { ProjectCard } from "./ProjectCard";

interface ProjectListViewProps {
  projects: Project[];
  isLoading?: boolean;
  onProjectClick: (project: Project) => void;
  onCreateProject?: () => void;
  token?: string;
  apiBaseUrl?: string;
}

export const ProjectListView: React.FC<ProjectListViewProps> = ({
  projects,
  isLoading,
  onProjectClick,
  onCreateProject,
  token,
  apiBaseUrl,
}) => {
  const [activeStatus, setActiveStatus] = useState("ALL");
  const [viewMode, setViewMode] = useState<"GRID" | "LIST">("GRID");

  const statuses = [
    { id: "ALL", label: "全部" },
    { id: "IN_PROGRESS", label: "进行中" },
    { id: "PENDING", label: "待开始" },
    { id: "COMPLETED", label: "已交付" },
    { id: "SUSPENDED", label: "已挂起" },
  ];

  const getStatusCount = (statusId: string) => {
    if (statusId === "ALL") return projects.length;
    return projects.filter((p) => p.status === statusId).length;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-white/50 backdrop-blur-sm">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-emerald-100 border-t-emerald-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-emerald-500 animate-pulse" />
          </div>
        </div>
        <p className="mt-6 text-sm font-bold text-zinc-500 tracking-widest uppercase">
          Initializing Workspace...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#fcfcfc]">
      {/* 增强型项目头部 */}
      <div className="px-10 py-8 bg-white border-b border-zinc-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500 text-white flex items-center justify-center mr-6 shadow-xl shadow-emerald-500/20 rotate-2">
              <Briefcase className="w-8 h-8" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-zinc-900 tracking-tight">项目大厅</h1>
              {/* <p className="text-sm font-bold text-zinc-400 mt-1 uppercase tracking-wider">Project Hub & Collaboration</p> */}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group flex-1 lg:flex-none">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
              <input
                type="text"
                placeholder="搜索项目名称、负责人或标签..."
                className="pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all w-full lg:w-96 shadow-sm"
              />
            </div>
            <Button
              onClick={onCreateProject}
              className="flex items-center gap-2 px-8 py-3 bg-emerald-500 text-white rounded-2xl text-sm font-black hover:bg-emerald-600 transition-all active:scale-95 shadow-xl shadow-emerald-500/20 whitespace-nowrap border-none h-auto"
            >
              <Plus className="h-5 w-5" strokeWidth={3} />
              <span>启动新项目</span>
            </Button>
          </div>
        </div>

        {/* 筛选与切换器 */}
        <div className="mt-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-1 bg-zinc-100 p-1.5 rounded-2xl">
            {statuses.map((status) => (
              <Button
                key={status.id}
                variant="ghost"
                onClick={() => setActiveStatus(status.id)}
                className={cn(
                  "px-6 py-2 rounded-xl text-xs font-black transition-all border border-transparent flex items-center gap-2 h-auto border-none",
                  activeStatus === status.id
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20 border-emerald-500 hover:bg-emerald-600"
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 hover:border-zinc-200",
                )}
              >
                <span>{status.label}</span>
                {(status.id === "IN_PROGRESS" || status.id === "PENDING") && (
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded-md text-[10px] font-bold",
                      activeStatus === status.id
                        ? "bg-white/20 text-white"
                        : "bg-zinc-200 text-zinc-500",
                    )}
                  >
                    {getStatusCount(status.id)}
                  </span>
                )}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("GRID")}
                className={cn(
                  "p-2 rounded-lg transition-all h-9 w-9 border-none",
                  viewMode === "GRID"
                    ? "bg-white text-zinc-900 shadow-sm hover:bg-white"
                    : "text-zinc-400 hover:text-zinc-600",
                )}
              >
                <LayoutGrid size={18} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("LIST")}
                className={cn(
                  "p-2 rounded-lg transition-all h-9 w-9 border-none",
                  viewMode === "LIST"
                    ? "bg-white text-zinc-900 shadow-sm hover:bg-white"
                    : "text-zinc-400 hover:text-zinc-600",
                )}
              >
                <List size={18} />
              </Button>
            </div>
            <div className="h-8 w-[1px] bg-zinc-200 mx-1" />
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-black text-zinc-600 hover:bg-zinc-50 transition-all shadow-sm h-auto"
            >
              <SlidersHorizontal size={14} />
              高级筛选
            </Button>
          </div>
        </div>
      </div>

      {/* 项目内容区域 */}
      <div className="flex-1 overflow-y-auto p-10 scrollbar-hide">
        <div className="max-w-[1600px] mx-auto">
          {projects.length > 0 ? (
            <div
              className={cn(
                viewMode === "GRID"
                  ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 xl:gap-8"
                  : "flex flex-col gap-4",
              )}
            >
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={onProjectClick}
                  className={viewMode === "LIST" ? "flex-row h-32" : ""}
                  token={token}
                  apiBaseUrl={apiBaseUrl}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[40px] border border-dashed border-zinc-200 shadow-sm">
              <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center mb-8 border border-zinc-100 group">
                <Briefcase className="w-12 h-12 text-zinc-200 group-hover:text-emerald-500 transition-colors duration-500" />
              </div>
              <h3 className="text-2xl font-black text-zinc-900 tracking-tight">未检索到活跃项目</h3>
              <p className="text-zinc-400 mt-2 mb-10 max-w-sm text-center font-medium">
                当前条件下没有找到匹配的项目。您可以尝试调整筛选条件，或者立即启动一个全新的协作空间。
              </p>
              <Button
                onClick={onCreateProject}
                className="px-10 py-4 bg-emerald-500 text-white rounded-2xl font-black hover:bg-emerald-600 transition-all shadow-2xl shadow-emerald-500/20 active:scale-95 border-none h-auto"
              >
                启动首个项目
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
