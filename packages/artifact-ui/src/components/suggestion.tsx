"use client";

import type { ComponentProps } from "react";
import { Button } from "@uxin/ui";
import { cn } from "../lib/utils";

export type SuggestionProps = {
  suggestion: string;
  onClick?: (suggestion: string) => void;
} & Omit<ComponentProps<typeof Button>, "onClick">;

export const Suggestion = ({
  suggestion,
  onClick,
  className,
  variant = "outline",
  size = "sm",
  children,
  ...props
}: SuggestionProps) => {
  const handleClick = () => {
    onClick?.(suggestion);
  };
  return (
    <Button
      className={cn("cursor-pointer rounded-full px-4", className)}
      onClick={handleClick}
      size={size}
      type="button"
      variant={variant}
      {...props}
    >
      {children || suggestion}
    </Button>
  );
};
