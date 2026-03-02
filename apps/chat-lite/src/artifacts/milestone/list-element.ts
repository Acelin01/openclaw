import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  status: "notstarted" | "progress" | "completed" | "canceled";
  priority: "low" | "medium" | "high";
  assignee?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  dueDate: string;
  projectId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MilestoneListContent {
  kind: "milestone-list";
  milestones: Milestone[];
  projectId?: string;
  title?: string;
}

@customElement("chatlite-milestone-list")
export class ChatliteMilestoneList extends LitElement {
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

    .legend-tag {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #f5f5f5;
      padding: 4px 12px;
      border-radius: 30px;
      border: 1px solid #e8e8e8;
      font-size: 13px;
      color: #595959;
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 3px;
    }

    .legend-color.overdue {
      background: #ff4d4f;
    }

    .legend-color.progress {
      background: #52c41a;
    }

    .legend-color.today {
      background: #1890ff;
    }

    .btn-primary {
      background: #52c41a;
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
      box-shadow: 0 2px 4px rgba(82, 196, 26, 0.2);
    }

    .btn-primary:hover {
      background: #73d13d;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(82, 196, 26, 0.3);
    }

    .timeline-axis {
      padding: 20px 24px 16px 24px;
      border-bottom: 1px solid #f0f0f0;
      background: #ffffff;
    }

    .axis-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .today-badge {
      background: #e6f7ff;
      color: #1890ff;
      border: 1px solid #91d5ff;
      padding: 2px 10px;
      border-radius: 30px;
      font-size: 12px;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .today-badge::before {
      content: '';
      width: 8px;
      height: 8px;
      background: #1890ff;
      border-radius: 50%;
      display: inline-block;
    }

    .date-scale {
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      margin-top: 8px;
      padding: 4px 0;
    }

    .scale-item {
      flex: 1;
      text-align: center;
      font-size: 13px;
      color: #595959;
      position: relative;
      border-right: 1px dashed #e8e8e8;
    }

    .scale-item:last-child {
      border-right: none;
    }

    .scale-item .date-label {
      display: block;
      background: #fafafa;
      padding: 4px 0;
      border-radius: 4px;
      font-weight: 500;
      color: #262626;
    }

    .scale-item.today .date-label {
      background: #e6f7ff;
      color: #1890ff;
      font-weight: 600;
      box-shadow: inset 0 -2px 0 #1890ff;
    }

    .table-responsive {
      overflow-x: auto;
      padding: 0 0 8px 0;
    }

    .milestone-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
      min-width: 1000px;
      table-layout: auto;
    }

    .milestone-table th {
      background: #fafafa;
      padding: 14px 16px;
      text-align: left;
      font-weight: 500;
      color: #595959;
      border-bottom: 1px solid #f0f0f0;
      white-space: nowrap;
      font-size: 14px;
    }

    .milestone-table td {
      padding: 14px 16px;
      border-bottom: 1px solid #f0f0f0;
      white-space: nowrap;
      color: #262626;
      vertical-align: middle;
    }

    .milestone-table tbody tr:hover {
      background: #fafafa;
      transition: background 0.2s;
    }

