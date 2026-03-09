import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { type SkillPattern, getSkillParamTemplate } from "../lib/skill-matcher";

/**
 * 技能输入框组件
 * 显示技能预览和参数输入引导
 */
@customElement("chatlite-skill-input")
export class SkillInput extends LitElement {
  @property() skill?: SkillPattern;
  @property() placeholder = "输入消息...";
  @state() paramValues: Record<string, string> = {};
  @state() currentParamIndex = 0;
  @state() isEditing = false;

  private inputRef: HTMLInputElement | null = null;

  // 获取当前参数
  get currentParam() {
    if (!this.skill?.params) return undefined;
    const requiredParams = this.skill.params.filter(p => p.required);
    return requiredParams[this.currentParamIndex];
  }

  // 是否所有参数都已填写
  get allParamsFilled() {
    if (!this.skill?.params) return true;
    const requiredParams = this.skill.params.filter(p => p.required);
    return requiredParams.every(p => this.paramValues[p.name]?.trim());
  }

  // 获取下一个未填写的参数索引
  getNextEmptyParamIndex() {
    if (!this.skill?.params) return -1;
    const requiredParams = this.skill.params.filter(p => p.required);
    return requiredParams.findIndex(p => !this.paramValues[p.name]?.trim());
  }

  render() {
    if (!this.skill || !this.isEditing) {
      return this.renderNormalInput();
    }

    return html`
      <div class="skill-input-container">
        ${this.renderSkillPreview()}
        ${this.renderParamInputs()}
        <div class="input-actions">
          <button class="btn btn-cancel" @click=${this.cancel}>取消</button>
          <button 
            class="btn btn-send" 
            @click=${this.send}
            ?disabled=${!this.allParamsFilled}
          >
            发送
          </button>
        </div>
      </div>
    `;
  }

  renderNormalInput() {
    return html`
      <div class="normal-input">
        <input
          type="text"
          .placeholder=${this.placeholder}
          @keydown=${this.handleKeyDown}
          .ref=${(el: HTMLInputElement) => { this.inputRef = el; }}
        />
      </div>
    `;
  }

  renderSkillPreview() {
    return html`
      <div class="skill-preview">
        <div class="skill-command">
          <span class="at-symbol">@</span>
          <span class="skill-name">${this.skill.skill}</span>
        </div>
        ${this.skill.description && html`
          <div class="skill-description">${this.skill.description}</div>
        `}
      </div>
    `;
  }

  renderParamInputs() {
    if (!this.skill?.params) return html``;

    const requiredParams = this.skill.params.filter(p => p.required);

    return html`
      <div class="param-inputs">
        ${requiredParams.map((param, index) => {
          const isCurrent = index === this.currentParamIndex;
          const isFilled = !!this.paramValues[param.name]?.trim();
          
          return html`
            <div class="param-input-wrapper ${isCurrent ? 'current' : ''} ${isFilled ? 'filled' : ''}">
              <label class="param-label">
                <span class="param-name">${param.name}</span>
                ${param.required && html`<span class="required">*</span>`}
              </label>
              <div class="param-input-row">
                <input
                  type="text"
                  placeholder="${param.example || param.description}"
                  .value=${this.paramValues[param.name] || ''}
                  @input=${(e: InputEvent) => this.updateParam(param.name, e)}
                  @focus=${() => this.currentParamIndex = index}
                  @keydown=${(e: KeyboardEvent) => this.handleParamKeyDown(e, index)}
                  class="param-input"
                  ?autofocus=${isCurrent && index === 0}
                />
                ${param.example && html`
                  <span class="param-example">${param.example}</span>
                `}
              </div>
            </div>
          `;
        })}
      </div>
    `;
  }

  updateParam(name: string, e: InputEvent) {
    this.paramValues[name] = (e.target as HTMLInputElement).value;
    this.requestUpdate();
  }

  handleKeyDown(e: KeyboardEvent) {
    if (e.key === '@') {
      // 可以在这里触发技能选择面板
    }
  }

