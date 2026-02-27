"use client";

import { TaskList } from "../task-list";

interface TaskToolProps {
  part: any;
  type: "create" | "update";
}

export function TaskTool({ part, type }: TaskToolProps) {
  const { toolCallId, state } = part;
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

  if (type === "create") {
    if (state === "output-available") {
      const tasks = (part.output?.tasks || []).map(normalizeTask);
      return (
        <div className="not-prose mb-4 w-full" key={toolCallId}>
          <TaskList tasks={tasks} title="新规划任务事项" />
        </div>
      );
    }
    return null;
  }

  return (
    <div className="not-prose mb-4 w-full" key={toolCallId}>
      {state === "output-available" && (
        <div className="space-y-4">
          {part.output?.updates && part.output.updates.length > 0 && (
            <TaskList tasks={part.output.updates.map(normalizeTask)} title="已更新任务状态" />
          )}
          {part.output?.newTasks && part.output.newTasks.length > 0 && (
            <TaskList tasks={part.output.newTasks.map(normalizeTask)} title="新增任务安排" />
          )}
        </div>
      )}
    </div>
  );
}
