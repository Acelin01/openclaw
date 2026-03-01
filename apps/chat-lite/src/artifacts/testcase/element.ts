import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

export interface TestCaseStep {
  step: string;
  action: string;
  expected: string;
}

export interface TestCaseContent {
  id?: string;
  title: string;
  description?: string;
  type: "FUNCTIONAL" | "INTEGRATION" | "PERFORMANCE" | "SECURITY" | "REGRESSION" | "ACCEPTANCE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  projectId?: string;
  precondition?: string;
  steps?: TestCaseStep[];
  expectedResult?: string;
  tags?: string[];
  status?: "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "ARCHIVED";
  createdAt?: number;
  updatedAt?: number;
}

@customElement("chatlite-testcase")
export class TestCaseArtifact extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }

    .container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .header {
      padding: 20px 24px;
      border-bottom: 1px solid #e5e7eb;
    }

    .title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #111827;
      margin-bottom: 8px;
    }

    .description {
      font-size: 0.875rem;
      color: #6b7280;
      line-height: 1.5;
    }

    .meta {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      padding: 12px 24px;
      background: #f9fafb;
    }

    .tag {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .tag-type { background: #dbeafe; color: #1e40af; }
    .tag-priority-low { background: #f3f4f6; color: #374151; }
    .tag-priority-medium { background: #dbeafe; color: #1e40af; }
    .tag-priority-high { background: #fed7aa; color: #92400e; }
    .tag-priority-critical { background: #fecaca; color: #991b1b; }
    .tag-status-draft { background: #f3f4f6; color: #6b7280; }
    .tag-status-pending { background: #fef3c7; color: #92400e; }
    .tag-status-approved { background: #d1fae5; color: #065f46; }
    .tag-status-rejected { background: #fecaca; color: #991b1b; }

    .section {
      padding: 16px 24px;
      border-bottom: 1px solid #e5e7eb;
    }

    .section-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .precondition {
      background: #fef3c7;
      border-left: 3px solid #f59e0b;
      padding: 12px 16px;
      border-radius: 6px;
      font-size: 0.875rem;
      color: #92400e;
    }

    .steps-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
    }

    .steps-table th {
      background: #f9fafb;
      padding: 10px 12px;
      text-align: left;
      font-weight: 600;
      color: #6b7280;
      border-bottom: 1px solid #e5e7eb;
    }

    .steps-table td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
      color: #374151;
    }

    .steps-table tr:last-child td {
      border-bottom: none;
    }

    .expected-result {
      background: #d1fae5;
      border-left: 3px solid #10b981;
      padding: 12px 16px;
      border-radius: 6px;
      font-size: 0.875rem;
      color: #065f46;
    }

    .tags-list {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .tag-item {
      background: #f3f4f6;
      color: #6b7280;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.75rem;
    }

    .empty {
      color: #9ca3af;
      font-size: 0.875rem;
      text-align: center;
      padding: 20px;
    }
  `;

  @property({ type: Object })
  content: TestCaseContent | null = null;

  render() {
    if (!this.content) {
      return html`<div class="empty">暂无测试用例内容</div>`;
    }

    return html`
      <div class="container">
        ${this._renderHeader()}
        ${this._renderMeta()}
        ${this._renderPrecondition()}
        ${this._renderSteps()}
        ${this._renderExpectedResult()}
        ${this._renderTags()}
      </div>
    `;
  }

  private _renderHeader() {
    return html`
      <div class="header">
        <div class="title">${this.content?.title || "未命名测试用例"}</div>
        ${this.content?.description ? html`<div class="description">${this.content.description}</div>` : ""}
      </div>
    `;
  }

  private _renderMeta() {
    const type = this.content?.type || "FUNCTIONAL";
    const priority = this.content?.priority || "MEDIUM";
    const status = this.content?.status || "DRAFT";

    return html`
      <div class="meta">
        <span class="tag tag-type">${type}</span>
        <span class="tag tag-priority-${priority.toLowerCase()}">${priority}</span>
        <span class="tag tag-status-${status.toLowerCase()}">${status}</span>
      </div>
    `;
  }

  private _renderPrecondition() {
    if (!this.content?.precondition) return html``;

    return html`
      <div class="section">
        <div class="section-title">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.2"/>
            <path d="M8 5v3l2 2" stroke="currentColor" stroke-width="1.2"/>
          </svg>
          前置条件
        </div>
        <div class="precondition">${this.content.precondition}</div>
      </div>
    `;
  }

  private _renderSteps() {
    const steps = this.content?.steps || [];
    if (steps.length === 0) return html``;

    return html`
      <div class="section">
        <div class="section-title">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          测试步骤
        </div>
        <table class="steps-table">
          <thead>
            <tr>
              <th width="60">步骤</th>
              <th>操作</th>
              <th>预期结果</th>
            </tr>
          </thead>
          <tbody>
            ${steps.map((step, index) => html`
              <tr>
                <td>${step.step || index + 1}</td>
                <td>${step.action}</td>
                <td>${step.expected}</td>
              </tr>
            `)}
          </tbody>
        </table>
      </div>
    `;
  }

  private _renderExpectedResult() {
    if (!this.content?.expectedResult) return html``;

    return html`
      <div class="section">
        <div class="section-title">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M14 4L6 12l-4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          预期结果
        </div>
        <div class="expected-result">${this.content.expectedResult}</div>
      </div>
    `;
  }

  private _renderTags() {
    const tags = this.content?.tags || [];
    if (tags.length === 0) return html``;

    return html`
      <div class="section">
        <div class="section-title">标签</div>
        <div class="tags-list">
          ${tags.map(tag => html`<span class="tag-item">${tag}</span>`)}
        </div>
      </div>
    `;
  }
}
