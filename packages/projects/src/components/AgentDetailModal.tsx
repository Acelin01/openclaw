"use client";

import { Button } from "@uxin/ui";
import {
  Bot,
  X,
  Briefcase,
  Rocket,
  ListTodo,
  Shield,
  Calendar,
  Mail,
  ExternalLink,
  Loader2,
  LayoutDashboard,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { constructApiUrl } from "../lib/api";
import { Mermaid } from "./Mermaid";
import { cn, Badge } from "./shared-ui";

interface AgentDetailModalProps {
  agentId: string;
  onClose: () => void;
  token?: string;
}

export const AgentDetailModal: React.FC<AgentDetailModalProps> = ({ agentId, onClose, token }) => {
  const [agent, setAgent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgentDetail = async () => {
      setIsLoading(true);
      try {
        const url = constructApiUrl(`/api/v1/agents/${agentId}`);
        const response = await fetch(url.toString(), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch agent details");
        const result = await response.json();
        setAgent(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    if (agentId) {
      fetchAgentDetail();
    }
  }, [agentId, token]);

  if (!agentId) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="relative h-32 bg-gradient-to-r from-emerald-500 to-teal-600">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md transition-colors z-10 border-none"
          >
            <X className="w-6 h-6" />
          </Button>

          <div className="absolute -bottom-12 left-8 flex items-end gap-6">
            <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-xl">
              <div className="w-full h-full rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                <Bot className="w-12 h-12" />
              </div>
            </div>
            <div className="mb-2 pb-1">
              <h2 className="text-2xl font-black text-white drop-shadow-sm">
                {agent?.name || "智能体详情"}
              </h2>
              <p className="text-emerald-50 text-sm font-medium">@{agent?.identifier || "agent"}</p>
            </div>
          </div>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto pt-16 px-8 pb-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
              <p className="text-zinc-500 font-medium">正在获取智能体深度资料...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-rose-500 font-bold">{error}</p>
              <Button
                variant="ghost"
                onClick={onClose}
                className="mt-4 text-emerald-600 font-bold border-none"
              >
                关闭窗口
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* 左侧：基本信息与提示词 */}
              <div className="lg:col-span-2 space-y-8">
                <section>
                  <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    核心提示词 (Prompt)
                  </h3>
                  <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100 relative group">
                    <p className="text-zinc-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {agent.prompt || "暂无详细提示词配置"}
                    </p>
                  </div>
                </section>

                {/* 业务流程图 (Mermaid) */}
                <section>
                  <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4 text-emerald-500" />
                    业务流程 (Workflow)
                  </h3>
                  {agent.mermaid ? (
                    <div className="rounded-2xl border border-zinc-100 overflow-hidden shadow-sm">
                      <Mermaid code={agent.mermaid} caption={`${agent.name} 业务流程`} />
                    </div>
                  ) : (
                    <div className="bg-zinc-50 p-8 rounded-2xl text-center border border-zinc-100">
                      <p className="text-sm text-zinc-400 italic">未配置业务流程</p>
                    </div>
                  )}
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 关联需求 */}
                  <section>
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Rocket className="w-4 h-4 text-emerald-500" />
                      关联需求 ({agent.requirements?.length || 0})
                    </h3>
                    <div className="space-y-3">
                      {agent.requirements?.length > 0 ? (
                        agent.requirements.map((req: any) => (
                          <div
                            key={req.id}
                            className="p-4 bg-white rounded-xl border border-zinc-100 shadow-sm hover:shadow-md transition-all"
                          >
                            <h4 className="text-sm font-bold text-zinc-900 mb-1">{req.title}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant={(req.priority?.toLowerCase() as any) || "medium"}>
                                {req.priority || "中"}
                              </Badge>
                              <span className="text-[10px] text-zinc-400">
                                {req.status || "进行中"}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-zinc-400 italic py-4">暂无直接关联的需求</p>
                      )}
                    </div>
                  </section>

                  {/* 负责任务 */}
                  <section>
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <ListTodo className="w-4 h-4 text-emerald-500" />
                      负责任务 ({agent.tasks?.length || 0})
                    </h3>
                    <div className="space-y-3">
                      {agent.tasks?.length > 0 ? (
                        agent.tasks.map((task: any) => (
                          <div
                            key={task.id}
                            className="p-4 bg-white rounded-xl border border-zinc-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between"
                          >
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-zinc-900 truncate">
                                {task.title}
                              </h4>
                              <p className="text-[10px] text-zinc-400 mt-0.5">
                                ID: {task.id.slice(0, 8)}
                              </p>
                            </div>
                            <Badge
                              variant={task.status === "COMPLETED" ? "completed" : "in-progress"}
                            >
                              {task.status === "COMPLETED" ? "已完成" : "进行中"}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-zinc-400 italic py-4">暂无分配的任务</p>
                      )}
                    </div>
                  </section>
                </div>
              </div>

              {/* 右侧：状态与关联项目 */}
              <div className="space-y-8">
                <section>
                  <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-500" />
                    参与项目 ({agent.projects?.length || 0})
                  </h3>
                  <div className="space-y-3">
                    {agent.projects?.length > 0 ? (
                      agent.projects.map((proj: any) => (
                        <div
                          key={proj.id}
                          className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 group cursor-pointer hover:bg-emerald-50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-bold text-zinc-900 truncate group-hover:text-emerald-600 transition-colors">
                              {proj.name}
                            </h4>
                            <ExternalLink className="w-3.5 h-3.5 text-zinc-300 group-hover:text-emerald-400" />
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                                进度
                              </span>
                              <span className="text-xs font-black text-emerald-600">
                                {proj.progress || 0}%
                              </span>
                            </div>
                            <div className="w-[1px] h-3 bg-zinc-200" />
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                              {proj.status || "进行中"}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-zinc-400 italic">尚未关联任何项目</p>
                    )}
                  </div>
                </section>

                <section className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100 space-y-4">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    元数据
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-xs">创建于</span>
                      </div>
                      <span className="text-xs font-medium text-zinc-900">
                        {new Date(agent.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Mail className="w-3.5 h-3.5" />
                        <span className="text-xs">负责人</span>
                      </div>
                      <span className="text-xs font-medium text-zinc-900">
                        {agent.user?.name || "系统"}
                      </span>
                    </div>
                  </div>
                </section>

                <Button
                  className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-zinc-200 hover:shadow-emerald-200 border-none h-auto"
                  onClick={onClose}
                >
                  确定并返回
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
