import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";

export interface DefectCreateData {
  project_id: string;
  title: string;
  description: string;
  severity: "trivial" | "minor" | "major" | "critical" | "blocker";
  priority?: "low" | "medium" | "high";
  status?: "open" | "confirmed" | "in_progress" | "resolved" | "closed" | "rejected";
  reporter_id?: string;
  assignee_id?: string;
  steps_to_reproduce?: string[];
  expected_result?: string;
  actual_result?: string;
}

@customElement("chatlite-defect-create")
export class ChatliteDefectCreate extends LitElement {
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
      border-color: #ff4d4f;
      box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.1);
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
      color: #ff4d4f;
      border-color: #ff4d4f;
    }

    .btn-primary {
      background: #ff4d4f;
      color: white;
    }

    .btn-primary:hover {
      background: #ff7875;
    }
  `;

  @property({ type: String })
  projectId = '';

  @state()
  private title = '';

  @state()
  private description = '';

  @state()
  private severity: "trivial" | "minor" | "major" | "critical" | "blocker" = "major";

  @state()
  private priority: "low" | "medium" | "high" = "medium";

  @state()
  private assignee_id = '';

  @state()
  private errors: Record<string, string> = {};

  render() {
    return html`
      <div class="defect-create">
        <div class="modal-header">
          <h2>新建缺陷</h2>
          <button class="close-btn" @click=${() => this.dispatchEvent(new CustomEvent('close'))}>✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label required">缺陷标题</label>
            <input
              type="text"
              class="form-input"
              placeholder="请输入缺陷标题"
              .value=${this.title}
              @input=${(e: Event) => this.title = (e.target as HTMLInputElement).value}
            />
            ${this.errors.title ? html`<div class="error-message">${this.errors.title}</div>` : ''}
          </div>
          
          <div class="form-group">
            <label class="form-label required">缺陷描述</label>
            <textarea
              class="form-input"
              placeholder="请详细描述缺陷现象、重现步骤等"
              .value=${this.description}
              @input=${(e: Event) => this.description = (e.target as HTMLTextAreaElement).value}
            ></textarea>
            ${this.errors.description ? html`<div class="error-message">${this.errors.description}</div>` : ''}
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label required">严重程度</label>
              <select
                class="form-input"
                .value=${this.severity}
                @change=${(e: Event) => this.severity = (e.target as HTMLSelectElement).value as any}
              >
                <option value="trivial">轻微</option>
                <option value="minor">一般</option>
                <option value="major">严重</option>
                <option value="critical">危急</option>
                <option value="blocker">阻塞</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">优先级</label>
              <select
                class="form-input"
                .value=${this.priority}
                @change=${(e: Event) => this.priority = (e.target as HTMLSelectElement).value as any}
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">负责人邮箱</label>
            <input
              type="email"
              class="form-input"
              placeholder="请输入负责人邮箱"
              .value=${this.assignee_id}
              @input=${(e: Event) => this.assignee_id = (e.target as HTMLInputElement).value}
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
    
    if (!this.title.trim()) {
      this.errors.title = '请输入缺陷标题';
    }
    
    if (!this.description.trim()) {
      this.errors.description = '请输入缺陷描述';
    }
    
    if (Object.keys(this.errors).length > 0) {
      this.requestUpdate();
      return;
    }
    
    const data: DefectCreateData = {
      project_id: this.projectId,
      title: this.title,
      description: this.description,
      severity: this.severity,
      priority: this.priority,
      assignee_id: this.assignee_id
    };
    
    this.dispatchEvent(new CustomEvent('defect-create-submit', {
      bubbles: true,
      detail: data
    }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "chatlite-defect-create": ChatliteDefectCreate;
  }
}
