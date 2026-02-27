'use client';

import React from 'react';
import { Settings } from 'lucide-react';

export default function SharedEmployeeSettingsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
        <div className="p-6 border-b border-zinc-50">
          <h3 className="text-lg font-bold text-zinc-900">基础设置</h3>
          <p className="text-sm text-zinc-500 mt-1">管理员工共享模块的基础配置与规则</p>
        </div>
        <div className="p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-300 mb-4">
            <Settings size={32} />
          </div>
          <h4 className="text-base font-bold text-zinc-900">设置项开发中</h4>
          <p className="text-sm text-zinc-500 mt-1 max-w-xs">更多模块配置项即将上线，敬请期待</p>
        </div>
      </div>
    </div>
  );
}
