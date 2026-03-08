import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";

export interface SkillService {
  id: string;
  name: string;
  description: string;
  category: string;
  type: "robot" | "manual" | "hybrid";
  status: "online" | "offline" | "reviewing";
  coverStyle: "blue" | "green" | "purple" | "amber";
  emoji: string;
  tags: string[];
  packages: { name: string; price: number; unit: string; isRecommended?: boolean }[];
  stats: { views: number; favorites: number; orders: number; rating: number };
  robotInfo?: { name: string; version: string; autoAccept: boolean; token?: string };
  certified?: boolean;
}

export interface SkillServiceListContent {
  kind: "skill-service-list";
  services: SkillService[];
  title?: string;
}

@customElement("chatlite-skill-service-list")
export class ChatliteSkillServiceList extends LitElement {
  static styles = css`
    :host { display: block; width: 100%; font-family: 'Noto Sans SC', sans-serif; background: #f5f6f8; min-height: 100vh; }
    * { box-sizing: border-box; }
    .container { max-width: 1400px; margin: 0 auto; padding: 24px; }
    .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    .header-title { font-size: 24px; font-weight: 700; color: #1a1d23; }
    .header-subtitle { font-size: 14px; color: #9ba3b8; margin-top: 4px; }
    .btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; transition: all 0.18s; }
    .btn-primary { background: #0ea5e9; color: #fff; }
    .btn-primary:hover { background: #0284c7; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(14,165,233,0.35); }
    .btn-ghost { background: transparent; color: #5a6278; border: 1px solid #e4e7ed; }
    .btn-ghost:hover { background: #f5f6f8; color: #1a1d23; }
    .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-card { background: #fff; border: 1px solid #e4e7ed; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.07); }
    .stat-label { font-size: 12px; color: #9ba3b8; font-weight: 500; margin-bottom: 8px; }
    .stat-value { font-size: 28px; font-weight: 700; font-family: 'DM Mono', monospace; color: #1a1d23; }
    .stat-sub { font-size: 12px; color: #9ba3b8; margin-top: 4px; }
    .stat-sub .up { color: #10b981; font-weight: 600; }
    .filter-bar { background: #fff; border: 1px solid #e4e7ed; border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
    .search-box { display: flex; align-items: center; gap: 8px; background: #f5f6f8; border: 1px solid #e4e7ed; border-radius: 8px; padding: 8px 12px; flex: 1; min-width: 200px; }
    .search-box:focus-within { border-color: #0ea5e9; background: #fff; }
    .search-box input { background: transparent; border: none; outline: none; font-size: 14px; width: 100%; color: #1a1d23; }
    .filter-chip { padding: 6px 14px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; border: 1px solid #e4e7ed; background: transparent; color: #5a6278; }
    .filter-chip:hover { background: #f5f6f8; }
    .filter-chip.active { background: #eff9ff; color: #0ea5e9; border-color: #bae6fd; }
    .service-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 18px; }
    .service-card { background: #fff; border: 1px solid #e4e7ed; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.07); transition: all 0.18s; display: flex; flex-direction: column; }
    .service-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); transform: translateY(-2px); }
    .card-cover { height: 100px; position: relative; display: flex; align-items: flex-end; padding: 0 16px 12px; }
    .card-cover-bg { position: absolute; inset: 0; background: linear-gradient(135deg, #0ea5e9, #06b6d4); }
    .card-cover-bg.green { background: linear-gradient(135deg, #059669, #10b981); }
    .card-cover-bg.purple { background: linear-gradient(135deg, #7c3aed, #8b5cf6); }
    .card-cover-bg.amber { background: linear-gradient(135deg, #d97706, #f59e0b); }
    .card-cover-emoji { font-size: 32px; position: absolute; top: 16px; left: 16px; z-index: 1; }
    .card-status-badge { position: relative; z-index: 1; display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 5px; backdrop-filter: blur(8px); }
    .card-status-badge.online { background: rgba(16,185,129,0.85); color: #fff; }
    .card-status-badge.offline { background: rgba(0,0,0,0.35); color: rgba(255,255,255,0.8); }
    .card-status-badge.reviewing { background: rgba(245,158,11,0.85); color: #fff; }
    .card-body { padding: 16px; flex: 1; display: flex; flex-direction: column; }
    .card-title { font-size: 15px; font-weight: 700; margin-bottom: 6px; display: flex; align-items: center; gap: 6px; }
    .cert-badge { display: inline-flex; align-items: center; gap: 3px; font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px; background: linear-gradient(90deg, #0ea5e9, #06b6d4); color: #fff; }
    .card-desc { font-size: 13px; color: #5a6278; line-height: 1.55; margin-bottom: 12px; }
    .tag-row { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
    .tag { font-size: 11px; padding: 2px 8px; border-radius: 5px; background: #f5f6f8; border: 1px solid #e4e7ed; color: #5a6278; font-weight: 500; }
    .tag.accent { background: #eff9ff; border-color: #bae6fd; color: #0ea5e9; }
    .packages { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 14px; }
    .pkg { border: 1px solid #e4e7ed; border-radius: 8px; padding: 8px; text-align: center; cursor: pointer; transition: all 0.18s; background: #f9fafb; }
    .pkg:hover, .pkg.selected { border-color: #0ea5e9; background: #eff9ff; }
    .pkg-name { font-size: 11px; color: #9ba3b8; font-weight: 500; margin-bottom: 4px; }
    .pkg-price { font-size: 14px; font-weight: 700; font-family: 'DM Mono', monospace; color: #1a1d23; }
    .card-stats { display: flex; gap: 12px; padding: 12px 0; border-top: 1px solid #e4e7ed; border-bottom: 1px solid #e4e7ed; margin-bottom: 12px; }
    .cstat { flex: 1; text-align: center; }
    .cstat-val { font-size: 14px; font-weight: 700; font-family: 'DM Mono', monospace; color: #1a1d23; }
    .cstat-key { font-size: 10px; color: #9ba3b8; margin-top: 2px; }
    .card-actions { display: flex; gap: 8px; margin-top: auto; }
    .card-actions .btn { flex: 1; justify-content: center; padding: 8px 10px; font-size: 13px; }
    .add-card { border: 2px dashed #e4e7ed; cursor: pointer; min-height: 280px; align-items: center; justify-content: center; box-shadow: none; padding: 32px 20px; text-align: center; gap: 16px; background: transparent; }
    .add-card:hover { border-color: #0ea5e9; background: #eff9ff; }
    .add-icon { width: 56px; height: 56px; border-radius: 12px; background: #eff9ff; border: 1px dashed #bae6fd; display: flex; align-items: center; justify-content: center; margin: 0 auto; }
    .robot-chip { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; padding: 4px 8px; border-radius: 5px; background: #f5f3ff; border: 1px solid #ddd6fe; color: #8b5cf6; font-weight: 500; margin-bottom: 10px; }
    .toast-container { position: fixed; top: 20px; right: 20px; z-index: 1000; display: flex; flex-direction: column; gap: 8px; }
    .toast { background: #fff; border: 1px solid #e4e7ed; border-radius: 10px; padding: 14px 18px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); display: flex; align-items: center; gap: 12px; min-width: 280px; animation: slideIn 0.25s; }
    @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
    .toast-icon { width: 28px; height: 28px; border-radius: 7px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 14px; }
    .toast-icon.success { background: #ecfdf5; color: #10b981; }
    .toast-icon.info { background: #eff9ff; color: #0ea5e9; }
    .toast-content strong { display: block; font-size: 13px; font-weight: 600; color: #1a1d23; }
    .toast-content span { font-size: 12px; color: #9ba3b8; }
  `;

