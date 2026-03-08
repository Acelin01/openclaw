import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

export interface Document {
  id: string;
  title: string;
  description?: string;
  kind: string;
  status: "draft" | "published" | "archived";
  author?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  projectId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentListContent {
  kind: "document-list";
  documents: Document[];
  projectId?: string;
  title?: string;
}

@customElement("chatlite-document-list")
export class ChatliteDocumentList extends LitElement {
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

    .document-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }

    .document-table th {
      background: #fafafa;
      padding: 14px 16px;
      text-align: left;
      font-weight: 500;
      color: #595959;
      border-bottom: 1px solid #f0f0f0;
      white-space: nowrap;
    }

    .document-table td {
      padding: 14px 16px;
      border-bottom: 1px solid #f0f0f0;
      color: #262626;
      vertical-align: middle;
    }

    .document-table tbody tr:hover {
      background: #fafafa;
      transition: background 0.2s;
    }

    .document-title {
      font-weight: 500;
      color: #262626;
      max-width: 280px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .kind-tag {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      background: #f5f5f5;
      color: #595959;
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

    .status-draft { background: #f5f5f5; color: #8c8c8c; border: 1px solid #d9d9d9; }
    .status-published { background: #e6f7ff; color: #1890ff; border: 1px solid #91d5ff; }
    .status-archived { background: #fafafa; color: #595959; border: 1px solid #d9d9d9; }

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

    .date-cell {
      font-size: 13px;
      color: #8c8c8c;
    }
  `;

  @property({ type: Object })
  content: DocumentListContent | null = null;

  @property({ type: Boolean })
  editable = false;

  private getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      'draft': 'status-draft',
      'published': 'status-published',
      'archived': 'status-archived'
    };
    return statusMap[status] || 'status-draft';
  }

  private getStatusText(status: string): string {
    const textMap: Record<string, string> = {
      'draft': '草稿',
      'published': '已发布',
      'archived': '已归档'
    };
    return textMap[status] || status;
  }

  private getKindText(kind: string): string {
    const kindMap: Record<string, string> = {
      'testcase': '测试用例',
      'requirement': '需求文档',
      'project': '项目文档',
      'milestone': '里程碑',
      'report': '报告',
      'text': '文本',
      'code': '代码',
      'sheet': '表格'
    };
    return kindMap[kind] || kind;
  }

  private getInitials(email: string): string {
    return email.charAt(0).toUpperCase();
  }

  render() {
    if (!this.content || !this.content.documents || this.content.documents.length === 0) {
      return html`
        <div class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M14 2V8H20" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 13H16" stroke-linecap="round"/>
            <path d="M8 17H16" stroke-linecap="round"/>
            <path d="M8 9H9" stroke-linecap="round"/>
          </svg>
          <p style="margin-top: 16px;">暂无文档</p>
        </div>
      `;
    }

    const documents = this.content.documents;

    return html`
      <div class="document-list">
        <div class="card-header">
          <div class="header-left">
            <h2>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2.5C10 2.5 15 5 15 9V17C15 17.5523 14.5523 18 14 18H6C5.44772 18 5 17.5523 5 17V9C5 5 10 2.5 10 2.5Z" stroke="#1890ff" stroke-width="1.5"/>
                <path d="M7.5 11.5H12.5" stroke="#1890ff" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M7.5 14.5H12.5" stroke="#1890ff" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              ${this.content.title || '文档列表'}
            </h2>
          </div>
          ${this.editable ? html`
            <button class="btn-primary" @click=${this._handleCreate}>
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M8 2V14M2 8H14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
              新建文档
            </button>
          ` : ''}
        </div>

        <div class="table-responsive">
          <table class="document-table">
            <thead>
              <tr>
                <th>文档标题</th>
                <th>类型</th>
                <th>状态</th>
                <th>作者</th>
                <th>更新日期</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              ${documents.map((doc) => {
                return html`
                  <tr>
                    <td>
                      <span class="document-title" title="${doc.title}">
                        ${doc.title}
                      </span>
                    </td>
                    <td>
                      <span class="kind-tag">${this.getKindText(doc.kind)}</span>
                    </td>
                    <td>
                      <span class="status-badge ${this.getStatusClass(doc.status)}">
                        ${this.getStatusText(doc.status)}
                      </span>
                    </td>
                    <td>
                      ${doc.author ? html`
                        <div class="user-info">
                          <span class="user-avatar">${this.getInitials(doc.author.email)}</span>
                          <span class="user-email">${doc.author.email}</span>
                        </div>
                      ` : html`<span style="color:#8c8c8c;">未知</span>`}
                    </td>
                    <td>
                      <span class="date-cell">${doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString('zh-CN') : '-'}</span>
                    </td>
                    <td>
                      ${this.editable ? html`
                        <div class="action-group">
                          <button class="action-icon" title="查看" @click=${() => this._handleView(doc)}>
                            <svg viewBox="0 0 20 20" width="18" height="18">
                              <path d="M10 12C13.3137 12 16 9.31371 16 6C16 2.68629 13.3137 0 10 0C6.68629 0 4 2.68629 4 6C4 9.31371 6.68629 12 10 12Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
                              <circle cx="10" cy="6" r="2" stroke="currentColor" stroke-width="1.5"/>
                            </svg>
                          </button>
                          <button class="action-icon" title="编辑" @click=${() => this._handleEdit(doc)}>
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
          <span>共 ${documents.length} 个文档</span>
        </div>
      </div>
    `;
  }

  private _handleCreate() {
    this.dispatchEvent(new CustomEvent('document-create', {
      bubbles: true,
      detail: { projectId: this.content?.projectId }
    }));
  }

  private _handleView(document: Document) {
    this.dispatchEvent(new CustomEvent('document-view', {
      bubbles: true,
      detail: { document }
    }));
  }

  private _handleEdit(document: Document) {
    this.dispatchEvent(new CustomEvent('document-edit', {
      bubbles: true,
      detail: { document }
    }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "chatlite-document-list": ChatliteDocumentList;
  }
}
