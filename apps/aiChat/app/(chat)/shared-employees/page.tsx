'use client';

import React from 'react';
import SharedEmployeeOverview from '@/view/shared-employee/Overview';

export default function SharedEmployeesPage() {
  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
      <SharedEmployeeOverview />
    </div>
  );
}
