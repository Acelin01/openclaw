'use client';

import React, { useState } from 'react';
import { 
  Briefcase, 
  Search, 
  Filter, 
  Edit, 
  MoreHorizontal,
  Zap,
  Calendar,
  Clock,
  MapPin
} from 'lucide-react';
import { Button, Card, Badge } from '@uxin/ui';
import { cn } from '@/lib/utils';
import { AIIcon } from '@/components/icons';
import { PublishPositionDialog } from './publish-position-dialog';
import { getRecruitmentContext } from '@/app/actions/recruitment';

export default function PositionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [contextData, setContextData] = useState<{ project: any[], positions: any[] }>({ project: [], positions: [] });

  React.useEffect(() => {
    if (isPublishDialogOpen) {
      getRecruitmentContext().then(data => {
        setContextData({
            project: data.projects,
            positions: data.positions
        });
      });
    }
  }, [isPublishDialogOpen]);

  const categories = [
    { id: 'all', label: '全部岗位' },
    { id: 'fulltime', label: '全职岗位' },
    { id: 'parttime', label: '兼职岗位' },
    { id: 'flexible', label: '灵活用工' },
    { id: 'remote', label: '远程岗位' },
  ];

  const positions = [
    { 
      id: '1', 
      title: '在线内容审核员（日结/时薪）', 
      department: '运营部', 
      location: '远程在线', 
      type: '灵活用工', 
      category: 'flexible',
      status: 'OPEN', 
      candidates: 24, 
      salary: '¥45-65/小时',
      settlement: '日结',
      duration: '灵活，3-8小时/天',
      payment: '在线结算',
      description: '负责审核用户生成的文本、图片和视频内容，确保符合平台规定。工作时间灵活，按小时计费，每日结算，支持多种在线支付方式。',
      tags: ['内容审核', '远程工作', '灵活时间', '日结工资', '在线结算'],
      createdAt: '2025-12-01' 
    },
    { id: '2', title: '高级前端开发工程师', department: '研发部', location: '北京', type: '全职', category: 'fulltime', status: 'OPEN', candidates: 45, createdAt: '2025-12-01' },
    { id: '3', title: '产品经理', department: '产品部', location: '上海', type: '全职', category: 'fulltime', status: 'OPEN', candidates: 28, createdAt: '2025-12-05' },
    { id: '4', title: 'UI设计师', department: '设计部', location: '远程', type: '兼职', category: 'parttime', status: 'CLOSED', candidates: 12, createdAt: '2025-11-20' },
  ];

  const filteredPositions = activeCategory === 'all' 
    ? positions 
    : positions.filter(p => p.category === activeCategory);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Filters & Actions */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" /> 筛选
            </Button>
            <Button 
              className="flex items-center gap-2 bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50 px-4"
              onClick={() => setIsPublishDialogOpen(true)}
            >
              <div className="flex items-center justify-center w-5 h-5 bg-[#1dbf73]/10 text-[#1dbf73] rounded-md border border-[#1dbf73]/20">
                <AIIcon className="w-3 h-3" />
              </div> AI 发布岗位
            </Button>
            <Button className="flex items-center gap-2 bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50">
              <Zap className="w-4 h-4" /> 创建灵活用工
            </Button>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text" 
              placeholder="搜索岗位名称、部门..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#1dbf73] transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? "default" : "outline"}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "px-5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap h-auto border-none",
                activeCategory === cat.id
                  ? "bg-[#1dbf73] text-white shadow-sm hover:bg-[#19a463]"
                  : "bg-white text-zinc-600 border border-zinc-200 hover:border-[#1dbf73] hover:text-[#1dbf73] hover:bg-white"
              )}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Specialized View for Flexible/Remote Jobs */}
      {(activeCategory === 'flexible' || activeCategory === 'remote') ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPositions.map(job => (
            <div key={job.id} className="bg-white rounded-3xl border border-[#eef8f3] overflow-hidden hover:shadow-2xl hover:shadow-[#1dbf73]/10 transition-all relative group flex flex-col h-full transform hover:-translate-y-1 duration-300">
              {/* Badge */}
              <div className={cn(
                "absolute top-4 right-[-35px] text-white px-10 py-1.5 text-[10px] font-bold rotate-45 shadow-md uppercase tracking-widest z-10",
                job.category === 'flexible' ? "bg-[#1dbf73]" : "bg-blue-500"
              )}>
                {job.type}
              </div>

              <div className="p-8 flex-1">
                {/* Header */}
                <div className="mb-6">
                  <h3 className="text-xl font-black text-zinc-900 group-hover:text-[#1dbf73] transition-colors line-clamp-2 mb-4 leading-snug">
                    {job.title}
                  </h3>
                  
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center text-sm text-zinc-500 font-medium">
                      <Clock className="w-4 h-4 mr-2 text-[#1dbf73]" />
                      {job.settlement || '日结'}
                    </div>
                    <div className="flex items-center text-sm text-zinc-500 font-medium">
                      <MapPin className="w-4 h-4 mr-2 text-[#1dbf73]" />
                      {job.location}
                    </div>
                    <div className="flex items-center text-sm text-zinc-500 font-medium">
                      <Calendar className="w-4 h-4 mr-2 text-[#1dbf73]" />
                      {job.duration || '灵活时间'}
                    </div>
                  </div>

                  <div className={cn(
                    "inline-block px-5 py-2.5 rounded-2xl text-xl font-black text-white shadow-lg",
                    job.category === 'flexible' ? "bg-gradient-to-br from-[#1dbf73] to-[#19a463] shadow-[#1dbf73]/20" : "bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/20"
                  )}>
                    {job.salary}
                  </div>
                </div>

                <p className="text-sm text-zinc-500 leading-relaxed line-clamp-3 mb-6 font-medium">
                  {job.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {job.tags?.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-[#eef8f3] text-[#1dbf73] text-[10px] font-bold rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-5 bg-white border-t border-zinc-50 flex justify-between items-center mt-auto">
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-0.5">申请人数</span>
                  <span className="text-lg font-black text-zinc-900">{job.candidates} <span className="text-xs font-medium text-zinc-400">人</span></span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-10 border-zinc-200 text-zinc-600 hover:bg-zinc-50 rounded-xl px-4 font-bold">详情</Button>
                  <Button size="sm" className={cn(
                    "h-10 px-6 border-none text-white text-sm font-bold shadow-lg rounded-xl",
                    job.category === 'flexible' ? "bg-[#1dbf73] hover:bg-[#19a463] shadow-[#1dbf73]/20" : "bg-blue-500 hover:bg-blue-600 shadow-blue-500/20"
                  )}>
                    管理申请
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Traditional Table for other positions */}
      {(activeCategory !== 'flexible' && activeCategory !== 'remote') ? (
        <Card className="overflow-hidden p-0 border-zinc-200 shadow-sm rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-200">
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">岗位名称</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">部门</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">地点</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">类型</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">候选人</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredPositions.filter(p => p.category !== 'flexible').map((pos) => (
                  <tr key={pos.id} className="border-b border-zinc-100 last:border-none hover:bg-zinc-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#eef8f3] flex items-center justify-center text-[#1dbf73]">
                          <Briefcase className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-zinc-900">{pos.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600">{pos.department}</td>
                    <td className="px-6 py-4 text-sm text-zinc-600">{pos.location}</td>
                    <td className="px-6 py-4 text-sm text-zinc-600">{pos.type}</td>
                    <td className="px-6 py-4">
                      <Badge variant={
                        pos.status === 'OPEN' ? 'success' : 
                        pos.status === 'CLOSED' ? 'secondary' : 'default'
                      } className="rounded-full px-3">
                        {pos.status === 'OPEN' ? '招聘中' : 
                         pos.status === 'CLOSED' ? '已结束' : '草稿'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-zinc-900">{pos.candidates}</span>
                        <span className="text-xs text-zinc-400">人申请</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="p-2 hover:bg-[#eef8f3] rounded-lg text-[#1dbf73] transition-colors h-8 w-8">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="p-2 hover:bg-gray-100 rounded-lg text-zinc-400 transition-colors h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
