import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";

export interface ServiceFormData {
  name: string; category: string; type: "robot"|"manual"|"hybrid"; description: string;
  coverStyle: "blue"|"green"|"purple"|"amber"|"pink"|"slate"; emoji: string; tags: string[];
  packages: Array<{ name: string; price: number; unit: string; description?: string }>;
  robotEnabled: boolean; autoAccept: boolean; budgetLimit: number; certified: boolean;
}

@customElement("chatlite-skill-service-drawer")
export class ChatliteSkillServiceDrawer extends LitElement {
  static styles = css`
    :host { display: none; } :host([open]) { display: block; }
    .overlay { position: fixed; inset: 0; background: rgba(15,20,35,0.45); z-index: 200; backdrop-filter: blur(3px); }
    .drawer { position: fixed; top: 0; right: -700px; height: 100vh; width: 680px; background: #fff; box-shadow: 0 16px 48px rgba(0,0,0,0.14); z-index: 201; display: flex; flex-direction: column; transition: right 0.3s; overflow: hidden; }
    :host([open]) .drawer { right: 0; }
    .drawer-header { padding: 20px 24px; border-bottom: 1px solid #e4e7ed; display: flex; align-items: center; gap: 12px; }
    .drawer-title { font-size: 16px; font-weight: 700; flex: 1; color: #1a1d23; }
    .drawer-subtitle { font-size: 12px; color: #9ba3b8; margin-top: 2px; }
    .close-btn { width: 32px; height: 32px; border-radius: 7px; border: 1px solid #e4e7ed; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #5a6278; }
    .drawer-body { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 24px; }
    .steps { display: flex; align-items: center; gap: 0; padding: 0 0 20px; }
    .step { display: flex; align-items: center; gap: 8px; flex: 1; position: relative; }
    .step::after { content: ''; position: absolute; top: 13px; left: 34px; right: 0; height: 1px; background: #e4e7ed; }
    .step:last-child::after { display: none; }
    .step-num { width: 26px; height: 26px; border-radius: 50%; border: 2px solid #e4e7ed; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; font-family: 'DM Mono', monospace; background: #fff; color: #9ba3b8; flex-shrink: 0; z-index: 1; }
    .step.active .step-num { border-color: #0ea5e9; background: #0ea5e9; color: #fff; }
    .step.done .step-num { border-color: #10b981; background: #10b981; color: #fff; }
    .step-label { font-size: 11.5px; font-weight: 500; color: #9ba3b8; }
    .step.active .step-label { color: #0ea5e9; }
    .step.done .step-label { color: #10b981; }
    .form-section { background: #f5f6f8; border: 1px solid #e4e7ed; border-radius: 12px; padding: 18px 20px; }
    .form-section-title { font-size: 12px; font-weight: 600; color: #5a6278; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 16px; display: flex; align-items: center; gap: 7px; }
    .form-section-title svg { width: 14px; height: 14px; color: #0ea5e9; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .form-group { display: flex; flex-direction: column; gap: 5px; }
    .form-group.full { grid-column: 1/-1; }
    .label { font-size: 12px; font-weight: 600; color: #5a6278; }
    .label .req { color: #ef4444; margin-left: 2px; }
    .input, .textarea, .select { padding: 8px 11px; border: 1px solid #e4e7ed; border-radius: 7px; background: #fff; color: #1a1d23; font-size: 13px; outline: none; }
    .input:focus, .textarea:focus, .select:focus { border-color: #0ea5e9; box-shadow: 0 0 0 3px #eff9ff; }
    .textarea { resize: vertical; min-height: 80px; line-height: 1.55; }
    .tag-input-area { min-height: 42px; padding: 6px 8px; border: 1px solid #e4e7ed; border-radius: 7px; background: #fff; display: flex; flex-wrap: wrap; gap: 5px; }
    .tag-input-area:focus-within { border-color: #0ea5e9; box-shadow: 0 0 0 3px #eff9ff; }
    .tag-pill { display: inline-flex; align-items: center; gap: 4px; background: #eff9ff; border: 1px solid #bae6fd; color: #0ea5e9; font-size: 12px; font-weight: 500; padding: 2px 8px; border-radius: 5px; }
    .tag-pill button { background: none; border: none; cursor: pointer; color: #0ea5e9; font-size: 14px; padding: 0; }
    .tag-input { border: none; outline: none; background: transparent; font-size: 13px; color: #1a1d23; min-width: 80px; flex: 1; }
    .cover-selector { display: flex; gap: 8px; flex-wrap: wrap; }
    .cover-opt { width: 52px; height: 36px; border-radius: 7px; cursor: pointer; border: 2px solid transparent; }
    .cover-opt.selected { border-color: #0ea5e9; }
    .cover-opt:hover { transform: scale(1.05); }
    .pkg-editor { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .pkg-edit-card { border: 1px solid #e4e7ed; border-radius: 9px; padding: 12px; background: #fff; display: flex; flex-direction: column; gap: 8px; }
    .pkg-edit-card.recommended { border-color: #0ea5e9; background: #eff9ff; }
    .pkg-edit-name { font-size: 12px; font-weight: 700; color: #5a6278; text-align: center; padding-bottom: 7px; border-bottom: 1px solid #e4e7ed; }
    .pkg-edit-name span { display: block; font-size: 10px; color: #9ba3b8; margin-top: 1px; }
    .robot-config { background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 9px; padding: 14px 16px; }
    .robot-config-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
    .robot-config-header svg { color: #8b5cf6; width: 15px; height: 15px; }
    .robot-config-header strong { font-size: 13px; color: #8b5cf6; }
    .robot-dot { width: 7px; height: 7px; border-radius: 50%; background: #10b981; flex-shrink: 0; }
    .token-display { display: flex; align-items: center; gap: 8px; background: #fff; border: 1px solid #e4e7ed; border-radius: 6px; padding: 7px 10px; }
    .token-val { font-family: 'DM Mono', monospace; font-size: 11px; color: #5a6278; flex: 1; }
    .token-copy { width: 24px; height: 24px; border-radius: 5px; border: 1px solid #e4e7ed; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #9ba3b8; }
    .toggle { width: 36px; height: 20px; border-radius: 10px; background: #d1d5de; cursor: pointer; position: relative; border: none; }
    .toggle.on { background: #0ea5e9; }
    .toggle::after { content: ''; position: absolute; top: 3px; left: 3px; width: 14px; height: 14px; border-radius: 50%; background: #fff; transition: left 0.18s; }
    .toggle.on::after { left: 19px; }
    .drawer-footer { padding: 16px 24px; border-top: 1px solid #e4e7ed; display: flex; align-items: center; gap: 10px; background: #fff; }
    .draft-hint { font-size: 11.5px; color: #9ba3b8; flex: 1; }
    .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 7px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; }
    .btn-ghost { background: transparent; color: #5a6278; border: 1px solid #e4e7ed; }
    .btn-primary { background: #0ea5e9; color: #fff; }
  `;

