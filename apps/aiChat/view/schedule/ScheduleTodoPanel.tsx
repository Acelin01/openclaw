'use client';

import React, { useMemo } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Bot, 
  User, 
  ClipboardCheck, 
  ChevronRight,
  Filter,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApprovals, Approval, ApprovalContent } from '@/hooks/use-approvals';
import { useProjectTasks, ProjectTask } from '@/hooks/use-tasks';
import { useAuthToken } from '@/hooks/use-auth-token';
import { Badge, Button, ScrollArea } from '@uxin/ui';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface ScheduleTodoPanelProps {
  className?: string;
}

export function ScheduleTodoPanel({ className }: ScheduleTodoPanelProps) {
  const { token } = useAuthToken();
  
  /**
   * 获取智能体生成的审批数据
   * 包含：招聘审批、合同审批、报销审批等由 AI 助理初步生成的待办事项
   */
  const { data: approvals, isLoading: loadingApprovals } = useApprovals(token);
  
  /**
   * 获取分配给当前用户的项目任务
   * 从项目管理模块同步过来的、状态为待办或进行中的具体任务
   */
  const { data: tasks, isLoading: loadingTasks } = useProjectTasks(token);

  // 过滤并处理审批事项数据
  const pendingApprovals = useMemo(() => {
    if (!approvals) return [];
    return approvals.map(app => {
      try {
        // 审批内容存储在 content 字段中，通常为 JSON 格式
        const content = JSON.parse(app.content) as ApprovalContent;
        return { ...app, parsedContent: content };
      } catch (e) {
        return { ...app, parsedContent: null };
      }
    }).filter(app => app.parsedContent?.status === 'Pending');
  }, [approvals]);

  // 过滤出当前正在进行的任务（待办或进行中）
  const activeTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter(task => task.status === 'PENDING' || task.status === 'IN_PROGRESS');
  }, [tasks]);

  const isLoading = loadingApprovals || loadingTasks;

  return (
    <div className={cn("w-80 flex flex-col h-full bg-zinc-50/50 border-r", className)}>
      {/* 头部：标题与筛选 */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-emerald-500" />
            待办事项
          </h3>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Search className="w-3.5 h-3.5 text-zinc-400" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Filter className="w-3.5 h-3.5 text-zinc-400" />
            </Button>
          </div>
        </div>
        
        {/* 分类标签 */}
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-none cursor-pointer">
            全部 {pendingApprovals.length + activeTasks.length}
          </Badge>
          <Badge variant="ghost" className="text-zinc-500 hover:bg-zinc-100 border-none cursor-pointer">
            审批 {pendingApprovals.length}
          </Badge>
          <Badge variant="ghost" className="text-zinc-500 hover:bg-zinc-100 border-none cursor-pointer">
            任务 {activeTasks.length}
          </Badge>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {/* 智能体审批区域 */}
          {pendingApprovals.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">待审批工作</span>
                <span className="text-[10px] text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded-full">{pendingApprovals.length}</span>
              </div>
              {pendingApprovals.map((approval) => (
                <div 
                  key={approval.id}
                  className="bg-white rounded-xl p-3 border border-zinc-100 shadow-sm hover:border-emerald-200 transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-1.5 bg-rose-50 rounded-lg text-rose-500">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10px] font-medium text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-md">智能体生成</span>
                        <span className="text-[10px] text-zinc-400">{format(new Date(approval.createdAt), 'MM-dd HH:mm')}</span>
                      </div>
                      <h4 className="text-xs font-bold text-zinc-800 mb-1 truncate group-hover:text-emerald-600 transition-colors">
                        {approval.parsedContent?.title || approval.title}
                      </h4>
                      <p className="text-[10px] text-zinc-500 line-clamp-2 mb-2">
                        {approval.parsedContent?.details}
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t border-zinc-50">
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-full bg-zinc-100 flex items-center justify-center text-[8px] font-bold text-zinc-500">
                            {approval.parsedContent?.requester?.[0] || 'U'}
                          </div>
                          <span className="text-[10px] text-zinc-400">{approval.parsedContent?.requester || '系统'}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 font-bold px-2">
                          去处理 <ChevronRight className="w-3 h-3 ml-0.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 分配任务区域 */}
          {activeTasks.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">分配的任务</span>
                <span className="text-[10px] text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded-full">{activeTasks.length}</span>
              </div>
              {activeTasks.map((task) => (
                <div 
                  key={task.id}
                  className="bg-white rounded-xl p-3 border border-zinc-100 shadow-sm hover:border-emerald-200 transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "mt-1 p-1.5 rounded-lg",
                      task.priority === 'HIGH' ? "bg-amber-50 text-amber-500" : "bg-blue-50 text-blue-500"
                    )}>
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className={cn(
                            "text-[10px] font-medium px-1.5 py-0.5 rounded-md",
                            task.priority === 'HIGH' ? "text-amber-500 bg-amber-50" : "text-blue-500 bg-blue-50"
                          )}>
                            {task.priority === 'HIGH' ? '高优先级' : '普通'}
                          </span>
                          {task.project && (
                            <span className="text-[10px] text-zinc-400 truncate max-w-[80px]">
                              {task.project.name}
                            </span>
                          )}
                        </div>
                        {task.dueDate && (
                          <span className={cn(
                            "text-[10px]",
                            new Date(task.dueDate) < new Date() ? "text-rose-500 font-bold" : "text-zinc-400"
                          )}>
                            {format(new Date(task.dueDate), 'MM-dd')}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-zinc-800 mb-1 truncate group-hover:text-emerald-600 transition-colors">
                        {task.title}
                      </h4>
                      <div className="flex items-center justify-between pt-2 border-t border-zinc-50">
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-full bg-emerald-50 flex items-center justify-center text-[8px] font-bold text-emerald-500">
                            A
                          </div>
                          <span className="text-[10px] text-zinc-400">已分配给我</span>
                        </div>
                        {/* 任务进度条 */}
                        <div className="flex items-center gap-1">
                          <div className="w-16 h-1 bg-zinc-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 transition-all" 
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                          <span className="text-[9px] text-zinc-400">{task.progress}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 无数据状态 */}
          {!isLoading && pendingApprovals.length === 0 && activeTasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mb-3">
                <CheckCircle2 className="w-6 h-6 text-zinc-200" />
              </div>
              <h4 className="text-xs font-bold text-zinc-400 mb-1">暂无待办事项</h4>
              <p className="text-[10px] text-zinc-400">太棒了！你已经完成了所有工作。</p>
            </div>
          )}

          {/* 加载状态 */}
          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-xl p-4 border border-zinc-100 animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-zinc-50 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-2 w-20 bg-zinc-50 rounded"></div>
                      <div className="h-3 w-full bg-zinc-50 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
