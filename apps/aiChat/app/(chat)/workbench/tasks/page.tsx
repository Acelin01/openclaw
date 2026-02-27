'use client';

import { useState } from 'react';
import { useAuthToken } from '@/hooks/use-auth-token';
import { useProjectTasks } from '@/hooks/use-tasks';
import { TaskList } from '@uxin/tasks';
import { Tabs, TabsContent, TabsList, TabsTrigger, Card, CardContent, CardHeader, CardTitle } from '@uxin/ui';
import { Loader2, ClipboardList, History, BarChart3 } from 'lucide-react';

export default function ZhiliaotasksPage() {
  const { token } = useAuthToken();
  const [activeTab, setActiveTab] = useState('todo');

  const { data: todoTasks, isLoading: loadingTodo } = useProjectTasks(token, 'IN_PROGRESS,PENDING');
  const { data: historyTasks, isLoading: loadingHistory } = useProjectTasks(token, 'COMPLETED');

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-emerald-100 rounded-lg">
          <ClipboardList className="h-6 w-6 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">知了任务</h1>
          <p className="text-zinc-500">统一管理所有项目与需求的任务进度</p>
        </div>
      </div>

      <Tabs defaultValue="todo" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
          <TabsTrigger value="todo" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            待办任务
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            历史任务
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            任务分析
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todo">
          <Card>
            <CardHeader>
              <CardTitle>与我相关的待办任务</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingTodo ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                </div>
              ) : (
                <TaskList tasks={(todoTasks as any) || []} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>已完成的历史任务</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                </div>
              ) : (
                <TaskList tasks={(historyTasks as any) || []} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle>任务执行分析</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-zinc-50 rounded-xl border border-zinc-100">
                  <p className="text-sm text-zinc-500 mb-1">总任务数</p>
                  <p className="text-3xl font-bold">{(todoTasks?.length || 0) + (historyTasks?.length || 0)}</p>
                </div>
                <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-100">
                  <p className="text-sm text-emerald-600 mb-1">已完成</p>
                  <p className="text-3xl font-bold text-emerald-700">{historyTasks?.length || 0}</p>
                </div>
                <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-sm text-blue-600 mb-1">进行中</p>
                  <p className="text-3xl font-bold text-blue-700">
                    {todoTasks?.filter(t => t.status === 'IN_PROGRESS').length || 0}
                  </p>
                </div>
              </div>
              <div className="mt-8 text-center py-12 text-zinc-400 bg-zinc-50 rounded-lg border border-dashed">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>更多维度的任务分析图表正在开发中...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
