import { BarChart3, TrendingUp, PieChart, Users, Target, Activity } from "lucide-react";
import React from "react";
import { cn } from "./shared-ui";

interface ProjectAnalyticsProps {
  className?: string;
}

export const ProjectAnalytics: React.FC<ProjectAnalyticsProps> = ({ className }) => {
  const stats = [
    {
      label: "需求完成率",
      value: "85%",
      icon: Target,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    { label: "任务进度", value: "64%", icon: Activity, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "活跃成员", value: "12", icon: Users, color: "text-purple-500", bg: "bg-purple-50" },
    {
      label: "交付周期",
      value: "4.2d",
      icon: TrendingUp,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className={cn("space-y-6", className)}>
      {/* 核心统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                  stat.bg,
                  stat.color,
                )}
              >
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Live
              </span>
            </div>
            <h4 className="text-2xl font-black text-zinc-900 mb-1">{stat.value}</h4>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 趋势图表占位 */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
            <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-500" />
              生产力趋势
            </h3>
            <select className="text-xs font-bold bg-transparent border-none focus:ring-0 text-zinc-500">
              <option>过去 7 天</option>
              <option>过去 30 天</option>
            </select>
          </div>
          <div className="flex-1 min-h-[300px] flex items-center justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]">
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-zinc-100">
                <BarChart3 className="w-8 h-8 text-zinc-200" />
              </div>
              <p className="text-sm font-bold text-zinc-400">数据可视化加载中...</p>
            </div>
          </div>
        </div>

        {/* 分布占比占位 */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-zinc-100 bg-zinc-50/50">
            <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-emerald-500" />
              需求分布
            </h3>
          </div>
          <div className="flex-1 min-h-[300px] p-6 flex flex-col justify-center">
            <div className="relative w-40 h-40 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full border-[12px] border-zinc-100"></div>
              <div className="absolute inset-0 rounded-full border-[12px] border-emerald-500 border-t-transparent border-l-transparent rotate-45"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-zinc-900">12</span>
                <span className="text-[10px] font-bold text-zinc-400 uppercase">总计</span>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: "核心功能", value: 6, color: "bg-emerald-500" },
                { label: "优化改进", value: 4, color: "bg-blue-500" },
                { label: "缺陷修复", value: 2, color: "bg-zinc-300" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", item.color)}></div>
                    <span className="text-xs font-bold text-zinc-600">{item.label}</span>
                  </div>
                  <span className="text-xs font-black text-zinc-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
