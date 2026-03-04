import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Task } from './list-element';

export interface TaskDetailContent {
  kind: "task-detail";
  task: Task;
}

@customElement("chatlite-task-detail")
export class ChatliteTaskDetail extends LitElement {
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

    .task-title {
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

    .progress-section {
      margin-bottom: 24px;
    }

    .progress-label {
      font-size: 14px;
      color: #595959;
      margin-bottom: 8px;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: #f5f5f5;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: #1890ff;
      border-radius: 4px;
      transition: width 0.3s;
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
      background: #1890ff;
      color: white;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
    }
  `;

  @property({ type: Object })
  content: TaskDetailContent | null = null;

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

  render() {
    if (!this.content || !this.content.task) {
      return html`<div style="padding: 24px; color: #8c8c8c;">暂无数据</div>`;
    }

    const task = this.content.task;

    return html`
      <div class="task-detail">
        <div class="modal-header">
          <h2>任务详情</h2>
          <button class="close-btn" @click=${() => this.dispatchEvent(new CustomEvent('close'))}>✕</button>
        </div>
        <div class="modal-body">
          <div class="task-title">${task.title}</div>
          
          <div class="meta-info">
            <span class="status-badge ${this.getStatusClass(task.status)}">
              ${this.getStatusText(task.status)}
            </span>
            <span class="priority-badge priority-${task.priority}">
              ${this.getPriorityText(task.priority)}
            </span>
          </div>
          
          ${task.progress !== undefined ? html`
            <div class="progress-section">
              <div class="progress-label">进度：${task.progress}%</div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${task.progress}%"></div>
              </div>
            </div>
          ` : ''}
          
          ${task.description ? html`
            <div class="description">
              <strong>描述：</strong><br>
              ${task.description}
            </div>
          ` : ''}
          
          <div class="info-grid">
            ${task.assignee ? html`
              <div class="info-item">
                <div class="info-label">负责人</div>
                <div class="info-value">
                  <div class="user-info">
                    <span class="user-avatar">${task.assignee.email.charAt(0).toUpperCase()}</span>
                    <span>${task.assignee.email}</span>
                  </div>
                </div>
              </div>
            ` : ''}
            
            ${task.dueDate ? html`
              <div class="info-item">
                <div class="info-label">截止日期</div>
                <div class="info-value">${task.dueDate}</div>
              </div>
            ` : ''}
            
            <div class="info-item">
              <div class="info-label">创建时间</div>
              <div class="info-value">${task.createdAt ? new Date(task.createdAt).toLocaleString('zh-CN') : '-'}</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">更新时间</div>
              <div class="info-value">${task.updatedAt ? new Date(task.updatedAt).toLocaleString('zh-CN') : '-'}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "chatlite-task-detail": ChatliteTaskDetail;
  }
}
