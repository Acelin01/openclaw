'use client';

import React from 'react';
import { SharedEmployeeList, SharedEmployeeDetail, SharedEmployee } from '@uxin/shared-employee';
import { useSharedEmployees } from '@/hooks/use-shared-employee';

export default function EmployeePoolPage() {
  const { data: employees, isLoading: loading } = useSharedEmployees();
  const [selectedEmployee, setSelectedEmployee] = React.useState<SharedEmployee | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);

  const handleEmployeeClick = (employee: SharedEmployee) => {
    setSelectedEmployee(employee);
    setIsDetailOpen(true);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-black text-zinc-900">员工池</h2>
            <p className="text-zinc-400 text-sm mt-1">管理和调配所有共享员工资源</p>
          </div>
        </div>
        <SharedEmployeeList 
          employees={employees || []} 
          loading={loading}
          onEmployeeClick={handleEmployeeClick}
        />
      </div>

      <SharedEmployeeDetail 
        employee={selectedEmployee} 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
      />
    </div>
  );
}
