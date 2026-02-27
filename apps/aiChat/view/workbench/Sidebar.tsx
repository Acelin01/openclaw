'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, LogOut, User, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WORKBENCH_MENUS } from '@/config/navigation';
import { signOut } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage, Button } from '@uxin/ui';
import { toast } from '@/components/toast';
import type { User as NextAuthUser } from 'next-auth';

interface SidebarProps {
  user?: NextAuthUser;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function Sidebar({ user, activeTab = 'all', onTabChange }: SidebarProps) {
  const [hasRecruitmentTrial, setHasRecruitmentTrial] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const userName = user?.name || user?.email?.split('@')[0] || '用户';
  const userAvatar = user?.image || '';
  const userInitials = userName.slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut({ callbackUrl: '/login' });
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        type: 'error',
        description: '退出登录失败，请重试',
      });
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    // Check recruitment trial status
    const trialData = localStorage.getItem('uxin_recruitment_trial');
    if (trialData) {
      try {
        const { endDate } = JSON.parse(trialData);
        if (new Date(endDate) > new Date()) {
          setHasRecruitmentTrial(true);
        }
      } catch (e) {
        console.error('Failed to parse trial data', e);
      }
    }
  }, []);

  return (
    <div className="w-60 bg-white border-r flex flex-col h-full overflow-hidden">
      <div className="p-5 border-b flex items-center bg-zinc-50/50">
        <div className="w-9 h-9 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold mr-3 shadow-sm">
          UX
        </div>
        <div className="flex flex-col">
          <h2 className="text-sm font-semibold text-zinc-900 leading-none mb-1">工作台</h2>
          <p className="text-sm text-zinc-500">AI协助办公</p>
        </div>
      </div>

      <div className="p-4 bg-zinc-50/50 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            className="w-full pl-9 pr-3 py-2 border rounded-lg bg-white text-xs outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            placeholder="搜索功能 or 应用"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {WORKBENCH_MENUS.map((menu, index) => (
          <React.Fragment key={menu.category}>
            <div className={cn("px-5 py-3 text-[11px] font-bold text-zinc-400 uppercase tracking-wider", index > 0 && "mt-6")}>
              {menu.category}
            </div>
            <div className="space-y-0.5">
              {menu.items.map((item: any) => {
                const isActive = activeTab === item.id;
                
                // Special handling for recruitment link
                let href = item.href;
                if (item.id === 'recruitment' && !hasRecruitmentTrial) {
                  // If no trial, we still go to /recruitment/1 but the layout will handle showing the intro.
                  // Or we could explicitly point to an intro page if one existed.
                  // For now, keeping it as is since layout handles it, but we could add a query param.
                }

                const content = (
                  <div
                    className={cn(
                      "px-5 py-2.5 flex items-center cursor-pointer transition-colors group relative",
                      isActive
                        ? "bg-emerald-50 text-emerald-600 font-semibold border-l-[3px] border-emerald-500" 
                        : "text-zinc-600 hover:bg-zinc-50 border-l-[3px] border-transparent"
                    )}
                    onClick={() => !item.href && onTabChange?.(item.id)}
                  >
                    <item.icon className={cn(
                      "mr-3 h-4 w-4",
                      isActive ? "text-emerald-500" : "text-zinc-400 group-hover:text-zinc-600"
                    )} />
                    <span className="flex-1 text-sm">{item.label}</span>
                    {item.count !== undefined && (
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full",
                        isActive ? "bg-emerald-100 text-emerald-600" : "bg-zinc-100 text-zinc-500"
                      )}>
                        {item.count}
                      </span>
                    )}
                  </div>
                );

                if (item.href) {
                  return <Link key={item.id} href={item.href}>{content}</Link>;
                }

                return <React.Fragment key={item.id}>{content}</React.Fragment>;
              })}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
