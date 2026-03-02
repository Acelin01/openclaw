import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "./project-requirement/element";
import "./project-requirement/list-element";
import "./testcase/element";
import "./iteration/overview-element";
import "./iteration/list-element";
import "./iteration/workitems-element";
import "./iteration/create-element";
import "./iteration/plan-element";
import "./milestone/list-element";
import "./milestone/detail-element";
import "./milestone/create-element";
import "./project/list-element";
import "./project/detail-element";
import "./project/create-element";
import "./requirement/list-element";
import "./requirement/detail-element";
import "./requirement/create-element";
import "./task/list-element";
import "./task/detail-element";
import "./task/create-element";
import "./defect/list-element";
import "./defect/detail-element";
import "./defect/create-element";
import type { ProjectRequirementArtifactContent } from "./project-requirement/element";
import type { TestCaseContent } from "./testcase/element";
import type { RequirementListItem } from "./project-requirement/list-element";
import type { IterationOverview } from "./iteration/overview-element";
import type { IterationListItem } from "./iteration/list-element";
import type { WorkItem } from "./iteration/workitems-element";
import type { IterationCreateData } from "./iteration/create-element";
import type { IterationPlanData } from "./iteration/plan-element";
import type { Milestone, MilestoneListContent } from "./milestone/list-element";
import type { MilestoneDetailContent } from "./milestone/detail-element";
import type { MilestoneCreateData } from "./milestone/create-element";
import type { Project, ProjectListContent } from "./project/list-element";
import type { ProjectDetailContent } from "./project/detail-element";
import type { ProjectCreateData } from "./project/create-element";
import type { Requirement, RequirementListContent } from "./requirement/list-element";
import type { RequirementDetailContent } from "./requirement/detail-element";
import type { RequirementCreateData } from "./requirement/create-element";
import type { Task, TaskListContent } from "./task/list-element";
import type { TaskDetailContent } from "./task/detail-element";
import type { TaskCreateData } from "./task/create-element";
import type { Defect, DefectListContent } from "./defect/list-element";
import type { DefectDetailContent } from "./defect/detail-element";
import type { DefectCreateData } from "./defect/create-element";

export type ArtifactKind = 
  | "project-requirement" 
  | "project-requirement-list" 
  | "testcase" 
  | "iteration-overview"
  | "iteration-list"
  | "iteration-workitems"
  | "iteration-create"
  | "iteration-plan"
  | "milestone-list"
  | "milestone-detail"
  | "milestone-create"
  | "project-list"
  | "project-detail"
  | "project-create"
  | "requirement-list"
  | "requirement-detail"
  | "requirement-create"
  | "task-list"
  | "task-detail"
  | "task-create"
  | "defect-list"
  | "defect-detail"
  | "defect-create"
  | string;

export interface ArtifactContent {
  kind: ArtifactKind;
  data: unknown;
}

