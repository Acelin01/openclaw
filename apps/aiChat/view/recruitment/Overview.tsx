'use client';

import { useState, useEffect } from 'react';
import { Card, Badge, Button, cn } from '@uxin/recruitment';
import { 
  Users, 
  Briefcase, 
  Calendar, 
  TrendingUp, 
  Clock,
  ChevronRight
} from 'lucide-react';
import { 
  useRecruitmentApplications, 
  useInterviews 
} from '../../hooks/use-recruitment';

export function RecruitmentOverview() {
  const [mounted, setMounted] = useState(false);
  const { applications, isLoading: appsLoading } = useRecruitmentApplications('interviewer');
  const { interviews, isLoading: intLoading } = useInterviews('interviewer');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Or a general skeleton that matches server exactly
  }

  const stats = [
    { 
      title: '活跃岗位', 
      value: '12', 
      change: '+2', 
      trend: 'up', 
      icon: <Briefcase className="w-5 h-5" />, 
      variant: 'info' 
    },
    { 
      title: '待处理简历', 
      value: applications?.length || '0', 
      change: '+5', 
      trend: 'up', 
      icon: <Users className="w-5 h-5" />, 
      variant: 'success' 
    },
    { 
      title: '今日面试', 
      value: interviews?.length || '0', 
      change: '0', 
      trend: 'neutral', 
      icon: <Calendar className="w-5 h-5" />, 
      variant: 'warning' 
    },
    { 
      title: '人才库匹配', 
      value: '85%', 
      change: '+12%', 
      trend: 'up', 
      icon: <TrendingUp className="w-5 h-5" />, 
      variant: 'default' 
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="relative overflow-hidden group hover:border-[#1dbf73] transition-all duration-300 transform hover:-translate-y-1 shadow-sm hover:shadow-xl hover:shadow-[#1dbf73]/5 border-zinc-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-zinc-500 mb-1 font-medium">{stat.title}</p>
                <h3 className="text-3xl font-black text-zinc-900 tracking-tight">{stat.value}</h3>
                <div className={cn(
                  "flex items-center mt-2 text-xs font-bold",
                  stat.trend === 'up' ? "text-[#1dbf73]" : "text-zinc-400"
                )}>
                  {stat.trend === 'up' && <ChevronRight className="w-3 h-3 rotate-[-90deg] mr-1" />}
                  <span>{stat.change} 较上周</span>
                </div>
              </div>
              <div className={cn(
                "p-3 rounded-2xl transition-colors duration-300",
                stat.variant === 'success' ? "bg-[#eef8f3] text-[#1dbf73] group-hover:bg-[#1dbf73] group-hover:text-white" :
                stat.variant === 'info' ? "bg-[#eef3ff] text-[#4a6bff] group-hover:bg-[#4a6bff] group-hover:text-white" :
                stat.variant === 'warning' ? "bg-[#fff4e6] text-[#ff9900] group-hover:bg-[#ff9900] group-hover:text-white" :
                "bg-zinc-50 text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white"
              )}>
                {stat.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Applications */}
        <Card title="最新申请" className="lg:col-span-2 border-zinc-100 shadow-sm" headerAction={<Button variant="ghost" size="sm" className="text-zinc-500 hover:text-[#1dbf73] font-bold">查看全部</Button>}>
          <div className="space-y-4">
            {appsLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-zinc-50 rounded-2xl" />)}
              </div>
            ) : applications?.slice(0, 5).map((app: any) => (
              <div key={app.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-zinc-50 transition-all duration-300 border border-transparent hover:border-zinc-100 group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold text-lg group-hover:bg-white transition-colors">
                    {app.user?.name?.[0] || 'U'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 group-hover:text-[#1dbf73] transition-colors">{app.user?.name}</h4>
                    <p className="text-xs text-zinc-500 font-medium">{app.position?.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <Badge variant={app.status === 'NEW' ? 'info' : 'success'} className="rounded-lg px-3 py-1">{app.status}</Badge>
                  <span className="text-xs text-zinc-400 font-medium">{new Date(app.appliedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Interviews */}
        <Card title="面试日程" className="border-zinc-100 shadow-sm" headerAction={<Button variant="ghost" size="sm" className="text-zinc-500 hover:text-[#1dbf73] font-bold">日程表</Button>}>
          <div className="space-y-4">
            {intLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-zinc-50 rounded-2xl" />)}
              </div>
            ) : interviews?.slice(0, 5).map((interview: any) => (
              <div key={interview.id} className="flex gap-4 p-4 rounded-2xl border border-zinc-100 hover:border-[#1dbf73]/30 hover:shadow-lg hover:shadow-[#1dbf73]/5 transition-all duration-300 group">
                <div className="flex flex-col items-center justify-center px-3 py-2 bg-[#eef8f3] rounded-xl min-w-[60px] group-hover:bg-[#1dbf73] transition-colors duration-300">
                  <span className="text-[10px] text-[#1dbf73] uppercase font-black group-hover:text-white transition-colors">
                    {new Date(interview.startTime).toLocaleString('zh-CN', { month: 'short' })}
                  </span>
                  <span className="text-xl font-black text-[#1dbf73] group-hover:text-white transition-colors">
                    {new Date(interview.startTime).getDate()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-zinc-900 truncate group-hover:text-[#1dbf73] transition-colors">{interview.candidate?.name}</h4>
                  <p className="text-xs text-zinc-500 flex items-center gap-1.5 mt-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#1dbf73]" />
                    {new Date(interview.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <div className="mt-2">
                    <Badge variant="default" className="text-[10px] border-zinc-100 text-zinc-400 font-bold bg-transparent hover:bg-transparent">{interview.type === 'VIDEO' ? '视频面试' : '现场面试'}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
