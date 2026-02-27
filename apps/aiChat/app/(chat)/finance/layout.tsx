'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthToken } from '@/hooks/use-auth-token';
import { constructApiUrl } from '@/lib/api';
import { 
  Search,
  LayoutDashboard,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FINANCE_SIDEBAR_NAV } from '@/config/navigation';

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { token } = useAuthToken();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchWallet = async () => {
      try {
        setLoading(true);
        const url = constructApiUrl('/api/v1/finance/wallet');
        const res = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setBalance(data.data.balance);
        }
      } catch (error) {
        console.error('Failed to fetch wallet for sidebar:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, [token]);

  const navItems = FINANCE_SIDEBAR_NAV.map(section => ({
    ...section,
    items: section.items.map(item => ({
      ...item,
      extra: item.name === '账户余额' && balance !== null 
        ? `¥${balance.toLocaleString()}` 
        : undefined
    }))
  }));

  return (
    <div className="flex h-full overflow-hidden bg-zinc-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col z-20">
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 flex items-center gap-3 bg-zinc-50/50">
          <div className="w-9 h-9 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold">
            T
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-900 leading-none">TechCorp</h2>
            <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider font-medium">薪酬管理应用</p>
          </div>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="text" 
              placeholder="搜索交易或用户..." 
              className="w-full pl-9 pr-4 py-2 bg-zinc-100/50 border border-transparent focus:border-emerald-500/20 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 rounded-xl text-sm transition-all outline-none"
            />
          </div>
        </div>

        {/* Nav Container */}
        <div className="flex-1 overflow-y-auto py-2">
          {navItems.map((section, idx) => (
            <div key={idx} className="mb-4">
              <h3 className="px-5 py-2 text-[11px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-50/30 border-y border-zinc-100/50">
                {section.title}
              </h3>
              <div className="mt-1 px-2 space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group relative",
                        isActive 
                          ? "bg-emerald-50 text-emerald-600 shadow-sm shadow-emerald-500/10" 
                          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={cn(
                          "w-4 h-4 transition-colors",
                          isActive ? "text-emerald-600" : "text-zinc-400 group-hover:text-zinc-900"
                        )} />
                        <span className="text-sm font-bold">{item.name}</span>
                      </div>
                      
                      {item.extra ? (
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-md",
                          isActive ? "bg-emerald-100/50 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                        )}>
                          {item.extra}
                        </span>
                      ) : item.count ? (
                        <span className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                          isActive ? "bg-emerald-100/50 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                        )}>
                          {item.count}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 mt-auto border-t border-zinc-100">
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-200" />
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-zinc-900 truncate">张客户</p>
              <p className="text-[10px] text-zinc-500 truncate">customer@example.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-zinc-50/50">
        {children}
      </main>
    </div>
  );
}
