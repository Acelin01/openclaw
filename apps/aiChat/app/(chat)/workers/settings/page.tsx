'use client';

import React from 'react';
import { Settings } from 'lucide-react';

export default function WorkerSettingsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-12 text-center">
        <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Settings className="w-8 h-8 text-zinc-400" />
        </div>
        <h3 className="text-lg font-bold text-zinc-900">服务设置</h3>
        <p className="text-zinc-500 mt-2 max-w-md mx-auto">
          在此配置您的服务偏好、通知设置及账户信息。该模块正在开发中。
        </p>
      </div>
    </div>
  );
}
