import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

export interface IterationListItem {
  id: string;
  name: string;
  description?: string;
  status: "planning" | "active" | "completed" | "archived";
  startDate: number;
  endDate: number;
  progress?: number;
  stats?: {
    total: number;
    completed: number;
  };
  owner?: {
    name: string;
    email: string;
  };
}

@customElement("chatlite-iteration-list")
export class IterationListArtifact extends LitElement {
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
    }

    .header h2 {
      font-size: 18px;
      font-weight: 600;
      color: #1f1f1f;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .btn-primary {
      background: #52c41a;
      color: white;
    }

    .btn-primary:hover {
      background: #73d13d;
    }

    .btn-secondary {
      background: #f5f5f5;
      color: #595959;
      border: 1px solid #d9d9d9;
    }

    .btn-secondary:hover {
      background: #fafafa;
      border-color: #40a9ff;
      color: #0958d9;
    }

    .iteration-list {
      max-height: 600px;
      overflow-y: auto;
    }

    .iteration-item {
      padding: 16px 24px;
      border-bottom: 1px solid #f0f0f0;
      cursor: pointer;
      transition: background 0.2s;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .iteration-item:hover {
      background: #fafafa;
    }

    .iteration-item.active {
      background: #e6f7ff;
      border-left: 3px solid #1890ff;
    }

    .iteration-item.selected {
      background: #f6ffed;
      border-left: 3px solid #52c41a;
    }

    .iteration-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #8c8c8c;
      flex-shrink: 0;
    }

    .iteration-icon.active {
      background: #e6f7ff;
      color: #1890ff;
    }

    .iteration-icon.completed {
      background: #f6ffed;
      color: #52c41a;
    }

    .iteration-info {
      flex: 1;
      min-width: 0;
    }

    .iteration-name {
      font-size: 14px;
      font-weight: 600;
      color: #262626;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .iteration-meta {
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

    .status-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 30px;
      font-size: 11px;
      font-weight: 500;
    }

    .status-planning {
      background: #f5f5f5;
      color: #8c8c8c;
    }

    .status-active {
      background: #e6f7ff;
      color: #0958d9;
    }

    .status-completed {
      background: #f6ffed;
      color: #389e0d;
    }

    .status-archived {
      background: #f5f5f5;
      color: #8c8c8c;
    }

    .progress-bar {
      width: 80px;
      height: 6px;
      background: #f0f0f0;
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: #52c41a;
      border-radius: 3px;
      transition: width 0.3s ease;
    }

    .empty {
      padding: 60px 20px;
      text-align: center;
      color: #8c8c8c;
      font-size: 14px;
    }

    .empty-icon {
      width: 48px;
      height: 48px;
      margin: 0 auto 16px;
      border-radius: 50%;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #d9d9d9;
    }
  `;

  @property({ type: Array })
  iterations: IterationListItem[] = [];

  @property({ type: String })
  selectedId: string | null = null;

  @property({ type: Boolean })
  showActions = true;

  render() {
    return html`
      <div class="container">
        ${this._renderHeader()}
        ${this._renderList()}
      </div>
    `;
  }

  private _renderHeader() {
    return html`
      <div class="header">
        <h2>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/>
            <path d="M10 6v4l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          迭代列表
        </h2>
        ${this.showActions ? html`
          <div class="header-actions">
            <button class="btn btn-secondary" @click=${() => this._handleRefresh()}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M11.67 3.33a7 7 0 100 7.34M11.67 3.33V7m0-3.67H8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
              </svg>
              刷新
            </button>
            <button class="btn btn-primary" @click=${() => this._handleCreate()}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 3v8M3 7h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              新建迭代
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }

  private _renderList() {
    if (this.iterations.length === 0) {
      return html`
        <div class="empty">
          <div class="empty-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
              <path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </div>
          暂无迭代数据<br/>点击"新建迭代"创建第一个迭代
        </div>
      `;
    }

    return html`
      <div class="iteration-list">
        ${this.iterations.map(iter => this._renderItem(iter))}
      </div>
    `;
  }

  private _renderItem(iter: IterationListItem) {
    const statusClass = `status-${iter.status}`;
    const iconClass = iter.status === 'active' ? 'active' : iter.status === 'completed' ? 'completed' : '';
    const isActive = this.selectedId === iter.id;

    const startDate = new Date(iter.startDate).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
    const endDate = new Date(iter.endDate).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
    const progress = iter.progress || 0;

    return html`
      <div class="iteration-item ${isActive ? 'active' : ''}" @click=${() => this._handleSelect(iter)}>
        <div class="iteration-icon ${iconClass}">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/>
            <path d="M10 6v4l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="iteration-info">
          <div class="iteration-name">${iter.name}</div>
          <div class="iteration-meta">
            <div class="meta-item">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 2v8M2 6h8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
              </svg>
              ${startDate} - ${endDate}
            </div>
            ${iter.stats ? html`
              <div class="meta-item">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <rect x="2" y="2" width="8" height="8" rx="1" stroke="currentColor" stroke-width="1"/>
                </svg>
                ${iter.stats.completed}/${iter.stats.total}
              </div>
            ` : ''}
            <span class="status-badge ${statusClass}">
              ${this._getStatusText(iter.status)}
            </span>
          </div>
        </div>
        ${iter.progress !== undefined ? html`
          <div class="progress-section">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <div style="font-size: 11px; color: #8c8c8c; margin-top: 2px; text-align: right;">${progress}%</div>
          </div>
        ` : ''}
      </div>
    `;
  }

  private _getStatusText(status: string): string {
    const map: Record<string, string> = {
      planning: '规划中',
      active: '进行中',
      completed: '已完成',
      archived: '已归档',
    };
    return map[status] || status;
  }

  private _handleSelect(iter: IterationListItem) {
    this.selectedId = iter.id;
    this.dispatchEvent(new CustomEvent("iteration-select", {
      detail: { iteration: iter },
      bubbles: true,
      composed: true,
    }));
  }

  private _handleCreate() {
    this.dispatchEvent(new CustomEvent("iteration-create", {
      bubbles: true,
      composed: true,
    }));
  }

  private _handleRefresh() {
    this.dispatchEvent(new CustomEvent("iteration-refresh", {
      bubbles: true,
      composed: true,
    }));
  }
}
