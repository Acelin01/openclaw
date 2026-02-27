"use client";

import React, { useState, useEffect } from "react";
import { Users, Activity, Zap, Cpu, HardDrive, Database, Layout, ChevronRight, Settings } from "lucide-react";
import { cn, getAuthToken } from "@/lib/utils";
import { getRoleInfo, useChatResources } from "@uxin/artifact-ui";

interface AgentStatus {
  id: string;
  name: string;
  role: string;
  status: string;
  color?: string;
  avatar: string;
  online: boolean;
}

const INITIAL_AGENTS: AgentStatus[] = [
  {
    id: "pm",
    name: "项目经理智能体",
    role: "PM",
    status: "工作中",
    color: "bg-gradient-to-br from-[#3f51b5] to-[#2196f3]",
    avatar: "PM",
    online: true,
  },
  {
    id: "pd",
    name: "产品经理智能体",
    role: "PD",
    status: "分析需求",
    color: "bg-gradient-to-br from-[#ff9800] to-[#ff5722]",
    avatar: "PD",
    online: true,
  },
  {
    id: "tm",
    name: "技术经理智能体",
    role: "TM",
    status: "评估可行性",
    color: "bg-gradient-to-br from-[#4caf50] to-[#8bc34a]",
    avatar: "TM",
    online: true,
  },
  {
    id: "mk",
    name: "市场分析智能体",
    role: "MK",
    status: "调研中",
    color: "bg-gradient-to-br from-[#9c27b0] to-[#673ab7]",
    avatar: "MK",
    online: true,
  },
  {
    id: "ux",
    name: "用户体验智能体",
    role: "UX",
    status: "可用性评估",
    color: "bg-gradient-to-br from-[#00bcd4] to-[#009688]",
    avatar: "UX",
    online: true,
  },
  {
    id: "sys",
    name: "系统协调器",
    role: "SYS",
    status: "监控中",
    color: "bg-gradient-to-br from-[#607d8b] to-[#455a64]",
    avatar: "SYS",
    online: true,
  }, 
];

interface CollaborationActivity {
  id: string;
  agentId: string;
  agentRole: string;
  action: string;
  timestamp: string;
  status: 'pending' | 'success' | 'working';
}

const INITIAL_ACTIVITIES: CollaborationActivity[] = [
  {
    id: "1",
    agentId: "pm",
    agentRole: "PM",
    action: "正在初始化项目大纲并分配任务给 PD 和 TM",
    timestamp: "10:24",
    status: 'success'
  },
  {
    id: "2",
    agentId: "pd",
    agentRole: "PD",
    action: "正在分析用户需求文档并生成 PRD 草案",
    timestamp: "10:26",
    status: 'working'
  },
  {
    id: "3",
    agentId: "tm",
    agentRole: "TM",
    action: "等待进行技术可行性评估...",
    timestamp: "10:28",
    status: 'pending'
  }
];

