import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

export interface RequirementListItem {
  id: string;
  title: string;
  status: "pending" | "in_progress" | "approved" | "rejected";
  priority?: "low" | "medium" | "high" | "critical";
  assignee?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  creator?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  createdAt: number;
}

@customElement("chatlite-requirement-list")
export class RequirementListArtifact extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', sans-serif;
      background: #f0f2f5;
      padding: 30px 20px;
    }

    .container {
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      overflow: hidden;
      border: 1px solid #e8e8e8;
    }

    .header {
      padding: 20px 24px;
      border-bottom: 1px solid #f0f0f0;
      background: #fafafa;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }

    .header h2 {
      font-size: 18px;
      font-weight: 600;
      color: #1f1f1f;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .header-icon {
      color: #52c41a;
    }

    .header-extra {
      color: #8c8c8c;
      font-size: 13px;
      background: #f5f5f5;
      padding: 4px 12px;
      border-radius: 30px;
      border: 1px solid #e8e8e8;
    }

    .table-responsive {
      overflow-x: auto;
      padding: 0 0 8px 0;
    }

    .req-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
      min-width: 1000px;
      table-layout: auto;
    }

    .req-table th {
      background: #fafafa;
      padding: 14px 16px;
      text-align: left;
      font-weight: 500;
      color: #595959;
      border-bottom: 1px solid #f0f0f0;
      white-space: nowrap;
      font-size: 14px;
    }

    .req-table td {
      padding: 14px 16px;
      border-bottom: 1px solid #f0f0f0;
      white-space: nowrap;
      color: #262626;
      vertical-align: middle;
    }

    .req-table tbody tr:hover {
      background: #fafafa;
      transition: background 0.2s;
    }

    .req-title {
      color: #262626;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      max-width: 280px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 30px;
      font-size: 12px;
      font-weight: 500;
      text-align: center;
      min-width: 64px;
    }

    .status-pending {
      background: #fff7e6;
      color: #d46b08;
      border: 1px solid #ffd591;
    }

    .status-in_progress {
      background: #e6f7ff;
      color: #0958d9;
      border: 1px solid #91caff;
    }

    .status-approved {
      background: #f6ffed;
      color: #389e0d;
      border: 1px solid #b7eb8f;
    }

    .status-rejected {
      background: #fff1f0;
      color: #cf1322;
      border: 1px solid #ffa39e;
    }

    .priority-placeholder {
      color: #bfbfbf;
      font-size: 13px;
      padding: 0 4px;
    }

    .priority-high {
      color: #cf1322;
      font-weight: 500;
    }

    .priority-medium {
      color: #d46b08;
      font-weight: 500;
    }

    .priority-low {
      color: #389e0d;
      font-weight: 500;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .user-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #52c41a;
      color: white;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 500;
      flex-shrink: 0;
      text-transform: uppercase;
      background-color: #389e0d;
    }

    .user-avatar.sm {
      width: 24px;
      height: 24px;
      font-size: 10px;
    }

    .user-email {
      font-size: 13px;
      color: #262626;
      max-width: 160px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .action-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .action-icon {
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      border-radius: 4px;
      cursor: pointer;
      color: #8c8c8c;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      padding: 0;
    }

    .action-icon:hover {
      background: #f5f5f5;
      color: #52c41a;
    }

    .action-icon svg {
      width: 18px;
      height: 18px;
      stroke: currentColor;
      stroke-width: 1.8;
      fill: none;
    }

    .date-text {
      color: #595959;
      font-size: 13px;
    }

    .footer {
      padding: 16px 24px;
      border-top: 1px solid #f0f0f0;
      background: #fafafa;
      font-size: 13px;
      color: #8c8c8c;
      display: flex;
      justify-content: flex-end;
    }

    .empty {
      padding: 60px 20px;
      text-align: center;
      color: #8c8c8c;
      font-size: 14px;
    }

    @media (max-width: 768px) {
      :host {
        padding: 16px 12px;
      }
      .header {
        padding: 16px 20px;
      }
      .req-table th, .req-table td {
        padding: 12px;
      }
    }
  `;

  @property({ type: Array })
  requirements: RequirementListItem[] = [];

  @property({ type: String })
  title: string = "全部需求";

  render() {
    return html`
      <div class="container">
        ${this._renderHeader()}
        ${this._renderTable()}
        ${this._renderFooter()}
      </div>
    `;
  }

  private _renderHeader() {
    return html`
      <div class="header">
        <h2>
          <svg class="header-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 6H17M3 10H13M3 14H9" stroke="#52c41a" stroke-width="1.8" stroke-linecap="round"/>
            <circle cx="16" cy="14" r="2" stroke="#52c41a" stroke-width="1.8"/>
          </svg>
          ${this.title}
        </h2>
        <span class="header-extra">${this.requirements.length} 条记录</span>
      </div>
    `;
  }

  private _renderTable() {
    if (this.requirements.length === 0) {
      return html`<div class="empty">暂无需求数据</div>`;
    }

    return html`
      <div class="table-responsive">
        <table class="req-table">
          <thead>
            <tr>
              <th>标题</th>
              <th>状态</th>
              <th>优先级</th>
              <th>负责人</th>
              <th>创建者</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${this.requirements.map(req => this._renderRow(req))}
          </tbody>
        </table>
      </div>
    `;
  }

  private _renderRow(req: RequirementListItem) {
    const statusClass = `status-${req.status}`;
    const statusText = {
      pending: "待处理",
      in_progress: "进行中",
      approved: "已通过",
      rejected: "已拒绝"
    }[req.status];

    const priorityText = req.priority ? 
      { low: "低", medium: "中", high: "高", critical: "紧急" }[req.priority] : "—";
    const priorityClass = req.priority ? `priority-${req.priority}` : "priority-placeholder";

    const assigneeInitials = req.assignee?.name ? 
      req.assignee.name.slice(0, 2).toUpperCase() : "—";
    const creatorInitials = req.creator?.name ? 
      req.creator.name.slice(0, 2).toUpperCase() : "—";

    const dateStr = new Date(req.createdAt).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });

    return html`
      <tr>
        <td>
          <span class="req-title" title="${req.title}">${req.title}</span>
        </td>
        <td>
          <span class="status-badge ${statusClass}">${statusText}</span>
        </td>
        <td>
          <span class="${priorityClass}">${priorityText}</span>
        </td>
        <td>
          <div class="user-info">
            <span class="user-avatar sm">${assigneeInitials}</span>
            <span class="user-email" title="${req.assignee?.email || '—'}">
              ${req.assignee?.email || '—'}
            </span>
          </div>
        </td>
        <td>
          <div class="user-info">
            <span class="user-avatar sm">${creatorInitials}</span>
            <span class="user-email" title="${req.creator?.email || '—'}">
              ${req.creator?.email || '—'}
            </span>
          </div>
        </td>
        <td>
          <span class="date-text">${dateStr}</span>
        </td>
        <td>
          <div class="action-group">
            <button class="action-icon" title="编辑" @click=${() => this._handleEdit(req)}>
              <svg viewBox="0 0 20 20">
                <path d="M15 3L17 5L8 14H6V12L15 3Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
                <path d="M13 5L15 7" stroke="currentColor" stroke-width="1.5"/>
              </svg>
            </button>
            <button class="action-icon" title="删除" @click=${() => this._handleDelete(req)}>
              <svg viewBox="0 0 20 20">
                <path d="M5 7H15M7 7V15H13V7M8 4H12V7H8V4Z" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  private _renderFooter() {
    return html`
      <div class="footer">
        <span>© 体验分析 · 需求列表</span>
      </div>
    `;
  }

  private _handleEdit(req: RequirementListItem) {
    this.dispatchEvent(new CustomEvent("requirement-edit", {
      detail: { requirement: req },
      bubbles: true,
      composed: true
    }));
  }

  private _handleDelete(req: RequirementListItem) {
    if (confirm(`确定删除需求"${req.title}"？`)) {
      this.dispatchEvent(new CustomEvent("requirement-delete", {
        detail: { requirement: req },
        bubbles: true,
        composed: true
      }));
    }
  }
}
