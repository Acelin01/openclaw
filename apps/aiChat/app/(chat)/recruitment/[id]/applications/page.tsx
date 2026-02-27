'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  Calendar, 
  Download, 
  CheckCircle 
} from 'lucide-react';
import { Button, Card, Badge } from '@uxin/ui';

export default function ApplicationsPage() {
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
      skills: ['React', 'TypeScript', 'Node.js']
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
      skills: ['产品原型', '竞品分析', '需求文档']
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
      skills: ['Vue.js', 'Webpack', 'Echarts']
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
      skills: ['Figma', 'Sketch', 'Adobe XD']
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
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white p-4 rounded-xl border border-[#e0e0e0]">
        <div className="flex flex-1 gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
            <input 
              type="text" 
              placeholder="搜索候选人、岗位..." 
              className="w-full pl-9 pr-4 py-2 bg-[#f9f9f9] border border-[#e0e0e0] rounded-lg text-sm focus:outline-none focus:border-[#1dbf73] transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" /> 筛选
          </Button>
        </div>
      </div>

      {/* Applications Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {applications.map((app) => (
          <Card key={app.id} className="hover:border-[#1dbf73] transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#f0f0f0] flex items-center justify-center text-[#666] font-bold text-lg border-2 border-white shadow-sm">
                  {app.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-[#222] flex items-center gap-2">
                    {app.name}
                    {getStatusBadge(app.status)}
                  </h4>
                  <p className="text-sm text-[#1dbf73] font-medium">{app.position}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                className="p-1.5 hover:bg-gray-100 rounded-lg text-[#999] h-auto border-none"
              >
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-y-3 mb-4">
              <div className="flex items-center gap-2 text-xs text-[#666]">
                <Mail className="w-3.5 h-3.5" /> {app.email}
              </div>
              <div className="flex items-center gap-2 text-xs text-[#666]">
                <Phone className="w-3.5 h-3.5" /> {app.phone}
              </div>
              <div className="flex items-center gap-2 text-xs text-[#666]">
                <Calendar className="w-3.5 h-3.5" /> 申请于 {app.appliedAt}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {app.skills.map(skill => (
                <span key={skill} className="px-2 py-0.5 bg-[#eef8f3] text-[#1dbf73] text-[10px] rounded-full font-medium">
                  {skill}
                </span>
              ))}
            </div>

            <div className="flex gap-2 pt-4 border-t border-[#f0f0f0]">
              <Button variant="outline" size="sm" className="flex-1 flex items-center justify-center gap-1.5 h-9">
                <Download className="w-3.5 h-3.5" /> 查看简历
              </Button>
              {app.status === 'NEW' && (
                <Button className="flex-1 flex items-center justify-center gap-1.5 h-9 bg-[#1dbf73] hover:bg-[#19a463] text-white border-none">
                  <CheckCircle className="w-3.5 h-3.5" /> 通过初筛
                </Button>
              )}
              {app.status === 'INTERVIEW' && (
                <Button className="flex-1 flex items-center justify-center gap-1.5 h-9 bg-[#1dbf73] hover:bg-[#19a463] text-white border-none">
                  <Calendar className="w-3.5 h-3.5" /> 安排面试
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
