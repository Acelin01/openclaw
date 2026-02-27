"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { toast as sonnerToast } from "sonner";
import { cn } from "@/lib/utils";
import { CheckCircleFillIcon, WarningIcon } from "./icons";
import { Button } from "@uxin/ui";

const iconsByType: Record<"success" | "error", ReactNode> = {
  success: <CheckCircleFillIcon />,
  error: <WarningIcon />,
};

export function toast(props: Omit<ToastProps, "id">) {
  return sonnerToast.custom((id) => (
    <Toast 
      description={props.description} 
      id={id} 
      type={props.type} 
      action={props.action}
      onClick={props.onClick}
    />
  ));
}

function Toast(props: ToastProps) {
  const { id, type, description, action, onClick } = props;

  const descriptionRef = useRef<HTMLDivElement>(null);
  const [multiLine, setMultiLine] = useState(false);

  useEffect(() => {
    const el = descriptionRef.current;
    if (!el) {
      return;
    }

    const update = () => {
      const lineHeight = Number.parseFloat(getComputedStyle(el).lineHeight);
      const lines = Math.round(el.scrollHeight / lineHeight);
      setMultiLine(lines > 1);
    };

    update(); // initial check
    const ro = new ResizeObserver(update); // re-check on width changes
    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  return (
    <div className="flex toast-mobile:w-[356px] w-full justify-center">
      <div
        className={cn(
          "flex toast-mobile:w-fit w-full flex-row gap-3 rounded-lg bg-zinc-100 p-3 shadow-sm border border-zinc-200",
          multiLine ? "items-start" : "items-center",
          onClick ? "cursor-pointer hover:bg-zinc-50 transition-colors" : ""
        )}
        data-testid="toast"
        key={id}
        onClick={() => {
          if (onClick) {
            onClick();
            sonnerToast.dismiss(id);
          }
        }}
      >
        <div
          className={cn(
            "data-[type=error]:text-red-600 data-[type=success]:text-green-600",
            { "pt-1": multiLine }
          )}
          data-type={type}
        >
          {iconsByType[type]}
        </div>
        <div className="flex flex-col gap-2 w-full">
          <div className="text-sm text-zinc-950" ref={descriptionRef}>
            {description}
          </div>
          {action && (
            <Button
              variant="link"
              className="text-xs font-medium text-blue-600 hover:text-blue-700 w-fit h-auto p-0"
              onClick={(e) => {
                e.stopPropagation();
                action.onClick();
                sonnerToast.dismiss(id);
              }}
            >
              {action.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

type ToastProps = {
  id: string | number;
  type: "success" | "error";
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClick?: () => void;
};
