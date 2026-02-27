'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  UserPlus, 
  Star,
  FileText,
  Eye,
  Clock
} from 'lucide-react';
import { Button, Card, Badge } from '@uxin/ui';
import { cn } from '@/lib/utils';

export default function ResumesPage() {
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: '全部简历', count: 48 },
    { id: 'new', label: '新投递', count: 12 },
    { id: 'screening', label: '初筛中', count: 8 },
    { id: 'interviewing', label: '面试中', count: 15 },
    { id: 'offered', label: '已录用', count: 5 },
  ];

  const resumes = [
    {
      id: '1',
      name: '陈医生',
      position: '高级前端开发工程师',
      experience: '5年',
      education: '北京大学 · 硕士',
      status: 'new',
      date: '2025-12-27',
      avatar: '陈',
      score: 92,
      tags: ['React', 'TypeScript', 'Node.js']
    },
    {
      id: '2',
      name: '王小波',
      position: '产品经理',
      experience: '3年',
      education: '清华大学 · 本科',
      status: 'screening',
      date: '2025-12-26',
      avatar: '王',
      score: 85,
      tags: ['数据分析', '竞品研究']
    },
    {
      id: '3',
      name: '张爱玲',
      position: 'UI设计师',
      experience: '4年',
      education: '中央美院 · 本科',
      status: 'interviewing',
      date: '2025-12-25',
      avatar: '张',
      score: 88,
      tags: ['Figma', '插画', '动效']
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Filters & Actions */}
      <div className="bg-white p-2 rounded-2xl border border-zinc-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center px-2">
          <div className="flex gap-1 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant="ghost"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 h-auto border-none",
                  activeTab === tab.id
                    ? "bg-[#1dbf73] text-white shadow-md shadow-[#1dbf73]/20 hover:bg-[#1dbf73] hover:text-white"
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
                )}
              >
                {tab.label}
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full font-bold transition-all",
                  activeTab === tab.id ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-500"
                )}>
                  {tab.count}
                </span>
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="flex items-center gap-2 border-zinc-200 text-xs h-9">
              <Download className="w-3.5 h-3.5" /> 批量下载
            </Button>
            <Button className="bg-[#1dbf73] hover:bg-[#19a463] text-white border-none shadow-sm flex items-center gap-2 text-xs h-9">
              <UserPlus className="w-3.5 h-3.5" /> 录入简历
            </Button>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text" 
              placeholder="搜索候选人、职位、技能..." 
              className="w-full pl-9 pr-4 py-2 bg-zinc-50 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1dbf73]/10 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Resume Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {resumes.map((resume) => (
          <div key={resume.id} className="bg-white rounded-2xl border border-zinc-100 p-6 hover:shadow-xl hover:shadow-[#1dbf73]/5 transition-all group relative overflow-hidden flex flex-col h-full">
            <div className="absolute top-0 right-0 p-4">
              <Button 
                variant="ghost" 
                className="text-zinc-300 hover:text-[#1dbf73] transition-colors p-0 h-auto hover:bg-transparent border-none"
              >
                <Star className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center text-xl font-bold text-zinc-600 shadow-inner group-hover:scale-110 transition-transform">
                {resume.avatar}
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 group-hover:text-[#1dbf73] transition-colors">{resume.name}</h3>
                <p className="text-xs text-zinc-500 font-medium">{resume.position}</p>
              </div>
            </div>

            <div className="space-y-3 mb-6 flex-1">
              <div className="flex items-center gap-3 text-zinc-600">
                <FileText className="w-4 h-4 text-zinc-400" />
                <span className="text-xs">{resume.experience}经验 <span className="text-zinc-300 mx-1">|</span> {resume.education}</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-600">
                <Clock className="w-4 h-4 text-zinc-400" />
                <span className="text-xs">投递于 {resume.date}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {resume.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-zinc-50 text-zinc-500 text-[10px] font-bold rounded-md border border-zinc-100">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#eef8f3] flex items-center justify-center">
                  <span className="text-xs font-black text-[#1dbf73]">{resume.score}</span>
                </div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">AI 匹配度</span>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" className="w-8 h-8 p-0 rounded-lg hover:bg-[#1dbf73]/10 hover:text-[#1dbf73]">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button size="sm" className="h-8 px-4 bg-[#1dbf73] hover:bg-[#19a463] text-white border-none shadow-sm text-xs font-bold">
                  筛选
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}