'use client';

import React from 'react';
import { WorkerServiceTable } from '@uxin/worker-service';
import { useWorkerServices, useWorker } from '@/hooks/use-worker';
import { useSession } from 'next-auth/react';

export default function ServicesPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  const { data: worker } = useWorker(userId);
  const { data: services, isLoading } = useWorkerServices(worker?.id);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
        <div className="p-6 border-b border-zinc-50">
          <h3 className="text-lg font-bold text-zinc-900">服务管理</h3>
          <p className="text-sm text-zinc-500 mt-1">管理您发布的所有专业服务项目</p>
        </div>
        <div className="p-6">
          <WorkerServiceTable services={services || []} />
        </div>
      </div>
    </div>
  );
}
