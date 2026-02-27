import { Button } from "@uxin/ui";
import {
  MoreHorizontal,
  Target,
  ListChecks,
  Users,
  Clock,
  Shield,
  CheckCircle2,
  Loader2,
  Database,
} from "lucide-react";
import React from "react";
import { Project } from "../types";
import { ProgressBar, cn } from "./shared-ui";

interface ProjectDashboardProps {
  project: Project;
  onAction?: (action: string) => void;
  className?: string;
}

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({
  project,
  onAction,
  className,
}) => {
  const members = project.members || [];
  const humanMembers = members.filter((m) => !!m.userId);

  // 计算团队总人数：智能体数量 + 自由职业者数量 + 项目团队数量
  const agentCount = members.filter((m) => !!m.agentId).length;
  const freelancerCount = members.filter(
    (m) => !m.agentId && (m.role?.includes("自由") || m.role?.includes("外部")),
  ).length;
  const employeeCount = members.filter(
    (m) => !m.agentId && !m.role?.includes("自由") && !m.role?.includes("外部"),
  ).length;
  const totalTeamCount = agentCount + freelancerCount + employeeCount;

  const isEmoji = (str: string | null | undefined) => {
    if (!str) return false;
    return /\p{Emoji}/u.test(str) && str.length <= 8;
  };

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
      {/* 核心指标 */}
      <DashboardCard
        title="项目进度"
        icon={<Target className="w-5 h-5 text-emerald-500" />}
        onMoreClick={() => onAction?.("analytics")}
      >
        <div className="py-2">
          <ProgressBar value={project.progress} showValue={true} />
          <div className="mt-6 grid grid-cols-2 gap-6">
            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
              <div className="flex items-center gap-2 mb-2 text-zinc-400">
                <Clock className="w-3.5 h-3.5" />
                <p className="text-[10px] font-bold uppercase tracking-wider">开始日期</p>
              </div>
              <p className="text-sm font-black text-zinc-900">
                {project.startDate
                  ? new Date(project.startDate).toLocaleDateString("zh-CN", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "未设置"}
              </p>
            </div>
            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
              <div className="flex items-center gap-2 mb-2 text-zinc-400">
                <Clock className="w-3.5 h-3.5 text-rose-400" />
                <p className="text-[10px] font-bold uppercase tracking-wider">预计截止</p>
              </div>
              <p className="text-sm font-black text-zinc-900">
                {project.dueDate
                  ? new Date(project.dueDate).toLocaleDateString("zh-CN", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "未设置"}
              </p>
            </div>
          </div>
        </div>
      </DashboardCard>

      <DashboardCard
        title="任务统计"
        icon={<ListChecks className="w-5 h-5 text-blue-500" />}
        onMoreClick={() => onAction?.("tasks")}
      >
        <div className="space-y-4">
          <StatItem
            label="总任务数"
            value={project.tasks?.length || 0}
            unit="Tasks"
            icon={<ListChecks className="w-5 h-5" />}
            iconColor="bg-blue-50 text-blue-500"
          />
          <StatItem
            label="已完成任务"
            value={project.tasks?.filter((t) => t.status === "COMPLETED").length || 0}
            unit="Tasks"
            icon={<Target className="w-5 h-5" />}
            iconColor="bg-emerald-50 text-emerald-500"
            change={
              project.tasks?.length
                ? Math.round(
                    (project.tasks.filter((t) => t.status === "COMPLETED").length /
                      project.tasks.length) *
                      100,
                  )
                : 0
            }
            changeLabel="完成率"
          />
        </div>
      </DashboardCard>

      <DashboardCard
        title="团队活跃"
        icon={<Users className="w-5 h-5 text-purple-500" />}
        onMoreClick={() => onAction?.("team")}
      >
        <div className="space-y-6">
          <StatItem
            label="当前成员"
            value={totalTeamCount}
            unit="Members"
            icon={<Users className="w-5 h-5" />}
            iconColor="bg-purple-50 text-purple-500"
          />
          <div className="pt-4 border-t border-zinc-100">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
              核心贡献者
            </p>
            <div className="flex -space-x-3 overflow-hidden py-1">
              {(() => {
                const agentCount = (project.members || []).filter((m) => !!m.agentId).length;
                const displayMembers = humanMembers.slice(0, 5);
                const remainingCount =
                  (humanMembers.length > 5 ? humanMembers.length - 5 : 0) + agentCount;

                return (
                  <>
                    {displayMembers.map((member, i) => {
                      const name = member.user?.name || "未知";
                      const avatar = member.user?.avatarUrl;
                      return (
                        <div
                          key={member.id || i}
                          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-zinc-100 text-xs font-black leading-none text-zinc-600 shadow-sm overflow-hidden"
                          title={name}
                        >
                          {avatar ? (
                            isEmoji(avatar) ? (
                              <span className="text-base">{avatar}</span>
                            ) : (
                              <img src={avatar} alt={name} className="w-full h-full object-cover" />
                            )
                          ) : (
                            <span>{name[0]}</span>
                          )}
                        </div>
                      );
                    })}
                    {remainingCount > 0 && (
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-emerald-50 text-xs font-black leading-none text-emerald-600 shadow-sm"
                        title={`包含 ${agentCount} 个智能体及其他成员`}
                      >
                        <span>+{remainingCount}</span>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </DashboardCard>

      {/* 后台管理集成 */}
      {project.isAdminEnabled && (
        <DashboardCard
          title="后台管理"
          icon={<Shield className="w-5 h-5 text-blue-500" />}
          onMoreClick={() => onAction?.("admin")}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                <div className="flex items-center gap-2 mb-1 text-zinc-400">
                  <Database className="w-3.5 h-3.5" />
                  <p className="text-[10px] font-bold uppercase tracking-wider">集成接口</p>
                </div>
                <p className="text-sm font-black text-zinc-900">
                  {project.adminConfigs?.length || 0}
                </p>
              </div>
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                <div className="flex items-center gap-2 mb-1 text-zinc-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <p className="text-[10px] font-bold uppercase tracking-wider">就绪状态</p>
                </div>
                <p className="text-sm font-black text-zinc-900">
                  {project.adminConfigs?.filter((c) => c.status === "ready").length || 0}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                最近配置
              </p>
              <div className="space-y-2">
                {project.adminConfigs && project.adminConfigs.length > 0 ? (
                  project.adminConfigs.slice(0, 2).map((config) => (
                    <div
                      key={config.id}
                      className="flex items-center justify-between p-2 bg-white rounded-xl border border-zinc-100 shadow-sm"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <Database className="w-3 h-3 text-blue-500" />
                        </div>
                        <span className="text-xs font-bold text-zinc-700 truncate">
                          {config.name || "未命名"}
                        </span>
                      </div>
                      {config.status === "ready" ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      ) : config.status === "pending" ? (
                        <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin flex-shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-zinc-200 flex-shrink-0" />
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-zinc-400 italic">暂无配置项</p>
                )}
              </div>
            </div>
          </div>
        </DashboardCard>
      )}
    </div>
  );
};

interface DashboardCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onMoreClick?: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, icon, children, onMoreClick }) => (
  <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-zinc-200 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300">
    <div className="px-6 py-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm border border-zinc-100">
          {icon}
        </div>
        <h3 className="text-base font-bold text-zinc-900 tracking-tight">{title}</h3>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onMoreClick}
        className="text-zinc-400 hover:text-emerald-500 transition-all p-2 hover:bg-emerald-50 rounded-xl border-none h-9 w-9"
      >
        <MoreHorizontal className="w-5 h-5" />
      </Button>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

interface StatItemProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  iconColor?: string;
  change?: number;
  changeLabel?: string;
  isPositive?: boolean;
}

const StatItem: React.FC<StatItemProps> = ({
  label,
  value,
  unit,
  icon,
  iconColor = "bg-emerald-50 text-emerald-500",
  change,
  changeLabel,
  isPositive = true,
}) => (
  <div className="flex items-center p-4 bg-zinc-50 rounded-2xl border border-zinc-100 group hover:bg-white hover:shadow-md transition-all">
    {icon && (
      <div
        className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center mr-4 flex-shrink-0 transition-transform group-hover:scale-110 shadow-sm",
          iconColor,
        )}
      >
        {icon}
      </div>
    )}
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-zinc-900">{value}</span>
          {unit && (
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
              {unit}
            </span>
          )}
        </div>
        {change !== undefined && (
          <div
            className={cn(
              "px-2 py-1 rounded-lg text-[10px] font-black shadow-sm",
              isPositive ? "bg-emerald-500 text-white" : "bg-rose-500 text-white",
            )}
          >
            {changeLabel && `${changeLabel} `}
            {change}%
          </div>
        )}
      </div>
    </div>
  </div>
);
