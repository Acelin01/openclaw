import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Milestone } from "./list-element";

export interface MilestoneDetailContent {
  kind: "milestone-detail";
  milestone: Milestone;
}

@customElement("chatlite-milestone-detail")
export class ChatliteMilestoneDetail extends LitElement {
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
      transition: all 0.2s;
    }

    .close-btn:hover {
      color: #262626;
      background: #f5f5f5;
    }

    .modal-body {
      display: flex;
      min-height: 400px;
    }

    .main-content {
      flex: 1;
      padding: 24px;
      border-right: 1px solid #f0f0f0;
    }

    .sidebar-content {
      width: 320px;
      padding: 24px;
      background: #fafafa;
    }

    .milestone-title {
      font-size: 20px;
      font-weight: 600;
      color: #262626;
      margin-bottom: 12px;
    }

    .milestone-id {
      font-size: 14px;
      color: #52c41a;
      font-weight: 500;
      background: #f6ffed;
      padding: 2px 8px;
      border-radius: 4px;
      margin-right: 8px;
    }

    .milestone-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 24px;
      font-size: 12px;
      color: #8c8c8c;
    }

    .description-section {
      margin-bottom: 24px;
    }

    .description-title {
      font-size: 14px;
      font-weight: 600;
      color: #262626;
      margin-bottom: 12px;
    }

    .description-content {
      background: #fafafa;
      border: 1px dashed #d9d9d9;
      border-radius: 4px;
      padding: 16px;
      font-size: 14px;
      line-height: 1.6;
      color: #262626;
      min-height: 100px;
    }

    .field-group {
      margin-bottom: 16px;
    }

    .form-label {
      font-size: 14px;
      color: #595959;
      margin-bottom: 8px;
    }

    .field-value {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: white;
      border-radius: 4px;
      font-size: 14px;
      color: #262626;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 30px;
      font-size: 12px;
      font-weight: 500;
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

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .user-avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #52c41a;
      color: white;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
    }
  `;

  @property({ type: Object })
  content: MilestoneDetailContent | null = null;

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

  private getInitials(email: string): string {
    return email.charAt(0).toUpperCase();
  }

  render() {
    if (!this.content || !this.content.milestone) {
      return html`<div style="padding: 24px; color: #8c8c8c;">暂无数据</div>`;
    }

    const m = this.content.milestone;

    return html`
      <div class="milestone-detail">
        <div class="modal-header">
          <h2>里程碑详情</h2>
          <button class="close-btn" @click=${() => this.dispatchEvent(new CustomEvent('close'))}>✕</button>
        </div>
        <div class="modal-body">
          <div class="main-content">
            <div class="milestone-title">
              <span class="milestone-id">ID ${m.id}</span>
              <span>${m.title}</span>
            </div>
            
            <div class="milestone-meta">
              ${m.assignee ? html`
                <div class="user-info">
                  <span class="user-avatar">${this.getInitials(m.assignee.email)}</span>
                  <span>${m.assignee.email}</span>
                </div>
              ` : ''}
              <span>${m.createdAt ? new Date(m.createdAt).toLocaleString('zh-CN') : '未知'}创建</span>
            </div>
            
            <div class="description-section">
              <div class="description-title">描述</div>
              <div class="description-content">
                ${m.description || '暂无描述'}
              </div>
            </div>
          </div>
          
          <div class="sidebar-content">
            <div class="field-group">
              <div class="form-label">状态</div>
              <div class="field-value">
                <span class="status-badge ${this.getStatusClass(m.status)}">
                  ${this.getStatusText(m.status)}
                </span>
              </div>
            </div>
            
            <div class="field-group">
              <div class="form-label">计划完成时间</div>
              <div class="field-value">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M13.3333 3.33333H2.66667C2.07757 3.33333 1.6 3.8109 1.6 4.4V12.4C1.6 12.9891 2.07757 13.4667 2.66667 13.4667H13.3333C13.9224 13.4667 14.4 12.9891 14.4 12.4V4.4C14.4 3.8109 13.9224 3.33333 13.3333 3.33333Z"/>
                  <path d="M4 1.33333V3.33333M12 1.33333V3.33333M1.6 6.66667H14.4"/>
                </svg>
                ${m.dueDate}
              </div>
            </div>
            
            ${m.priority ? html`
              <div class="field-group">
                <div class="form-label">优先级</div>
                <div class="field-value">
                  ${m.priority === 'high' ? '高' : m.priority === 'medium' ? '中' : '低'}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "chatlite-milestone-detail": ChatliteMilestoneDetail;
  }
}
