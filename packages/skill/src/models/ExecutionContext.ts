export enum ExecutionStatus {
  IDLE = "idle",
  INITIALIZING = "initializing",
  RUNNING = "running",
  COMPLETED = "completed",
  FAILED = "failed",
  RECOVERING = "recovering",
}

/**
 * 执行上下文 (ExecutionContext)
 * 包含输入层、状态层和输出层
 */
export class ExecutionContext {
  public readonly id: string;

  // 输入层
  public inputs: Record<string, any> = {};
  public constraints: Record<string, any> = {};
  public env: Record<string, any> = {};

  // 状态层
  public status: ExecutionStatus = ExecutionStatus.IDLE;
  public progress: number = 0; // 0-100
  public metrics: Record<string, any> = {};

  // 输出层
  public results: Record<string, any> = {};
  public logs: string[] = [];
  public feedback: string[] = [];

  constructor(id: string) {
    this.id = id;
  }

  public addLog(message: string) {
    const timestamp = new Date().toISOString();
    this.logs.push(`[${timestamp}] ${message}`);
  }

  public updateProgress(progress: number) {
    this.progress = Math.min(100, Math.max(0, progress));
  }

  public setMetric(key: string, value: any) {
    this.metrics[key] = value;
  }
}
