'use client';

import React from 'react';
import WorkerOverview from '@/view/worker/WorkerOverview';

export default function WorkersPage() {
  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
      <WorkerOverview />
    </div>
  );
}
