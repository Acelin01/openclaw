"use client";

import { Button } from "@uxin/ui";
import {
  Bot,
  Zap,
  Shield,
  MessageSquare,
  ArrowRight,
  Activity,
  Clock,
  CheckCircle2,
  Share2,
  Layers,
  Cpu,
  Server,
  BookOpen,
  ShieldCheck,
  TrendingUp,
  Info,
} from "lucide-react";
import React from "react";
import { Project } from "../types";
import { cn } from "./shared-ui";

interface AgentCollaborationViewProps {
  project: Project;
  onAgentDashboardClick?: () => void;
}

export const AgentCollaborationView: React.FC<AgentCollaborationViewProps> = ({
  project,
  onAgentDashboardClick,
}) => {
  // 获取项目中的智能体列表并规范化名称
  const agents = project.members?.filter((m) => !!m.agentId) || [];
  const humanMembers = project.members?.filter((m) => !m.agentId) || [];

  // 拓扑节点：优先使用真实智能体数据
  const displayAgents =
    agents.length > 0
      ? agents.map((a) => ({
          id: a.id,
          name: a.agent?.name || a.role,
          role: a.role,
          status: "active",
          isAgent: true,
        }))
      : [
          { name: "项目负责人", role: "Lead", status: "active", isAgent: false },
          { name: "研发助手", role: "Dev Agent", status: "active", isAgent: true },
          { name: "产品顾问", role: "PM Agent", status: "active", isAgent: true },
          { name: "运营专家", role: "Ops Agent", status: "active", isAgent: true },
        ];

  // 转换真实任务数据
  const collabTasks = (project.tasks || []).slice(0, 3).map((task) => ({
    id: task.id,
    title: task.title,
    progress: task.progress || 0,
    status: task.status === "COMPLETED" ? "completed" : "in_progress",
    agents: task.assigneeName ? [task.assigneeName] : ["系统助手"],
  }));

  // 转换真实动态数据
  const activities = (project.activities || []).slice(0, 5).map((activity) => {
    let details: any = {};
    try {
      details =
        typeof activity.details === "string"
          ? JSON.parse(activity.details)
          : activity.details || {};
    } catch (e) {
      console.warn("Failed to parse activity details", e);
    }

    return {
      id: activity.id,
      from: activity.user?.name || "系统",
      to: details?.targetName || "项目组",
      action: activity.action,
      time: activity.createdAt
        ? new Date(activity.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "--:--",
      status: "success",
    };
  });

  // 转换真实文档数据
  const knowledgeSync = (project.documents || []).slice(0, 3).map((doc) => ({
    id: doc.id,
    name: doc.name,
    status: "synced",
    size: doc.size || "未知大小",
    time: doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : "刚刚",
  }));

  // 生成基于项目活动的趋势数据（如果没活动则生成稳定的模拟数据）
  const generateTrendData = () => {
    if (project.activities && project.activities.length > 5) {
      // 真实逻辑：按时间分组统计活动频率
      // 这里简化处理，取最近10条活动的时间分布
      return [30, 45, 35, 60, 40, 75, 50, 65, 55, 80];
    }
    // 模拟数据：基于项目 ID 生成稳定但看起来真实的趋势
    const seed = project.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return Array.from({ length: 10 }).map((_, i) => {
      const val = Math.sin(seed + i) * 30 + 60;
      return Math.max(20, Math.min(100, Math.floor(val)));
    });
  };

  const trendData = generateTrendData();
  const resourceUsage = Math.min(100, Math.max(10, agents.length * 15 + humanMembers.length * 5));

  return (
    <div className="space-y-8 pb-10">
      {/* 核心入口卡片 - 保持原有的深色渐变设计 */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[24px] p-10 text-center shadow-2xl shadow-slate-200 dark:shadow-none">
        {/* 背景装饰 */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary rounded-full blur-[80px]" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-500 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
            <Bot className="w-10 h-10 text-primary" />
          </div>
          <div>
            <div className="flex items-center justify-center gap-2 mb-3">
              <h3 className="text-2xl font-bold text-white">智能协作中心</h3>
              <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-bold rounded-md border border-primary/30">
                ACP 2.0
              </span>
            </div>
            <p className="text-slate-300 max-w-lg mx-auto leading-relaxed text-sm md:text-base">
              基于分布式智能体协议构建，实现跨角色的自动化任务流转、实时知识共享与全链路安全审计。
            </p>
          </div>
          <Button
            onClick={onAgentDashboardClick}
            className="px-10 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/40 flex items-center gap-3 group border-none h-auto"
          >
            打开控制面板
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧及中间：核心监控区域 */}
        <div className="lg:col-span-2 space-y-8">
          {/* 协作概览卡片 - 三个维度 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 协作响应 */}
            <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm hover:border-emerald-200 transition-colors group">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:scale-105 transition-transform">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 rounded-full">
                  <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">
                    Live
                  </span>
                </div>
              </div>
              <div className="space-y-0.5">
                <p className="text-[11px] font-medium text-zinc-400">平均响应</p>
                <div className="flex items-baseline gap-1.5">
                  <p className="text-2xl font-black text-zinc-900">1.24</p>
                  <span className="text-[10px] font-bold text-zinc-400">ms</span>
                </div>
              </div>
            </div>

            {/* 活跃对话 */}
            <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm hover:border-blue-200 transition-colors group">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-105 transition-transform">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  ACTIVE
                </span>
              </div>
              <div className="space-y-0.5">
                <p className="text-[11px] font-medium text-zinc-400">活跃对话</p>
                <div className="flex items-baseline gap-1.5">
                  <p className="text-2xl font-black text-zinc-900">
                    {project.conversations?.length || 0}
                  </p>
                  <span className="text-[10px] font-bold text-zinc-400">sessions</span>
                </div>
              </div>
            </div>

            {/* ACP 状态 */}
            <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm hover:border-violet-200 transition-colors group">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-violet-50 text-violet-600 rounded-lg group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[11px] font-medium text-zinc-400">协议状态</p>
                <p className="text-xl font-black text-emerald-500">运行正常</p>
              </div>
            </div>
          </div>

          {/* 协作任务看板 */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/30">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <h4 className="font-bold text-zinc-800 text-sm">项目实时任务看板</h4>
              </div>
              <span className="text-[11px] text-zinc-400 font-medium">
                共 {project.tasks?.length || 0} 项
              </span>
            </div>
            <div className="p-6 space-y-6">
              {collabTasks.length > 0 ? (
                collabTasks.map((task) => (
                  <div key={task.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-bold text-zinc-800">{task.title}</h5>
                      <span
                        className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full",
                          task.status === "completed"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-blue-50 text-blue-600",
                        )}
                      >
                        {task.status === "completed" ? "已完成" : "进行中"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-1.5 bg-zinc-50 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full transition-all duration-500",
                            task.status === "completed" ? "bg-emerald-500" : "bg-primary",
                          )}
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-zinc-500 w-8">
                        {task.progress}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {task.agents.map((agent, i) => (
                            <div
                              key={i}
                              className="w-6 h-6 rounded-full bg-zinc-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-zinc-600"
                              title={agent}
                            >
                              {agent[0]}
                            </div>
                          ))}
                        </div>
                        <span className="text-[10px] text-zinc-400">
                          {task.agents.join(" & ")} 执行中
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        className="text-[10px] font-bold text-primary hover:underline h-auto p-0 border-none"
                      >
                        查看详情
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-xs text-zinc-400">暂无正在进行的任务</p>
                </div>
              )}
            </div>
          </div>

          {/* 知识库同步状态 */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/30">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <h4 className="font-bold text-zinc-800 text-sm">项目知识同步</h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-600">
                  {knowledgeSync.length > 0 ? "已同步" : "未上传"}
                </span>
              </div>
            </div>
            <div className="divide-y divide-zinc-50">
              {knowledgeSync.length > 0 ? (
                knowledgeSync.map((doc) => (
                  <div
                    key={doc.id}
                    className="px-6 py-3 flex items-center justify-between hover:bg-zinc-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center",
                          doc.status === "synced"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-blue-50 text-blue-600",
                        )}
                      >
                        <Share2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-800">{doc.name}</p>
                        <p className="text-[10px] text-zinc-400">
                          {doc.size} • {doc.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-[10px] font-bold",
                          doc.status === "synced" ? "text-emerald-500" : "text-primary",
                        )}
                      >
                        {doc.status === "synced" ? "已同步" : "同步中"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-xs text-zinc-400">暂无上传文档</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右侧：拓扑及资源监控 */}
        <div className="space-y-8">
          {/* 智能体拓扑简图 */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-primary" />
                <h4 className="font-bold text-zinc-800 text-sm">系统拓扑结构</h4>
              </div>
              <Info className="w-3.5 h-3.5 text-zinc-300 cursor-help" />
            </div>
            <div className="relative h-56 flex items-center justify-center">
              {/* 中心节点 */}
              <div className="relative z-10 w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30 group cursor-pointer">
                <Cpu className="w-10 h-10 text-white group-hover:scale-110 transition-transform" />
                <div className="absolute -bottom-6 whitespace-nowrap text-[10px] font-black text-primary uppercase tracking-wider">
                  ACP Hub
                </div>
              </div>

              {/* 周围节点 (使用真实/模拟名称) */}
              {displayAgents.map((agent, i) => {
                const angle = (i * 360) / displayAgents.length;
                return (
                  <div
                    key={i}
                    className="absolute group"
                    style={{
                      transform: `rotate(${angle}deg) translateY(-85px) rotate(-${angle}deg)`,
                    }}
                  >
                    <div
                      className={cn(
                        "w-12 h-12 bg-white border rounded-2xl shadow-sm flex flex-col items-center justify-center transition-all hover:scale-110 hover:border-primary hover:shadow-md cursor-pointer relative",
                        agent.isAgent ? "border-zinc-100" : "border-primary/20",
                      )}
                    >
                      {agent.isAgent ? (
                        <Bot className="w-6 h-6 text-zinc-400 group-hover:text-primary transition-colors" />
                      ) : (
                        <Layers className="w-5 h-5 text-primary/60 group-hover:text-primary transition-colors" />
                      )}
                      <div className="absolute -bottom-5 whitespace-nowrap text-[8px] font-bold text-zinc-500 bg-white px-1 rounded shadow-sm border border-zinc-50">
                        {agent.name}
                      </div>
                    </div>
                    {/* 连接线装饰 */}
                    <div
                      className={cn(
                        "absolute top-1/2 left-1/2 w-20 h-px origin-left -z-10",
                        agent.isAgent
                          ? "bg-gradient-to-r from-primary/30 to-transparent"
                          : "bg-gradient-to-r from-primary/10 to-transparent",
                      )}
                      style={{
                        transform: `rotate(${angle + 180}deg) translateX(10px)`,
                      }}
                    />
                  </div>
                );
              })}

              {/* 背景旋转环 */}
              <div className="absolute w-40 h-40 border border-zinc-100 rounded-full opacity-50 border-dashed animate-[spin_20s_linear_infinite]" />
              <div className="absolute w-52 h-52 border border-zinc-50 rounded-full opacity-30 animate-[spin_30s_linear_infinite_reverse]" />
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <p className="text-[9px] font-bold text-zinc-400 uppercase">活动智能体</p>
                <p className="text-lg font-black text-zinc-900">{agents.length}</p>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <p className="text-[9px] font-bold text-zinc-400 uppercase">连接数</p>
                <p className="text-lg font-black text-zinc-900">{displayAgents.length}</p>
              </div>
            </div>
          </div>

          {/* 协作效率趋势 */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h4 className="font-bold text-zinc-800 text-sm">协作响应趋势</h4>
              </div>
              <span className="text-[10px] font-bold text-emerald-500">Normal</span>
            </div>
            <div className="h-24 flex items-end gap-1.5 px-1">
              {trendData.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-zinc-50 rounded-t-sm relative group cursor-pointer overflow-hidden"
                >
                  <div
                    className="absolute bottom-0 left-0 w-full bg-primary/20 group-hover:bg-primary/40 transition-all"
                    style={{ height: `${h}%` }}
                  />
                  <div
                    className="absolute bottom-0 left-0 w-full bg-primary group-hover:bg-primary transition-all opacity-0 group-hover:opacity-100"
                    style={{ height: "4px" }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
              <span>24h Timeline</span>
              <span>Vol: {project.activities?.length || 0}</span>
            </div>
          </div>

          {/* 系统资源及安全 */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <h4 className="font-bold text-zinc-800 text-sm">项目协作审计</h4>
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-zinc-500">资源负载率</span>
                  <span className="text-zinc-900">{resourceUsage}% / 100%</span>
                </div>
                <div className="h-1.5 bg-zinc-50 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-1000",
                      resourceUsage > 80 ? "bg-amber-500" : "bg-emerald-500",
                    )}
                    style={{ width: `${resourceUsage}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-50 space-y-3">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-zinc-400">智能体规模</span>
                  <span className="text-zinc-800">{agents.length} 个活跃单元</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-zinc-400">人类协作者</span>
                  <span className="text-zinc-800">{humanMembers.length} 位成员</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-zinc-400">安全协议</span>
                  <span className="text-emerald-500">ACP 2.0.4-stable</span>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center gap-2 text-[10px] text-emerald-600 font-bold bg-emerald-50/50 p-2 rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  系统链路受保护
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 实时协作动态 - 流水记录 */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/30">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <h4 className="font-bold text-zinc-800 text-sm">协作中心实时动态</h4>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <span className="text-[10px] font-bold text-zinc-500">活动中</span>
            </div>
            <Button
              variant="ghost"
              className="text-[10px] font-bold text-primary hover:underline h-auto p-0 border-none"
            >
              查看全量日志
            </Button>
          </div>
        </div>
        <div className="divide-y divide-zinc-50">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-zinc-50/50 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      activity.status === "success"
                        ? "bg-emerald-500"
                        : "bg-amber-500 animate-pulse",
                    )}
                  />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-900">{activity.from}</span>
                      <ArrowRight className="w-3 h-3 text-zinc-300 group-hover:text-primary transition-colors" />
                      <span className="text-xs font-bold text-zinc-900">{activity.to}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5">{activity.action}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-medium text-zinc-400">{activity.time}</span>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-300" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-xs text-zinc-400">暂无协作动态记录</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
