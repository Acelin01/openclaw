"use client";

import { Badge } from "@uxin/ui";
import {
  ClipboardList,
  Calendar,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  HelpCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn, parseStructuredContent } from "../lib/utils";
import { ArtifactContent } from "./create-artifact";
import { DiffView } from "./diffview";
import { DocumentSkeleton } from "./document-skeleton";
import { Editor } from "./text-editor";

interface ReportData {
  title: string;
  type: string;
  date: string;
  summary: string;
  problems: string;
  plans: string;
  assistance: string;
}

export function ReportEditor(props: ArtifactContent & { isInline?: boolean }) {
  const {
    mode,
    isLoading,
    currentVersionIndex,
    getDocumentContentById,
    content,
    status,
    isInline,
  } = props;
  const [data, setData] = useState<ReportData>({
    title: "",
    type: "Daily",
    date: "",
    summary: "",
    problems: "",
    plans: "",
    assistance: "",
  });
  const [parseError, setParseError] = useState(false);

  useEffect(() => {
    if (!content) return;
    try {
      const parsed = parseStructuredContent<ReportData>(content);
      setData(parsed);
      setParseError(false);
    } catch (e) {
      if (status !== "streaming") {
        setParseError(true);
      }
    }
  }, [content, status]);

  if (isLoading) return <DocumentSkeleton artifactKind="report" />;

  if (mode === "diff") {
    const oldContent = getDocumentContentById(currentVersionIndex - 1);
    const newContent = getDocumentContentById(currentVersionIndex);
    return <DiffView newContent={newContent} oldContent={oldContent} />;
  }

  if (parseError) {
    return (
      <div className="p-4">
        <div className="text-red-500 mb-2">
          Error parsing report data. Switching to raw text editor.
        </div>
        <Editor {...props} suggestions={props.suggestions || []} />
      </div>
    );
  }

  if (isInline) {
    return (
      <div className="p-4 space-y-3 bg-card rounded-xl border shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <ClipboardList className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm line-clamp-1">{data.title || "New Report"}</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {data.date || "Today"}
                </span>
              </div>
            </div>
          </div>
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 h-5 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
          >
            {data.type}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="text-[10px] p-2 bg-muted/30 rounded border border-dashed flex flex-col gap-1">
            <span className="text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5" /> Summary
            </span>
            <span className="line-clamp-1 font-medium">{data.summary || "Pending..."}</span>
          </div>
          <div className="text-[10px] p-2 bg-muted/30 rounded border border-dashed flex flex-col gap-1">
            <span className="text-muted-foreground flex items-center gap-1">
              <PlayCircle className="w-2.5 h-2.5" /> Next Steps
            </span>
            <span className="line-clamp-1 font-medium">{data.plans || "Pending..."}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <div className="p-6 border-b bg-muted/20">
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-green-500/10 text-green-600 dark:text-green-400">
              <ClipboardList className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  variant="secondary"
                  className="px-2 py-0 text-[10px] uppercase tracking-wider font-bold"
                >
                  {data.type} REPORT
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {data.date}
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">{data.title || "Report Draft"}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-10 md:p-16 space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-bold text-foreground">
              <div className="w-1.5 h-6 bg-green-500 rounded-full" />
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <h3>工作总结 (Summary)</h3>
            </div>
            <div className="bg-card border rounded-2xl shadow-sm overflow-hidden p-1">
              <Editor
                {...props}
                content={data.summary || ""}
                suggestions={props.suggestions || []}
              />
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-bold text-foreground">
                <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <h3>遇到问题 (Problems)</h3>
              </div>
              <div className="bg-card border rounded-2xl shadow-sm overflow-hidden p-1 min-h-[200px]">
                <Editor
                  {...props}
                  content={data.problems || ""}
                  suggestions={props.suggestions || []}
                />
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-bold text-foreground">
                <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                <PlayCircle className="w-5 h-5 text-blue-500" />
                <h3>下一步计划 (Plans)</h3>
              </div>
              <div className="bg-card border rounded-2xl shadow-sm overflow-hidden p-1 min-h-[200px]">
                <Editor
                  {...props}
                  content={data.plans || ""}
                  suggestions={props.suggestions || []}
                />
              </div>
            </section>
          </div>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-bold text-foreground">
              <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
              <HelpCircle className="w-5 h-5 text-purple-500" />
              <h3>需要协助 (Assistance)</h3>
            </div>
            <div className="bg-card border rounded-2xl shadow-sm overflow-hidden p-1 min-h-[150px]">
              <Editor
                {...props}
                content={data.assistance || ""}
                suggestions={props.suggestions || []}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
