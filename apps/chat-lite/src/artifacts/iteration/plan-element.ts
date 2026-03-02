import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

export interface WorkItem {
  id: string;
  type: "requirement" | "task" | "defect";
  title: string;
  status: string;
  assignee?: {
    name: string;
    email: string;
  };
  iterationId?: string;
}

export interface IterationPlanData {
  iterationId: string;
  requirement_ids?: string[];
  task_ids?: string[];
  defect_ids?: string[];
}

@customElement("chatlite-iteration-plan")
export class IterationPlanArtifact extends LitElement {
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
      display: flex;
      flex-direction: column;
      height: 600px;
    }

    .header {
      padding: 20px 24px;
      border-bottom: 1px solid #f0f0f0;
      background: #fafafa;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }

    .header h2 {
      font-size: 18px;
      font-weight: 600;
      color: #1f1f1f;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .body {
      flex: 1;
      display: flex;
      overflow: hidden;
    }

    .panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .panel-left {
      border-right: 1px solid #f0f0f0;
      background: #fafbfc;
    }

    .panel-header {
      padding: 16px 20px;
      border-bottom: 1px solid #e5e6e8;
      background: white;
      flex-shrink: 0;
    }

    .panel-title {
      font-size: 14px;
      font-weight: 600;
      color: #1f2329;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    .panel-count {
      font-size: 12px;
      color: #646a73;
      background: #f2f3f5;
      padding: 2px 8px;
      border-radius: 4px;
    }

    .search-box {
      position: relative;
    }

    .search-box input {
      width: 100%;
      padding: 8px 12px 8px 36px;
      border: 1px solid #c9cdd4;
      border-radius: 6px;
      font-size: 13px;
      color: #1f2329;
    }

    .search-box input:focus {
      outline: none;
      border-color: #00b42a;
      box-shadow: 0 0 0 2px rgba(0, 180, 42, 0.2);
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #8f959e;
    }

    .panel-content {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
    }

    .workitem-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .workitem-card {
      padding: 12px 16px;
      background: white;
      border: 1px solid #e5e6e8;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .workitem-card:hover {
      border-color: #00b42a;
      box-shadow: 0 2px 8px rgba(0, 180, 42, 0.15);
      transform: translateY(-1px);
    }

    .workitem-card.selected {
      border-color: #00b42a;
      background: #f6ffed;
    }

    .workitem-card.assigned {
      opacity: 0.6;
      background: #f5f5f5;
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
      flex-shrink: 0;
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

    .workitem-info {
      flex: 1;
      min-width: 0;
    }

    .workitem-title {
      font-size: 14px;
      font-weight: 500;
      color: #1f2329;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .workitem-meta {
      display: flex;
      gap: 12px;
      font-size: 12px;
      color: #8f959e;
    }

    .assignee-avatar {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #1890ff;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 600;
    }

    .footer {
      padding: 16px 24px;
      border-top: 1px solid #f0f0f0;
      background: #fafafa;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
    }

    .stats {
      display: flex;
      gap: 24px;
      font-size: 13px;
      color: #646a73;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .actions {
      display: flex;
      gap: 12px;
    }

    .btn {
      padding: 10px 20px;
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

    .btn-default {
      background: white;
      color: #595959;
      border: 1px solid #d9d9d9;
    }

    .btn-default:hover {
      color: #00b42a;
      border-color: #00b42a;
    }

    .btn-primary {
      background: #00b42a;
      color: white;
    }

    .btn-primary:hover {
      background: #23c343;
    }

    .empty {
      padding: 40px 20px;
      text-align: center;
      color: #8f959e;
      font-size: 14px;
    }

    .empty-icon {
      width: 48px;
      height: 48px;
      margin: 0 auto 16px;
      border-radius: 50%;
      background: #f2f3f5;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #c9cdd4;
    }
  `;

  @property({ type: String })
  iterationId: string = "";

  @property({ type: Array })
  availableWorkitems: WorkItem[] = [];

  @property({ type: Array })
  assignedWorkitems: WorkItem[] = [];

  @property({ type: Array })
  selectedIds: string[] = [];

  render() {
    return html`
      <div class="container">
        ${this._renderHeader()}
        ${this._renderBody()}
        ${this._renderFooter()}
      </div>
    `;
  }

  private _renderHeader() {
    return html`
      <div class="header">
        <h2>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="3" y="3" width="14" height="14" rx="2" stroke="#00b42a" stroke-width="1.5"/>
            <path d="M7 7h6M7 10h6M7 13h3" stroke="#00b42a" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          规划迭代
        </h2>
      </div>
    `;
  }

  private _renderBody() {
    return html`
      <div class="body">
        ${this._renderLeftPanel()}
        ${this._renderRightPanel()}
      </div>
    `;
  }

  private _renderLeftPanel() {
    const unassigned = this.availableWorkitems.filter(w => !w.iterationId);

    return html`
      <div class="panel panel-left">
        <div class="panel-header">
          <div class="panel-title">
            待规划工作项
            <span class="panel-count">${unassigned.length}个</span>
          </div>
          <div class="search-box">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.2"/>
              <path d="M11 11l3 3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
            </svg>
            <input 
              type="text" 
              placeholder="搜索工作项..."
              @input=${(e: any) => this._handleSearch(e.target.value)}
            />
          </div>
        </div>
        <div class="panel-content">
          ${unassigned.length === 0 ? html`
            <div class="empty">
              <div class="empty-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </div>
              暂无待规划工作项
            </div>
          ` : html`
            <div class="workitem-list">
              ${unassigned.map(item => this._renderWorkitemCard(item, false))}
            </div>
          `}
        </div>
      </div>
    `;
  }

  private _renderRightPanel() {
    const assigned = this.assignedWorkitems.filter(w => w.iterationId === this.iterationId);

    return html`
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">
            已规划工作项
            <span class="panel-count">${assigned.length}个</span>
          </div>
        </div>
        <div class="panel-content">
          ${assigned.length === 0 ? html`
            <div class="empty">
              <div class="empty-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5"/>
                </svg>
              </div>
              暂无已规划工作项<br/>从左侧选择添加
            </div>
          ` : html`
            <div class="workitem-list">
              ${assigned.map(item => this._renderWorkitemCard(item, true))}
            </div>
          `}
        </div>
      </div>
    `;
  }

  private _renderWorkitemCard(item: WorkItem, isAssigned: boolean) {
    const isSelected = this.selectedIds.includes(item.id);

    return html`
      <div 
        class="workitem-card ${isSelected ? 'selected' : ''} ${isAssigned ? 'assigned' : ''}"
        @click=${() => this._handleWorkitemClick(item, isAssigned)}
      >
        <div class="type-icon ${item.type}">
          ${item.type === 'requirement' ? '需' : item.type === 'task' ? '任' : '缺'}
        </div>
        <div class="workitem-info">
          <div class="workitem-title">${item.title}</div>
          <div class="workitem-meta">
            ${item.assignee ? html`
              <div style="display: flex; align-items: center; gap: 4px;">
                <div class="assignee-avatar">${item.assignee.name[0].toUpperCase()}</div>
                <span>${item.assignee.name}</span>
              </div>
            ` : html`<span>未分配</span>`}
          </div>
        </div>
      </div>
    `;
  }

  private _renderFooter() {
    const selectedCount = this.selectedIds.length;
    const assignedCount = this.assignedWorkitems.filter(w => w.iterationId === this.iterationId).length;

    return html`
      <div class="footer">
        <div class="stats">
          <div class="stat-item">
            <span>已选择：${selectedCount}个</span>
          </div>
          <div class="stat-item" style="margin-left: 16px;">
            <span>已规划：${assignedCount}个</span>
          </div>
        </div>
        <div class="actions">
          <button class="btn btn-default" @click=${() => this._handleCancel()}>
            取消
          </button>
          <button 
            class="btn btn-primary" 
            @click=${() => this._handleSave()}
            ?disabled=${selectedCount === 0}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M8 3v10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            确认规划
          </button>
        </div>
      </div>
    `;
  }

  private _handleSearch(query: string) {
    // TODO: 实现搜索过滤
    console.log("Search:", query);
  }

  private _handleWorkitemClick(item: WorkItem, isAssigned: boolean) {
    if (isAssigned) {
      // 已分配的点击移除
      this._removeWorkitem(item);
    } else {
      // 未分配的点击选择/取消选择
      if (this.selectedIds.includes(item.id)) {
        this.selectedIds = this.selectedIds.filter(id => id !== item.id);
      } else {
        this.selectedIds = [...this.selectedIds, item.id];
      }
    }
    this.requestUpdate();
  }

  private _addWorkitem(item: WorkItem) {
    this.dispatchEvent(new CustomEvent("iteration-plan-add", {
      detail: { workitem: item },
      bubbles: true,
      composed: true,
    }));
  }

  private _removeWorkitem(item: WorkItem) {
    this.dispatchEvent(new CustomEvent("iteration-plan-remove", {
      detail: { workitem: item },
      bubbles: true,
      composed: true,
    }));
  }

  private _handleCancel() {
    this.dispatchEvent(new CustomEvent("iteration-plan-cancel", {
      bubbles: true,
      composed: true,
    }));
  }

  private _handleSave() {
    if (this.selectedIds.length === 0) return;

    this.dispatchEvent(new CustomEvent("iteration-plan-save", {
      detail: {
        iterationId: this.iterationId,
        workitemIds: this.selectedIds,
      },
      bubbles: true,
      composed: true,
    }));
  }
}
