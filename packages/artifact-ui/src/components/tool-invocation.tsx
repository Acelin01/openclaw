"use client";

import { Button } from "@uxin/ui";
import { Bot, Check, ChevronDown, ChevronRight, Loader2, Wrench } from "lucide-react";
import { memo, useMemo, useState } from "react";
// @ts-ignore
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";

interface ToolInvocationProps {
  toolCallId: string;
  toolName: string;
  args: any;
  state: "call" | "result";
  result?: any;
  isReadonly?: boolean;
}

function PureToolInvocation({
  toolCallId,
  toolName,
  args,
  state,
  result,
  isReadonly,
}: ToolInvocationProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const displayInfo = useMemo(() => {
    // Default display info
    let label = toolName;
    let icon = Wrench;
    let description = "";

    // Helper to get tool label and description from i18n
    // Use the tool name as key suffix, fallback to hardcoded if not found (or rely on default in switch)

    const key = toolName.replace("tool-", "");

    // Check if we have specific handling
    if (
      [
        "getWeather",
        "createDocument",
        "updateDocument",
        "createTasks",
        "updateTasks",
        "searchResources",
        "talent_match",
        "skill_analyzer",
        "matchAgents",
        "startCollaboration",
      ].includes(key)
    ) {
      label = t(`tools.${key}.label`, label);
      description = t(`tools.${key}.description`, {
        location: args.location || "Unknown",
        title: args.title || args.id || "Untitled",
        count: args.tasks?.length || 0,
        query: args.query || "",
        skills: args.skills?.join(", ") || "",
        requirement: args.requirement?.slice(0, 20) || "",
        toolName: toolName,
      });
    } else {
      if (toolName.startsWith("tool-")) {
        label = toolName.replace("tool-", "");
      }
      description = t("tools.unknown.description", { toolName: label });
    }

    return { label, icon, description };
  }, [toolName, args, t]);

  const hasResult = state === "result";
  const isPending = !hasResult;

  return (
    <div className="flex flex-col gap-1 my-2 w-full max-w-md">
      <div
        className={cn(
          "flex items-center gap-2 p-2 rounded-lg border text-sm transition-colors",
          isPending
            ? "bg-muted/50 border-muted-foreground/20"
            : "bg-background border-border hover:bg-muted/30 cursor-pointer",
        )}
        onClick={() => hasResult && setIsExpanded(!isExpanded)}
      >
        <div
          className={cn(
            "flex items-center justify-center w-6 h-6 rounded-full shrink-0",
            isPending ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary",
          )}
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <displayInfo.icon className="w-3.5 h-3.5" />
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{displayInfo.label}</span>
            <span className="text-xs text-muted-foreground truncate opacity-70">
              {displayInfo.description}
            </span>
          </div>
        </div>

        {hasResult && (
          <div className="text-muted-foreground">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </div>
        )}
      </div>

      {isExpanded && hasResult && (
        <div className="ml-2 pl-4 border-l-2 border-muted py-1 animate-in slide-in-from-top-1 duration-200">
          <div className="bg-muted/30 rounded-md p-3 text-xs font-mono overflow-x-auto">
            <div className="mb-2 text-muted-foreground font-semibold">
              {t("tools.status.input", "Input Arguments")}:
            </div>
            <pre className="whitespace-pre-wrap break-all mb-4 text-muted-foreground">
              {JSON.stringify(args, null, 2)}
            </pre>

            <div className="mb-2 text-muted-foreground font-semibold">
              {t("tools.status.result", "Execution Result")}:
            </div>
            <pre className="whitespace-pre-wrap break-all text-foreground">
              {typeof result === "string" ? result : JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export const ToolInvocation = memo(PureToolInvocation);
