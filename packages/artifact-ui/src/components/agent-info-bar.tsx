"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, Button } from "@uxin/ui";
import { Bot, Settings, Search, Code, FileText, MessageSquare } from "lucide-react";
import { cn } from "../lib/utils";

/**
 * 智能体工具接口
 */
interface Tool {
  icon: React.ElementType; // 工具图标
  name: string; // 工具名称
}

/**
 * 智能体信息栏组件属性
 */
interface AgentInfoBarProps {
  name?: string; // 智能体名称
  avatar?: string; // 智能体头像 (可选)
  tools?: Tool[]; // 智能体拥有的工具列表
  className?: string; // 附加样式类名
  onClick?: () => void; // 点击整个信息栏的回调
  onEditClick?: () => void; // 点击编辑按钮的回调
}

/**
 * 默认工具列表
 */
const DEFAULT_TOOLS: Tool[] = [
  { icon: Search, name: "联网搜索" },
  { icon: Code, name: "代码执行" },
  { icon: FileText, name: "文档处理" },
  { icon: MessageSquare, name: "对话协作" },
];

/**
 * 智能体信息栏组件 - 显示在输入框上方，展示当前所选智能体的头像、名称及可用工具
 */
export function AgentInfoBar({
  name = "项目经理",
  avatar,
  tools = DEFAULT_TOOLS,
  className,
  onClick,
  onEditClick,
}: AgentInfoBarProps) {
  const isEmoji = (str: string | null | undefined) => {
    if (!str) return false;
    return /\p{Emoji}/u.test(str) && str.length <= 8;
  };

  return (
    <div
      className={cn(
        "group flex items-center justify-between px-3 py-1.5 bg-sidebar dark:bg-sidebar rounded-t-xl border-x border-t border-border/50 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors",
        className,
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        {/* 智能体头像 */}
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-sm overflow-hidden text-[12px]">
          {avatar ? (
            isEmoji(avatar) ? (
              <span>{avatar}</span>
            ) : (
              <img src={avatar} alt={name} className="h-full w-full object-cover" />
            )
          ) : (
            <Bot size={14} />
          )}
        </div>

        {/* 智能体名称 */}
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] font-semibold text-zinc-700 dark:text-zinc-300">
            @{name}
          </span>
          <div className="h-2.5 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-0.5" />
        </div>

        {/* 智能体工具列表 */}
        <div className="flex items-center gap-1 ml-0.5">
          <TooltipProvider delayDuration={300}>
            {tools.map((tool, index) => (
              <Tooltip key={`agent-tool-${index}-${tool.name}`}>
                <TooltipTrigger asChild>
                  <div className="flex h-5 w-5 items-center justify-center rounded text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-default">
                    <tool.icon size={12} />
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="text-[10px] px-2 py-1 bg-zinc-900 text-white border-none shadow-md"
                >
                  {tool.name}
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </div>

      {/* 设置图标 */}
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-300 transition-all duration-200 border-none"
              onClick={(e) => {
                e.stopPropagation(); // 防止触发父级的 onClick
                onEditClick?.();
              }}
            >
              <Settings size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="text-[10px] px-2 py-1 bg-zinc-900 text-white border-none shadow-md"
          >
            智能体设置
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
