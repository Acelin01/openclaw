import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Requirement } from './list-element';

export interface RequirementDetailContent {
  kind: "requirement-detail";
  requirement: Requirement;
}

@customElement("chatlite-requirement-detail")
export class ChatliteRequirementDetail extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      overflow: hidden;
    }

    .modal-header {
      padding: 16px 24px;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h2 {
      font-size: 16px;
      font-weight: 600;
      color: #262626;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #8c8c8c;
      padding: 4px 8px;
      border-radius: 4px;
    }

    .close-btn:hover {
      color: #262626;
      background: #f5f5f5;
    }

    .modal-body {
      padding: 24px;
    }

    .requirement-title {
      font-size: 20px;
      font-weight: 600;
      color: #262626;
      margin-bottom: 12px;
    }

    .meta-info {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 30px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-draft { background: #f5f5f5; color: #8c8c8c; border: 1px solid #d9d9d9; }
    .status-review { background: #fff7e6; color: #d46b08; border: 1px solid #ffd591; }
    .status-approved { background: #f6ffed; color: #52c41a; border: 1px solid #b7eb8f; }
    .status-in_progress { background: #e6f7ff; color: #1890ff; border: 1px solid #91d5ff; }
    .status-completed { background: #f6ffed; color: #52c41a; border: 1px solid #b7eb8f; }
    .status-rejected { background: #fff1f0; color: #cf1322; border: 1px solid #ffa39e; }

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

    .description {
      font-size: 14px;
      color: #595959;
      line-height: 1.6;
      margin-bottom: 24px;
      padding: 16px;
      background: #fafafa;
      border-radius: 6px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .info-item {
      padding: 12px;
      background: #fafafa;
      border-radius: 6px;
    }

    .info-label {
      font-size: 12px;
      color: #8c8c8c;
      margin-bottom: 4px;
    }

    .info-value {
      font-size: 14px;
      color: #262626;
      font-weight: 500;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .user-avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #722ed1;
      color: white;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
    }
  `;

  @property({ type: Object })
  content: RequirementDetailContent | null = null;

  private getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      'draft': 'status-draft',
      'review': 'status-review',
      'approved': 'status-approved',
      'in_progress': 'status-in_progress',
      'completed': 'status-completed',
      'rejected': 'status-rejected'
    };
    return statusMap[status] || 'status-draft';
  }

  private getStatusText(status: string): string {
    const textMap: Record<string, string> = {
      'draft': '草稿',
      'review': '审核中',
      'approved': '已批准',
      'in_progress': '进行中',
      'completed': '已完成',
      'rejected': '已拒绝'
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

  render() {
    if (!this.content || !this.content.requirement) {
      return html`<div style="padding: 24px; color: #8c8c8c;">暂无数据</div>`;
    }

    const req = this.content.requirement;

    return html`
      <div class="requirement-detail">
        <div class="modal-header">
          <h2>需求详情</h2>
          <button class="close-btn" @click=${() => this.dispatchEvent(new CustomEvent('close'))}>✕</button>
        </div>
        <div class="modal-body">
          <div class="requirement-title">${req.title}</div>
          
          <div class="meta-info">
            <span class="status-badge ${this.getStatusClass(req.status)}">
              ${this.getStatusText(req.status)}
            </span>
            <span class="priority-badge priority-${req.priority}">
              ${this.getPriorityText(req.priority)}
            </span>
          </div>
          
          ${req.description ? html`
            <div class="description">
              <strong>描述：</strong><br>
              ${req.description}
            </div>
          ` : ''}
          
          <div class="info-grid">
            ${req.assignee ? html`
              <div class="info-item">
                <div class="info-label">负责人</div>
                <div class="info-value">
                  <div class="user-info">
                    <span class="user-avatar">${req.assignee.email.charAt(0).toUpperCase()}</span>
                    <span>${req.assignee.email}</span>
                  </div>
                </div>
              </div>
            ` : ''}
            
            <div class="info-item">
              <div class="info-label">创建时间</div>
              <div class="info-value">${req.createdAt ? new Date(req.createdAt).toLocaleString('zh-CN') : '-'}</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">更新时间</div>
              <div class="info-value">${req.updatedAt ? new Date(req.updatedAt).toLocaleString('zh-CN') : '-'}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "chatlite-requirement-detail": ChatliteRequirementDetail;
  }
}
