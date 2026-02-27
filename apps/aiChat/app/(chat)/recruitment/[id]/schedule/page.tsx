'use client';

import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  User, 
  Video, 
  MapPin,
  Plus
} from 'lucide-react';
import { Button, Card, Badge } from '@uxin/ui';
import { cn } from '@/lib/utils';

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const events = [
    {
      id: '1',
      title: '前端候选人 - 张三',
      type: '面试',
      time: '10:00 - 11:00',
      candidate: '张三',
      location: 'Zoom 视频会议',
      category: 'interview'
    },
    {
      id: '2',
      title: '产品经理初筛 - 李四',
      type: '面试',
      time: '14:00 - 15:00',
      candidate: '李四',
      location: '3楼会议室 A',
      category: 'interview'
    },
    {
      id: '3',
      title: '招聘需求评审',
      type: '会议',
      time: '16:30 - 17:30',
      location: '2楼讨论区',
      category: 'meeting'
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Calendar Left Column */}
        <div className="lg:w-80 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-zinc-900">2025年12月</h2>
              <div className="flex gap-1">
                <Button variant="ghost" className="p-1 hover:bg-zinc-50 rounded-lg text-zinc-400 h-auto border-none"><ChevronLeft className="w-4 h-4" /></Button>
                <Button variant="ghost" className="p-1 hover:bg-zinc-50 rounded-lg text-zinc-400 h-auto border-none"><ChevronRight className="w-4 h-4" /></Button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                <div key={day} className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{day}</div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center">
              {Array.from({ length: 31 }).map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "aspect-square flex items-center justify-center text-xs font-bold rounded-lg cursor-pointer transition-all",
                    i + 1 === 27 ? "bg-[#1dbf73] text-white shadow-md shadow-[#1dbf73]/20" : "text-zinc-600 hover:bg-zinc-50"
                  )}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#eef8f3] p-6 rounded-2xl border border-[#1dbf73]/10">
            <h3 className="text-sm font-black text-[#1dbf73] mb-4 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" /> 今日概览
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-500 font-bold">待办面试</span>
                <span className="text-sm font-black text-zinc-900">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-500 font-bold">已完成</span>
                <span className="text-sm font-black text-zinc-900">2</span>
              </div>
              <div className="pt-4 border-t border-[#1dbf73]/5">
                <Button className="w-full bg-[#1dbf73] hover:bg-[#19a463] text-white border-none shadow-sm h-10 text-xs font-bold rounded-xl flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5" /> 安排新日程
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Right Column */}
        <div className="flex-1 space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
            <div className="flex gap-2">
              <Button variant="outline" className="h-9 px-4 text-xs font-bold border-zinc-200 rounded-xl bg-zinc-50 text-zinc-900">今日</Button>
              <div className="flex items-center gap-4 ml-4">
                <h2 className="text-base font-black text-zinc-900">2025年12月27日 星期六</h2>
                <Badge className="bg-[#eef8f3] text-[#1dbf73] border-none px-3 py-0.5 rounded-full text-[10px] font-bold">今天</Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex bg-zinc-100 p-1 rounded-xl">
                <Button variant="ghost" className="px-4 py-1.5 text-[10px] font-black bg-white rounded-lg shadow-sm text-zinc-900 uppercase tracking-widest h-auto border-none hover:bg-white">列表</Button>
                <Button variant="ghost" className="px-4 py-1.5 text-[10px] font-black text-zinc-400 hover:text-zinc-600 uppercase tracking-widest h-auto border-none hover:bg-transparent">日历</Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-xl hover:shadow-[#1dbf73]/5 transition-all duration-300 transform hover:-translate-y-1 group flex items-start gap-6 relative overflow-hidden">
                <div className={cn(
                  "absolute left-0 top-0 bottom-0 w-1.5",
                  event.category === 'interview' ? "bg-blue-500" : "bg-orange-500"
                )} />
                <div className="min-w-[80px] pt-1">
                  <p className="text-sm font-black text-zinc-900">{event.time.split(' ')[0]}</p>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{event.time.split(' ')[2]}</p>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-base font-black text-zinc-900 group-hover:text-[#1dbf73] transition-colors">{event.title}</h3>
                    <Badge variant="secondary" className="border-zinc-100 text-zinc-400 text-[10px] font-bold px-2 py-0.5">{event.type}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-6 mt-4">
                    {event.candidate && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-zinc-300" />
                        <span className="text-xs text-zinc-500 font-medium">候选人: <span className="text-zinc-900 font-bold">{event.candidate}</span></span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      {event.location.includes('Zoom') ? <Video className="w-4 h-4 text-blue-400" /> : <MapPin className="w-4 h-4 text-zinc-300" />}
                      <span className="text-xs text-zinc-500 font-medium">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-zinc-300" />
                      <span className="text-xs text-zinc-500 font-medium">时长: <span className="text-zinc-900 font-bold">60分钟</span></span>
                    </div>
                  </div>
                </div>
                <div className="pt-1">
                  <Button variant="outline" className="border-zinc-100 hover:bg-zinc-50 rounded-xl h-10 px-4 text-xs font-bold text-zinc-600 transition-all">查看详情</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
