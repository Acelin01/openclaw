'use client';

import { useState, useEffect } from 'react';
import { useAuthToken } from "@/hooks/use-auth-token";
import { useWorkbenchApps, useUserTasks } from "@/hooks/use-workbench";
import { useProjects } from "@/hooks/use-projects";
import { Loader2 } from "lucide-react";
import { StatsCard } from "@/view/workbench/StatsCard";
import { AppCard } from "@/view/workbench/AppCard";
import { TaskCard } from "@/view/workbench/TaskCard";
import { ProjectCard } from "@/view/workbench/ProjectCard";
import { ScheduleView } from "@/view/schedule/ScheduleView";
import { Button } from "@uxin/ui";

export default function WorkbenchPage() {
  const [mounted, setMounted] = useState(false);
  const { token, status } = useAuthToken();

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: apps, isLoading: loadingApps } = useWorkbenchApps(token);
  const { data: tasks, isLoading: loadingTasks } = useUserTasks(token);
  const { data: projects, isLoading: loadingProjects } = useProjects(token);

  // 只有在已挂载且 Session 加载完成且拿到 token 后才停止显示加载状态
  const isInitialLoading = !mounted || status === 'loading' || (status === 'authenticated' && !token);
  const isDataLoading = loadingApps || loadingTasks || loadingProjects;

  if (isInitialLoading || isDataLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
          <p className="text-sm text-zinc-500 animate-pulse">正在加载工作台数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* 第一行：统计与应用 */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* 核心指标 - 占 1 栏 */}
          <div className="xl:col-span-1">
            <StatsCard stats={[
              { label: '今日营业额', value: '¥12,480', change: 12.5, isPositive: true },
              { label: '新增客户', value: '24', change: 8.2, isPositive: true },
              { label: '活跃用户', value: '1,240', change: 5.4, isPositive: true },
              { label: '待处理订单', value: '18', change: 2.1, isPositive: false },
            ]} />
          </div>

          {/* 常用应用 - 占 2 栏 */}
          <div className="xl:col-span-2">
            <AppCard apps={apps || []} loading={loadingApps} />
          </div>
        </div>

        {/* 第二行：项目与待办 */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* 正在进行的项目 - 占 2 栏 */}
          <div className="xl:col-span-2">
            <ProjectCard projects={(projects || []).map(p => ({
              ...p,
              status: p.status as '进行中' | '已完成' | '未开始'
            }))} />
          </div>

          {/* 我的待办 - 占 1 栏 */}
          <div className="xl:col-span-1">
            <TaskCard 
              tasks={(tasks || []).map(t => ({
                ...t,
                status: (t.status.toLowerCase() === 'overdue' ? 'pending' : t.status.toLowerCase()) as 'pending' | 'in_progress' | 'completed'
              }))} 
              loading={loadingTasks} 
            />
          </div>
        </div>

        {/* 第三行：日程管理 */}
        <div className="grid grid-cols-1 gap-6">
          <ScheduleView className="min-h-[600px]" />
        </div>

        {/* 第四行：促销/升级引导 */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white shadow-lg shadow-emerald-200/50 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h4 className="text-2xl font-bold">升级至专业版，开启数字化办公新篇章</h4>
            <p className="text-emerald-50 opacity-90">解锁高级报表、无限企业成员、自定义流程引擎等更多功能。</p>
          </div>
          <Button className="whitespace-nowrap bg-white text-emerald-600 px-8 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-all active:scale-95 shadow-md h-auto border-none">
            立即免费试用 14 天
          </Button>
        </div>
      </div>
    </div>
  );
}
