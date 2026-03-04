import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

export interface Metric {
  id: string;
  metricType: string;
  metricValue: number;
  metricUnit?: string;
  period?: string;
  recordedAt?: string;
  project?: {
    id: string;
    name: string;
  };
}

export interface MetricListContent {
  kind: "metric-list";
  metrics: Metric[];
  projectId?: string;
  title?: string;
}

@customElement("chatlite-metric-list")
export class ChatliteMetricList extends LitElement {
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
      color: #722ed1;
    }

    .metric-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      padding: 24px;
    }

    .metric-card {
      background: #fafafa;
      border-radius: 8px;
      padding: 16px;
      border: 1px solid #e8e8e8;
    }

    .metric-type {
      font-size: 12px;
      color: #8c8c8c;
      margin-bottom: 8px;
      text-transform: uppercase;
    }

    .metric-value {
      font-size: 28px;
      font-weight: 600;
      color: #722ed1;
      margin-bottom: 4px;
    }

    .metric-unit {
      font-size: 14px;
      color: #595959;
    }

    .metric-project {
      font-size: 12px;
      color: #8c8c8c;
      margin-top: 8px;
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
  content: MetricListContent | null = null;

  private getMetricTypeName(type: string): string {
    const typeMap: Record<string, string> = {
      'total_tasks': '总任务数',
      'completed_tasks': '已完成任务',
      'total_defects': '总缺陷数',
      'open_defects': '打开缺陷',
      'total_requirements': '总需求数',
      'completed_requirements': '已完成需求'
    };
    return typeMap[type] || type;
  }

  render() {
    if (!this.content || !this.content.metrics || this.content.metrics.length === 0) {
      return html`
        <div class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M18 20V10" stroke-linecap="round"/>
            <path d="M12 20V4" stroke-linecap="round"/>
            <path d="M6 20V14" stroke-linecap="round"/>
          </svg>
          <p style="margin-top: 16px;">暂无度量数据</p>
        </div>
      `;
    }

    const metrics = this.content.metrics;

    return html`
      <div class="metric-list">
        <div class="card-header">
          <h2>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 4H16V16H4V4Z" stroke="#722ed1" stroke-width="1.8" stroke-linejoin="round"/>
              <circle cx="10" cy="10" r="2" fill="#722ed1"/>
              <path d="M4 8H16M4 12H16" stroke="#722ed1" stroke-width="1.8"/>
            </svg>
            ${this.content.title || '项目度量'}
          </h2>
        </div>

        <div class="metric-grid">
          ${metrics.map((metric) => {
            return html`
              <div class="metric-card">
                <div class="metric-type">${this.getMetricTypeName(metric.metricType)}</div>
                <div class="metric-value">${metric.metricValue}</div>
                <div class="metric-unit">${metric.metricUnit || '个'}</div>
                ${metric.project ? html`
                  <div class="metric-project">${metric.project.name}</div>
                ` : ''}
              </div>
            `;
          })}
        </div>

        <div class="card-footer">
          <span>共 ${metrics.length} 条度量数据</span>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "chatlite-metric-list": ChatliteMetricList;
  }
}