  @property({ type: Array }) services: SkillService[] = [];
  @state() private filter: "all" | "online" | "offline" | "reviewing" = "all";
  @state() private searchQuery = "";
  @state() private toasts: Array<{ id: number; type: string; title: string; sub?: string }> = [];
  private toastId = 0;

  private showToast(type: string, title: string, sub?: string) {
    const id = ++this.toastId;
    this.toasts = [...this.toasts, { id, type, title, sub }];
    setTimeout(() => { this.toasts = this.toasts.filter(t => t.id !== id); }, 3000);
  }

  private get filteredServices() {
    return this.services.filter(s => {
      if (this.filter !== "all" && s.status !== this.filter) return false;
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        return s.name.toLowerCase().includes(q) || s.tags.some(t => t.toLowerCase().includes(q));
      }
      return true;
    });
  }

  render() {
    return html`
      <div class="container">
        <div class="header">
          <div><div class="header-title">技能服务管理</div><div class="header-subtitle">管理您的技能服务，接入 OpenClaw 机器人</div></div>
          <button class="btn btn-primary" @click=${() => this.showToast("info", "创建服务", "正在打开创建向导...")}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            创建服务
          </button>
        </div>
        <div class="stats-row">
          <div class="stat-card"><div class="stat-label">服务总数</div><div class="stat-value">${this.services.length}</div><div class="stat-sub"><span class="up">↑ 1</span> 较上月</div></div>
          <div class="stat-card"><div class="stat-label">本月成交</div><div class="stat-value">${this.services.reduce((a, s) => a + s.stats.orders, 0)}</div><div class="stat-sub"><span class="up">↑ 23%</span> 较上月</div></div>
          <div class="stat-card"><div class="stat-label">累计收益</div><div class="stat-value" style="font-size:22px">¥28,640</div><div class="stat-sub"><span class="up">↑ ¥4,200</span> 本月新增</div></div>
          <div class="stat-card"><div class="stat-label">综合好评率</div><div class="stat-value">97.8%</div><div class="stat-sub"><span class="up">Top 5%</span> 平台排名</div></div>
        </div>
        <div class="filter-bar">
          <div class="search-box">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="color:#9ba3b8;flex-shrink:0"><circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.8"/><path d="m12 12 3 3" stroke="currentColor" stroke-linecap="round"/></svg>
            <input placeholder="搜索服务名称或标签..." .value=${this.searchQuery} @input=${(e: Event) => (this.searchQuery = (e.target as HTMLInputElement).value)} />
          </div>
          <div style="display:flex;gap:4px">
            ${["all", "online", "offline", "reviewing"].map(f => html`<button class="filter-chip ${this.filter === f ? "active" : ""}" @click=${() => (this.filter = f as any)}>${f === "all" ? "全部" : f === "online" ? "已上架" : f === "offline" ? "已下架" : "审核中"}</button>`)}
          </div>
        </div>
        <div class="service-grid">
          ${this.filteredServices.map(s => html`
            <div class="service-card">
              <div class="card-cover"><div class="card-cover-bg ${s.coverStyle}"></div><div class="card-cover-emoji">${s.emoji}</div><div class="card-status-badge ${s.status}"><span style="width:5px;height:5px;border-radius:50%;background:currentColor"></span>${s.status === "online" ? "已上架" : s.status === "offline" ? "已下架" : "AI 审核中"}</div></div>
              <div class="card-body">
                <div class="card-title">${s.name}${s.certified ? html`<span class="cert-badge">✦ 认证</span>` : ""}</div>
                ${s.robotInfo ? html`<div class="robot-chip"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="2" y="4" width="8" height="6" rx="1.5" stroke="currentColor" stroke-width="1.6"/><path d="M4 4V3a2 2 0 0 1 4 0v1" stroke="currentColor" stroke-linecap="round"/><circle cx="4.5" cy="7" r=".8" fill="currentColor"/><circle cx="7.5" cy="7" r=".8" fill="currentColor"/></svg>${s.robotInfo.name} v${s.robotInfo.version}</div>` : ""}
                <div class="card-desc">${s.description}</div>
                <div class="tag-row">${s.tags.slice(0, 5).map((t, i) => html`<span class="tag ${i < 2 ? "accent" : ""}">${t}</span>`)}${s.tags.length > 5 ? html`<span class="tag">+${s.tags.length - 5}</span>` : ""}</div>
                <div class="packages">${s.packages.map(p => html`<div class="pkg ${p.isRecommended ? "selected" : ""}"><div class="pkg-name">${p.name}</div><div class="pkg-price">¥${p.price}<span style="font-size:10px;color:#9ba3b8">${p.unit}</span></div></div>`)}</div>
                <div class="card-stats">
                  <div class="cstat"><div class="cstat-val">${s.stats.views.toLocaleString()}</div><div class="cstat-key">浏览量</div></div>
                  <div class="cstat"><div class="cstat-val">${s.stats.favorites}</div><div class="cstat-key">收藏数</div></div>
                  <div class="cstat"><div class="cstat-val">${s.stats.orders}</div><div class="cstat-key">成交单</div></div>
                  <div class="cstat"><div class="cstat-val" style="color:#10b981">${s.stats.rating}%</div><div class="cstat-key">好评率</div></div>
                </div>
                <div class="card-actions">
                  <button class="btn btn-ghost" @click=${() => this.showToast("info", "编辑", s.name)}><svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M9 2l3 3-7 7H2V9L9 2Z" stroke="currentColor" stroke-width="1.7"/></svg>编辑</button>
                  <button class="btn btn-ghost" style="color:${s.status === "online" ? "#f59e0b" : "#10b981"}" @click=${() => this.showToast("info", "状态变更", s.status === "online" ? "已下架" : "已上架")}><svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M1 7h12M10 4l3 3-3 3" stroke="currentColor" stroke-width="1.7"/></svg>${s.status === "online" ? "下架" : "上架"}</button>
                  <button class="btn btn-ghost" style="color:#ef4444" @click=${() => this.showToast("success", "已删除", s.name)}><svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2.5h4V4M3 4l.7 8h6.6L11 4" stroke="currentColor" stroke-width="1.7"/></svg>删除</button>
                </div>
              </div>
            </div>
          `)}
          <div class="service-card add-card"><div class="add-icon"><svg width="24" height="24" viewBox="0 0 20 20" fill="none"><path d="M10 3v14M3 10h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></div><div><div class="add-title">创建新服务</div><div class="add-subtitle">填写信息，提交 AI 审核后上架</div></div></div>
        </div>
      </div>
      <div class="toast-container">${this.toasts.map(t => html`<div class="toast"><div class="toast-icon ${t.type}">${t.type === "success" ? "✓" : "ℹ"}</div><div class="toast-content"><strong>${t.title}</strong>${t.sub ? html`<span>${t.sub}</span>` : ""}</div></div>`)}</div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "chatlite-skill-service-list": ChatliteSkillServiceList;
  }
}
