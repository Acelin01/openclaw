'use client';

import React from 'react';
import { usePathname, useParams } from 'next/navigation';
import { Plus, Save } from 'lucide-react';
import { Button } from '@uxin/recruitment';
import { AIIcon } from '@/components/icons';
import { RECRUITMENT_TABS } from '@/config/navigation';

export function RecruitmentHeader() {
  const pathname = usePathname();
  const params = useParams();
  const id = (params.id as string) || '1';

  // Find active tab info
  const activeTab = RECRUITMENT_TABS.find(tab => {
    const tabHref = `/recruitment/${id}${tab.href}`;
    const normalizedPathname = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
    const normalizedTabHref = tabHref.endsWith('/') ? tabHref.slice(0, -1) : tabHref;
    return normalizedPathname === normalizedTabHref || (tab.id === 'overview' && normalizedPathname === `/recruitment/${id}`);
  }) || RECRUITMENT_TABS[0];

  const Icon = activeTab.icon || 'div';

  // Dynamic content based on tab id
  const getHeaderContent = () => {
    switch (activeTab.id) {
      case 'settings':
        return {
          title: '招聘设置',
          description: '配置您的招聘偏好、通知和团队权限',
          actions: (
            <Button className="flex items-center gap-2 bg-[#1dbf73] hover:bg-[#19a463] text-white border-none shadow-sm">
              <Save className="w-4 h-4" /> 保存更改
            </Button>
          )
        };
      case 'positions':
        return {
          title: '岗位管理',
          description: '管理您的职位发布、JD 和招聘渠道',
          actions: (
            <Button className="flex items-center gap-2 bg-[#1dbf73] hover:bg-[#19a463] text-white border-none shadow-sm rounded-full px-6">
              <AIIcon className="w-4 h-4" /> 发布岗位
            </Button>
          )
        };
      case 'overview':
        return {
          title: '招聘概览',
          description: '实时掌握招聘进展、候选人动态和面试安排',
          actions: (
            <Button variant="outline" className="border-zinc-200 text-zinc-600 hover:bg-zinc-50">
              导出报表
            </Button>
          )
        };
      case 'applications':
        return {
          title: '应聘管理',
          description: '筛选简历、评估候选人并推进招聘流程',
          actions: (
            <Button variant="outline" className="border-zinc-200 text-zinc-600 hover:bg-zinc-50">
              批量操作
            </Button>
          )
        };
      case 'interviews':
        return {
          title: '面试日程',
          description: '查看和安排您的面试任务，确保流程高效运行',
          actions: (
            <Button className="flex items-center gap-2 bg-[#1dbf73] hover:bg-[#19a463] text-white border-none shadow-sm">
              <Plus className="w-4 h-4" /> 安排面试
            </Button>
          )
        };
      case 'addresses':
        return {
          title: '办公地点',
          description: '配置和管理您的办公地点信息',
          actions: (
            <Button className="flex items-center gap-2 bg-[#1dbf73] hover:bg-[#19a463] text-white border-none shadow-sm">
              <Plus className="w-4 h-4" /> 添加地点
            </Button>
          )
        };
      default:
        return {
          title: activeTab.label,
          description: '管理您的招聘流程',
          actions: null
        };
    }
  };

  const content = getHeaderContent();

  return (
    <header className="bg-white border-b border-zinc-200 px-8 py-6 shrink-0 z-10">
      <div className="flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#eef8f3] rounded-2xl flex items-center justify-center text-[#1dbf73] shadow-sm">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900">{content.title}</h1>
            <p className="text-sm text-zinc-500 mt-0.5">{content.description}</p>
          </div>
        </div>
        <div className="flex gap-3">
          {content.actions}
        </div>
      </div>
    </header>
  );
}
