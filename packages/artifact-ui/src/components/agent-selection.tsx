"use client";

import { Button, Badge } from "@uxin/ui";
import { motion } from "framer-motion";
import { Bot, Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useEffect } from "react";
import { useChatResources } from "../hooks/use-chat-resources";
import { cn } from "../lib/utils";

export function AgentSelection({
  onSelect,
  token,
  appId: propAppId,
}: {
  onSelect?: (agentId: string) => void;
  token?: string;
  appId?: string;
}) {
  const searchParams = useSearchParams();
  const appId = propAppId || searchParams.get("appId");

  const {
    agents: allAgents,
    apps: allApps,
    isLoading: isLoadingResources,
  } = useChatResources(token);

  const currentApp = appId ? allApps.find((a: any) => a.id === appId) : null;
  const appAgentIds = (currentApp as any)?.agents?.map((a: any) => a.id) || [];

  const isEmoji = (str: string | null | undefined) => {
    if (!str) return false;
    return /\p{Emoji}/u.test(str) && str.length <= 8;
  };

  // 合并系统内置和数据库智能体
  const displayAgents = useMemo(() => {
    const agents = [...allAgents];

    // 如果有 appId，将关联的智能体排在前面
    if (appId && appAgentIds.length > 0) {
      return agents.sort((a, b) => {
        const aIsAppAgent = appAgentIds.includes(a.id);
        const bIsAppAgent = appAgentIds.includes(b.id);
        if (aIsAppAgent && !bIsAppAgent) return -1;
        if (!aIsAppAgent && bIsAppAgent) return 1;
        return 0;
      });
    }

    return agents;
  }, [allAgents, appId, appAgentIds]);

  // 自动选择逻辑：当有 appId 且只有一个推荐智能体时，自动触发选择
  useEffect(() => {
    if (appId && appAgentIds.length === 1 && onSelect && allAgents.length > 0) {
      const recommendedAgentId = appAgentIds[0];
      const agentExists = allAgents.some((a) => a.id === recommendedAgentId);
      if (agentExists) {
        onSelect(recommendedAgentId);
      }
    }
  }, [appId, appAgentIds, onSelect, allAgents]);

  if (isLoadingResources) {
    return (
      <div className="mx-auto mt-4 flex size-full max-w-3xl flex-col justify-center px-4 md:mt-16 md:px-8">
        <div className="mb-8 flex flex-col gap-2">
          <div className="h-8 w-64 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-48 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 w-full animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-4 flex size-full max-w-3xl flex-col justify-center px-4 md:mt-16 md:px-8">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col gap-2"
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold tracking-tight">
          {currentApp ? `使用 ${(currentApp as any).name} 开始对话` : "选择一个智能体开始对话"}
        </h2>
        <p className="text-muted-foreground">
          {currentApp
            ? `该应用推荐使用以下智能体，你也可以选择其他智能体`
            : "你可以选择推荐的智能体，或在下方输入框直接提问"}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {displayAgents.map((agent: any, index: number) => {
          const isAppAgent = appAgentIds.includes(agent.id);

          return (
            <motion.div
              key={agent.id}
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="group"
            >
              <div
                className={cn(
                  "flex flex-col w-full bg-white rounded-[20px] overflow-hidden transition-all duration-300",
                  "border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1",
                  "cursor-pointer relative",
                  isAppAgent && "ring-2 ring-rose-200/50",
                )}
                onClick={() => onSelect?.(agent.id)}
              >
                {/* Gradient header strip */}
                <div className="h-2 w-full bg-gradient-to-r from-[#f2a09a] via-[#e8756a] to-[#c4504a]" />

                <div className="p-5 flex flex-col gap-4">
                  {/* Top row: avatar + meta */}
                  <div className="flex gap-4 items-start">
                    <div className="relative shrink-0">
                      <div
                        className={cn(
                          "w-[64px] h-[64px] rounded-full flex items-center justify-center text-white text-2xl font-bold border-[3px] border-white shadow-[0_0_0_2px_#fce8e6,0_4px_12px_rgba(232,117,106,0.2)] overflow-hidden bg-rose-50",
                          agent.color || "bg-rose-100",
                        )}
                      >
                        {agent.avatar ? (
                          isEmoji(agent.avatar) ? (
                            <span>{agent.avatar}</span>
                          ) : (
                            <img
                              src={agent.avatar}
                              alt={agent.name}
                              className="h-full w-full object-cover"
                            />
                          )
                        ) : (
                          <Bot size={28} className="text-rose-400" />
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-[22px] h-[22px] rounded-full bg-gradient-to-br from-[#e8756a] to-[#c4504a] border-2 border-white flex items-center justify-center text-[8px] font-bold text-white shadow-sm">
                        AI
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-slate-800 truncate tracking-tight">
                          {agent.name}
                        </h3>
                        {isAppAgent && (
                          <div className="flex items-center gap-1 bg-rose-50 text-rose-600 text-[10px] px-1.5 py-0.5 rounded-full font-semibold border border-rose-100">
                            <Sparkles size={10} />
                            <span>推荐</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-2 font-light leading-relaxed">
                        {agent.description || "暂无描述，快来和智能体对话吧"}
                      </p>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100" />

                  {/* Stats row */}
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                      <span className="font-bold">@</span>
                      <span>{agent.authorName || "系统内置"}</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                    <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Bot size={12} />
                      <span>
                        {agent.usageCount || Math.floor(Math.random() * 1000) + 100} 次对话
                      </span>
                    </div>

                    {agent.tags && agent.tags.length > 0 && (
                      <div className="ml-auto flex gap-1.5">
                        {agent.tags.slice(0, 2).map((tag: string) => (
                          <span
                            key={tag}
                            className="text-[10px] font-medium text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* CTA area */}
                  <div className="mt-1 flex items-center justify-between bg-slate-50/80 -mx-5 -mb-5 px-5 py-3 border-t border-slate-100">
                    <span className="text-[11px] text-slate-400">立即开始倾诉你的困惑</span>
                    <button className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-br from-[#e8756a] to-[#c4504a] text-white text-xs font-medium shadow-[0_4px_10px_rgba(232,117,106,0.3)] hover:opacity-90 transition-opacity">
                      <Bot size={12} />
                      开始对话
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        animate={{ opacity: 1 }}
        className="mt-8 flex flex-wrap gap-2"
        initial={{ opacity: 0 }}
        transition={{ delay: 0.8 }}
      >
        <span className="text-sm text-muted-foreground">常见话题:</span>
        {["如何优化代码性能？", "帮我写一封商务邮件", "解释量子计算", "制定本周工作计划"].map(
          (topic) => (
            <Button
              key={topic}
              variant="ghost"
              size="sm"
              className="h-7 px-3 text-xs text-muted-foreground"
              onClick={() => {
                /* Handle quick topic */
              }}
            >
              {topic}
            </Button>
          ),
        )}
      </motion.div>
    </div>
  );
}
