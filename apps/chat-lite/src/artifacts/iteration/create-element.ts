import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

export interface IterationCreateData {
  title: string;
  description?: string;
  goal?: string[];
  projectId: string;
  startDate: string;
  endDate: string;
  ownerId?: string;
}

@customElement("chatlite-iteration-create")
export class IterationCreateArtifact extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif;
    }

    .container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .header {
      padding: 20px 24px;
      border-bottom: 1px solid #f0f0f0;
      background: #fafafa;
    }

    .header h2 {
      font-size: 18px;
      font-weight: 600;
      color: #1f1f1f;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .body {
      padding: 24px;
    }

    .form-group {
      margin-bottom: 24px;
    }

    .form-group label {
      display: block;
      font-size: 14px;
      font-weight: 600;
      color: #262626;
      margin-bottom: 8px;
    }

    .form-group label.required::after {
      content: " *";
      color: #ff4d4f;
    }

    .input-with-counter {
      position: relative;
    }

    input[type="text"],
    input[type="date"],
    textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #d9d9d9;
      border-radius: 6px;
      font-size: 14px;
      color: #262626;
      transition: all 0.2s;
      font-family: inherit;
    }

    input[type="text"]:focus,
    input[type="date"]:focus,
    textarea:focus {
      outline: none;
      border-color: #52c41a;
      box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.2);
    }

    .input-with-counter input {
      padding-right: 60px;
    }

    .char-counter {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #8c8c8c;
      font-size: 13px;
    }

    textarea {
      min-height: 100px;
      resize: vertical;
    }

    .date-range {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 12px;
      align-items: center;
    }

    .date-separator {
      text-align: center;
      color: #8c8c8c;
      font-size: 14px;
    }

    .goals-section {
      margin-top: 24px;
    }

    .goals-list {
      list-style: none;
      padding: 0;
    }

    .goal-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .goal-input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #d9d9d9;
      border-radius: 6px;
      font-size: 14px;
    }

    .btn-icon {
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .btn-add {
      background: #f6ffed;
      color: #52c41a;
      border: 1px solid #b7eb8f;
    }

    .btn-add:hover {
      background: #f0f9ff;
      border-color: #40a9ff;
      color: #0958d9;
    }

    .btn-remove {
      background: #fff1f0;
      color: #ff4d4f;
      border: 1px solid #ffa39e;
    }

    .btn-remove:hover {
      background: #ffccc7;
    }

    .footer {
      padding: 16px 24px;
      border-top: 1px solid #f0f0f0;
      background: #fafafa;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .btn {
      padding: 10px 20px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .btn-default {
      background: white;
      color: #595959;
      border: 1px solid #d9d9d9;
    }

    .btn-default:hover {
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

    .btn-primary:disabled {
      background: #d9d9d9;
      cursor: not-allowed;
    }
  `;

  @property({ type: String })
  projectId: string = "";

  @property({ type: Object })
  formData: Partial<IterationCreateData> = {
    title: "",
    description: "",
    goal: [""],
    startDate: "",
    endDate: "",
  };

  render() {
    return html`
      <div class="container">
        ${this._renderHeader()}
        ${this._renderBody()}
        ${this._renderFooter()}
      </div>
    `;
  }

  private _renderHeader() {
    return html`
      <div class="header">
        <h2>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8" stroke="#52c41a" stroke-width="1.5"/>
            <path d="M10 6v4l3 3" stroke="#52c41a" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          新建迭代
        </h2>
      </div>
    `;
  }

  private _renderBody() {
    return html`
      <div class="body">
        ${this._renderTitle()}
        ${this._renderDescription()}
        ${this._renderDateRange()}
        ${this._renderGoals()}
      </div>
    `;
  }

  private _renderTitle() {
    const title = this.formData.title || "";
    const charCount = title.length;

    return html`
      <div class="form-group">
        <label class="required">迭代名称</label>
        <div class="input-with-counter">
          <input
            type="text"
            .value=${title}
            @input=${(e: any) => this._updateField("title", e.target.value)}
            placeholder="请输入迭代名称"
            maxlength="50"
          />
          <span class="char-counter">${charCount}/50</span>
        </div>
      </div>
    `;
  }

  private _renderDescription() {
    const description = this.formData.description || "";

    return html`
      <div class="form-group">
        <label>迭代描述</label>
        <textarea
          .value=${description}
          @input=${(e: any) => this._updateField("description", e.target.value)}
          placeholder="请输入迭代描述（可选）"
          maxlength="500"
        ></textarea>
      </div>
    `;
  }

  private _renderDateRange() {
    return html`
      <div class="form-group">
        <label class="required">迭代周期</label>
        <div class="date-range">
          <input
            type="date"
            .value=${this.formData.startDate || ""}
            @input=${(e: any) => this._updateField("startDate", e.target.value)}
          />
          <span class="date-separator">至</span>
          <input
            type="date"
            .value=${this.formData.endDate || ""}
            @input=${(e: any) => this._updateField("endDate", e.target.value)}
          />
        </div>
      </div>
    `;
  }

  private _renderGoals() {
    const goals = this.formData.goal || [""];

    return html`
      <div class="goals-section">
        <div class="form-group">
          <label>迭代目标</label>
          <ul class="goals-list">
            ${goals.map((goal, index) => this._renderGoalItem(goal, index))}
          </ul>
          <button class="btn-icon btn-add" @click=${this._addGoal} title="添加目标">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  private _renderGoalItem(goal: string, index: number) {
    return html`
      <li class="goal-item">
        <input
          type="text"
          class="goal-input"
          .value=${goal}
          @input=${(e: any) => this._updateGoal(index, e.target.value)}
          placeholder="请输入迭代目标"
          maxlength="100"
        />
        ${index > 0 ? html`
          <button class="btn-icon btn-remove" @click=${() => this._removeGoal(index)} title="删除目标">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 3l8 8m0-8l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        ` : ""}
      </li>
    `;
  }

  private _renderFooter() {
    const isValid = this._validateForm();

    return html`
      <div class="footer">
        <button class="btn btn-default" @click=${() => this._handleCancel()}>
          取消
        </button>
        <button 
          class="btn btn-primary" 
          @click=${() => this._handleCreate()}
          ?disabled=${!isValid}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          创建迭代
        </button>
      </div>
    `;
  }

  private _updateField(field: string, value: string) {
    this.formData = { ...this.formData, [field]: value };
    this.requestUpdate();
  }

  private _addGoal() {
    const goals = this.formData.goal || [""];
    this.formData = { ...this.formData, goal: [...goals, ""] };
    this.requestUpdate();
  }

  private _updateGoal(index: number, value: string) {
    const goals = this.formData.goal || [""];
    goals[index] = value;
    this.formData = { ...this.formData, goal: [...goals] };
    this.requestUpdate();
  }

  private _removeGoal(index: number) {
    const goals = this.formData.goal || [""];
    goals.splice(index, 1);
    this.formData = { ...this.formData, goal: goals.length > 0 ? goals : [""] };
    this.requestUpdate();
  }

  private _validateForm(): boolean {
    return !!(
      this.formData.title &&
      this.formData.title.trim().length > 0 &&
      this.formData.startDate &&
      this.formData.endDate
    );
  }

  private _handleCancel() {
    this.dispatchEvent(new CustomEvent("iteration-create-cancel", {
      bubbles: true,
      composed: true,
    }));
  }

  private _handleCreate() {
    if (!this._validateForm()) return;

    this.dispatchEvent(new CustomEvent("iteration-create-submit", {
      detail: { data: this.formData },
      bubbles: true,
      composed: true,
    }));
  }
}
