"use client";

import React, { useState } from "react";
import { Bot, Zap, Users, Menu, Activity, History } from "lucide-react";
import { MultiAgentSidebar } from "./multi-agent-sidebar";
import { SidebarHistory } from "./sidebar-history";
import { PhaseIndicator } from "./phase-indicator";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  Button 
} from "@uxin/ui";
import type { User } from "next-auth";

interface ChatLayoutClientProps {
  children: React.ReactNode;
  user: User | undefined;
  session: any;
  extraHeaderContent?: React.ReactNode;
}

export function ChatLayoutClient({ children, user, session, extraHeaderContent }: ChatLayoutClientProps) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  return (
    <div className="flex flex-col h-dvh bg-gradient-to-br from-[#f5f7fa] to-[#c3cfe2] dark:from-zinc-950 dark:to-zinc-900 p-0 md:p-5 overflow-hidden font-['Noto_Sans_SC']">
      <div className="flex-1 flex flex-col w-full max-w-[1440px] mx-auto bg-white dark:bg-zinc-900 overflow-hidden md:rounded-2xl md:shadow-2xl">
        {/* 顶部全局状态栏 */}
        <header className="h-16 bg-gradient-to-r from-[#2c3e50] to-[#4a6491] text-white px-4 md:px-6 flex items-center justify-between shrink-0 shadow-md z-30 border-b border-white/5">
          <div className="flex items-center gap-2 md:gap-3">
            {/* Mobile History Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden text-white hover:bg-white/10"
              onClick={() => setIsHistoryOpen(true)}
            >
              <History className="w-5 h-5" />
            </Button>

            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-400/30">
              <Bot className="w-5 h-5 text-[#4fc3f7]" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold tracking-tight">智能协作系统 - 全链路工作流</h1>
              <p className="text-[9px] text-white/50 uppercase tracking-widest font-medium">Smart Multi-Agent Workflow</p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 px-2.5 py-1 bg-white/5 rounded-full border border-white/10">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-[#4CAF50] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#4CAF50]"></span>
                </span>
                <span className="text-[10px] font-medium text-white/80">系统运行中</span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1 bg-white/5 rounded-full border border-white/10">
                <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400/20" />
                <span className="text-[10px] font-medium text-white/80">自演化激活</span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1 bg-white/5 rounded-full border border-white/10">
                <Users className="w-3 h-3 text-blue-300" />
                <span className="text-[10px] font-medium text-white/80">6 智能体在线</span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#4caf83]/20 rounded-full border border-[#4caf83]/30">
              <Activity className="w-3.5 h-3.5 text-[#4caf83]" />
              <span className="text-xs font-bold text-white">协作模式</span>
            </div>

            {extraHeaderContent}

            {/* Mobile Status Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden text-white hover:bg-white/10"
              onClick={() => setIsStatusOpen(true)}
            >
              <Activity className="w-5 h-5" />
            </Button>

            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold border border-white/20 shadow-lg cursor-pointer hover:scale-105 transition-transform">
              {session.user?.name?.[0] || "U"}
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Desktop History Sidebar - Left side */}
          <div className="hidden lg:block w-[260px] shrink-0 border-r border-[#e5e9f0] dark:border-zinc-800 bg-[#f9fbfd] dark:bg-zinc-900/30 overflow-y-auto">
            <div className="p-4 border-b border-[#e5e9f0] dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#4caf83]" />
                <span className="text-sm font-bold">历史对话</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-[#4caf83] hover:bg-[#e8f5ef] rounded-md"
                onClick={() => window.location.href = '/'}
              >
                <Zap className="w-3.5 h-3.5 fill-[#4caf83]/20" />
              </Button>
            </div>
            <SidebarHistory user={user} />
          </div>

          <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-zinc-950 relative">
            {/* 阶段指示器 */}
            <div className="h-14 border-b border-[#eee] dark:border-zinc-800 flex items-center px-4 bg-white dark:bg-zinc-950 z-10 shrink-0 overflow-x-auto scrollbar-hide">
              <PhaseIndicator />
            </div>

            {/* 聊天区域 */}
            <main className="flex-1 overflow-hidden relative bg-[#f9fbfd] dark:bg-zinc-900/30">
              {children}
            </main>
          </div>

          {/* Desktop Status Sidebar - Right side */}
          <div className="hidden lg:block shrink-0 border-l border-[#e5e9f0] dark:border-zinc-800">
            <MultiAgentSidebar />
          </div>
        </div>
      </div>

      {/* Mobile Left Drawer - Chat History */}
      <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <SheetContent side="left" className="p-0 w-[280px] sm:w-[320px] border-r-0">
          <SheetHeader className="p-4 border-b border-[#e5e9f0] dark:border-zinc-800">
            <SheetTitle className="text-sm font-bold flex items-center gap-2">
              <History className="w-4 h-4 text-[#4caf83]" />
              历史对话
            </SheetTitle>
          </SheetHeader>
          <div className="h-[calc(100%-60px)] overflow-y-auto">
            <SidebarHistory user={user} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile Right Drawer - Multi-Agent Status */}
      <Sheet open={isStatusOpen} onOpenChange={setIsStatusOpen}>
        <SheetContent side="right" className="p-0 w-[292px] border-l-0">
          <SheetHeader className="p-4 border-b border-[#e5e9f0] dark:border-zinc-800">
            <SheetTitle className="text-sm font-bold flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#4caf83]" />
              智能协作状态
            </SheetTitle>
          </SheetHeader>
          <div className="h-[calc(100%-60px)] overflow-y-auto">
            <MultiAgentSidebar />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
