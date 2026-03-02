import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  owner?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  startDate?: string;
  endDate?: string;
  budget?: number;
  progress?: number;
  memberCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectListContent {
  kind: "project-list";
  projects: Project[];
  title?: string;
}

@customElement("chatlite-project-list")
export class ChatliteProjectList extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
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

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .card-header h2 {
      font-size: 18px;
      font-weight: 600;
      color: #1f1f1f;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .card-header h2 svg {
      color: #2563eb;
    }

    .btn-primary {
      background: #2563eb;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
    }

    .btn-primary:hover {
      background: #3b82f6;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(37, 99, 235, 0.3);
    }

    .table-responsive {
      overflow-x: auto;
      padding: 0 0 8px 0;
    }

    .project-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }

    .project-table th {
      background: #fafafa;
      padding: 14px 16px;
      text-align: left;
      font-weight: 500;
      color: #595959;
      border-bottom: 1px solid #f0f0f0;
      white-space: nowrap;
    }

    .project-table td {
      padding: 14px 16px;
      border-bottom: 1px solid #f0f0f0;
      color: #262626;
      vertical-align: middle;
    }

    .project-table tbody tr:hover {
      background: #fafafa;
      transition: background 0.2s;
    }

    .project-name {
      font-weight: 500;
      color: #262626;
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
      min-width: 70px;
    }

    .status-active {
      background: #f6ffed;
      color: #52c41a;
      border: 1px solid #b7eb8f;
    }

    .status-pending {
      background: #fff7e6;
      color: #d46b08;
      border: 1px solid #ffd591;
    }

    .status-completed {
      background: #e6f7ff;
      color: #1890ff;
      border: 1px solid #91d5ff;
    }

    .status-archived {
      background: #f5f5f5;
      color: #8c8c8c;
      border: 1px solid #d9d9d9;
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
      background: #2563eb;
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
      max-width: 160px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .date-text {
      color: #595959;
      font-size: 13px;
    }

    .progress-bar {
      width: 100%;
      height: 6px;
      background: #f5f5f5;
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: #2563eb;
      border-radius: 3px;
      transition: width 0.3s;
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
      color: #2563eb;
    }

    .card-footer {
      padding: 16px 24px;
      border-top: 1px solid #f0f0f0;
      background: #fafafa;
      font-size: 13px;
      color: #8c8c8c;
      display: flex;
      justify-content: flex-end;
    }

    .empty-state {
      padding: 60px 24px;
      text-align: center;
      color: #8c8c8c;
    }

    .empty-state svg {
      margin-bottom: 16px;
      opacity: 0.5;
    }
  `;

  @property({ type: Object })
  content: ProjectListContent | null = null;

  @property({ type: Boolean })
  editable = false;

  private getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      'active': 'status-active',
      'pending': 'status-pending',
      'completed': 'status-completed',
      'archived': 'status-archived'
    };
    return statusMap[status] || 'status-pending';
  }

  private getStatusText(status: string): string {
    const textMap: Record<string, string> = {
      'active': '进行中',
      'pending': '待开始',
      'completed': '已完成',
      'archived': '已归档'
    };
    return textMap[status] || '待开始';
  }

  private getInitials(email: string): string {
    return email.charAt(0).toUpperCase();
  }

  render() {
    if (!this.content || !this.content.projects || this.content.projects.length === 0) {
      return html`
        <div class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M3 7V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V7" stroke-linecap="round"/>
            <path d="M3 7V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V7" stroke-linecap="round"/>
            <path d="M3 7H21" stroke-linecap="round"/>
            <path d="M9 12H15" stroke-linecap="round"/>
          </svg>
          <p>暂无项目数据</p>
        </div>
      `;
    }

    const projects = this.content.projects;

    return html`
      <div class="project-list">
        <div class="card-header">
          <div class="header-left">
            <h2>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 4H16V16H4V4Z" stroke="#2563eb" stroke-width="1.8" stroke-linejoin="round"/>
                <circle cx="10" cy="10" r="2" fill="#2563eb"/>
                <path d="M4 8H16M4 12H16" stroke="#2563eb" stroke-width="1.8"/>
              </svg>
              ${this.content.title || '项目列表'}
            </h2>
          </div>
          ${this.editable ? html`
            <button class="btn-primary" @click=${this._handleCreate}>
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M8 2V14M2 8H14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
              新建项目
            </button>
          ` : ''}
        </div>

        <div class="table-responsive">
          <table class="project-table">
            <thead>
              <tr>
                <th>项目名称</th>
                <th>负责人</th>
                <th>状态</th>
                <th>进度</th>
                <th>结束日期</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              ${projects.map((project) => {
                return html`
                  <tr>
                    <td>
                      <span class="project-name" title="${project.name}">
                        ${project.name}
                      </span>
                    </td>
                    <td>
                      ${project.owner ? html`
                        <div class="user-info">
                          <span class="user-avatar">${this.getInitials(project.owner.email)}</span>
                          <span class="user-email">${project.owner.email}</span>
                        </div>
                      ` : html`<span style="color:#8c8c8c;">未分配</span>`}
                    </td>
                    <td>
                      <span class="status-badge ${this.getStatusClass(project.status)}">
                        ${this.getStatusText(project.status)}
                      </span>
                    </td>
                    <td>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <div class="progress-bar">
                          <div class="progress-fill" style="width: ${project.progress || 0}%"></div>
                        </div>
                        <span style="font-size: 12px; color: #8c8c8c;">${project.progress || 0}%</span>
                      </div>
                    </td>
                    <td>
                      <span class="date-text">${project.endDate || '-'}</span>
                    </td>
                    <td>
                      ${this.editable ? html`
                        <div class="action-group">
                          <button class="action-icon" title="查看" @click=${() => this._handleView(project)}>
                            <svg viewBox="0 0 20 20" width="18" height="18">
                              <path d="M10 12C13.3137 12 16 9.31371 16 6C16 2.68629 13.3137 0 10 0C6.68629 0 4 2.68629 4 6C4 9.31371 6.68629 12 10 12Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
                              <circle cx="10" cy="6" r="2" stroke="currentColor" stroke-width="1.5"/>
                            </svg>
                          </button>
                          <button class="action-icon" title="编辑" @click=${() => this._handleEdit(project)}>
                            <svg viewBox="0 0 20 20" width="18" height="18">
                              <path d="M15 3L17 5L8 14H6V12L15 3Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
                              <path d="M13 5L15 7" stroke="currentColor" stroke-width="1.5"/>
                            </svg>
                          </button>
                        </div>
                      ` : ''}
                    </td>
                  </tr>
                `;
              })}
            </tbody>
          </table>
        </div>

        <div class="card-footer">
          <span>共 ${projects.length} 个项目</span>
        </div>
      </div>
    `;
  }

  private _handleCreate() {
    this.dispatchEvent(new CustomEvent('project-create', {
      bubbles: true,
      detail: {}
    }));
  }

  private _handleView(project: Project) {
    this.dispatchEvent(new CustomEvent('project-view', {
      bubbles: true,
      detail: { project }
    }));
  }

  private _handleEdit(project: Project) {
    this.dispatchEvent(new CustomEvent('project-edit', {
      bubbles: true,
      detail: { project }
    }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "chatlite-project-list": ChatliteProjectList;
  }
}
