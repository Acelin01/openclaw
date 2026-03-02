import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Defect } from './list-element';

export interface DefectDetailContent {
  kind: "defect-detail";
  defect: Defect;
}

@customElement("chatlite-defect-detail")
export class ChatliteDefectDetail extends LitElement {
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

    .defect-title {
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
      background: #ff4d4f;
      color: white;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
    }
  `;

  @property({ type: Object })
  content: DefectDetailContent | null = null;

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

  render() {
    if (!this.content || !this.content.defect) {
      return html`<div style="padding: 24px; color: #8c8c8c;">暂无数据</div>`;
    }

    const defect = this.content.defect;

    return html`
      <div class="defect-detail">
        <div class="modal-header">
          <h2>缺陷详情</h2>
          <button class="close-btn" @click=${() => this.dispatchEvent(new CustomEvent('close'))}>✕</button>
        </div>
        <div class="modal-body">
          <div class="defect-title">${defect.title}</div>
          
          <div class="meta-info">
            <span class="status-badge ${this.getStatusClass(defect.status)}">
              ${this.getStatusText(defect.status)}
            </span>
            <span class="severity-badge severity-${defect.severity}">
              ${this.getSeverityText(defect.severity)}
            </span>
          </div>
          
          ${defect.description ? html`
            <div class="description">
              <strong>描述：</strong><br>
              ${defect.description}
            </div>
          ` : ''}
          
          <div class="info-grid">
            ${defect.reporter ? html`
              <div class="info-item">
                <div class="info-label">报告人</div>
                <div class="info-value">
                  <div class="user-info">
                    <span class="user-avatar">${defect.reporter.email.charAt(0).toUpperCase()}</span>
                    <span>${defect.reporter.email}</span>
                  </div>
                </div>
              </div>
            ` : ''}
            
            ${defect.assignee ? html`
              <div class="info-item">
                <div class="info-label">负责人</div>
                <div class="info-value">
                  <div class="user-info">
                    <span class="user-avatar">${defect.assignee.email.charAt(0).toUpperCase()}</span>
                    <span>${defect.assignee.email}</span>
                  </div>
                </div>
              </div>
            ` : ''}
            
            <div class="info-item">
              <div class="info-label">创建时间</div>
              <div class="info-value">${defect.createdAt ? new Date(defect.createdAt).toLocaleString('zh-CN') : '-'}</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">更新时间</div>
              <div class="info-value">${defect.updatedAt ? new Date(defect.updatedAt).toLocaleString('zh-CN') : '-'}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "chatlite-defect-detail": ChatliteDefectDetail;
  }
}
