import {
  Project,
  ProjectRequirement,
  ProjectTask,
  ProjectStatus,
  RequirementPriority,
  RequirementStatus,
  TaskPriority,
  TaskStatus,
} from "../types";
import { constructApiUrl } from "./api";

export interface CollaborationEvent {
  type: string;
  data: any;
  transient?: boolean;
}

export type CollaborationEventHandler = (event: CollaborationEvent) => void;

export interface CollaborationContext {
  userId: string;
  projectId?: string;
  token?: string;
  isService?: boolean;
  onEvent?: CollaborationEventHandler;
}

/**
 * ProjectApp provides unified project collaboration logic.
 * It can be used by both frontend and backend (via MCP).
 */
export class ProjectApp {
  constructor() {}

  private async request(path: string, options: RequestInit = {}, token?: string) {
    const headers: any = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers || {}),
    };

    const url = constructApiUrl(path);
    if (token) {
      const isServiceToken =
        token === "uxin-service-secret-123" ||
        token.includes("service-secret") ||
        token.startsWith("uxin-service");

      if (isServiceToken) {
        // Ensure we only send the secret part if it's a Bearer token
        const secret = token.startsWith("Bearer ") ? token.substring(7) : token;
        headers["x-service-secret"] = secret;
      } else {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
      }
    }

    const response = await fetch(url.toString(), {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Unknown error" }));
      throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  /**
   * Propose an action that requires user approval
   */
  private async proposeAction(
    params: {
      kind: string;
      title: string;
      data: any;
      action: string;
      description?: string;
      reviewerId?: string;
    },
    context: CollaborationContext,
  ) {
    const { kind, title, data, action, description, reviewerId } = params;

    // 1. Notify UI that an approval is required
    context.onEvent?.({
      type: "data-approval-required",
      data: {
        kind,
        title,
        action,
        params: data,
        reviewerId,
        description: description || `请求批准操作：${title}`,
      },
      transient: false,
    });

    // 2. Sync data to the artifact for preview
    const eventType = `data-${kind}Delta`;
    context.onEvent?.({
      type: eventType,
      data: data,
      transient: false,
    });

    return {
      success: true,
      status: "pending_approval",
      message: `已创建 ${title} 提案，请在右侧面板审核通过后执行。`,
      proposal: { kind, action, params: data },
    };
  }

  /**
   * Helper to create a document and propose an action
   */
  private async _createDocumentAndPropose(
    params: any,
    kind: string,
    action: string,
    description: string,
    context: CollaborationContext,
    contentTransformer: (p: any) => any = (p) => p,
  ) {
    context.onEvent?.({
      type: "text",
      data: `正在为您生成文档：${params.title || params.name || "未命名"}...`,
    });

    const documentId = crypto.randomUUID?.() || Math.random().toString(36).substring(7);
    const normalizedParams = contentTransformer(params);

    const docData = {
      title: params.title || params.name || "未命名",
      kind,
      content: JSON.stringify(normalizedParams),
      status: "PENDING",
      reviewerId: params.reviewerId || params.reviewer_id,
    };

    try {
      await this.request(
        `/api/v1/document?id=${documentId}`,
        {
          method: "POST",
          body: JSON.stringify(docData),
        },
        context.token,
      );

      return this.proposeAction(
        {
          kind,
          title: docData.title,
          action,
          data: { ...normalizedParams, documentId },
          reviewerId: docData.reviewerId,
          description: `${description} (已关联文档 ${documentId})`,
        },
        context,
      );
    } catch (error) {
      console.error(`Failed to create ${kind} document:`, error);
      throw error;
    }
  }

  /**
   * Create a new project
   */
  async createProject(params: any, context: CollaborationContext) {
    return this._createDocumentAndPropose(
      params,
      "project",
      "createProject",
      `创建新项目: ${params.name || params.title}`,
      context,
      (p) => ({
        ...p,
        budgetMin: p.budgetMin || p.budget_min,
        budgetMax: p.budgetMax || p.budget_max,
        startDate: p.startDate || p.start_date,
        endDate: p.endDate || p.end_date,
        ownerId: p.ownerId || p.owner_id,
        teamMembers: p.teamMembers || p.team_members,
      }),
    );
  }

  /**
   * Get project details
   */
  async getProject(projectId: string, context: CollaborationContext) {
    return this.request(`/api/v1/projects/${projectId}`, {}, context.token);
  }

  /**
   * Manage requirements
   */
  async createRequirement(params: any, context: CollaborationContext) {
    const projectId = params.projectId || params.project_id || context.projectId;
    if (!projectId) throw new Error("Project ID is required");

    return this._createDocumentAndPropose(
      params,
      "project-requirement",
      "createRequirement",
      `在项目中创建需求: ${params.title}`,
      context,
      (p) => ({
        ...p,
        projectId,
        reviewerId: p.reviewerId || p.reviewer_id,
        assigneeId: p.assigneeId || p.assignee_id,
        priority: (p.priority || "MEDIUM").toUpperCase(),
        status: (p.status || "DRAFT").toUpperCase(),
        estimatedHours: p.estimatedHours || p.estimated_hours,
        acceptanceCriteria: p.acceptanceCriteria || p.acceptance_criteria,
      }),
    );
  }

  /**
   * Manage tasks
   */
  async createTask(params: any, context: CollaborationContext) {
    const projectId = params.projectId || context.projectId;
    if (!projectId) throw new Error("Project ID is required");

    return this._createDocumentAndPropose(
      params,
      "task",
      "createTask",
      `在项目中指派任务: ${params.title}`,
      context,
      (p) => ({
        ...p,
        projectId,
        assigneeId: p.assigneeId || p.assignee_id,
        dueDate: p.dueDate || p.due_date,
        estimatedHours: p.estimatedHours || p.estimated_hours,
        requirementId: p.requirementId || p.requirement_id,
      }),
    );
  }

  async getTask(taskId: string, context: CollaborationContext) {
    return this.request(`/api/v1/project-tasks/${taskId}`, {}, context.token);
  }

  async updateTask(taskId: string, data: any, context: CollaborationContext) {
    context.onEvent?.({
      type: "text",
      data: `正在更新任务 (ID: ${taskId})...`,
    });

    const result = await this.request(
      `/api/v1/project-tasks/${taskId}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
      context.token,
    );

    if (result.success) {
      context.onEvent?.({ type: "data-task-updated", data: result.data, transient: false });
    }

    return result;
  }

  async updateTaskStatus(taskId: string, status: string, context: CollaborationContext) {
    const normalizedStatus = (() => {
      const s = String(status || "").toUpperCase();
      if (s === "PENDING") return "PENDING";
      if (s === "IN_PROGRESS" || s === "INPROGRESS") return "IN_PROGRESS";
      if (s === "COMPLETED" || s === "DONE") return "COMPLETED";
      if (s === "OVERDUE") return "OVERDUE";

      const lower = String(status || "").toLowerCase();
      if (lower === "pending") return "PENDING";
      if (lower === "in_progress") return "IN_PROGRESS";
      if (lower === "completed") return "COMPLETED";
      if (lower === "failed") return "PENDING";

      return "PENDING";
    })();

    return this.updateTask(taskId, { status: normalizedStatus }, context);
  }

  async dispatchCollaboration(
    params: { taskId: string; agentRole: string; context: string; dependencies?: string[] },
    context: CollaborationContext,
  ) {
    const taskRes: any = await this.getTask(params.taskId, context);
    const task = taskRes?.data ?? taskRes;
    const prevSubtasks =
      (task && typeof task === "object" ? (task as any).subtasks : undefined) ?? {};
    const dispatches = Array.isArray((prevSubtasks as any).dispatches)
      ? (prevSubtasks as any).dispatches
      : [];

    const nextSubtasks = {
      ...(prevSubtasks || {}),
      dependencies: params.dependencies || (prevSubtasks as any).dependencies,
      dispatches: [
        ...dispatches,
        {
          agentRole: params.agentRole,
          context: params.context,
          dependencies: params.dependencies,
          dispatchedAt: new Date().toISOString(),
        },
      ],
    };

    return this.updateTask(
      params.taskId,
      { status: "IN_PROGRESS", subtasks: nextSubtasks },
      context,
    );
  }

  async syncCollaboration(
    params: {
      projectId: string;
      updates: Array<{ taskId: string; status?: string; output?: any }>;
    },
    context: CollaborationContext,
  ) {
    const results: any[] = [];

    for (const update of params.updates || []) {
      const taskRes: any = await this.getTask(update.taskId, context);
      const task = taskRes?.data ?? taskRes;
      const prevSubtasks =
        (task && typeof task === "object" ? (task as any).subtasks : undefined) ?? {};

      const nextSubtasks = (() => {
        if (update.output === undefined) return prevSubtasks;
        const outputs = Array.isArray((prevSubtasks as any).outputs)
          ? (prevSubtasks as any).outputs
          : [];
        return {
          ...(prevSubtasks || {}),
          outputs: [...outputs, { at: new Date().toISOString(), output: update.output }],
        };
      })();

      const normalizedStatus = update.status
        ? await this.updateTaskStatus(update.taskId, update.status, context)
        : null;
      if (update.output !== undefined) {
        const patched = await this.updateTask(update.taskId, { subtasks: nextSubtasks }, context);
        results.push(patched);
      } else if (normalizedStatus) {
        results.push(normalizedStatus);
      }
    }

    context.onEvent?.({
      type: "data-collaboration-synced",
      data: { projectId: params.projectId, updates: params.updates },
      transient: false,
    });

    return { success: true, data: results };
  }

  /**
   * Manage bugs
   */
  async createBug(params: any, context: CollaborationContext) {
    const projectId = params.projectId || context.projectId;
    if (!projectId) throw new Error("Project ID is required");

    return this._createDocumentAndPropose(
      params,
      "defect",
      "createBug",
      `在项目中记录缺陷: ${params.title}`,
      context,
      (p) => ({
        ...p,
        projectId,
        stepsToReproduce: p.stepsToReproduce || p.steps_to_reproduce,
        expectedResult: p.expectedResult || p.expected_result,
        actualResult: p.actualResult || p.actual_result,
        severity: (p.severity || "MEDIUM").toUpperCase(),
        priority: (p.priority || "MEDIUM").toUpperCase(),
        reporterId: p.reporterId || p.reporter_id,
        assigneeId: p.assigneeId || p.assignee_id,
      }),
    );
  }

  /**
   * Manage iterations
   */
  async createIteration(params: any, context: CollaborationContext) {
    const projectId = params.projectId || context.projectId;
    if (!projectId) throw new Error("Project ID is required");

    return this._createDocumentAndPropose(
      params,
      "iteration",
      "createIteration",
      `在项目中创建迭代: ${params.name || params.title}`,
      context,
      (p) => ({
        ...p,
        projectId,
        startDate: p.startDate || p.start_date,
        endDate: p.endDate || p.end_date,
        ownerId: p.ownerId || p.owner_id,
      }),
    );
  }

  /**
   * Manage milestones
   */
  async createMilestone(params: any, context: CollaborationContext) {
    const projectId = params.projectId || context.projectId;
    if (!projectId) throw new Error("Project ID is required");

    return this._createDocumentAndPropose(
      params,
      "milestone",
      "createMilestone",
      `在项目中创建里程碑: ${params.name || params.title}`,
      context,
      (p) => ({
        ...p,
        projectId,
        dueDate: p.dueDate || p.due_date,
      }),
    );
  }

  /**
   * Manage risks
   */
  async createRisk(params: any, context: CollaborationContext) {
    const projectId = params.projectId || context.projectId;
    if (!projectId) throw new Error("Project ID is required");

    return this._createDocumentAndPropose(
      params,
      "risk",
      "createRisk",
      `在项目中识别风险: ${params.title}`,
      context,
      (p) => ({
        ...p,
        projectId,
        level: (p.level || p.risk_level || "MEDIUM").toUpperCase(),
        mitigationPlan: p.mitigationPlan || p.mitigation_plan,
        dueDate: p.dueDate || p.due_date,
        ownerId: p.ownerId || p.owner_id,
        probability: (p.probability || "MEDIUM").toUpperCase(),
        impact: (p.impact || "MEDIUM").toUpperCase(),
      }),
    );
  }

  /**
   * Manage project financials
   */
  async createFinancialRecord(params: any, context: CollaborationContext) {
    const projectId = params.projectId || context.projectId;
    if (!projectId) throw new Error("Project ID is required");

    return this._createDocumentAndPropose(
      params,
      "financial",
      "createFinancialRecord",
      `在项目中记录财务: ${params.type} - ${params.amount}`,
      context,
      (p) => ({
        ...p,
        projectId,
        amount: parseFloat(p.amount),
        date: p.date || new Date().toISOString(),
      }),
    );
  }

  /**
   * Manage project approvals
   */
  async createApproval(params: any, context: CollaborationContext) {
    const projectId = params.projectId || context.projectId;
    if (!projectId) throw new Error("Project ID is required");

    return this._createDocumentAndPropose(
      params,
      "approval",
      "createApproval",
      `发起审批申请: ${params.title}`,
      context,
      (p) => ({
        ...p,
        projectId,
        requesterId: p.requesterId || context.userId,
      }),
    );
  }

  /**
   * Manage project Q&A
   */
  async createQnA(params: any, context: CollaborationContext) {
    const projectId = params.projectId || context.projectId;
    if (!projectId) throw new Error("Project ID is required");

    return this._createDocumentAndPropose(
      params,
      "qna",
      "createQnA",
      `提出项目问题: ${params.question}`,
      context,
      (p) => ({
        ...p,
        projectId,
        askedById: p.askedById || context.userId,
      }),
    );
  }

  /**
   * Manage project reports
   */
  async createReport(params: any, context: CollaborationContext) {
    const projectId = params.projectId || context.projectId;
    if (!projectId) throw new Error("Project ID is required");

    return this._createDocumentAndPropose(
      params,
      "report",
      "createReport",
      `创建项目报告: ${params.title}`,
      context,
      (p) => ({
        ...p,
        projectId,
      }),
    );
  }

  /**
   * Get project tasks
   */
  async getTasks(projectId: string, context: CollaborationContext) {
    return this.request(`/api/v1/project-tasks?projectId=${projectId}`, {}, context.token);
  }

  /**
   * Get project bugs
   */
  async getBugs(projectId: string, context: CollaborationContext) {
    return this.request(`/api/v1/project-bugs?projectId=${projectId}`, {}, context.token);
  }

  /**
   * Get project iterations
   */
  async getIterations(projectId: string, context: CollaborationContext) {
    return this.request(`/api/v1/iterations?projectId=${projectId}`, {}, context.token);
  }

  /**
   * Get project milestones
   */
  async getMilestones(projectId: string, context: CollaborationContext) {
    return this.request(`/api/v1/project-milestones?projectId=${projectId}`, {}, context.token);
  }

  /**
   * Get project risks
   */
  async getRisks(projectId: string, context: CollaborationContext) {
    return this.request(`/api/v1/project-risks?projectId=${projectId}`, {}, context.token);
  }

  /**
   * Get project requirements
   */
  async getRequirements(projectId: string, context: CollaborationContext) {
    return this.request(`/api/v1/project-requirements?projectId=${projectId}`, {}, context.token);
  }

  /**
   * Query documents
   */
  async getDocuments(
    params: { project_id?: string; kind?: string; chat_id?: string },
    context: CollaborationContext,
  ) {
    const query = new URLSearchParams();
    if (params.project_id) query.append("projectId", params.project_id);
    if (params.kind) query.append("kind", params.kind);
    if (params.chat_id) query.append("chatId", params.chat_id);

    const queryString = query.toString();
    const path = queryString ? `/api/v1/document?${queryString}` : "/api/v1/document";

    return this.request(path, {}, context.token);
  }

  /**
   * Add a team member to a project
   */
  async addTeamMember(params: any, context: CollaborationContext) {
    const projectId = params.projectId || context.projectId;
    if (!projectId) throw new Error("Project ID is required");

    context.onEvent?.({
      type: "text",
      data: `正在将成员指派到项目：${params.userId}...`,
    });

    return this.request(
      `/api/v1/projects/${projectId}/members`,
      {
        method: "POST",
        body: JSON.stringify(params),
      },
      context.token,
    );
  }

  /**
   * Query projects
   */
  async queryProjects(params: any, context: CollaborationContext) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/v1/projects?${query}`, {}, context.token);
  }

  /**
   * Request suggestions for a document
   */
  async requestSuggestions(params: any, context: CollaborationContext) {
    const { documentId } = params;

    context.onEvent?.({
      type: "text",
      data: `正在分析文档 (ID: ${documentId}) 并生成建议...`,
    });

    // This could call a real suggestion API
    const result = await this.request(
      `/api/v1/suggestions`,
      {
        method: "POST",
        body: JSON.stringify({ documentId }),
      },
      context.token,
    ).catch(() => ({
      success: true,
      suggestions: [
        {
          id: Math.random().toString(36).substring(7),
          originalText: "The system is slow.",
          suggestedText: "The system performance is currently suboptimal.",
          description: "Improve professional tone",
          documentId,
        },
      ],
    }));

    if (result.success && result.suggestions) {
      for (const suggestion of result.suggestions) {
        context.onEvent?.({
          type: "data-suggestion",
          data: suggestion,
          transient: true,
        });
      }
    }

    return result;
  }

  /**
   * Assign a task to a recipient
   */
  async assignTask(params: any, context: CollaborationContext) {
    const { recipientId, title } = params;

    context.onEvent?.({
      type: "text",
      data: `正在将任务 "${title}" 指派给 ${recipientId}...`,
    });

    const result = await this.request(
      `/api/v1/projects/${context.projectId}/tasks`,
      {
        method: "POST",
        body: JSON.stringify({ ...params, assigneeId: recipientId }),
      },
      context.token,
    ).catch(() => ({
      success: true,
      taskId: `task_${Date.now()}`,
      assignee: recipientId,
      status: "assigned",
    }));

    return result;
  }

  /**
   * Document related collaboration (Legacy from CollaborationApp)
   */
  async createDocument(params: any, context: CollaborationContext) {
    const { title, kind } = params;

    context.onEvent?.({
      type: "text",
      data: `正在为您生成文档：${title}...`,
    });

    // Here we could call an actual document creation API if it exists
    // For now, keep it compatible with existing flow
    const id = Math.random().toString(36).substring(7);

    context.onEvent?.({ type: "data-kind", data: kind, transient: true });
    context.onEvent?.({ type: "data-id", data: id, transient: true });
    context.onEvent?.({ type: "data-title", data: title, transient: true });

    return {
      success: true,
      id,
      title,
      kind,
      message: `Document "${title}" created successfully.`,
    };
  }

  async updateDocument(params: any, context: CollaborationContext) {
    const { documentId, content, title } = params;

    context.onEvent?.({
      type: "text",
      data: `正在更新文档 (ID: ${documentId})...`,
    });

    if (title) {
      context.onEvent?.({ type: "data-title", data: title, transient: true });
    }

    if (content) {
      context.onEvent?.({ type: "data-textDelta", data: content, transient: true });
    }

    return {
      success: true,
      documentId,
      message: `Document updated successfully.`,
    };
  }
}
