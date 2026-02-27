import { clsx, type ClassValue } from "clsx";
import React from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | "planning"
    | "in-progress"
    | "review"
    | "completed"
    | "high"
    | "medium"
    | "low"
    | "default";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = "default", className }) => {
  const variants = {
    planning: "bg-[#eef8f3] text-[#1dbf73]",
    "in-progress": "bg-[#eef3ff] text-[#4a6bff]",
    review: "bg-[#fff4e6] text-[#ff9900]",
    completed: "bg-[#f0f0f0] text-[#666]",
    high: "bg-[#fee] text-[#e74c3c]",
    medium: "bg-[#fff4e6] text-[#ff9900]",
    low: "bg-[#eef8f3] text-[#1dbf73]",
    default: "bg-[#f0f0f0] text-[#666]",
  };

  return (
    <span
      className={cn(
        "text-xs px-2.5 py-1 rounded-full font-medium inline-flex items-center justify-center",
        variants[variant as keyof typeof variants] || variants.default,
        className,
      )}
    >
      {children}
    </span>
  );
};

export interface ProgressBarProps {
  value: number;
  label?: string;
  showValue?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  showValue = true,
  className,
}) => {
  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm text-[#666]">{label}</span>}
          {showValue && <span className="text-sm font-semibold text-[#222]">{value}%</span>}
        </div>
      )}
      <div className="h-2 bg-[#f0f0f0] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#1dbf73] rounded-full transition-all duration-300"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};
