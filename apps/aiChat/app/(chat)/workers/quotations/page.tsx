'use client';

import React from 'react';
import { QuotationTable } from '@uxin/worker-service';
import { useWorkerQuotations } from '@/hooks/use-worker';

export default function QuotationsPage() {
  const { data: quotations, isLoading } = useWorkerQuotations();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
        <div className="p-6 border-b border-zinc-50 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">报价管理</h3>
            <p className="text-sm text-zinc-500 mt-1">查看和管理发送给客户的服务报价单</p>
          </div>
        </div>
        <div className="p-6">
          <QuotationTable quotations={quotations || []} />
        </div>
      </div>
    </div>
  );
}
