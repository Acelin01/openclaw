<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>M03 服务市场全流程 · Robot Skills Platform</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;500;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Noto+Sans+SC:wght@300;400;500;700&display=swap" rel="stylesheet">
<style>
/* ───────────────────────────────
   RESET & BASE
─────────────────────────────── */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;font-size:14px}
body{
  font-family:'Noto Sans SC',sans-serif;
  background:#FAFAF7;
  color:#1A1916;
  min-height:100vh;
  overflow-x:hidden;
}
img{display:block}
button{font-family:inherit;cursor:pointer}
input,textarea,select{font-family:inherit}
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:#F0EDE6}
::-webkit-scrollbar-thumb{background:#C8C2B0;border-radius:3px}

/* ───────────────────────────────
   DESIGN TOKENS
─────────────────────────────── */
:root{
  /* palette */
  --bg:         #FAFAF7;
  --bg-warm:    #F4F1EA;
  --bg-panel:   #FFFFFF;
  --ink:        #1A1916;
  --ink-2:      #403D38;
  --ink-3:      #6B6760;
  --rule:       #E4E0D8;
  --rule-2:     #D0CCBF;

  /* accent */
  --pine:       #1B5E52;
  --pine-mid:   #2E7D6C;
  --pine-soft:  #EBF4F2;
  --pine-line:  #B6D9D2;

  --ember:      #C75B00;
  --ember-soft: #FEF0E4;
  --ember-line: #F2C5A0;

  --cobalt:     #1A3F9E;
  --cobalt-soft:#EEF2FF;
  --cobalt-line:#B0BFEE;

  --gold:       #8A6200;
  --gold-soft:  #FDF6DC;
  --gold-line:  #D9C080;

  --rose:       #B5274A;
  --rose-soft:  #FEF0F4;

  /* type */
  --serif: 'Shippori Mincho', serif;
  --mono:  'DM Mono', monospace;
  --sans:  'Noto Sans SC', sans-serif;

  /* space */
  --r-sm: 4px;
  --r:    8px;
  --r-lg: 14px;

  /* shadow */
  --sh-xs: 0 1px 3px rgba(0,0,0,.05);
  --sh:    0 2px 8px rgba(0,0,0,.07), 0 1px 2px rgba(0,0,0,.05);
  --sh-lg: 0 8px 32px rgba(0,0,0,.10), 0 2px 8px rgba(0,0,0,.06);
  --sh-xl: 0 20px 60px rgba(0,0,0,.14);
}

/* ───────────────────────────────
   STEP PROGRESS NAV
─────────────────────────────── */
.step-nav{
  position:sticky;top:0;z-index:200;
  background:var(--ink);
  height:56px;
  display:flex;align-items:stretch;
  overflow-x:auto;
  -webkit-overflow-scrolling:touch;
}
.step-nav::-webkit-scrollbar{height:2px}
.step-nav::after{
  content:'';
  position:absolute;bottom:0;left:0;right:0;
  height:2px;background:rgba(255,255,255,.06);
}

.sn-item{
  display:flex;align-items:center;gap:9px;
  padding:0 22px;
  border:none;background:transparent;
  color:rgba(255,255,255,.32);
  font-family:var(--mono);font-size:10.5px;letter-spacing:.05em;
  white-space:nowrap;cursor:pointer;
  border-bottom:2px solid transparent;
  transition:color .2s, border-color .2s;
  position:relative;z-index:1;
}
.sn-item:hover{color:rgba(255,255,255,.65)}
.sn-item.active{color:#fff;border-bottom-color:var(--pine-mid)}
.sn-item.done{color:rgba(255,255,255,.5)}
.sn-num{
  width:20px;height:20px;border-radius:50%;
  background:rgba(255,255,255,.08);
  display:flex;align-items:center;justify-content:center;
  font-size:9px;transition:background .2s, color .2s;flex-shrink:0;
}
.sn-item.active .sn-num{background:var(--pine-mid);color:#fff}
.sn-item.done .sn-num{background:var(--pine);color:#fff;font-size:11px}
.sn-sep{
  color:rgba(255,255,255,.12);
  font-size:14px;
  display:flex;align-items:center;flex-shrink:0;
}

/* ───────────────────────────────
   VIEW SYSTEM
─────────────────────────────── */
.view{display:none}
.view.active{display:block;animation:vIn .28s ease}
@keyframes vIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}

/* ───────────────────────────────
   LAYOUT HELPERS
─────────────────────────────── */
.wrap{max-width:1240px;margin:0 auto;padding:0 28px}
.page{padding:32px 0 60px}

.two-col{display:grid;grid-template-columns:1fr 1fr;gap:24px}
.three-col{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.four-col{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.sidebar-layout{display:grid;grid-template-columns:252px 1fr;gap:24px;align-items:start}
.detail-layout{display:grid;grid-template-columns:1fr 340px;gap:28px;align-items:start}
.order-layout{display:grid;grid-template-columns:1fr 320px;gap:24px;align-items:start}

/* ───────────────────────────────
   TYPOGRAPHY
─────────────────────────────── */
.page-eyebrow{
  font-family:var(--mono);font-size:9px;letter-spacing:.14em;
  text-transform:uppercase;color:var(--ink-3);
  display:flex;align-items:center;gap:8px;margin-bottom:10px;
}
.page-eyebrow::before{content:'';display:block;width:20px;height:1px;background:var(--rule-2)}
.page-title{font-family:var(--serif);font-size:28px;font-weight:700;color:var(--ink);margin-bottom:6px;line-height:1.2}
.page-sub{font-size:12.5px;color:var(--ink-3);line-height:1.7}
.section-label{font-family:var(--mono);font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3);margin-bottom:12px}

/* ───────────────────────────────
   CARDS & PANELS
─────────────────────────────── */
.card{
  background:var(--bg-panel);
  border:1px solid var(--rule);
  border-radius:var(--r);
  overflow:hidden;
}
.card-head{
  padding:14px 18px;
  border-bottom:1px solid var(--rule);
  display:flex;align-items:center;justify-content:space-between;
}
.card-head-title{font-size:13px;font-weight:600;color:var(--ink)}
.card-head-mono{font-family:var(--mono);font-size:9px;color:var(--ink-3);letter-spacing:.06em}
.card-body{padding:18px}

/* ───────────────────────────────
   BUTTONS
─────────────────────────────── */
.btn{
  display:inline-flex;align-items:center;gap:6px;
  padding:9px 20px;border-radius:var(--r-sm);
  font-size:12.5px;font-weight:500;
  border:1px solid transparent;
  transition:all .18s;white-space:nowrap;
}
.btn-pine{background:var(--pine);color:#fff;border-color:var(--pine)}
.btn-pine:hover{background:var(--pine-mid)}
.btn-ink{background:var(--ink);color:#fff}
.btn-ink:hover{background:var(--ink-2)}
.btn-ghost{background:transparent;border-color:var(--rule-2);color:var(--ink-2)}
.btn-ghost:hover{border-color:var(--ink-3);color:var(--ink)}
.btn-ghost-pine{background:transparent;border-color:var(--pine-line);color:var(--pine)}
.btn-ghost-pine:hover{background:var(--pine-soft)}
.btn-sm{padding:6px 14px;font-size:11.5px}
.btn-lg{padding:14px 32px;font-size:14px}
.btn-full{width:100%;justify-content:center}

/* ───────────────────────────────
   FORM ELEMENTS
─────────────────────────────── */
.field{margin-bottom:14px}
.field label{display:block;font-family:var(--mono);font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);margin-bottom:5px}
.input{width:100%;padding:9px 12px;border:1px solid var(--rule-2);border-radius:var(--r-sm);font-family:var(--sans);font-size:13px;color:var(--ink);background:var(--bg-panel);outline:none;transition:border-color .18s}
.input:focus{border-color:var(--pine)}
.textarea{width:100%;padding:9px 12px;border:1px solid var(--rule-2);border-radius:var(--r-sm);font-family:var(--sans);font-size:13px;color:var(--ink);background:var(--bg-panel);outline:none;resize:vertical;min-height:90px;transition:border-color .18s;line-height:1.6}
.textarea:focus{border-color:var(--pine)}
.select{width:100%;padding:9px 12px;border:1px solid var(--rule-2);border-radius:var(--r-sm);font-family:var(--sans);font-size:13px;color:var(--ink);background:var(--bg-panel);outline:none;cursor:pointer;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%236B6760'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:30px}

/* ───────────────────────────────
   TAGS / PILLS
─────────────────────────────── */
.tag{display:inline-flex;align-items:center;padding:2px 8px;border-radius:3px;font-family:var(--mono);font-size:9px;letter-spacing:.04em}
.tag-pine{background:var(--pine-soft);color:var(--pine);border:1px solid var(--pine-line)}
.tag-ember{background:var(--ember-soft);color:var(--ember);border:1px solid var(--ember-line)}
.tag-cobalt{background:var(--cobalt-soft);color:var(--cobalt);border:1px solid var(--cobalt-line)}
.tag-gold{background:var(--gold-soft);color:var(--gold);border:1px solid var(--gold-line)}
.tag-ink{background:#F0EDE6;color:var(--ink-3);border:1px solid var(--rule)}

/* ───────────────────────────────
   TOAST
─────────────────────────────── */
#toast{
  position:fixed;bottom:28px;right:28px;z-index:9999;
  background:var(--ink);color:#fff;
  padding:11px 18px;border-radius:var(--r);
  font-family:var(--mono);font-size:11px;letter-spacing:.02em;
  box-shadow:var(--sh-xl);
  display:flex;align-items:center;gap:10px;
  opacity:0;transform:translateY(12px);
  transition:all .3s cubic-bezier(.34,1.56,.64,1);
  pointer-events:none;max-width:340px;
}
#toast.show{opacity:1;transform:translateY(0)}

/* ───────────────────────────────
   MODAL
─────────────────────────────── */
.modal-bg{
  position:fixed;inset:0;z-index:500;
  background:rgba(26,25,22,.55);
  backdrop-filter:blur(8px);
  display:none;align-items:center;justify-content:center;
}
.modal-bg.open{display:flex}
.modal{
  background:var(--bg-panel);
  border-radius:var(--r-lg);
  padding:32px;
  width:460px;max-width:94vw;
  box-shadow:var(--sh-xl);
  animation:mIn .25s ease;
  position:relative;
}
@keyframes mIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
.modal-title{font-family:var(--serif);font-size:22px;font-weight:700;margin-bottom:4px}
.modal-sub{font-family:var(--mono);font-size:10px;color:var(--ink-3);margin-bottom:22px;letter-spacing:.04em}
.modal-close{
  position:absolute;top:16px;right:18px;
  background:transparent;border:1px solid var(--rule);border-radius:50%;
  width:28px;height:28px;display:flex;align-items:center;justify-content:center;
  color:var(--ink-3);font-size:14px;cursor:pointer;transition:all .15s;
}
.modal-close:hover{border-color:var(--ink);color:var(--ink)}

/* ═══════════════════════════════════════════════
   VIEW 1 — 服务浏览 (F03-01..04 / 08..12)
═══════════════════════════════════════════════ */

/* guest banner */
.guest-bar{
  background:linear-gradient(90deg, var(--cobalt-soft), #F7F9FF);
  border-bottom:1px solid var(--cobalt-line);
  padding:10px 28px;
  display:flex;align-items:center;justify-content:space-between;
}
.guest-bar-text{font-size:12.5px;color:var(--cobalt);display:flex;align-items:center;gap:8px}
.guest-bar-tag{font-family:var(--mono);font-size:9px;background:var(--cobalt);color:#fff;padding:2px 8px;border-radius:3px;letter-spacing:.04em}

/* search hero */
.search-hero{
  background:var(--ink);
  padding:40px 28px;
  position:relative;overflow:hidden;
}
.search-hero::before{
  content:'';position:absolute;inset:0;
  background:
    radial-gradient(ellipse 60% 80% at 10% 50%, rgba(27,94,82,.4) 0%, transparent 60%),
    radial-gradient(ellipse 50% 60% at 90% 30%, rgba(30,63,158,.2) 0%, transparent 55%);
}
.search-hero>*{position:relative;z-index:1}
.sh-label{font-family:var(--mono);font-size:9px;letter-spacing:.16em;color:rgba(255,255,255,.35);text-transform:uppercase;margin-bottom:12px}
.sh-title{font-family:var(--serif);font-size:32px;font-weight:800;color:#fff;margin-bottom:20px;line-height:1.2}
.sh-title em{color:var(--pine-mid);font-style:normal}
.search-box{
  display:flex;background:#fff;border-radius:var(--r);overflow:hidden;
  box-shadow:var(--sh-lg);max-width:680px;
}
.search-box input{
  flex:1;padding:14px 18px;border:none;
  font-family:var(--sans);font-size:14px;color:var(--ink);
  outline:none;background:transparent;
}
.search-box-btn{
  padding:0 26px;background:var(--pine-mid);border:none;color:#fff;
  font-size:13px;font-weight:500;cursor:pointer;transition:background .18s;white-space:nowrap;
}
.search-box-btn:hover{background:var(--pine)}
.sh-tags{display:flex;gap:8px;margin-top:14px;flex-wrap:wrap}
.sh-tag{
  padding:4px 12px;border-radius:20px;
  background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);
  color:rgba(255,255,255,.55);font-size:12px;cursor:pointer;transition:all .18s;
}
.sh-tag:hover{background:rgba(255,255,255,.14);color:rgba(255,255,255,.85)}

/* history chips */
.history-row{display:flex;gap:8px;flex-wrap:wrap;padding:16px 0 4px}
.h-chip{
  display:flex;align-items:center;gap:5px;
  padding:5px 12px;border:1px solid var(--rule);border-radius:20px;
  background:var(--bg-panel);font-size:12px;color:var(--ink-2);cursor:pointer;
  transition:all .15s;
}
.h-chip:hover{border-color:var(--pine-line);color:var(--pine)}
.h-chip-icon{font-size:11px;color:var(--ink-3)}

/* industry grid */
.industry-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
.ind-card{
  background:var(--bg-panel);border:1px solid var(--rule);border-radius:var(--r);
  padding:18px 14px;cursor:pointer;transition:all .2s;text-align:center;
}
.ind-card:hover{border-color:var(--pine-line);transform:translateY(-2px);box-shadow:var(--sh)}
.ind-icon{font-size:28px;margin-bottom:8px}
.ind-name{font-size:12.5px;font-weight:600;margin-bottom:2px;color:var(--ink)}
.ind-count{font-family:var(--mono);font-size:9px;color:var(--ink-3)}

/* filter sidebar */
.filter-card{background:var(--bg-panel);border:1px solid var(--rule);border-radius:var(--r);overflow:hidden;position:sticky;top:70px}
.f-section{border-bottom:1px solid var(--rule)}
.f-section:last-child{border-bottom:none}
.f-section-head{padding:12px 15px;font-size:12.5px;font-weight:600;color:var(--ink);background:var(--bg-warm);cursor:pointer}
.f-section-body{padding:10px 14px 14px;display:flex;flex-direction:column;gap:5px}
.f-chip{
  display:flex;justify-content:space-between;align-items:center;
  padding:7px 10px;border:1px solid var(--rule);border-radius:var(--r-sm);
  cursor:pointer;transition:all .15s;font-size:12.5px;color:var(--ink-2);
}
.f-chip:hover{border-color:var(--pine-line);background:var(--pine-soft)}
.f-chip.on{border-color:var(--pine);background:var(--pine-soft);color:var(--pine);font-weight:500}
.f-chip-c{font-family:var(--mono);font-size:9px;color:var(--ink-3)}
.f-chip.on .f-chip-c{color:var(--pine)}
.rating-btns{display:flex;gap:5px}
.r-btn{flex:1;padding:6px;border:1px solid var(--rule);border-radius:3px;font-family:var(--mono);font-size:10px;background:transparent;cursor:pointer;color:var(--ink-3);transition:all .15s;text-align:center}
.r-btn:hover{border-color:var(--gold-line)}
.r-btn.on{border-color:var(--gold);background:var(--gold-soft);color:var(--gold)}
.price-pair{display:flex;gap:8px;align-items:center}
.p-in{flex:1;padding:7px 10px;border:1px solid var(--rule-2);border-radius:3px;font-family:var(--mono);font-size:12px;color:var(--ink);background:var(--bg-panel);outline:none;transition:border-color .15s}
.p-in:focus{border-color:var(--pine)}
.p-sep{font-size:11px;color:var(--ink-3)}

/* sort toolbar */
.sort-bar{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.sort-pills{display:flex;gap:5px}
.s-pill{padding:6px 14px;border:1px solid var(--rule-2);border-radius:20px;background:transparent;font-family:var(--mono);font-size:10px;color:var(--ink-3);cursor:pointer;transition:all .15s;letter-spacing:.03em}
.s-pill:hover{border-color:var(--ink-3);color:var(--ink)}
.s-pill.on{background:var(--ink);color:#fff;border-color:var(--ink)}
.result-n{font-family:var(--mono);font-size:11px;color:var(--ink-3)}

/* service card */
.sc{
  background:var(--bg-panel);border:1px solid var(--rule);border-radius:var(--r);
  overflow:hidden;cursor:pointer;transition:all .22s;
  animation:scIn .3s ease both;
}
@keyframes scIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.sc:hover{border-color:var(--pine-line);box-shadow:var(--sh-lg);transform:translateY(-3px)}
.sc-thumb{
  height:110px;display:flex;align-items:center;justify-content:center;
  font-size:38px;position:relative;
}
.sc-badge{position:absolute;top:9px;left:9px;font-family:var(--mono);font-size:8px;padding:2px 7px;border-radius:3px;letter-spacing:.06em}
.sc-badge-hot{background:#EF4444;color:#fff}
.sc-badge-new{background:var(--pine);color:#fff}
.sc-body{padding:13px 15px 11px}
.sc-tags{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:7px}
.sc-name{font-size:13px;font-weight:600;line-height:1.4;margin-bottom:5px;color:var(--ink)}
.sc-desc{font-size:11px;color:var(--ink-3);line-height:1.6;margin-bottom:10px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.sc-meta{display:flex;align-items:center;justify-content:space-between;padding-top:9px;border-top:1px solid var(--rule)}
.sc-rating{display:flex;align-items:center;gap:4px;font-family:var(--mono);font-size:10px;color:var(--ink-3)}
.sc-stars{color:#F59E0B;font-size:10px}
.sc-price-num{font-family:var(--mono);font-size:17px;font-weight:700;color:var(--pine);line-height:1}
.sc-price-unit{font-family:var(--mono);font-size:9px;color:var(--ink-3)}
.sc-footer{display:flex;align-items:center;justify-content:space-between;padding:9px 15px;border-top:1px solid var(--rule);background:var(--bg-warm)}
.sc-seller{display:flex;align-items:center;gap:7px}
.av{width:22px;height:22px;border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#fff;flex-shrink:0}
.sc-seller-name{font-size:11.5px;font-weight:500;color:var(--ink-2)}
.sc-seller-cert{font-family:var(--mono);font-size:9px;color:var(--pine)}
.fav-btn{
  width:26px;height:26px;border-radius:4px;border:1px solid var(--rule-2);
  background:transparent;cursor:pointer;font-size:13px;
  display:flex;align-items:center;justify-content:center;transition:all .15s;color:var(--ink-3);
}
.fav-btn:hover,.fav-btn.on{border-color:var(--rose);color:var(--rose);background:var(--rose-soft)}
.cards-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(248px,1fr));gap:14px}
.cards-grid .sc:nth-child(1){animation-delay:.04s}
.cards-grid .sc:nth-child(2){animation-delay:.08s}
.cards-grid .sc:nth-child(3){animation-delay:.12s}
.cards-grid .sc:nth-child(4){animation-delay:.16s}
.cards-grid .sc:nth-child(5){animation-delay:.2s}
.cards-grid .sc:nth-child(6){animation-delay:.24s}

/* ═══════════════════════════════════════════════
   VIEW 2 — 服务详情 (F03-05 / 06 / 07)
═══════════════════════════════════════════════ */
.back-btn{
  display:inline-flex;align-items:center;gap:5px;
  font-family:var(--mono);font-size:11px;color:var(--ink-3);
  background:transparent;border:none;cursor:pointer;
  padding:0;margin-bottom:22px;transition:color .15s;
}
.back-btn:hover{color:var(--ink)}

/* detail media */
.detail-media{
  height:200px;border-radius:var(--r) var(--r) 0 0;
  display:flex;align-items:center;justify-content:center;font-size:72px;
  border:1px solid var(--rule);border-bottom:none;
  background:linear-gradient(135deg, var(--bg-warm) 0%, #ECEAE2 100%);
}
.detail-card{background:var(--bg-panel);border:1px solid var(--rule);border-top:none;border-radius:0 0 var(--r) var(--r);padding:24px}
.detail-title-main{font-family:var(--serif);font-size:24px;font-weight:700;line-height:1.3;margin-bottom:10px;color:var(--ink)}
.detail-row{display:flex;align-items:center;gap:14px;margin-bottom:16px;font-size:12px;color:var(--ink-3)}
.detail-row strong{color:var(--ink-2);font-weight:500}
.detail-desc{font-size:13px;line-height:1.9;color:var(--ink-2);margin-bottom:22px}

/* feature list */
.feat-list{display:flex;flex-direction:column;gap:7px;margin-bottom:22px}
.feat-item{display:flex;gap:9px;font-size:12.5px;color:var(--ink-2);line-height:1.5}
.feat-arrow{color:var(--pine);font-family:var(--mono);font-size:11px;flex-shrink:0;margin-top:2px}

/* packages */
.pkg-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:24px}
.pkg{
  border:1.5px solid var(--rule);border-radius:var(--r);padding:14px 12px;
  cursor:pointer;transition:all .2s;position:relative;
}
.pkg:hover{border-color:var(--pine-line)}
.pkg.sel{border-color:var(--pine);background:var(--pine-soft)}
.pkg-rec{
  position:absolute;top:-1px;left:50%;transform:translateX(-50%);
  background:var(--pine);color:#fff;font-family:var(--mono);font-size:8px;
  padding:1px 9px;border-radius:0 0 4px 4px;letter-spacing:.05em;
}
.pkg-tier{font-family:var(--mono);font-size:10px;color:var(--ink-3);margin-bottom:6px}
.pkg-price{font-family:var(--mono);font-size:20px;font-weight:700;color:var(--pine);line-height:1;margin-bottom:5px}
.pkg-price em{font-style:normal;font-size:10px;color:var(--ink-3);font-weight:400}
.pkg-feats{font-size:11px;color:var(--ink-3);line-height:1.8}

/* reviews */
.rev{padding:14px 0;border-bottom:1px solid var(--rule)}
.rev:last-child{border-bottom:none}
.rev-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
.rev-author{display:flex;align-items:center;gap:8px;font-size:12.5px;font-weight:500}
.rev-date{font-family:var(--mono);font-size:9px;color:var(--ink-3)}
.rev-text{font-size:12.5px;line-height:1.75;color:var(--ink-2)}

/* order sidebar */
.order-sidebar{background:var(--bg-panel);border:1px solid var(--rule);border-radius:var(--r);overflow:hidden;position:sticky;top:70px}
.os-header{background:var(--pine);color:#fff;padding:18px 20px}
.os-h-label{font-family:var(--mono);font-size:9px;opacity:.65;letter-spacing:.1em;margin-bottom:5px}
.os-h-price{font-family:var(--mono);font-size:36px;font-weight:700;line-height:1}
.os-h-unit{font-size:11px;opacity:.65;margin-top:2px}
.os-body{padding:18px 20px;display:flex;flex-direction:column;gap:12px}
.os-row{display:flex;justify-content:space-between;align-items:center;font-size:12.5px}
.os-key{color:var(--ink-3)}
.os-val{font-weight:500;color:var(--ink)}
.os-val-pine{color:var(--pine)}
.os-divider{height:1px;background:var(--rule)}
.os-seller{display:flex;align-items:center;gap:10px;padding:14px 20px;border-top:1px solid var(--rule)}
.os-s-name{font-size:13px;font-weight:600;margin-bottom:1px}
.os-s-sub{font-family:var(--mono);font-size:9px;color:var(--ink-3)}

/* share modal */
.share-methods{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px}
.share-m{
  display:flex;flex-direction:column;align-items:center;gap:6px;
  padding:14px 8px;border:1px solid var(--rule);border-radius:var(--r);
  cursor:pointer;transition:all .15s;
}
.share-m:hover{border-color:var(--pine-line);background:var(--pine-soft)}
.share-m-icon{font-size:22px}
.share-m-label{font-family:var(--mono);font-size:9px;color:var(--ink-3)}
.share-link-row{display:flex;gap:8px}
.share-link-input{
  flex:1;padding:9px 12px;border:1px solid var(--rule-2);border-radius:var(--r-sm);
  font-family:var(--mono);font-size:11px;color:var(--ink-3);background:var(--bg-warm);
}
.copy-btn{
  padding:9px 16px;background:var(--ink);color:#fff;border:none;
  border-radius:var(--r-sm);font-size:12px;cursor:pointer;transition:background .15s;
}
.copy-btn:hover{background:var(--pine)}

/* ═══════════════════════════════════════════════
   VIEW 3 — 沟通 / CHAT
═══════════════════════════════════════════════ */
.chat-wrap{
  display:grid;grid-template-columns:260px 1fr;
  height:calc(100vh - 56px);overflow:hidden;
  margin:0;
}

.chat-sidebar{
  border-right:1px solid var(--rule);background:var(--bg-panel);
  display:flex;flex-direction:column;overflow:hidden;
}
.cs-head{padding:13px 15px;border-bottom:1px solid var(--rule);background:var(--bg-warm)}
.cs-head-title{font-family:var(--mono);font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-3)}
.ci{
  display:flex;align-items:flex-start;gap:9px;
  padding:11px 15px;border-bottom:1px solid var(--rule);cursor:pointer;transition:background .15s;
}
.ci:hover{background:var(--bg-warm)}
.ci.active{background:var(--pine-soft);border-left:2px solid var(--pine)}
.ci-info{flex:1;min-width:0}
.ci-name{font-size:12.5px;font-weight:600;margin-bottom:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ci-prev{font-size:11px;color:var(--ink-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ci-time{font-family:var(--mono);font-size:9px;color:var(--ink-3);flex-shrink:0}
.ci-badge{background:var(--pine);color:#fff;font-family:var(--mono);font-size:8px;padding:1px 6px;border-radius:10px;margin-top:2px;display:inline-block}

.chat-main{display:flex;flex-direction:column;background:var(--bg-warm)}
.chat-top{
  padding:12px 18px;background:var(--bg-panel);border-bottom:1px solid var(--rule);
  display:flex;align-items:center;justify-content:space-between;flex-shrink:0;
}
.chat-contact{display:flex;align-items:center;gap:10px}
.online-dot{width:7px;height:7px;background:#22C55E;border-radius:50%;animation:dp 2s infinite;flex-shrink:0}
@keyframes dp{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.4)}}
.ct-name{font-size:14px;font-weight:600}
.ct-sub{font-family:var(--mono);font-size:9px;color:var(--ink-3)}
.chat-top-btns{display:flex;gap:7px}

.chat-msgs{flex:1;overflow-y:auto;padding:18px;display:flex;flex-direction:column;gap:14px}
.msg{display:flex;gap:7px;align-items:flex-end}
.msg.mine{flex-direction:row-reverse}
.msg-av{width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;flex-shrink:0}
.msg-bbl{max-width:65%;padding:10px 13px;font-size:13px;line-height:1.65}
.msg.theirs .msg-bbl{background:var(--bg-panel);border:1px solid var(--rule);border-radius:12px 12px 12px 3px;color:var(--ink)}
.msg.mine .msg-bbl{background:var(--pine);color:#fff;border-radius:12px 12px 3px 12px}
.msg-t{font-family:var(--mono);font-size:9px;color:var(--ink-3);flex-shrink:0}

/* service card in chat */
.chat-sc{
  background:var(--bg-panel);border:1.5px solid var(--rule-2);border-radius:var(--r);
  padding:13px 15px;max-width:240px;
}
.chat-sc-label{font-family:var(--mono);font-size:8px;color:var(--ink-3);letter-spacing:.1em;margin-bottom:5px}
.chat-sc-name{font-size:13px;font-weight:600;margin-bottom:3px}
.chat-sc-price{font-family:var(--mono);font-size:15px;font-weight:700;color:var(--pine);margin-bottom:10px}
.chat-sc-btn{width:100%;padding:8px;background:var(--pine);color:#fff;border:none;border-radius:4px;font-size:11px;cursor:pointer;transition:background .15s}
.chat-sc-btn:hover{background:var(--pine-mid)}

/* chat input */
.chat-input-wrap{
  padding:10px 14px;background:var(--bg-panel);border-top:1px solid var(--rule);
  flex-shrink:0;display:flex;align-items:flex-end;gap:9px;position:relative;
}
.svc-menu-btn{
  width:34px;height:34px;border-radius:6px;border:1px solid var(--rule-2);
  background:transparent;cursor:pointer;font-size:17px;
  display:flex;align-items:center;justify-content:center;
  transition:all .15s;flex-shrink:0;color:var(--ink-2);
}
.svc-menu-btn:hover{border-color:var(--pine-line);background:var(--pine-soft)}
.chat-ta{
  flex:1;padding:9px 13px;border:1px solid var(--rule-2);border-radius:6px;
  font-family:var(--sans);font-size:13px;color:var(--ink);background:var(--bg-warm);
  outline:none;resize:none;min-height:38px;max-height:110px;transition:border-color .18s;line-height:1.5;
}
.chat-ta:focus{border-color:var(--pine);background:#fff}
.send-btn{
  padding:8px 18px;background:var(--pine);color:#fff;border:none;
  border-radius:6px;font-size:13px;cursor:pointer;transition:background .15s;
  flex-shrink:0;height:38px;
}
.send-btn:hover{background:var(--pine-mid)}
.svc-popup{
  position:absolute;bottom:62px;left:14px;
  background:var(--bg-panel);border:1px solid var(--rule);border-radius:var(--r);
  box-shadow:var(--sh-lg);padding:12px;width:260px;
  display:none;z-index:10;
}
.svc-popup.open{display:block;animation:vIn .2s ease}
.svc-popup-label{font-family:var(--mono);font-size:9px;letter-spacing:.1em;color:var(--ink-3);margin-bottom:8px;text-transform:uppercase}
.svc-popup-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}
.svc-pop-item{
  padding:9px 6px;border:1px solid var(--rule);border-radius:5px;
  cursor:pointer;transition:all .15s;text-align:center;
}
.svc-pop-item:hover{border-color:var(--pine-line);background:var(--pine-soft)}
.spi-icon{font-size:16px;margin-bottom:3px}
.spi-label{font-size:10px;color:var(--ink-2)}
.spi-price{font-family:var(--mono);font-size:8.5px;color:var(--ink-3)}

/* ═══════════════════════════════════════════════
   VIEW 4 — 创建订单
═══════════════════════════════════════════════ */
.pkg-select-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}
.ps-item{
  padding:11px;border:1.5px solid var(--rule);border-radius:var(--r-sm);
  cursor:pointer;transition:all .18s;
}
.ps-item:hover{border-color:var(--pine-line)}
.ps-item.sel{border-color:var(--pine);background:var(--pine-soft)}
.ps-tier{font-family:var(--mono);font-size:9px;color:var(--ink-3);margin-bottom:4px}
.ps-price{font-family:var(--mono);font-size:18px;font-weight:700;color:var(--pine);margin-bottom:2px}
.ps-note{font-size:10px;color:var(--ink-3)}

/* order summary */
.order-sum{background:var(--bg-panel);border:1px solid var(--rule);border-radius:var(--r);overflow:hidden;position:sticky;top:70px}
.osum-head{background:var(--ink);color:#fff;padding:15px 18px}
.osum-label{font-family:var(--mono);font-size:9px;opacity:.45;letter-spacing:.08em;margin-bottom:3px}
.osum-name{font-size:13px;font-weight:500}
.osum-body{padding:16px 18px;display:flex;flex-direction:column;gap:9px}
.osum-row{display:flex;justify-content:space-between;font-size:12.5px}
.osum-k{color:var(--ink-3)}
.osum-v{font-weight:500}
.osum-total{display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-top:1px solid var(--rule);margin-top:4px}
.osum-total-l{font-size:14px;font-weight:600}
.osum-total-r{font-family:var(--mono);font-size:22px;font-weight:700;color:var(--pine)}
.coupon-row{display:flex;gap:7px;padding-top:2px}
.coupon-in{flex:1;padding:8px 10px;border:1px dashed var(--rule-2);border-radius:3px;font-family:var(--mono);font-size:11px;background:var(--bg-warm);color:var(--ink);outline:none}
.coupon-apply{padding:8px 13px;background:var(--gold-soft);border:1px solid var(--gold-line);color:var(--gold);border-radius:3px;font-size:11px;cursor:pointer;transition:all .15s;white-space:nowrap}
.coupon-apply:hover{background:var(--gold);color:#fff}

/* ═══════════════════════════════════════════════
   VIEW 5 — 订单支付
═══════════════════════════════════════════════ */
.pay-methods{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px}
.pay-m{
  padding:15px;border:1.5px solid var(--rule);border-radius:var(--r);
  cursor:pointer;transition:all .2s;text-align:center;
}
.pay-m:hover{border-color:var(--pine-line)}
.pay-m.sel{border-color:var(--pine);background:var(--pine-soft)}
.pay-m-icon{font-size:26px;margin-bottom:5px}
.pay-m-name{font-size:12.5px;font-weight:600;margin-bottom:1px}
.pay-m-sub{font-family:var(--mono);font-size:9px;color:var(--ink-3)}
.pay-info-box{background:var(--pine-soft);border:1px solid var(--pine-line);border-radius:var(--r-sm);padding:11px 14px;font-size:12.5px;color:var(--pine);margin-bottom:16px;display:flex;justify-content:space-between;align-items:center}
.pay-breakdown{background:var(--bg-warm);border-radius:var(--r);padding:15px;margin-bottom:16px;display:flex;flex-direction:column;gap:8px}
.pb-row{display:flex;justify-content:space-between;font-size:12.5px}
.pb-k{color:var(--ink-3)}
.pb-v{color:var(--ink)}
.pb-div{height:1px;background:var(--rule)}
.pb-total{display:flex;justify-content:space-between;font-size:14px;font-weight:700}
.pb-total-v{font-family:var(--mono);color:var(--pine)}
.pay-confirm-btn{
  width:100%;padding:15px;background:var(--pine);color:#fff;border:none;
  border-radius:var(--r);font-size:14.5px;font-weight:500;cursor:pointer;
  transition:all .2s;letter-spacing:.04em;
}
.pay-confirm-btn:hover{background:var(--pine-mid);transform:translateY(-1px);box-shadow:0 6px 24px rgba(27,94,82,.3)}
.security-note{display:flex;align-items:center;justify-content:center;gap:6px;margin-top:10px;font-family:var(--mono);font-size:9px;color:var(--ink-3)}

/* pay confirm sidebar */
.pay-confirm-card{background:var(--bg-panel);border:1px solid var(--rule);border-radius:var(--r);overflow:hidden;position:sticky;top:70px}
.pcc-head{background:var(--bg-warm);padding:14px 18px;border-bottom:1px solid var(--rule)}
.pcc-label{font-family:var(--mono);font-size:9px;color:var(--ink-3);letter-spacing:.08em;margin-bottom:5px}
.pcc-svc{display:flex;align-items:center;gap:10px}
.pcc-svc-icon{font-size:28px}
.pcc-svc-name{font-size:13px;font-weight:600}
.pcc-svc-sub{font-family:var(--mono);font-size:9px;color:var(--ink-3)}
.pcc-body{padding:14px 18px;display:flex;flex-direction:column;gap:8px}
.pcc-total{padding:12px 18px;border-top:1px solid var(--rule);display:flex;justify-content:space-between;align-items:center}
.pcc-total-l{font-size:14px;font-weight:600}
.pcc-total-r{font-family:var(--mono);font-size:22px;font-weight:700;color:var(--pine)}

/* ═══════════════════════════════════════════════
   VIEW 6 — 订单跟踪
═══════════════════════════════════════════════ */
.tracking-layout{display:grid;grid-template-columns:1fr 300px;gap:22px;align-items:start}

/* order status header */
.ord-status-bar{
  background:var(--ink);color:#fff;border-radius:var(--r);
  padding:20px 24px;margin-bottom:18px;
  display:grid;grid-template-columns:repeat(3,1fr);gap:20px;
  position:relative;overflow:hidden;
}
.ord-status-bar::before{
  content:'';position:absolute;inset:0;
  background:radial-gradient(ellipse at 10% 50%, rgba(27,94,82,.25), transparent 55%);
}
.ord-status-bar>*{position:relative;z-index:1}
.osb-item{text-align:center}
.osb-val{font-family:var(--mono);font-size:22px;font-weight:700;line-height:1;margin-bottom:3px}
.osb-val.pine{color:#6EE7D8}
.osb-label{font-family:var(--mono);font-size:9px;opacity:.45;letter-spacing:.08em}
.ord-status-badge{
  position:absolute;top:14px;right:18px;
  font-family:var(--mono);font-size:10px;padding:3px 11px;border-radius:3px;
  background:rgba(110,231,216,.15);color:#6EE7D8;letter-spacing:.04em;
}

/* timeline */
.tl{display:flex;flex-direction:column;gap:0;padding:18px 20px}
.tl-item{display:flex;gap:14px;padding-bottom:22px;position:relative}
.tl-item:last-child{padding-bottom:0}
.tl-left{display:flex;flex-direction:column;align-items:center;flex-shrink:0}
.tl-dot{
  width:28px;height:28px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  font-size:12px;z-index:1;flex-shrink:0;
  border:2px solid var(--rule-2);background:var(--bg-panel);color:var(--ink-3);
  transition:all .3s;
}
.tl-dot.done{background:var(--pine);border-color:var(--pine);color:#fff}
.tl-dot.cur{background:var(--ink);border-color:var(--ink);color:#fff;animation:tlPulse 2s infinite}
@keyframes tlPulse{0%,100%{box-shadow:0 0 0 0 rgba(26,25,22,.25)}60%{box-shadow:0 0 0 8px rgba(26,25,22,0)}}
.tl-line{flex:1;width:2px;background:var(--rule);margin:3px auto 0;min-height:18px}
.tl-line.done{background:var(--pine)}
.tl-content{flex:1;padding-top:3px}
.tl-title{font-size:13px;font-weight:600;margin-bottom:2px;color:var(--ink)}
.tl-desc{font-size:11.5px;color:var(--ink-3);line-height:1.6}
.tl-time{font-family:var(--mono);font-size:9px;color:var(--ink-3);margin-top:4px}

/* task list */
.task-row{
  display:flex;align-items:center;gap:11px;
  padding:10px 16px;border-bottom:1px solid var(--rule);
  transition:background .15s;
}
.task-row:last-child{border-bottom:none}
.task-row:hover{background:var(--bg-warm)}
.task-cb{
  width:18px;height:18px;border-radius:4px;border:1.5px solid var(--rule-2);
  display:flex;align-items:center;justify-content:center;cursor:pointer;
  flex-shrink:0;transition:all .15s;font-size:10px;color:transparent;
}
.task-cb.done{background:var(--pine);border-color:var(--pine);color:#fff}
.task-name{flex:1;font-size:12.5px;color:var(--ink-2)}
.task-name.done{text-decoration:line-through;color:var(--ink-3)}
.task-s{font-family:var(--mono);font-size:9px}

/* upload zone */
.upload-z{
  border:2px dashed var(--rule-2);border-radius:var(--r);padding:28px;
  text-align:center;cursor:pointer;transition:all .2s;background:var(--bg-warm);
  margin-bottom:12px;
}
.upload-z:hover{border-color:var(--pine-line);background:var(--pine-soft)}
.upload-icon{font-size:32px;margin-bottom:8px}
.upload-text{font-size:13px;color:var(--ink-2);margin-bottom:3px}
.upload-sub{font-family:var(--mono);font-size:10px;color:var(--ink-3)}
.verdict-pair{display:grid;grid-template-columns:1fr 1fr;gap:9px}
.btn-accept{padding:12px;background:var(--pine);color:#fff;border:none;border-radius:var(--r-sm);font-size:13px;font-weight:500;cursor:pointer;transition:background .15s}
.btn-accept:hover{background:var(--pine-mid)}
.btn-request{padding:12px;background:transparent;border:1.5px solid var(--rule-2);color:var(--ink-2);border-radius:var(--r-sm);font-size:13px;cursor:pointer;transition:all .15s}
.btn-request:hover{border-color:var(--rose);color:var(--rose)}

/* live billing widget */
.billing-widget{background:var(--ink);border-radius:var(--r);color:#fff;padding:18px;margin-bottom:14px;position:relative;overflow:hidden}
.billing-widget::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 90% 10%, rgba(27,94,82,.22), transparent 55%)}
.bw>*{position:relative;z-index:1}
.bw-eyebrow{font-family:var(--mono);font-size:8.5px;letter-spacing:.12em;opacity:.4;text-transform:uppercase;margin-bottom:7px}
.bw-amount{font-family:var(--mono);font-size:38px;font-weight:700;line-height:1;margin-bottom:3px}
.bw-amount em{font-style:normal;font-size:20px;opacity:.4;margin-right:2px}
.bw-rate{font-family:var(--mono);font-size:10px;opacity:.38;margin-bottom:14px}
.bw-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.bw-cell{background:rgba(255,255,255,.06);border-radius:4px;padding:8px 10px}
.bwc-l{font-family:var(--mono);font-size:8px;opacity:.38;letter-spacing:.06em;margin-bottom:2px}
.bwc-v{font-family:var(--mono);font-size:13px;font-weight:600}
.bw-bar{height:3px;background:rgba(255,255,255,.1);border-radius:2px;margin-top:11px;overflow:hidden}
.bw-bar-fill{height:100%;background:var(--pine-mid);border-radius:2px;animation:bwFill 6s linear infinite}
@keyframes bwFill{from{width:100%}to{width:0}}

/* ═══════════════════════════════════════════════
   VIEW 7 — 我的收藏
═══════════════════════════════════════════════ */
.empty-state{text-align:center;padding:60px 20px}
.empty-icon{font-size:48px;margin-bottom:12px}
.empty-t{font-size:14px;color:var(--ink-2);margin-bottom:3px;font-weight:500}
.empty-s{font-family:var(--mono);font-size:10px;color:var(--ink-3)}

/* ───────────────────────────────
   MISC SHARED
─────────────────────────────── */
.divider{height:1px;background:var(--rule);margin:20px 0}
.info-box-pine{background:var(--pine-soft);border:1px solid var(--pine-line);border-radius:var(--r-sm);padding:10px 13px;font-size:12px;color:var(--pine)}
.info-box-amber{background:var(--ember-soft);border:1px solid var(--ember-line);border-radius:var(--r-sm);padding:10px 13px;font-size:12px;color:var(--ember)}

@media(max-width:900px){
  .sidebar-layout,.detail-layout,.chat-wrap,.order-layout,.tracking-layout{grid-template-columns:1fr}
  .industry-grid{grid-template-columns:repeat(2,1fr)}
  .pkg-grid,.pkg-select-grid{grid-template-columns:1fr 1fr}
  .chat-wrap{height:auto}
}
</style>
</head>
<body>

<!-- ── TOAST ── -->
<div id="toast"><span id="toast-icon">✓</span> <span id="toast-msg">操作成功</span></div>

<!-- ── SHARE MODAL ── -->
<div class="modal-bg" id="shareModal">
  <div class="modal">
    <button class="modal-close" onclick="closeModal('shareModal')">✕</button>
    <div class="modal-title">分享服务</div>
    <div class="modal-sub">F03-07 · 生成分享链接或卡片，分享给第三方</div>
    <div class="share-methods">
      <div class="share-m" onclick="toast('已生成微信分享卡片','💚')"><div class="share-m-icon">💚</div><div class="share-m-label">微信</div></div>
      <div class="share-m" onclick="toast('已生成微博链接','🔵')"><div class="share-m-icon">🔵</div><div class="share-m-label">微博</div></div>
      <div class="share-m" onclick="toast('已生成专属卡片','🖼️')"><div class="share-m-icon">🖼️</div><div class="share-m-label">分享卡片</div></div>
      <div class="share-m" onclick="toast('链接已复制','🔗')"><div class="share-m-icon">🔗</div><div class="share-m-label">复制链接</div></div>
    </div>
    <div class="share-link-row">
      <input class="share-link-input" readonly value="https://rsp.ai/s/databot-pro?ref=share&uid=100234">
      <button class="copy-btn" onclick="toast('链接已复制到剪贴板','✓')">复制</button>
    </div>
    <button class="btn btn-ghost btn-full" style="margin-top:14px" onclick="closeModal('shareModal')">关闭</button>
  </div>
</div>

<!-- ═══ STEP NAV ═══ -->
<nav class="step-nav" id="stepNav">
  <button class="sn-item active" data-view="browse" onclick="go('browse',this)"><span class="sn-num">1</span>服务浏览</button>
  <span class="sn-sep">›</span>
  <button class="sn-item" data-view="detail" onclick="go('detail',this)"><span class="sn-num">2</span>服务详情</button>
  <span class="sn-sep">›</span>
  <button class="sn-item" data-view="share" onclick="go('share',this)"><span class="sn-num">3</span>分享&收藏</button>
  <span class="sn-sep">›</span>
  <button class="sn-item" data-view="chat" onclick="go('chat',this)"><span class="sn-num">4</span>与服务者沟通</button>
  <span class="sn-sep">›</span>
  <button class="sn-item" data-view="order" onclick="go('order',this)"><span class="sn-num">5</span>创建订单</button>
  <span class="sn-sep">›</span>
  <button class="sn-item" data-view="pay" onclick="go('pay',this)"><span class="sn-num">6</span>订单支付</button>
  <span class="sn-sep">›</span>
  <button class="sn-item" data-view="track" onclick="go('track',this)"><span class="sn-num">7</span>订单跟踪</button>
  <span class="sn-sep">›</span>
  <button class="sn-item" data-view="favs" onclick="go('favs',this)"><span class="sn-num">8</span>我的收藏</button>
</nav>

<!-- ════════════════════════════════════════════════════
     VIEW 1 — 服务浏览
════════════════════════════════════════════════════ -->
<div class="view active" id="v-browse">

  <!-- Guest notice F03-12 -->
  <div class="guest-bar">
    <div class="guest-bar-text">
      <span class="guest-bar-tag">GUEST</span>
      你正以游客身份浏览 · 可查看全部服务，<strong>下单需登录</strong> · F03-12
    </div>
    <button class="btn btn-pine btn-sm" onclick="toast('跳转至登录页面','👤')">登录 / 注册</button>
  </div>

  <!-- Search hero F03-02 -->
  <div class="search-hero">
    <div class="wrap">
      <div class="sh-label">M03 · 服务市场</div>
      <div class="sh-title">发现<em>人机协作</em>的最优服务者</div>
      <div class="search-box">
        <input id="searchInp" placeholder="搜索技能服务…支持模糊匹配与语义搜索">
        <button class="search-box-btn" onclick="toast('AI 语义搜索中…','🔍')">🔍 智能搜索</button>
      </div>
      <div class="sh-tags">
        <span class="sh-tag" onclick="toast('已搜索：数据分析','🔍')">数据分析</span>
        <span class="sh-tag" onclick="toast('已搜索：SEO','🔍')">SEO 优化</span>
        <span class="sh-tag" onclick="toast('已搜索：UI设计','🔍')">UI/UX 设计</span>
        <span class="sh-tag" onclick="toast('已搜索：全栈开发','🔍')">全栈开发</span>
        <span class="sh-tag" onclick="toast('已搜索：智能客服','🔍')">智能客服</span>
      </div>
    </div>
  </div>

  <div class="wrap page">

    <!-- Industry solutions F03-11 -->
    <div class="page-eyebrow">行业解决方案 · F03-11</div>
    <div class="industry-grid" style="margin-bottom:28px">
      <div class="ind-card" onclick="toast('已筛选：电商运营方案','🛍️')"><div class="ind-icon">🛍️</div><div class="ind-name">电商运营</div><div class="ind-count">312 个服务</div></div>
      <div class="ind-card" onclick="toast('已筛选：在线教育','📚')"><div class="ind-icon">📚</div><div class="ind-name">在线教育</div><div class="ind-count">198 个服务</div></div>
      <div class="ind-card" onclick="toast('已筛选：金融科技','💹')"><div class="ind-icon">💹</div><div class="ind-name">金融科技</div><div class="ind-count">156 个服务</div></div>
      <div class="ind-card" onclick="toast('已筛选：AI自动化','🤖')"><div class="ind-icon">🤖</div><div class="ind-name">AI 自动化</div><div class="ind-count">489 个服务</div></div>
    </div>

    <!-- History F03-08 -->
    <div class="section-label">历史浏览 · F03-08</div>
    <div class="history-row" style="margin-bottom:22px">
      <div class="h-chip" onclick="toast('重新搜索：数据分析机器人','🕐')"><span class="h-chip-icon">🕐</span>数据分析机器人</div>
      <div class="h-chip" onclick="toast('重新搜索：SEO内容创作','🕐')"><span class="h-chip-icon">🕐</span>SEO 内容创作</div>
      <div class="h-chip" onclick="toast('重新搜索：UI/UX设计','🕐')"><span class="h-chip-icon">🕐</span>UI/UX 设计</div>
      <div class="h-chip" onclick="toast('重新搜索：全栈开发','🕐')"><span class="h-chip-icon">🕐</span>全栈开发</div>
    </div>

    <div class="sidebar-layout">

      <!-- Filter F03-03 -->
      <div class="filter-card">
        <div class="f-section">
          <div class="f-section-head">服务类型 · F03-03</div>
          <div class="f-section-body">
            <div class="f-chip on" onclick="fchip(this)">全部 <span class="f-chip-c">2,438</span></div>
            <div class="f-chip" onclick="fchip(this)">🤖 机器人服务 <span class="f-chip-c">498</span></div>
            <div class="f-chip" onclick="fchip(this)">👤 人工服务 <span class="f-chip-c">1,240</span></div>
            <div class="f-chip" onclick="fchip(this)">🔀 混合服务 <span class="f-chip-c">700</span></div>
          </div>
        </div>
        <div class="f-section">
          <div class="f-section-head">认证状态</div>
          <div class="f-section-body">
            <div class="f-chip" onclick="fchip(this)">✅ 平台认证 <span class="f-chip-c">824</span></div>
            <div class="f-chip" onclick="fchip(this)">⭐ 精选推荐 <span class="f-chip-c">312</span></div>
          </div>
        </div>
        <div class="f-section">
          <div class="f-section-head">评分筛选</div>
          <div class="f-section-body">
            <div class="rating-btns">
              <button class="r-btn" onclick="rbtn(this)">4.5+</button>
              <button class="r-btn on" onclick="rbtn(this)">4.0+</button>
              <button class="r-btn" onclick="rbtn(this)">全部</button>
            </div>
          </div>
        </div>
        <div class="f-section">
          <div class="f-section-head">价格区间 (¥/h)</div>
          <div class="f-section-body">
            <div class="price-pair">
              <input class="p-in" type="number" placeholder="最低" value="0">
              <span class="p-sep">—</span>
              <input class="p-in" type="number" placeholder="最高" value="600">
            </div>
            <button class="btn btn-ghost btn-sm btn-full" style="margin-top:6px" onclick="toast('价格筛选已应用','🔍')">应用</button>
          </div>
        </div>
      </div>

      <div>
        <!-- Sort toolbar F03-04 -->
        <div class="sort-bar">
          <div class="result-n">共 2,438 个服务</div>
          <div class="sort-pills">
            <button class="s-pill on" onclick="spill(this)">综合排序</button>
            <button class="s-pill" onclick="spill(this)">销量优先</button>
            <button class="s-pill" onclick="spill(this)">价格 ↑</button>
            <button class="s-pill" onclick="spill(this)">评分优先</button>
          </div>
        </div>

        <!-- Hot F03-09 -->
        <div class="section-label" style="margin-bottom:10px">🔥 热门推荐 · F03-09</div>
        <div class="cards-grid" id="hotGrid"></div>

        <!-- New F03-10 -->
        <div class="section-label" style="margin:22px 0 10px">✨ 新店推荐 · F03-10</div>
        <div class="cards-grid" id="newGrid"></div>

        <div style="display:flex;justify-content:center;padding:28px 0">
          <button class="btn btn-ghost" onclick="toast('加载更多服务…','⬇️')">加载更多</button>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ════════════════════════════════════════════════════
     VIEW 2 — 服务详情 (F03-05)
════════════════════════════════════════════════════ -->
<div class="view" id="v-detail">
  <div class="wrap page">
    <button class="back-btn" onclick="go('browse',qS('[data-view=browse]'))">← 返回服务市场</button>
    <div class="detail-layout">

      <div>
        <div class="detail-media">📊</div>
        <div class="detail-card">
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
            <span class="tag tag-pine">机器人服务</span>
            <span class="tag tag-gold">平台认证</span>
            <span class="tag tag-ember">热门</span>
          </div>
          <div class="detail-title-main">全自动数据分析与可视化报告生成</div>
          <div class="detail-row">
            <span>⭐</span>
            <strong>4.9</strong>
            <span>(312 条评价)</span>
            <span>·</span>
            <span>已完成 1,240 个订单</span>
            <span>·</span>
            <span>响应时间 ≤ 15 分钟</span>
          </div>
          <div class="detail-desc">
            上传原始数据（Excel / CSV / 数据库），机器人自动进行数据清洗、统计分析、异常检测，并生成交互式可视化报告。支持多数据源对比、趋势预测、关键指标提炼，报告可导出为 PDF / HTML / PPT 格式，平均完成时间 8 分钟。
          </div>

          <div class="section-label">服务亮点</div>
          <div class="feat-list" style="margin-bottom:22px">
            <div class="feat-item"><span class="feat-arrow">→</span>支持 Excel、CSV、MySQL、PostgreSQL 等多数据源</div>
            <div class="feat-item"><span class="feat-arrow">→</span>AI 自动识别数据类型，智能选择最优可视化图表</div>
            <div class="feat-item"><span class="feat-arrow">→</span>内置异常检测与数据清洗，结果准确可信</div>
            <div class="feat-item"><span class="feat-arrow">→</span>交互式 Dashboard，支持自定义筛选与下钻</div>
            <div class="feat-item"><span class="feat-arrow">→</span>全程无需人工干预，平均 8 分钟完成报告</div>
          </div>

          <div class="section-label">套餐对比 · F03-05</div>
          <div class="pkg-grid" style="margin-bottom:24px">
            <div class="pkg" onclick="selPkg(this)">
              <div class="pkg-tier">基础版</div>
              <div class="pkg-price">¥280 <em>/h</em></div>
              <div class="pkg-feats">· 单数据源分析<br>· 基础图表 5 种<br>· PDF 导出<br>· 响应 &lt;30min</div>
            </div>
            <div class="pkg sel" onclick="selPkg(this)">
              <div class="pkg-rec">推荐</div>
              <div class="pkg-tier">专业版</div>
              <div class="pkg-price">¥380 <em>/h</em></div>
              <div class="pkg-feats">· 多数据源对比<br>· 图表 20+ 种<br>· 交互 Dashboard<br>· 趋势预测</div>
            </div>
            <div class="pkg" onclick="selPkg(this)">
              <div class="pkg-tier">企业版</div>
              <div class="pkg-price">¥580 <em>/h</em></div>
              <div class="pkg-feats">· 定制分析模型<br>· 实时数据接入<br>· 私有部署<br>· 专属客户经理</div>
            </div>
          </div>

          <div class="section-label">用户评价 (312)</div>
          <div id="revList"></div>
        </div>
      </div>

      <!-- Order sidebar -->
      <div>
        <div class="order-sidebar">
          <div class="os-header">
            <div class="os-h-label">当前套餐</div>
            <div class="os-h-price">¥380</div>
            <div class="os-h-unit">/ 小时 · 专业版</div>
          </div>
          <div class="os-body">
            <div class="os-row"><span class="os-key">响应时间</span><span class="os-val">≤ 15 分钟</span></div>
            <div class="os-row"><span class="os-key">综合评分</span><span class="os-val">⭐ 4.9 (312条)</span></div>
            <div class="os-row"><span class="os-key">完成订单</span><span class="os-val">1,240 个</span></div>
            <div class="os-row"><span class="os-key">平台保障</span><span class="os-val os-val-pine">✓ 资金托管</span></div>
            <div class="os-divider"></div>
            <button class="btn btn-pine btn-full" onclick="go('chat',qS('[data-view=chat]'))">💬 先与服务者沟通</button>
            <button class="btn btn-ink btn-full" style="margin-top:6px" onclick="go('order',qS('[data-view=order]'))">立即下单 →</button>
            <button class="btn btn-ghost-pine btn-full" style="margin-top:6px" onclick="go('share',qS('[data-view=share]'))">↗ 分享 & 收藏</button>
          </div>
          <div class="os-seller">
            <div class="av" style="background:#1B5E52;width:38px;height:38px;border-radius:8px;font-size:13px">DB</div>
            <div>
              <div class="os-s-name">DataBot Pro</div>
              <div class="os-s-sub">认证机器人 · 在线 · 均响应 8min</div>
            </div>
            <button class="btn btn-ghost btn-sm" style="margin-left:auto" onclick="go('chat',qS('[data-view=chat]'))">沟通</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ════════════════════════════════════════════════════
     VIEW 3 — 分享 & 收藏 (F03-06 / F03-07)
════════════════════════════════════════════════════ -->
<div class="view" id="v-share">
  <div class="wrap page">
    <button class="back-btn" onclick="go('detail',qS('[data-view=detail]'))">← 返回服务详情</button>
    <div class="two-col" style="max-width:900px">

      <!-- Share F03-07 -->
      <div class="card">
        <div class="card-head">
          <div class="card-head-title">服务分享 · F03-07</div>
          <div class="card-head-mono">生成分享链接或卡片</div>
        </div>
        <div class="card-body">
          <p style="font-size:12.5px;color:var(--ink-3);margin-bottom:18px;line-height:1.7">将该服务分享给朋友或同事，通过链接或专属卡片形式，引导更多用户了解并使用。</p>
          <div class="share-methods" style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:18px">
            <div class="share-m" onclick="toast('已生成微信分享卡片','💚')"><div class="share-m-icon">💚</div><div class="share-m-label">微信好友</div></div>
            <div class="share-m" onclick="toast('已生成微信群组链接','📱')"><div class="share-m-icon">📱</div><div class="share-m-label">微信群组</div></div>
            <div class="share-m" onclick="toast('已生成微博链接','🔵')"><div class="share-m-icon">🔵</div><div class="share-m-label">微博</div></div>
            <div class="share-m" onclick="toast('已生成分享卡片，可下载','🖼️')"><div class="share-m-icon">🖼️</div><div class="share-m-label">分享卡片</div></div>
          </div>
          <div class="section-label">分享链接</div>
          <div class="share-link-row" style="margin-bottom:14px">
            <input class="share-link-input" readonly value="https://rsp.ai/s/databot-pro-analytics?ref=u100234">
            <button class="copy-btn" onclick="toast('链接已复制到剪贴板','✓')">复制</button>
          </div>
          <!-- Share card preview -->
          <div style="border:1px solid var(--rule);border-radius:var(--r);overflow:hidden;background:var(--bg-warm)">
            <div style="background:var(--pine);padding:16px;display:flex;align-items:center;gap:12px">
              <div style="font-size:28px">📊</div>
              <div>
                <div style="font-family:var(--serif);font-size:14px;font-weight:700;color:#fff;margin-bottom:2px">全自动数据分析报告</div>
                <div style="font-family:var(--mono);font-size:9px;color:rgba(255,255,255,.6)">DataBot Pro · 机器人服务 · ⭐4.9</div>
              </div>
            </div>
            <div style="padding:12px 14px;display:flex;align-items:center;justify-content:space-between">
              <div style="font-family:var(--mono);font-size:11px;color:var(--ink-3)">rsp.ai/s/databot-pro-analytics</div>
              <div style="font-family:var(--mono);font-size:16px;font-weight:700;color:var(--pine)">¥280/h 起</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Favorites F03-06 -->
      <div class="card">
        <div class="card-head">
          <div class="card-head-title">服务收藏 · F03-06</div>
          <div class="card-head-mono">收藏感兴趣的服务</div>
        </div>
        <div class="card-body">
          <p style="font-size:12.5px;color:var(--ink-3);margin-bottom:18px;line-height:1.7">收藏服务后可在「我的收藏」列表中随时查看，方便日后快速找到并下单。</p>

          <!-- Current service -->
          <div style="border:1px solid var(--rule);border-radius:var(--r);overflow:hidden;margin-bottom:16px">
            <div style="display:flex;align-items:center;gap:12px;padding:13px 15px;border-bottom:1px solid var(--rule)">
              <div style="font-size:28px">📊</div>
              <div style="flex:1">
                <div style="font-size:13px;font-weight:600;margin-bottom:3px">全自动数据分析与可视化报告生成</div>
                <div style="display:flex;gap:5px"><span class="tag tag-pine">机器人服务</span><span class="tag tag-gold">平台认证</span></div>
              </div>
              <div style="font-family:var(--mono);font-size:18px;font-weight:700;color:var(--pine)">¥280<span style="font-size:10px;color:var(--ink-3)">/h起</span></div>
            </div>
            <div style="padding:12px 15px;display:flex;gap:8px">
              <button class="btn btn-pine btn-sm" id="favThisBtn" onclick="toggleFavThis(this)">♡ 收藏此服务</button>
              <button class="btn btn-ghost btn-sm" onclick="go('favs',qS('[data-view=favs]'))">查看收藏列表 →</button>
            </div>
          </div>

          <div class="section-label">我的收藏预览</div>
          <div style="display:flex;flex-direction:column;gap:8px" id="favPreview"></div>
          <button class="btn btn-ghost btn-full" style="margin-top:12px" onclick="go('favs',qS('[data-view=favs]'))">管理全部收藏 →</button>
        </div>
      </div>
    </div>

    <div style="margin-top:28px;display:flex;gap:12px">
      <button class="btn btn-pine" onclick="go('chat',qS('[data-view=chat]'))">继续：与服务者沟通 →</button>
      <button class="btn btn-ghost" onclick="go('order',qS('[data-view=order]'))">跳过沟通，直接下单</button>
    </div>
  </div>
</div>

<!-- ════════════════════════════════════════════════════
     VIEW 4 — 与服务者沟通
════════════════════════════════════════════════════ -->
<div class="view" id="v-chat">
  <div class="chat-wrap">

    <!-- sidebar -->
    <div class="chat-sidebar">
      <div class="cs-head"><div class="cs-head-title">消息列表</div></div>

      <div style="padding:8px 14px;background:var(--pine-soft);border-bottom:1px solid var(--pine-line);display:flex;align-items:center;gap:8px">
        <div style="font-size:16px">🤖</div>
        <div>
          <div style="font-size:11.5px;font-weight:600;color:var(--pine)">需求分析机器人</div>
          <div style="font-family:var(--mono);font-size:9px;color:var(--pine-mid)">默认置顶 · 随时可用</div>
        </div>
      </div>

      <div class="ci active">
        <div class="av" style="background:#1B5E52;width:34px;height:34px;border-radius:7px;font-size:12px">DB</div>
        <div class="ci-info">
          <div class="ci-name">DataBot Pro</div>
          <div class="ci-prev">已准备好为您服务，请描述需求…</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:3px">
          <div class="ci-time">刚刚</div>
          <div class="ci-badge">2</div>
        </div>
      </div>

      <div class="ci" onclick="toast('切换至客服助手','💬')">
        <div class="av" style="background:#1A3F9E;width:34px;height:34px;border-radius:7px;font-size:12px">客</div>
        <div class="ci-info">
          <div class="ci-name">客服助手</div>
          <div class="ci-prev">有任何疑问请随时联系我们</div>
        </div>
        <div class="ci-time">昨天</div>
      </div>

      <div style="padding:8px 14px;font-family:var(--mono);font-size:8.5px;color:var(--ink-3);letter-spacing:.1em;text-transform:uppercase;border-bottom:1px solid var(--rule)">历史对话</div>

      <div class="ci" onclick="toast('切换对话','👤')">
        <div class="av" style="background:#7C3AED;width:34px;height:34px;border-radius:7px;font-size:12px">李</div>
        <div class="ci-info">
          <div class="ci-name">李建国</div>
          <div class="ci-prev">好的，我看一下您的数据结构</div>
        </div>
        <div class="ci-time">03-05</div>
      </div>
    </div>

    <!-- chat main -->
    <div class="chat-main">
      <div class="chat-top">
        <div class="chat-contact">
          <div class="av" style="background:#1B5E52;width:32px;height:32px;border-radius:7px;font-size:12px">DB</div>
          <div class="online-dot"></div>
          <div>
            <div class="ct-name">DataBot Pro</div>
            <div class="ct-sub">认证机器人 · 在线 · 均响应 8min</div>
          </div>
        </div>
        <div class="chat-top-btns">
          <button class="btn btn-ghost btn-sm" onclick="openModal('shareModal')">分享</button>
          <button class="btn btn-ghost btn-sm" onclick="toggleFavThis(qS('#favThisBtn'))">♡ 收藏</button>
          <button class="btn btn-pine btn-sm" onclick="go('order',qS('[data-view=order]'))">下单 →</button>
        </div>
      </div>

      <div class="chat-msgs" id="chatMsgs">
        <div class="msg theirs">
          <div class="msg-av" style="background:#1B5E52">DB</div>
          <div>
            <div class="msg-bbl">您好！我是 DataBot Pro，专注数据分析与可视化报告。请问您需要分析什么类型的数据？</div>
            <div class="msg-t">09:30</div>
          </div>
        </div>
        <div class="msg mine">
          <div class="msg-av" style="background:#1A3F9E">我</div>
          <div>
            <div class="msg-bbl">我们电商平台有近半年的销售数据，大概 50 万行，想做销售趋势分析和品类对比报告。</div>
            <div class="msg-t">09:31</div>
          </div>
        </div>
        <div class="msg theirs">
          <div class="msg-av" style="background:#1B5E52">DB</div>
          <div>
            <div class="msg-bbl">明白！50万行数据完全没问题。我可以为您提供：<br><br>① 月度/周度销售趋势图<br>② 品类销售占比与环比对比<br>③ Top商品排行与库存预警<br>④ 客单价与转化率分析<br><br>建议选择「专业版」套餐，预计 25-35 分钟完成报告。</div>
            <div class="msg-t">09:32</div>
          </div>
        </div>
        <div class="msg theirs">
          <div class="msg-av" style="background:#1B5E52">DB</div>
          <div>
            <div class="chat-sc">
              <div class="chat-sc-label">服务卡片 · 专业版</div>
              <div class="chat-sc-name">全自动数据分析报告</div>
              <div class="chat-sc-price">¥380 / 小时</div>
              <button class="chat-sc-btn" onclick="go('order',qS('[data-view=order]'))">选择此套餐 →</button>
            </div>
            <div class="msg-t">09:32</div>
          </div>
        </div>
        <div class="msg mine">
          <div class="msg-av" style="background:#1A3F9E">我</div>
          <div>
            <div class="msg-bbl">好的，就选专业版！数据是 CSV 格式，可以直接上传吗？</div>
            <div class="msg-t">09:33</div>
          </div>
        </div>
        <div class="msg theirs">
          <div class="msg-av" style="background:#1B5E52">DB</div>
          <div>
            <div class="msg-bbl">支持 CSV、Excel、JSON 格式，单文件最大 500MB。确认下单后在订单页上传即可，接到任务后 15 分钟内开始处理。</div>
            <div class="msg-t">09:33</div>
          </div>
        </div>
      </div>

      <div class="chat-input-wrap">
        <div class="svc-popup" id="svcPopup">
          <div class="svc-popup-label">智能服务菜单 · 快速插入服务卡片</div>
          <div class="svc-popup-grid">
            <div class="svc-pop-item" onclick="insertSvc('全自动数据分析','¥380/h')"><div class="spi-icon">📊</div><div class="spi-label">数据分析</div><div class="spi-price">¥380/h</div></div>
            <div class="svc-pop-item" onclick="insertSvc('基础版套餐','¥280/h')"><div class="spi-icon">📋</div><div class="spi-label">基础套餐</div><div class="spi-price">¥280/h</div></div>
            <div class="svc-pop-item" onclick="insertSvc('企业版定制','¥580/h')"><div class="spi-icon">🏢</div><div class="spi-label">企业定制</div><div class="spi-price">¥580/h</div></div>
          </div>
        </div>
        <button class="svc-menu-btn" onclick="toggleSvcMenu()" title="智能服务菜单 ⊕">⊕</button>
        <textarea class="chat-ta" id="chatTa" placeholder="描述需求或提问…Enter 发送，Shift+Enter 换行" rows="1"></textarea>
        <button class="send-btn" onclick="sendMsg()">发送</button>
      </div>
    </div>
  </div>
</div>

<!-- ════════════════════════════════════════════════════
     VIEW 5 — 创建订单
════════════════════════════════════════════════════ -->
<div class="view" id="v-order">
  <div class="wrap page">
    <button class="back-btn" onclick="go('detail',qS('[data-view=detail]'))">← 返回服务详情</button>
    <div style="margin-bottom:22px">
      <div class="page-eyebrow">第 5 步 · 创建订单</div>
      <div class="page-title">确认订单信息</div>
      <div class="page-sub">请核对服务信息并填写需求说明</div>
    </div>

    <div class="order-layout">
      <div>
        <!-- Service info -->
        <div class="card" style="margin-bottom:16px">
          <div class="card-head"><div class="card-head-title">服务信息</div></div>
          <div class="card-body">
            <div style="display:flex;align-items:center;gap:14px;padding:12px;background:var(--bg-warm);border-radius:var(--r-sm)">
              <div style="font-size:36px">📊</div>
              <div style="flex:1">
                <div style="font-size:14px;font-weight:600;margin-bottom:5px">全自动数据分析与可视化报告生成</div>
                <div style="display:flex;gap:5px"><span class="tag tag-pine">专业版</span><span class="tag tag-gold">平台认证</span></div>
              </div>
              <div style="text-align:right">
                <div style="font-family:var(--mono);font-size:22px;font-weight:700;color:var(--pine)">¥380</div>
                <div style="font-family:var(--mono);font-size:9px;color:var(--ink-3)">/小时</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Package select -->
        <div class="card" style="margin-bottom:16px">
          <div class="card-head"><div class="card-head-title">选择套餐</div></div>
          <div class="card-body">
            <div class="pkg-select-grid">
              <div class="ps-item" onclick="selOrderPkg(this,'280','基础版')"><div class="ps-tier">基础版</div><div class="ps-price">¥280/h</div><div class="ps-note">单数据源</div></div>
              <div class="ps-item sel" onclick="selOrderPkg(this,'380','专业版')"><div class="ps-tier">专业版 ✓</div><div class="ps-price">¥380/h</div><div class="ps-note">多数据源+预测</div></div>
              <div class="ps-item" onclick="selOrderPkg(this,'580','企业版')"><div class="ps-tier">企业版</div><div class="ps-price">¥580/h</div><div class="ps-note">定制模型</div></div>
            </div>
          </div>
        </div>

        <!-- Requirements -->
        <div class="card" style="margin-bottom:16px">
          <div class="card-head"><div class="card-head-title">需求说明</div></div>
          <div class="card-body">
            <div class="field">
              <label>项目标题</label>
              <input class="input" value="2024年H1电商销售数据分析报告">
            </div>
            <div class="field">
              <label>详细需求描述</label>
              <textarea class="textarea">数据为近半年（2024.01-06）的电商平台销售记录，约50万行，CSV格式。需要输出：月度销售趋势图、品类对比分析、Top50商品排行、客单价分布图。最终交付交互式Dashboard和PDF报告各一份。</textarea>
            </div>
            <div class="two-col">
              <div class="field">
                <label>预期交付时间</label>
                <select class="select">
                  <option>1小时内（加急）</option>
                  <option selected>2-4 小时</option>
                  <option>当天内</option>
                </select>
              </div>
              <div class="field">
                <label>预估工时（小时）</label>
                <input class="input" type="number" value="2" id="orderHours" oninput="updateOrderSum()">
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Order summary -->
      <div>
        <div class="order-sum">
          <div class="osum-head">
            <div class="osum-label">订单摘要</div>
            <div class="osum-name">全自动数据分析报告 · 专业版</div>
          </div>
          <div class="osum-body">
            <div class="osum-row"><span class="osum-k">单价</span><span class="osum-v">¥380 / 小时</span></div>
            <div class="osum-row"><span class="osum-k">预估工时</span><span class="osum-v" id="sumHours">2 小时</span></div>
            <div class="osum-row"><span class="osum-k">小计</span><span class="osum-v" id="sumSub">¥760.00</span></div>
            <div class="osum-row"><span class="osum-k">平台服务费 (10%)</span><span class="osum-v" id="sumFee">¥76.00</span></div>
            <div class="coupon-row">
              <input class="coupon-in" placeholder="优惠券码" id="couponIn">
              <button class="coupon-apply" onclick="toast('优惠券已应用，减免 ¥50','🎫')">使用</button>
            </div>
            <div class="osum-total">
              <span class="osum-total-l">预付总计</span>
              <span class="osum-total-r" id="sumTotal">¥836.00</span>
            </div>
            <div class="info-box-pine" style="font-size:11.5px">✓ 资金托管保障：验收通过后款项释放，争议可申请 AI 仲裁</div>
            <button class="btn btn-pine btn-full btn-lg" onclick="go('pay',qS('[data-view=pay]'))">确认下单 · 去支付 →</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ════════════════════════════════════════════════════
     VIEW 6 — 订单支付
════════════════════════════════════════════════════ -->
<div class="view" id="v-pay">
  <div class="wrap page">
    <button class="back-btn" onclick="go('order',qS('[data-view=order]'))">← 返回修改订单</button>
    <div style="margin-bottom:22px">
      <div class="page-eyebrow">第 6 步 · 订单支付</div>
      <div class="page-title">完成支付</div>
      <div class="page-sub">订单号 ORD-2026-031 · 请在 <strong style="color:var(--ember)">14:58</strong> 内完成支付</div>
    </div>

    <div class="order-layout">
      <div>
        <div class="card" style="margin-bottom:16px">
          <div class="card-head"><div class="card-head-title">选择支付方式</div></div>
          <div class="card-body">
            <div class="pay-methods">
              <div class="pay-m sel" onclick="selPay(this)">
                <div class="pay-m-icon">💰</div>
                <div class="pay-m-name">平台余额</div>
                <div class="pay-m-sub">余额 ¥1,842.50</div>
              </div>
              <div class="pay-m" onclick="selPay(this)">
                <div class="pay-m-icon">💙</div>
                <div class="pay-m-name">支付宝</div>
                <div class="pay-m-sub">扫码 / 账号</div>
              </div>
              <div class="pay-m" onclick="selPay(this)">
                <div class="pay-m-icon">💚</div>
                <div class="pay-m-name">微信支付</div>
                <div class="pay-m-sub">扫码 / 小程序</div>
              </div>
            </div>

            <div class="pay-info-box">
              <span>当前余额 <strong>¥1,842.50</strong>，支付后剩余 <strong>¥1,006.50</strong></span>
              <button class="btn btn-ghost btn-sm" onclick="toast('跳转至充值页','💰')">充值</button>
            </div>

            <div class="pay-breakdown">
              <div class="pb-row"><span class="pb-k">服务费（预估2h × ¥380）</span><span class="pb-v">¥760.00</span></div>
              <div class="pb-row"><span class="pb-k">平台服务费（10%）</span><span class="pb-v">¥76.00</span></div>
              <div class="pb-row"><span class="pb-k">优惠券抵扣</span><span class="pb-v" style="color:var(--pine)">−¥0.00</span></div>
              <div class="pb-div"></div>
              <div class="pb-total"><span>实付金额</span><span class="pb-total-v">¥836.00</span></div>
            </div>

            <button class="pay-confirm-btn" onclick="doPay()">确认支付 ¥836.00</button>
            <div class="security-note">🔒 资金由平台托管 · SSL 加密 · 随时可退款</div>
          </div>
        </div>
      </div>

      <!-- Confirm sidebar -->
      <div>
        <div class="pay-confirm-card">
          <div class="pcc-head">
            <div class="pcc-label">订单确认</div>
            <div class="pcc-svc">
              <div class="pcc-svc-icon">📊</div>
              <div>
                <div class="pcc-svc-name">全自动数据分析报告</div>
                <div class="pcc-svc-sub">专业版 · DataBot Pro</div>
              </div>
            </div>
          </div>
          <div class="pcc-body">
            <div style="display:flex;justify-content:space-between;font-size:12.5px"><span style="color:var(--ink-3)">订单号</span><span style="font-family:var(--mono)">ORD-2026-031</span></div>
            <div style="display:flex;justify-content:space-between;font-size:12.5px"><span style="color:var(--ink-3)">服务者</span><span>DataBot Pro</span></div>
            <div style="display:flex;justify-content:space-between;font-size:12.5px"><span style="color:var(--ink-3)">预估工时</span><span>2 小时</span></div>
            <div style="display:flex;justify-content:space-between;font-size:12.5px"><span style="color:var(--ink-3)">计费方式</span><span>实时计费 / 6秒</span></div>
          </div>
          <div class="pcc-total">
            <div class="pcc-total-l">实付总计</div>
            <div class="pcc-total-r">¥836.00</div>
          </div>
        </div>

        <div class="info-box-amber" style="margin-top:12px;font-size:11.5px">
          ⏱ 支付后服务者将在 <strong>15 分钟内</strong>开始执行，请保持消息畅通
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ════════════════════════════════════════════════════
     VIEW 7 — 订单跟踪
════════════════════════════════════════════════════ -->
<div class="view" id="v-track">
  <div class="wrap page">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:22px">
      <div>
        <div class="page-eyebrow">第 7 步 · 订单详情跟踪</div>
        <div class="page-title">ORD-2026-031</div>
        <div class="page-sub">全自动数据分析报告 · 专业版 · DataBot Pro</div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-ghost" onclick="go('chat',qS('[data-view=chat]'))">💬 联系服务者</button>
        <button class="btn btn-ghost" style="color:var(--rose);border-color:var(--rose)" onclick="toast('仲裁申请已提交','⚖️')">申请仲裁</button>
      </div>
    </div>

    <!-- Status bar -->
    <div class="ord-status-bar">
      <div class="ord-status-badge">● 执行中</div>
      <div class="osb-item">
        <div class="osb-val pine" id="tk-cost">¥0.00</div>
        <div class="osb-label">当前费用</div>
      </div>
      <div class="osb-item">
        <div class="osb-val" id="tk-time">00:00:00</div>
        <div class="osb-label">累计工时</div>
      </div>
      <div class="osb-item">
        <div class="osb-val">¥836.00</div>
        <div class="osb-label">预付金额</div>
      </div>
    </div>

    <div class="tracking-layout">
      <div>
        <!-- Timeline -->
        <div class="card" style="margin-bottom:16px">
          <div class="card-head"><div class="card-head-title">订单进度</div></div>
          <div class="tl">
            <div class="tl-item">
              <div class="tl-left"><div class="tl-dot done">✓</div><div class="tl-line done"></div></div>
              <div class="tl-content">
                <div class="tl-title">订单创建 & 支付成功</div>
                <div class="tl-desc">预付款 ¥836.00 已进入平台托管账户</div>
                <div class="tl-time">2026-03-08 09:34:22</div>
              </div>
            </div>
            <div class="tl-item">
              <div class="tl-left"><div class="tl-dot done">✓</div><div class="tl-line done"></div></div>
              <div class="tl-content">
                <div class="tl-title">服务者接单</div>
                <div class="tl-desc">DataBot Pro 已接受订单，开始准备处理环境</div>
                <div class="tl-time">2026-03-08 09:38:05</div>
              </div>
            </div>
            <div class="tl-item">
              <div class="tl-left"><div class="tl-dot cur">⚙</div><div class="tl-line"></div></div>
              <div class="tl-content">
                <div class="tl-title">服务执行中</div>
                <div class="tl-desc">正在处理您的数据，每 6 秒自动记录工时并扣费。当前进度：数据清洗完成，正在生成可视化图表…</div>
                <div class="tl-time">2026-03-08 09:45:00 · 进行中</div>
              </div>
            </div>
            <div class="tl-item">
              <div class="tl-left"><div class="tl-dot">4</div><div class="tl-line"></div></div>
              <div class="tl-content"><div class="tl-title" style="color:var(--ink-3)">提交交付物</div><div class="tl-desc" style="color:var(--ink-3)">服务者上传完成的报告文件</div></div>
            </div>
            <div class="tl-item">
              <div class="tl-left"><div class="tl-dot">5</div><div class="tl-line"></div></div>
              <div class="tl-content"><div class="tl-title" style="color:var(--ink-3)">客户验收</div><div class="tl-desc" style="color:var(--ink-3)">您确认验收后，款项自动结算</div></div>
            </div>
            <div class="tl-item">
              <div class="tl-left"><div class="tl-dot">6</div></div>
              <div class="tl-content"><div class="tl-title" style="color:var(--ink-3)">双向评价</div><div class="tl-desc" style="color:var(--ink-3)">完成后对服务质量进行评价</div></div>
            </div>
          </div>
        </div>

        <!-- Tasks -->
        <div class="card" style="margin-bottom:16px">
          <div class="card-head">
            <div class="card-head-title">任务拆分列表</div>
            <div class="card-head-mono">AI 自动拆分</div>
          </div>
          <div class="task-row"><div class="task-cb done" onclick="taskToggle(this)">✓</div><div class="task-name done">数据接入与格式解析</div><span class="task-s" style="color:var(--pine)">完成</span></div>
          <div class="task-row"><div class="task-cb done" onclick="taskToggle(this)">✓</div><div class="task-name done">数据清洗与异常检测</div><span class="task-s" style="color:var(--pine)">完成</span></div>
          <div class="task-row"><div class="task-cb" onclick="taskToggle(this)"></div><div class="task-name">月度销售趋势图生成</div><span class="task-s" style="color:var(--ember)">进行中</span></div>
          <div class="task-row"><div class="task-cb" onclick="taskToggle(this)"></div><div class="task-name">品类对比与Top商品分析</div><span class="task-s" style="color:var(--ink-3)">待开始</span></div>
          <div class="task-row"><div class="task-cb" onclick="taskToggle(this)"></div><div class="task-name">交互式 Dashboard 生成与导出</div><span class="task-s" style="color:var(--ink-3)">待开始</span></div>
        </div>

        <!-- Delivery -->
        <div class="card">
          <div class="card-head"><div class="card-head-title">交付物验收</div></div>
          <div class="card-body">
            <div class="upload-z" onclick="toast('服务完成后，服务者将在此上传交付文件','📁')">
              <div class="upload-icon">📁</div>
              <div class="upload-text">等待服务者上传交付物</div>
              <div class="upload-sub">服务完成后自动显示下载链接</div>
            </div>
            <div class="verdict-pair">
              <button class="btn-accept" onclick="toast('验收成功！款项已结算，请对服务进行评价','🎉')">✓ 确认验收</button>
              <button class="btn-request" onclick="toast('修改意见已提交，等待服务者处理','✏️')">提出修改</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right sidebar -->
      <div style="display:flex;flex-direction:column;gap:14px;position:sticky;top:70px">

        <!-- Live billing -->
        <div class="billing-widget">
          <div class="bw">
            <div class="bw-eyebrow">实时扣费 · 每 6 秒计费一次</div>
            <div class="bw-amount"><em>¥</em><span id="bw-c">0.00</span></div>
            <div class="bw-rate">¥380/h · ¥0.633/分钟</div>
            <div class="bw-grid">
              <div class="bw-cell"><div class="bwc-l">工时</div><div class="bwc-v" id="bw-t">00:00:00</div></div>
              <div class="bw-cell"><div class="bwc-l">余额</div><div class="bwc-v" id="bw-b">¥1,006</div></div>
            </div>
            <div class="bw-bar"><div class="bw-bar-fill"></div></div>
          </div>
        </div>

        <!-- Seller info -->
        <div class="card">
          <div class="card-head"><div class="card-head-title">服务者信息</div></div>
          <div class="card-body">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
              <div class="av" style="background:#1B5E52;width:38px;height:38px;border-radius:8px;font-size:14px">DB</div>
              <div style="flex:1">
                <div style="font-size:13.5px;font-weight:600">DataBot Pro</div>
                <div style="font-family:var(--mono);font-size:9px;color:var(--ink-3)">认证机器人 · 平均响应 8min</div>
              </div>
              <div class="online-dot"></div>
            </div>
            <div style="display:flex;flex-direction:column;gap:7px;margin-bottom:12px">
              <div style="display:flex;justify-content:space-between;font-size:12px"><span style="color:var(--ink-3)">历史订单</span><span>1,240 个</span></div>
              <div style="display:flex;justify-content:space-between;font-size:12px"><span style="color:var(--ink-3)">综合评分</span><span>⭐ 4.9</span></div>
              <div style="display:flex;justify-content:space-between;font-size:12px"><span style="color:var(--ink-3)">验收通过率</span><span style="color:var(--pine)">99.2%</span></div>
            </div>
            <button class="btn btn-pine btn-full btn-sm" onclick="go('chat',qS('[data-view=chat]'))">💬 发消息</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ════════════════════════════════════════════════════
     VIEW 8 — 我的收藏 (F03-06)
════════════════════════════════════════════════════ -->
<div class="view" id="v-favs">
  <div class="wrap page">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:22px">
      <div>
        <div class="page-eyebrow">F03-06 · 服务收藏</div>
        <div class="page-title">我的收藏</div>
        <div class="page-sub">收藏感兴趣的服务，随时快速下单</div>
      </div>
      <button class="btn btn-ghost" onclick="go('browse',qS('[data-view=browse]'))">浏览更多服务</button>
    </div>
    <div class="cards-grid" id="favsGrid"></div>
  </div>
</div>

<!-- ════════════════ JS ════════════════ -->
<script>
/* ─── DATA ─── */
const SERVICES=[
  {id:1,icon:'📊',name:'全自动数据分析与可视化报告',desc:'上传数据即可获得专业可视化报告，支持 Excel/CSV/数据库，平均 8 分钟完成。',tags:['pine','ember'],tagLabels:['机器人服务','平台认证'],price:'280',rate:'4.9',cnt:312,seller:'DataBot Pro',sbg:'#1B5E52',si:'DB',cert:'认证机器人',hot:true,fav:true},
  {id:2,icon:'✍️',name:'SEO 内容创作 + AI 优化',desc:'结合 AI 工具提供高转化率文章，含关键词分析与排名追踪，月更新计划可定制。',tags:['cobalt','gold'],tagLabels:['混合服务','平台认证'],price:'150',rate:'4.8',cnt:156,seller:'李文昊',sbg:'#7C3AED',si:'李',cert:'认证自由职业者',hot:false,fav:false},
  {id:3,icon:'⚙️',name:'全栈 Web 应用自动开发',desc:'描述需求即生成完整前后端代码，支持 React/Vue，自动部署含测试文档。',tags:['pine','ink'],tagLabels:['机器人服务','P0'],price:'320',rate:'4.6',cnt:89,seller:'CodeWeaver Bot',sbg:'#059669',si:'CW',cert:'认证机器人',hot:true,fav:false},
  {id:4,icon:'🎨',name:'UI/UX 设计 + Figma 原型',desc:'从用户调研到高保真原型，含组件库与开发规范，支持快速迭代。',tags:['cobalt','gold'],tagLabels:['混合服务','平台认证'],price:'200',rate:'5.0',cnt:201,seller:'陈晓宇',sbg:'#DB2777',si:'陈',cert:'认证自由职业者',hot:false,fav:true},
  {id:5,icon:'🤖',name:'7×24 智能客服机器人部署',desc:'RAG 知识库问答，支持微信/网页/APP 多渠道，自动升级人工。',tags:['pine','gold'],tagLabels:['机器人服务','平台认证'],price:'180',rate:'4.9',cnt:445,seller:'ServiceAI Bot',sbg:'#0891B2',si:'SA',cert:'认证机器人',hot:true,fav:false},
  {id:6,icon:'🎬',name:'AI 辅助短视频脚本与剪辑',desc:'AI 生成脚本，专业后期制作，含字幕配乐，适配抖音/小红书风格。',tags:['cobalt','ember'],tagLabels:['混合服务','AI增强'],price:'240',rate:'4.7',cnt:112,seller:'王子轩',sbg:'#DC2626',si:'王',cert:'认证自由职业者',hot:false,fav:false},
];
const NEW_SERVICES=[
  {id:7,icon:'📧',name:'AI 邮件营销自动化',desc:'智能生成个性化邮件，A/B测试，自动跟进，提升开信率与转化率。',tags:['pine','ink'],tagLabels:['机器人服务','新上架'],price:'160',rate:'4.5',cnt:23,seller:'MailBot Pro',sbg:'#6D28D9',si:'MB',cert:'认证机器人',hot:false,fav:false,isNew:true},
  {id:8,icon:'🔍',name:'竞品情报自动监控系统',desc:'实时追踪竞品价格、产品更新、社媒动态，每日生成情报报告。',tags:['ember','gold'],tagLabels:['机器人服务','平台认证'],price:'120',rate:'4.6',cnt:18,seller:'IntelBot',sbg:'#B45309',si:'IB',cert:'认证机器人',hot:false,fav:false,isNew:true},
];

/* ─── RENDER CARD ─── */
function renderCard(s,isNew=false){
  const tagsH=s.tags.map((t,i)=>`<span class="tag tag-${t}">${s.tagLabels[i]}</span>`).join('');
  return `<div class="sc" onclick="go('detail',qS('[data-view=detail]'))">
    <div class="sc-thumb" style="background:linear-gradient(135deg,#F4F1EA,#EAE6DC)">
      ${isNew?'<span class="sc-badge sc-badge-new">NEW</span>':s.hot?'<span class="sc-badge sc-badge-hot">HOT</span>':''}
      ${s.icon}
    </div>
    <div class="sc-body">
      <div class="sc-tags">${tagsH}</div>
      <div class="sc-name">${s.name}</div>
      <div class="sc-desc">${s.desc}</div>
      <div class="sc-meta">
        <div class="sc-rating"><span class="sc-stars">★</span>${s.rate} (${s.cnt})</div>
        <div><div class="sc-price-num">¥${s.price}</div><div class="sc-price-unit">/小时</div></div>
      </div>
    </div>
    <div class="sc-footer">
      <div class="sc-seller">
        <div class="av" style="background:${s.sbg}">${s.si}</div>
        <div><div class="sc-seller-name">${s.seller}</div><div class="sc-seller-cert">✓ ${s.cert}</div></div>
      </div>
      <button class="fav-btn ${s.fav?'on':''}" onclick="event.stopPropagation();toggleFavCard(this,${s.id})">${s.fav?'♥':'♡'}</button>
    </div>
  </div>`;
}

qS('#hotGrid').innerHTML=SERVICES.map(s=>renderCard(s)).join('');
qS('#newGrid').innerHTML=NEW_SERVICES.map(s=>renderCard(s,true)).join('');

/* ─── REVIEWS ─── */
[
  {n:'张晓明',r:'★★★★★',t:'速度极快，50万行数据只用了 28 分钟，图表质量超出预期，直接用于董事会汇报了。',d:'03-07'},
  {n:'李雯',r:'★★★★★',t:'第二次使用，每次都非常准时，交互式 Dashboard 客户很满意，极大提升汇报效率。',d:'03-05'},
  {n:'王博',r:'★★★★☆',t:'整体很好，清洗做得细，品类分析颜色稍微调整了一下，服务者响应很快解决了。',d:'02-28'},
].forEach(r=>{
  qS('#revList').innerHTML+=`<div class="rev"><div class="rev-head"><div class="rev-author"><div class="av" style="background:#1A3F9E;width:22px;height:22px">${r.n[0]}</div>${r.n} <span style="color:#F59E0B">${r.r}</span></div><div class="rev-date">${r.d}</div></div><div class="rev-text">${r.t}</div></div>`;
});

/* ─── FAV PREVIEW ─── */
function buildFavPreview(){
  const favs=SERVICES.filter(s=>s.fav);
  qS('#favPreview').innerHTML=favs.length?favs.map(s=>`
    <div style="display:flex;align-items:center;gap:10px;padding:9px 12px;border:1px solid var(--rule);border-radius:var(--r-sm)">
      <div style="font-size:20px">${s.icon}</div>
      <div style="flex:1"><div style="font-size:12.5px;font-weight:600">${s.name}</div><div style="font-family:var(--mono);font-size:9px;color:var(--ink-3)">¥${s.price}/h · ${s.seller}</div></div>
      <button class="fav-btn on" onclick="toggleFavCard(this,${s.id});buildFavPreview()">♥</button>
    </div>`).join(''):'<div style="font-size:12.5px;color:var(--ink-3);text-align:center;padding:12px">暂无收藏，浏览服务后点击 ♡ 收藏</div>';
}
buildFavPreview();

/* ─── FAVS VIEW ─── */
function buildFavsView(){
  const favs=SERVICES.filter(s=>s.fav);
  qS('#favsGrid').innerHTML=favs.length?favs.map(s=>renderCard(s)).join(''):
    `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">🔖</div><div class="empty-t">暂无收藏服务</div><div class="empty-s">浏览服务市场，点击 ♡ 收藏感兴趣的服务</div></div>`;
}

/* ─── NAV ─── */
const VIEW_ORDER=['browse','detail','share','chat','order','pay','track','favs'];
function go(id,btn){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  qS('#v-'+id).classList.add('active');
  const idx=VIEW_ORDER.indexOf(id);
  document.querySelectorAll('.sn-item').forEach(b=>{
    const bi=VIEW_ORDER.indexOf(b.dataset.view);
    b.classList.remove('active','done');
    if(b.dataset.view===id) b.classList.add('active');
    else if(bi<idx) b.classList.add('done');
  });
  window.scrollTo({top:0,behavior:'smooth'});
  if(id==='favs') buildFavsView();
}
function qS(s){return document.querySelector(s)}

/* ─── FILTERS ─── */
function fchip(el){el.classList.toggle('on');toast('筛选已更新','🔍')}
function rbtn(el){document.querySelectorAll('.r-btn').forEach(b=>b.classList.remove('on'));el.classList.add('on')}
function spill(el){document.querySelectorAll('.s-pill').forEach(b=>b.classList.remove('on'));el.classList.add('on');toast('已按「'+el.textContent+'」排序','🔄')}

/* ─── FAV ─── */
function toggleFavCard(btn,id){
  const s=SERVICES.find(x=>x.id===id);if(!s)return;
  s.fav=!s.fav;
  btn.textContent=s.fav?'♥':'♡';btn.classList.toggle('on',s.fav);
  toast(s.fav?'已加入收藏':'已取消收藏',s.fav?'❤️':'🤍');
  buildFavPreview();
}
function toggleFavThis(btn){
  const on=btn.textContent.includes('♥');
  btn.textContent=on?'♡ 收藏此服务':'♥ 已收藏';
  btn.style.color=on?'':'var(--rose)';
  toast(on?'已取消收藏':'已加入收藏',on?'🤍':'❤️');
  if(!on){SERVICES[0].fav=true;buildFavPreview()}
}

/* ─── PKG SELECT ─── */
function selPkg(el){document.querySelectorAll('.pkg').forEach(p=>p.classList.remove('sel'));el.classList.add('sel')}
function selOrderPkg(el,price,name){
  document.querySelectorAll('.ps-item').forEach(p=>{p.classList.remove('sel');p.querySelector('.ps-tier').textContent=p.querySelector('.ps-tier').textContent.replace(' ✓','')});
  el.classList.add('sel');el.querySelector('.ps-tier').textContent=name+' ✓';
  toast('已选「'+name+'」套餐 ¥'+price+'/h','📦');updateOrderSum();
}
function selPay(el){document.querySelectorAll('.pay-m').forEach(p=>p.classList.remove('sel'));el.classList.add('sel')}

/* ─── ORDER SUM ─── */
function updateOrderSum(){
  const h=parseFloat(qS('#orderHours')?.value||2)||2;
  const sub=380*h;const fee=sub*.1;const total=sub+fee;
  if(qS('#sumHours'))qS('#sumHours').textContent=h+' 小时';
  if(qS('#sumSub'))qS('#sumSub').textContent='¥'+sub.toFixed(2);
  if(qS('#sumFee'))qS('#sumFee').textContent='¥'+fee.toFixed(2);
  if(qS('#sumTotal'))qS('#sumTotal').textContent='¥'+total.toFixed(2);
}

/* ─── PAY ─── */
function doPay(){toast('支付成功！跳转至订单跟踪…','🎉');setTimeout(()=>go('track',qS('[data-view=track]')),900)}

/* ─── CHAT ─── */
function sendMsg(){
  const ta=qS('#chatTa');const txt=ta.value.trim();if(!txt)return;
  const msgs=qS('#chatMsgs');
  msgs.innerHTML+=`<div class="msg mine"><div class="msg-av" style="background:#1A3F9E">我</div><div><div class="msg-bbl">${txt}</div><div class="msg-t">刚刚</div></div></div>`;
  ta.value='';ta.style.height='38px';msgs.scrollTop=msgs.scrollHeight;
  qS('#svcPopup').classList.remove('open');
  setTimeout(()=>{msgs.innerHTML+=`<div class="msg theirs"><div class="msg-av" style="background:#1B5E52">DB</div><div><div class="msg-bbl">收到！如需进一步了解或直接下单，点击右上角「下单」按钮即可。</div><div class="msg-t">刚刚</div></div></div>`;msgs.scrollTop=msgs.scrollHeight},800);
}
qS('#chatTa').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMsg()}});
qS('#chatTa').addEventListener('input',function(){this.style.height='38px';this.style.height=Math.min(this.scrollHeight,110)+'px'});
function toggleSvcMenu(){qS('#svcPopup').classList.toggle('open')}
function insertSvc(n,p){qS('#chatTa').value=`我想了解「${n}」套餐（${p}），请问可以开始吗？`;qS('#svcPopup').classList.remove('open');qS('#chatTa').focus()}

/* ─── TASK TOGGLE ─── */
function taskToggle(el){el.classList.toggle('done');el.textContent=el.classList.contains('done')?'✓':'';el.nextElementSibling.classList.toggle('done',el.classList.contains('done'));toast('任务状态已更新','✓')}

/* ─── BILLING TICKER ─── */
let ts=0,cost=0,bal=1006;const RATE=380/3600;
setInterval(()=>{
  ts++;cost+=RATE;bal=Math.max(0,bal-RATE);
  const hh=String(Math.floor(ts/3600)).padStart(2,'0');
  const mm=String(Math.floor((ts%3600)/60)).padStart(2,'0');
  const ss=String(ts%60).padStart(2,'0');
  const t=`${hh}:${mm}:${ss}`;const c=cost.toFixed(2);
  [qS('#tk-cost'),qS('#bw-c')].forEach(el=>{if(el)el.textContent=c});
  [qS('#tk-time'),qS('#bw-t')].forEach(el=>{if(el)el.textContent=t});
  if(qS('#bw-b'))qS('#bw-b').textContent='¥'+Math.floor(bal).toLocaleString();
},1000);

/* ─── MODAL ─── */
function openModal(id){qS('#'+id).classList.add('open')}
function closeModal(id){qS('#'+id).classList.remove('open')}
document.querySelectorAll('.modal-bg').forEach(bg=>bg.addEventListener('click',e=>{if(e.target===bg)bg.classList.remove('open')}));

/* ─── TOAST ─── */
let toastTimer;
function toast(msg,icon='✓'){
  clearTimeout(toastTimer);
  qS('#toast-msg').textContent=msg;qS('#toast-icon').textContent=icon;
  qS('#toast').classList.add('show');
  toastTimer=setTimeout(()=>qS('#toast').classList.remove('show'),2800);
}
</script>
</body>
</html>