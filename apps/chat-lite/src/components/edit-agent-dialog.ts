import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { AgentConfig } from "../lib/multi-agent-client";

export interface EditAgentData extends AgentConfig {
  id: string;
}

@customElement("chatlite-edit-agent-dialog")
export class EditAgentDialog extends LitElement {
  static styles = css`
    :host {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .dialog {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #e5e7eb;
    }

    .dialog-header h2 {
      margin: 0;
      font-size: 1.25rem;
      color: #111827;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #6b7280;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .close-btn:hover {
      background: #f3f4f6;
      color: #111827;
    }

    .dialog-body {
      padding: 24px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      font-size: 14px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 6px;
    }

    .form-group input,
    .form-group textarea,
    .form-group select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
      transition: all 0.2s;
    }

    .form-group input:focus,
    .form-group textarea:focus,
    .form-group select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-group textarea {
      min-height: 80px;
      resize: vertical;
    }

    .form-group small {
      display: block;
      margin-top: 4px;
      font-size: 12px;
      color: #6b7280;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .status-toggle {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background: #f9fafb;
      border-radius: 6px;
      margin-bottom: 20px;
    }

    .status-toggle input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    .dialog-footer {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 20px 24px;
      border-top: 1px solid #e5e7eb;
      background: #f9fafb;
    }

    .dialog-footer .btn-group {
      display: flex;
      gap: 12px;
    }

    .btn {
      padding: 10px 20px;
      border-radius: 6px;
      border: none;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
    }

    .btn-secondary:hover {
      background: #e5e7eb;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-primary:hover {
      background: #2563eb;
    }

    .btn-danger {
      background: #fee2e2;
      color: #dc2626;
    }

    .btn-danger:hover {
      background: #fecaca;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;

  @state()
  private agent: EditAgentData | null = null;

  @state()
  private formData: Partial<EditAgentData> = {};

  @state()
  private errors: Record<string, string> = {};

  @state()
  private isSubmitting = false;

  firstUpdated() {
    // 初始化表单数据
    if (this.agent) {
      this.formData = { ...this.agent };
    }
  }

  render() {
    if (!this.agent) return html``;

    return html`
      <div class="dialog" @click=${this._handleDialogClick}>
        <div class="dialog-header">
          <h2>✏️ 编辑智能体：${this.agent.name}</h2>
          <button class="close-btn" @click=${this._handleClose}>✕</button>
        </div>

        <div class="dialog-body">
          <div class="status-toggle">
            <input
              type="checkbox"
              id="status"
              ?checked=${this.formData.status === 'active'}
              @change=${(e: any) => this._updateField('status', e.target.checked ? 'active' : 'inactive')}
            />
            <label for="status">启用此智能体</label>
          </div>

          <div class="form-group">
            <label>智能体名称 *</label>
            <input
              type="text"
              value=${this.formData.name || ''}
              @input=${(e: any) => this._updateField('name', e.target.value)}
              placeholder="例如：客服助手"
              required
            />
            ${this.errors.name ? html`<small style="color: #ef4444">${this.errors.name}</small>` : ''}
          </div>

