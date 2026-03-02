import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";

export interface NewAgentData {
  name: string;
  description: string;
  gatewayUrl: string;
  gatewayToken: string;
  model: string;
  skills: string[];
}

@customElement("chatlite-add-agent-dialog")
export class AddAgentDialog extends LitElement {
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

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 20px 24px;
      border-top: 1px solid #e5e7eb;
      background: #f9fafb;
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

    .btn-primary:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }
  `;

  @state()
  private formData: NewAgentData = {
    name: '',
    description: '',
    gatewayUrl: '',
    gatewayToken: '',
    model: 'bailian/qwen3.5-plus',
    skills: []
  };

  @state()
  private errors: Record<string, string> = {};

  @state()
  private isSubmitting = false;

  render() {
    return html`
      <div class="dialog" @click=${this._handleDialogClick}>
        <div class="dialog-header">
          <h2>🤖 添加智能体</h2>
          <button class="close-btn" @click=${this._handleClose}>✕</button>
        </div>

        <div class="dialog-body">
          <div class="form-group">
            <label>智能体名称 *</label>
            <input
              type="text"
              value=${this.formData.name}
              @input=${(e: any) => this._updateField('name', e.target.value)}
              placeholder="例如：客服助手"
              required
            />
            ${this.errors.name ? html`<small style="color: #ef4444">${this.errors.name}</small>` : ''}
          </div>

          <div class="form-group">
            <label>描述</label>
            <textarea
              value=${this.formData.description}
              @input=${(e: any) => this._updateField('description', e.target.value)}
              placeholder="描述智能体的用途和功能"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Gateway 地址 *</label>
            <input
              type="text"
              value=${this.formData.gatewayUrl}
              @input=${(e: any) => this._updateField('gatewayUrl', e.target.value)}
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
              value=${this.formData.gatewayToken}
              @input=${(e: any) => this._updateField('gatewayToken', e.target.value)}
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
                value=${this.formData.model}
                @change=${(e: any) => this._updateField('model', e.target.value)}
              >
                <option value="bailian/qwen3.5-plus">通义千问 3.5 Plus</option>
                <option value="deepseek-chat">DeepSeek Chat</option>
                <option value="glm-4">GLM-4</option>
                <option value="kimi-k2.5">Kimi K2.5</option>
              </select>
            </div>

            <div class="form-group">
              <label>技能数量</label>
              <input
                type="number"
                value=${this.formData.skills.length}
                @input=${(e: any) => this._updateField('skills', new Array(parseInt(e.target.value) || 0).fill(''))}
                min="0"
                max="10"
              />
              <small>最多 10 个技能</small>
            </div>
          </div>

          ${this.formData.skills.length > 0 ? html`
            <div class="form-group">
              <label>技能列表</label>
              ${this.formData.skills.map((skill: string, index: number) => html`
                <input
                  type="text"
                  value=${skill}
                  @input=${(e: any) => this._updateSkill(index, e.target.value)}
                  placeholder="技能 ${index + 1}"
                  style="margin-bottom: 8px"
                />
              `)}
            </div>
          ` : ''}
        </div>

        <div class="dialog-footer">
          <button class="btn btn-secondary" @click=${this._handleClose}>取消</button>
          <button 
            class="btn btn-primary" 
            @click=${this._handleSubmit}
            ?disabled=${this.isSubmitting || !this._validateForm()}
          >
            ${this.isSubmitting ? '添加中...' : '添加智能体'}
          </button>
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

  private _updateSkill(index: number, value: string) {
    const newSkills = [...this.formData.skills];
    newSkills[index] = value;
    this.formData = { ...this.formData, skills: newSkills };
  }

  private _validateForm(): boolean {
    const errors: Record<string, string> = {};

    if (!this.formData.name.trim()) {
      errors.name = '请输入智能体名称';
    }

    if (!this.formData.gatewayUrl.trim()) {
      errors.gatewayUrl = '请输入 Gateway 地址';
    } else if (!this.formData.gatewayUrl.startsWith('ws://')) {
      errors.gatewayUrl = 'Gateway 地址必须以 ws:// 开头';
    }

    if (!this.formData.gatewayToken.trim()) {
      errors.gatewayToken = '请输入 Gateway Token';
    }

    this.errors = errors;
    return Object.keys(errors).length === 0;
  }

  private async _handleSubmit() {
    if (!this._validateForm()) return;

    this.isSubmitting = true;

    try {
      // 验证 Gateway 连接
      const agentData = {
        id: `agent-${Date.now()}`,
        name: this.formData.name,
        description: this.formData.description,
        gateway: {
          url: this.formData.gatewayUrl,
          token: this.formData.gatewayToken,
          type: this.formData.gatewayUrl.includes('127.0.0.1') ? 'local' : 'public'
        },
        model: this.formData.model,
        skills: this.formData.skills.filter(s => s.trim()),
        status: 'active' as const,
        priority: 99,
        createdAt: new Date().toISOString()
      };

      // 触发自定义事件，由父组件处理添加逻辑
      this.dispatchEvent(new CustomEvent('add-agent', {
        detail: agentData,
        bubbles: true,
        composed: true
      }));

      console.log('✅ 智能体添加成功:', agentData);
      this._handleClose();
    } catch (error) {
      console.error('❌ 添加智能体失败:', error);
      this.errors.form = '添加失败，请重试';
    } finally {
      this.isSubmitting = false;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "chatlite-add-agent-dialog": AddAgentDialog;
  }
}
