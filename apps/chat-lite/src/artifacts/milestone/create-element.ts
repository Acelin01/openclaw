import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";

export interface MilestoneCreateData {
  projectId: string;
  title: string;
  description?: string;
  assigneeId: string;
  dueDate: string;
  status?: "notstarted" | "progress" | "completed" | "canceled";
}

@customElement("chatlite-milestone-create")
export class ChatliteMilestoneCreate extends LitElement {
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
      transition: all 0.2s;
    }

    .close-btn:hover {
      color: #262626;
      background: #f5f5f5;
    }

    .modal-body {
      display: flex;
      min-height: 400px;
    }

    .editor-section {
      flex: 1;
      padding: 24px;
      border-right: 1px solid #f0f0f0;
    }

    .sidebar-section {
      width: 320px;
      padding: 24px;
      background: #fafafa;
    }

    .title-input {
      width: 100%;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      padding: 12px 16px;
      font-size: 16px;
      font-weight: 600;
      color: #262626;
      outline: none;
      margin-bottom: 8px;
    }

    .title-input:focus {
      border-color: #52c41a;
      box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.1);
    }

    .title-hint {
      font-size: 12px;
      color: #8c8c8c;
      font-style: italic;
    }

    .description-editor {
      width: 100%;
      min-height: 150px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      padding: 12px;
      font-size: 14px;
      line-height: 1.6;
      margin-top: 16px;
      resize: vertical;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-label {
      font-size: 14px;
      color: #595959;
      margin-bottom: 8px;
      display: block;
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
      border-color: #52c41a;
      box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.1);
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
      color: #52c41a;
      border-color: #52c41a;
    }

    .btn-primary {
      background: #52c41a;
      color: white;
    }

    .btn-primary:hover {
      background: #73d13d;
    }

    .error-message {
      color: #ff4d4f;
      font-size: 12px;
      margin-top: 4px;
    }
  `;

  @property({ type: String })
  projectId = '';

  @state()
  private title = '';

  @state()
  private description = '';

  @state()
  private assigneeId = '';

  @state()
  private dueDate = '';

  @state()
  private status: "notstarted" | "progress" | "completed" | "canceled" = "notstarted";

  @state()
  private errors: Record<string, string> = {};

  render() {
    return html`
      <div class="milestone-create">
        <div class="modal-header">
          <h2>新建里程碑</h2>
          <button class="close-btn" @click=${() => this.dispatchEvent(new CustomEvent('close'))}>✕</button>
        </div>
        <div class="modal-body">
          <div class="editor-section">
            <input
              type="text"
              class="title-input"
              placeholder="请输入标题"
              .value=${this.title}
              @input=${(e: Event) => this.title = (e.target as HTMLInputElement).value}
            />
            <div class="title-hint">Ctrl+V 直接上传截图（仅在 Chrome 浏览器生效），支持 Markdown</div>
            
            <textarea
              class="description-editor"
              placeholder="请详细描述里程碑的目标、范围和关键成果"
              .value=${this.description}
              @input=${(e: Event) => this.description = (e.target as HTMLTextAreaElement).value}
            ></textarea>
          </div>
          
          <div class="sidebar-section">
            <div class="form-group">
              <label class="form-label required">负责人</label>
              <input
                type="email"
                class="form-input"
                placeholder="请输入负责人邮箱"
                .value=${this.assigneeId}
                @input=${(e: Event) => this.assigneeId = (e.target as HTMLInputElement).value}
              />
              ${this.errors.assigneeId ? html`<div class="error-message">${this.errors.assigneeId}</div>` : ''}
            </div>
            
            <div class="form-group">
              <label class="form-label required">计划完成时间</label>
              <input
                type="date"
                class="form-input"
                .value=${this.dueDate}
                @input=${(e: Event) => this.dueDate = (e.target as HTMLInputElement).value}
              />
              ${this.errors.dueDate ? html`<div class="error-message">${this.errors.dueDate}</div>` : ''}
            </div>
            
            <div class="form-group">
              <label class="form-label">状态</label>
              <select
                class="form-input"
                .value=${this.status}
                @change=${(e: Event) => this.status = (e.target as HTMLSelectElement).value as any}
              >
                <option value="notstarted">未开始</option>
                <option value="progress">进行中</option>
                <option value="completed">已完成</option>
                <option value="canceled">已取消</option>
              </select>
            </div>
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
      this.errors.title = '请输入标题';
    }
    
    if (!this.assigneeId.trim()) {
      this.errors.assigneeId = '请输入负责人邮箱';
    }
    
    if (!this.dueDate) {
      this.errors.dueDate = '请选择计划完成时间';
    }
    
    if (Object.keys(this.errors).length > 0) {
      this.requestUpdate();
      return;
    }
    
    const data: MilestoneCreateData = {
      projectId: this.projectId,
      title: this.title,
      description: this.description,
      assigneeId: this.assigneeId,
      dueDate: this.dueDate,
      status: this.status
    };
    
    this.dispatchEvent(new CustomEvent('milestone-create-submit', {
      bubbles: true,
      detail: data
    }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "chatlite-milestone-create": ChatliteMilestoneCreate;
  }
}
