'use client';

import React from 'react';
import { WorkerSidebar } from '@/view/worker/Sidebar';
import { WorkerHeader } from '@/view/worker/Header';

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-zinc-50">
      {/* Sidebar - Fixed */}
      <WorkerSidebar />

      {/* Main Container - Flex column */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Header - Fixed height, no scroll */}
        <WorkerHeader />

        {/* Content Area - Scrollable */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
