import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";

export interface ProjectCreateData {
  name: string;
  description?: string;
  owner_id: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
}

@customElement("chatlite-project-create")
export class ChatliteProjectCreate extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      overflow: hidden;
    }

    .modal-header {
      padding: 16px 24px;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h2 {
      font-size: 16px;
      font-weight: 600;
      color: #262626;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #8c8c8c;
      padding: 4px 8px;
      border-radius: 4px;
    }

    .close-btn:hover {
      color: #262626;
      background: #f5f5f5;
    }

    .modal-body {
      padding: 24px;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-label {
      display: block;
      font-size: 14px;
      color: #595959;
      margin-bottom: 8px;
    }

    .form-label.required::after {
      content: '*';
      color: #ff4d4f;
      margin-left: 4px;
    }

    .form-input {
      width: 100%;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      padding: 8px 12px;
      font-size: 14px;
      color: #262626;
      outline: none;
    }

    .form-input:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
    }

    textarea.form-input {
      min-height: 100px;
      resize: vertical;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .error-message {
      color: #ff4d4f;
      font-size: 12px;
      margin-top: 4px;
    }

    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid #f0f0f0;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-cancel {
      background: white;
      color: #595959;
      border: 1px solid #d9d9d9;
    }

    .btn-cancel:hover {
      color: #2563eb;
      border-color: #2563eb;
    }

    .btn-primary {
      background: #2563eb;
      color: white;
    }

    .btn-primary:hover {
      background: #3b82f6;
    }
  `;

  @state()
  private name = '';

  @state()
  private description = '';

  @state()
  private owner_id = '';

  @state()
  private start_date = '';

  @state()
  private end_date = '';

  @state()
  private budget = '';

  @state()
  private errors: Record<string, string> = {};

  render() {
    return html`
      <div class="project-create">
        <div class="modal-header">
          <h2>新建项目</h2>
          <button class="close-btn" @click=${() => this.dispatchEvent(new CustomEvent('close'))}>✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label required">项目名称</label>
            <input
              type="text"
              class="form-input"
              placeholder="请输入项目名称"
              .value=${this.name}
              @input=${(e: Event) => this.name = (e.target as HTMLInputElement).value}
            />
            ${this.errors.name ? html`<div class="error-message">${this.errors.name}</div>` : ''}
          </div>
          
          <div class="form-group">
            <label class="form-label">项目描述</label>
            <textarea
              class="form-input"
              placeholder="请输入项目描述"
              .value=${this.description}
              @input=${(e: Event) => this.description = (e.target as HTMLTextAreaElement).value}
            ></textarea>
          </div>
          
          <div class="form-group">
            <label class="form-label required">负责人邮箱</label>
            <input
              type="email"
              class="form-input"
              placeholder="请输入负责人邮箱"
              .value=${this.owner_id}
              @input=${(e: Event) => this.owner_id = (e.target as HTMLInputElement).value}
            />
            ${this.errors.owner_id ? html`<div class="error-message">${this.errors.owner_id}</div>` : ''}
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">开始日期</label>
              <input
                type="date"
                class="form-input"
                .value=${this.start_date}
                @input=${(e: Event) => this.start_date = (e.target as HTMLInputElement).value}
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">结束日期</label>
              <input
                type="date"
                class="form-input"
                .value=${this.end_date}
                @input=${(e: Event) => this.end_date = (e.target as HTMLInputElement).value}
              />
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">预算</label>
            <input
              type="number"
              class="form-input"
              placeholder="请输入预算"
              .value=${this.budget}
              @input=${(e: Event) => this.budget = (e.target as HTMLInputElement).value}
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-cancel" @click=${() => this.dispatchEvent(new CustomEvent('close'))}>取消</button>
          <button class="btn btn-primary" @click=${this._handleCreate}>确定</button>
        </div>
      </div>
    `;
  }

  private _handleCreate() {
    this.errors = {};
    
    if (!this.name.trim()) {
      this.errors.name = '请输入项目名称';
    }
    
    if (!this.owner_id.trim()) {
      this.errors.owner_id = '请输入负责人邮箱';
    }
    
    if (Object.keys(this.errors).length > 0) {
      this.requestUpdate();
      return;
    }
    
    const data: ProjectCreateData = {
      name: this.name,
      description: this.description,
      owner_id: this.owner_id,
      start_date: this.start_date,
      end_date: this.end_date,
      budget: this.budget ? parseFloat(this.budget) : undefined
    };
    
    this.dispatchEvent(new CustomEvent('project-create-submit', {
      bubbles: true,
      detail: data
    }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "chatlite-project-create": ChatliteProjectCreate;
  }
}
