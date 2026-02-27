'use client';

import React, { useEffect, useState } from 'react';
import { RecruitmentHeader } from '@/view/recruitment/Header';
import { RecruitmentSidebar } from '@/view/recruitment/Sidebar';
import { RecruitmentIntroduction } from '@/view/recruitment/Introduction';
import { RecruitmentIntroHeader } from '@/view/recruitment/IntroHeader';
import { Sidebar as WorkbenchSidebar } from '@/view/workbench/Sidebar';
import { useSession } from "next-auth/react";

export default function RecruitmentLayout({ children }: { children: React.ReactNode }) {
  const [hasTrial, setHasTrial] = useState<boolean | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Check trial status from localStorage
    const trialData = localStorage.getItem('uxin_recruitment_trial');
    if (trialData) {
      try {
        const { endDate } = JSON.parse(trialData);
        if (new Date(endDate) > new Date()) {
          setHasTrial(true);
          return;
        }
      } catch (e) {
        console.error('Failed to parse trial data', e);
      }
    }
    setHasTrial(false);
  }, []);

  const handleStartTrial = () => {
    // Set 30 days trial
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    localStorage.setItem('uxin_recruitment_trial', JSON.stringify({
      startDate: new Date().toISOString(),
      endDate: endDate.toISOString(),
      type: 'FREE_TRIAL'
    }));
    setHasTrial(true);
  };

  // While checking status, show nothing or a loader
  if (hasTrial === null) {
    return <div className="h-screen w-full bg-[#f8fafc] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#1dbf73] border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  // If no trial, show introduction within workbench layout
  if (!hasTrial) {
    return (
      <div className="flex h-screen w-full bg-zinc-50/50 overflow-hidden">
        {/* Reuse Workbench Sidebar */}
        <WorkbenchSidebar activeTab="recruitment" />

        {/* Custom Introduction Header and Content */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Specific Intro Header matching the requested style */}
          <RecruitmentIntroHeader onStartTrial={handleStartTrial} />

          {/* Scrollable Content Area for Introduction */}
          <main className="flex-1 overflow-y-auto">
            <RecruitmentIntroduction onStartTrial={handleStartTrial} isNested={true} />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-zinc-50">
      {/* Sidebar - Fixed */}
      <RecruitmentSidebar />

      {/* Main Container - Flex column */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Header - Fixed height, no scroll */}
        <RecruitmentHeader />

        {/* Content Area - Scrollable */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
