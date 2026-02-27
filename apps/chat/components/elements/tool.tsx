"use client";

import type { ToolUIPart } from "ai";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  CircleIcon,
  ClockIcon,
  WrenchIcon,
  XCircleIcon,
} from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import {
  Badge,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@uxin/ui";
import { cn } from "@/lib/utils";
import { CodeBlock } from "./code-block";

export type ToolProps = ComponentProps<typeof Collapsible>;

export const Tool = ({ className, ...props }: ToolProps) => (
  <Collapsible
    className={cn("not-prose mb-4 w-full rounded-xl border border-black/5 bg-slate-50/50 shadow-sm overflow-hidden", className)}
    {...props}
  />
);

export type ToolHeaderProps = {
  type: ToolUIPart["type"];
  state: ToolUIPart["state"];
  className?: string;
};

const getStatusBadge = (status: ToolUIPart["state"]) => {
  const labels = {
    "input-streaming": "准备中",
    "input-available": "运行中",
    "output-available": "已完成",
    "output-error": "错误",
  } as const;

  const icons = {
    "input-streaming": <div className="size-2 rounded-full bg-slate-300" />,
    "input-available": <div className="size-2 rounded-full bg-blue-500 animate-pulse" />,
    "output-available": <CheckCircleIcon className="size-3.5 text-emerald-600" />,
    "output-error": <XCircleIcon className="size-3.5 text-rose-600" />,
  } as const;

  const bgColors = {
    "input-streaming": "bg-slate-100 text-slate-600",
    "input-available": "bg-blue-50 text-blue-600",
    "output-available": "bg-emerald-50 text-emerald-600",
    "output-error": "bg-rose-50 text-rose-600",
  } as const;

  return (
    <Badge
      className={cn("flex items-center gap-1.5 rounded-full text-[10px] font-bold px-2 py-0.5 border-none shadow-none", bgColors[status])}
      variant="secondary"
    >
      {icons[status]}
      <span>{labels[status]}</span>
    </Badge>
  );
};

export const ToolHeader = ({
  className,
  type,
  state,
  ...props
}: ToolHeaderProps) => {
  const toolNameMap: Record<string, string> = {
    "tool-getWeather": "获取天气信息",
    "tool-createDocument": "创建文档",
    "tool-updateDocument": "更新文档",
    "tool-requestSuggestions": "获取修改建议",
    "tool-provideFeedback": "提交反馈",
    "tool-updateProjectStatus": "更新项目状态",
    "tool-createTasks": "分解任务",
    "tool-updateTasks": "更新任务",
  };

  return (
    <CollapsibleTrigger
      className={cn(
        "flex w-full min-w-0 items-center justify-between gap-2 p-3 bg-white hover:bg-slate-50 transition-colors",
        className
      )}
      {...props}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500">
          <WrenchIcon className="size-3.5 shrink-0" />
        </div>
        <span className="truncate font-bold text-xs text-slate-700 uppercase tracking-tight">
          {toolNameMap[type] || type}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {getStatusBadge(state)}
        <ChevronDownIcon className="size-3.5 text-slate-400 transition-transform group-data-[state=open]:rotate-180" />
      </div>
    </CollapsibleTrigger>
  );
};

export type ToolContentProps = ComponentProps<typeof CollapsibleContent>;

export const ToolContent = ({ className, ...props }: ToolContentProps) => (
  <CollapsibleContent
    className={cn(
      "data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 text-popover-foreground outline-hidden data-[state=closed]:animate-out data-[state=open]:animate-in",
      className
    )}
    {...props}
  />
);

export type ToolInputProps = ComponentProps<"div"> & {
  input: ToolUIPart["input"];
};

export const ToolInput = ({ className, input, ...props }: ToolInputProps) => (
  <div className={cn("space-y-2 overflow-hidden p-4", className)} {...props}>
    <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
      Parameters
    </h4>
    <div className="rounded-md bg-muted/50">
      <CodeBlock code={JSON.stringify(input, null, 2)} language="json" />
    </div>
  </div>
);

export type ToolOutputProps = ComponentProps<"div"> & {
  output: ReactNode;
  errorText: ToolUIPart["errorText"];
};

export const ToolOutput = ({
  className,
  output,
  errorText,
  ...props
}: ToolOutputProps) => {
  if (!(output || errorText)) {
    return null;
  }

  return (
    <div className={cn("space-y-2 p-4", className)} {...props}>
      <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
        {errorText ? "Error" : "Result"}
      </h4>
      <div
        className={cn(
          "overflow-x-auto rounded-md text-xs [&_table]:w-full",
          errorText
            ? "bg-destructive/10 text-destructive"
            : "bg-muted/50 text-foreground"
        )}
      >
        {errorText && <div>{errorText}</div>}
        {output && <div>{output}</div>}
      </div>
    </div>
  );
};
