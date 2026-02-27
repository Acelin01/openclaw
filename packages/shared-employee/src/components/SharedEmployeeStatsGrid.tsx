import { clsx, type ClassValue } from "clsx";
import { Users, Briefcase, Star, Target, TrendingUp, Clock } from "lucide-react";
import React from "react";
import { twMerge } from "tailwind-merge";
import { SharedEmployeeStats as ISharedEmployeeStats } from "../types";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SharedEmployeeStatsGridProps {
  stats: ISharedEmployeeStats;
  loading?: boolean;
  className?: string;
}

export const SharedEmployeeStatsGrid: React.FC<SharedEmployeeStatsGridProps> = ({
  stats = { totalEmployees: 0, availableEmployees: 0, totalAssignments: 0, totalSkills: 0 },
  loading,
  className,
}) => {
  const statItems = [
    {
      title: "总共享员工",
      value: stats?.totalEmployees || 0,
      change: "+2",
      positive: true,
      icon: Users,
      color: "emerald",
      bgColor: "bg-[#eef8f3]",
      textColor: "text-[#1dbf73]",
      borderColor: "border-[#1dbf73]",
    },
    {
      title: "当前空闲",
      value: stats?.availableEmployees || 0,
      change: "85%",
      label: "利用率",
      icon: Clock,
      color: "blue",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      borderColor: "border-blue-400",
    },
    {
      title: "进行中项目",
      value: stats?.totalAssignments || 0,
      change: "12",
      label: "本月新增",
      icon: Target,
      color: "orange",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
      borderColor: "border-orange-400",
    },
    {
      title: "技能覆盖",
      value: stats?.totalSkills || 0,
      change: "98%",
      label: "匹配度",
      icon: TrendingUp,
      color: "purple",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      borderColor: "border-purple-400",
    },
  ];

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", className)}>
      {statItems.map((item, index) => (
        <div
          key={index}
          className={cn(
            "bg-white rounded-2xl p-6 border-t-4 shadow-sm hover:shadow-md transition-all",
            item.borderColor,
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={cn("p-3 rounded-xl", item.bgColor, item.textColor)}>
              <item.icon size={24} />
            </div>
            {item.label && (
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {item.label}
              </span>
            )}
          </div>

          <div>
            <p className="text-sm font-bold text-gray-500 mb-1">{item.title}</p>
            <div className="flex items-baseline gap-2">
              <h4 className="text-3xl font-black text-gray-900">{loading ? "..." : item.value}</h4>
              <span
                className={cn(
                  "text-xs font-bold px-1.5 py-0.5 rounded-md",
                  item.positive ? "bg-[#eef8f3] text-[#1dbf73]" : "bg-gray-50 text-gray-500",
                )}
              >
                {item.change}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
