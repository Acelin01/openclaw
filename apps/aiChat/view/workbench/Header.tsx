'use client';

import React from 'react';
import { Plus, Bell, Settings } from 'lucide-react';
import { Button } from "@uxin/ui";

interface HeaderProps {
  userName?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
}

export function Header({ userName = '用户', title, subtitle }: HeaderProps) {
  const currentHour = new Date().getHours();
  let greeting = '你好';
  if (currentHour < 12) greeting = '早上好';
  else if (currentHour < 18) greeting = '下午好';
  else greeting = '晚上好';

  return (
    <div className="px-6 py-6 bg-white border-b flex justify-between items-center sticky top-0 z-10">
      <div className="welcome-section">
        <h1 className="text-2xl font-bold text-zinc-900 leading-tight">
          {title || `${greeting}, ${userName}`}
        </h1>
        <div className="text-sm text-zinc-500 mt-1">
          {subtitle || '今天有 5 条新待办，请注意查收。'}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 mr-2">
          <Button variant="ghost" size="icon" className="rounded-full relative">
            <Bell className="h-5 w-5 text-zinc-600" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Settings className="h-5 w-5 text-zinc-600" />
          </Button>
        </div>
        
        <Button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-semibold shadow-sm shadow-emerald-200 transition-all active:scale-95 border-none h-auto">
          <Plus className="h-4 w-4" />
          <span>新建任务</span>
        </Button>
      </div>
    </div>
  );
}
