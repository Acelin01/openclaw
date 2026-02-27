"use client";

import { Card, Button } from "@uxin/ui";
import { cn, isEmoji } from "@uxin/ui";
import { User, Star, Wrench, Sparkles, Bot } from "lucide-react";
import React from "react";
import { MCPTool } from "../types/mcp";

interface MCPToolCardProps {
  tool: MCPTool;
  onSelect?: (tool: MCPTool) => void;
  onClick?: (tool: MCPTool) => void;
  className?: string;
}

export const MCPToolCard: React.FC<MCPToolCardProps> = ({ tool, onSelect, onClick, className }) => {
  const handleClick = () => {
    if (onClick) onClick(tool);
    else if (onSelect) onSelect(tool);
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
      {/* Emerald gradient header strip for MCP tools */}
      <div className="h-2 w-full bg-gradient-to-r from-emerald-300 via-emerald-500 to-emerald-700" />

      <div className="p-5 flex-1 flex flex-col gap-4">
        {/* Top row: icon + meta */}
        <div className="flex gap-4 items-start">
          <div className="relative shrink-0">
            <div
              className={cn(
                "w-[64px] h-[64px] rounded-full flex items-center justify-center text-white text-2xl font-bold border-[3px] border-white shadow-[0_0_0_2px_#ecfdf5,0_4px_12px_rgba(16,185,129,0.2)] overflow-hidden bg-emerald-50",
              )}
            >
              {tool.avatar ? (
                isEmoji(tool.avatar) ? (
                  <span className="text-3xl">{tool.avatar}</span>
                ) : (
                  <img src={tool.avatar} alt={tool.name} className="w-full h-full object-cover" />
                )
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#10b981] to-[#34d399] flex items-center justify-center text-white">
                  <Wrench className="h-7 w-7" />
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-slate-800 truncate tracking-tight group-hover:text-emerald-600 transition-colors">
                {tool.name}
              </h3>
              {tool.isBuiltIn && (
                <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[10px] px-1.5 py-0.5 rounded-full font-semibold border border-emerald-100">
                  <Sparkles size={10} />
                  <span>内置</span>
                </div>
              )}
            </div>
            <p className="text-sm text-slate-500 line-clamp-2 font-light leading-relaxed">
              {tool.description || "暂无描述，强大的 MCP 工具助你一臂之力"}
            </p>
          </div>
        </div>

        <div className="h-px bg-slate-100" />

        {/* Stats row */}
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            <span className="font-bold">@</span>
            <span>{tool.publisher || tool.creator?.name || "系统"}</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-200" />
          <div className="inline-flex items-center gap-1.5 text-[11px] text-amber-500 font-bold">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span>{tool.rating.toFixed(1)} 分</span>
          </div>

          <div className="ml-auto flex gap-1.5">
            <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              MCP 工具
            </span>
          </div>
        </div>

        {/* CTA area */}
        <div className="mt-auto flex items-center justify-between bg-[#f0fdf4] -mx-5 -mb-5 px-5 py-3 border-t border-slate-100">
          <span className="text-[11px] text-slate-400">查看详情了解更多功能</span>
          <button
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white text-xs font-medium shadow-[0_4px_10px_rgba(16,185,129,0.3)] hover:opacity-90 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(tool);
            }}
          >
            <Bot size={12} />
            详情
          </button>
        </div>
      </div>
    </div>
  );
};
