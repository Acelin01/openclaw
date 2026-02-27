'use client';

import Link from 'next/link';
import { LayoutGrid, Calendar, Receipt, Briefcase, Users, FileText, Settings, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, isEmoji } from '@uxin/ui';

interface AppItem {
  id: string;
  name: string;
  icon: string;
  url: string;
  description?: string;
  badge?: number;
}

interface AppCardProps {
  apps: AppItem[];
  loading?: boolean;
}

const iconMap: Record<string, any> = {
  calendar: Calendar,
  receipt: Receipt,
  briefcase: Briefcase,
  users: Users,
  file: FileText,
  settings: Settings,
  default: LayoutGrid
};

export function AppCard({ apps, loading }: AppCardProps) {

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="px-5 py-4 border-b flex justify-between items-center bg-zinc-50/30">
        <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
          <LayoutGrid className="h-4 w-4 text-emerald-500" />
          常用应用
        </h3>
        <Button 
          variant="ghost" 
          className="text-xs text-zinc-400 hover:text-emerald-500 flex items-center transition-colors p-0 h-auto hover:bg-transparent border-none"
        >
          更多应用 <ChevronRight className="h-3 w-3 ml-0.5" />
        </Button>
      </div>
      
      <div className="p-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col items-center p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                <div className="w-10 h-10 bg-zinc-200 rounded-xl mb-3"></div>
                <div className="h-3 w-16 bg-zinc-200 rounded mb-1"></div>
                <div className="h-2 w-12 bg-zinc-200 rounded"></div>
              </div>
            ))
          ) : (
            apps.map((app) => {
              const IconComponent = iconMap[app.icon] || iconMap.default;
              return (
                <Link key={app.id} href={app.url} className="relative group">
                  <div className="flex flex-col items-center p-4 bg-zinc-50/50 hover:bg-emerald-50 rounded-xl border border-transparent hover:border-emerald-100 transition-all cursor-pointer group">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-3 group-hover:bg-emerald-500 group-hover:text-white transition-colors overflow-hidden text-2xl">
                      {app.icon.startsWith('http') ? (
                        <img src={app.icon} alt="" className="h-8 w-8 object-contain" />
                      ) : isEmoji(app.icon) ? (
                        <span>{app.icon}</span>
                      ) : (
                        <IconComponent className="h-6 w-6 text-emerald-500 group-hover:text-white transition-colors" />
                      )}
                    </div>
                    <span className="text-sm font-semibold text-zinc-900 mb-0.5 text-center truncate w-full">{app.name}</span>
                    <span className="text-[10px] text-zinc-400 text-center truncate w-full">{app.description || '点击打开'}</span>
                  </div>
                  {app.badge && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm">
                      {app.badge}
                    </span>
                  )}
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
