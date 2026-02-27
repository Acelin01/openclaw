'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SHARED_EMPLOYEE_TABS } from '@/config/navigation';

export function SharedEmployeeSidebar() {
  const pathname = usePathname();

  const tabs = SHARED_EMPLOYEE_TABS.map(tab => ({
    ...tab,
    href: `/shared-employees${tab.href}`,
  }));

  const activeTabId = tabs.find(tab => {
    const normalizedPathname = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
    const normalizedTabHref = tab.href.endsWith('/') ? tab.href.slice(0, -1) : tab.href;
    return normalizedPathname === normalizedTabHref || (tab.id === 'overview' && normalizedPathname === '/shared-employees');
  })?.id || 'overview';

  // Group tabs by category
  const categories = tabs.reduce((acc, tab) => {
    const category = tab.category || '其他';
    if (!acc[category]) acc[category] = [];
    acc[category].push(tab);
    return acc;
  }, {} as Record<string, typeof tabs>);

  return (
    <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col z-20">
      {/* Header */}
      <div className="p-5 border-b border-zinc-100 flex items-center gap-3 bg-zinc-50/50">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1dbf73] to-[#19a463] text-white flex items-center justify-center font-bold text-xl shadow-sm">
          共
        </div>
        <div>
          <h2 className="text-base font-black text-zinc-900 leading-none">员工共享</h2>
          <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider font-bold">Shared Employee</p>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-[#1dbf73] transition-colors" />
          <input 
            type="text" 
            placeholder="搜索员工或记录..." 
            className="w-full pl-9 pr-4 py-2 bg-zinc-100/50 border border-transparent focus:border-[#1dbf73]/20 focus:bg-white focus:ring-4 focus:ring-[#1dbf73]/5 rounded-xl text-sm transition-all outline-none"
          />
        </div>
      </div>

      {/* Nav Container */}
      <div className="flex-1 overflow-y-auto py-2">
        {Object.entries(categories).map(([category, categoryTabs], index) => (
          <div key={category} className={cn("mb-4", index > 0 && "mt-2")}>
            <h3 className="px-5 py-2 text-[11px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-50/30 border-y border-zinc-100/50">
              {category}
            </h3>
            <div className="mt-1 px-2 space-y-0.5">
              {categoryTabs.map((tab) => {
                const isActive = activeTabId === tab.id;
                return (
                  <Link
                    key={tab.id}
                    href={tab.href}
                    className={cn(
                      "flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group relative",
                      isActive 
                        ? "bg-[#eef8f3] text-[#1dbf73] font-bold shadow-sm shadow-[#1dbf73]/10" 
                        : "text-zinc-500 hover:bg-zinc-100/80 hover:text-zinc-900"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <tab.icon className={cn(
                        "w-4.5 h-4.5 transition-colors",
                        isActive ? "text-[#1dbf73]" : "text-zinc-400 group-hover:text-zinc-600"
                      )} />
                      <span className="text-sm">{tab.label}</span>
                    </div>
                    {tab.count !== undefined && (
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-bold transition-all",
                        isActive 
                          ? "bg-[#1dbf73] text-white" 
                          : "bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200"
                      )}>
                        {tab.count}
                      </span>
                    )}
                    {isActive && (
                      <div className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-[#1dbf73] rounded-r-full" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
