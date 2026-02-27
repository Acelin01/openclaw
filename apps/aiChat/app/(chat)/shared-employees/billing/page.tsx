'use client';

import React from 'react';
import { FileSpreadsheet } from 'lucide-react';

export default function BillingPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 p-12 text-center">
        <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FileSpreadsheet className="w-8 h-8 text-zinc-400" />
        </div>
        <h3 className="text-xl font-black text-zinc-900">结算账单</h3>
        <p className="text-zinc-500 mt-2 max-w-md mx-auto font-medium">
          在此查看共享员工的结算详情和历史账单。该模块正在开发中。
        </p>
      </div>
    </div>
  );
}
