"use client";

import { LayoutDashboard, Activity, CheckCircle2, Zap, AlertCircle } from "lucide-react";
import { useArtifact } from "../../hooks/use-artifact";

interface AgentDashboardToolProps {
  part: any;
}

export function AgentDashboardTool({ part }: AgentDashboardToolProps) {
  const { toolCallId, state } = part;
  const { setArtifact } = useArtifact();

  if (state !== "output-available") {
    return null;
  }

  const { metrics, title, projectId, recentActivity } = part.output;

  return (
    <div className="not-prose mb-4 w-full" key={toolCallId}>
      <div
        className="bg-white border border-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        onClick={() => {
          setArtifact((current: any) => ({
            ...current,
            documentId: projectId,
            title: title,
            kind: "agent-dashboard",
            isVisible: true,
            status: "idle",
            content: JSON.stringify(part.output.initialData || part.output),
          }));
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:scale-110 transition-transform">
              <LayoutDashboard size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-800">{title}</h4>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">实时协同看板</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/5 px-2 py-1 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            LIVE
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="p-2 bg-zinc-50 rounded-xl border border-zinc-100/50">
            <div className="flex items-center gap-1 text-zinc-500 mb-1">
              <CheckCircle2 size={10} />
              <span className="text-[10px]">完成率</span>
            </div>
            <div className="text-sm font-bold text-zinc-800">{metrics?.completionRate}%</div>
          </div>
          <div className="p-2 bg-zinc-50 rounded-xl border border-zinc-100/50">
            <div className="flex items-center gap-1 text-zinc-500 mb-1">
              <Zap size={10} />
              <span className="text-[10px]">活跃任务</span>
            </div>
            <div className="text-sm font-bold text-zinc-800">{metrics?.activeTasks}</div>
          </div>
          <div className="p-2 bg-zinc-50 rounded-xl border border-zinc-100/50">
            <div className="flex items-center gap-1 text-zinc-500 mb-1">
              <AlertCircle size={10} />
              <span className="text-[10px]">风险指数</span>
            </div>
            <div className="text-sm font-bold text-zinc-800 capitalize">
              {metrics?.riskLevel === "medium" ? "中" : metrics?.riskLevel === "high" ? "高" : "低"}
            </div>
          </div>
        </div>

        {recentActivity && (
          <div className="flex items-center gap-2 py-2 px-3 bg-zinc-50 rounded-lg border border-zinc-100/50 text-[11px] text-zinc-600">
            <Activity size={12} className="text-primary" />
            <span className="font-medium text-zinc-400">最新动态:</span>
            <span className="truncate flex-1">{recentActivity.action}</span>
            <span className="text-[10px] text-zinc-400">{recentActivity.time}</span>
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-center text-[11px] font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          点击查看完整详情看板
        </div>
      </div>
    </div>
  );
}
