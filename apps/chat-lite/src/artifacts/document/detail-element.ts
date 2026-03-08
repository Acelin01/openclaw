import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Document } from "./list-element.js";

export interface DocumentDetailContent {
  kind: "document-detail";
  document: Document;
}

@customElement("chatlite-document-detail")
export class ChatliteDocumentDetail extends LitElement {
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

    .back-btn {
      width: 32px;
      height: 32px;
      border: none;
      background: #f5f5f5;
      border-radius: 6px;
      cursor: pointer;
      color: #595959;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      padding: 0;
    }

    .back-btn:hover {
      background: #e8e8e8;
      color: #262626;
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

    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 30px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-draft { background: #f5f5f5; color: #8c8c8c; border: 1px solid #d9d9d9; }
    .status-published { background: #e6f7ff; color: #1890ff; border: 1px solid #91d5ff; }
    .status-archived { background: #fafafa; color: #595959; border: 1px solid #d9d9d9; }

    .card-body {
      padding: 24px;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
      padding: 16px;
      background: #fafafa;
      border-radius: 8px;
    }

    .meta-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .meta-label {
      font-size: 12px;
      color: #8c8c8c;
      font-weight: 500;
    }

    .meta-value {
      font-size: 14px;
      color: #262626;
      font-weight: 500;
    }

    .content-section {
      margin-top: 20px;
    }

    .content-section h3 {
      font-size: 14px;
      font-weight: 600;
      color: #595959;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .content-body {
      background: #fafafa;
      border-radius: 8px;
      padding: 20px;
      font-size: 14px;
      line-height: 1.8;
      color: #262626;
      white-space: pre-wrap;
      max-height: 500px;
      overflow-y: auto;
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

    .action-bar {
      padding: 16px 24px;
      border-top: 1px solid #f0f0f0;
      background: #fafafa;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .btn {
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .btn-secondary {
      background: #f5f5f5;
      color: #595959;
    }

    .btn-secondary:hover {
      background: #e8e8e8;
      color: #262626;
    }

    .btn-primary {
      background: #1890ff;
      color: white;
      box-shadow: 0 2px 4px rgba(24, 144, 255, 0.2);
    }

    .btn-primary:hover {
      background: #40a9ff;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(24, 144, 255, 0.3);
    }

    .empty-state {
      padding: 60px 24px;
      text-align: center;
      color: #8c8c8c;
    }
  `;

  @property({ type: Object })
  content: DocumentDetailContent | null = null;

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

  render() {
    if (!this.content || !this.content.document) {
      return html`
        <div class="empty-state">
          <p>暂无文档详情</p>
        </div>
      `;
    }

    const doc = this.content.document;

    return html`
      <div class="document-detail">
        <div class="card-header">
          <div class="header-left">
            <button class="back-btn" @click=${this._handleBack}>
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M10 13L5 8L10 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <h2>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2.5C10 2.5 15 5 15 9V17C15 17.5523 14.5523 18 14 18H6C5.44772 18 5 17.5523 5 17V9C5 5 10 2.5 10 2.5Z" stroke="#1890ff" stroke-width="1.5"/>
                <path d="M7.5 11.5H12.5" stroke="#1890ff" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M7.5 14.5H12.5" stroke="#1890ff" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              ${doc.title}
            </h2>
            <span class="status-badge ${this.getStatusClass(doc.status)}">
              ${this.getStatusText(doc.status)}
            </span>
          </div>
        </div>

        <div class="card-body">
          <div class="meta-grid">
            <div class="meta-item">
              <span class="meta-label">文档类型</span>
              <span class="meta-value"><span class="kind-tag">${this.getKindText(doc.kind)}</span></span>
            </div>
            <div class="meta-item">
              <span class="meta-label">作者</span>
              <span class="meta-value">${doc.author?.name || doc.author?.email || '未知'}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">创建日期</span>
              <span class="meta-value">${doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('zh-CN') : '-'}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">更新日期</span>
              <span class="meta-value">${doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString('zh-CN') : '-'}</span>
            </div>
          </div>

          <div class="content-section">
            <h3>文档内容</h3>
            <div class="content-body">${doc.description || '暂无内容描述'}</div>
          </div>
        </div>

        ${this.editable ? html`
          <div class="action-bar">
            <button class="btn btn-secondary" @click=${this._handleBack}>
              返回列表
            </button>
            <button class="btn btn-primary" @click=${this._handleEdit}>
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M11.5 2.5L13.5 4.5L5 13H3.5V11.5L11.5 2.5Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
                <path d="M10 4L12 6" stroke="currentColor" stroke-width="1.5"/>
              </svg>
              编辑文档
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }

  private _handleBack() {
    this.dispatchEvent(new CustomEvent('document-back', {
      bubbles: true,
      detail: {}
    }));
  }

  private _handleEdit() {
    this.dispatchEvent(new CustomEvent('document-edit', {
      bubbles: true,
      detail: { document: this.content?.document }
    }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "chatlite-document-detail": ChatliteDocumentDetail;
  }
}
