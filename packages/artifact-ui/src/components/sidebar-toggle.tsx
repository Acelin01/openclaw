"use client";

import type { ComponentProps } from "react";
import { useSidebar, Tooltip, TooltipContent, TooltipTrigger, Button } from "@uxin/ui";
import { cn } from "../lib/utils";
import { SidebarLeftIcon } from "./icons";

export function SidebarToggle({ className }: { className?: string }) {
  const { toggleSidebar } = useSidebar();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className={cn("h-8 px-2 md:h-fit md:px-2", className)}
          data-testid="sidebar-toggle-button"
          onClick={toggleSidebar}
          variant="ghost"
        >
          <SidebarLeftIcon size={16} />
        </Button>
      </TooltipTrigger>
      <TooltipContent align="start" className="hidden md:block">
        切换侧边栏
      </TooltipContent>
    </Tooltip>
  );
}
