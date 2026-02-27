'use client';

import React from 'react';
import { Users, Building, ChevronRight, Search, LayoutGrid, Bot, UserCheck, Star } from 'lucide-react';

interface GroupNavProps {
  departments: any[];
  activeGroup?: string;
  onGroupChange?: (groupId: string) => void;
  counts?: {
    all: number;
    external: number;
    myAgents: number;
    collaboratedFreelancers: number;
    favoriteFreelancers: number;
    departments: Record<string, number>;
  };
}

const GroupNav: React.FC<GroupNavProps> = ({ 
  departments, 
  activeGroup = 'all', 
  onGroupChange,
  counts = {
    all: 0,
    external: 0,
    myAgents: 0,
    collaboratedFreelancers: 0,
    favoriteFreelancers: 0,
    departments: {}
  }
}) => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden shrink-0">
      {/* 顶部固定区域 */}
      <div className="flex-none z-10">
        <div className="p-5 border-b border-gray-200 text-lg font-semibold text-gray-900 bg-gray-50">
          通讯录
        </div>
        
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="relative">
            <input 
              type="text" 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-green-500 transition-colors"
              placeholder="搜索部门..."
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>
      
      {/* 滚动列表区域 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
        {/* 全部联系人 */}
        <div 
          onClick={() => onGroupChange?.('all')}
          className={`px-5 py-3 flex items-center cursor-pointer transition-colors border-l-4 ${
            activeGroup === 'all' ? 'bg-green-50 border-green-500 text-green-600 font-semibold' : 'border-transparent hover:bg-gray-50'
          }`}
        >
          <LayoutGrid className={`w-5 h-5 mr-3 ${activeGroup === 'all' ? 'text-green-500' : 'text-gray-400'}`} />
          <span className="flex-1 text-sm">全部联系人</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{counts.all}</span>
        </div>

        {/* 外部联系人分组 */}
        <div 
          onClick={() => onGroupChange?.('external')}
          className={`px-5 py-3 flex items-center cursor-pointer transition-colors border-l-4 ${
            activeGroup === 'external' ? 'bg-green-50 border-green-500 text-green-600 font-semibold' : 'border-transparent hover:bg-gray-50'
          }`}
        >
          <Users className={`w-5 h-5 mr-3 ${activeGroup === 'external' ? 'text-green-500' : 'text-gray-400'}`} />
          <span className="flex-1 text-sm">外部联系人</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{counts.external}</span>
        </div>

        {/* 智能体分组 */}
        <div className="px-5 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-4 mb-1">
          智能体
        </div>

        {/* 我的智能体 */}
        <div 
          onClick={() => onGroupChange?.('my-agents')}
          className={`px-5 py-3 flex items-center cursor-pointer transition-colors border-l-4 ${
            activeGroup === 'my-agents' ? 'bg-green-50 border-green-500 text-green-600 font-semibold' : 'border-transparent hover:bg-gray-50'
          }`}
        >
          <Bot className={`w-5 h-5 mr-3 ${activeGroup === 'my-agents' ? 'text-green-500' : 'text-gray-400'}`} />
          <span className="flex-1 text-sm">我的智能体</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{counts.myAgents}</span>
        </div>

        {/* 自由工作者分组 */}
        <div className="px-5 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-4 mb-1">
          自由工作者
        </div>

        {/* 合作过的自由工作者 */}
        <div 
          onClick={() => onGroupChange?.('collaborated-freelancers')}
          className={`px-5 py-3 flex items-center cursor-pointer transition-colors border-l-4 ${
            activeGroup === 'collaborated-freelancers' ? 'bg-green-50 border-green-500 text-green-600 font-semibold' : 'border-transparent hover:bg-gray-50'
          }`}
        >
          <UserCheck className={`w-5 h-5 mr-3 ${activeGroup === 'collaborated-freelancers' ? 'text-green-500' : 'text-gray-400'}`} />
          <span className="flex-1 text-sm">合作过的</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{counts.collaboratedFreelancers}</span>
        </div>

        {/* 我收藏的自由工作者 */}
        <div 
          onClick={() => onGroupChange?.('favorite-freelancers')}
          className={`px-5 py-3 flex items-center cursor-pointer transition-colors border-l-4 ${
            activeGroup === 'favorite-freelancers' ? 'bg-green-50 border-green-500 text-green-600 font-semibold' : 'border-transparent hover:bg-gray-50'
          }`}
        >
          <Star className={`w-5 h-5 mr-3 ${activeGroup === 'favorite-freelancers' ? 'text-green-500' : 'text-gray-400'}`} />
          <span className="flex-1 text-sm">我收藏的</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{counts.favoriteFreelancers}</span>
        </div>

        <div className="px-5 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-4 mb-1">
          部门分组
        </div>
        
        {departments.map((dept) => (
          <div 
            key={dept.id}
            onClick={() => onGroupChange?.(dept.id)}
            className={`px-5 py-3 flex items-center cursor-pointer transition-colors border-l-4 ${
              activeGroup === dept.id ? 'bg-green-50 border-green-500 text-green-600 font-semibold' : 'border-transparent hover:bg-gray-50'
            }`}
          >
            <Building className={`w-5 h-5 mr-3 ${activeGroup === dept.id ? 'text-green-500' : 'text-gray-400'}`} />
            <span className="flex-1 text-sm truncate">{dept.name}</span>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full mr-2">
              {counts.departments[dept.id] || 0}
            </span>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupNav;
