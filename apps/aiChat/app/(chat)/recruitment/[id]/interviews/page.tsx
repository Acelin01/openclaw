'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  Search,
  Plus,
  Briefcase,
  Users
} from 'lucide-react';
import { Button, Card, Badge } from '@uxin/ui';
import { cn } from '@/lib/utils';

export default function InterviewsPage() {
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: '全部面试', count: 12 },
    { id: 'scheduled', label: '待面试', count: 5 },
    { id: 'completed', label: '已完成', count: 6 },
    { id: 'cancelled', label: '已取消', count: 1 },
  ];

  const interviews = [
    { 
      id: '1', 
      candidate: '张三', 
      position: '高级前端开发工程师', 
      time: '2025-12-27 10:00', 
      type: 'VIDEO', 
      status: 'scheduled',
      interviewer: ['王经理', '陈总'],
      avatar: '张'
    },
    { 
      id: '2', 
      candidate: '李四', 
      position: '产品经理', 
      time: '2025-12-27 14:00', 
      type: 'ONSITE', 
      status: 'scheduled',
      interviewer: ['陈总'],
      avatar: '李'
    },
    { 
      id: '3', 
      candidate: '王五', 
      position: 'UI设计师', 
      time: '2025-12-26 15:00', 
      type: 'REVIEW', 
      status: 'completed',
      interviewer: ['赵组长'],
      avatar: '王'
    },
  ];

  const filteredInterviews = activeTab === 'all' 
    ? interviews 
    : interviews.filter(i => i.status === activeTab);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Tabs & Search */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white p-2 rounded-2xl border border-zinc-100 shadow-sm">
          <div className="flex gap-1 w-full md:w-auto overflow-x-auto">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant="ghost"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-6 py-2.5 text-sm font-semibold transition-all rounded-xl relative whitespace-nowrap flex items-center gap-2 h-auto border-none",
                  activeTab === tab.id
                    ? "bg-[#1dbf73] text-white shadow-md shadow-[#1dbf73]/20 hover:bg-[#1dbf73] hover:text-white"
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
                )}
              >
                {tab.label}
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                  activeTab === tab.id ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-500"
                )}>
                  {tab.count}
                </span>
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-3 pr-2">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                type="text" 
                placeholder="搜索候选人、职位..." 
                className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-xs focus:outline-none focus:border-[#1dbf73] transition-all"
              />
            </div>
            <Button className="flex items-center gap-2 bg-[#1dbf73] hover:bg-[#19a463] text-white border-none shadow-sm text-xs h-9">
              <Plus className="w-3.5 h-3.5" /> 安排新面试
            </Button>
          </div>
        </div>
      </div>

      {/* Interview Cards Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredInterviews.map((interview) => (
          <div 
            key={interview.id} 
            className={cn(
              "bg-white rounded-3xl border border-zinc-100 shadow-sm hover:shadow-xl hover:shadow-zinc-200/50 transition-all group overflow-hidden flex flex-col h-full",
              interview.type === 'VIDEO' ? "border-l-4 border-l-blue-500" : 
              interview.type === 'ONSITE' ? "border-l-4 border-l-[#1dbf73]" : "border-l-4 border-l-orange-500"
            )}
          >
            <div className="p-8 flex-1">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-400 font-black text-2xl border border-zinc-100 group-hover:scale-105 transition-transform">
                    {interview.avatar}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-zinc-900 group-hover:text-[#1dbf73] transition-colors mb-1">{interview.candidate}</h3>
                    <div className="flex items-center text-sm text-zinc-500 font-medium">
                      <Briefcase className="w-4 h-4 mr-2 text-zinc-300" />
                      {interview.position}
                    </div>
                  </div>
                </div>
                <Badge variant={
                  interview.status === 'scheduled' ? 'info' : 
                  interview.status === 'completed' ? 'success' : 'default'
                } className={cn(
                  "rounded-full px-4 py-1 text-xs font-bold border-none",
                  interview.status === 'scheduled' ? "bg-blue-50 text-blue-600" : 
                  interview.status === 'completed' ? "bg-[#eef8f3] text-[#1dbf73]" : "bg-zinc-100 text-zinc-500"
                )}>
                  {interview.status === 'scheduled' ? '待面试' : 
                   interview.status === 'completed' ? '已完成' : '已取消'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50/50 border border-zinc-100/50">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                    <Calendar className="w-5 h-5 text-[#1dbf73]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">面试日期</p>
                    <p className="text-sm font-bold text-zinc-700">{interview.time.split(' ')[0]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50/50 border border-zinc-100/50">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                    <Clock className="w-5 h-5 text-[#1dbf73]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">面试时间</p>
                    <p className="text-sm font-bold text-zinc-700">{interview.time.split(' ')[1]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50/50 border border-zinc-100/50 sm:col-span-2">
                  <div className={cn(
                    "w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm",
                    interview.type === 'VIDEO' ? "text-blue-500" : 
                    interview.type === 'ONSITE' ? "text-[#1dbf73]" : "text-orange-500"
                  )}>
                    {interview.type === 'VIDEO' ? <Video className="w-5 h-5" /> : 
                     interview.type === 'ONSITE' ? <MapPin className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">面试地点/方式</p>
                    <p className="text-sm font-bold text-zinc-700">
                      {interview.type === 'VIDEO' ? '远程视频面试 (Zoom)' : 
                       interview.type === 'ONSITE' ? '公司总部 - 3楼会议室' : '技术评审会'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-zinc-50">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">面试官团队</span>
                  <div className="flex -space-x-3">
                    {interview.interviewer.map((name, idx) => (
                      <div 
                        key={idx} 
                        className="w-10 h-10 rounded-xl bg-zinc-100 border-2 border-white flex items-center justify-center text-xs font-black text-zinc-600 shadow-sm hover:z-10 hover:-translate-y-1 transition-all cursor-pointer" 
                        title={name}
                      >
                        {name.slice(0, 1)}
                      </div>
                    ))}
                    <div className="w-10 h-10 rounded-xl bg-zinc-50 border-2 border-white flex items-center justify-center text-[10px] font-bold text-zinc-400 shadow-sm">
                      +1
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" className="h-11 px-5 border-zinc-200 text-zinc-600 hover:bg-zinc-50 rounded-xl font-bold">
                    查看详情
                  </Button>
                  {interview.status === 'scheduled' ? (
                    <Button size="sm" className="h-11 px-6 bg-[#1dbf73] hover:bg-[#19a463] text-white border-none shadow-lg shadow-[#1dbf73]/20 rounded-xl font-bold">
                      进入面试
                    </Button>
                  ) : (
                    <Button size="sm" className="h-11 px-6 bg-orange-500 hover:bg-orange-600 text-white border-none shadow-lg shadow-orange-500/20 rounded-xl font-bold">
                      填写评估
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