    .milestone-name {
      font-weight: 500;
      color: #262626;
      max-width: 280px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .overdue-tag {
      display: inline-block;
      background: #fff1f0;
      color: #cf1322;
      font-size: 11px;
      padding: 2px 6px;
      border-radius: 30px;
      margin-left: 6px;
      border: 1px solid #ffa39e;
      font-weight: 400;
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

    .status-progress {
      background: #f6ffed;
      color: #52c41a;
      border: 1px solid #b7eb8f;
    }

    .status-notstart {
      background: #fff7e6;
      color: #d46b08;
      border: 1px solid #ffd591;
    }

    .status-completed {
      background: #e6f7ff;
      color: #1890ff;
      border: 1px solid #91d5ff;
    }

    .status-canceled {
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

    .date-text {
      color: #595959;
      font-size: 13px;
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
      border-color: #d9d9d9;
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
  content: MilestoneListContent | null = null;

  @property({ type: Boolean })
  editable = false;

  private getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      'progress': 'status-progress',
      'notstarted': 'status-notstart',
      'completed': 'status-completed',
      'canceled': 'status-canceled'
    };
    return statusMap[status] || 'status-notstart';
  }

  private getStatusText(status: string): string {
    const textMap: Record<string, string> = {
      'progress': '进行中',
      'notstarted': '未开始',
      'completed': '已完成',
      'canceled': '已取消'
    };
    return textMap[status] || '未开始';
  }

  private isOverdue(dueDate: string, status: string): boolean {
    if (status === 'completed' || status === 'canceled') return false;
    const due = new Date(dueDate);
    const today = new Date();
    return due < today;
  }

  private getInitials(email: string): string {
    return email.charAt(0).toUpperCase();
  }

  render() {
    if (!this.content || !this.content.milestones || this.content.milestones.length === 0) {
      return html`
        <div class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <p>暂无里程碑数据</p>
        </div>
      `;
    }

    const milestones = this.content.milestones;
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // 生成日期刻度（未来 4 周）
    const dates = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i * 7);
      dates.push(date);
    }

    return html`
      <div class="milestone-list">
        <div class="card-header">
          <div class="header-left">
            <h2>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 4H16V16H4V4Z" stroke="#52c41a" stroke-width="1.8" stroke-linejoin="round"/>
                <circle cx="10" cy="10" r="2" fill="#52c41a"/>
                <path d="M4 8H16M4 12H16" stroke="#52c41a" stroke-width="1.8"/>
              </svg>
              ${this.content.title || '里程碑'}
            </h2>
            <div class="legend-tag">
              <span class="legend-color overdue"></span> 逾期
              <span class="legend-color progress" style="margin-left: 8px;"></span> 进行中
              <span class="legend-color today" style="margin-left: 8px;"></span> 当天
            </div>
          </div>
          ${this.editable ? html`
            <button class="btn-primary" @click=${this._handleCreate}>
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M8 2V14M2 8H14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
              新建里程碑
            </button>
          ` : ''}
        </div>

        <div class="timeline-axis">
          <div class="axis-header">
            <span class="today-badge">当天 · ${todayStr}</span>
            <span style="color:#8c8c8c; font-size:12px;">计划完成时间轴</span>
          </div>
          <div class="date-scale">
            ${dates.map((date, index) => {
              const dateStr = date.toISOString().split('T')[0];
              const isToday = index === 0;
              return html`
                <div class="scale-item ${isToday ? 'today' : ''}">
                  ${isToday ? html`<span class="scale-marker"></span>` : ''}
                  <span class="date-label">${dateStr.slice(5)}</span>
                </div>
              `;
            })}
          </div>
        </div>

        <div class="table-responsive">
          <table class="milestone-table">
            <thead>
              <tr>
                <th>名称</th>
                <th>负责人</th>
                <th>状态</th>
                <th>计划完成时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              ${milestones.map((milestone) => {
                const overdue = this.isOverdue(milestone.dueDate, milestone.status);
                return html`
                  <tr>
                    <td>
                      <span class="milestone-name" title="${milestone.title}">
                        ${milestone.title}
                        ${overdue ? html`<span class="overdue-tag">已逾期</span>` : ''}
                      </span>
                    </td>
                    <td>
                      ${milestone.assignee ? html`
                        <div class="user-info">
                          <span class="user-avatar sm">${this.getInitials(milestone.assignee.email)}</span>
                          <span class="user-email">${milestone.assignee.email}</span>
                        </div>
                      ` : html`<span style="color:#8c8c8c;">未分配</span>`}
                    </td>
                    <td>
                      <span class="status-badge ${this.getStatusClass(milestone.status)}">
                        ${this.getStatusText(milestone.status)}
                      </span>
                    </td>
                    <td>
                      <span class="date-text">${milestone.dueDate}</span>
                    </td>
                    <td>
                      ${this.editable ? html`
                        <div class="action-group">
                          <button class="action-icon" title="编辑" @click=${() => this._handleEdit(milestone)}>
                            <svg viewBox="0 0 20 20">
                              <path d="M15 3L17 5L8 14H6V12L15 3Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
                              <path d="M13 5L15 7" stroke="currentColor" stroke-width="1.5"/>
                            </svg>
                          </button>
                          <button class="action-icon" title="删除" @click=${() => this._handleDelete(milestone)}>
                            <svg viewBox="0 0 20 20">
                              <path d="M5 7H15M7 7V15H13V7M8 4H12V7H8V4Z" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linejoin="round"/>
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
          <span>共 ${milestones.length} 个里程碑</span>
        </div>
      </div>
    `;
  }

  private _handleCreate() {
    this.dispatchEvent(new CustomEvent('milestone-create', {
      bubbles: true,
      detail: { projectId: this.content?.projectId }
    }));
  }

  private _handleEdit(milestone: Milestone) {
    this.dispatchEvent(new CustomEvent('milestone-edit', {
      bubbles: true,
      detail: { milestone }
    }));
  }

  private _handleDelete(milestone: Milestone) {
    if (confirm(`确定删除里程碑 "${milestone.title}"？`)) {
      this.dispatchEvent(new CustomEvent('milestone-delete', {
        bubbles: true,
        detail: { milestone }
      }));
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "chatlite-milestone-list": ChatliteMilestoneList;
  }
}
