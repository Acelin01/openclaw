"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@uxin/ui";
import { Avatar, AvatarImage, AvatarFallback, Badge, Button } from "@uxin/ui";
import { cn, isEmoji } from "@uxin/ui";
import { Bot, Wrench, Star, User, ExternalLink, LayoutGrid, Rocket, Sparkles } from "lucide-react";
import React from "react";
import { Agent, MCPTool, AIApp } from "../types";

interface AgentCardProps {
  agent: Agent;
  onSelect?: (agent: Agent) => void;
  onClick?: (agent: Agent) => void;
  className?: string;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, onSelect, onClick, className }) => {
  const handleClick = () => {
    if (onClick) onClick(agent);
    else if (onSelect) onSelect(agent);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "flex flex-col w-full bg-white rounded-[20px] overflow-hidden transition-all duration-300",
        "border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1",
        "cursor-pointer relative group",
        className,
      )}
    >
      {/* Gradient header strip */}
      <div className="h-2 w-full bg-gradient-to-r from-[#f2a09a] via-[#e8756a] to-[#c4504a]" />

      <div className="p-5 flex-1 flex flex-col gap-4">
        {/* Top row: avatar + meta */}
        <div className="flex gap-4 items-start">
          <div className="relative shrink-0">
            <div
              className={cn(
                "w-[64px] h-[64px] rounded-full flex items-center justify-center text-white text-2xl font-bold border-[3px] border-white shadow-[0_0_0_2px_#fce8e6,0_4px_12px_rgba(232,117,106,0.2)] overflow-hidden bg-rose-50",
              )}
            >
              {agent.avatar ? (
                isEmoji(agent.avatar) ? (
                  <span>{agent.avatar}</span>
                ) : (
                  <img src={agent.avatar} alt={agent.name} className="h-full w-full object-cover" />
                )
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-white">
                  {agent.name.substring(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-[22px] h-[22px] rounded-full bg-gradient-to-br from-[#e8756a] to-[#c4504a] border-2 border-white flex items-center justify-center text-[8px] font-bold text-white shadow-sm">
              AI
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-slate-800 truncate tracking-tight group-hover:text-rose-600 transition-colors">
                {agent.name}
              </h3>
              {agent.isCallableByOthers && (
                <div className="flex items-center gap-1 bg-rose-50 text-rose-600 text-[10px] px-1.5 py-0.5 rounded-full font-semibold border border-rose-100">
                  <Sparkles size={10} />
                  <span>公开</span>
                </div>
              )}
            </div>
            <p className="text-sm text-slate-500 line-clamp-2 font-light leading-relaxed">
              {agent.prompt || "暂无描述，快来和智能体对话吧"}
            </p>
          </div>
        </div>

        <div className="h-px bg-slate-100" />

        {/* Stats row */}
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
            <span className="font-bold">@</span>
            <span>{agent.identifier || "smart_agent"}</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-200" />
          <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
            <Bot size={12} />
            <span>{agent.skills?.length || 0} 个技能</span>
          </div>

          <div className="ml-auto flex gap-1.5">
            <span className="text-[10px] font-medium text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
              智能体
            </span>
          </div>
        </div>

        {/* CTA area */}
        <div className="mt-auto flex items-center justify-between bg-[#f9f5f0] -mx-5 -mb-5 px-5 py-3 border-t border-slate-100">
          <span className="text-[11px] text-slate-400">立即开始倾诉你的困惑</span>
          <button
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-br from-[#e8756a] to-[#c4504a] text-white text-xs font-medium shadow-[0_4px_10px_rgba(232,117,106,0.3)] hover:opacity-90 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(agent);
            }}
          >
            <Bot size={12} />
            选择
          </button>
        </div>
      </div>
    </div>
  );
};

interface AIAppCardProps {
  app: AIApp;
  onAdd?: (app: AIApp) => void;
  onClick?: (app: AIApp) => void;
  className?: string;
  isAdded?: boolean;
}

export const AIAppCard: React.FC<AIAppCardProps> = ({
  app,
  onAdd,
  onClick,
  className,
  isAdded,
}) => {
  return (
    <div
      onClick={() => (onClick ? onClick(app) : !isAdded && onAdd?.(app))}
      className={cn(
        "flex flex-col w-full bg-white rounded-[20px] overflow-hidden transition-all duration-300",
        "border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1",
        "cursor-pointer relative group",
        className,
      )}
    >
      {/* Blue gradient header strip for apps */}
      <div className="h-2 w-full bg-gradient-to-r from-blue-300 via-blue-500 to-blue-700" />

      <div className="p-5 flex-1 flex flex-col gap-4">
        {/* Top row: icon + meta */}
        <div className="flex gap-4 items-start">
          <div className="relative shrink-0">
            <div
              className={cn(
                "w-[64px] h-[64px] rounded-full flex items-center justify-center text-white text-2xl font-bold border-[3px] border-white shadow-[0_0_0_2px_#eff6ff,0_4px_12px_rgba(59,130,246,0.2)] overflow-hidden bg-blue-50",
              )}
            >
              {app.icon ? (
                isEmoji(app.icon) ? (
                  <span>{app.icon}</span>
                ) : (
                  <img src={app.icon} alt={app.name} className="h-full w-full object-cover" />
                )
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#3b82f6] to-[#60a5fa] flex items-center justify-center text-white">
                  {app.type === "PROJECT" ? "🚀" : "🛠️"}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-slate-800 truncate tracking-tight group-hover:text-blue-600 transition-colors">
                {app.name}
              </h3>
              {isAdded && (
                <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[10px] px-1.5 py-0.5 rounded-full font-semibold border border-emerald-100">
                  <Sparkles size={10} />
                  <span>已添加</span>
                </div>
              )}
            </div>
            <p className="text-sm text-slate-500 line-clamp-2 font-light leading-relaxed">
              {app.description || "暂无描述，快来体验强大的 AI 应用吧"}
            </p>
          </div>
        </div>

        <div className="h-px bg-slate-100" />

        {/* Stats row */}
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
            <span className="font-bold">#</span>
            <span>{app.type === "PROJECT" ? "项目" : "应用"}</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-200" />
          <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
            <Bot size={12} />
            <span>{app.agents?.length || 0} 个智能体</span>
          </div>
        </div>

        {/* CTA area */}
        <div className="mt-auto flex items-center justify-between bg-[#f0f9ff] -mx-5 -mb-5 px-5 py-3 border-t border-slate-100">
          <span className="text-[11px] text-slate-400">立即开启高效工作体验</span>
          <button
            className={cn(
              "inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-white text-xs font-medium shadow-[0_4px_10px_rgba(59,130,246,0.3)] transition-all",
              isAdded
                ? "bg-slate-300 shadow-none cursor-default"
                : "bg-gradient-to-br from-blue-500 to-blue-700 hover:opacity-90",
            )}
            onClick={(e) => {
              e.stopPropagation();
              if (!isAdded) onAdd?.(app);
            }}
            disabled={isAdded}
          >
            {isAdded ? "已添加" : "添加应用"}
          </button>
        </div>
      </div>
    </div>
  );
};
