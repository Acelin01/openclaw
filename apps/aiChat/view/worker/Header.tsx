'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Plus, Save, Filter, Search } from 'lucide-react';
import { Button } from '@uxin/ui';
import { WORKER_SERVICE_TABS } from '@/config/navigation';

export function WorkerHeader() {
  const pathname = usePathname();

  // Find active tab info
  const activeTab = WORKER_SERVICE_TABS.find(tab => {
    const tabHref = `/workers${tab.href}`;
    const normalizedPathname = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
    const normalizedTabHref = tabHref.endsWith('/') ? tabHref.slice(0, -1) : tabHref;
    return normalizedPathname === normalizedTabHref || (tab.id === 'overview' && normalizedPathname === '/workers');
  }) || WORKER_SERVICE_TABS[0];

  // Dynamic content based on tab id
  const getHeaderContent = () => {
    switch (activeTab.id) {
      case 'overview':
        return {
          title: '服务概览',
          description: '管理您的专业企业和服务产品，实时掌握业务动态',
          actions: (
            <div className="flex gap-3">
              <Button 
                variant="outline"
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold text-sm shadow-sm h-auto"
              >
                <Filter size={18} />
                筛选过滤
              </Button>
              <Button className="flex items-center gap-2 px-4 py-2.5 bg-[#1dbf73] text-white rounded-xl hover:bg-[#19a463] transition-all font-semibold text-sm shadow-md h-auto border-none">
                <Plus size={18} />
                发布新服务
              </Button>
            </div>
          )
        };
      case 'services':
        return {
          title: '服务管理',
          description: '配置和发布您的专业服务项',
          actions: (
            <Button className="flex items-center gap-2 px-4 py-2.5 bg-[#1dbf73] text-white rounded-xl hover:bg-[#19a463] transition-all font-semibold text-sm shadow-md h-auto border-none">
              <Plus size={18} />
              添加服务
            </Button>
          )
        };
      case 'quotations':
        return {
          title: '报价管理',
          description: '查看和管理您的业务报价单',
          actions: (
            <Button className="flex items-center gap-2 px-4 py-2.5 bg-[#1dbf73] text-white rounded-xl hover:bg-[#19a463] transition-all font-semibold text-sm shadow-md h-auto border-none">
              <Plus size={18} />
              新建报价
            </Button>
          )
        };
      case 'settings':
        return {
          title: '服务设置',
          description: '配置您的个人资料、支付方式和服务偏好',
          actions: (
            <Button className="flex items-center gap-2 px-4 py-2.5 bg-[#1dbf73] text-white rounded-xl hover:bg-[#19a463] transition-all font-semibold text-sm shadow-md h-auto border-none">
              <Save size={18} />
              保存设置
            </Button>
          )
        };
      default:
        return {
          title: activeTab.label,
          description: '管理您的自由工作者服务',
          actions: null
        };
    }
  };

  const content = getHeaderContent();

  return (
    <header className="bg-white border-b border-zinc-200 px-8 py-6 shrink-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#eef8f3] text-[#1dbf73] flex items-center justify-center shadow-sm border border-[#1dbf73]/10">
            <activeTab.icon size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight">{content.title}</h1>
            <p className="text-sm text-zinc-500 font-medium mt-1">{content.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {content.actions}
        </div>
      </div>
    </header>
  );
}
