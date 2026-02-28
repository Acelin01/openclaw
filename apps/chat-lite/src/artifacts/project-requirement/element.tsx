import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { ProjectRequirement } from "../../client/chat-client";

export interface ProjectRequirementArtifactContent {
  kind: "project-requirement";
  requirement: ProjectRequirement;
  editable?: boolean;
  onSave?: (content: string) => void;
}

@customElement("chatlite-project-requirement")
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

    .status-draft {
      background: #fef3c7;
      color: #92400e;
    }

    .status-pending_review {
      background: #dbeafe;
      color: #1e40af;
    }

    .status-approved {
      background: #d1fae5;
      color: #065f46;
    }

    .status-rejected {
      background: #fee2e2;
      color: #991b1b;
    }

    .section {
      margin-bottom: 16px;
    }

    .section-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #6b7280;
      margin-bottom: 8px;
    }

    .description {
      font-size: 0.875rem;
      line-height: 1.6;
      color: #374151;
      white-space: pre-wrap;
    }

    .meta {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;
      padding: 12px;
      background: #f9fafb;
      border-radius: 6px;
      font-size: 0.75rem;
      color: #6b7280;
    }

    .meta-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .meta-label {
      font-weight: 500;
      color: #9ca3af;
    }

    .actions {
      display: flex;
      gap: 8px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
    }

    button {
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
      border: none;
    }

    .btn-primary:hover {
      background: #2563eb;
    }

    .btn-secondary {
      background: white;
      color: #374151;
      border: 1px solid #d1d5db;
    }

    .btn-secondary:hover {
      background: #f9fafb;
    }

    textarea {
      width: 100%;
      min-height: 100px;
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 0.875rem;
      font-family: inherit;
      resize: vertical;
    }

    textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
  `;

  @property({ type: Object })
  content: ProjectRequirementArtifactContent | null = null;

  @property({ type: Boolean })
  editable = false;

  @state()
  private isEditing = false;

  @state()
  private editDescription = "";

  render() {
    if (!this.content?.requirement) {
      return html`<div class="container">暂无需求内容</div>`;
    }

    const req = this.content.requirement;
    const statusClass = `status status-${req.status}`;
    const statusText = this._getStatusText(req.status);

    return html`
      <div class="container">
        <div class="header">
          <h2 class="title">${req.title}</h2>
          <span class="${statusClass}">${statusText}</span>
        </div>

        ${this.isEditing && this.editable
          ? html`
              <div class="section">
                <label class="section-label">描述</label>
                <textarea
                  value=${this.editDescription}
                  @input=${this._handleDescriptionInput}
                ></textarea>
              </div>
              <div class="actions">
                <button class="btn-primary" @click=${this._handleSave}>
                  保存
                </button>
                <button class="btn-secondary" @click=${this._handleCancel}>
                  取消
                </button>
              </div>
            `
          : html`
              <div class="section">
                <div class="section-label">描述</div>
                <div class="description">${req.description}</div>
              </div>

              <div class="meta">
                <div class="meta-item">
                  <span class="meta-label">ID</span>
                  <span>${req.id}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">创建时间</span>
                  <span>${this._formatTime(req.createdAt)}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">更新时间</span>
                  <span>${this._formatTime(req.updatedAt)}</span>
                </div>
              </div>

              ${this.editable
                ? html`
                    <div class="actions">
                      <button
                        class="btn-primary"
                        @click=${this._handleEdit}
                      >
                        编辑
                      </button>
                      <button class="btn-secondary">
                        提交审核
                      </button>
                    </div>
                  `
                : html`
                    <div class="meta" style="margin-top: 12px;">
                      <div class="meta-item">
                        <span class="meta-label">Artifact Kind</span>
                        <span>${this.content.kind}</span>
                      </div>
                    </div>
                  `}
            `}
      </div>
    `;
  }

  private _getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      draft: "草稿",
      pending_review: "待审核",
      approved: "已批准",
      rejected: "已拒绝",
    };
    return statusMap[status] || status;
  }

  private _formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleString("zh-CN");
  }

  private _handleEdit() {
    if (this.content?.requirement) {
      this.editDescription = this.content.requirement.description;
      this.isEditing = true;
    }
  }

  private _handleDescriptionInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    this.editDescription = target.value;
  }

  private _handleSave() {
    if (this.content && this.content.onSave) {
      const updated = {
        ...this.content.requirement,
        description: this.editDescription,
        updatedAt: Date.now(),
      };
      this.content.onSave(JSON.stringify(updated, null, 2));
      this.isEditing = false;
    }
  }

  private _handleCancel() {
    this.isEditing = false;
    this.editDescription = "";
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "chatlite-project-requirement": ProjectRequirementArtifact;
  }
}
