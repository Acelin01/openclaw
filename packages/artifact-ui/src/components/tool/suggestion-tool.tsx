"use client";

import {
  ListTodo,
  FileText,
  ExternalLink,
  CheckCircle2,
  Circle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useDataStream } from "../data-stream-provider";
import { DocumentToolResult } from "../document";
import { Tool, ToolHeader, ToolContent, ToolInput, ToolOutput } from "../elements/tool";

interface SuggestionToolProps {
  part: any;
  isReadonly: boolean;
}

export function SuggestionTool({ part, isReadonly }: SuggestionToolProps) {
  const { toolCallId, state, output } = part;
  const { dataStream } = useDataStream();
  const [streamingSteps, setStreamingSteps] = useState<string[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [associatedDoc, setAssociatedDoc] = useState<{ id: string; title: string } | null>(null);
  const router = useRouter();
  const params = useParams();
  const chatId = params?.id as string;

  // 监听流式数据中的步骤和关联文档
  useEffect(() => {
    if (!dataStream) return;

    // 处理步骤
    const steps = dataStream.filter((d) => d.type === "data-step").map((d) => d.data as string);

    if (steps.length > streamingSteps.length) {
      setStreamingSteps(steps);
    }

    // 处理关联文档
    const docPreview = dataStream.find((d) => d.type === "data-document-preview");
    if (docPreview && docPreview.data) {
      setAssociatedDoc(docPreview.data as { id: string; title: string });
    }

    // 监听项目预览数据
    const projectPreview = dataStream.find((d) => d.type === "data-project-preview");
    if (projectPreview && projectPreview.data && !associatedDoc) {
      setAssociatedDoc({
        id: (projectPreview.data as any).id,
        title: (projectPreview.data as any).name || "新创建的项目",
      });
    }

    // 处理关联文档 (正式生成的文档 ID)
    const docIdPart = dataStream.find((d) => d.type === "data-id");
    const docTitlePart = dataStream.find((d) => d.type === "data-title");
    if (docIdPart && docIdPart.data && docTitlePart && docTitlePart.data) {
      setAssociatedDoc({
        id: docIdPart.data as string,
        title: docTitlePart.data as string,
      });
    }

    // 处理任务清单
    const taskListPart = dataStream.find((d) => d.type === "data-task-list");
    if (taskListPart && taskListPart.data && tasks.length === 0) {
      setTasks(taskListPart.data as any[]);
    }

    // 处理任务更新
    const taskUpdates = dataStream.filter((d) => d.type === "data-task-update");
    if (taskUpdates.length > 0) {
      setTasks((prevTasks) => {
        const newTasks = [...prevTasks];
        taskUpdates.forEach((update) => {
          const taskIdx = newTasks.findIndex((t) => t.id === update.data.id);
          if (taskIdx !== -1) {
            newTasks[taskIdx] = { ...newTasks[taskIdx], status: update.data.status };
          }
        });
        return newTasks;
      });
    }
  }, [dataStream, streamingSteps.length, tasks.length]);

  const handlePreviewDoc = (docId: string) => {
    if (chatId) {
      router.push(`/chat/${chatId}?documentId=${docId}`);
    }
  };

  const renderTaskStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 size={14} className="text-green-500" />;
      case "in_progress":
        return <Loader2 size={14} className="text-blue-500 animate-spin" />;
      case "failed":
        return <AlertCircle size={14} className="text-red-500" />;
      default:
        return <Circle size={14} className="text-muted-foreground" />;
    }
  };

  const renderTasks = () => {
    if (!tasks || tasks.length === 0) return null;

    return (
      <div className="space-y-2 mb-4">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <ListTodo size={14} />
          任务执行清单
        </div>
        <div className="bg-muted/30 rounded-lg p-3 border border-border/50 space-y-2">
          {tasks.map((task: any) => (
            <div
              key={task.id}
              className="flex items-center gap-3 text-xs transition-all duration-300"
            >
              <div className="shrink-0">{renderTaskStatusIcon(task.status)}</div>
              <div className="flex flex-col flex-1 min-w-0">
                <span
                  className={`font-medium truncate ${task.status === "completed" ? "text-muted-foreground line-through" : ""}`}
                >
                  {task.name}
                </span>
                {task.status === "in_progress" && (
                  <span className="text-[10px] text-blue-500 animate-pulse truncate">
                    正在执行: {task.description}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSteps = (steps: string[]) => {
    if (!steps || steps.length === 0) return null;

    return (
      <div className="space-y-2">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <ListTodo size={14} />
          建议生成步骤
        </div>
        <div className="bg-muted/30 rounded-lg p-3 border border-border/50 space-y-1.5">
          {steps.map((step: string, index: number) => (
            <div
              key={index}
              className="text-xs flex gap-2 animate-in fade-in slide-in-from-left-1 duration-300"
            >
              <span className="text-muted-foreground shrink-0">{index + 1}.</span>
              <span
                className={
                  step.includes("⚠️") ? "text-amber-600 dark:text-amber-400 font-medium" : ""
                }
              >
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAssociatedDoc = () => {
    if (!associatedDoc) return null;

    return (
      <div
        onClick={() => handlePreviewDoc(associatedDoc.id)}
        className="flex items-center gap-2 p-2 rounded-md border border-blue-100 bg-blue-50/50 hover:bg-blue-50 cursor-pointer transition-colors group"
      >
        <FileText size={14} className="text-blue-500" />
        <span className="text-xs font-medium text-blue-700 truncate flex-1">
          关联文档: {associatedDoc.title}
        </span>
        <ExternalLink size={12} className="text-blue-400 group-hover:text-blue-600" />
      </div>
    );
  };

  const renderSuggestionOutput = (data: any) => {
    // 优先显示流式步骤，如果没有则显示最终输出中的步骤
    const stepsToDisplay = streamingSteps.length > 0 ? streamingSteps : data?.steps || [];

    return (
      <div className="flex flex-col gap-4">
        {renderTasks()}
        {renderSteps(stepsToDisplay)}
        {renderAssociatedDoc()}

        {data && !("error" in data) && (
          <DocumentToolResult isReadonly={isReadonly} result={data} type="request-suggestions" />
        )}

        {data && "error" in data && (
          <div className="rounded border p-2 text-red-500 text-xs">Error: {String(data.error)}</div>
        )}
      </div>
    );
  };

  return (
    <Tool defaultOpen={true} key={toolCallId}>
      <ToolHeader state={state} type="tool-requestSuggestions" />
      <ToolContent>
        {state === "input-available" && <ToolInput input={part.input} />}
        {(state === "output-available" || streamingSteps.length > 0) && (
          <ToolOutput errorText={undefined} output={renderSuggestionOutput(output)} />
        )}
      </ToolContent>
    </Tool>
  );
}
