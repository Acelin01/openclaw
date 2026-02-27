"use client";

import { useEffect, useState } from "react";
import { getRoleInfo, type AgentRole, ROLE_INFO_MAP } from "@/lib/role-info";
import { cn } from "@/lib/utils";
import { SidebarGroup, SidebarGroupContent, SidebarMenu } from "@uxin/ui";
import { Users, CheckSquare, History, Info, CheckCircle2, Zap } from "lucide-react";

interface AgentStatus {
  role: AgentRole;
  status: string;
  isActive: boolean;
}

interface Activity {
  id: string;
  type: "info" | "success" | "bolt";
  content: string;
}

interface ProjectStatus {
  phase: string;
  progress: number;
  status: string;
  agents: AgentStatus[];
  activities: Activity[];
}

export function MultiAgentSidebar() {
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>({
    phase: "需求分析",
    progress: 45,
    status: "系统运行中",
    agents: (Object.keys(ROLE_INFO_MAP) as AgentRole[]).map((role) => ({
      role,
      status: role === "PM" ? "工作中" : "就绪",
      isActive: role === "PM",
    })),
    activities: [
      { id: "1", type: "info", content: "技术经理已完成任务分解，等待您的确认" },
      { id: "2", type: "success", content: "预检查通过，所有前提条件已满足" },
      { id: "3", type: "bolt", content: "自演化引擎检测到优化机会" },
    ],
  });

  useEffect(() => {
    const handleUpdate = (event: CustomEvent<ProjectStatus>) => {
      setProjectStatus((prev) => ({
        ...prev,
        ...event.detail,
      }));
    };

    window.addEventListener("project-status-update" as any, handleUpdate);
    return () => {
      window.removeEventListener("project-status-update" as any, handleUpdate);
    };
  }, []);

  return (
    <div className="flex flex-col gap-8 p-4 bg-[#f8f9fa] h-full overflow-y-auto custom-scrollbar">
      {/* 智能体状态 */}
      <SidebarGroup>
        <div className="flex items-center gap-2 mb-4 px-2 pb-2 border-b border-zinc-200">
          <Users size={16} className="text-[#3498db]" />
          <h3 className="font-bold text-sm text-[#2c3e50] uppercase tracking-wider">智能体状态</h3>
        </div>
        <SidebarGroupContent>
          <SidebarMenu>
            <ul className="flex flex-col gap-2">
              {projectStatus.agents.map((agent) => {
                const info = getRoleInfo(agent.role);
                return (
                  <li
                    key={agent.role}
                    className={cn(
                      "flex items-center gap-3 p-2.5 rounded-lg transition-all cursor-pointer",
                      agent.isActive
                        ? "bg-[#bbdefb] border-l-4 border-[#2196f3] shadow-sm"
                        : "hover:bg-[#e3f2fd]"
                    )}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm"
                      style={{ background: info.gradient }}
                    >
                      {info.label}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[13px] font-bold text-[#2c3e50] truncate">
                        {info.name}
                      </h4>
                      <p className="text-[11px] text-[#666] truncate">
                        状态: {agent.status}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* 流程进度 */}
      <SidebarGroup>
        <div className="flex items-center gap-2 mb-4 px-2 pb-2 border-b border-zinc-200">
          <CheckSquare size={16} className="text-[#3498db]" />
          <h3 className="font-bold text-sm text-[#2c3e50] uppercase tracking-wider">流程进度</h3>
        </div>
        <SidebarGroupContent>
          <div className="px-2 space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between text-[13px] font-medium text-[#2c3e50]">
                <span>整体进度</span>
                <span className="font-bold">{projectStatus.progress}%</span>
              </div>
              <div className="h-2 w-full bg-[#e0e0e0] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#4CAF50] to-[#8BC34A] transition-all duration-1500 ease-in-out"
                  style={{ width: `${projectStatus.progress}%` }}
                />
              </div>
            </div>
            
            {/* Detailed progress bars based on doc */}
            <div className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-[#666]">
                  <span>需求分析</span>
                  <span className="font-bold">90%</span>
                </div>
                <div className="h-1.5 w-full bg-[#e0e0e0] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#4CAF50] to-[#8BC34A]" style={{ width: '90%' }} />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-[#666]">
                  <span>任务分解</span>
                  <span className="font-bold">60%</span>
                </div>
                <div className="h-1.5 w-full bg-[#e0e0e0] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#2196F3] to-[#03A9F4]" style={{ width: '60%' }} />
                </div>
              </div>
            </div>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* 最近活动 */}
      <SidebarGroup>
        <div className="flex items-center gap-2 mb-4 px-2 pb-2 border-b border-zinc-200">
          <History size={16} className="text-[#3498db]" />
          <h3 className="font-bold text-sm text-[#2c3e50] uppercase tracking-wider">最近活动</h3>
        </div>
        <SidebarGroupContent>
          <div className="px-2 flex flex-col gap-3">
            {projectStatus.activities.map((activity) => (
              <div
                key={activity.id}
                className={cn(
                  "p-3 rounded-lg border-l-4 text-[12px] leading-relaxed flex items-start gap-2.5 shadow-sm animate-in fade-in slide-in-from-left-2 duration-300",
                  activity.type === "info" ? "bg-[#fff8e1] border-[#ffc107] text-[#856404]" :
                  activity.type === "success" ? "bg-[#e8f5e9] border-[#4CAF50] text-[#1b5e20]" :
                  "bg-[#e3f2fd] border-[#2196F3] text-[#0d47a1]"
                )}
              >
                <div className="mt-0.5 shrink-0">
                  {activity.type === "info" ? <Info size={14} /> :
                   activity.type === "success" ? <CheckCircle2 size={14} /> :
                   <Zap size={14} />}
                </div>
                <div className="font-medium">{activity.content}</div>
              </div>
            ))}
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    </div>
  );
}
