'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Calendar, 
  Download, 
  CheckCircle
} from 'lucide-react';
import { Button, Card, Badge } from '@uxin/recruitment';

export default function MatchingPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const applications = [
    { 
      id: '1', 
      name: '张三', 
      avatar: '张', 
      position: '高级前端开发工程师', 
      email: 'zhangsan@example.com', 
      phone: '138****8888', 
      status: 'INTERVIEW', 
      appliedAt: '2025-12-20',
      skills: ['React', 'TypeScript', 'Node.js'],
      matchScore: 95
    },
    { 
      id: '2', 
      name: '李四', 
      avatar: '李', 
      position: '产品经理', 
      email: 'lisi@example.com', 
      phone: '139****9999', 
      status: 'NEW', 
      appliedAt: '2025-12-22',
      skills: ['产品原型', '竞品分析', '需求文档'],
      matchScore: 88
    },
    { 
      id: '3', 
      name: '王五', 
      avatar: '王', 
      position: '高级前端开发工程师', 
      email: 'wangwu@example.com', 
      phone: '137****7777', 
      status: 'REVIEWED', 
      appliedAt: '2025-12-21',
      skills: ['Vue.js', 'Webpack', 'Echarts'],
      matchScore: 82
    },
    { 
      id: '4', 
      name: '赵六', 
      avatar: '赵', 
      position: 'UI设计师', 
      email: 'zhaoliu@example.com', 
      phone: '136****6666', 
      status: 'REJECTED', 
      appliedAt: '2025-12-15',
      skills: ['Figma', 'Sketch', 'Adobe XD'],
      matchScore: 75
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW': return <Badge variant="info">新申请</Badge>;
      case 'REVIEWED': return <Badge variant="warning">已初筛</Badge>;
      case 'INTERVIEW': return <Badge variant="success">面试中</Badge>;
      case 'REJECTED': return <Badge variant="secondary">已拒绝</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white p-4 rounded-xl border border-zinc-100 shadow-sm">
        <div className="flex flex-1 gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text" 
              placeholder="搜索候选人、岗位..." 
              className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:outline-none focus:border-[#1dbf73] transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2 border-zinc-200 text-xs h-9">
            <Filter className="w-4 h-4" /> 筛选
          </Button>
        </div>
      </div>

      {/* Applications Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {applications.map((app) => (
          <div key={app.id} className="bg-white rounded-2xl border border-zinc-100 p-6 hover:border-[#1dbf73] transition-all group shadow-sm hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400 font-bold text-lg border border-zinc-100">
                  {app.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 flex items-center gap-2">
                    {app.name}
                    {getStatusBadge(app.status)}
                  </h4>
                  <p className="text-sm text-[#1dbf73] font-medium">{app.position}</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">匹配度</div>
                <div className="text-xl font-black text-[#1dbf73]">{app.matchScore}%</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-3 mb-4">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Mail className="w-3.5 h-3.5 text-zinc-300" /> {app.email}
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Phone className="w-3.5 h-3.5 text-zinc-300" /> {app.phone}
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Calendar className="w-3.5 h-3.5 text-zinc-300" /> 申请于 {app.appliedAt}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {app.skills.map(skill => (
                <span key={skill} className="px-2 py-0.5 bg-[#eef8f3] text-[#1dbf73] text-[10px] rounded-full font-bold border border-[#1dbf73]/10">
                  {skill}
                </span>
              ))}
            </div>

            <div className="flex gap-3 pt-4 border-t border-zinc-50">
              <Button variant="outline" size="sm" className="flex-1 flex items-center justify-center gap-1.5 h-10 border-zinc-200 text-xs font-bold rounded-xl">
                <Download className="w-3.5 h-3.5" /> 查看简历
              </Button>
              {app.status === 'NEW' && (
                <Button className="flex-1 flex items-center justify-center gap-1.5 h-10 bg-[#1dbf73] hover:bg-[#19a463] text-white border-none shadow-sm text-xs font-bold rounded-xl">
                  <CheckCircle className="w-3.5 h-3.5" /> 通过初筛
                </Button>
              )}
              {app.status === 'INTERVIEW' && (
                <Button className="flex-1 flex items-center justify-center gap-1.5 h-10 bg-[#1dbf73] hover:bg-[#19a463] text-white border-none shadow-sm text-xs font-bold rounded-xl">
                  <Calendar className="w-3.5 h-3.5" /> 安排面试
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
