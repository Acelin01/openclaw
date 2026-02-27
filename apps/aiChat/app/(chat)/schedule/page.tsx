'use client';

import { ScheduleView } from "@/view/schedule/ScheduleView";

export default function SchedulePage() {
  return (
    <div className="p-4 lg:p-8">
      <div className="max-w-[1400px] mx-auto h-full">
        <ScheduleView className="h-full min-h-[800px] rounded-2xl shadow-sm border border-zinc-200" />
      </div>
    </div>
  );
}
