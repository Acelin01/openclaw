import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done" | "blocked";
  priority: "low" | "medium" | "high" | "critical";
  progress?: number;
  assignee?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  dueDate?: string;
  projectId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskListContent {
  kind: "task-list";
  tasks: Task[];
  projectId?: string;
  title?: string;
}

@customElement("chatlite-task-list")
export class ChatliteTaskList extends LitElement {
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
      color: #1890ff;
    }

    .btn-primary {
      background: #1890ff;
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
      box-shadow: 0 2px 4px rgba(24, 144, 255, 0.2);
    }

    .btn-primary:hover {
      background: #40a9ff;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(24, 144, 255, 0.3);
    }

    .table-responsive {
      overflow-x: auto;
      padding: 0 0 8px 0;
    }

    .task-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }

    .task-table th {
      background: #fafafa;
      padding: 14px 16px;
      text-align: left;
      font-weight: 500;
      color: #595959;
      border-bottom: 1px solid #f0f0f0;
      white-space: nowrap;
    }

    .task-table td {
      padding: 14px 16px;
      border-bottom: 1px solid #f0f0f0;
      color: #262626;
      vertical-align: middle;
    }

    .task-table tbody tr:hover {
      background: #fafafa;
      transition: background 0.2s;
    }

    .task-title {
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

    .status-todo { background: #f5f5f5; color: #8c8c8c; border: 1px solid #d9d9d9; }
    .status-in_progress { background: #e6f7ff; color: #1890ff; border: 1px solid #91d5ff; }
    .status-done { background: #f6ffed; color: #52c41a; border: 1px solid #b7eb8f; }
    .status-blocked { background: #fff1f0; color: #cf1322; border: 1px solid #ffa39e; }

    .priority-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
    }

    .priority-low { background: #f6ffed; color: #389e0d; }
    .priority-medium { background: #fff7e6; color: #d46b08; }
    .priority-high { background: #fff1f0; color: #cf1322; }
    .priority-critical { background: #fff1f0; color: #cf1322; font-weight: 600; }

    .progress-bar {
      width: 100%;
      height: 6px;
      background: #f5f5f5;
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: #1890ff;
      border-radius: 3px;
      transition: width 0.3s;
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
      background: #1890ff;
      color: white;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 500;
      flex-shrink: 0;
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
      color: #1890ff;
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
  `;

  @property({ type: Object })
  content: TaskListContent | null = null;

  @property({ type: Boolean })
  editable = false;

  private getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      'todo': 'status-todo',
      'in_progress': 'status-in_progress',
      'done': 'status-done',
      'blocked': 'status-blocked'
    };
    return statusMap[status] || 'status-todo';
  }

  private getStatusText(status: string): string {
    const textMap: Record<string, string> = {
      'todo': '待办',
      'in_progress': '进行中',
      'done': '已完成',
      'blocked': '已阻塞'
    };
    return textMap[status] || status;
  }

  private getPriorityText(priority: string): string {
    const textMap: Record<string, string> = {
      'low': '低',
      'medium': '中',
      'high': '高',
      'critical': '紧急'
    };
    return textMap[priority] || priority;
  }

  private getInitials(email: string): string {
    return email.charAt(0).toUpperCase();
  }

  render() {
    if (!this.content || !this.content.tasks || this.content.tasks.length === 0) {
      return html`
        <div class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke-linecap="round"/>
            <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5C15 6.10457 14.1046 7 13 7H11C9.89543 7 9 6.10457 9 5Z" stroke-linecap="round"/>
            <path d="M9 12H15" stroke-linecap="round"/>
            <path d="M9 16H15" stroke-linecap="round"/>
          </svg>
          <p style="margin-top: 16px;">暂无任务数据</p>
        </div>
      `;
    }

    const tasks = this.content.tasks;

    return html`
      <div class="task-list">
        <div class="card-header">
          <div class="header-left">
            <h2>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 4H16V16H4V4Z" stroke="#1890ff" stroke-width="1.8" stroke-linejoin="round"/>
                <circle cx="10" cy="10" r="2" fill="#1890ff"/>
                <path d="M4 8H16M4 12H16" stroke="#1890ff" stroke-width="1.8"/>
              </svg>
              ${this.content.title || '任务列表'}
            </h2>
          </div>
          ${this.editable ? html`
            <button class="btn-primary" @click=${this._handleCreate}>
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M8 2V14M2 8H14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
              新建任务
            </button>
          ` : ''}
        </div>

        <div class="table-responsive">
          <table class="task-table">
            <thead>
              <tr>
                <th>任务标题</th>
                <th>状态</th>
                <th>优先级</th>
                <th>进度</th>
                <th>负责人</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              ${tasks.map((task) => {
                return html`
                  <tr>
                    <td>
                      <span class="task-title" title="${task.title}">
                        ${task.title}
                      </span>
                    </td>
                    <td>
                      <span class="status-badge ${this.getStatusClass(task.status)}">
                        ${this.getStatusText(task.status)}
                      </span>
                    </td>
                    <td>
                      <span class="priority-badge priority-${task.priority}">
                        ${this.getPriorityText(task.priority)}
                      </span>
                    </td>
                    <td>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <div class="progress-bar">
                          <div class="progress-fill" style="width: ${task.progress || 0}%"></div>
                        </div>
                        <span style="font-size: 12px; color: #8c8c8c;">${task.progress || 0}%</span>
                      </div>
                    </td>
                    <td>
                      ${task.assignee ? html`
                        <div class="user-info">
                          <span class="user-avatar">${this.getInitials(task.assignee.email)}</span>
                          <span class="user-email">${task.assignee.email}</span>
                        </div>
                      ` : html`<span style="color:#8c8c8c;">未分配</span>`}
                    </td>
                    <td>
                      ${this.editable ? html`
                        <div class="action-group">
                          <button class="action-icon" title="查看" @click=${() => this._handleView(task)}>
                            <svg viewBox="0 0 20 20" width="18" height="18">
                              <path d="M10 12C13.3137 12 16 9.31371 16 6C16 2.68629 13.3137 0 10 0C6.68629 0 4 2.68629 4 6C4 9.31371 6.68629 12 10 12Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
                              <circle cx="10" cy="6" r="2" stroke="currentColor" stroke-width="1.5"/>
                            </svg>
                          </button>
                          <button class="action-icon" title="编辑" @click=${() => this._handleEdit(task)}>
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
          <span>共 ${tasks.length} 个任务</span>
        </div>
      </div>
    `;
  }

  private _handleCreate() {
    this.dispatchEvent(new CustomEvent('task-create', {
      bubbles: true,
      detail: { projectId: this.content?.projectId }
    }));
  }

  private _handleView(task: Task) {
    this.dispatchEvent(new CustomEvent('task-view', {
      bubbles: true,
      detail: { task }
    }));
  }

  private _handleEdit(task: Task) {
    this.dispatchEvent(new CustomEvent('task-edit', {
      bubbles: true,
      detail: { task }
    }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "chatlite-task-list": ChatliteTaskList;
  }
}
