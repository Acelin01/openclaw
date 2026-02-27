"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Check, Circle } from "lucide-react";

interface Phase {
  id: number;
  label: string;
}

const PHASES: Phase[] = [
  { id: 1, label: "需求分析" },
  { id: 2, label: "方案设计" },
  { id: 3, label: "任务分解" },
  { id: 4, label: "执行监控" },
  { id: 5, label: "结果交付" },
];

export function PhaseIndicator() {
  const [currentPhase, setCurrentPhase] = useState("需求分析");

  useEffect(() => {
    const handleUpdate = (event: CustomEvent<{ phase: string }>) => {
      if (event.detail.phase) {
        setCurrentPhase(event.detail.phase);
      }
    };

    window.addEventListener("project-status-update" as any, handleUpdate);
    return () => {
      window.removeEventListener("project-status-update" as any, handleUpdate);
    };
  }, []);

  const currentPhaseIndex = PHASES.findIndex((p) => p.label === currentPhase);

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide">
      {PHASES.map((phase, index) => {
        const isActive = index === currentPhaseIndex;
        const isCompleted = index < currentPhaseIndex;

        return (
          <div
            key={phase.id}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
              isActive
                ? "bg-blue-600 text-white shadow-md scale-105"
                : isCompleted
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600"
            )}
          >
            <div
              className={cn(
                "w-4 h-4 rounded-full flex items-center justify-center text-[10px]",
                isActive
                  ? "bg-white text-blue-600"
                  : isCompleted
                  ? "bg-green-500 text-white"
                  : "bg-zinc-300 dark:bg-zinc-700 text-white"
              )}
            >
              {isCompleted ? (
                <Check size={10} strokeWidth={3} />
              ) : (
                phase.id
              )}
            </div>
            <span>{phase.label}</span>
            {index < PHASES.length - 1 && (
              <div
                className={cn(
                  "w-4 h-px ml-1",
                  isCompleted ? "bg-green-300" : "bg-zinc-200"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
