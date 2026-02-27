"use client";

import { Button } from "@uxin/ui";
import { Settings, Share2, ArrowLeft } from "lucide-react";
import React from "react";
import { Project } from "../types";
import { cn } from "./shared-ui";

interface ProjectHeaderProps {
  project: Project;
  onAction?: (action: string) => void;
  onBack?: () => void;
  className?: string;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  onAction,
  onBack,
  className,
}) => {
  return (
    <div
      className={cn(
        "px-8 py-6 bg-white border-b border-zinc-200 flex justify-between items-center",
        className,
      )}
    >
      <div className="flex items-center">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="mr-4 p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-500 border-none h-9 w-9"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">{project.name}</h1>
            <div className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100">
              进行中
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onAction?.("share")}
          className="p-3 bg-white rounded-xl text-zinc-600 hover:bg-zinc-50 transition-all shadow-none border-none h-11 w-11"
          title="分享项目"
        >
          <Share2 className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onAction?.("settings")}
          className="p-3 bg-white rounded-xl text-zinc-600 hover:bg-zinc-50 transition-all shadow-none border-none h-11 w-11"
          title="项目设置"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};
