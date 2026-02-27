'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Plus, Save, Filter, RefreshCcw } from 'lucide-react';
import { Button } from '@uxin/ui';
import { SHARED_EMPLOYEE_TABS } from '@/config/navigation';

export function SharedEmployeeHeader() {
  const pathname = usePathname();

  // Find active tab info
  const activeTab = SHARED_EMPLOYEE_TABS.find(tab => {
    const tabHref = `/shared-employees${tab.href}`;
    const normalizedPathname = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
    const normalizedTabHref = tabHref.endsWith('/') ? tabHref.slice(0, -1) : tabHref;
    return normalizedPathname === normalizedTabHref || (tab.id === 'overview' && normalizedPathname === '/shared-employees');
  }) || SHARED_EMPLOYEE_TABS[0];

  // Dynamic content based on tab id
  const getHeaderContent = () => {
    switch (activeTab.id) {
      case 'overview':
        return {
          title: '共享概览',
          description: '即时调配专业人才，优化企业人力资源配置',
          actions: (
            <div className="flex gap-3">
              <Button 
                variant="outline"
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold text-sm shadow-sm h-auto"
              >
                <RefreshCcw size={18} />
                同步数据
              </Button>
              <Button 
                className="flex items-center gap-2 px-4 py-2.5 bg-[#1dbf73] text-white rounded-xl hover:bg-[#19a463] transition-all font-semibold text-sm shadow-md h-auto border-none"
              >
                <Plus size={18} />
                员工入驻
              </Button>
            </div>
          )
        };
      case 'pool':
        return {
          title: '员工池',
          description: '浏览和筛选所有可供共享的专业人才',
          actions: (
            <Button 
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1dbf73] text-white rounded-xl hover:bg-[#19a463] transition-all font-semibold text-sm shadow-md h-auto border-none"
            >
              <Plus size={18} />
              添加员工
            </Button>
          )
        };
      case 'assignments':
        return {
          title: '借调记录',
          description: '管理员工的借调申请、执行状态和评价',
          actions: (
            <Button 
              variant="outline"
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold text-sm shadow-sm h-auto"
            >
              <Filter size={18} />
              筛选记录
            </Button>
          )
        };
      default:
        return {
          title: activeTab.label,
          description: '管理您的共享员工业务',
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
