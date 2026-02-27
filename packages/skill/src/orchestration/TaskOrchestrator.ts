import { v4 as uuidv4 } from "uuid";

export enum TaskStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed",
}

export interface Task {
  id: string;
  name: string;
  description: string;
  status: TaskStatus;
  assignee?: string;
  subTasks?: Task[];
  parentId?: string;
  context: Record<string, any>;
  startTime?: string;
  endTime?: string;
}

/**
 * 任务解析器 (TaskAnalyzer)
 */
export class TaskAnalyzer {
  public analyze(request: string): { name: string; requirements: string[] } {
    console.log(`[TaskAnalyzer] Analyzing request: ${request}`);
    const lowerRequest = request.toLowerCase();
    // 模拟解析逻辑
    const requirements: string[] = [];
    if (
      lowerRequest.includes("分析") ||
      lowerRequest.includes("analysis") ||
      lowerRequest.includes("analyze")
    ) {
      if (
        lowerRequest.includes("legacy") ||
        lowerRequest.includes("遗留") ||
        lowerRequest.includes("老旧")
      ) {
        requirements.push("legacy_analysis");
      } else {
        requirements.push("requirement_analysis");
      }
    }
    if (lowerRequest.includes("设计") || lowerRequest.includes("design")) {
      requirements.push("system_design");
    }
    if (
      lowerRequest.includes("实现") ||
      lowerRequest.includes("code") ||
      lowerRequest.includes("implement") ||
      lowerRequest.includes("开发")
    ) {
      requirements.push("coding");
    }

    return {
      name: request.split(" ").slice(0, 3).join(" "),
      requirements,
    };
  }

  public extractSkillRequirements(analysis: { requirements: string[] }): string[] {
    console.log(
      `[TaskAnalyzer] Extracting skill requirements from: ${analysis.requirements.join(", ")}`,
    );
    // 映射任务需求到技能类别
    const skillMap: Record<string, string> = {
      requirement_analysis: "analysis",
      legacy_analysis: "legacy_analysis",
      system_design: "design",
      coding: "development",
    };

    return analysis.requirements.map((req) => skillMap[req] || "general");
  }
}

/**
 * 任务分解器 (TaskDecomposer)
 */
export class TaskDecomposer {
  public decompose(goal: string, context: Record<string, any>): Task[] {
    console.log(`[TaskDecomposer] Decomposing goal: ${goal}`);

    // 1. 可分解性评估 (2.1 AssessDecomposability)
    const isDecomposable = this.assessDecomposability(goal);

    if (!isDecomposable) {
      console.log(`[TaskDecomposer] 目标 "${goal}" 被评估为不可进一步自动拆分，将分配人工任务。`);
      return [
        {
          id: uuidv4(),
          name: "Manual Intervention Required",
          description: `Human team needed for: ${goal}`,
          status: TaskStatus.PENDING,
          context: { ...context, requiresHuman: true },
        },
      ];
    }

    const tasks: Task[] = [
      {
        id: uuidv4(),
        name: "Requirement Analysis",
        description: `Analyze requirements for ${goal}`,
        status: TaskStatus.PENDING,
        context: { ...context },
      },
      {
        id: uuidv4(),
        name: "System Design",
        description: `Design architecture for ${goal}`,
        status: TaskStatus.PENDING,
        context: { ...context },
      },
    ];

    // 如果目标涉及遗留系统，增加演进分析任务
    if (goal.toLowerCase().includes("legacy") || goal.includes("老旧") || goal.includes("遗留")) {
      tasks.push({
        id: uuidv4(),
        name: "Legacy Evolution Analysis",
        description: `Analyze evolution path for legacy system in ${goal}`,
        status: TaskStatus.PENDING,
        context: { ...context },
      });
    }

    tasks.push({
      id: uuidv4(),
      name: "Implementation",
      description: `Implement ${goal}`,
      status: TaskStatus.PENDING,
      context: { ...context },
    });

    return tasks;
  }

  /**
   * 可分解性评估 (2.1 AssessDecomposability)
   */
  private assessDecomposability(goal: string): boolean {
    // 模拟评估逻辑：过于模糊或已知极其复杂的任务返回 false
    if (goal.includes("物理接入") || goal.includes("硬件调试")) return false;
    return true;
  }
}

/**
 * 任务调度器 (TaskScheduler)
 */
export class TaskScheduler {
  private queue: Task[] = [];

  public schedule(tasks: Task[]): void {
    console.log(`[TaskScheduler] Scheduling ${tasks.length} tasks`);
    this.queue.push(...tasks);
  }

  public getNextTask(): Task | undefined {
    return this.queue.find((t) => t.status === TaskStatus.PENDING);
  }
}

/**
 * 任务监控器 (TaskMonitor)
 */
export class TaskMonitor {
  private tasks: Map<string, Task> = new Map();

  public watch(task: Task): void {
    this.tasks.set(task.id, task);
  }

  public updateStatus(taskId: string, status: TaskStatus): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = status;
      console.log(`[TaskMonitor] Task ${task.name} updated to ${status}`);
    }
  }

  public getReport(): Record<string, any> {
    const all = Array.from(this.tasks.values());
    return {
      total: all.length,
      completed: all.filter((t) => t.status === TaskStatus.COMPLETED).length,
      failed: all.filter((t) => t.status === TaskStatus.FAILED).length,
      inProgress: all.filter((t) => t.status === TaskStatus.IN_PROGRESS).length,
    };
  }
}
