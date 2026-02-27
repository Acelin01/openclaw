'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, MapPin, Trash2, Edit2 } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useSchedules, useCreateSchedule, useUpdateSchedule, useDeleteSchedule, Schedule } from '@/hooks/use-schedules';
import { useAuthToken } from '@/hooks/use-auth-token';
import { cn } from '@/lib/utils';
import { ScheduleTodoPanel } from './ScheduleTodoPanel';
import { 
  Card, 
  Button, 
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea
} from "@uxin/ui";

interface ScheduleViewProps {
  className?: string;
}

/**
 * 日程管理主视图组件
 * 包含日历视图、详细列表以及待办事项面板
 */
export function ScheduleView({ className }: ScheduleViewProps) {
  const { token } = useAuthToken();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  
  // 表单状态
  const [formSchedule, setFormSchedule] = useState<Partial<Schedule>>({
    title: '',
    description: '',
    type: 'EVENT',
    startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    endTime: format(addDays(new Date(), 0), "yyyy-MM-dd'T'HH:mm"),
    location: '',
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  // 获取日程数据
  const { data: schedules, isLoading } = useSchedules(
    token,
    format(startDate, 'yyyy-MM-dd'),
    format(endDate, 'yyyy-MM-dd')
  );

  const createMutation = useCreateSchedule(token);
  const updateMutation = useUpdateSchedule(token);
  const deleteMutation = useDeleteSchedule(token);

  // 计算日历天数
  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  const getSchedulesForDay = (day: Date) => {
    return schedules?.filter(s => isSameDay(new Date(s.startTime), day)) || [];
  };

  const selectedDaySchedules = getSchedulesForDay(selectedDate);

  const handleCreateSchedule = async () => {
    try {
      await createMutation.mutateAsync(formSchedule);
      setIsCreateOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create schedule:', error);
    }
  };

  const handleUpdateSchedule = async () => {
    if (!editingSchedule) return;
    try {
      await updateMutation.mutateAsync({
        id: editingSchedule.id,
        ...formSchedule,
      });
      setEditingSchedule(null);
      resetForm();
    } catch (error) {
      console.error('Failed to update schedule:', error);
    }
  };

  const resetForm = () => {
    setFormSchedule({
      title: '',
      description: '',
      type: 'EVENT',
      startTime: format(selectedDate, "yyyy-MM-dd'T'HH:mm"),
      endTime: format(selectedDate, "yyyy-MM-dd'T'HH:mm"),
      location: '',
    });
  };

  const openEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setFormSchedule({
      title: schedule.title,
      description: schedule.description || '',
      type: schedule.type,
      startTime: format(new Date(schedule.startTime), "yyyy-MM-dd'T'HH:mm"),
      endTime: format(new Date(schedule.endTime), "yyyy-MM-dd'T'HH:mm"),
      location: schedule.location || '',
    });
  };

  const handleDeleteSchedule = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    } catch (error) {
      console.error('Failed to delete schedule:', error);
    }
  };

  const typeColors = {
    MEETING: 'bg-orange-500',
    TASK: 'bg-emerald-500',
    VIDEO: 'bg-purple-500',
    EVENT: 'bg-blue-500',
  };

  const typeLabels = {
    MEETING: '会议',
    TASK: '任务',
    VIDEO: '视频',
    EVENT: '事件',
  };

  const typeHexColors = {
    MEETING: '#f97316', // orange-500
    TASK: '#10b981',    // emerald-500
    VIDEO: '#a855f7',   // purple-500
    EVENT: '#3b82f6',   // blue-500
  };

  return (
    <Card className={cn("flex flex-col h-full overflow-hidden border-none shadow-sm", className)}>
      {/* 删除确认对话框 */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              你确定要删除这项日程吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteSchedule}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 头部区域 */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <CalendarIcon className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-800">
              {format(currentMonth, 'yyyy年 MMMM', { locale: zhCN })}
            </h3>
            <p className="text-xs text-zinc-500">查看并管理您的每日日程安排</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-zinc-100 p-1 rounded-lg mr-4">
            <Button 
              variant={viewMode === 'calendar' ? 'secondary' : 'ghost'} 
              size="sm" 
              className={cn("h-7 px-3 text-xs", viewMode === 'calendar' && "shadow-sm")}
              onClick={() => setViewMode('calendar')}
            >
              日历
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
              size="sm" 
              className={cn("h-7 px-3 text-xs", viewMode === 'list' && "shadow-sm")}
              onClick={() => setViewMode('list')}
            >
              列表
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={goToToday} className="h-8 text-xs font-medium mr-2">
            今天
          </Button>
          <div className="flex items-center gap-1 mr-4">
            <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white gap-1" onClick={() => {
            resetForm();
            setFormSchedule(prev => ({
              ...prev,
              startTime: format(selectedDate, "yyyy-MM-dd'T'09:00"),
              endTime: format(selectedDate, "yyyy-MM-dd'T'10:00"),
            }));
            setIsCreateOpen(true);
          }}>
            <Plus className="w-4 h-4" />
            新建日程
          </Button>
        </div>
      </div>

      {/* 新建/编辑对话框 */}
      <Dialog open={isCreateOpen || !!editingSchedule} onOpenChange={(open) => {
        if (!open) {
          setIsCreateOpen(false);
          setEditingSchedule(null);
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingSchedule ? '编辑日程' : '新建日程'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">标题</Label>
              <Input 
                id="title" 
                placeholder="日程标题" 
                value={formSchedule.title}
                onChange={e => setFormSchedule(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">类型</Label>
                <Select 
                  value={formSchedule.type} 
                  onValueChange={v => setFormSchedule(prev => ({ ...prev, type: v as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEETING">会议</SelectItem>
                    <SelectItem value="TASK">任务</SelectItem>
                    <SelectItem value="VIDEO">视频</SelectItem>
                    <SelectItem value="EVENT">事件</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">地点</Label>
                <Input 
                  id="location" 
                  placeholder="地点/会议链接" 
                  value={formSchedule.location}
                  onChange={e => setFormSchedule(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startTime">开始时间</Label>
                <Input 
                  id="startTime" 
                  type="datetime-local" 
                  value={formSchedule.startTime}
                  onChange={e => setFormSchedule(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">结束时间</Label>
                <Input 
                  id="endTime" 
                  type="datetime-local" 
                  value={formSchedule.endTime}
                  onChange={e => setFormSchedule(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">描述</Label>
              <Textarea 
                id="description" 
                placeholder="日程详细说明..." 
                value={formSchedule.description}
                onChange={e => setFormSchedule(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateOpen(false);
              setEditingSchedule(null);
            }}>取消</Button>
            <Button 
              onClick={editingSchedule ? handleUpdateSchedule : handleCreateSchedule}
              disabled={(editingSchedule ? updateMutation.isPending : createMutation.isPending) || !formSchedule.title}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {editingSchedule 
                ? (updateMutation.isPending ? '更新中...' : '更新日程')
                : (createMutation.isPending ? '创建中...' : '创建日程')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-1 overflow-hidden">
        {/* 
          左侧待办事项面板：
          集成智能体生成的待审批工作（Approval）与分配的项目任务（ProjectTask）
          实现日程与待办的统一入口，方便用户在一个视图中处理所有相关事务
        */}
        <ScheduleTodoPanel className="hidden xl:flex" />

        {/* 日历主视图 */}
        <div className="flex-1 overflow-auto bg-zinc-50 border-r">
          <div className="grid grid-cols-7 gap-px bg-zinc-200 min-w-[600px]">
            {['周日', '周一', '周二', '周三', '周四', '周五', '周六'].map((day) => (
              <div key={day} className="bg-zinc-50 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">
                {day}
              </div>
            ))}
            
            {calendarDays.map((day) => {
              const daySchedules = getSchedulesForDay(day);
              const isToday = isSameDay(day, new Date());
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, monthStart);

              return (
                <div
                  key={day.toString()}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "min-h-[100px] bg-white p-2 transition-colors cursor-pointer hover:bg-zinc-50",
                    !isCurrentMonth && "bg-zinc-50/50 text-zinc-400",
                    isSelected && "bg-emerald-50/50 ring-1 ring-inset ring-emerald-500/50 z-10",
                    isToday && "relative after:absolute after:top-2 after:right-2 after:w-1.5 after:h-1.5 after:bg-emerald-500 after:rounded-full"
                  )}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={cn(
                      "text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full",
                      isToday && "bg-emerald-600 text-white font-bold",
                      !isToday && isSelected && "bg-emerald-100 text-emerald-700",
                      !isToday && !isSelected && isCurrentMonth && "text-zinc-700",
                      !isCurrentMonth && "text-zinc-300"
                    )}>
                      {format(day, 'd')}
                    </span>
                  </div>

                  <div className="space-y-1 overflow-hidden">
                    {daySchedules.slice(0, 3).map((schedule) => (
                      <div
                        key={schedule.id}
                        className={cn(
                          "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-white truncate",
                          typeColors[schedule.type] || 'bg-blue-500'
                        )}
                      >
                        <span className="truncate">{schedule.title}</span>
                      </div>
                    ))}
                    {daySchedules.length > 3 && (
                      <div className="text-[9px] text-zinc-400 pl-1">
                        还有 {daySchedules.length - 3} 项...
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 右侧区域：选中日期的详细日程列表 */}
        <div className="w-80 flex flex-col bg-white">
          <div className="p-4 border-b">
            <h4 className="font-semibold text-zinc-800 flex items-center gap-2">
              {format(selectedDate, 'MM月dd日', { locale: zhCN })}
              <Badge variant="outline" className="text-[10px] font-normal">
                {format(selectedDate, 'EEEE', { locale: zhCN })}
              </Badge>
            </h4>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-40 text-zinc-400 gap-2">
                <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">加载中...</span>
              </div>
            ) : selectedDaySchedules.length > 0 ? (
              selectedDaySchedules.map((schedule) => (
                <div key={schedule.id} className="group relative pl-4 border-l-2 hover:bg-zinc-50 p-2 rounded-r transition-colors" 
                     style={{ borderLeftColor: typeHexColors[schedule.type] }}>
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="secondary" className={cn("text-[9px] px-1 py-0 h-4 font-normal text-white", typeColors[schedule.type])}>
                      {typeLabels[schedule.type]}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(schedule.startTime), 'HH:mm')}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="w-6 h-6 text-zinc-400 hover:text-emerald-600"
                        onClick={() => openEdit(schedule)}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="w-6 h-6 text-zinc-400 hover:text-red-500"
                        onClick={() => setDeleteId(schedule.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <h5 className="text-sm font-medium text-zinc-800 mb-1 group-hover:text-emerald-600 transition-colors">
                    {schedule.title}
                  </h5>
                  {schedule.description && (
                    <p className="text-xs text-zinc-500 line-clamp-2 mb-2">
                      {schedule.description}
                    </p>
                  )}
                  {schedule.location && (
                    <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                      <MapPin className="w-3 h-3" />
                      {schedule.location}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-zinc-400 gap-2">
                <CalendarIcon className="w-8 h-8 opacity-20" />
                <span className="text-xs">今日暂无安排</span>
              </div>
            )}
          </div>
          <div className="p-4 border-t bg-zinc-50/50">
            <Button 
              variant="outline" 
              className="w-full text-xs h-9 border-dashed border-zinc-300 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              在该日期添加日程
            </Button>
          </div>
        </div>
      </div>

      {/* Footer / Legend */}
      <div className="p-3 bg-white border-t flex items-center justify-between text-[10px] text-zinc-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <span>会议</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>任务</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span>视频</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span>事件</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
