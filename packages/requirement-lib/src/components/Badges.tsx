import { clsx, type ClassValue } from "clsx";
import React from "react";
import { twMerge } from "tailwind-merge";
import { RequirementPriority, RequirementStatus } from "../types";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const PriorityBadge = ({
  priority,
  className,
}: {
  priority: RequirementPriority;
  className?: string;
}) => {
  const colors = {
    [RequirementPriority.LOW]: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    [RequirementPriority.MEDIUM]:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    [RequirementPriority.HIGH]:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    [RequirementPriority.CRITICAL]: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <span className={cn("px-2 py-0.5 rounded text-xs font-medium", colors[priority], className)}>
      {priority}
    </span>
  );
};

export const StatusBadge = ({
  status,
  className,
}: {
  status: RequirementStatus;
  className?: string;
}) => {
  const colors = {
    [RequirementStatus.DRAFT]: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
    [RequirementStatus.TODO]: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
    [RequirementStatus.IN_PROGRESS]:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    [RequirementStatus.REVIEW]:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    [RequirementStatus.DONE]:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    [RequirementStatus.CANCELLED]: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <span className={cn("px-2 py-0.5 rounded text-xs font-medium", colors[status], className)}>
      {status.replace("_", " ")}
    </span>
  );
};