  handleParamKeyDown(e: KeyboardEvent, index: number) {
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        // Shift+Tab: 上一个参数
        this.currentParamIndex = Math.max(0, index - 1);
      } else {
        // Tab: 下一个参数
        const nextIndex = this.getNextEmptyParamIndex();
        this.currentParamIndex = nextIndex > 0 ? nextIndex : index + 1;
      }
      this.requestUpdate();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (this.allParamsFilled) {
        this.send();
      } else {
        // 跳转到下一个未填写的参数
        const nextIndex = this.getNextEmptyParamIndex();
        if (nextIndex > 0) {
          this.currentParamIndex = nextIndex;
          this.requestUpdate();
        }
      }
    } else if (e.key === 'Escape') {
      this.cancel();
    }
  }

  send() {
    if (!this.skill) return;

    const command = this.buildCommand();
    this.dispatchEvent(new CustomEvent('send-skill', {
      detail: {
        skill: this.skill.skill,
        command,
        params: { ...this.paramValues }
      },
      bubbles: true,
      composed: true
    }));

    // 重置状态
    this.reset();
  }

  cancel() {
    this.reset();
    this.dispatchEvent(new CustomEvent('cancel-skill', {
      bubbles: true,
      composed: true
    }));
  }

  buildCommand() {
    if (!this.skill) return '';
    
    const params = Object.entries(this.paramValues)
      .filter(([_, value]) => value.trim())
      .map(([name, value]) => `${name}=${value}`)
      .join(' ');
    
    return `@${this.skill.skill} ${params}`;
  }

  reset() {
    this.skill = undefined;
    this.paramValues = {};
    this.currentParamIndex = 0;
    this.isEditing = false;
  }

  // 公开方法：开始编辑技能
  startEdit(skill: SkillPattern) {
    this.skill = skill;
    this.paramValues = {};
    this.currentParamIndex = 0;
    this.isEditing = true;
    
    // 聚焦到第一个输入框
    setTimeout(() => {
      const firstInput = this.shadowRoot?.querySelector('.param-input') as HTMLInputElement;
      firstInput?.focus();
    }, 0);
  }

  static styles = css`
    :host {
      display: block;
      width: 100%;
    }

    .normal-input {
      width: 100%;
    }

    .normal-input input {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 14px;
      transition: all 0.2s;
    }

    .normal-input input:focus {
      border-color: #10b981;
      outline: none;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }

    .skill-input-container {
      width: 100%;
      border: 1px solid #10b981;
      border-radius: 8px;
      background: #f0fdf4;
      overflow: hidden;
    }

    .skill-preview {
      padding: 12px 16px;
      border-bottom: 1px solid #d1fae5;
      background: #ecfdf5;
    }

    .skill-command {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 6px;
    }

    .at-symbol {
      color: #059669;
      font-weight: 600;
      font-size: 16px;
    }

    .skill-name {
      font-weight: 600;
      color: #059669;
      font-family: 'Courier New', monospace;
      font-size: 15px;
    }

    .skill-description {
      font-size: 13px;
      color: #6b7280;
      line-height: 1.4;
    }

    .param-inputs {
      padding: 12px 16px;
    }

    .param-input-wrapper {
      margin-bottom: 12px;
      padding: 10px;
      border-radius: 6px;
      border: 1px solid transparent;
      transition: all 0.2s;
    }

    .param-input-wrapper.current {
      background: white;
      border-color: #10b981;
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.1);
    }

    .param-input-wrapper.filled {
      border-color: #d1fae5;
      background: #f0fdf4;
    }

    .param-label {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 6px;
      font-size: 13px;
      font-weight: 500;
      color: #374151;
    }

    .param-name {
      font-family: 'Courier New', monospace;
    }

    .required {
      color: #ef4444;
    }

    .param-input-row {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .param-input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
      transition: all 0.2s;
    }

    .param-input:focus {
      border-color: #10b981;
      outline: none;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }

    .param-example {
      font-size: 12px;
      color: #9ca3af;
      white-space: nowrap;
    }

    .input-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 12px 16px;
      border-top: 1px solid #d1fae5;
      background: #ecfdf5;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-cancel {
      background: #f3f4f6;
      color: #374151;
    }

    .btn-cancel:hover {
      background: #e5e7eb;
    }

    .btn-send {
      background: #10b981;
      color: white;
    }

    .btn-send:hover:not(:disabled) {
      background: #059669;
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
    }

    .btn-send:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }
  `;
}
