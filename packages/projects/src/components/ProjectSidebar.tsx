"use client";

import { Button, Input } from "@uxin/ui";
import {
  LayoutDashboard,
  Briefcase,
  ClipboardList,
  CheckSquare,
  Calendar,
  BarChart3,
  Plus,
  Search,
  Clock,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { ProjectModal } from "./ProjectModal";
import { cn } from "./shared-ui";

const NAV_ITEMS = [
  {
    section: "Overview",
    items: [
      { label: "工作台", icon: LayoutDashboard, href: "/projects/dashboard" },
      { label: "项目大厅", icon: Briefcase, href: "/projects" },
    ],
  },
  {
    section: "Execution",
    items: [
      { label: "需求管理", icon: ClipboardList, href: "/projects/requirements" },
      { label: "任务执行", icon: CheckSquare, href: "/projects/tasks" },
      { label: "日程计划", icon: Calendar, href: "/projects/schedule" },
    ],
  },
  {
    section: "Analysis",
    items: [{ label: "数据透视", icon: BarChart3, href: "/projects/analytics" }],
  },
];

const RECENT_PROJECTS = [
  { id: "1", name: "AI 聊天助手", color: "bg-emerald-500" },
  { id: "2", name: "招聘管理系统", color: "bg-blue-500" },
];

export function ProjectSidebar() {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveProject = (data: any) => {
    console.log("Saving project:", data);
    setIsModalOpen(false);
  };

  return (
    <div className="w-64 bg-white border-r border-zinc-200/60 flex flex-col h-full overflow-hidden shadow-[1px_0_10px_rgba(0,0,0,0.02)]">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-zinc-100 bg-zinc-50/30">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-lg shadow-emerald-500/20 rotate-3 group-hover:rotate-0 transition-transform">
            <Briefcase size={20} strokeWidth={2.5} />
          </div>
          <div className="text-left">
            <h2 className="text-[15px] font-black text-zinc-900 leading-tight tracking-tight">
              UXIN PROJECTS
            </h2>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Workspace v2.0
            </p>
          </div>
        </div>

        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
          <Input
            placeholder="快速检索..."
            className="pl-9 h-10 text-xs bg-white border-zinc-200 rounded-xl focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8 scrollbar-hide">
        {NAV_ITEMS.map((section, idx) => (
          <div key={idx}>
            <div className="px-4 py-2 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1 text-left">
              {section.section}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-r-2xl text-[13px] font-bold transition-all duration-300 group relative border-l-[3px]",
                      isActive
                        ? "bg-[#eef8f3] text-[#1dbf73] border-[#1dbf73]"
                        : "border-transparent text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900",
                    )}
                  >
                    <item.icon
                      size={18}
                      strokeWidth={isActive ? 2.5 : 2}
                      className={cn(
                        "transition-transform group-hover:scale-110",
                        isActive ? "text-[#1dbf73]" : "text-zinc-400 group-hover:text-zinc-900",
                      )}
                    />
                    <span className="flex-1 text-left">{item.label}</span>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#1dbf73] shadow-[0_0_8px_rgba(29,191,115,0.5)]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Recent Projects Section */}
        <div>
          <div className="px-4 py-2 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1 flex items-center justify-between">
            <span>Recent</span>
            <Clock size={12} className="text-zinc-300" />
          </div>
          <div className="space-y-1">
            {RECENT_PROJECTS.map((proj) => (
              <Button
                key={proj.id}
                variant="ghost"
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-[13px] font-bold text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-all group h-auto border-none"
              >
                <div className={cn("w-2 h-2 rounded-full", proj.color)} />
                <span className="flex-1 text-left truncate">{proj.name}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="p-6 border-t border-zinc-100 bg-zinc-50/30 space-y-3">
        <Button
          className="w-full bg-zinc-900 hover:bg-black text-white rounded-2xl gap-2 h-11 font-bold shadow-xl shadow-zinc-200 transition-all active:scale-95"
          onClick={() => {
            /* TODO: Open settings */
          }}
        >
          <Settings size={18} />
          <span>系统设置</span>
        </Button>
        <Button
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl gap-2 h-11 font-bold shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={20} strokeWidth={3} />
          <span>新建项目</span>
        </Button>
      </div>

      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProject}
      />
    </div>
  );
}
