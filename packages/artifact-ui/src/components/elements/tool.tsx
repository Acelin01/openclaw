"use client";

import type { ToolUIPart } from "ai";
import { Badge, Collapsible, CollapsibleContent, CollapsibleTrigger } from "@uxin/ui";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  CircleIcon,
  ClockIcon,
  WrenchIcon,
  XCircleIcon,
} from "lucide-react";
import React, { type ComponentProps, type ReactNode, isValidElement } from "react";
import { cn } from "../../lib/utils";
import { CodeBlock } from "./code-block";

export type ToolProps = ComponentProps<typeof Collapsible>;

export const Tool = ({ className, ...props }: ToolProps) => (
  <Collapsible className={cn("not-prose mb-4 w-full rounded-md border", className)} {...props} />
);

export type ToolHeaderProps = {
  type: ToolUIPart["type"];
  state: ToolUIPart["state"];
  className?: string;
};

const getStatusBadge = (status: ToolUIPart["state"]) => {
  const labels = {
    "input-streaming": "准备中",
    "input-available": "执行中",
    "output-available": "已完成",
    "output-error": "错误",
  } as const;

  const icons = {
    "input-streaming": <CircleIcon className="size-4 text-zinc-400" />,
    "input-available": <ClockIcon className="size-4 text-blue-500 animate-pulse" />,
    "output-available": <CheckCircleIcon className="size-4 text-green-600" />,
    "output-error": <XCircleIcon className="size-4 text-red-600" />,
  } as const;

  return (
    <Badge className="flex items-center gap-1 rounded-full text-xs" variant="secondary">
      {icons[status]}
      <span>{labels[status]}</span>
    </Badge>
  );
};

export const ToolHeader = ({ className, type, state, ...props }: ToolHeaderProps) => (
  <CollapsibleTrigger
    className={cn("flex w-full min-w-0 items-center justify-between gap-2 p-3", className)}
    {...props}
  >
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <WrenchIcon className="size-4 shrink-0 text-muted-foreground" />
      <span className="truncate font-medium text-sm">
        {type === "tool-startCollaboration"
          ? "智能协同"
          : type === "tool-matchAgents"
            ? "专家匹配"
            : type === "tool-provideFeedback"
              ? "提供反馈"
              : type === "tool-createTasks"
                ? "创建任务"
                : type === "tool-updateTasks"
                  ? "更新任务"
                  : type === "tool-requestSuggestions"
                    ? "获取建议"
                    : type === "tool-updateProjectStatus"
                      ? "更新项目状态"
                      : type}
      </span>
    </div>
    <div className="flex shrink-0 items-center gap-2">
      {getStatusBadge(state)}
      <ChevronDownIcon className="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
    </div>
  </CollapsibleTrigger>
);

export type ToolContentProps = ComponentProps<typeof CollapsibleContent>;

export const ToolContent = ({ className, ...props }: ToolContentProps) => (
  <CollapsibleContent
    className={cn(
      "data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 text-popover-foreground outline-hidden data-[state=closed]:animate-out data-[state=open]:animate-in",
      className,
    )}
    {...props}
  />
);

export type ToolInputProps = ComponentProps<"div"> & {
  input: ToolUIPart["input"];
};

export const ToolInput = ({ className, input, ...props }: ToolInputProps) => (
  <div className={cn("space-y-2 overflow-hidden p-4", className)} {...props}>
    <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">输入参数</h4>
    <div className="rounded-md bg-muted/50">
      <CodeBlock code={JSON.stringify(input, null, 2)} language="json" />
    </div>
  </div>
);

export type ToolOutputProps = ComponentProps<"div"> & {
  output: ReactNode;
  errorText: ToolUIPart["errorText"];
};

export const ToolOutput = ({ className, output, errorText, ...props }: ToolOutputProps) => {
  if (!(output || errorText)) {
    return null;
  }

  return (
    <div className={cn("space-y-2 p-4", className)} {...props}>
      <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
        {errorText ? "错误信息" : "执行结果"}
      </h4>
      <div
        className={cn(
          "overflow-x-auto rounded-md text-xs [&_table]:w-full",
          errorText ? "bg-destructive/10 text-destructive" : "bg-muted/50 text-foreground",
        )}
      >
        {errorText && <div>{errorText}</div>}
        {output && (
          <div>
            {typeof output === "object" && !isValidElement(output) ? (
              <CodeBlock code={JSON.stringify(output, null, 2)} language="json" />
            ) : (
              output
            )}
          </div>
        )}
      </div>
    </div>
  );
};
