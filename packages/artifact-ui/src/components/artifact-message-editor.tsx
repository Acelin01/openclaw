"use client";

import { Badge } from "@uxin/ui";
import { MessageSquare, User, Clock, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { cn, parseStructuredContent } from "../lib/utils";
import { ArtifactContent } from "./create-artifact";
import { DiffView } from "./diffview";
import { DocumentSkeleton } from "./document-skeleton";
import { Editor } from "./text-editor";

interface MessageData {
  title: string;
  recipient: string;
  content: string;
  time: string;
  priority: string;
}

export function ArtifactMessageEditor(props: ArtifactContent & { isInline?: boolean }) {
  const {
    mode,
    isLoading,
    currentVersionIndex,
    getDocumentContentById,
    content,
    status,
    isInline,
  } = props;
  const [data, setData] = useState<MessageData>({
    title: "",
    recipient: "",
    content: "",
    time: "",
    priority: "Medium",
  });
  const [parseError, setParseError] = useState(false);

  useEffect(() => {
    if (!content) return;
    try {
      const parsed = parseStructuredContent<MessageData>(content);
      setData(parsed);
      setParseError(false);
    } catch (e) {
      if (status !== "streaming") {
        setParseError(true);
      }
    }
  }, [content, status]);

  if (isLoading) return <DocumentSkeleton artifactKind="message" />;

  if (mode === "diff") {
    const oldContent = getDocumentContentById(currentVersionIndex - 1);
    const newContent = getDocumentContentById(currentVersionIndex);
    return <DiffView newContent={newContent} oldContent={oldContent} />;
  }

  if (parseError) {
    return (
      <div className="p-4">
        <div className="text-red-500 mb-2">
          Error parsing message data. Switching to raw text editor.
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
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm line-clamp-1">{data.title || "New Message"}</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {data.recipient || "Unknown Recipient"}
                </span>
              </div>
            </div>
          </div>
          <Badge
            variant={
              data.priority === "High"
                ? "destructive"
                : data.priority === "Low"
                  ? "secondary"
                  : "outline"
            }
            className="text-[10px] px-1.5 h-5"
          >
            {data.priority}
          </Badge>
        </div>

        <div className="text-sm text-muted-foreground line-clamp-2 bg-muted/30 p-2 rounded-md italic">
          {data.content || "No content available..."}
        </div>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {data.time || "Not scheduled"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <div className="p-6 border-b space-y-4 bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">{data.title || "Message Draft"}</h2>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>
                    To:{" "}
                    <span className="text-foreground font-medium">
                      {data.recipient || "Not specified"}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground border-l pl-4">
                  <Clock className="w-4 h-4" />
                  <span>
                    Time:{" "}
                    <span className="text-foreground font-medium">{data.time || "Immediate"}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant={data.priority === "High" ? "destructive" : "outline"}
              className={cn(
                "gap-1 px-3 py-1 text-xs font-semibold",
                data.priority === "High" && "animate-pulse",
              )}
            >
              {data.priority === "High" && <AlertCircle className="w-3 h-3" />}
              {data.priority} Priority
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-10 md:p-16">
          <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-1">
              <Editor
                {...props}
                content={data.content || ""}
                suggestions={props.suggestions || []}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
