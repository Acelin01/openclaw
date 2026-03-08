import { LitElement, html, css } from "lit";

export interface Requirement {
  id: string;
  title: string;
  description?: string;
  status: "draft" | "review" | "approved" | "in_progress" | "completed" | "rejected" | "pending";
  priority: "low" | "medium" | "high" | "critical";
  assignee?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  reporter?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  projectId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RequirementListContent {
  kind: "requirement-list";
  requirements: Requirement[];
  projectId?: string;
  title?: string;
}

// 不使用装饰器的标准 Lit 组件
export class ChatliteRequirementList extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
      background: #f0f2f5;
      padding: 30px 20px;
    }

    .demand-card {
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      overflow: hidden;
      border: 1px solid #e8e8e8;
    }

    .card-header {
      padding: 20px 24px;
      border-bottom: 1px solid #f0f0f0;
      background: #fafafa;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }

    .card-header h2 {
      font-size: 18px;
      font-weight: 600;
      color: #1f1f1f;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .card-header h2 svg {
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

    .requirement-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
      min-width: 1000px;
      table-layout: auto;
    }

    .requirement-table th {
      background: #fafafa;
      padding: 14px 16px;
      text-align: left;
      font-weight: 500;
      color: #595959;
      border-bottom: 1px solid #f0f0f0;
      white-space: nowrap;
      font-size: 14px;
    }

    .requirement-table td {
      padding: 14px 16px;
      border-bottom: 1px solid #f0f0f0;
      white-space: nowrap;
      color: #262626;
      vertical-align: middle;
    }

    .requirement-table tbody tr:hover {
      background: #fafafa;
      transition: background 0.2s;
    }

    .requirement-title {
      color: #262626;
      font-weight: 500;
      cursor: default;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      max-width: 280px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .requirement-title:hover {
      color: #52c41a;
      text-decoration: underline;
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

    .status-pending, .status-draft {
      background: #fff7e6;
      color: #d46b08;
      border: 1px solid #ffd591;
    }

    .status-in_progress, .status-in-progress {
      background: #e6f7ff;
      color: #096dd9;
      border: 1px solid #91d5ff;
    }

    .status-completed, .status-approved {
      background: #f6ffed;
      color: #389e0d;
      border: 1px solid #b7eb8f;
    }

    .status-rejected {
      background: #fff1f0;
      color: #cf1322;
      border: 1px solid #ffa39c;
    }

    .status-review {
      background: #f9f0ff;
      color: #722ed1;
      border: 1px solid #d3adf7;
    }

    .priority-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .priority-critical {
      background: #fff1f0;
      color: #cf1322;
    }

    .priority-high {
      background: #fff7e6;
      color: #d46b08;
    }

    .priority-medium {
      background: #f0f5ff;
      color: #2f54eb;
    }

    .priority-low {
      background: #f6ffed;
      color: #389e0d;
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
    }

    .user-email {
      font-size: 13px;
      color: #262626;
      max-width: 140px;
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
      border: 1px solid #d9d9d9;
      background: white;
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
      border-color: #52c41a;
    }

    .action-icon svg {
      width: 16px;
      height: 16px;
      stroke: currentColor;
      stroke-width: 2;
      fill: none;
    }

    .date-text {
      color: #595959;
      font-size: 13px;
    }

    .empty-state {
      padding: 60px 24px;
      text-align: center;
      color: #8c8c8c;
    }

    .empty-state svg {
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      color: #d9d9d9;
    }

    @media (max-width: 768px) {
      :host {
        padding: 20px 12px;
      }
      .card-header {
        padding: 16px 20px;
      }
      .requirement-table th, .requirement-table td {
        padding: 12px;
      }
    }
  `;

  static properties = {
    requirements: { type: Array },
    title: { type: String },
    projectId: { type: String },
  };

  requirements: Requirement[] = [];
  title = "全部需求";
  projectId?: string;

  private getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      draft: "草稿",
      pending: "待处理",
      review: "审核中",
      approved: "已通过",
      in_progress: "进行中",
      "in-progress": "进行中",
      completed: "已完成",
      rejected: "已拒绝",
    };
    return map[status] || status;
  }

  private getPriorityLabel(priority: string): string {
    const map: Record<string, string> = {
      low: "低",
      medium: "中",
      high: "高",
      critical: "紧急",
    };
    return map[priority] || priority;
  }

  private getUserInitial(email?: string): string {
    if (!email) return "?";
    return email.charAt(0).toUpperCase();
  }

  private formatDate(dateStr?: string): string {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" });
  }

  render() {
    if (!this.requirements || this.requirements.length === 0) {
      return html`
        <div class="demand-card">
          <div class="card-header">
            <h2>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 6H17M3 10H13M3 14H9" stroke="#52c41a" stroke-width="1.8" stroke-linecap="round"/>
                <circle cx="16" cy="14" r="2" stroke="#52c41a" stroke-width="1.8"/>
              </svg>
              ${this.title}
            </h2>
            <span class="header-extra">0 条记录</span>
          </div>
          <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p>暂无需求</p>
          </div>
        </div>
      `;
    }

    return html`
      <div class="demand-card">
        <div class="card-header">
          <h2>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 6H17M3 10H13M3 14H9" stroke="#52c41a" stroke-width="1.8" stroke-linecap="round"/>
              <circle cx="16" cy="14" r="2" stroke="#52c41a" stroke-width="1.8"/>
            </svg>
            ${this.title}
          </h2>
          <span class="header-extra">${this.requirements.length} 条记录</span>
        </div>

        <div class="table-responsive">
          <table class="requirement-table">
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
              ${this.requirements.map(req => html`
                <tr>
                  <td>
                    <span class="requirement-title">${req.title}</span>
                  </td>
                  <td>
                    <span class="status-badge status-${(req.status || 'pending').toLowerCase().replace('_', '-')}">
                      ${this.getStatusLabel(req.status || 'pending')}
                    </span>
                  </td>
                  <td>
                    <span class="priority-badge priority-${(req.priority || 'medium').toLowerCase()}">
                      ${this.getPriorityLabel(req.priority || 'medium')}
                    </span>
                  </td>
                  <td>
                    ${req.assignee?.email ? html`
                      <div class="user-info">
                        <span class="user-avatar">${this.getUserInitial(req.assignee.email)}</span>
                        <span class="user-email">${req.assignee.email}</span>
                      </div>
                    ` : html`<span style="color: #bfbfbf;">—</span>`}
                  </td>
                  <td>
                    ${req.reporter?.email ? html`
                      <div class="user-info">
                        <span class="user-avatar">${this.getUserInitial(req.reporter.email)}</span>
                        <span class="user-email">${req.reporter.email}</span>
                      </div>
                    ` : html`<span style="color: #bfbfbf;">—</span>`}
                  </td>
                  <td>
                    <span class="date-text">${this.formatDate(req.createdAt)}</span>
                  </td>
                  <td>
                    <div class="action-group">
                      <button class="action-icon" title="编辑">
                        <svg viewBox="0 0 24 24">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </button>
                      <button class="action-icon" title="删除">
                        <svg viewBox="0 0 24 24">
                          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              `)}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
}

// 防止重复注册
if (!customElements.get("chatlite-requirement-list")) {
  customElements.define("chatlite-requirement-list", ChatliteRequirementList);
}
