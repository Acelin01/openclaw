import { Clock, CheckSquare, Activity, MessageSquare, Link, Hourglass } from "lucide-react";
import React from "react";
import { RequirementStats } from "../types";

export const RequirementStatsView = ({ stats }: { stats: RequirementStats }) => {
  if (!stats) return null;

  const items = [
    {
      label: "子项进度",
      value: `${Math.round(stats.subItemProgress)}%`,
      icon: CheckSquare,
      color: "text-green-500",
    },
    { label: "总工时", value: `${stats.totalHours}h`, icon: Clock, color: "text-blue-500" },
    { label: "动态", value: stats.counts.activities, icon: Activity, color: "text-orange-500" },
    { label: "评价", value: stats.counts.reviews, icon: MessageSquare, color: "text-purple-500" },
    { label: "关联", value: stats.counts.links, icon: Link, color: "text-slate-500" },
    { label: "任务", value: stats.counts.tasks, icon: Hourglass, color: "text-indigo-500" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      {items.map((item, index) => (
        <div key={index} className="flex flex-col items-center justify-center p-2">
          <item.icon className={`w-5 h-5 mb-1 ${item.color}`} />
          <span className="text-lg font-bold text-gray-900 dark:text-white">{item.value}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{item.label}</span>
        </div>
      ))}
    </div>
  );
};
