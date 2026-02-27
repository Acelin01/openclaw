"use client";

import { format } from "date-fns";
import {
  BarChart3,
  Clock,
  Calendar,
  Users,
  Target,
  AlertCircle,
  TrendingUp,
  PieChart,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import React, { useMemo } from "react";
import { Iteration, IterationWorkItem } from "../types";

interface IterationOverviewProps {
  iteration: Iteration & {
    workItems?: IterationWorkItem[];
    requirements?: IterationWorkItem[];
    tasks?: IterationWorkItem[];
    defects?: IterationWorkItem[];
  };
  members?: any[];
}

export const IterationOverview: React.FC<IterationOverviewProps> = ({
  iteration,
  members = [],
}) => {
  const workItems = useMemo(() => {
    return (
      iteration.workItems || [
        ...(iteration.requirements || []),
        ...(iteration.tasks || []),
        ...(iteration.defects || []),
      ]
    );
  }, [iteration]);

  const stats = useMemo(() => {
    const total = workItems.length;
    const completed = workItems.filter((i) =>
      ["DONE", "COMPLETED", "CLOSED"].includes(i.status || ""),
    ).length;
    const inProgress = workItems.filter((i) =>
      ["IN_PROGRESS", "DEVELOPING", "TESTING"].includes(i.status || ""),
    ).length;

    const totalEstimated = workItems.reduce((acc, i) => acc + (i.estimatedHours || 0), 0);
    const totalActual = workItems.reduce((acc, i) => acc + (i.actualHours || 0), 0);

    return {
      total,
      completed,
      inProgress,
      todo: total - completed - inProgress,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      totalEstimated,
      totalActual,
      remainingHours: Math.max(0, totalEstimated - totalActual),
    };
  }, [workItems]);

  const typeDistribution = useMemo(() => {
    const dist = { requirement: 0, task: 0, defect: 0 };
    workItems.forEach((item) => {
      const type = (item.type || "").toLowerCase();
      if (type.includes("requirement")) dist.requirement++;
      else if (type.includes("task")) dist.task++;
      else if (type.includes("defect") || type.includes("bug")) dist.defect++;
    });
    return dist;
  }, [workItems]);

  const daysRemaining = useMemo(() => {
    const end = new Date(iteration.endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [iteration.endDate]);

  // Enhanced Burndown Data generation
  const burndownData = useMemo(() => {
    const days = 14; // Default iteration length
    const total = stats.totalEstimated || 100;
    const completed = stats.totalActual || 0;
    const data = [];

    for (let i = 0; i <= 10; i++) {
      // Current progress (day 0 to 10)
      const ideal = total - (total / days) * i;
      let actual;
      if (i === 0) actual = total;
      else if (i <= 7) {
        // Random progress for mock visual
        actual = total - (total / days) * i * (0.8 + Math.random() * 0.4);
      } else {
        // Closer to current remaining
        actual = stats.remainingHours + (10 - i) * (total / days);
      }
      data.push({ day: i, remaining: Math.max(0, actual), ideal: Math.max(0, ideal) });
    }
    return data;
  }, [stats]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 顶部概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Target className="text-blue-500" />}
          label="迭代进度"
          value={`${stats.completionRate}%`}
          subValue={`已完成 ${stats.completed} / ${stats.total}`}
          progress={stats.completionRate}
          color="blue"
        />
        <StatCard
          icon={<Clock className="text-emerald-500" />}
          label="工时消耗"
          value={`${stats.totalActual}h`}
          subValue={`总预计 ${stats.totalEstimated}h`}
          progress={(stats.totalActual / (stats.totalEstimated || 1)) * 100}
          color="emerald"
        />
        <StatCard
          icon={<Calendar className="text-orange-500" />}
          label="剩余时间"
          value={`${daysRemaining}天`}
          subValue={`截止日期: ${format(new Date(iteration.endDate), "MM.dd")}`}
          progress={100 - (daysRemaining / 14) * 100} // Assuming 14 day iteration
          color="orange"
        />
        <StatCard
          icon={<AlertCircle className="text-red-500" />}
          label="风险项"
          value="2"
          subValue="1个高风险待处理"
          progress={20}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 燃尽图 */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <h3 className="text-base font-bold text-zinc-900">工时燃尽图</h3>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-zinc-400">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>剩余工时</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-zinc-200"></div>
                <span>理想基准线</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full relative pt-4">
            <svg className="w-full h-full overflow-visible">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line
                  key={i}
                  x1="0"
                  y1={`${i * 25}%`}
                  x2="100%"
                  y2={`${i * 25}%`}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
              ))}

              {/* Ideal line */}
              <line
                x1="0"
                y1="0%"
                x2="100%"
                y2="100%"
                stroke="#e2e8f0"
                strokeWidth="2"
                strokeDasharray="4 4"
              />

              {/* Burndown line */}
              <path
                d={`M ${burndownData.map((d, i) => `${(i / (burndownData.length - 1)) * 100}% ${(1 - d.remaining / (stats.totalEstimated || 1)) * 100}%`).join(" L ")}`}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-500"
              />

              {/* Area under curve */}
              <path
                d={`M 0 100% L ${burndownData.map((d, i) => `${(i / (burndownData.length - 1)) * 100}% ${(1 - d.remaining / (stats.totalEstimated || 1)) * 100}%`).join(" L ")} L 100% 100% Z`}
                fill="url(#gradient)"
                className="opacity-10 transition-all duration-500"
              />

              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Data points */}
              {burndownData.map((d, i) => (
                <circle
                  key={i}
                  cx={`${(i / (burndownData.length - 1)) * 100}%`}
                  cy={`${(1 - d.remaining / (stats.totalEstimated || 1)) * 100}%`}
                  r="4"
                  fill="white"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  className="transition-all duration-500"
                />
              ))}
            </svg>
          </div>

          <div className="flex justify-between mt-4 text-[10px] text-zinc-400 font-medium">
            <span>开始</span>
            <span>第3天</span>
            <span>第7天</span>
            <span>第10天</span>
            <span>完成</span>
          </div>
        </div>

        {/* 工作项分布 */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-emerald-500" />
            <h3 className="text-base font-bold text-zinc-900">工作项分布</h3>
          </div>

          <div className="space-y-6">
            <DistributionItem
              label="业务需求"
              count={typeDistribution.requirement}
              total={stats.total}
              color="bg-blue-500"
            />
            <DistributionItem
              label="开发任务"
              count={typeDistribution.task}
              total={stats.total}
              color="bg-emerald-500"
            />
            <DistributionItem
              label="缺陷修复"
              count={typeDistribution.defect}
              total={stats.total}
              color="bg-red-500"
            />
          </div>

          <div className="mt-10 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-zinc-700">迭代健康度: 良好</span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              当前迭代进度正常，需求覆盖完整。建议关注“缺陷修复”项，确保发布质量。
            </p>
          </div>
        </div>
      </div>

      {/* 成员负荷 */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-zinc-500" />
            <h3 className="text-base font-bold text-zinc-900">团队成员负荷</h3>
          </div>
          <button className="text-[11px] text-blue-600 font-bold hover:underline flex items-center gap-1">
            查看详情 <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {members.slice(0, 4).map((member, i) => {
            const memberItems = workItems.filter((item) => item.assignee?.id === member.id);
            const memberHours = memberItems.reduce(
              (acc, item) => acc + (item.estimatedHours || 0),
              0,
            );
            const load = Math.min(100, (memberHours / 40) * 100);

            return (
              <div key={i} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-bold text-zinc-600 border border-zinc-200">
                      {member.user?.name?.[0] || member.name?.[0] || "U"}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-900">
                        {member.user?.name || member.name}
                      </p>
                      <p className="text-[10px] text-zinc-400">{member.role || "团队成员"}</p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-bold",
                      load > 90
                        ? "text-red-500"
                        : load > 70
                          ? "text-orange-500"
                          : "text-emerald-500",
                    )}
                  >
                    {load}%
                  </span>
                </div>
                <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      load > 90 ? "bg-red-500" : load > 70 ? "bg-orange-500" : "bg-emerald-500",
                    )}
                    style={{ width: `${load}%` }}
                  />
                </div>
                <p className="text-[10px] text-zinc-500">
                  {memberItems.length} 个任务 | {memberHours}h 预计
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, subValue, progress, color }: any) => (
  <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center">{icon}</div>
      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{label}</span>
    </div>
    <div className="space-y-2">
      <h4 className="text-2xl font-bold text-zinc-900">{value}</h4>
      <div className="h-1 bg-zinc-50 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            color === "blue"
              ? "bg-blue-500"
              : color === "emerald"
                ? "bg-emerald-500"
                : color === "orange"
                  ? "bg-orange-500"
                  : "bg-red-500",
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-[11px] text-zinc-500 font-medium">{subValue}</p>
    </div>
  </div>
);

const DistributionItem = ({ label, count, total, color }: any) => (
  <div className="space-y-2">
    <div className="flex justify-between text-[11px] font-bold">
      <span className="text-zinc-500">{label}</span>
      <span className="text-zinc-900">{count}</span>
    </div>
    <div className="h-2 bg-zinc-50 rounded-full overflow-hidden">
      <div
        className={cn("h-full rounded-full", color)}
        style={{ width: `${(count / (total || 1)) * 100}%` }}
      />
    </div>
  </div>
);
