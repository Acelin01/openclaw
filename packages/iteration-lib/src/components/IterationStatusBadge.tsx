"use client";

import React from "react";
import { IterationStatus } from "../types";
import { cn } from "./shared-ui";

interface IterationStatusBadgeProps {
  status: IterationStatus | string;
  className?: string;
}

export const IterationStatusBadge: React.FC<IterationStatusBadgeProps> = ({
  status,
  className,
}) => {
  const getStatusStyles = (s: string) => {
    switch (s) {
      case IterationStatus.PLANNING:
        return "bg-blue-50 text-blue-700 border-blue-200";
      case IterationStatus.IN_PROGRESS:
        return "bg-green-50 text-green-700 border-green-200";
      case IterationStatus.COMPLETED:
        return "bg-gray-50 text-gray-700 border-gray-200";
      case IterationStatus.ARCHIVED:
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const getStatusText = (s: string) => {
    switch (s) {
      case IterationStatus.PLANNING:
        return "规划中";
      case IterationStatus.IN_PROGRESS:
        return "进行中";
      case IterationStatus.COMPLETED:
        return "已完成";
      case IterationStatus.ARCHIVED:
        return "已归档";
      default:
        return s;
    }
  };

  return (
    <span
      className={cn(
        "px-2 py-0.5 rounded-full text-[10px] font-medium border",
        getStatusStyles(status as string),
        className,
      )}
    >
      {getStatusText(status as string)}
    </span>
  );
};
