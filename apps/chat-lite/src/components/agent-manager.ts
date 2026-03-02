import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { AgentConfig, AgentStatus } from "../lib/multi-agent-client";

@customElement("chatlite-agent-manager")
export class AgentManager extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 20px;
      background: #f9fafb;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .header h2 {
      margin: 0;
      color: #111827;
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

    .agent-list {
      display: grid;
      gap: 16px;
    }

    .agent-card {
      background: white;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.2s;
    }

    .agent-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transform: translateY(-2px);
    }

    .agent-info {
      flex: 1;
    }

    .agent-name {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 4px;
    }

    .agent-description {
      font-size: 13px;
      color: #6b7280;
      margin-bottom: 8px;
    }

    .agent-meta {
      display: flex;
      gap: 12px;
      font-size: 12px;
      color: #6b7280;
    }

    .agent-meta span {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .agent-status {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 500;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .status-dot.online {
      background: #10b981;
      animation: pulse 2s infinite;
    }

    .status-dot.offline {
      background: #ef4444;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .agent-actions {
      display: flex;
      gap: 8px;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 13px;
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
    }

    .btn-secondary:hover {
      background: #e5e7eb;
    }

    .btn-danger {
      background: #fee2e2;
      color: #dc2626;
    }

    .btn-danger:hover {
      background: #fecaca;
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
  private agents: AgentConfig[] = [];

  @state()
  private statusList: AgentStatus[] = [];

  render() {
    return html`
      <div class="header">
        <h2>🤖 智能体管理</h2>
        <button class="btn btn-primary" @click=${this._handleAddAgent}>
          + 添加智能体
        </button>
      </div>

      ${this.agents.length > 0 ? html`
        <div class="agent-list">
          ${this.agents.map(agent => {
            const status = this.statusList.find(s => s.id === agent.id);
            return html`
              <div class="agent-card">
                <div class="agent-info">
                  <div class="agent-name">${agent.name}</div>
                  <div class="agent-description">${agent.description || '暂无描述'}</div>
                  <div class="agent-meta">
                    <span>🌐 ${agent.gateway.url}</span>
                    <span>🧠 ${agent.model}</span>
                    <span>🛠️ ${agent.skills.length} 个技能</span>
                    ${status ? html`
                      <span>💬 ${status.messageCount} 条消息</span>
                    ` : ''}
                  </div>
                </div>

                <div class="agent-status">
                  <div class="status-indicator">
                    <span class="status-dot ${status?.connected ? 'online' : 'offline'}"></span>
                    ${status?.connected ? '在线' : '离线'}
                  </div>

                  <div class="agent-actions">
                    <button 
                      class="btn btn-secondary btn-sm"
                      @click=${() => this._handleToggleAgent(agent.id, !status?.connected)}
                    >
                      ${status?.connected ? '禁用' : '启用'}
                    </button>
                    <button 
                      class="btn btn-secondary btn-sm"
                      @click=${() => this._handleEditAgentClick(agent.id)}
                    >
                      编辑
                    </button>
                    <button 
                      class="btn btn-danger btn-sm"
                      @click=${() => this._handleDeleteAgent(agent.id)}
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            `;
          })}
        </div>
      ` : html`
        <div class="empty-state">
          <h3>暂无智能体</h3>
          <p>点击右上角添加第一个智能体</p>
        </div>
      `}
    `;
  }

  private _handleAddAgent() {
    // 触发自定义事件，由父组件处理
    this.dispatchEvent(new CustomEvent('show-add-agent', {
      bubbles: true,
      composed: true
    }));
  }

  private _handleEditAgentClick(agentId: string) {
    // 触发自定义事件，由父组件处理
    this.dispatchEvent(new CustomEvent('show-edit-agent', {
      detail: { agentId },
      bubbles: true,
      composed: true
    }));
  }

  private _handleEditAgent(agent: AgentConfig) {
    console.log('编辑智能体:', agent);
    // TODO: 打开编辑对话框
  }

  private _handleDeleteAgent(agentId: string) {
    if (confirm('确定要删除这个智能体吗？')) {
      console.log('删除智能体:', agentId);
      // TODO: 实现删除逻辑
    }
  }

  private _handleToggleAgent(agentId: string, enable: boolean) {
    console.log(`${enable ? '启用' : '禁用'}智能体:`, agentId);
    // TODO: 实现启用/禁用逻辑
  }

  // 外部调用方法
  public loadAgents(agents: AgentConfig[], statusList: AgentStatus[]) {
    this.agents = agents;
    this.statusList = statusList;
    this.requestUpdate();
  }

  public refreshStatus(statusList: AgentStatus[]) {
    this.statusList = statusList;
    this.requestUpdate();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "chatlite-agent-manager": AgentManager;
  }
}
