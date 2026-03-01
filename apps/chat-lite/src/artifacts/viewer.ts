import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "./project-requirement/element";
import "./project-requirement/list-element";
import "./testcase/element";
import type { ProjectRequirementArtifactContent } from "./project-requirement/element";
import type { TestCaseContent } from "./testcase/element";
import type { RequirementListItem } from "./project-requirement/list-element";

export type ArtifactKind = "project-requirement" | "project-requirement-list" | "testcase" | string;

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
}

declare global {
  interface HTMLElementTagNameMap {
    "chatlite-artifact-viewer": ArtifactViewer;
  }
}
