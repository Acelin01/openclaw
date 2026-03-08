import { LitElement, html, css } from "lit";
import type { ProjectRequirement } from "../../client/chat-client";

export interface ProjectRequirementArtifactContent {
  kind: "project-requirement";
  requirement: ProjectRequirement;
  editable?: boolean;
  onSave?: (content: string) => void;
}

// 不使用任何装饰器的纯 Lit 组件
export class ProjectRequirementArtifact extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    .container {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      background: #ffffff;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e5e7eb;
    }

    .title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #111827;
      margin: 0;
    }

    .status {
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .status-draft { background: #f3f4f6; color: #6b7280; }
    .status-pending { background: #fef3c7; color: #d97706; }
    .status-in-progress { background: #dbeafe; color: #2563eb; }
    .status-completed { background: #d1fae5; color: #059669; }
    .status-cancelled { background: #fee2e2; color: #dc2626; }

    .section { margin-bottom: 16px; }

    .section-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: #6b7280;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .description {
      font-size: 0.938rem;
      color: #374151;
      line-height: 1.6;
    }

    .meta {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;
      padding-top: 12px;
      border-top: 1px solid #e5e7eb;
    }

    .meta-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .meta-label {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .meta-value {
      font-size: 0.875rem;
      color: #111827;
      font-weight: 500;
    }

    .priority-high { color: #dc2626; }
    .priority-medium { color: #d97706; }
    .priority-low { color: #2563eb; }
  `;

  // 使用静态 properties 定义（不使用装饰器）
  static properties = {
    requirement: { type: Object },
    editable: { type: Boolean },
    onSave: { attribute: false },
    isEditing: { type: Boolean },
    editContent: { type: String },
  };

  requirement: ProjectRequirement | null = null;
  editable = false;
  onSave?: (content: string) => void;
  private isEditing = false;
  private editContent = "";

  render() {
    if (!this.requirement) {
      return html`<div class="container">暂无数据</div>`;
    }

    const statusClass = `status-${(this.requirement.status || "draft").toLowerCase()}`;
    const statusLabels: Record<string, string> = {
      draft: "草稿",
      pending: "待处理",
      "in-progress": "进行中",
      completed: "已完成",
      cancelled: "已取消",
    };

    const priorityClass = `priority-${(this.requirement.priority || "medium").toLowerCase()}`;
    const priorityLabels: Record<string, string> = {
      low: "低",
      medium: "中",
      high: "高",
    };

    return html`
      <div class="container">
        <div class="header">
          <h2 class="title">${this.requirement.title}</h2>
          <span class="status ${statusClass}">${statusLabels[this.requirement.status || "draft"] || this.requirement.status}</span>
        </div>

        ${this.requirement.description ? html`
          <div class="section">
            <div class="section-title">描述</div>
            <div class="description">${this.requirement.description}</div>
          </div>
        ` : ""}

        <div class="meta">
          <div class="meta-item">
            <span class="meta-label">优先级</span>
            <span class="meta-value ${priorityClass}">${priorityLabels[this.requirement.priority || "medium"] || this.requirement.priority}</span>
          </div>
          ${this.requirement.assigneeId ? html`
            <div class="meta-item">
              <span class="meta-label">负责人</span>
              <span class="meta-value">${this.requirement.assigneeId}</span>
            </div>
          ` : ""}
          <div class="meta-item">
            <span class="meta-label">创建时间</span>
            <span class="meta-value">${this.requirement.createdAt ? new Date(this.requirement.createdAt).toLocaleDateString("zh-CN") : "-"}</span>
          </div>
        </div>
      </div>
    `;
  }
}

// 防止重复注册
if (!customElements.get("chatlite-project-requirement")) {
  customElements.define("chatlite-project-requirement", ProjectRequirementArtifact);
}
