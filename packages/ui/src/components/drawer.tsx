import * as React from "react";
import { cn } from "../lib/utils";
import { Button } from "./button";

export interface DrawerAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "outline" | "destructive" | "secondary" | "ghost" | "link";
  loading?: boolean;
}

export interface RightDrawerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  heading?: React.ReactNode;
  actions?: DrawerAction[];
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  onWidthChange?: (width: number) => void;
}

export const RightDrawer = React.forwardRef<HTMLDivElement, RightDrawerProps>(
  (
    {
      className = "",
      open = false,
      onOpenChange,
      heading,
      actions = [],
      children,
      width,
      minWidth = 360,
      maxWidth = 960,
      onWidthChange,
      ...props
    },
    ref,
  ) => {
    const [w, setW] = React.useState<number>(typeof width === "number" ? width : 520);
    const [dragging, setDragging] = React.useState(false);
    const startX = React.useRef<number | null>(null);
    const startW = React.useRef<number>(w);

    React.useEffect(() => {
      if (typeof width === "number" && width !== w) setW(width);
    }, [width]);

    React.useEffect(() => {
      const onMove = (e: MouseEvent) => {
        if (!dragging || startX.current === null) return;
        const dx = startX.current - e.clientX;
        const next = Math.min(Math.max(startW.current + dx, minWidth), maxWidth);
        setW(next);
        onWidthChange && onWidthChange(next);
      };
      const onUp = () => {
        setDragging(false);
        startX.current = null;
      };
      if (dragging) {
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp, { once: true });
      }
      return () => {
        window.removeEventListener("mousemove", onMove);
      };
    }, [dragging, minWidth, maxWidth, onWidthChange]);

    React.useEffect(() => {
      if (open) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
      return () => {
        document.body.style.overflow = "";
      };
    }, [open]);

    const onResizeStart = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(true);
      startX.current = e.clientX;
      startW.current = w;
    };

    return (
      <div ref={ref} className={cn("relative z-50", className)} {...props}>
        {open && (
          <div
            data-overlay="drawer"
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => onOpenChange && onOpenChange(false)}
          />
        )}
        <div
          data-content="drawer"
          className={cn(
            "fixed right-0 top-0 z-50 h-full bg-white shadow-xl border-l flex flex-col",
            "transition-transform duration-200",
            open ? "translate-x-0" : "translate-x-full",
          )}
          style={{ width: `${w}px` }}
        >
          <div
            role="separator"
            aria-orientation="vertical"
            className="absolute left-0 top-0 h-full w-1 cursor-ew-resize bg-transparent z-10"
            onMouseDown={onResizeStart}
          />
          <div className="flex-none flex items-center justify-between border-b px-4 py-3">
            <div className="text-lg font-semibold truncate">{heading}</div>
            <button
              aria-label="Close"
              className="h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-gray-100"
              onClick={() => onOpenChange && onOpenChange(false)}
            >
              <span className="text-xl leading-none">×</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
          {actions.length > 0 && (
            <div className="flex-none border-t px-4 py-3 flex justify-end gap-2 bg-white">
              {actions.map((a, i) => (
                <Button
                  key={i}
                  variant={a.variant || "default"}
                  loading={a.loading}
                  onClick={a.onClick}
                >
                  {a.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  },
);

RightDrawer.displayName = "RightDrawer";
