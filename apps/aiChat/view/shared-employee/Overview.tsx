'use client';

import React from 'react';
import { 
  SharedEmployeeList, 
  SharedEmployeeStatsGrid, 
  SharedEmployeeDetail,
  SkillMatrix,
  ProjectAssignments,
  ScheduleView,
  SharedEmployee 
} from '@uxin/shared-employee';
import { useSharedEmployees, useSharedEmployeeStats } from '@/hooks/use-shared-employee';
import { cn } from '@/lib/utils';

export default function SharedEmployeeOverview() {
  const { data: employees, isLoading: loading, refetch: refetchEmployees } = useSharedEmployees();
  const { data: stats, isLoading: statsLoading } = useSharedEmployeeStats();
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [selectedEmployee, setSelectedEmployee] = React.useState<SharedEmployee | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);

  const handleEmployeeClick = (employee: SharedEmployee) => {
    setSelectedEmployee(employee);
    setIsDetailOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F9FAFB] overflow-hidden">
      <div className="flex-1 overflow-y-auto px-10 py-10">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Stats Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-gray-900">数据看板</h2>
            </div>
            <SharedEmployeeStatsGrid stats={stats} isLoading={statsLoading} />
          </section>

          {/* Skill Matrix Preview */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black text-gray-900">人才技能矩阵</h2>
                <p className="text-gray-400 text-sm mt-1">可视化展示企业核心竞争力分布</p>
              </div>
            </div>
            <SkillMatrix employees={employees || []} />
          </section>

          {/* Recent Employees */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-gray-900">活跃人才</h2>
                <p className="text-gray-400 text-sm mt-1">当前可调配的高级专业人员</p>
              </div>
            </div>
            <SharedEmployeeList 
              employees={employees?.slice(0, 4) || []} 
              loading={loading}
              viewMode="grid"
              onEmployeeClick={handleEmployeeClick}
            />
          </section>
        </div>
      </div>

      {/* Detail Drawer */}
      <SharedEmployeeDetail 
        employee={selectedEmployee} 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
      />
    </div>
  );
}
