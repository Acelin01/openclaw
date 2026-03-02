import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

export interface IterationOverview {
  id: string;
  name: string;
  description?: string;
  goals?: string[];
  status: "planning" | "active" | "completed" | "archived";
  startDate: number;
  endDate: number;
  owner?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  stats?: {
    total: number;
    requirements: number;
    tasks: number;
    defects: number;
    completed: number;
    inProgress: number;
    todo: number;
    completionRate: number;
  };
}

@customElement("chatlite-iteration-overview")
export class IterationOverviewArtifact extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif;
    }

    .container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .header {
      padding: 20px 24px;
      border-bottom: 1px solid #f0f0f0;
      background: #fafafa;
    }

    .header-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .iteration-name {
      font-size: 18px;
      font-weight: 600;
      color: #1f1f1f;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 30px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-planning {
      background: #f5f5f5;
      color: #8c8c8c;
      border: 1px solid #d9d9d9;
    }

    .status-active {
      background: #e6f7ff;
      color: #0958d9;
      border: 1px solid #91caff;
    }

    .status-completed {
      background: #f6ffed;
      color: #389e0d;
      border: 1px solid #b7eb8f;
    }

    .status-archived {
      background: #f5f5f5;
      color: #8c8c8c;
      border: 1px solid #d9d9d9;
    }

    .iteration-meta {
      display: flex;
      gap: 24px;
      font-size: 13px;
      color: #595959;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .meta-icon {
      color: #8c8c8c;
    }

    .body {
      padding: 24px;
    }

    .section {
      margin-bottom: 24px;
    }

    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #262626;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .goals-list {
      list-style: none;
      padding: 0;
    }

    .goals-list li {
      padding: 8px 12px;
      background: #f6ffed;
      border-left: 3px solid #52c41a;
      margin-bottom: 8px;
      border-radius: 4px;
      font-size: 14px;
      color: #262626;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 16px;
    }

    .stat-card {
      background: #fafafa;
      border: 1px solid #f0f0f0;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 600;
      color: #1f1f1f;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 13px;
      color: #8c8c8c;
    }

    .stat-card.highlight {
      background: #e6f7ff;
      border-color: #91caff;
    }

    .stat-card.highlight .stat-value {
      color: #0958d9;
    }

    .progress-section {
      margin-top: 24px;
    }

    .progress-bar {
      height: 8px;
      background: #f0f0f0;
      border-radius: 4px;
      overflow: hidden;
      margin-top: 8px;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #52c41a 0%, #73d13d 100%);
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .progress-text {
      text-align: right;
      font-size: 13px;
      color: #8c8c8c;
      margin-top: 4px;
    }

    .workitem-summary {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .workitem-type {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      background: #fafafa;
      border-radius: 6px;
      font-size: 13px;
      color: #595959;
    }

    .workitem-icon {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      color: white;
      font-size: 12px;
      font-weight: 600;
    }

    .workitem-icon.requirement {
      background: #1890ff;
    }

    .workitem-icon.task {
      background: #52c41a;
    }

    .workitem-icon.defect {
      background: #ff4d4f;
    }

    .empty {
      padding: 40px 20px;
      text-align: center;
      color: #8c8c8c;
      font-size: 14px;
    }
  `;

  @property({ type: Object })
  overview: IterationOverview | null = null;

  render() {
    if (!this.overview) {
      return html`<div class="empty">暂无迭代概览数据</div>`;
    }

    return html`
      <div class="container">
        ${this._renderHeader()}
        ${this._renderBody()}
      </div>
    `;
  }

  private _renderHeader() {
    const statusClass = `status-${this.overview?.status}`;
    const statusText = {
      planning: '规划中',
      active: '进行中',
      completed: '已完成',
      archived: '已归档'
    }[this.overview?.status || 'planning'];

    const startDate = new Date(this.overview?.startDate || 0).toLocaleDateString('zh-CN');
    const endDate = new Date(this.overview?.endDate || 0).toLocaleDateString('zh-CN');

    return html`
      <div class="header">
        <div class="header-top">
          <div class="iteration-name">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" class="meta-icon">
              <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/>
              <path d="M10 6v4l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            ${this.overview?.name || '未命名迭代'}
          </div>
          <span class="status-badge ${statusClass}">${statusText}</span>
        </div>
        <div class="iteration-meta">
          <div class="meta-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="meta-icon">
              <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <span>${startDate} 至 ${endDate}</span>
          </div>
          ${this.overview?.owner ? html`
            <div class="meta-item">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="meta-icon">
                <circle cx="8" cy="5" r="3" stroke="currentColor" stroke-width="1.2"/>
                <path d="M3 13c0-2.5 2.5-4 5-4s5 1.5 5 4" stroke="currentColor" stroke-width="1.2"/>
              </svg>
              <span>${this.overview.owner.name}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  private _renderBody() {
    return html`
      <div class="body">
        ${this._renderGoals()}
        ${this._renderStats()}
        ${this._renderWorkitemSummary()}
        ${this._renderProgress()}
      </div>
    `;
  }

  private _renderGoals() {
    const goals = this.overview?.goals || [];
    if (goals.length === 0) return html``;

    return html`
      <div class="section">
        <div class="section-title">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2l6 6-6 6-6-6 6-6z" stroke="currentColor" stroke-width="1.2" fill="none"/>
          </svg>
          迭代目标
        </div>
        <ul class="goals-list">
          ${goals.map(goal => html`<li>${goal}</li>`)}
        </ul>
      </div>
    `;
  }

  private _renderStats() {
    const stats = this.overview?.stats;
    if (!stats) return html``;

    return html`
      <div class="section">
        <div class="section-title">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 3v10h10" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
            <path d="M7 13V9m4 4V7m4 6V5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          </svg>
          迭代统计
        </div>
        <div class="stats-grid">
          <div class="stat-card highlight">
            <div class="stat-value">${stats.total}</div>
            <div class="stat-label">工作项总数</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" style="color: #1890ff">${stats.requirements}</div>
            <div class="stat-label">需求</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" style="color: #52c41a">${stats.tasks}</div>
            <div class="stat-label">任务</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" style="color: #ff4d4f">${stats.defects}</div>
            <div class="stat-label">缺陷</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.completed}</div>
            <div class="stat-label">已完成</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.inProgress}</div>
            <div class="stat-label">进行中</div>
          </div>
        </div>
      </div>
    `;
  }

  private _renderWorkitemSummary() {
    const stats = this.overview?.stats;
    if (!stats) return html``;

    return html`
      <div class="section">
        <div class="section-title">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" stroke-width="1.2"/>
            <path d="M5 7h6M5 10h4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          </svg>
          工作项分布
        </div>
        <div class="workitem-summary">
          <div class="workitem-type">
            <span class="workitem-icon requirement">需</span>
            <span>${stats.requirements} 个需求</span>
          </div>
          <div class="workitem-type">
            <span class="workitem-icon task">任</span>
            <span>${stats.tasks} 个任务</span>
          </div>
          <div class="workitem-type">
            <span class="workitem-icon defect">缺</span>
            <span>${stats.defects} 个缺陷</span>
          </div>
        </div>
      </div>
    `;
  }

  private _renderProgress() {
    const stats = this.overview?.stats;
    if (!stats || stats.total === 0) return html``;

    const rate = Math.round((stats.completed / stats.total) * 100);

    return html`
      <div class="progress-section">
        <div class="section-title">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.2"/>
            <path d="M8 4v4l3 3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          </svg>
          完成进度
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${rate}%"></div>
        </div>
        <div class="progress-text">${rate}% 完成 (${stats.completed}/${stats.total})</div>
      </div>
    `;
  }
}
