import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

export interface WorkHour {
  id: string;
  hours: number;
  description?: string;
  workDate: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  task?: {
    id: string;
    title: string;
  };
  project?: {
    id: string;
    name: string;
  };
}

export interface WorkHourListContent {
  kind: "workhour-list";
  workHours: WorkHour[];
  projectId?: string;
  title?: string;
  totalHours?: number;
}

@customElement("chatlite-workhour-list")
export class ChatliteWorkHourList extends LitElement {
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

    .total-hours {
      font-size: 14px;
      color: #595959;
    }

    .total-hours strong {
      color: #1890ff;
      font-size: 18px;
    }

    .table-responsive {
      overflow-x: auto;
      padding: 0 0 8px 0;
    }

    .workhour-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }

    .workhour-table th {
      background: #fafafa;
      padding: 14px 16px;
      text-align: left;
      font-weight: 500;
      color: #595959;
      border-bottom: 1px solid #f0f0f0;
    }

    .workhour-table td {
      padding: 14px 16px;
      border-bottom: 1px solid #f0f0f0;
      color: #262626;
    }

    .workhour-table tbody tr:hover {
      background: #fafafa;
    }

    .hours-value {
      font-weight: 600;
      color: #1890ff;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .user-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #1890ff;
      color: white;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
    }

    .empty-state {
      padding: 60px 24px;
      text-align: center;
      color: #8c8c8c;
    }

    .card-footer {
      padding: 16px 24px;
      border-top: 1px solid #f0f0f0;
      background: #fafafa;
      font-size: 13px;
      color: #8c8c8c;
      text-align: right;
    }
  `;

  @property({ type: Object })
  content: WorkHourListContent | null = null;

  render() {
    if (!this.content || !this.content.workHours || this.content.workHours.length === 0) {
      return html`
        <div class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10" stroke-linecap="round"/>
            <path d="M12 6V12L16 14" stroke-linecap="round"/>
          </svg>
          <p style="margin-top: 16px;">暂无工时数据</p>
        </div>
      `;
    }

    const workHours = this.content.workHours;
    const totalHours = this.content.totalHours || workHours.reduce((sum, wh) => sum + wh.hours, 0);

    return html`
      <div class="workhour-list">
        <div class="card-header">
          <h2>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 4H16V16H4V4Z" stroke="#1890ff" stroke-width="1.8" stroke-linejoin="round"/>
              <circle cx="10" cy="10" r="2" fill="#1890ff"/>
              <path d="M4 8H16M4 12H16" stroke="#1890ff" stroke-width="1.8"/>
            </svg>
            ${this.content.title || '工时统计'}
          </h2>
          <div class="total-hours">
            总计：<strong>${totalHours.toFixed(1)}</strong> 小时
          </div>
        </div>

        <div class="table-responsive">
          <table class="workhour-table">
            <thead>
              <tr>
                <th>日期</th>
                <th>负责人</th>
                <th>任务</th>
                <th>工时</th>
                <th>描述</th>
              </tr>
            </thead>
            <tbody>
              ${workHours.map((wh) => {
                return html`
                  <tr>
                    <td>${wh.workDate}</td>
                    <td>
                      ${wh.user ? html`
                        <div class="user-info">
                          <span class="user-avatar">${wh.user.name.charAt(0).toUpperCase()}</span>
                          <span>${wh.user.name}</span>
                        </div>
                      ` : html`<span style="color:#8c8c8c;">未分配</span>`}
                    </td>
                    <td>${wh.task?.title || '-'}</td>
                    <td><span class="hours-value">${wh.hours}</span></td>
                    <td style="color: #595959;">${wh.description || '-'}</td>
                  </tr>
                `;
              })}
            </tbody>
          </table>
        </div>

        <div class="card-footer">
          <span>共 ${workHours.length} 条工时记录</span>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "chatlite-workhour-list": ChatliteWorkHourList;
  }
}