  @property({ type: Boolean }) open = false;
  @property({ type: Object }) formData?: Partial<ServiceFormData>;
  @state() private currentStep = 0;
  @state() private tagInput = "";
  @state() private selectedCover = "blue";

  private covers = [
    { name: "blue", gradient: "linear-gradient(135deg, #0ea5e9, #06b6d4)" },
    { name: "green", gradient: "linear-gradient(135deg, #059669, #10b981)" },
    { name: "purple", gradient: "linear-gradient(135deg, #7c3aed, #8b5cf6)" },
    { name: "amber", gradient: "linear-gradient(135deg, #d97706, #f59e0b)" },
    { name: "pink", gradient: "linear-gradient(135deg, #be185d, #f472b6)" },
    { name: "slate", gradient: "linear-gradient(135deg, #0f172a, #334155)" },
  ];

  close() { this.open = false; this.currentStep = 0; }

  private addTag() {
    const tag = this.tagInput.trim();
    if (!tag) return;
    const tags = [...(this.formData?.tags || []), tag];
    if (tags.length > 10) {
      this.dispatchEvent(new CustomEvent("toast", { detail: { type: "error", title: "标签已满" } }));
      return;
    }
    this.formData = { ...this.formData, tags };
    this.tagInput = "";
  }

  private removeTag(tag: string) {
    this.formData = { ...this.formData, tags: (this.formData?.tags || []).filter(t => t !== tag) };
  }

