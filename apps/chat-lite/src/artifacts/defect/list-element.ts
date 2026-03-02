import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

export interface Defect {
  id: string;
  title: string;
  description?: string;
  status: "open" | "confirmed" | "in_progress" | "resolved" | "closed" | "rejected";
  severity: "trivial" | "minor" | "major" | "critical" | "blocker";
  priority: "low" | "medium" | "high";
  reporter?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  assignee?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  projectId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DefectListContent {
  kind: "defect-list";
  defects: Defect[];
  projectId?: string;
  title?: string;
}

@customElement("chatlite-defect-list")
export class ChatliteDefectList extends LitElement {
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
      color: #ff4d4f;
    }

    .btn-primary {
      background: #ff4d4f;
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
      box-shadow: 0 2px 4px rgba(255, 77, 79, 0.2);
    }

    .btn-primary:hover {
      background: #ff7875;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(255, 77, 79, 0.3);
    }

    .table-responsive {
      overflow-x: auto;
      padding: 0 0 8px 0;
    }

    .defect-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }

    .defect-table th {
      background: #fafafa;
      padding: 14px 16px;
      text-align: left;
      font-weight: 500;
      color: #595959;
      border-bottom: 1px solid #f0f0f0;
      white-space: nowrap;
    }

    .defect-table td {
      padding: 14px 16px;
      border-bottom: 1px solid #f0f0f0;
      color: #262626;
      vertical-align: middle;
    }

    .defect-table tbody tr:hover {
      background: #fafafa;
      transition: background 0.2s;
    }

    .defect-title {
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

    .status-open { background: #fff1f0; color: #cf1322; border: 1px solid #ffa39e; }
    .status-confirmed { background: #fff7e6; color: #d46b08; border: 1px solid #ffd591; }
    .status-in_progress { background: #e6f7ff; color: #1890ff; border: 1px solid #91d5ff; }
    .status-resolved { background: #f6ffed; color: #52c41a; border: 1px solid #b7eb8f; }
    .status-closed { background: #f5f5f5; color: #8c8c8c; border: 1px solid #d9d9d9; }
    .status-rejected { background: #fff1f0; color: #cf1322; border: 1px solid #ffa39e; }

    .severity-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
    }

    .severity-trivial { background: #f5f5f5; color: #8c8c8c; }
    .severity-minor { background: #f6ffed; color: #389e0d; }
    .severity-major { background: #fff7e6; color: #d46b08; }
    .severity-critical { background: #fff1f0; color: #cf1322; }
    .severity-blocker { background: #fff1f0; color: #cf1322; font-weight: 600; }

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

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .user-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #ff4d4f;
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
      color: #ff4d4f;
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
  content: DefectListContent | null = null;

  @property({ type: Boolean })
  editable = false;

  private getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      'open': 'status-open',
      'confirmed': 'status-confirmed',
      'in_progress': 'status-in_progress',
      'resolved': 'status-resolved',
      'closed': 'status-closed',
      'rejected': 'status-rejected'
    };
    return statusMap[status] || 'status-open';
  }

  private getStatusText(status: string): string {
    const textMap: Record<string, string> = {
      'open': '打开',
      'confirmed': '已确认',
      'in_progress': '修复中',
      'resolved': '已解决',
      'closed': '已关闭',
      'rejected': '已拒绝'
    };
    return textMap[status] || status;
  }

  private getSeverityText(severity: string): string {
    const textMap: Record<string, string> = {
      'trivial': '轻微',
      'minor': '一般',
      'major': '严重',
      'critical': '危急',
      'blocker': '阻塞'
    };
    return textMap[severity] || severity;
  }

  private getPriorityText(priority: string): string {
    const textMap: Record<string, string> = {
      'low': '低',
      'medium': '中',
      'high': '高'
    };
    return textMap[priority] || priority;
  }

  private getInitials(email: string): string {
    return email.charAt(0).toUpperCase();
  }

  render() {
    if (!this.content || !this.content.defects || this.content.defects.length === 0) {
      return html`
        <div class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10" stroke-linecap="round"/>
            <path d="M12 8V12" stroke-linecap="round"/>
            <circle cx="12" cy="16" r="1" fill="currentColor"/>
          </svg>
          <p style="margin-top: 16px;">暂无缺陷数据</p>
        </div>
      `;
    }

    const defects = this.content.defects;

    return html`
      <div class="defect-list">
        <div class="card-header">
          <div class="header-left">
            <h2>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 4H16V16H4V4Z" stroke="#ff4d4f" stroke-width="1.8" stroke-linejoin="round"/>
                <circle cx="10" cy="10" r="2" fill="#ff4d4f"/>
                <path d="M4 8H16M4 12H16" stroke="#ff4d4f" stroke-width="1.8"/>
              </svg>
              ${this.content.title || '缺陷列表'}
            </h2>
          </div>
          ${this.editable ? html`
            <button class="btn-primary" @click=${this._handleCreate}>
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M8 2V14M2 8H14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
              新建缺陷
            </button>
          ` : ''}
        </div>

        <div class="table-responsive">
          <table class="defect-table">
            <thead>
              <tr>
                <th>缺陷标题</th>
                <th>状态</th>
                <th>严重程度</th>
                <th>优先级</th>
                <th>负责人</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              ${defects.map((defect) => {
                return html`
                  <tr>
                    <td>
                      <span class="defect-title" title="${defect.title}">
                        ${defect.title}
                      </span>
                    </td>
                    <td>
                      <span class="status-badge ${this.getStatusClass(defect.status)}">
                        ${this.getStatusText(defect.status)}
                      </span>
                    </td>
                    <td>
                      <span class="severity-badge severity-${defect.severity}">
                        ${this.getSeverityText(defect.severity)}
                      </span>
                    </td>
                    <td>
                      <span class="priority-badge priority-${defect.priority}">
                        ${this.getPriorityText(defect.priority)}
                      </span>
                    </td>
                    <td>
                      ${defect.assignee ? html`
                        <div class="user-info">
                          <span class="user-avatar">${this.getInitials(defect.assignee.email)}</span>
                          <span class="user-email">${defect.assignee.email}</span>
                        </div>
                      ` : html`<span style="color:#8c8c8c;">未分配</span>`}
                    </td>
                    <td>
                      ${this.editable ? html`
                        <div class="action-group">
                          <button class="action-icon" title="查看" @click=${() => this._handleView(defect)}>
                            <svg viewBox="0 0 20 20" width="18" height="18">
                              <path d="M10 12C13.3137 12 16 9.31371 16 6C16 2.68629 13.3137 0 10 0C6.68629 0 4 2.68629 4 6C4 9.31371 6.68629 12 10 12Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
                              <circle cx="10" cy="6" r="2" stroke="currentColor" stroke-width="1.5"/>
                            </svg>
                          </button>
                          <button class="action-icon" title="编辑" @click=${() => this._handleEdit(defect)}>
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
          <span>共 ${defects.length} 个缺陷</span>
        </div>
      </div>
    `;
  }

  private _handleCreate() {
    this.dispatchEvent(new CustomEvent('defect-create', {
      bubbles: true,
      detail: { projectId: this.content?.projectId }
    }));
  }

  private _handleView(defect: Defect) {
    this.dispatchEvent(new CustomEvent('defect-view', {
      bubbles: true,
      detail: { defect }
    }));
  }

  private _handleEdit(defect: Defect) {
    this.dispatchEvent(new CustomEvent('defect-edit', {
      bubbles: true,
      detail: { defect }
    }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "chatlite-defect-list": ChatliteDefectList;
  }
}
