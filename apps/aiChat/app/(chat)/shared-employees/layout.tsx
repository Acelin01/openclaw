'use client';

import React from 'react';
import { SharedEmployeeSidebar } from '@/view/shared-employee/Sidebar';
import { SharedEmployeeHeader } from '@/view/shared-employee/Header';

export default function SharedEmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-zinc-50">
      {/* Sidebar - Fixed */}
      <SharedEmployeeSidebar />

      {/* Main Container - Flex column */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Header - Fixed height, no scroll */}
        <SharedEmployeeHeader />

        {/* Content Area - Scrollable */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
