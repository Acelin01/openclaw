import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";

export interface TestCase {
  id: string;
  tcId: string;  // TC-001
  title: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'passed' | 'failed' | 'blocked';
  steps: string[];
  expectedResult: string;
  actualResult?: string;
  executor?: string;
  executedAt?: number;
  notes?: string;
}

@customElement("chatlite-testcase-library")
export class TestCaseLibrary extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 20px;
      background: white;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 2px solid #e5e7eb;
    }

    .header h2 {
      margin: 0;
      color: #111827;
      font-size: 1.5rem;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .btn {
      padding: 8px 16px;
      border-radius: 6px;
      border: none;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-primary:hover {
      background: #2563eb;
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
    }

    .btn-secondary:hover {
      background: #e5e7eb;
    }

    .filters {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .filter-select {
      padding: 8px 12px;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
      font-size: 14px;
      background: white;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }

    .stat-card {
      background: #f9fafb;
      padding: 16px;
      border-radius: 8px;
      text-align: center;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #111827;
    }

    .stat-label {
      font-size: 13px;
      color: #6b7280;
      margin-top: 4px;
    }

    .testcase-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .testcase-item {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      transition: all 0.2s;
      cursor: pointer;
    }

    .testcase-item:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      border-color: #3b82f6;
    }

    .testcase-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .testcase-id {
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      background: #f3f4f6;
      padding: 4px 8px;
      border-radius: 4px;
    }

    .testcase-title {
      font-size: 15px;
      font-weight: 600;
      color: #111827;
      margin: 8px 0;
    }

    .testcase-meta {
      display: flex;
      gap: 12px;
      font-size: 13px;
      color: #6b7280;
      margin-bottom: 8px;
    }

    .priority-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .priority-high { background: #fee2e2; color: #991b1b; }
    .priority-medium { background: #fef3c7; color: #92400e; }
    .priority-low { background: #dbeafe; color: #1e40af; }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-pending { background: #f3f4f6; color: #6b7280; }
    .status-passed { background: #d1fae5; color: #065f46; }
    .status-failed { background: #fee2e2; color: #991b1b; }
    .status-blocked { background: #fef3c7; color: #92400e; }

    .testcase-steps {
      font-size: 13px;
      color: #4b5563;
      line-height: 1.6;
      margin-top: 8px;
      padding-left: 16px;
    }

    .testcase-steps li {
      margin-bottom: 4px;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #9ca3af;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      color: #6b7280;
    }
  `;

  @state()
  private testCases: TestCase[] = [];

  @state()
  private filterCategory: string = 'all';

  @state()
  private filterPriority: string = 'all';

  @state()
  private filterStatus: string = 'all';

  render() {
    const filteredCases = this.getFilteredCases();
    const stats = this.calculateStats();

    return html`
      <div class="header">
        <h2>📋 测试用例库</h2>
        <div class="header-actions">
          <button class="btn btn-secondary" @click=${this._handleExport}>
            📥 导出
          </button>
          <button class="btn btn-primary" @click=${this._handleAddCase}>
            + 添加用例
          </button>
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="stats">
        <div class="stat-card">
          <div class="stat-value">${stats.total}</div>
          <div class="stat-label">总用例数</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: #10b981">${stats.passed}</div>
          <div class="stat-label">已通过</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: #ef4444">${stats.failed}</div>
          <div class="stat-label">已失败</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: #6b7280">${stats.pending}</div>
          <div class="stat-label">待执行</div>
        </div>
      </div>

      <!-- 过滤器 -->
      <div class="filters">
        <select 
          class="filter-select"
          value=${this.filterCategory}
          @change=${(e: any) => this.filterCategory = e.target.value}
        >
          <option value="all">所有类别</option>
          <option value="基础功能">基础功能</option>
          <option value="智能体管理">智能体管理</option>
          <option value="消息路由">消息路由</option>
          <option value="界面交互">界面交互</option>
          <option value="性能与稳定性">性能与稳定性</option>
        </select>

        <select 
          class="filter-select"
          value=${this.filterPriority}
          @change=${(e: any) => this.filterPriority = e.target.value}
        >
          <option value="all">所有优先级</option>
          <option value="high">🔴 高</option>
          <option value="medium">🟡 中</option>
          <option value="low">🟢 低</option>
        </select>

        <select 
          class="filter-select"
          value=${this.filterStatus}
          @change=${(e: any) => this.filterStatus = e.target.value}
        >
          <option value="all">所有状态</option>
          <option value="pending">待执行</option>
          <option value="passed">已通过</option>
          <option value="failed">已失败</option>
          <option value="blocked">已阻塞</option>
        </select>
      </div>

      <!-- 用例列表 -->
      ${filteredCases.length > 0 ? html`
        <div class="testcase-list">
          ${filteredCases.map(tc => html`
            <div class="testcase-item" @click=${() => this._handleClickCase(tc)}>
              <div class="testcase-header">
                <span class="testcase-id">${tc.tcId}</span>
                <span class="status-badge status-${tc.status}">
                  ${tc.status === 'pending' && '⏳'}
                  ${tc.status === 'passed' && '✅'}
                  ${tc.status === 'failed' && '❌'}
                  ${tc.status === 'blocked' && '🚫'}
                  ${this._getStatusText(tc.status)}
                </span>
              </div>

              <div class="testcase-title">${tc.title}</div>

              <div class="testcase-meta">
                <span>📁 ${tc.category}</span>
                <span class="priority-badge priority-${tc.priority}">
                  ${tc.priority === 'high' && '🔴'}
                  ${tc.priority === 'medium' && '🟡'}
                  ${tc.priority === 'low' && '🟢'}
                  ${this._getPriorityText(tc.priority)}
                </span>
                ${tc.executor ? html`<span>👤 ${tc.executor}</span>` : ''}
              </div>

              <ol class="testcase-steps">
                ${tc.steps.slice(0, 3).map(step => html`<li>${step}</li>`)}
                ${tc.steps.length > 3 ? html`<li>... 共${tc.steps.length}步</li>` : ''}
              </ol>
            </div>
          `)}
        </div>
      ` : html`
        <div class="empty-state">
          <h3>暂无测试用例</h3>
          <p>点击右上角添加第一个测试用例</p>
        </div>
      `}
    `;
  }

  private getFilteredCases(): TestCase[] {
    return this.testCases.filter(tc => {
      const matchCategory = this.filterCategory === 'all' || tc.category === this.filterCategory;
      const matchPriority = this.filterPriority === 'all' || tc.priority === this.filterPriority;
      const matchStatus = this.filterStatus === 'all' || tc.status === this.filterStatus;
      return matchCategory && matchPriority && matchStatus;
    });
  }

  private calculateStats() {
    return {
      total: this.testCases.length,
      passed: this.testCases.filter(tc => tc.status === 'passed').length,
      failed: this.testCases.filter(tc => tc.status === 'failed').length,
      pending: this.testCases.filter(tc => tc.status === 'pending').length
    };
  }

  private _getStatusText(status: string): string {
    const map: Record<string, string> = {
      pending: '待执行',
      passed: '已通过',
      failed: '已失败',
      blocked: '已阻塞'
    };
    return map[status] || status;
  }

  private _getPriorityText(priority: string): string {
    const map: Record<string, string> = {
      high: '高',
      medium: '中',
      low: '低'
    };
    return map[priority] || priority;
  }

  private _handleAddCase() {
    console.log('添加测试用例');
    // TODO: 打开添加对话框
  }

  private _handleExport() {
    console.log('导出测试用例');
    // TODO: 导出功能
  }

  private _handleClickCase(tc: TestCase) {
    console.log('查看测试用例详情:', tc.tcId);
    // TODO: 显示详情
  }

  // 外部调用方法
  public loadTestCases(cases: TestCase[]) {
    this.testCases = cases;
    this.requestUpdate();
  }

  public addTestCase(tc: TestCase) {
    this.testCases.push(tc);
    this.requestUpdate();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "chatlite-testcase-library": TestCaseLibrary;
  }
}
