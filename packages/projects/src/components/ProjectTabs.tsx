"use client";

import { Button } from "@uxin/ui";
import React from "react";
import { TabItem } from "../types";
import { cn } from "./shared-ui";

interface ProjectTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}

export const ProjectTabs: React.FC<ProjectTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
}) => {
  return (
    <div
      className={cn(
        "bg-white border-b border-[#e0e0e0] flex overflow-x-auto scrollbar-hide sticky top-0 z-10",
        className,
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <Button
            key={tab.id}
            variant="ghost"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200 rounded-none h-auto border-none",
              isActive
                ? "text-[#1dbf73] border-b-2 border-b-[#1dbf73] bg-[#f9f9f9]"
                : "text-[#666] border-b-2 border-transparent hover:text-[#333] hover:bg-[#fafafa]",
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  "ml-2 text-[11px] px-1.5 py-0.5 rounded-full",
                  isActive ? "bg-[#1dbf73] text-white" : "bg-[#e0e0e0] text-[#666]",
                )}
              >
                {tab.count}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
};
