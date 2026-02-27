import { v4 as uuidv4 } from "uuid";
import {
  WorkflowTemplate,
  WorkflowInstance,
  WorkflowStatus,
  MessageType,
  AgentMessage,
  AgentRole,
} from "../types/collaboration";

export class OrchestrationEngine {
  private workflowTemplates: Map<string, WorkflowTemplate> = new Map();
  private activeWorkflows: Map<string, WorkflowInstance> = new Map();

  public registerWorkflow(template: WorkflowTemplate): void {
    this.workflowTemplates.set(template.type, template);
  }

  public async startWorkflow(
    type: string,
    initialContext: Record<string, any>,
  ): Promise<WorkflowInstance> {
    const template = this.workflowTemplates.get(type);
    if (!template) {
      throw new Error(`Workflow template ${type} not found`);
    }

    const instance: WorkflowInstance = {
      id: uuidv4(),
      templateType: type,
      status: WorkflowStatus.IN_PROGRESS,
      currentStageId: template.stages[0].id,
      context: initialContext,
      startTime: new Date().toISOString(),
    };

    this.activeWorkflows.set(instance.id, instance);

    // Trigger first stage
    await this.executeStage(instance, template.stages[0]);

    return instance;
  }

  private async executeStage(instance: WorkflowInstance, stage: any): Promise<void> {
    console.log(`Executing stage ${stage.name} for workflow ${instance.id}`);

    // SLA 监控：记录开始时间
    if (!instance.metrics) instance.metrics = {};
    instance.metrics[`stage_${stage.id}_start`] = Date.now();

    // In a real system, this would send a message to an agent
    const message: AgentMessage = {
      messageId: uuidv4(),
      senderId: "SYSTEM",
      receiverId: stage.executorRole, // Target role
      conversationId: instance.id,
      messageType: MessageType.TASK_ASSIGNMENT,
      content: {
        stageId: stage.id,
        stageName: stage.name,
        context: instance.context,
      },
      timestamp: new Date().toISOString(),
    };

    // Mock agent execution (根据 stageId 模拟不同耗时，STG_DESIGN 将触发 SLA 建议)
    const delay = stage.id === "STG_DESIGN" ? 2500 : 1000;
    setTimeout(async () => {
      await this.handleAgentResponse(instance.id, {
        status: "success",
        data: { [`${stage.id}_result`]: `Completed ${stage.name}` },
      });
    }, delay);
  }

  public async handleAgentResponse(workflowId: string, response: any): Promise<void> {
    const instance = this.activeWorkflows.get(workflowId);
    if (!instance) return;

    const template = this.workflowTemplates.get(instance.templateType);
    if (!template) return;

    // SLA 监控：记录结束时间并计算耗时
    const stageId = instance.currentStageId;
    const startTime = instance.metrics?.[`stage_${stageId}_start`];
    if (startTime) {
      const duration = (Date.now() - startTime) / 1000;
      instance.metrics![`stage_${stageId}_duration`] = duration;
      console.log(`Stage ${stageId} completed in ${duration}s`);

      // SLA 检查：如果耗时超过 2s，生成改进建议
      if (duration > 2) {
        if (!instance.metrics!["suggestions"]) instance.metrics!["suggestions"] = [];
        (instance.metrics!["suggestions"] as string[]).push(
          `Stage ${stageId} took too long (${duration}s), consider optimizing executor efficiency.`,
        );
      }
    }

    if (response.status === "success") {
      instance.context = { ...instance.context, ...response.data };

      const currentStage = template.stages.find((s) => s.id === instance.currentStageId);
      const nextStageId = currentStage?.nextStages?.[0];

      if (nextStageId) {
        const nextStage = template.stages.find((s) => s.id === nextStageId);
        if (nextStage) {
          instance.currentStageId = nextStageId;
          await this.executeStage(instance, nextStage);
        } else {
          this.completeWorkflow(instance);
        }
      } else {
        this.completeWorkflow(instance);
      }
    } else {
      instance.status = WorkflowStatus.FAILED;
      instance.endTime = new Date().toISOString();
    }
  }

  private completeWorkflow(instance: WorkflowInstance): void {
    instance.status = WorkflowStatus.COMPLETED;
    instance.endTime = new Date().toISOString();
    console.log(`Workflow ${instance.id} completed`);
  }

  public getWorkflowStatus(id: string): WorkflowInstance | undefined {
    return this.activeWorkflows.get(id);
  }
}
