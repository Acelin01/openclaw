import { Loader2Icon } from "lucide-react";
import { cn } from "../../lib/utils";

export const Loader = ({ className, size = 16 }: { className?: string; size?: number }) => {
  return (
    <Loader2Icon className={cn("animate-spin text-muted-foreground", className)} size={size} />
  );
};
