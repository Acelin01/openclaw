"use client";

import {
  Activity,
  Users,
  Zap,
  AlertCircle,
  CheckCircle2,
  Clock,
  MessageSquare,
  Network,
  Cpu,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  Bot,
  Search,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";

const getRoleInfo = (id: string | undefined, name: string | undefined, identifier?: string) => {
  if (!id && !name && !identifier) return null;

  return {
    id: id || identifier || "unknown",
    label: name || "未知智能体",
    icon: Bot,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  };
};

const isEmoji = (str: string | null | undefined) => {
  if (!str) return false;
  return /\p{Emoji}/u.test(str) && str.length <= 8;
};

import { Progress, Badge, Card, Button, Input } from "@uxin/ui";
import { cn } from "../lib/utils";
import { Mermaid } from "./mermaid";

interface AgentStatus {
  id: string;
  name: string;
  role: string;
  status: "idle" | "working" | "error";
  lastActive: string;
  tasksCompleted: number;
  successRate: number;
  load: number;
  avatar?: string;
  identifier?: string;
}

interface CollaborationEvent {
  id: string;
  from: string;
  to: string;
  type: string;
  timestamp: string;
  status: "pending" | "completed" | "failed";
  message: string;
  priority?: "low" | "normal" | "high" | "emergency";
}

interface ProjectRisk {
  type: string;
  severity: "low" | "medium" | "high";
  target: string;
  message: string;
  recommendation: string;
}

interface AgentDashboardData {
  projectId: string;
  projectName: string;
  agents: AgentStatus[];
  events: CollaborationEvent[];
  risks?: ProjectRisk[];
  mermaidFlow: string;
  mermaidGantt?: string;
  metrics: {
    totalTasks: number;
    avgResponseTime: string;
    systemHealth: number;
    activeCollaborations: number;
    bottlenecks?: number;
  };
}

export function AgentDashboard({ content, sendMessage }: { content: string; sendMessage?: any }) {
  const [data, setData] = useState<AgentDashboardData | null>(null);
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
  const [command, setCommand] = useState("");

  const handleSendCommand = (text?: string) => {
    const finalCommand = text || command;
    if (!finalCommand.trim() || !sendMessage) return;

    sendMessage({
      parts: [
        {
          type: "text",
          text: finalCommand,
        },
      ],
    });
    setCommand("");
  };

  useEffect(() => {
    if (!content) return;
    try {
      // In a real scenario, this might be a JSON string or a specialized format
      const parsed = JSON.parse(content);
      setData(parsed);
    } catch (e) {
      console.error("Failed to parse agent dashboard content", e);
    }
  }, [content]);

  // Automatic polling for real-time updates
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    const controller = new AbortController();

    const pollData = async () => {
      try {
        const res = await fetch("/api/mcp/health?type=dashboard", {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const result = await res.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (error: any) {
        // Only log if not an abort error
        if (error.name !== "AbortError") {
          console.warn("Failed to poll agent dashboard data:", error.message || error);
        }
      } finally {
        // Schedule next poll
        timerId = setTimeout(pollData, 10000);
      }
    };

    // Only start polling if we have initial data
    if (data) {
      timerId = setTimeout(pollData, 10000);
    }

    return () => {
      if (timerId) clearTimeout(timerId);
      controller.abort();
    };
  }, [data === null]); // Only re-run if data becomes non-null or null

  const activeAgent = useMemo(() => {
    if (!data?.agents || data.agents.length === 0) return null;
    return data.agents.find((a) => a.id === activeAgentId) || data.agents[0];
  }, [data, activeAgentId]);

  if (!data)
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">加载智能体系统状态...</p>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col h-full bg-slate-50/50 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Network className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {data.projectName} - 智能体协作中心
            </h2>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> ACP 2.0 协议运行中
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              系统健康度
            </span>
            <div className="flex items-center gap-1">
              <Progress value={data.metrics?.systemHealth || 0} className="w-24 h-1.5" />
              <span className="text-xs font-bold text-primary">
                {data.metrics?.systemHealth || 0}%
              </span>
            </div>
          </div>
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-600 border-emerald-100 gap-1"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            实时同步中
          </Badge>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Zap className="text-amber-500" />}
            label="总任务数"
            value={data.metrics?.totalTasks?.toString() || "0"}
            subValue="过去 24 小时"
          />
          <StatCard
            icon={<Clock className="text-blue-500" />}
            label="平均响应"
            value={data.metrics?.avgResponseTime || "0ms"}
            subValue="毫秒级处理"
          />
          <StatCard
            icon={<Users className="text-purple-500" />}
            label="活动协作"
            value={data.metrics?.activeCollaborations?.toString() || "0"}
            subValue="个并行线程"
          />
          <StatCard
            icon={
              <AlertCircle
                className={cn(
                  data.metrics?.bottlenecks && data.metrics.bottlenecks > 0
                    ? "text-red-500"
                    : "text-emerald-500",
                )}
              />
            }
            label="潜在风险"
            value={data.metrics?.bottlenecks?.toString() || "0"}
            subValue={
              data.metrics?.bottlenecks && data.metrics.bottlenecks > 0
                ? "发现协作瓶颈"
                : "所有服务正常"
            }
          />
        </div>

        {/* Predictive Risks */}
        {data.risks && data.risks.length > 0 && (
          <Card className="p-4 bg-red-50/30 border-red-100 rounded-3xl overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 font-bold text-red-800 mb-4 px-2">
              <AlertCircle className="w-5 h-5" />
              智能风险预测与建议
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.risks.map((risk, idx) => (
                <div
                  key={`risk-${idx}-${risk.type}`}
                  className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-red-100 flex gap-4 shadow-sm"
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      risk.severity === "high"
                        ? "bg-red-100 text-red-600"
                        : "bg-amber-100 text-amber-600",
                    )}
                  >
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-800 text-sm">{risk.type}</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] uppercase",
                          risk.severity === "high"
                            ? "text-red-600 border-red-200 bg-red-50"
                            : "text-amber-600 border-amber-200 bg-amber-50",
                        )}
                      >
                        {risk.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{risk.message}</p>
                    <div className="text-xs bg-slate-50 p-2 rounded-lg text-slate-500 flex items-start gap-2 border border-slate-100 mb-3">
                      <ShieldCheck className="w-3.5 h-3.5 mt-0.5 text-primary" />
                      <div>
                        <span className="font-semibold text-slate-700">建议方案：</span>
                        {risk.recommendation}
                      </div>
                    </div>
                    {sendMessage && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs gap-2 rounded-xl h-8 border-slate-200 hover:bg-primary hover:text-white hover:border-primary transition-all"
                        onClick={() =>
                          sendMessage({
                            parts: [
                              {
                                type: "text",
                                text: `@项目负责人智能体 针对风险项 "${risk.message}"，请执行建议方案: ${risk.recommendation}`,
                              },
                            ],
                            thinking: true,
                          })
                        }
                      >
                        立即处理风险
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Collaboration Graph */}
          <Card className="lg:col-span-2 p-6 rounded-3xl border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <Network className="w-5 h-5 text-primary" />
                协作拓扑结构
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary" className="text-[10px]">
                  MERMAID
                </Badge>
                <Badge variant="secondary" className="text-[10px]">
                  ACP 2.0
                </Badge>
              </div>
            </div>
            <div className="flex-1 bg-slate-50 rounded-2xl p-4 overflow-auto flex items-center justify-center">
              <Mermaid code={data.mermaidFlow} />
            </div>
          </Card>

          {/* Agent List */}
          <Card className="p-6 rounded-3xl border-slate-100 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 font-bold text-slate-800 mb-6">
              <Cpu className="w-5 h-5 text-primary" />
              智能体实例
            </div>
            <div className="space-y-3 flex-1 overflow-y-auto">
              {data.agents?.map((agent) => (
                <Button
                  variant="ghost"
                  key={agent.id}
                  onClick={() => setActiveAgentId(agent.id)}
                  className={cn(
                    "w-full p-4 h-auto rounded-2xl border transition-all flex items-center gap-3 text-left group border-none",
                    activeAgentId === agent.id ||
                      (!activeAgentId && data.agents?.[0]?.id === agent.id)
                      ? "bg-primary/5 border-primary/20 shadow-sm hover:bg-primary/5"
                      : "bg-white border-slate-100 hover:border-primary/20 hover:bg-slate-50",
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden shadow-sm text-lg",
                      getRoleInfo(agent.id, agent.name, agent.identifier)?.bg ||
                        (agent.status === "working"
                          ? "bg-primary"
                          : agent.status === "error"
                            ? "bg-red-500"
                            : "bg-slate-300"),
                    )}
                  >
                    {agent.avatar && !agent.avatar.startsWith("/agents/") ? (
                      isEmoji(agent.avatar) ? (
                        <span>{agent.avatar}</span>
                      ) : (
                        <img
                          src={agent.avatar}
                          alt={agent.name}
                          className="w-full h-full object-cover"
                        />
                      )
                    ) : (
                      (() => {
                        const roleInfo = getRoleInfo(agent.id, agent.name, agent.identifier);
                        if (roleInfo) {
                          const Icon = roleInfo.icon;
                          return <Icon className={cn("w-5 h-5", roleInfo.color)} />;
                        }
                        return <span className="text-white font-bold">{agent.name.charAt(0)}</span>;
                      })()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 truncate">{agent.name}</span>
                      <span
                        className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase",
                          agent.status === "working"
                            ? "bg-blue-100 text-blue-600"
                            : agent.status === "error"
                              ? "bg-red-100 text-red-600"
                              : "bg-slate-100 text-slate-500",
                        )}
                      >
                        {agent.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{agent.role}</p>
                  </div>
                </Button>
              ))}
            </div>
          </Card>
        </div>

        {/* Gantt Chart & Roadmap */}
        {data.mermaidGantt && (
          <div className="mt-6">
            <Card className="p-6 rounded-3xl border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <Clock className="w-5 h-5 text-primary" />
                  项目动态路线图 (Gantt)
                </div>
                <Badge className="bg-emerald-100 text-emerald-600 border-none">
                  关键路径已计算
                </Badge>
              </div>
              <div className="w-full overflow-x-auto pb-2 scrollbar-thin">
                <div className="min-w-[800px]">
                  <Mermaid
                    code={data.mermaidGantt}
                    caption="项目进度甘特图"
                    className="border-none shadow-none"
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Active Agent Details */}
          {activeAgent && (
            <Card className="p-6 rounded-3xl border-slate-100 shadow-sm">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-md overflow-hidden text-2xl",
                    getRoleInfo(activeAgent.id, activeAgent.name)?.bg || "bg-primary/10",
                  )}
                >
                  {activeAgent.avatar ? (
                    isEmoji(activeAgent.avatar) ? (
                      <span>{activeAgent.avatar}</span>
                    ) : (
                      <img
                        src={activeAgent.avatar}
                        alt={activeAgent.name}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    )
                  ) : (
                    (() => {
                      const roleInfo = getRoleInfo(activeAgent.id, activeAgent.name);
                      if (roleInfo) {
                        const Icon = roleInfo.icon;
                        return <Icon className={cn("w-8 h-8", roleInfo.color)} />;
                      }
                      return (
                        <span className="text-2xl font-bold text-primary">
                          {activeAgent.name.charAt(0)}
                        </span>
                      );
                    })()
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 font-bold text-slate-800 text-lg">
                    <Activity className="w-5 h-5 text-primary" />
                    实例详情: {activeAgent.name}
                  </div>
                  <p className="text-sm text-slate-500">{activeAgent.role}</p>
                </div>
              </div>
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none">
                {activeAgent.successRate}% 成功率
              </Badge>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-xs text-slate-500 mb-1">已完成任务</p>
                  <p className="text-xl font-bold text-slate-800">{activeAgent.tasksCompleted}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-xs text-slate-500 mb-1">当前负载</p>
                  <div className="flex items-end gap-2">
                    <p className="text-xl font-bold text-slate-800">{activeAgent.load}%</p>
                    <Progress value={activeAgent.load} className="w-full mb-2 h-1.5" />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">最后活动</span>
                  <span className="text-slate-800 font-medium">{activeAgent.lastActive}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">调用协议</span>
                  <span className="text-slate-800 font-medium">ACP 2.0 / gRPC</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">执行环境</span>
                  <span className="text-slate-800 font-medium text-xs font-mono bg-slate-100 px-2 py-0.5 rounded">
                    worker-v4-standard
                  </span>
                </div>
              </div>

              {sendMessage && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <Button
                    className="w-full rounded-2xl gap-2 bg-primary hover:bg-primary/90 text-white shadow-sm"
                    onClick={() => {
                      setCommand(`@${activeAgent.name} `);
                      const input = document.getElementById("dashboard-command-input");
                      input?.focus();
                    }}
                  >
                    <MessageSquare className="w-4 h-4" />
                    发送协作指令
                  </Button>
                </div>
              )}
            </Card>
          )}

          {/* Real-time Events */}
          <Card className="p-6 rounded-3xl border-slate-100 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <MessageSquare className="w-5 h-5 text-primary" />
                协作日志流
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                <Input
                  type="text"
                  placeholder="过滤事件..."
                  className="pl-8 pr-3 py-1 bg-slate-50 border-none rounded-full text-xs w-32 focus:ring-1 focus:ring-primary/20 h-7"
                />
              </div>
            </div>
            <div className="space-y-4 flex-1 overflow-y-auto max-h-[300px] pr-2 scrollbar-thin">
              {data.events?.map((event) => (
                <div key={event.id} className="flex gap-3 relative group">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-2.5 h-2.5 rounded-full z-10",
                        event.status === "completed"
                          ? "bg-emerald-500"
                          : event.status === "failed"
                            ? "bg-red-500"
                            : "bg-blue-500 animate-pulse",
                      )}
                    />
                    <div className="w-px h-full bg-slate-100 absolute top-2.5" />
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
                        {event.from} <span className="text-slate-400 font-normal">→</span>{" "}
                        {event.to}
                        {event.priority && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[8px] px-1 py-0 h-3.5 border-none",
                              event.priority === "emergency"
                                ? "bg-red-100 text-red-600"
                                : event.priority === "high"
                                  ? "bg-orange-100 text-orange-600"
                                  : "bg-slate-100 text-slate-600",
                            )}
                          >
                            {event.priority}
                          </Badge>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">{event.timestamp}</span>
                    </div>
                    <div className="text-xs text-slate-600 bg-white border border-slate-100 p-2 rounded-xl group-hover:border-primary/20 transition-colors">
                      <span className="font-bold text-primary mr-2">[{event.type}]</span>
                      {event.message}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Command Input Bar */}
      {sendMessage && (
        <div className="p-6 bg-white border-t border-slate-100">
          <div className="relative max-w-4xl mx-auto">
            <Input
              id="dashboard-command-input"
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendCommand()}
              placeholder='输入指令，例如 "@研发负责人 检查系统延迟原因"...'
              className="w-full pl-12 pr-24 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 transition-all shadow-inner h-14"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <Button
                size="sm"
                onClick={() => handleSendCommand()}
                disabled={!command.trim()}
                className="rounded-xl px-4"
              >
                执行
              </Button>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 text-center mt-3">
            提示：使用 <span className="font-bold text-slate-600">@智能体名称</span>{" "}
            进行跨智能体协作指令
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subValue,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValueText?: string;
  subValue?: string;
}) {
  return (
    <Card className="p-4 rounded-2xl border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-slate-50 rounded-xl">{icon}</div>
        <span className="text-xs font-medium text-slate-500">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-slate-800">{value}</span>
        {subValue && <span className="text-[10px] text-slate-400">{subValue}</span>}
      </div>
    </Card>
  );
}
