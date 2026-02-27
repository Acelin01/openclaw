import { clsx, type ClassValue } from "clsx";
import { LucideIcon } from "lucide-react";
import React from "react";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface OverviewCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: string | number;
    isPositive: boolean;
  };
  footer?: string;
  variant?: "primary" | "success" | "warning" | "purple";
  className?: string;
}

export const OverviewCard: React.FC<OverviewCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  footer,
  variant = "primary",
  className,
}) => {
  const variantStyles: Record<string, string> = {
    primary: "border-l-4 border-[#1dbf73]",
    success: "border-l-4 border-[#1dbf73]",
    warning: "border-l-4 border-[#ff9900]",
    purple: "border-l-4 border-[#8a2be2]",
  };

  const iconStyles: Record<string, string> = {
    primary: "bg-[#eef8f3] text-[#1dbf73]",
    success: "bg-[#eef8f3] text-[#1dbf73]",
    warning: "bg-[#fff4e6] text-[#ff9900]",
    purple: "bg-[#f2e6ff] text-[#8a2be2]",
  };

  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow-sm p-6 flex flex-col relative overflow-hidden border border-gray-100 transition-all hover:shadow-md",
        variantStyles[variant],
        className,
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm",
            iconStyles[variant],
          )}
        >
          <Icon size={24} />
        </div>
        {change && (
          <div
            className={cn(
              "text-xs font-bold px-2 py-1 rounded-full flex items-center",
              change.isPositive ? "bg-[#eef8f3] text-[#1dbf73]" : "bg-red-50 text-red-500",
            )}
          >
            {change.isPositive ? "↑" : "↓"} {change.value}
          </div>
        )}
      </div>

      <div>
        <p className="text-sm font-semibold text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-black text-gray-900 tracking-tight">{value}</p>
      </div>

      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          {footer}
        </div>
      )}
    </div>
  );
};
