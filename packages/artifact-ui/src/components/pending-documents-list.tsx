"use client";

import { Button } from "@uxin/ui";
import { FileText, ChevronDown, ChevronUp, Check, X, ChevronRight, ListTodo } from "lucide-react";
import { useState } from "react";
import type { ArtifactDocument } from "../lib/types";
import { cn } from "../lib/utils";

interface PendingDocumentsListProps {
  documents: ArtifactDocument[];
  tasks?: any[];
  onApproveAll: () => void;
  onRejectAll: () => void;
  onSelectDocument: (doc: ArtifactDocument) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const PendingDocumentsList = ({
  documents,
  tasks = [],
  onApproveAll,
  onRejectAll,
  onSelectDocument,
  isExpanded,
  onToggleExpand,
}: PendingDocumentsListProps) => {
  const [view, setView] = useState<"documents" | "tasks">(
    tasks.length > 0 && documents.length === 0 ? "tasks" : "documents",
  );

  if (documents.length === 0 && tasks.length === 0) return null;

  const currentItems = view === "documents" ? documents : tasks;
  const itemCount = currentItems.length;

  return (
    <div className="flex flex-col bg-background border border-border/50 rounded-xl overflow-hidden shadow-lg mb-2 mx-1">
      {isExpanded && itemCount > 0 && (
        <div className="max-h-48 overflow-y-auto">
          {currentItems.map((item: any) => (
            <div
              key={item.id}
              className="flex items-center justify-between px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 cursor-pointer transition-colors group border-b border-border/10 last:border-none"
              onClick={() => view === "documents" && onSelectDocument(item)}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex-shrink-0 w-8 h-8 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  {view === "documents" ? (
                    <FileText size={16} className="text-zinc-500" />
                  ) : item.status === "completed" ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-zinc-300 dark:border-zinc-700" />
                  )}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-[13px] font-medium truncate transition-colors",
                        view === "documents"
                          ? "text-zinc-800 dark:text-zinc-200"
                          : item.status === "completed"
                            ? "text-zinc-400 dark:text-zinc-600 line-through"
                            : "text-zinc-800 dark:text-zinc-200",
                      )}
                    >
                      {item.title}
                    </span>
                    {view === "tasks" &&
                      (item.priority === "high" || item.priority === "medium") && (
                        <span
                          className={cn(
                            "flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded-sm font-medium",
                            item.priority === "high"
                              ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
                          )}
                        >
                          {item.priority === "high" ? "高" : "中"}
                        </span>
                      )}
                  </div>
                  {view === "documents" && (
                    <span className="text-[11px] text-zinc-500 truncate">{item.kind}</span>
                  )}
                </div>
              </div>
              {view === "documents" && (
                <ChevronRight size={14} className="text-zinc-300 group-hover:text-zinc-400" />
              )}
            </div>
          ))}
        </div>
      )}

      <div
        className="flex items-center justify-between px-4 py-2 bg-zinc-50 dark:bg-zinc-900/50 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors border-t border-border/50"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 mr-2" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 transition-colors",
                view === "tasks" ? "text-primary bg-zinc-200/50 dark:bg-zinc-800" : "text-zinc-400",
              )}
              onClick={() => {
                setView("tasks");
                if (!isExpanded) onToggleExpand();
              }}
            >
              <ListTodo size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 transition-colors",
                view === "documents"
                  ? "text-primary bg-zinc-200/50 dark:bg-zinc-800"
                  : "text-zinc-400",
              )}
              onClick={() => {
                setView("documents");
                if (!isExpanded) onToggleExpand();
              }}
            >
              <FileText size={16} />
            </Button>
          </div>

          <span className="text-[12px] font-medium text-zinc-700 dark:text-zinc-300">
            {view === "documents"
              ? `${documents.length}个文件待审核`
              : `${tasks.filter((t: any) => t.status === "completed").length}/${tasks.length} 任务完成`}
          </span>
          {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {view === "documents" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-zinc-500 hover:text-red-500"
              onClick={onRejectAll}
            >
              <X size={14} />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-6 w-6 transition-colors",
              view === "documents"
                ? "bg-black text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
                : "text-zinc-500 hover:text-emerald-500",
            )}
            onClick={view === "documents" ? onApproveAll : undefined}
          >
            <Check size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
};
