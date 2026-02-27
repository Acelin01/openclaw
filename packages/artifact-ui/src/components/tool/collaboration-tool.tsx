"use client";

import {
  CheckCircle2,
  MessageSquare,
  ListTodo,
  Zap,
  TrendingUp,
  FileText,
  ExternalLink,
  Circle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useDataStream } from "../data-stream-provider";
import { Tool, ToolHeader, ToolContent, ToolInput, ToolOutput } from "../elements/tool";
import { Response } from "../response";
import { TaskList } from "../task-list";

interface CollaborationToolProps {
  part: any;
}

export function CollaborationTool({ part }: CollaborationToolProps) {
  const { toolCallId, state, output } = part;
  const { dataStream } = useDataStream();
  const [streamingSteps, setStreamingSteps] = useState<string[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [associatedDoc, setAssociatedDoc] = useState<{ id: string; title: string } | null>(null);
  const router = useRouter();
  const params = useParams();
  const chatId = params?.id as string;
  const normalizeTask = (task: any, index: number) => ({
    ...task,
    id: task.id || `task-${index}`,
    title: task.title || task.name || "未命名任务",
    status: task.status || "pending",
    priority: task.priority || "medium",
    assignee: task.assignee || task.assigneeName || task.assigneeRole || task.assigneeId,
    risk: task.risk || task.riskLevel || task.risk_level,
    estimatedHours: task.estimatedHours ?? task.estimated_hours ?? task.estimateHours,
  });

  useEffect(() => {
    const handleStep = (event: any) => {
      const step = event?.detail?.step;
      if (!step) return;
      setStreamingSteps((prev) => {
        if (prev[prev.length - 1] === step) return prev;
        return [...prev, step];
      });
    };

    const handleTaskList = (event: any) => {
      const list = event?.detail?.tasks;
      if (!Array.isArray(list)) return;
      setTasks(list.map(normalizeTask));
    };

    const handleTaskUpdate = (event: any) => {
      const update = event?.detail?.update;
      if (!update?.id) return;
      setTasks((prevTasks) => {
        const taskMap = new Map(prevTasks.map((task) => [task.id, task]));
        if (taskMap.has(update.id)) {
          taskMap.set(update.id, { ...taskMap.get(update.id), status: update.status });
        }
        return Array.from(taskMap.values());
      });
    };

    window.addEventListener("collaboration-step", handleStep as EventListener);
    window.addEventListener("collaboration-task-list", handleTaskList as EventListener);
    window.addEventListener("collaboration-task-update", handleTaskUpdate as EventListener);

    return () => {
      window.removeEventListener("collaboration-step", handleStep as EventListener);
      window.removeEventListener("collaboration-task-list", handleTaskList as EventListener);
      window.removeEventListener("collaboration-task-update", handleTaskUpdate as EventListener);
    };
  }, []);

  // 监听流式数据中的步骤、任务和关联文档
  useEffect(() => {
    if (!dataStream) return;

    // 处理步骤
    const steps = dataStream.filter((d) => d.type === "data-step").map((d) => d.data as string);

    if (steps.length > streamingSteps.length) {
      setStreamingSteps(steps);
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
      const newTasks = (taskListPart.data as any[]).map(normalizeTask);
      setTasks(newTasks);
    }

    // 处理任务更新
    const taskUpdates = dataStream.filter((d) => d.type === "data-task-update");
    if (taskUpdates.length > 0) {
      setTasks((prevTasks) => {
        const taskMap = new Map(prevTasks.map((t) => [t.id, t]));

        taskUpdates.forEach((update) => {
          const taskId = update.data.id;
          if (taskMap.has(taskId)) {
            taskMap.set(taskId, { ...taskMap.get(taskId), status: update.data.status });
          }
        });

        return Array.from(taskMap.values());
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

    const formattedTasks = tasks.map(normalizeTask);

    return (
      <div className="mb-4">
        <TaskList tasks={formattedTasks} title="协作任务执行清单" />
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

  const renderCollaborationOutput = (data: any) => {
    // 优先使用流式步骤
    const stepsToDisplay = streamingSteps.length > 0 ? streamingSteps : data?.steps || [];

    if (!data && streamingSteps.length === 0 && tasks.length === 0) return null;

    // Handle string output
    if (typeof data === "string") {
      return (
        <div className="prose prose-sm dark:prose-invert max-w-none p-4">
          <Response>{data}</Response>
        </div>
      );
    }

    const resultData = data?.data || data || {};
    const message =
      data?.message ||
      (state === "output-available" ? "智能协同流程执行完成" : "正在执行协作流程...");
    const finalReport = resultData.finalReport;

    return (
      <div className="flex flex-col gap-4 p-4">
        {renderTasks()}

        {/* 步骤展示 (Descriptive Steps) */}
        {stepsToDisplay.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <ListTodo size={14} />
              执行步骤
            </div>
            <div className="bg-muted/30 rounded-lg p-3 border border-border/50 space-y-1.5">
              {stepsToDisplay.map((step: string, index: number) => (
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
        )}

        {renderAssociatedDoc()}

        {(finalReport || message) && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <MessageSquare size={14} />
              最终报告
            </div>
            <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
              <Response>{finalReport || message}</Response>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Tool defaultOpen={true} key={toolCallId}>
      <ToolHeader state={state} type="tool-startCollaboration" />
      <ToolContent>
        {state === "input-available" && <ToolInput input={part.input} />}
        {(state === "output-available" || streamingSteps.length > 0 || tasks.length > 0) && (
          <ToolOutput errorText={output?.error} output={renderCollaborationOutput(output)} />
        )}
      </ToolContent>
    </Tool>
  );
}