  render() {
    const data = this.formData || {
      name: "", category: "", type: "manual" as const, description: "",
      coverStyle: "blue" as const, emoji: "🤖", tags: [],
      packages: [
        { name: "基础版", price: 90, unit: "/h" },
        { name: "升级版", price: 120, unit: "/h" },
        { name: "高级版", price: 150, unit: "/h" },
      ],
      robotEnabled: true, autoAccept: true, budgetLimit: 1000, certified: false,
    };

    return html`
      <div class="overlay" style="display: ${this.open ? 'block' : 'none'}" @click=${() => this.close()}></div>
      <div class="drawer">
        <div class="drawer-header">
          <div><div class="drawer-title">${this.formData?.name ? "编辑技能服务" : "创建技能服务"}</div><div class="drawer-subtitle">F02-01 至 F02-07</div></div>
          <button class="close-btn" @click=${() => this.close()}><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2 2 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
        </div>
        <div class="drawer-body">
          <div class="steps">
            ${["基本信息", "套餐设置", "机器人配置", "认证申请"].map((label, i) => html`
              <div class="step ${this.currentStep === i ? "active" : this.currentStep > i ? "done" : ""}">
                <div class="step-num">${i + 1}</div><span class="step-label">${label}</span>
              </div>
            `)}
          </div>

          ${this.currentStep === 0 ? html`
            <div class="form-section">
              <div class="form-section-title"><svg fill="none" viewBox="0 0 14 14" stroke="currentColor" stroke-width="1.8"><path d="M2 3h10M2 7h7M2 11h5" stroke-linecap="round"/></svg>基本信息</div>
              <div class="form-row">
                <div class="form-group full"><label class="label">服务名称 <span class="req">*</span></label><input class="input" placeholder="例：React 全栈开发" .value=${data.name} @input=${(e: Event) => this.formData = { ...this.formData, name: (e.target as HTMLInputElement).value }} /></div>
                <div class="form-group"><label class="label">服务类别 <span class="req">*</span></label><select class="select" .value=${data.category} @change=${(e: Event) => this.formData = { ...this.formData, category: (e.target as HTMLSelectElement).value }}><option value="">选择类别</option><option>前端开发</option><option>后端开发</option><option>UI/UX 设计</option><option>数据分析</option></select></div>
                <div class="form-group"><label class="label">服务类型 <span class="req">*</span></label><select class="select" .value=${data.type} @change=${(e: Event) => this.formData = { ...this.formData, type: (e.target as HTMLSelectElement).value as any }}><option value="manual">人工服务</option><option value="robot">机器人服务</option><option value="hybrid">混合服务</option></select></div>
                <div class="form-group full"><label class="label">服务描述 <span class="req">*</span></label><textarea class="textarea" placeholder="详细描述服务内容..." .value=${data.description} @input=${(e: Event) => this.formData = { ...this.formData, description: (e.target as HTMLTextAreaElement).value }}></textarea></div>
              </div>
            </div>
            <div class="form-section">
              <div class="form-section-title"><svg fill="none" viewBox="0 0 14 14" stroke="currentColor" stroke-width="1.8"><rect x="1" y="2" width="12" height="10" rx="1.5"/></svg>封面风格</div>
              <div class="cover-selector">${this.covers.map(c => html`<div class="cover-opt ${this.selectedCover === c.name ? "selected" : ""}" style="background: ${c.gradient}" @click=${() => { this.selectedCover = c.name; this.formData = { ...this.formData, coverStyle: c.name as any } }}></div>`)}</div>
            </div>
            <div class="form-section">
              <div class="form-section-title"><svg fill="none" viewBox="0 0 14 14" stroke="currentColor" stroke-width="1.8"><path d="M1 7V2h5l6 6-5 5-6-6Z" stroke-linecap="round"/></svg>技能标签 <span style="margin-left:auto;font-size:10.5px;color:#9ba3b8">最多 10 个</span></div>
              <div class="tag-input-area">${(data.tags || []).map(t => html`<span class="tag-pill">${t} <button @click=${(e: Event) => { e.stopPropagation(); this.removeTag(t); }}>×</button></span>`)}<input class="tag-input" placeholder="输入标签后按 Enter..." .value=${this.tagInput} @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter') { e.preventDefault(); this.addTag(); } }} @input=${(e: Event) => this.tagInput = (e.target as HTMLInputElement).value} /></div>
              <div style="font-size:11px;color:#9ba3b8;margin-top:6px">已添加 ${data.tags?.length || 0}/10 个标签</div>
            </div>
          ` : this.currentStep === 1 ? html`
            <div class="form-section">
              <div class="form-section-title"><svg fill="none" viewBox="0 0 14 14" stroke="currentColor" stroke-width="1.8"><rect x="1" y="3" width="12" height="9" rx="1.5"/></svg>套餐设置</div>
              <div class="pkg-editor">${(data.packages || []).map((pkg, idx) => html`
                <div class="pkg-edit-card ${idx === 1 ? "recommended" : ""}">
                  <div class="pkg-edit-name">${pkg.name} ${idx === 1 ? "⭐" : ""}<span>${idx === 0 ? "入门" : idx === 1 ? "推荐" : "企业"}</span></div>
                  <div class="form-group"><label class="label" style="font-size:11px">价格</label><div style="display:flex;align-items:center;gap:4px"><span style="font-size:13px;color:#9ba3b8">¥</span><input class="input" style="font-family:'DM Mono',monospace" type="number" .value=${pkg.price} @input=${(e: Event) => { const packages = [...(data.packages || [])]; packages[idx].price = Number((e.target as HTMLInputElement).value); this.formData = { ...this.formData, packages }; }} /></div></div>
                  <div class="form-group"><label class="label" style="font-size:11px">计费方式</label><select class="select" style="font-size:12px" .value=${pkg.unit === "/h" ? "hourly" : "fixed"} @change=${(e: Event) => { const packages = [...(data.packages || [])]; packages[idx].unit = (e.target as HTMLSelectElement).value === "hourly" ? "/h" : ""; this.formData = { ...this.formData, packages }; }}><option value="hourly">按时计费</option><option value="fixed">固定价格</option></select></div>
                </div>
              `)}</div>
            </div>
          ` : this.currentStep === 2 ? html`
            <div class="form-section">
              <div class="form-section-title"><svg fill="none" viewBox="0 0 14 14" stroke="currentColor" stroke-width="1.8"><rect x="2" y="4" width="10" height="8" rx="1.5"/></svg>机器人配置</div>
              <div class="robot-config">
                <div class="robot-config-header"><svg fill="none" viewBox="0 0 14 14" stroke="currentColor" stroke-width="1.8"><rect x="2" y="4" width="10" height="8" rx="1.5"/></svg><strong>OpenClaw · DataBot v2.1</strong></div>
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px"><div class="robot-dot"></div><span style="font-size:12.5px;color:#5a6278">已绑定 · 在线</span></div>
                <div style="margin-bottom:8px"><div class="label" style="margin-bottom:4px;font-size:11px">Token</div><div class="token-display"><div class="token-val">uxin_tok_••••••••4f8e</div><button class="token-copy" @click=${() => this.dispatchEvent(new CustomEvent("toast", { detail: { type: "success", title: "已复制" } }))}><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="3" y="3" width="7" height="8" rx="1" stroke="currentColor"/></svg></button></div></div>
                <div style="display:flex;align-items:center;justify-content:space-between;font-size:12.5px;color:#5a6278;margin-top:8px"><span>自动接单</span><button class="toggle ${data.autoAccept ? "on" : ""}" @click=${() => this.formData = { ...this.formData, autoAccept: !data.autoAccept }}></button></div>
              </div>
            </div>
          ` : html`
            <div class="form-section">
              <div class="form-section-title"><svg fill="none" viewBox="0 0 14 14" stroke="currentColor" stroke-width="1.8"><path d="M7 1l1.2 2.4 2.8.4-2 2 .5 2.7L7 7l-2.5 1.5"/></svg>认证申请</div>
              <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:9px;padding:14px 16px">
                <div style="display:flex;align-items:center;gap:7px;margin-bottom:10px;font-size:13px;font-weight:600;color:#f59e0b">认证可提升曝光与转化（平均 3.2×）</div>
                <div style="border:2px dashed #e4e7ed;border-radius:8px;padding:20px;text-align:center;cursor:pointer;background:#fff" @click=${() => this.dispatchEvent(new CustomEvent("toast", { detail: { type: "info", title: "上传材料" } }))}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="color:#9ba3b8;margin:0 auto 8px"><path d="M12 16V4M8 8l4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" stroke-width="1.5"/></svg><p style="font-size:12.5px;color:#5a6278">上传认证材料</p></div>
              </div>
            </div>
          `}
        </div>
        <div class="drawer-footer">
          <span class="draft-hint">💾 草稿已自动保存</span>
          ${this.currentStep > 0 ? html`<button class="btn btn-ghost" @click=${() => this.currentStep--}>上一步</button>` : ""}
          ${this.currentStep < 3 ? html`<button class="btn btn-primary" @click=${() => this.currentStep++}>下一步</button>` : html`<button class="btn btn-primary" @click=${() => { this.dispatchEvent(new CustomEvent("submit", { detail: this.formData })); this.dispatchEvent(new CustomEvent("toast", { detail: { type: "success", title: "已提交 AI 审核" } })); this.close(); }}>提交审核</button>`}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "chatlite-skill-service-drawer": ChatliteSkillServiceDrawer;
  }
}
