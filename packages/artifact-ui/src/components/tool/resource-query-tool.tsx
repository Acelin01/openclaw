"use client";

import { Badge } from "@uxin/ui";
import { CheckCircle2, ListTodo, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useArtifact } from "../../hooks/use-artifact";
import { cn } from "../../lib/utils";

interface ResourceQueryToolProps {
  part: any;
}

export function ResourceQueryTool({ part }: ResourceQueryToolProps) {
  const { toolCallId, state, output } = part;
  const { setArtifact } = useArtifact();
  const [isExpanded, setIsExpanded] = useState(true);

  if (state !== "output-available" || !output) return null;

  const items = output.data || [];
  const typeLabel = output.type === "projects" ? "项目" : output.type === "tasks" ? "任务" : "资源";
  const title = `已查询 ${typeLabel} (${items.length} / ${output.total || 0})`;

  const renderAssignee = (val: any) => {
    if (!val) return null;
    if (typeof val === "string") return val;
    if (typeof val === "object") {
      return val.name || val.title || val.label || JSON.stringify(val);
    }
    return String(val);
  };

  return (
    <div
      className="w-full bg-[#fcfdff] border border-zinc-100 rounded-xl shadow-sm my-2 overflow-hidden"
      key={toolCallId}
    >
      <div
        className="p-3 flex items-center justify-between cursor-pointer select-none border-b border-zinc-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-5 h-5 text-indigo-500 bg-indigo-50 rounded">
            <ListTodo className="size-3.5" />
          </div>
          <h4 className="font-semibold text-zinc-700 text-sm">{title}</h4>
        </div>
        <div className="text-zinc-300">
          {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
          {items.length > 0 ? (
            items.map((item: any, index: number) => {
              const isCompleted = item.status === "completed" || item.status === "已完成";
              const isInProgress =
                item.status === "in_progress" ||
                item.status === "进行中" ||
                item.status === "active";
              const hasRisk = item.risk || item.hasRisk;

              return (
                <div
                  key={`${toolCallId}-${item.id}-${index}`}
                  className={cn(
                    "flex flex-col gap-1 group",
                    output.type === "projects" && "cursor-pointer",
                  )}
                  onClick={() => {
                    if (output.type === "projects") {
                      setArtifact((current: any) => ({
                        ...current,
                        documentId: item.id,
                        title: item.name || item.title,
                        kind: "project",
                        isVisible: true,
                        status: "idle",
                        content: JSON.stringify(item),
                      }));
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="shrink-0">
                      {isCompleted ? (
                        <div className="size-5 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100">
                          <CheckCircle2 className="size-3.5" />
                        </div>
                      ) : (
                        <div className="size-5 rounded-full border-2 border-zinc-100" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                      <span
                        className={cn(
                          "text-sm font-medium transition-all truncate max-w-[200px]",
                          isCompleted ? "text-zinc-400 line-through" : "text-zinc-600",
                        )}
                      >
                        {item.name || item.title || item.content}
                      </span>

                      {isInProgress && (
                        <Badge
                          variant="secondary"
                          className="bg-blue-50 text-blue-500 border-none hover:bg-blue-50 text-[10px] px-1.5 py-0 h-4 shrink-0"
                        >
                          进行中
                        </Badge>
                      )}

                      {hasRisk && (
                        <Badge
                          variant="destructive"
                          className="bg-red-50 text-red-500 border-none hover:bg-red-50 text-[10px] px-1.5 py-0 h-4 flex items-center gap-0.5 shrink-0"
                        >
                          <AlertCircle className="size-2.5" />
                          风险
                        </Badge>
                      )}

                      {/* 分配对象紧跟名称 */}
                      {(item.assignee || item.agent || item.freelancer || item.employee) && (
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[10px] text-zinc-400">@</span>
                          <span className="text-[10px] font-medium text-zinc-500">
                            {renderAssignee(
                              item.assignee || item.agent || item.freelancer || item.employee,
                            )}
                          </span>
                        </div>
                      )}

                      {/* 优先级紧跟 (仅显示中和高) */}
                      {item.priority &&
                        (item.priority === "high" || item.priority === "medium") && (
                          <div className="shrink-0">
                            {item.priority === "high" ? (
                              <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">
                                高
                              </Badge>
                            ) : (
                              <Badge
                                variant="secondary"
                                className="bg-orange-100 text-orange-700 hover:bg-orange-100 text-[10px] px-1.5 py-0 h-4 border-none"
                              >
                                中
                              </Badge>
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-xs italic text-muted-foreground py-2 text-center">
              未找到相关数据
            </div>
          )}
        </div>
      )}
    </div>
  );
}