          <div class="form-group">
            <label>描述</label>
            <textarea
              value=${this.formData.description || ''}
              @input=${(e: any) => this._updateField('description', e.target.value)}
              placeholder="描述智能体的用途和功能"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Gateway 地址 *</label>
            <input
              type="text"
              value=${this.formData.gateway?.url || ''}
              @input=${(e: any) => this._updateField('gateway', { ...this.formData.gateway, url: e.target.value })}
              placeholder="ws://127.0.0.1:18789 或 ws://192.168.1.100:18789"
              required
            />
            ${this.errors.gatewayUrl ? html`<small style="color: #ef4444">${this.errors.gatewayUrl}</small>` : ''}
            <small>支持本地 (ws://127.0.0.1) 和远程 (ws://192.168.x.x) 地址</small>
          </div>

          <div class="form-group">
            <label>Gateway Token *</label>
            <input
              type="text"
              value=${this.formData.gateway?.token || ''}
              @input=${(e: any) => this._updateField('gateway', { ...this.formData.gateway, token: e.target.value })}
              placeholder="输入认证 Token"
              required
            />
            ${this.errors.gatewayToken ? html`<small style="color: #ef4444">${this.errors.gatewayToken}</small>` : ''}
            <small>用于 Gateway 认证的 Token</small>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>模型</label>
              <select
                value=${this.formData.model || 'bailian/qwen3.5-plus'}
                @change=${(e: any) => this._updateField('model', e.target.value)}
              >
                <option value="bailian/qwen3.5-plus">通义千问 3.5 Plus</option>
                <option value="deepseek-chat">DeepSeek Chat</option>
                <option value="glm-4">GLM-4</option>
                <option value="kimi-k2.5">Kimi K2.5</option>
              </select>
            </div>

            <div class="form-group">
              <label>优先级</label>
              <input
                type="number"
                value=${this.formData.priority || 99}
                @input=${(e: any) => this._updateField('priority', parseInt(e.target.value))}
                min="1"
                max="99"
              />
              <small>数字越小优先级越高</small>
            </div>
          </div>
        </div>

        <div class="dialog-footer">
          <button 
            class="btn btn-danger" 
            @click=${this._handleDelete}
            ?disabled=${this.isSubmitting}
          >
            删除
          </button>
          
          <div class="btn-group">
            <button class="btn btn-secondary" @click=${this._handleClose}>
              取消
            </button>
            <button 
              class="btn btn-primary" 
              @click=${this._handleSubmit}
              ?disabled=${this.isSubmitting || !this._validateForm()}
            >
              ${this.isSubmitting ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private _handleDialogClick(e: MouseEvent) {
    e.stopPropagation();
  }

  private _handleClose() {
    this.dispatchEvent(new CustomEvent('close'));
  }

  private _updateField(field: string, value: any) {
    this.formData = { ...this.formData, [field]: value };
    this.errors = { ...this.errors, [field]: '' };
  }

  private _validateForm(): boolean {
    const errors: Record<string, string> = {};

    if (!this.formData.name?.trim()) {
      errors.name = '请输入智能体名称';
    }

    if (!this.formData.gateway?.url?.trim()) {
      errors.gatewayUrl = '请输入 Gateway 地址';
    } else if (!this.formData.gateway.url.startsWith('ws://')) {
      errors.gatewayUrl = 'Gateway 地址必须以 ws:// 开头';
    }

    if (!this.formData.gateway?.token?.trim()) {
      errors.gatewayToken = '请输入 Gateway Token';
    }

    this.errors = errors;
    return Object.keys(errors).length === 0;
  }

  private async _handleSubmit() {
    if (!this._validateForm() || !this.agent) return;

    this.isSubmitting = true;

    try {
      const updatedAgent: EditAgentData = {
        ...this.agent,
        ...this.formData,
        gateway: {
          url: this.formData.gateway?.url || '',
          token: this.formData.gateway?.token || '',
          type: this.formData.gateway?.url?.includes('127.0.0.1') ? 'local' : 'public'
        }
      } as EditAgentData;

      // 触发自定义事件，由父组件处理保存逻辑
      this.dispatchEvent(new CustomEvent('save-agent', {
        detail: updatedAgent,
        bubbles: true,
        composed: true
      }));

      console.log('✅ 智能体保存成功:', updatedAgent);
      this._handleClose();
    } catch (error) {
      console.error('❌ 保存智能体失败:', error);
      this.errors.form = '保存失败，请重试';
    } finally {
      this.isSubmitting = false;
    }
  }

  private _handleDelete() {
    if (confirm('确定要删除这个智能体吗？此操作不可恢复。')) {
      // 触发自定义事件，由父组件处理删除逻辑
      this.dispatchEvent(new CustomEvent('delete-agent', {
        detail: { agentId: this.agent!.id },
        bubbles: true,
        composed: true
      }));

      console.log('✅ 智能体删除成功:', this.agent!.id);
      this._handleClose();
    }
  }

  // 外部调用方法
  public setAgent(agent: EditAgentData) {
    this.agent = agent;
    this.formData = { ...agent };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "chatlite-edit-agent-dialog": EditAgentDialog;
  }
}