@customElement("chatlite-artifact-viewer")
export class ArtifactViewer extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      overflow: auto;
      padding: 16px;
      background: #f3f4f6;
    }

    .empty {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #9ca3af;
      font-size: 0.875rem;
    }
  `;

  @property({ type: Object })
  content: ArtifactContent | null = null;

  @property({ type: Boolean })
  editable = false;

  @state()
  private error: string | null = null;

  render() {
    if (!this.content) {
      return html`<div class="empty">选择一个 artifact 查看</div>`;
    }

    if (this.error) {
      return html`<div class="empty" style="color: #ef4444;">${this.error}</div>`;
    }

    switch (this.content.kind) {
      case "project-requirement":
        return this._renderProjectRequirement();
      case "project-requirement-list":
        return this._renderRequirementList();
      case "testcase":
        return this._renderTestCase();
      case "iteration-overview":
        return this._renderIterationOverview();
      case "iteration-list":
        return this._renderIterationList();
      case "iteration-workitems":
        return this._renderIterationWorkitems();
      case "iteration-create":
        return this._renderIterationCreate();
      case "iteration-plan":
        return this._renderIterationPlan();
      case "milestone-list":
        return this._renderMilestoneList();
      case "milestone-detail":
        return this._renderMilestoneDetail();
      case "milestone-create":
        return this._renderMilestoneCreate();
      case "project-list":
        return this._renderProjectList();
      case "project-detail":
        return this._renderProjectDetail();
      case "project-create":
        return this._renderProjectCreate();
      case "requirement-list":
        return this._renderRequirementList();
      case "requirement-detail":
        return this._renderRequirementDetail();
      case "requirement-create":
        return this._renderRequirementCreate();
      case "task-list":
        return this._renderTaskList();
      case "task-detail":
        return this._renderTaskDetail();
      case "task-create":
        return this._renderTaskCreate();
      case "defect-list":
        return this._renderDefectList();
      case "defect-detail":
        return this._renderDefectDetail();
      case "defect-create":
        return this._renderDefectCreate();
      default:
        return html`<div class="empty">未知 artifact 类型：${this.content.kind}</div>`;
    }
  }

  private _renderProjectRequirement() {
    if (!this.content) return html``;
    const data = this.content.data as Partial<ProjectRequirementArtifactContent>;

    return html`
      <chatlite-project-requirement
        .content=${{
          kind: "project-requirement",
          requirement: data.requirement || {
            id: "",
            title: "未命名需求",
            description: "",
            status: "draft",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
          editable: this.editable,
        }}
      ></chatlite-project-requirement>
    `;
  }

  private _renderTestCase() {
    if (!this.content) return html``;
    const data = this.content.data as Partial<TestCaseContent>;

    return html`
      <chatlite-testcase
        .content=${{
          id: data.id,
          title: data.title || "未命名测试用例",
          description: data.description,
          type: data.type || "FUNCTIONAL",
          priority: data.priority || "MEDIUM",
          projectId: data.projectId,
          precondition: data.precondition,
          steps: data.steps,
          expectedResult: data.expectedResult,
          tags: data.tags,
          status: data.status || "DRAFT",
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        }}
      ></chatlite-testcase>
    `;
  }

  private _renderRequirementList() {
    if (!this.content) return html``;
    const data = this.content.data as { 
      requirements?: RequirementListItem[];
      title?: string;
    };

    return html`
      <chatlite-requirement-list
        .requirements=${data.requirements || []}
        .title=${data.title || "全部需求"}
      ></chatlite-requirement-list>
    `;
  }

  private _renderIterationOverview() {
    if (!this.content) return html``;
    const data = this.content.data as { overview?: IterationOverview };

    return html`
      <chatlite-iteration-overview
        .overview=${data.overview || null}
      ></chatlite-iteration-overview>
    `;
  }

  private _renderIterationList() {
    if (!this.content) return html``;
    const data = this.content.data as { 
      iterations?: IterationListItem[];
      selectedId?: string;
      showActions?: boolean;
    };

    return html`
      <chatlite-iteration-list
        .iterations=${data.iterations || []}
        .selectedId=${data.selectedId || null}
        .showActions=${data.showActions !== false}
      ></chatlite-iteration-list>
    `;
  }

  private _renderIterationWorkitems() {
    if (!this.content) return html``;
    const data = this.content.data as { 
      workitems?: WorkItem[];
      viewMode?: 'list' | 'tree' | 'board' | 'gantt';
    };

    return html`
      <chatlite-iteration-workitems
        .workitems=${data.workitems || []}
        .viewMode=${data.viewMode || 'list'}
      ></chatlite-iteration-workitems>
    `;
  }

  private _renderIterationCreate() {
    if (!this.content) return html``;
    const data = this.content.data as { 
      projectId?: string;
    };

    return html`
      <chatlite-iteration-create
        .projectId=${data.projectId || ''}
      ></chatlite-iteration-create>
    `;
  }

  private _renderIterationPlan() {
    if (!this.content) return html``;
    const data = this.content.data as { 
      iterationId: string;
      availableWorkitems?: WorkItem[];
      assignedWorkitems?: WorkItem[];
    };

    return html`
      <chatlite-iteration-plan
        .iterationId=${data.iterationId}
        .availableWorkitems=${data.availableWorkitems || []}
        .assignedWorkitems=${data.assignedWorkitems || []}
      ></chatlite-iteration-plan>
    `;
  }

  private _renderMilestoneList() {
    if (!this.content) return html``;
    const data = this.content.data as Partial<MilestoneListContent>;

    return html`
      <chatlite-milestone-list
        .content=${{
          kind: "milestone-list",
          milestones: data.milestones || [],
          projectId: data.projectId,
          title: data.title || "里程碑"
        }}
        .editable=${this.editable}
      ></chatlite-milestone-list>
    `;
  }

  private _renderMilestoneDetail() {
    if (!this.content) return html``;
    const data = this.content.data as Partial<MilestoneDetailContent>;

    return html`
      <chatlite-milestone-detail
        .content=${{
          kind: "milestone-detail",
          milestone: data.milestone || {
            id: "",
            title: "未命名里程碑",
            status: "notstarted",
            dueDate: new Date().toISOString().split('T')[0]
          }
        }}
      ></chatlite-milestone-detail>
    `;
  }

  private _renderMilestoneCreate() {
    if (!this.content) return html``;
    const data = this.content.data as { projectId?: string };

    return html`
      <chatlite-milestone-create
        .projectId=${data.projectId || ''}
      ></chatlite-milestone-create>
    `;
  }

  private _renderProjectList() {
    if (!this.content) return html``;
    const data = this.content.data as Partial<ProjectListContent>;

    return html`
      <chatlite-project-list
        .content=${{
          kind: "project-list",
          projects: data.projects || [],
          title: data.title || "项目列表"
        }}
        .editable=${this.editable}
      ></chatlite-project-list>
    `;
  }

  private _renderProjectDetail() {
    if (!this.content) return html``;
    const data = this.content.data as Partial<ProjectDetailContent>;

    return html`
      <chatlite-project-detail
        .content=${{
          kind: "project-detail",
          project: data.project || {
            id: "",
            name: "未命名项目",
            status: "active"
          }
        }}
      ></chatlite-project-detail>
    `;
  }

  private _renderProjectCreate() {
    if (!this.content) return html``;

    return html`
      <chatlite-project-create
      ></chatlite-project-create>
    `;
  }

  private _renderRequirementList() {
    if (!this.content) return html``;
    const data = this.content.data as Partial<RequirementListContent>;

    return html`
      <chatlite-requirement-list
        .content=${{
          kind: "requirement-list",
          requirements: data.requirements || [],
          projectId: data.projectId,
          title: data.title || "需求列表"
        }}
        .editable=${this.editable}
      ></chatlite-requirement-list>
    `;
  }

  private _renderRequirementDetail() {
    if (!this.content) return html``;
    const data = this.content.data as Partial<RequirementDetailContent>;

    return html`
      <chatlite-requirement-detail
        .content=${{
          kind: "requirement-detail",
          requirement: data.requirement || {
            id: "",
            title: "未命名需求",
            status: "draft",
            priority: "medium"
          }
        }}
      ></chatlite-requirement-detail>
    `;
  }

  private _renderRequirementCreate() {
    if (!this.content) return html``;
    const data = this.content.data as { projectId?: string };

    return html`
      <chatlite-requirement-create
        .projectId=${data.projectId || ''}
      ></chatlite-requirement-create>
    `;
  }

  private _renderTaskList() {
    if (!this.content) return html``;
    const data = this.content.data as Partial<TaskListContent>;

    return html`
      <chatlite-task-list
        .content=${{
          kind: "task-list",
          tasks: data.tasks || [],
          projectId: data.projectId,
          title: data.title || "任务列表"
        }}
        .editable=${this.editable}
      ></chatlite-task-list>
    `;
  }

  private _renderTaskDetail() {
    if (!this.content) return html``;
    const data = this.content.data as Partial<TaskDetailContent>;

    return html`
      <chatlite-task-detail
        .content=${{
          kind: "task-detail",
          task: data.task || {
            id: "",
            title: "未命名任务",
            status: "todo",
            priority: "medium"
          }
        }}
      ></chatlite-task-detail>
    `;
  }

  private _renderTaskCreate() {
    if (!this.content) return html``;
    const data = this.content.data as { projectId?: string; requirementId?: string };

    return html`
      <chatlite-task-create
        .projectId=${data.projectId || ''}
        .requirementId=${data.requirementId || ''}
      ></chatlite-task-create>
    `;
  }

  private _renderDefectList() {
    if (!this.content) return html``;
    const data = this.content.data as Partial<DefectListContent>;

    return html`
      <chatlite-defect-list
        .content=${{
          kind: "defect-list",
          defects: data.defects || [],
          projectId: data.projectId,
          title: data.title || "缺陷列表"
        }}
        .editable=${this.editable}
      ></chatlite-defect-list>
    `;
  }

  private _renderDefectDetail() {
    if (!this.content) return html``;
    const data = this.content.data as Partial<DefectDetailContent>;

    return html`
      <chatlite-defect-detail
        .content=${{
          kind: "defect-detail",
          defect: data.defect || {
            id: "",
            title: "未命名缺陷",
            status: "open",
            severity: "major"
          }
        }}
      ></chatlite-defect-detail>
    `;
  }

  private _renderDefectCreate() {
    if (!this.content) return html``;
    const data = this.content.data as { projectId?: string };

    return html`
      <chatlite-defect-create
        .projectId=${data.projectId || ''}
      ></chatlite-defect-create>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "chatlite-artifact-viewer": ArtifactViewer;
  }
}
