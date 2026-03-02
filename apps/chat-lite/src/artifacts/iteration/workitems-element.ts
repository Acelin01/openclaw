import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

export interface WorkItem {
  id: string;
  type: 'requirement' | 'task' | 'defect';
  title: string;
  status: string;
  priority?: string;
  assignee?: {
    name: string;
    email: string;
  };
  createdAt: number;
  estimatedHours?: number;
}

export type ViewMode = 'list' | 'tree' | 'board' | 'gantt';

@customElement("chatlite-iteration-workitems")
export class IterationWorkitemsArtifact extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .header {
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

    .header h2 {
      font-size: 18px;
      font-weight: 600;
      color: #1f1f1f;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .view-switch {
      display: flex;
      background: #f5f5f5;
      border-radius: 6px;
      padding: 2px;
      border: 1px solid #e8e8e8;
    }

    .view-option {
      padding: 6px 12px;
      border: none;
      background: transparent;
      border-radius: 4px;
      font-size: 13px;
      color: #595959;
      cursor: pointer;
      transition: all 0.2s;
    }

    .view-option:hover {
      background: #fafafa;
    }

    .view-option.active {
      background: white;
      color: #1f1f1f;
      font-weight: 500;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .toolbar {
      padding: 16px 24px;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .filter-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .filter-label {
      font-size: 13px;
      color: #595959;
      white-space: nowrap;
    }

    .filter-select {
      padding: 6px 12px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      font-size: 13px;
      color: #262626;
      background: white;
      cursor: pointer;
      min-width: 120px;
    }

    .filter-select:focus {
      outline: none;
      border-color: #40a9ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    }

    .workitems-list {
      max-height: 600px;
      overflow-y: auto;
    }

    .workitem-row {
      display: flex;
      align-items: center;
      padding: 14px 24px;
      border-bottom: 1px solid #f0f0f0;
      transition: background 0.2s;
    }

    .workitem-row:hover {
      background: #fafafa;
    }

    .workitem-type {
      width: 40px;
      flex-shrink: 0;
    }

    .type-icon {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
      font-weight: 600;
    }

    .type-icon.requirement {
      background: #1890ff;
    }

    .type-icon.task {
      background: #52c41a;
    }

    .type-icon.defect {
      background: #ff4d4f;
    }

    .workitem-content {
      flex: 1;
      min-width: 0;
      margin: 0 16px;
    }

    .workitem-title {
      font-size: 14px;
      font-weight: 500;
      color: #262626;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .workitem-meta {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: #8c8c8c;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .workitem-status {
      width: 100px;
      flex-shrink: 0;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 30px;
      font-size: 12px;
      font-weight: 500;
      text-align: center;
    }

    .status-todo {
      background: #f5f5f5;
      color: #8c8c8c;
    }

    .status-in_progress {
      background: #e6f7ff;
      color: #0958d9;
    }

    .status-done {
      background: #f6ffed;
      color: #389e0d;
    }

    .status-approved {
      background: #f6ffed;
      color: #389e0d;
    }

    .status-closed {
      background: #f6ffed;
      color: #389e0d;
    }

    .workitem-assignee {
      width: 180px;
      flex-shrink: 0;
    }

    .assignee-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .assignee-avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #1890ff;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 600;
      flex-shrink: 0;
    }

    .assignee-name {
      font-size: 13px;
      color: #262626;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .workitem-hours {
      width: 80px;
      flex-shrink: 0;
      text-align: right;
      font-size: 13px;
      color: #595959;
    }

    .empty {
      padding: 60px 20px;
      text-align: center;
      color: #8c8c8c;
      font-size: 14px;
    }

    .stats-bar {
      padding: 12px 24px;
      background: #fafafa;
      border-top: 1px solid #f0f0f0;
      display: flex;
      gap: 24px;
      font-size: 13px;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .stat-icon {
      width: 16px;
      height: 16px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 10px;
      font-weight: 600;
    }
  `;

  @property({ type: Array })
  workitems: WorkItem[] = [];

  @property({ type: String })
  viewMode: ViewMode = 'list';

  @property({ type: String })
  filterType: string = 'all';

  @property({ type: String })
  filterStatus: string = 'all';

  render() {
    const filteredWorkitems = this._filterWorkitems();
    const stats = this._calculateStats();

    return html`
      <div class="container">
        ${this._renderHeader()}
        ${this._renderToolbar()}
        ${this._renderList(filteredWorkitems)}
        ${this._renderStatsBar(stats)}
      </div>
    `;
  }

  private _renderHeader() {
    return html`
      <div class="header">
        <div class="header-left">
          <h2>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/>
              <path d="M7 7h6M7 10h6M7 13h3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            迭代工作项
          </h2>
          <div class="view-switch">
            <button class="view-option ${this.viewMode === 'list' ? 'active' : ''}" @click=${() => this._setViewMode('list')}>列表</button>
            <button class="view-option ${this.viewMode === 'tree' ? 'active' : ''}" @click=${() => this._setViewMode('tree')}>树形</button>
            <button class="view-option ${this.viewMode === 'board' ? 'active' : ''}" @click=${() => this._setViewMode('board')}>看板</button>
            <button class="view-option ${this.viewMode === 'gantt' ? 'active' : ''}" @click=${() => this._setViewMode('gantt')}>甘特图</button>
          </div>
        </div>
      </div>
    `;
  }

  private _renderToolbar() {
    return html`
      <div class="toolbar">
        <div class="filter-group">
          <span class="filter-label">类型:</span>
          <select class="filter-select" .value=${this.filterType} @change=${(e: any) => this._setFilterType(e.target.value)}>
            <option value="all">全部</option>
            <option value="requirement">需求</option>
            <option value="task">任务</option>
            <option value="defect">缺陷</option>
          </select>
        </div>
        <div class="filter-group">
          <span class="filter-label">状态:</span>
          <select class="filter-select" .value=${this.filterStatus} @change=${(e: any) => this._setFilterStatus(e.target.value)}>
            <option value="all">全部</option>
            <option value="todo">待处理</option>
            <option value="in_progress">进行中</option>
            <option value="done">已完成</option>
          </select>
        </div>
      </div>
    `;
  }

  private _renderList(workitems: WorkItem[]) {
    if (workitems.length === 0) {
      return html`
        <div class="empty">
          暂无工作项
        </div>
      `;
    }

    if (this.viewMode === 'list') {
      return html`
        <div class="workitems-list">
          ${workitems.map(item => this._renderWorkitemRow(item))}
        </div>
      `;
    }

    // 其他视图模式暂时显示列表
    return html`
      <div class="workitems-list">
        ${workitems.map(item => this._renderWorkitemRow(item))}
      </div>
    `;
  }

  private _renderWorkitemRow(item: WorkItem) {
    const statusClass = `status-${item.status.toLowerCase()}`;
    const statusText = this._getStatusText(item.status);
    const priorityText = item.priority ? this._getPriorityText(item.priority) : '';

    return html`
      <div class="workitem-row">
        <div class="workitem-type">
          <div class="type-icon ${item.type}">
            ${item.type === 'requirement' ? '需' : item.type === 'task' ? '任' : '缺'}
          </div>
        </div>
        <div class="workitem-content">
          <div class="workitem-title">${item.title}</div>
          <div class="workitem-meta">
            <div class="meta-item">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 2v8M2 6h8" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
              </svg>
              ${new Date(item.createdAt).toLocaleDateString('zh-CN')}
            </div>
            ${priorityText ? html`
              <div class="meta-item">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1l4 10H2L6 1z" stroke="currentColor" stroke-width="1"/>
                </svg>
                ${priorityText}
              </div>
            ` : ''}
          </div>
        </div>
        <div class="workitem-status">
          <span class="status-badge ${statusClass}">${statusText}</span>
        </div>
        <div class="workitem-assignee">
          ${item.assignee ? html`
            <div class="assignee-info">
              <div class="assignee-avatar">
                ${item.assignee.name.slice(0, 1).toUpperCase()}
              </div>
              <span class="assignee-name">${item.assignee.name}</span>
            </div>
          ` : html`<span style="color: #8c8c8c; font-size: 13px;">未分配</span>`}
        </div>
        <div class="workitem-hours">
          ${item.estimatedHours ? html`${item.estimatedHours}h` : ''}
        </div>
      </div>
    `;
  }

  private _renderStatsBar(stats: any) {
    return html`
      <div class="stats-bar">
        <div class="stat-item">
          <div class="stat-icon" style="background: #1890ff">需</div>
          <span>需求：${stats.requirements}</span>
        </div>
        <div class="stat-item">
          <div class="stat-icon" style="background: #52c41a">任</div>
          <span>任务：${stats.tasks}</span>
        </div>
        <div class="stat-item">
          <div class="stat-icon" style="background: #ff4d4f">缺</div>
          <span>缺陷：${stats.defects}</span>
        </div>
        <div class="stat-item" style="margin-left: auto;">
          <span>总计：${stats.total}</span>
        </div>
      </div>
    `;
  }

  private _filterWorkitems(): WorkItem[] {
    return this.workitems.filter(item => {
      if (this.filterType !== 'all' && item.type !== this.filterType) return false;
      if (this.filterStatus !== 'all' && !item.status.toLowerCase().includes(this.filterStatus)) return false;
      return true;
    });
  }

  private _calculateStats() {
    return {
      total: this.workitems.length,
      requirements: this.workitems.filter(w => w.type === 'requirement').length,
      tasks: this.workitems.filter(w => w.type === 'task').length,
      defects: this.workitems.filter(w => w.type === 'defect').length,
    };
  }

  private _setViewMode(mode: ViewMode) {
    this.viewMode = mode;
  }

  private _setFilterType(type: string) {
    this.filterType = type;
  }

  private _setFilterStatus(status: string) {
    this.filterStatus = status;
  }

  private _getStatusText(status: string): string {
    const map: Record<string, string> = {
      todo: '待处理',
      in_progress: '进行中',
      done: '已完成',
      approved: '已通过',
      closed: '已关闭',
      pending: '待处理',
    };
    return map[status.toLowerCase()] || status;
  }

  private _getPriorityText(priority: string): string {
    const map: Record<string, string> = {
      low: '低',
      medium: '中',
      high: '高',
      critical: '紧急',
    };
    return map[priority.toLowerCase()] || '';
  }
}
