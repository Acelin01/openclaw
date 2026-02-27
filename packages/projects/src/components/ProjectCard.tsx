"use client";

import { Users, Briefcase, ListTodo, Clock, ChevronRight } from "lucide-react";
import React from "react";
import { useProjectTasks, useProjectMembers } from "../hooks";
import { Project, ProjectStatus } from "../types";
import { Badge, ProgressBar, cn } from "./shared-ui";

interface ProjectCardProps {
  project: Project;
  className?: string;
  onClick?: (project: Project) => void;
  token?: string;
  apiBaseUrl?: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  className,
  onClick,
  token,
  apiBaseUrl,
}) => {
  // 使用 hooks 获取实时数据
  const { data: tasks } = useProjectTasks(project.id, token, apiBaseUrl);
  const { data: members } = useProjectMembers(project.id, token, apiBaseUrl);

  // 计算任务数：优先使用 hook 获取的实时数据，降级使用 project 对象中的数据
  const taskCount = tasks?.length ?? project.tasks?.length ?? 0;
  console.log("Task count:", taskCount);

  // 计算成员数：优先使用 hook 获取的实时数据，降级使用 project 对象中的数据
  const memberCount = members?.length ?? project.memberCount ?? 1;
  console.log("Member count:", memberCount);

  const getStatusVariant = (status?: ProjectStatus | string) => {
    switch (status) {
      case ProjectStatus.PLANNING:
      case "PLANNING":
      case "规划中":
        return "planning";
      case ProjectStatus.IN_PROGRESS:
      case "IN_PROGRESS":
      case "进行中":
        return "in-progress";
      case ProjectStatus.REVIEW:
      case "REVIEW":
      case "评审中":
        return "review";
      case ProjectStatus.COMPLETED:
      case "COMPLETED":
      case "已交付":
      case "已完成":
        return "completed";
      default:
        return "default";
    }
  };

  const statusLabel = typeof project.status === "string" ? project.status : "规划中";

  return (
    <div
      className={cn(
        "group flex flex-col rounded-2xl border border-zinc-100 bg-white overflow-hidden transition-all duration-300 cursor-pointer",
        "hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1.5 hover:border-emerald-200",
        className,
      )}
      onClick={() => onClick?.(project)}
    >
      <div className="p-6 flex flex-col h-full">
        {/* 顶部图标与状态 */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-50 text-zinc-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-all duration-300 shadow-sm border border-zinc-100 group-hover:border-emerald-100">
            <Briefcase size={24} />
          </div>
          <Badge variant={getStatusVariant(project.status)}>{statusLabel}</Badge>
        </div>

        {/* 标题与描述 */}
        <div className="flex flex-col gap-2 mb-6">
          <h4 className="text-lg font-bold text-zinc-900 group-hover:text-emerald-600 transition-colors line-clamp-1 tracking-tight">
            {project.name}
          </h4>
          <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed h-10">
            {project.description || "暂无项目描述，点击查看详情了解更多内容。"}
          </p>
        </div>

        {/* 进度条区域 */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                项目进度
              </span>
              <span className="text-sm font-black text-emerald-600">{project.progress || 0}%</span>
            </div>
            <ProgressBar value={project.progress} className="h-2" />
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400">
              <ListTodo size={14} className="text-zinc-300" />
              <span>{project.tasks?.length || 0} 任务</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400">
              <Users size={14} className="text-zinc-300" />
              <span>{project.memberCount || 1} 成员</span>
            </div>
          </div>
        </div>

        {/* 底部操作区域 */}
        <div className="mt-auto pt-5 border-t border-zinc-50 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 uppercase tracking-tight">
            <Clock size={12} className="text-zinc-300" />
            <span>{project.updatedAt ? "3天前" : "刚刚更新"}</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-500 font-black text-sm group-hover:translate-x-0.5 transition-transform">
            <span>详情</span>
            <ChevronRight size={16} />
          </div>
        </div>
      </div>
    </div>
  );
};
