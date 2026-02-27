'use client';

import React from 'react';
import { ProjectAssignments } from '@uxin/shared-employee';
import { useSharedEmployees } from '@/hooks/use-shared-employee';

export default function AssignmentsPage() {
  const { data: employees } = useSharedEmployees();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-black text-zinc-900">借调记录</h2>
            <p className="text-zinc-400 text-sm mt-1">查看员工在各个项目中的分配和执行情况</p>
          </div>
        </div>
        <ProjectAssignments employees={employees || []} />
      </div>
    </div>
  );
}
