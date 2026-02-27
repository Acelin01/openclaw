'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from "@uxin/ui";

interface StatItem {
  label: string;
  value: string | number;
  change?: number;
  isPositive?: boolean;
}

interface StatsCardProps {
  stats: StatItem[];
}

export function StatsCard({ stats }: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-5 flex flex-col justify-between h-full">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
          <Activity className="h-4 w-4 text-emerald-500" />
        </div>
        <h3 className="text-base font-bold text-zinc-900">核心指标</h3>
      </div>

      <div className="space-y-5">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-end justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-zinc-500">{stat.label}</p>
              <p className="text-2xl font-bold text-zinc-900 leading-none">{stat.value}</p>
            </div>
            
            {stat.change !== undefined && (
              <div className={cn(
                "flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full",
                stat.isPositive 
                  ? "bg-emerald-50 text-emerald-600" 
                  : "bg-red-50 text-red-600"
              )}>
                {stat.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{stat.change}%</span>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-5 border-t border-zinc-50">
        <Button variant="ghost" className="w-full py-2.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 text-xs font-bold rounded-lg transition-colors h-auto">
          查看详细报表
        </Button>
      </div>
    </div>
  );
}
