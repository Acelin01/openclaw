'use client';

import React from 'react';
import { BadgeDollarSign } from 'lucide-react';

export default function FinancePage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
        <div className="p-6 border-b border-zinc-50">
          <h3 className="text-lg font-bold text-zinc-900">财务结算</h3>
          <p className="text-sm text-zinc-500 mt-1">查看您的收入记录、提现记录及财务明细</p>
        </div>
        <div className="p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-300 mb-4">
            <BadgeDollarSign size={32} />
          </div>
          <h4 className="text-base font-bold text-zinc-900">暂无财务数据</h4>
          <p className="text-sm text-zinc-500 mt-1 max-w-xs">目前还没有任何结算记录</p>
        </div>
      </div>
    </div>
  );
}