export function MultiAgentSidebar() {
  const token = getAuthToken() || undefined;
  const { agents: globalAgents } = useChatResources(token);
  const [progress, setProgress] = useState(45);
  const [agents, setAgents] = useState<AgentStatus[]>(INITIAL_AGENTS);
  const [activities, setActivities] = useState<CollaborationActivity[]>(INITIAL_ACTIVITIES);
  const [isAutoPilot, setIsAutoPilot] = useState(true);
  const [isEvolution, setIsEvolution] = useState(true);

  useEffect(() => {
    const handleActivityUpdate = (event: any) => {
      const { activity } = event.detail;
      if (!activity) return;

      setActivities((prevActivities) => {
        const existingIndex = prevActivities.findIndex(a => a.id === activity.id);
        if (existingIndex !== -1) {
          const updatedActivities = [...prevActivities];
          updatedActivities[existingIndex] = activity;
          return updatedActivities;
        }
        return [activity, ...prevActivities].slice(0, 5);
      });
    };

    window.addEventListener("collaboration-activity-update" as any, handleActivityUpdate);
    return () => window.removeEventListener("collaboration-activity-update" as any, handleActivityUpdate);
  }, []);

  return (
    <div className="w-[292px] bg-white dark:bg-zinc-950 flex flex-col h-full overflow-hidden shrink-0 font-['Noto_Sans_SC']">
      {/* Sidebar Header - Status Toggles */}
      <div className="p-[14px_18px_12px] border-b border-[#e5e9f0] dark:border-zinc-800 flex flex-col gap-2.5">
        <h3 className="text-[11.5px] font-bold text-[#9ca3af] uppercase tracking-[0.07em]">系统运行状态</h3>
        
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[13px] font-medium text-[#1a1f2e] dark:text-zinc-200">
              <div className="w-[7px] h-[7px] rounded-full bg-[#4caf50] animate-pulse" />
              <span>自动驾驶模式</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={isAutoPilot}
                onChange={() => setIsAutoPilot(!isAutoPilot)}
              />
              <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[14px] after:w-[14px] after:transition-all dark:border-gray-600 peer-checked:bg-[#4caf83]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[13px] font-medium text-[#1a1f2e] dark:text-zinc-200">
              <div className="w-[7px] h-[7px] rounded-full bg-[#9c27b0] animate-pulse" />
              <span>自演化激活</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={isEvolution}
                onChange={() => setIsEvolution(!isEvolution)}
              />
              <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[14px] after:w-[14px] after:transition-all dark:border-gray-600 peer-checked:bg-[#9c27b0]"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Agent List Section */}
        <section className="p-[16px_18px_0] mb-4">
          <div className="flex items-center justify-between mb-[11px]">
            <h4 className="text-[11.5px] font-bold text-[#9ca3af] uppercase tracking-[0.06em]">活跃智能体</h4>
            <span className="text-[11px] bg-[#e8f5ef] text-[#4caf83] border border-[#d1e9dd] px-[7px] py-[1px] rounded-[10px] font-bold">6 ONLINE</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {agents.map((agent) => {
              const roleInfo = getRoleInfo(agent.id, agent.name, globalAgents);
              return (
                <div 
                  key={agent.id} 
                  className="flex items-center p-[9px_10px] rounded-[9px] hover:bg-[#f3f9f6] border-[1.5px] border-transparent hover:border-[#d1e9dd] transition-all group cursor-pointer"
                >
                  <div 
                    className={cn(
                      "w-[30px] h-[30px] rounded-[8px] flex items-center justify-center text-white text-[10px] font-bold shrink-0 mr-2.5 shadow-sm"
                    )}
                    style={{ background: roleInfo?.gradient || agent.color }}
                  >
                    {agent.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-[12.5px] font-semibold text-[#1a1f2e] dark:text-zinc-200 truncate leading-none mb-1">{agent.name}</h5>
                    <p className="text-[11px] text-[#9ca3af] truncate">{agent.status}</p>
                  </div>
                  {agent.online && <div className="w-[7px] h-[7px] rounded-full bg-[#4caf50] animate-pulse ml-2 shrink-0" />}
                </div>
              );
            })}
          </div>
        </section>

        <div className="h-[1px] bg-[#e5e9f0] dark:bg-zinc-800 mx-[18px]" />

        {/* Progress Stack Section */}
        <section className="p-[16px_18px_0] mb-4">
          <h4 className="text-[11.5px] font-bold text-[#9ca3af] uppercase tracking-[0.06em] mb-[11px]">阶段进度</h4>
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[12px] text-[#6b7280] dark:text-zinc-400 font-medium">
                <span>规划与分析</span>
                <span className="text-[#4caf83] font-bold">100%</span>
              </div>
              <div className="h-[6px] bg-[#e5e9f0] dark:bg-zinc-800 rounded-[4px] overflow-hidden">
                <div className="h-full bg-[#4caf83] w-full transition-all duration-1000" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[12px] text-[#6b7280] dark:text-zinc-400 font-medium">
                <span>架构设计</span>
                <span className="text-[#4caf83] font-bold">85%</span>
              </div>
              <div className="h-[6px] bg-[#e5e9f0] dark:bg-zinc-800 rounded-[4px] overflow-hidden">
                <div className="h-full bg-[#4caf83] w-[85%] transition-all duration-1000" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[12px] text-[#6b7280] dark:text-zinc-400 font-medium">
                <span>任务执行</span>
                <span className="text-[#6b7280] dark:text-zinc-500 font-bold">0%</span>
              </div>
              <div className="h-[6px] bg-[#e5e9f0] dark:bg-zinc-800 rounded-[4px] overflow-hidden">
                <div className="h-full bg-[#4caf83] w-0 transition-all duration-1000" />
              </div>
            </div>
          </div>
        </section>

        <div className="h-[1px] bg-[#e5e9f0] dark:bg-zinc-800 mx-[18px]" />

        {/* Collaboration Activity Section */}
        <section className="p-[16px_18px_0] mb-6">
          <h4 className="text-[11.5px] font-bold text-[#9ca3af] uppercase tracking-[0.06em] mb-[11px]">协作动态</h4>
          <div className="flex flex-col gap-2">
            {activities.map((activity) => (
              <div 
                key={activity.id} 
                className={cn(
                  "p-[9px_11px] rounded-[7px] text-[12.5px] leading-[1.5] flex justify-between",
                  activity.status === 'success' ? "bg-[#e8f5ef] border-l-[3px] border-[#4caf83] text-[#6b7280] dark:bg-green-950/20" :
                  activity.status === 'working' ? "bg-[#fff8ec] border-l-[3px] border-[#f5a623] text-[#6b7280] dark:bg-orange-950/20" :
                  "bg-[#f5f8fa] border-l-[3px] border-[#e5e9f0] text-[#9ca3af] italic dark:bg-zinc-900/40"
                )}
              >
                <div className="flex-1">
                  <span className="font-bold text-[#1a1f2e] dark:text-zinc-200 mr-1">{activity.agentRole}</span>
                  {activity.action}
                </div>
                <span className="text-[10px] font-medium text-zinc-400 ml-2 shrink-0">{activity.timestamp}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Sidebar Footer */}
      <div className="p-[14px_18px] border-t border-[#e5e9f0] dark:border-zinc-800 bg-[#f9fbfd] dark:bg-zinc-900/50">
        <button className="w-full flex items-center justify-between text-[13px] font-bold text-[#4caf83] hover:text-[#3d8b6d] transition-colors">
          <span>查看完整节点报告</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
