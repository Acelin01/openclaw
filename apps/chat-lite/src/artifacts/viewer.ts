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
import type { ProjectRequirementArtifactContent } from "./project-requirement/element";
import type { TestCaseContent } from "./testcase/element";
import type { RequirementListItem } from "./project-requirement/list-element";
import type { IterationOverview } from "./iteration/overview-element";
import type { IterationListItem } from "./iteration/list-element";
import type { WorkItem } from "./iteration/workitems-element";
import type { IterationCreateData } from "./iteration/create-element";
import type { IterationPlanData } from "./iteration/plan-element";

export type ArtifactKind = 
  | "project-requirement" 
  | "project-requirement-list" 
  | "testcase" 
  | "iteration-overview"
  | "iteration-list"
  | "iteration-workitems"
  | "iteration-create"
  | "iteration-plan"
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
}

declare global {
  interface HTMLElementTagNameMap {
    "chatlite-artifact-viewer": ArtifactViewer;
  }
}
