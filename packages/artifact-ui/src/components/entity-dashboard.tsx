"use client";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Progress,
  Badge,
  Card,
  Button,
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@uxin/ui";
import {
  Activity,
  Users,
  Zap,
  AlertCircle,
  CheckCircle2,
  Clock,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  User,
  Target,
  BarChart3,
  Calendar,
  MoreVertical,
  Briefcase,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { cn } from "../lib/utils";
import { Mermaid } from "./mermaid";

interface Task {
  id: string;
  title: string;
  status: "pending" | "in_progress" | "completed" | "blocked";
  priority: "low" | "normal" | "high" | "urgent";
  deadline: string;
  progress: number;
}

interface Collaboration {
  id: string;
  partnerName: string;
  partnerRole: string;
  type: string;
  timestamp: string;
  message: string;
}

interface Alert {
  id: string;
  type: "warning" | "error" | "info";
  message: string;
  timestamp: string;
}

interface EntityDashboardData {
  entity: {
    id: string;
    name: string;
    role: string;
    type: "agent" | "freelancer" | "member";
    status: "online" | "busy" | "offline";
    avatar?: string;
    bio?: string;
  };
  metrics: {
    completionRate: number;
    avgHandleTime: string;
    activeTasks: number;
    workload: number;
    reliabilityScore: number;
  };
  tasks: Task[];
  alerts: Alert[];
  collaborations: Collaboration[];
  mermaidWorkflow?: string;
}

export function EntityDashboard({ content, sendMessage }: { content: string; sendMessage?: any }) {
  const [data, setData] = useState<EntityDashboardData | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "tasks" | "collaboration">("overview");

  const isEmoji = (str: string | null | undefined) => {
    if (!str) return false;
    return /\p{Emoji}/u.test(str) && str.length <= 8;
  };

  useEffect(() => {
    if (!content) return;
    try {
      const parsed = JSON.parse(content);
      setData(parsed);
    } catch (e) {
      console.error("Failed to parse entity dashboard content", e);
    }
  }, [content]);

  if (!data)
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">加载主体工作面板...</p>
        </div>
      </div>
    );

  const statusColors = {
    online: "bg-emerald-500",
    busy: "bg-amber-500",
    offline: "bg-slate-400",
  };

  const priorityColors = {
    low: "bg-slate-100 text-slate-600",
    normal: "bg-blue-50 text-blue-600",
    high: "bg-amber-50 text-amber-600",
    urgent: "bg-red-50 text-red-600",
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 overflow-hidden">
      {/* Header / Profile */}
      <header className="bg-white border-b border-slate-100 p-6 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="w-16 h-16 rounded-2xl shadow-sm border-2 border-white">
              {data.entity.avatar ? (
                isEmoji(data.entity.avatar) ? (
                  <div className="flex items-center justify-center w-full h-full text-2xl">
                    {data.entity.avatar}
                  </div>
                ) : (
                  <AvatarImage src={data.entity.avatar} />
                )
              ) : null}
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {data.entity.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div
              className={cn(
                "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm",
                statusColors[data.entity.status],
              )}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-800">{data.entity.name}</h2>
              <Badge
                variant="secondary"
                className="bg-slate-100 text-slate-500 text-[10px] uppercase font-bold tracking-wider"
              >
                {data.entity.type}
              </Badge>
            </div>
            <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
              <Briefcase className="w-3.5 h-3.5" />
              {data.entity.role}
            </p>
            {data.entity.bio && (
              <p className="text-xs text-slate-400 mt-2 max-w-md line-clamp-1">{data.entity.bio}</p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="rounded-xl border-slate-200">
            <MessageSquare className="w-4 h-4 mr-2" />
            发起沟通
          </Button>
          <Button size="sm" className="rounded-xl bg-primary hover:bg-primary/90">
            分配任务
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <div className="px-6 pt-4 bg-white border-b border-slate-100">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="bg-transparent h-auto p-0 gap-6">
            <TabsTrigger
              value="overview"
              className="px-0 pb-3 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary text-slate-500 data-[state=active]:text-primary font-medium transition-all"
            >
              工作概览
            </TabsTrigger>
            <TabsTrigger
              value="tasks"
              className="px-0 pb-3 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary text-slate-500 data-[state=active]:text-primary font-medium transition-all"
            >
              任务清单
            </TabsTrigger>
            <TabsTrigger
              value="collaboration"
              className="px-0 pb-3 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary text-slate-500 data-[state=active]:text-primary font-medium transition-all"
            >
              协作动态
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <Tabs value={activeTab} className="w-full">
          <TabsContent value="overview" className="mt-0 space-y-6">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <MetricCard
                icon={<Target className="text-blue-500" />}
                label="任务完成率"
                value={`${data.metrics.completionRate}%`}
                progress={data.metrics.completionRate}
              />
              <MetricCard
                icon={<Clock className="text-amber-500" />}
                label="平均处理时长"
                value={data.metrics.avgHandleTime}
              />
              <MetricCard
                icon={<Zap className="text-emerald-500" />}
                label="活动任务"
                value={data.metrics.activeTasks.toString()}
              />
              <MetricCard
                icon={<BarChart3 className="text-purple-500" />}
                label="当前负载"
                value={`${data.metrics.workload}%`}
                progress={data.metrics.workload}
              />
              <MetricCard
                icon={<ShieldCheck className="text-indigo-500" />}
                label="可靠性评分"
                value={data.metrics.reliabilityScore.toString()}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content Area: Workflow or Stats */}
              <Card className="lg:col-span-2 p-6 rounded-3xl border-slate-100 shadow-sm flex flex-col min-h-[400px]">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <Activity className="w-5 h-5 text-primary" />
                    当前工作流
                  </div>
                </div>
                <div className="flex-1 bg-slate-50 rounded-2xl p-4 overflow-auto flex items-center justify-center">
                  {data.mermaidWorkflow ? (
                    <Mermaid code={data.mermaidWorkflow} />
                  ) : (
                    <div className="text-slate-400 text-sm italic">暂无工作流图示</div>
                  )}
                </div>
              </Card>

              {/* Sidebar: Alerts and Notifications */}
              <div className="space-y-6">
                <Card className="p-6 rounded-3xl border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2 font-bold text-slate-800 mb-4">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    智能预警
                  </div>
                  <div className="space-y-3">
                    {data.alerts.length > 0 ? (
                      data.alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={cn(
                            "p-3 rounded-2xl border flex gap-3 items-start",
                            alert.type === "error"
                              ? "bg-red-50 border-red-100"
                              : alert.type === "warning"
                                ? "bg-amber-50 border-amber-100"
                                : "bg-blue-50 border-blue-100",
                          )}
                        >
                          <div
                            className={cn(
                              "mt-0.5 w-1.5 h-1.5 rounded-full shrink-0",
                              alert.type === "error"
                                ? "bg-red-500"
                                : alert.type === "warning"
                                  ? "bg-amber-500"
                                  : "bg-blue-500",
                            )}
                          />
                          <div className="flex-1">
                            <p className="text-xs text-slate-800 leading-relaxed">
                              {alert.message}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1">{alert.timestamp}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-20" />
                        <p className="text-xs text-slate-400">目前没有任何预警</p>
                      </div>
                    )}
                  </div>
                </Card>

                <Card className="p-6 rounded-3xl border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2 font-bold text-slate-800 mb-4">
                    <Calendar className="w-5 h-5 text-primary" />
                    日程安排
                  </div>
                  <div className="space-y-4">
                    {data.tasks.slice(0, 3).map((task) => (
                      <div key={task.id} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary/30" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-700 truncate">
                            {task.title}
                          </p>
                          <p className="text-[10px] text-slate-400">{task.deadline}</p>
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-[10px] text-slate-400 hover:text-primary rounded-xl h-8"
                      onClick={() => setActiveTab("tasks")}
                    >
                      查看完整任务清单
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="mt-0">
            <div className="grid grid-cols-1 gap-4">
              {data.tasks.map((task) => (
                <Card
                  key={task.id}
                  className="p-4 rounded-2xl border-slate-100 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                          task.status === "completed"
                            ? "bg-emerald-50 text-emerald-500"
                            : task.status === "in_progress"
                              ? "bg-blue-50 text-blue-500"
                              : "bg-slate-50 text-slate-500",
                        )}
                      >
                        {task.status === "completed" ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Clock className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-800 truncate">
                            {task.title}
                          </h4>
                          <Badge
                            variant="outline"
                            className={cn("text-[10px] uppercase", priorityColors[task.priority])}
                          >
                            {task.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            截止: {task.deadline}
                          </span>
                          <div className="flex-1 max-w-[100px] flex items-center gap-2">
                            <Progress value={task.progress} className="h-1" />
                            <span className="text-[10px] font-bold text-slate-500">
                              {task.progress}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl h-8 w-8 text-slate-400"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="collaboration" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 px-1">
                  <Users className="w-4 h-4 text-primary" />
                  协作历史
                </h3>
                {data.collaborations.map((collab) => (
                  <div
                    key={collab.id}
                    className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex gap-4"
                  >
                    <Avatar className="w-10 h-10 rounded-xl">
                      <AvatarFallback className="bg-slate-100 text-slate-500 text-xs">
                        {collab.partnerName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800">
                            {collab.partnerName}
                          </span>
                          <span className="text-[10px] text-slate-400">{collab.partnerRole}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{collab.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed mb-2">
                        {collab.message}
                      </p>
                      <Badge
                        variant="secondary"
                        className="bg-slate-50 text-slate-500 text-[10px] font-medium border-none"
                      >
                        {collab.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <Card className="p-6 rounded-3xl border-slate-100 shadow-sm flex flex-col">
                <div className="flex items-center gap-2 font-bold text-slate-800 mb-6">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  协作互动面板
                </div>
                <div className="flex-1 bg-slate-50 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-sm">
                    <Users className="w-8 h-8 text-primary/40" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">快速协作</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-[200px] mx-auto">
                      你可以通过下方的对话框直接向 {data.entity.name} 发送协作指令或询问进度
                    </p>
                  </div>
                  {sendMessage && (
                    <Button
                      className="w-full rounded-2xl gap-2 bg-primary hover:bg-primary/90 text-white shadow-sm"
                      onClick={() => {
                        sendMessage({
                          parts: [
                            {
                              type: "text",
                              text: `@${data.entity.name} 请提供当前工作的最新进展。`,
                            },
                          ],
                          thinking: true,
                        });
                      }}
                    >
                      发送同步指令
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  progress,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  progress?: number;
}) {
  return (
    <Card className="p-4 rounded-2xl border-slate-100 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {label}
          </span>
        </div>
        <div className="text-xl font-bold text-slate-800">{value}</div>
      </div>
      {progress !== undefined && (
        <div className="mt-3">
          <Progress value={progress} className="h-1" />
        </div>
      )}
    </Card>
  );
}
