'use client';

import React, { useState } from 'react';
import { 
  Star, 
  MessageSquare, 
  ChevronRight, 
  TrendingUp, 
  CheckCircle2, 
  Clock,
  Search,
  ArrowUpRight,
  ChevronLeft,
  Award,
  ThumbsUp,
  ThumbsDown,
  MinusCircle,
  Briefcase,
  Calendar
} from 'lucide-react';
import { Button, Card, Badge } from '@uxin/ui';
import { cn } from '@/lib/utils';

export default function EvaluationsPage() {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);

  const stats = [
    { label: '平均得分', value: '8.4', icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: '已完成评估', value: '15', icon: CheckCircle2, color: 'text-[#1dbf73]', bg: 'bg-[#eef8f3]' },
    { label: '待处理', value: '3', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  const evaluations = [
    {
      id: '1',
      candidate: '周杰伦',
      position: '高级前端工程师',
      score: 9.2,
      interviewer: '王经理',
      date: '2025-12-25',
      tags: ['技术扎实', '沟通出色', '架构能力强'],
      status: '推荐入职',
      avatar: '周',
      criteria: [
        { name: '技术能力', score: 9.5, desc: '对前端框架及原理理解极深，能独立解决复杂性能问题。', stars: 5 },
        { name: '沟通能力', score: 9.0, desc: '表达清晰，能准确理解需求并给出专业建议。', stars: 5 },
        { name: '团队协作', score: 8.8, desc: '有良好的协作意识，乐于分享技术经验。', stars: 4 },
        { name: '岗位匹配', score: 9.5, desc: '技能栈与我司项目高度契合，能立即上手。', stars: 5 },
      ],
      comments: [
        { author: '王经理', role: '技术总监', content: '非常优秀的候选人，不仅技术功底扎实，而且对业务有自己的见解，建议尽快发放 Offer。', date: '2025-12-25 14:30' },
        { author: '陈总', role: '创始人', content: '沟通感觉不错，有潜力成为核心成员。', date: '2025-12-25 16:00' }
      ]
    },
    // ... other evaluations
  ];

  const currentEvaluation = evaluations.find(e => e.id === selectedCandidate);

  if (selectedCandidate && currentEvaluation) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <Button 
          variant="ghost"
          onClick={() => setSelectedCandidate(null)}
          className="flex items-center gap-2 text-zinc-500 hover:text-[#1dbf73] transition-colors font-bold text-sm mb-4 p-0 h-auto hover:bg-transparent"
        >
          <ChevronLeft className="w-4 h-4" /> 返回评估列表
        </Button>

        <div className="bg-white rounded-3xl border border-zinc-100 shadow-xl overflow-hidden">
          {/* Detail Header */}
          <div className="p-10 border-b border-zinc-50 bg-zinc-50/30 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-8">
              <div className="w-24 h-24 rounded-[2rem] bg-white shadow-xl flex items-center justify-center text-4xl font-black text-zinc-400 border border-zinc-100">
                {currentEvaluation.avatar}
              </div>
              <div>
                <div className="flex items-center gap-4 mb-3">
                  <h2 className="text-4xl font-black text-zinc-900">{currentEvaluation.candidate}</h2>
                  <Badge className="bg-[#eef8f3] text-[#1dbf73] px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm border-none">
                    {currentEvaluation.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-6 text-zinc-500 font-bold">
                  <span className="flex items-center gap-2"><Briefcase className="w-5 h-5 text-[#1dbf73]" /> {currentEvaluation.position}</span>
                  <span className="text-zinc-200">|</span>
                  <span className="flex items-center gap-2"><Calendar className="w-5 h-5 text-[#1dbf73]" /> {currentEvaluation.date}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-[#1dbf73] to-[#19a463] p-8 rounded-[2.5rem] text-white text-center shadow-2xl shadow-[#1dbf73]/30 min-w-[180px] transform hover:scale-105 transition-transform">
              <p className="text-5xl font-black mb-1">{currentEvaluation.score}</p>
              <p className="text-[10px] font-black opacity-80 uppercase tracking-[0.2em]">综合评分</p>
            </div>
          </div>

          <div className="p-10 space-y-12">
            {/* Criteria Grid */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#eef8f3] flex items-center justify-center">
                    <Award className="w-6 h-6 text-[#1dbf73]" />
                  </div>
                  <h3 className="text-xl font-black text-zinc-900">核心能力评估</h3>
                </div>
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  基于 4 个核心维度
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {currentEvaluation.criteria.map((item, idx) => (
                  <div key={idx} className="bg-zinc-50/50 rounded-3xl p-8 border border-zinc-100 hover:border-[#1dbf73]/30 hover:bg-white hover:shadow-xl hover:shadow-zinc-200/50 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-lg font-black text-zinc-800 group-hover:text-[#1dbf73] transition-colors">{item.name}</h4>
                      <div className="bg-white px-4 py-1.5 rounded-xl shadow-sm border border-zinc-50">
                        <span className="text-xl font-black text-[#1dbf73]">{item.score}</span>
                      </div>
                    </div>
                    <p className="text-sm text-zinc-500 leading-relaxed mb-6 font-medium">{item.desc}</p>
                    <div className="flex gap-1.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={cn("w-5 h-5 transition-colors", i < item.stars ? "fill-yellow-400 text-yellow-400" : "text-zinc-200")} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Comments */}
            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-[#eef8f3] flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-[#1dbf73]" />
                </div>
                <h3 className="text-xl font-black text-zinc-900">面试官详细评价</h3>
              </div>
              <div className="space-y-6">
                {currentEvaluation.comments.map((comment, idx) => (
                  <div key={idx} className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-sm hover:shadow-xl hover:shadow-zinc-100/50 transition-all relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-[#1dbf73] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 font-black text-lg border border-zinc-50">
                          {comment.author.slice(0, 1)}
                        </div>
                        <div>
                          <p className="text-base font-black text-zinc-900">{comment.author}</p>
                          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{comment.role}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-bold">{comment.date}</span>
                    </div>
                    <p className="text-zinc-600 leading-relaxed italic font-medium text-lg">"{comment.content}"</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Decision Buttons */}
            <section className="pt-10 border-t border-zinc-100">
              <div className="text-center mb-10">
                <h4 className="text-xs font-black text-zinc-400 mb-2 uppercase tracking-[0.3em]">录用决策</h4>
                <p className="text-zinc-500 text-sm font-medium">请根据面试表现和评估结果做出最终决定</p>
              </div>
              <div className="flex flex-wrap justify-center gap-6">
                <Button className="bg-[#1dbf73] hover:bg-[#19a463] text-white border-none shadow-xl shadow-[#1dbf73]/20 px-12 h-16 rounded-2xl flex items-center gap-3 text-lg font-black transition-all hover:-translate-y-1">
                  <ThumbsUp className="w-6 h-6" /> 确认录用
                </Button>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white border-none shadow-xl shadow-orange-500/20 px-12 h-16 rounded-2xl flex items-center gap-3 text-lg font-black transition-all hover:-translate-y-1">
                  <MinusCircle className="w-6 h-6" /> 暂缓观察
                </Button>
                <Button className="bg-red-500 hover:bg-red-600 text-white border-none shadow-xl shadow-red-500/20 px-12 h-16 rounded-2xl flex items-center gap-3 text-lg font-black transition-all hover:-translate-y-1">
                  <ThumbsDown className="w-6 h-6" /> 不予考虑
                </Button>
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">职位</label>
          <select className="w-full px-4 py-2 bg-zinc-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#1dbf73]/20 appearance-none">
            <option>全部职位</option>
            <option>高级前端工程师</option>
            <option>后端开发工程师</option>
            <option>产品经理</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">评估状态</label>
          <select className="w-full px-4 py-2 bg-zinc-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#1dbf73]/20 appearance-none">
            <option>全部状态</option>
            <option>推荐入职</option>
            <option>待定</option>
            <option>不予考虑</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">综合得分</label>
          <select className="w-full px-4 py-2 bg-zinc-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#1dbf73]/20 appearance-none">
            <option>所有分值</option>
            <option>9.0分以上</option>
            <option>8.0 - 9.0分</option>
            <option>7.0 - 8.0分</option>
            <option>7.0分以下</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">面试时间</label>
          <select className="w-full px-4 py-2 bg-zinc-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#1dbf73]/20 appearance-none">
            <option>全部时间</option>
            <option>今天</option>
            <option>本周</option>
            <option>本月</option>
          </select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <Card key={idx} className="p-6 border-none shadow-sm bg-white hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-xl", stat.bg, stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-zinc-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-zinc-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-50 flex flex-col md:flex-row gap-4 justify-between items-center">
          <h2 className="text-lg font-bold text-zinc-900">评估列表</h2>
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text" 
              placeholder="搜索候选人、职位..." 
              className="w-full pl-9 pr-4 py-2 bg-zinc-50 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1dbf73]/20 transition-all"
            />
          </div>
        </div>

        <div className="divide-y divide-zinc-50">
          {evaluations.map((item) => (
            <div 
              key={item.id} 
              className="p-8 hover:bg-zinc-50/50 transition-all group cursor-pointer"
              onClick={() => setSelectedCandidate(item.id)}
            >
              <div className="flex flex-col lg:flex-row gap-8 lg:items-center">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-3xl bg-white shadow-md flex items-center justify-center text-3xl font-black text-zinc-400 border border-zinc-100 group-hover:scale-105 transition-transform">
                    {item.avatar}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-black text-zinc-900 group-hover:text-[#1dbf73] transition-colors">{item.candidate}</h3>
                      <Badge className={cn(
                        "rounded-full px-4 py-1 text-xs font-bold border-none shadow-sm",
                        item.status === '推荐入职' ? "bg-[#eef8f3] text-[#1dbf73]" :
                        item.status === '待定' ? "bg-orange-50 text-orange-500" :
                        "bg-red-50 text-red-500"
                      )}>
                        {item.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-zinc-500 font-medium">
                      <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-zinc-300" /> {item.position}</span>
                      <span className="text-zinc-200">|</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-zinc-300" /> {item.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 lg:flex-1 lg:mx-10">
                  {item.tags.map((tag, i) => (
                    <span key={i} className="px-4 py-1.5 bg-[#eef8f3]/50 text-[#1dbf73] text-[10px] font-black rounded-xl border border-[#1dbf73]/10 uppercase tracking-wider">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-10">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-1">综合评分</span>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1dbf73] to-[#19a463] flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-[#1dbf73]/20">
                      {item.score}
                    </div>
                  </div>
                  
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-1">面试官</span>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-500 border border-zinc-200">
                        {item.interviewer.slice(0, 1)}
                      </div>
                      <p className="text-sm font-black text-zinc-700">{item.interviewer}</p>
                    </div>
                  </div>

                  <Button size="sm" variant="ghost" className="w-12 h-12 rounded-2xl hover:bg-[#1dbf73]/10 hover:text-[#1dbf73] p-0 transition-colors">
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-zinc-50/50 border-t border-zinc-50 text-center">
          <Button 
            variant="ghost"
            className="text-sm text-zinc-500 hover:text-[#1dbf73] font-medium inline-flex items-center gap-1 p-0 h-auto hover:bg-transparent"
          >
            查看更多历史评估 <ArrowUpRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}