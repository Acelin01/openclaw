"use client";

import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Phase {
  id: string;
  name: string;
  status: "completed" | "active" | "pending";
}

const INITIAL_PHASES: Phase[] = [
  { id: "1", name: "需求分析", status: "completed" },
  { id: "2", name: "方案设计", status: "active" },
  { id: "3", name: "任务分解", status: "pending" },
  { id: "4", name: "执行监控", status: "pending" },
  { id: "5", name: "结果交付", status: "pending" },
];

export function PhaseIndicator() {
  const [phases, setPhases] = useState<Phase[]>(INITIAL_PHASES);

  useEffect(() => {
    const handleStatusUpdate = (event: any) => {
      const { phase: activePhaseName } = event.detail;
      if (!activePhaseName) return;

      setPhases((prevPhases) => {
        let foundActive = false;
        return prevPhases.map((phase) => {
          if (phase.name === activePhaseName) {
            foundActive = true;
            return { ...phase, status: "active" as const };
          }
          // 如果已经找到了 active 阶段，之后的都是 pending
          if (foundActive) {
            return { ...phase, status: "pending" as const };
          }
          // 如果还没找到 active 阶段，之前的都是 completed
          return { ...phase, status: "completed" as const };
        });
      });
    };

    window.addEventListener("project-status-update", handleStatusUpdate);
    return () => window.removeEventListener("project-status-update", handleStatusUpdate);
  }, []);

  return (
    <div className="flex items-center w-full overflow-x-auto scrollbar-hide">
      <div className="flex items-center min-w-max px-4">
        {phases.map((phase, index) => (
          <div
            key={phase.id}
            className="flex items-center group relative"
          >
            {/* Connector Line */}
            {index !== phases.length - 1 && (
              <div
                className={cn(
                  "absolute left-5 right-0 top-1/2 -translate-y-1/2 h-[1px] w-[calc(100%-20px)] -z-0",
                  phase.status === "completed"
                    ? "bg-[#4caf83]"
                    : "bg-slate-100 dark:bg-zinc-800"
                )}
              />
            )}

            <div className="flex items-center gap-2.5 relative z-10 pr-10">
              <div
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all shrink-0 border-2",
                  phase.status === "completed"
                    ? "bg-[#4caf83] border-[#4caf83] text-white"
                    : phase.status === "active"
                    ? "bg-white dark:bg-zinc-900 border-[#4caf83] text-[#4caf83] shadow-[0_0_12px_rgba(76,175,131,0.3)] scale-110"
                    : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-600"
                )}
              >
                {phase.status === "completed" ? (
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={cn(
                  "text-[11px] font-bold transition-all whitespace-nowrap tracking-tight",
                  phase.status === "active"
                    ? "text-[#4caf83] dark:text-[#4caf83]"
                    : phase.status === "completed"
                    ? "text-slate-600 dark:text-zinc-300"
                    : "text-slate-400 dark:text-zinc-500"
                )}
              >
                {phase.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
