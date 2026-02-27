'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Users, 
  Briefcase, 
  Star, 
  DollarSign, 
  Search,
  Filter,
  Plus,
  LayoutGrid,
  FileText,
  Settings,
  ChevronRight
} from 'lucide-react';
import { 
  OverviewCard, 
  FreelancerCard,
  QuotationTable,
  WorkerServiceTable
} from '@uxin/worker-service';
import { Button } from '@uxin/ui';
import { useWorker } from '@/hooks/use-worker';
import { cn } from '@/lib/utils';

export default function WorkerOverview() {
  const { data: session } = useSession();
  
  // Use session user ID, or fallback to a known seed user ID for development
  const userId = session?.user?.id || 'seed-user-linyi';
  
  const { data: profile, isLoading: loading } = useWorker(userId);

  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc] overflow-hidden">
      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto space-y-8">
          {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <OverviewCard 
                  title="活跃工作者" 
                  value="12" 
                  icon={Users} 
                  change={{ value: '15%', isPositive: true }}
                  variant="primary"
                  footer="较上月增长"
                />
                <OverviewCard 
                  title="进行中服务" 
                  value="28" 
                  icon={Briefcase} 
                  change={{ value: '8%', isPositive: true }}
                  variant="success"
                  footer="当前待处理"
                />
                <OverviewCard 
                  title="平均评分" 
                  value="4.9" 
                  icon={Star} 
                  change={{ value: '0.2', isPositive: true }}
                  variant="warning"
                  footer="用户好评率"
                />
                <OverviewCard 
                  title="本月营收" 
                  value="¥45,200" 
                  icon={DollarSign} 
                  change={{ value: '12%', isPositive: true }}
                  variant="purple"
                  footer="结算金额"
                />
              </div>

              {/* Featured Workers Section */}
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">推荐工作者</h3>
                    <p className="text-sm text-gray-500 mt-0.5">基于技能匹配与评价筛选出的优秀人才</p>
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        type="text" 
                        placeholder="快速搜索..." 
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1dbf73] transition-all"
                      />
                    </div>
                    <Button 
                      variant="ghost" 
                      className="text-sm font-bold text-[#1dbf73] hover:text-[#19a463] hover:bg-transparent p-0 h-auto flex items-center gap-1"
                    >
                      查看全部 <ChevronRight size={14} />
                    </Button>
                  </div>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-gray-50/30">
                  {/* Demo cards */}
                  {loading ? (
                    Array(3).fill(0).map((_, i) => (
                      <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
                    ))
                  ) : (
                    // Use profile if available, otherwise show mock
                    profile ? (
                      <FreelancerCard worker={profile} />
                    ) : (
                      Array(3).fill(0).map((_, i) => (
                        <FreelancerCard 
                          key={i}
                          worker={{
                            id: `mock_${i}`,
                            userId: `user_${i}`,
                            title: i === 0 ? '高级全栈开发工程师' : i === 1 ? 'UI/UX 资深设计师' : '产品专家',
                            bio: '拥有 8 年互联网产品开发经验，精通 React, Node.js 和云原生架构。曾就职于顶级大厂，负责过千万级 DAU 产品的核心模块。',
                            rating: 4.8 + (i * 0.1),
                            reviewCount: 120 + (i * 15),
                            location: '北京',
                            languages: ['中文', '英语'],
                            skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'System Design'],
                            badges: ['Verified', 'Top Rated'],
                            hourlyRateAmount: 300 + (i * 50),
                            hourlyRateCurrency: '¥',
                            hourlyRateUnit: 'hr',
                            onlineStatus: i % 2 === 0,
                            isVerified: true,
                            verifiedDomains: ['github.com', 'linkedin.com'],
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            consultationEnabled: true
                          } as any} 
                        />
                      ))
                    )
                  )}
                </div>
              </section>
        </div>
      </div>
    </div>
  );
}
