import { clsx, type ClassValue } from "clsx";
import React from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Badge Component
export interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "error" | "info" | "secondary" | "dark" | "default";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = "default", className }) => {
  const variants = {
    success: "bg-[#eef8f3] text-[#1dbf73]",
    warning: "bg-[#fff4e6] text-[#ff9900]",
    error: "bg-[#fee] text-[#e74c3c]",
    info: "bg-[#eef3ff] text-[#4a6bff]",
    secondary: "bg-[#f0f0f0] text-[#666]",
    dark: "bg-[#333] text-white",
    default: "bg-[#f0f0f0] text-[#666]",
  };

  const variantClass = variants[variant as keyof typeof variants] || variants.default;

  return (
    <span
      className={cn(
        "text-xs px-2.5 py-1 rounded-full font-medium inline-flex items-center justify-center",
        variantClass,
        className,
      )}
    >
      {children}
    </span>
  );
};

// Card Component
export interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  headerAction?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className, title, headerAction }) => {
  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow-sm border border-[#f0f0f0] overflow-hidden",
        className,
      )}
    >
      {(title || headerAction) && (
        <div className="px-5 py-4 border-b border-[#f0f0f0] flex justify-between items-center">
          {title && <h3 className="text-base font-semibold text-[#222]">{title}</h3>}
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
};

// Button Component
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  loading,
  className,
  disabled,
  ...props
}) => {
  const variants = {
    primary: "bg-[#1dbf73] text-white hover:bg-[#19a463] border-transparent",
    secondary: "bg-[#eef8f3] text-[#1dbf73] hover:bg-[#d4f1e3] border-transparent",
    outline: "bg-transparent border border-[#e0e0e0] text-[#333] hover:bg-[#f9f9f9]",
    ghost: "bg-transparent text-[#666] hover:bg-[#f9f9f9] border-transparent",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const variantClass = variants[variant as keyof typeof variants] || variants.primary;
  const sizeClass = sizes[size as keyof typeof sizes] || sizes.md;

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 border disabled:opacity-50 disabled:cursor-not-allowed",
        variantClass,
        sizeClass,
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="mr-2 animate-spin">◌</span>}
      {children}
    </button>
  );
};
