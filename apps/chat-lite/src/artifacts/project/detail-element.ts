import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Project } from './list-element';

export interface ProjectDetailContent {
  kind: "project-detail";
  project: Project;
}

@customElement("chatlite-project-detail")
export class ChatliteProjectDetail extends LitElement {
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

    .project-title {
      font-size: 20px;
      font-weight: 600;
      color: #262626;
      margin-bottom: 12px;
    }

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

    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 30px;
      font-size: 12px;
      font-weight: 500;
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
  `;

  @property({ type: Object })
  content: ProjectDetailContent | null = null;

  private getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      'active': 'status-active',
      'pending': 'status-pending',
      'completed': 'status-completed'
    };
    return statusMap[status] || 'status-pending';
  }

  render() {
    if (!this.content || !this.content.project) {
      return html`<div style="padding: 24px; color: #8c8c8c;">暂无数据</div>`;
    }

    const p = this.content.project;

    return html`
      <div class="project-detail">
        <div class="modal-header">
          <h2>项目详情</h2>
          <button class="close-btn" @click=${() => this.dispatchEvent(new CustomEvent('close'))}>✕</button>
        </div>
        <div class="modal-body">
          <div class="project-title">${p.name}</div>
          
          ${p.description ? html`
            <div class="description">
              ${p.description}
            </div>
          ` : ''}
          
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">状态</div>
              <div class="info-value">
                <span class="status-badge ${this.getStatusClass(p.status)}">
                  ${p.status}
                </span>
              </div>
            </div>
            
            ${p.owner ? html`
              <div class="info-item">
                <div class="info-label">负责人</div>
                <div class="info-value">${p.owner.email}</div>
              </div>
            ` : ''}
            
            ${p.startDate ? html`
              <div class="info-item">
                <div class="info-label">开始日期</div>
                <div class="info-value">${p.startDate}</div>
              </div>
            ` : ''}
            
            ${p.endDate ? html`
              <div class="info-item">
                <div class="info-label">结束日期</div>
                <div class="info-value">${p.endDate}</div>
              </div>
            ` : ''}
            
            ${p.budget ? html`
              <div class="info-item">
                <div class="info-label">预算</div>
                <div class="info-value">¥${p.budget}</div>
              </div>
            ` : ''}
            
            ${p.progress !== undefined ? html`
              <div class="info-item">
                <div class="info-label">进度</div>
                <div class="info-value">${p.progress}%</div>
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
    "chatlite-project-detail": ChatliteProjectDetail;
  }
}
