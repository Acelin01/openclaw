<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>计费结算 · M08 · 机器人技能共享平台</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;700&family=Noto+Sans+SC:wght@300;400;500;700&family=Playfair+Display:ital,wght@0,700;1,400&display=swap" rel="stylesheet">
<style>
/* ── RESET ── */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}

/* ── THEME ── */
:root{
  --bg:       #f7f5f0;
  --bg2:      #eeeae2;
  --panel:    #ffffff;
  --ink:      #1a1814;
  --ink2:     #3d3a35;
  --muted:    #8a857a;
  --border:   #e0dbd0;
  --border2:  #ccc8be;
  --green:    #0d7c4b;
  --green-bg: #e8f5ee;
  --red:      #c0392b;
  --red-bg:   #fdf0ef;
  --amber:    #b45309;
  --amber-bg: #fef3c7;
  --blue:     #1e4fbb;
  --blue-bg:  #eff4ff;
  --gold:     #92710a;
  --gold-bg:  #fdf6dc;
  --r:        6px;
  --shadow:   0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.05);
  --shadow-lg:0 8px 32px rgba(0,0,0,.1);
  --mono: 'IBM Plex Mono', monospace;
  --sans: 'Noto Sans SC', sans-serif;
  --serif: 'Playfair Display', serif;
}

body{
  font-family:var(--sans);
  background:var(--bg);
  color:var(--ink);
  min-height:100vh;
  line-height:1.5;
}

::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:var(--bg2)}
::-webkit-scrollbar-thumb{background:var(--border2);border-radius:3px}

/* ── LAYOUT ── */
.app{display:grid;grid-template-columns:240px 1fr;min-height:100vh}

/* ── SIDEBAR ── */
.sidebar{
  background:var(--ink);
  padding:0;
  display:flex;flex-direction:column;
  position:sticky;top:0;height:100vh;overflow-y:auto;
}
.sidebar-logo{
  padding:24px 20px;
  border-bottom:1px solid rgba(255,255,255,.07);
}
.logo-mark{
  font-family:var(--mono);font-size:11px;
  color:rgba(255,255,255,.4);letter-spacing:.1em;
  margin-bottom:6px;
}
.logo-name{
  font-family:var(--mono);font-size:13px;
  color:#fff;font-weight:500;
}
.sidebar-section{
  padding:20px 0 8px;
}
.sidebar-label{
  font-family:var(--mono);font-size:9px;letter-spacing:.16em;
  text-transform:uppercase;color:rgba(255,255,255,.25);
  padding:0 20px 8px;
}
.nav-item{
  display:flex;align-items:center;gap:10px;
  padding:10px 20px;cursor:pointer;
  font-size:13px;color:rgba(255,255,255,.45);
  transition:all .15s;border-left:2px solid transparent;
  text-decoration:none;
}
.nav-item:hover{color:rgba(255,255,255,.8);background:rgba(255,255,255,.04)}
.nav-item.active{
  color:#fff;border-left-color:#c8960c;
  background:rgba(200,150,12,.08);
}
.nav-item .nav-icon{width:16px;text-align:center;font-size:14px;flex-shrink:0}
.nav-item .badge{
  margin-left:auto;font-family:var(--mono);font-size:9px;
  background:rgba(200,150,12,.2);color:#c8960c;
  padding:1px 7px;border-radius:3px;
}
.sidebar-divider{height:1px;background:rgba(255,255,255,.06);margin:8px 20px}

.user-card{
  margin-top:auto;padding:16px 20px;
  border-top:1px solid rgba(255,255,255,.07);
}
.user-avatar{
  width:32px;height:32px;border-radius:6px;
  background:linear-gradient(135deg,#1e4fbb,#0d7c4b);
  display:flex;align-items:center;justify-content:center;
  font-size:13px;font-weight:700;color:#fff;
  font-family:var(--mono);margin-bottom:10px;
}
.user-name{font-size:12px;color:#fff;font-weight:500;margin-bottom:2px}
.user-role{font-family:var(--mono);font-size:9px;color:rgba(255,255,255,.3);letter-spacing:.06em}

/* ── MAIN ── */
.main{display:flex;flex-direction:column;overflow:hidden}

/* ── TOPBAR ── */
.topbar{
  background:var(--panel);
  border-bottom:1px solid var(--border);
  padding:0 32px;height:56px;
  display:flex;align-items:center;justify-content:space-between;
  position:sticky;top:0;z-index:50;
}
.topbar-left{display:flex;align-items:center;gap:12px}
.breadcrumb{
  font-family:var(--mono);font-size:11px;color:var(--muted);
  display:flex;align-items:center;gap:6px;
}
.breadcrumb .sep{color:var(--border2)}
.breadcrumb .current{color:var(--ink)}
.topbar-right{display:flex;align-items:center;gap:12px}
.tb-btn{
  display:flex;align-items:center;gap:6px;
  padding:7px 16px;border-radius:var(--r);
  font-size:12px;font-family:var(--sans);cursor:pointer;
  transition:all .15s;
}
.tb-btn-outline{
  background:transparent;border:1px solid var(--border2);
  color:var(--ink2);
}
.tb-btn-outline:hover{border-color:var(--ink);color:var(--ink)}
.tb-btn-primary{
  background:var(--ink);border:1px solid var(--ink);color:#fff;
}
.tb-btn-primary:hover{background:var(--ink2)}
.live-tag{
  display:flex;align-items:center;gap:5px;
  font-family:var(--mono);font-size:10px;color:var(--green);
  background:var(--green-bg);padding:4px 10px;border-radius:3px;
  border:1px solid rgba(13,124,75,.15);
}
.live-dot{width:6px;height:6px;background:var(--green);border-radius:50%;animation:pulse 1.5s infinite}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.4)}}

/* ── PAGE CONTENT ── */
.page{padding:32px;display:flex;flex-direction:column;gap:28px}

/* ── SECTION HEADER ── */
.sec-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:20px}
.sec-title{
  font-family:var(--serif);font-size:20px;font-style:italic;
  color:var(--ink);margin-bottom:2px;
}
.sec-sub{font-family:var(--mono);font-size:10px;color:var(--muted);letter-spacing:.06em}
.sec-actions{display:flex;gap:8px;align-items:center}

/* ── KPI STRIP ── */
.kpi-strip{
  display:grid;grid-template-columns:repeat(5,1fr);gap:1px;
  background:var(--border);border:1px solid var(--border);
  border-radius:var(--r);overflow:hidden;
}
.kpi{
  background:var(--panel);padding:20px 22px;
  position:relative;overflow:hidden;
  transition:background .2s;
}
.kpi:hover{background:#faf9f6}
.kpi::before{
  content:'';position:absolute;top:0;left:0;right:0;height:2px;
  background:var(--accent,var(--border));
}
.kpi-label{font-family:var(--mono);font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:8px}
.kpi-val{font-family:var(--mono);font-size:22px;font-weight:700;color:var(--ink);line-height:1;margin-bottom:4px}
.kpi-val em{font-style:normal;font-size:13px;color:var(--muted);font-weight:400}
.kpi-delta{font-family:var(--mono);font-size:10px;display:flex;align-items:center;gap:4px}
.delta-up{color:var(--green)}.delta-dn{color:var(--red)}

/* ── MAIN GRID ── */
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px}
.col-span-2{grid-column:span 2}

/* ── CARD ── */
.card{
  background:var(--panel);border:1px solid var(--border);
  border-radius:var(--r);overflow:hidden;
}
.card-head{
  padding:16px 20px;border-bottom:1px solid var(--border);
  display:flex;align-items:center;justify-content:space-between;
}
.card-title{font-size:13px;font-weight:600;color:var(--ink)}
.card-title-mono{font-family:var(--mono);font-size:11px;color:var(--ink);letter-spacing:.04em}
.card-body{padding:20px}
.card-meta{font-family:var(--mono);font-size:9px;color:var(--muted);letter-spacing:.06em}

/* ── BALANCE CARD (F08-01) ── */
.balance-display{
  display:flex;align-items:flex-end;gap:0;margin-bottom:20px;
}
.balance-currency{
  font-family:var(--serif);font-size:28px;font-weight:700;
  color:var(--muted);margin-bottom:4px;margin-right:4px;
}
.balance-amount{
  font-family:var(--mono);font-size:52px;font-weight:700;
  color:var(--ink);line-height:1;letter-spacing:-.02em;
}
.balance-cents{font-size:28px;color:var(--ink2)}
.balance-progress{margin-bottom:16px}
.progress-label{
  display:flex;justify-content:space-between;
  font-family:var(--mono);font-size:9px;color:var(--muted);margin-bottom:6px;
}
.progress-track{height:6px;background:var(--bg2);border-radius:3px;overflow:hidden}
.progress-fill{
  height:100%;border-radius:3px;
  background:linear-gradient(90deg,var(--green),#22c55e);
  transition:width .8s cubic-bezier(.34,1.56,.64,1);
  position:relative;overflow:hidden;
}
.progress-fill::after{
  content:'';position:absolute;inset:0;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.4),transparent);
  animation:shim 2s infinite;
}
@keyframes shim{from{transform:translateX(-100%)}to{transform:translateX(100%)}}

.recharge-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px}
.recharge-btn{
  padding:10px 8px;text-align:center;border-radius:var(--r);
  border:1.5px solid var(--border);background:transparent;cursor:pointer;
  transition:all .15s;font-family:var(--mono);
}
.recharge-btn:hover{border-color:var(--ink);background:var(--bg)}
.recharge-btn.selected{border-color:var(--ink);background:var(--ink);color:#fff}
.recharge-amount{font-size:15px;font-weight:700;margin-bottom:2px}
.recharge-label{font-size:9px;color:var(--muted)}
.recharge-btn.selected .recharge-label{color:rgba(255,255,255,.5)}
.recharge-methods{display:flex;gap:8px;margin-bottom:16px}
.method-btn{
  flex:1;display:flex;align-items:center;justify-content:center;gap:6px;
  padding:10px;border-radius:var(--r);border:1px solid var(--border);
  background:transparent;cursor:pointer;transition:all .15s;
  font-size:12px;font-family:var(--sans);color:var(--ink2);
}
.method-btn:hover{border-color:var(--blue);color:var(--blue)}
.method-btn.active{border-color:var(--blue);background:var(--blue-bg);color:var(--blue)}
.method-icon{font-size:16px}
.recharge-submit{
  width:100%;padding:12px;background:var(--ink);color:#fff;border:none;
  border-radius:var(--r);font-size:13px;font-family:var(--sans);
  cursor:pointer;transition:background .15s;font-weight:500;
}
.recharge-submit:hover{background:var(--ink2)}

/* ── AUTO RECHARGE (F08-02) ── */
.auto-toggle-row{
  display:flex;align-items:center;justify-content:space-between;
  padding:14px 16px;background:var(--bg);
  border-radius:var(--r);border:1px solid var(--border);
  margin-bottom:12px;
}
.auto-toggle-text h4{font-size:13px;font-weight:600;margin-bottom:2px}
.auto-toggle-text p{font-size:11px;color:var(--muted)}
.toggle{
  position:relative;width:40px;height:22px;cursor:pointer;flex-shrink:0;
}
.toggle input{opacity:0;width:0;height:0}
.toggle-slider{
  position:absolute;inset:0;background:var(--border2);border-radius:11px;
  transition:.3s;
}
.toggle-slider::before{
  content:'';position:absolute;width:16px;height:16px;
  left:3px;top:3px;background:#fff;border-radius:50%;
  transition:.3s;box-shadow:0 1px 3px rgba(0,0,0,.2);
}
.toggle input:checked+.toggle-slider{background:var(--green)}
.toggle input:checked+.toggle-slider::before{transform:translateX(18px)}
.auto-settings{
  background:var(--green-bg);border:1px solid rgba(13,124,75,.15);
  border-radius:var(--r);padding:14px 16px;
  display:none;
}
.auto-settings.show{display:block}
.auto-settings p{font-size:12px;color:var(--green);margin-bottom:10px}
.auto-input-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.form-group label{
  display:block;font-family:var(--mono);font-size:9px;letter-spacing:.1em;
  text-transform:uppercase;color:var(--muted);margin-bottom:5px;
}
.form-input{
  width:100%;padding:8px 12px;border:1px solid var(--border2);
  border-radius:var(--r);font-family:var(--mono);font-size:13px;
  color:var(--ink);background:var(--panel);outline:none;transition:border-color .15s;
}
.form-input:focus{border-color:var(--ink)}

/* ── BILLING TICKER (F08-03) ── */
.ticker-section{
  background:var(--ink);border-radius:var(--r);
  padding:24px;color:#fff;position:relative;overflow:hidden;
}
.ticker-section::before{
  content:'';position:absolute;inset:0;
  background:
    radial-gradient(ellipse at 80% 0%, rgba(13,124,75,.15) 0%, transparent 50%),
    radial-gradient(ellipse at 0% 100%, rgba(30,79,187,.12) 0%, transparent 50%);
}
.ticker-section>*{position:relative;z-index:1}
.ticker-top{
  display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;
}
.ticker-label{font-family:var(--mono);font-size:9px;letter-spacing:.14em;color:rgba(255,255,255,.35)}
.ticker-status{
  display:flex;align-items:center;gap:6px;
  font-family:var(--mono);font-size:10px;color:#4ade80;
}
.ticker-amount{
  font-family:var(--mono);font-size:48px;font-weight:700;
  color:#fff;letter-spacing:-.02em;line-height:1;margin-bottom:8px;
}
.ticker-amount em{font-style:normal;font-size:24px;color:rgba(255,255,255,.4);margin-right:2px}
.ticker-rate{
  font-family:var(--mono);font-size:11px;color:rgba(255,255,255,.4);
  margin-bottom:20px;
}
.ticker-grid{
  display:grid;grid-template-columns:repeat(3,1fr);gap:12px;
}
.ticker-stat{
  background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);
  border-radius:5px;padding:10px 12px;
}
.ts-label{font-family:var(--mono);font-size:9px;color:rgba(255,255,255,.3);letter-spacing:.08em;margin-bottom:4px}
.ts-val{font-family:var(--mono);font-size:14px;font-weight:600;color:#fff}
.ts-val.green{color:#4ade80}
.ts-val.amber{color:#fbbf24}
.countdown-bar{height:3px;background:rgba(255,255,255,.1);border-radius:2px;margin-top:16px;overflow:hidden}
.countdown-fill{height:100%;background:linear-gradient(90deg,#22c55e,#4ade80);border-radius:2px;animation:countdown 6s linear infinite}
@keyframes countdown{from{width:100%}to{width:0%}}

/* ── RECORDS TABLE (F08-04) ── */
.table-wrap{overflow-x:auto}
table{width:100%;border-collapse:collapse;font-size:12px}
th{
  font-family:var(--mono);font-size:9px;letter-spacing:.1em;
  text-transform:uppercase;color:var(--muted);
  padding:10px 14px;border-bottom:1px solid var(--border);
  text-align:left;white-space:nowrap;background:var(--bg);
}
td{
  padding:12px 14px;border-bottom:1px solid var(--border);
  color:var(--ink2);vertical-align:middle;
}
tr:last-child td{border-bottom:none}
tr:hover td{background:#faf9f6}
.td-mono{font-family:var(--mono);font-size:11px}
.td-amount-neg{font-family:var(--mono);font-size:13px;font-weight:600;color:var(--red)}
.td-amount-pos{font-family:var(--mono);font-size:13px;font-weight:600;color:var(--green)}
.pill{
  display:inline-flex;align-items:center;gap:4px;
  padding:2px 9px;border-radius:3px;font-family:var(--mono);
  font-size:9px;letter-spacing:.04em;
}
.pill-green{background:var(--green-bg);color:var(--green)}
.pill-amber{background:var(--amber-bg);color:var(--amber)}
.pill-blue{background:var(--blue-bg);color:var(--blue)}
.pill-red{background:var(--red-bg);color:var(--red)}
.pill-gray{background:var(--bg2);color:var(--muted)}
.table-footer{
  padding:12px 20px;border-top:1px solid var(--border);
  display:flex;align-items:center;justify-content:space-between;
  background:var(--bg);
}
.tf-info{font-family:var(--mono);font-size:10px;color:var(--muted)}
.pagination{display:flex;gap:4px}
.pg-btn{
  width:28px;height:28px;border-radius:4px;
  border:1px solid var(--border);background:transparent;
  font-family:var(--mono);font-size:11px;color:var(--ink);
  cursor:pointer;display:flex;align-items:center;justify-content:center;
  transition:all .15s;
}
.pg-btn:hover{border-color:var(--ink)}
.pg-btn.active{background:var(--ink);color:#fff;border-color:var(--ink)}

/* ── BILL SUMMARY (F08-05) ── */
.bill-period{
  display:flex;align-items:center;gap:8px;margin-bottom:20px;
}
.period-btn{
  padding:6px 14px;border-radius:4px;border:1px solid var(--border);
  background:transparent;font-family:var(--mono);font-size:10px;
  color:var(--muted);cursor:pointer;transition:all .15s;
}
.period-btn:hover{border-color:var(--ink2);color:var(--ink)}
.period-btn.active{background:var(--ink);color:#fff;border-color:var(--ink)}
.bill-overview{
  display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;
}
.bill-block{
  background:var(--bg);border-radius:5px;padding:16px;
}
.bb-label{font-family:var(--mono);font-size:9px;letter-spacing:.1em;color:var(--muted);margin-bottom:6px}
.bb-val{font-family:var(--mono);font-size:20px;font-weight:700;margin-bottom:4px}
.bb-val.inc{color:var(--green)}.bb-val.exp{color:var(--red)}
.bb-sub{font-size:11px;color:var(--muted)}
.chart-bar-wrap{display:flex;flex-direction:column;gap:6px}
.chart-row{display:flex;align-items:center;gap:10px}
.chart-label{font-family:var(--mono);font-size:9px;color:var(--muted);width:60px;flex-shrink:0;text-align:right}
.chart-track{flex:1;height:20px;background:var(--bg2);border-radius:3px;overflow:hidden;position:relative}
.chart-fill{height:100%;border-radius:3px;display:flex;align-items:center;padding-left:8px;
  font-family:var(--mono);font-size:9px;font-weight:600;color:#fff;white-space:nowrap;
  transition:width 1.2s cubic-bezier(.34,1.56,.64,1);}
.chart-fill.inc{background:linear-gradient(90deg,var(--green),#22c55e)}
.chart-fill.exp{background:linear-gradient(90deg,var(--red),#f87171)}

/* ── EARNINGS (F08-06 F08-07) ── */
.earnings-header{
  display:flex;align-items:center;gap:16px;padding:20px;
  border-bottom:1px solid var(--border);
  background:linear-gradient(135deg,var(--green-bg),var(--panel));
}
.eh-icon{
  width:48px;height:48px;border-radius:10px;
  background:var(--green);display:flex;align-items:center;
  justify-content:center;font-size:22px;flex-shrink:0;
}
.eh-val{font-family:var(--mono);font-size:28px;font-weight:700;color:var(--green);line-height:1}
.eh-label{font-family:var(--mono);font-size:9px;color:var(--muted);letter-spacing:.08em;margin-top:3px}
.earnings-breakdown{padding:20px;display:flex;flex-direction:column;gap:10px}
.eb-row{
  display:flex;align-items:center;justify-content:space-between;
  padding:10px 12px;border-radius:4px;background:var(--bg);
}
.eb-label{font-size:12px;color:var(--ink2);display:flex;align-items:center;gap:8px}
.eb-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.eb-val{font-family:var(--mono);font-size:13px;font-weight:600}
.eb-pct{font-family:var(--mono);font-size:10px;color:var(--muted);margin-left:8px}
.donut-wrap{display:flex;align-items:center;justify-content:center;padding:16px 20px 20px}
.donut{position:relative;width:110px;height:110px}
.donut svg{width:110px;height:110px;transform:rotate(-90deg)}
.donut-label{
  position:absolute;inset:0;display:flex;flex-direction:column;
  align-items:center;justify-content:center;text-align:center;
}
.donut-pct{font-family:var(--mono);font-size:18px;font-weight:700;color:var(--ink);line-height:1}
.donut-sub{font-family:var(--mono);font-size:8px;color:var(--muted);margin-top:2px}

/* ── WITHDRAWAL (F08-08 F08-09) ── */
.withdraw-form{padding:20px;display:flex;flex-direction:column;gap:14px}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.bank-select{
  width:100%;padding:10px 12px;border:1px solid var(--border2);
  border-radius:var(--r);font-family:var(--sans);font-size:13px;
  color:var(--ink);background:var(--panel);outline:none;cursor:pointer;
  appearance:none;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238a857a' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat:no-repeat;background-position:right 12px center;
  padding-right:32px;
}
.quick-amounts{display:flex;gap:8px}
.qa-btn{
  flex:1;padding:8px;border-radius:4px;border:1px solid var(--border);
  background:transparent;font-family:var(--mono);font-size:11px;
  color:var(--ink2);cursor:pointer;transition:all .15s;text-align:center;
}
.qa-btn:hover{border-color:var(--green);color:var(--green)}
.qa-btn.sel{border-color:var(--green);background:var(--green-bg);color:var(--green)}
.withdraw-info{
  background:var(--amber-bg);border:1px solid rgba(180,83,9,.15);
  border-radius:5px;padding:10px 12px;
  font-size:11px;color:var(--amber);line-height:1.6;
}
.withdraw-submit{
  width:100%;padding:12px;background:var(--green);color:#fff;border:none;
  border-radius:var(--r);font-size:13px;font-family:var(--sans);
  cursor:pointer;transition:background .15s;font-weight:500;
}
.withdraw-submit:hover{background:#0a6b40}
.withdraw-history{border-top:1px solid var(--border)}

/* ── COUPON (F08-12) ── */
.coupon-card{
  border:1.5px dashed var(--border2);border-radius:var(--r);
  display:grid;grid-template-columns:auto 1fr auto;
  align-items:stretch;overflow:hidden;margin-bottom:10px;
  transition:all .2s;
}
.coupon-card:hover{border-color:var(--amber);box-shadow:0 2px 8px rgba(0,0,0,.06)}
.coupon-left{
  background:var(--gold-bg);padding:16px 14px;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  border-right:1.5px dashed var(--border2);min-width:80px;
}
.coupon-val{font-family:var(--mono);font-size:22px;font-weight:700;color:var(--gold);line-height:1}
.coupon-unit{font-family:var(--mono);font-size:9px;color:var(--amber)}
.coupon-mid{padding:14px 16px;flex:1}
.coupon-name{font-size:13px;font-weight:600;margin-bottom:4px}
.coupon-cond{font-family:var(--mono);font-size:10px;color:var(--muted)}
.coupon-exp{font-family:var(--mono);font-size:9px;color:var(--muted);margin-top:6px}
.coupon-right{
  padding:14px 16px;display:flex;align-items:center;justify-content:center;
}
.coupon-use{
  padding:8px 16px;background:var(--gold);color:#fff;border:none;
  border-radius:4px;font-size:11px;font-family:var(--sans);cursor:pointer;
  white-space:nowrap;transition:background .15s;
}
.coupon-use:hover{background:var(--amber)}
.coupon-used .coupon-left{background:var(--bg2)}
.coupon-used .coupon-val{color:var(--muted)}
.coupon-used .coupon-use{background:var(--bg2);color:var(--muted);cursor:not-allowed}

/* ── INVOICE (F08-11) ── */
.invoice-type-tabs{display:flex;gap:0;margin-bottom:16px;border:1px solid var(--border);border-radius:var(--r);overflow:hidden}
.itab{
  flex:1;padding:10px;text-align:center;font-size:12px;
  background:transparent;border:none;cursor:pointer;
  transition:all .15s;color:var(--muted);font-family:var(--sans);
}
.itab:not(:last-child){border-right:1px solid var(--border)}
.itab.active{background:var(--ink);color:#fff}
.inv-form{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.inv-submit{
  grid-column:span 2;padding:11px;background:var(--blue);color:#fff;
  border:none;border-radius:var(--r);font-size:13px;font-family:var(--sans);
  cursor:pointer;transition:background .15s;
}
.inv-submit:hover{background:#1a40a0}

/* ── MODAL OVERLAY ── */
.modal-overlay{
  position:fixed;inset:0;background:rgba(0,0,0,.5);
  z-index:200;display:none;align-items:center;justify-content:center;
  backdrop-filter:blur(4px);
}
.modal-overlay.open{display:flex}
.modal{
  background:var(--panel);border-radius:10px;padding:32px;
  width:420px;max-width:90vw;box-shadow:var(--shadow-lg);
  animation:modalIn .25s ease;
}
@keyframes modalIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
.modal-title{font-family:var(--serif);font-size:20px;font-style:italic;margin-bottom:4px}
.modal-sub{font-family:var(--mono);font-size:10px;color:var(--muted);margin-bottom:24px}
.modal-close{
  position:absolute;top:16px;right:16px;
  width:28px;height:28px;border-radius:50%;border:1px solid var(--border);
  background:transparent;cursor:pointer;font-size:14px;
  display:flex;align-items:center;justify-content:center;color:var(--muted);
}
.modal-actions{display:flex;gap:10px;margin-top:24px}
.modal-btn{
  flex:1;padding:11px;border-radius:var(--r);font-size:13px;
  font-family:var(--sans);cursor:pointer;transition:all .15s;
}
.modal-btn-cancel{background:transparent;border:1px solid var(--border2);color:var(--ink2)}
.modal-btn-confirm{background:var(--ink);border:1px solid var(--ink);color:#fff}

/* ── TOAST ── */
.toast{
  position:fixed;bottom:28px;right:28px;z-index:300;
  background:var(--ink);color:#fff;
  padding:12px 20px;border-radius:var(--r);
  font-family:var(--mono);font-size:12px;
  box-shadow:var(--shadow-lg);
  transform:translateY(80px);opacity:0;
  transition:all .3s cubic-bezier(.34,1.56,.64,1);
  display:flex;align-items:center;gap:10px;
  max-width:320px;
}
.toast.show{transform:translateY(0);opacity:1}
.toast-icon{font-size:16px;flex-shrink:0}

/* ── TAG CHIP ── */
.func-tag{
  display:inline-flex;align-items:center;gap:4px;
  font-family:var(--mono);font-size:9px;letter-spacing:.04em;
  padding:2px 8px;border-radius:3px;
  background:var(--bg2);color:var(--muted);
}

/* ── RESPONSIVE ── */
@media(max-width:1100px){.kpi-strip{grid-template-columns:repeat(3,1fr)}}
@media(max-width:900px){
  .app{grid-template-columns:1fr}
  .sidebar{display:none}
  .grid-2,.grid-3{grid-template-columns:1fr}
  .col-span-2{grid-column:span 1}
}

/* ── ANIMATIONS ── */
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.page>*{animation:fadeUp .35s ease both}
.page>*:nth-child(1){animation-delay:.04s}
.page>*:nth-child(2){animation-delay:.08s}
.page>*:nth-child(3){animation-delay:.12s}
.page>*:nth-child(4){animation-delay:.16s}
.page>*:nth-child(5){animation-delay:.20s}
.page>*:nth-child(6){animation-delay:.24s}
</style>
</head>
<body>

<!-- TOAST -->
<div class="toast" id="toast"><span class="toast-icon">✓</span><span id="toast-msg">操作成功</span></div>

<!-- MODAL -->
<div class="modal-overlay" id="modal" onclick="closeModal(event)">
  <div class="modal" style="position:relative">
    <button class="modal-close" onclick="hideModal()">✕</button>
    <div class="modal-title" id="modal-title">确认操作</div>
    <div class="modal-sub" id="modal-sub">请确认以下操作</div>
    <div id="modal-body"></div>
    <div class="modal-actions">
      <button class="modal-btn modal-btn-cancel" onclick="hideModal()">取消</button>
      <button class="modal-btn modal-btn-confirm" id="modal-confirm">确认</button>
    </div>
  </div>
</div>

<div class="app">

<!-- ── SIDEBAR ── -->
<aside class="sidebar">
  <div class="sidebar-logo">
    <div class="logo-mark">M08 · BILLING</div>
    <div class="logo-name">计费结算模块</div>
  </div>

  <div class="sidebar-section">
    <div class="sidebar-label">资金管理</div>
    <a class="nav-item active" href="#balance">
      <span class="nav-icon">💰</span> 余额充值
      <span class="badge">F08-01</span>
    </a>
    <a class="nav-item" href="#auto">
      <span class="nav-icon">🔄</span> 自动充值
      <span class="badge">F08-02</span>
    </a>
    <a class="nav-item" href="#ticker">
      <span class="nav-icon">⏱</span> 实时扣费
      <span class="badge">F08-03</span>
    </a>
    <a class="nav-item" href="#records">
      <span class="nav-icon">📋</span> 扣费记录
      <span class="badge">F08-04</span>
    </a>
  </div>

  <div class="sidebar-divider"></div>

  <div class="sidebar-section">
    <div class="sidebar-label">账单收益</div>
    <a class="nav-item" href="#bill">
      <span class="nav-icon">📊</span> 账单查询
      <span class="badge">F08-05</span>
    </a>
    <a class="nav-item" href="#earnings">
      <span class="nav-icon">💵</span> 收益入账
      <span class="badge">F08-06</span>
    </a>
    <a class="nav-item" href="#earnings">
      <span class="nav-icon">📈</span> 收益明细
      <span class="badge">F08-07</span>
    </a>
  </div>

  <div class="sidebar-divider"></div>

  <div class="sidebar-section">
    <div class="sidebar-label">提现结算</div>
    <a class="nav-item" href="#withdraw">
      <span class="nav-icon">🏦</span> 提现申请
      <span class="badge">F08-08</span>
    </a>
    <a class="nav-item" href="#withdraw">
      <span class="nav-icon">📑</span> 提现记录
      <span class="badge">F08-09</span>
    </a>
  </div>

  <div class="sidebar-divider"></div>

  <div class="sidebar-section">
    <div class="sidebar-label">增值服务</div>
    <a class="nav-item" href="#reconcile">
      <span class="nav-icon">🔍</span> 对账单
      <span class="badge">F08-10</span>
    </a>
    <a class="nav-item" href="#invoice">
      <span class="nav-icon">🧾</span> 发票申请
      <span class="badge">F08-11</span>
    </a>
    <a class="nav-item" href="#coupon">
      <span class="nav-icon">🎫</span> 优惠券
      <span class="badge">F08-12</span>
    </a>
  </div>

  <div class="user-card">
    <div class="user-avatar">王</div>
    <div class="user-name">王雨晴</div>
    <div class="user-role">FREELANCER · UID 100234</div>
  </div>
</aside>

<!-- ── MAIN ── -->
<div class="main">

  <!-- TOPBAR -->
  <div class="topbar">
    <div class="topbar-left">
      <div class="breadcrumb">
        <span>机器人技能共享平台</span>
        <span class="sep">/</span>
        <span>财务中心</span>
        <span class="sep">/</span>
        <span class="current">计费结算</span>
      </div>
    </div>
    <div class="topbar-right">
      <div class="live-tag">
        <div class="live-dot"></div>
        计费中
      </div>
      <button class="tb-btn tb-btn-outline" onclick="showToast('账单已导出为 CSV 文件','📄')">
        ↓ 导出账单
      </button>
      <button class="tb-btn tb-btn-primary" onclick="scrollTo(0,0)">
        + 充值
      </button>
    </div>
  </div>

  <div class="page">

    <!-- ── KPI STRIP ── -->
    <div class="kpi-strip">
      <div class="kpi" style="--accent:#0d7c4b">
        <div class="kpi-label">当前余额</div>
        <div class="kpi-val">¥<em id="kpi-bal">1,842.50</em></div>
        <div class="kpi-delta delta-up">↑ 充值 ¥500 · 3小时前</div>
      </div>
      <div class="kpi" style="--accent:#1e4fbb">
        <div class="kpi-label">本月收益</div>
        <div class="kpi-val">¥<em>6,720.00</em></div>
        <div class="kpi-delta delta-up">↑ 较上月 +23.4%</div>
      </div>
      <div class="kpi" style="--accent:#c0392b">
        <div class="kpi-label">本月支出</div>
        <div class="kpi-val">¥<em>1,280.00</em></div>
        <div class="kpi-delta delta-dn">↓ 较上月 -8.2%</div>
      </div>
      <div class="kpi" style="--accent:#b45309">
        <div class="kpi-label">待提现收益</div>
        <div class="kpi-val">¥<em>4,360.00</em></div>
        <div class="kpi-delta" style="color:var(--muted)">· 可提现金额</div>
      </div>
      <div class="kpi" style="--accent:#92710a">
        <div class="kpi-label">优惠券余额</div>
        <div class="kpi-val">3<em> 张</em></div>
        <div class="kpi-delta" style="color:var(--muted)">· 共抵用 ¥180</div>
      </div>
    </div>

    <!-- ── ROW 1: BALANCE + AUTO + TICKER ── -->
    <div class="grid-3">

      <!-- F08-01: 余额充值 -->
      <div class="card" id="balance">
        <div class="card-head">
          <div>
            <div class="card-title">余额充值</div>
            <div class="card-meta">F08-01 · P0</div>
          </div>
          <span class="func-tag">支付宝 / 微信 / 银行卡</span>
        </div>
        <div class="card-body">
          <div class="balance-display">
            <div class="balance-currency">¥</div>
            <div class="balance-amount"><span id="bal-int">1,842</span><span class="balance-cents">.50</span></div>
          </div>
          <div class="balance-progress">
            <div class="progress-label">
              <span>当前余额</span>
              <span>充值上限 ¥50,000</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width:3.7%"></div>
            </div>
          </div>

          <div class="recharge-grid" id="rechargeGrid">
            <div class="recharge-btn selected" onclick="selectRecharge(this,100)">
              <div class="recharge-amount">100</div>
              <div class="recharge-label">元</div>
            </div>
            <div class="recharge-btn" onclick="selectRecharge(this,300)">
              <div class="recharge-amount">300</div>
              <div class="recharge-label">元</div>
            </div>
            <div class="recharge-btn" onclick="selectRecharge(this,500)">
              <div class="recharge-amount">500</div>
              <div class="recharge-label">赠 20</div>
            </div>
            <div class="recharge-btn" onclick="selectRecharge(this,1000)">
              <div class="recharge-amount">1000</div>
              <div class="recharge-label">赠 60</div>
            </div>
          </div>

          <div class="recharge-methods">
            <button class="method-btn active" onclick="selectMethod(this)">
              <span class="method-icon">💙</span> 支付宝
            </button>
            <button class="method-btn" onclick="selectMethod(this)">
              <span class="method-icon">💚</span> 微信支付
            </button>
            <button class="method-btn" onclick="selectMethod(this)">
              <span class="method-icon">🏦</span> 银行卡
            </button>
          </div>

          <button class="recharge-submit" onclick="doRecharge()">立即充值 ¥<span id="recharge-amt">100</span></button>
        </div>
      </div>

      <!-- F08-02: 自动充值 -->
      <div class="card" id="auto">
        <div class="card-head">
          <div>
            <div class="card-title">自动充值</div>
            <div class="card-meta">F08-02 · P1 · 需用户授权</div>
          </div>
        </div>
        <div class="card-body">
          <div class="auto-toggle-row">
            <div class="auto-toggle-text">
              <h4>启用自动充值</h4>
              <p>余额低于阈值时自动触发</p>
            </div>
            <label class="toggle">
              <input type="checkbox" id="autoToggle" onchange="toggleAuto(this)">
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="auto-settings" id="autoSettings">
            <p>✓ 已授权自动扣款，可随时关闭</p>
            <div class="auto-input-row">
              <div class="form-group">
                <label>触发阈值（元）</label>
                <input class="form-input" type="number" value="100" placeholder="50">
              </div>
              <div class="form-group">
                <label>每次充值（元）</label>
                <input class="form-input" type="number" value="300" placeholder="300">
              </div>
            </div>
          </div>

          <div style="margin-top:20px">
            <div class="sec-title" style="font-size:15px;margin-bottom:12px">F08-03 · 实时扣费</div>
            <div class="ticker-section" id="ticker">
              <div class="ticker-top">
                <div class="ticker-label">当前订单 · 累计扣费</div>
                <div class="ticker-status">
                  <div class="live-dot"></div> 计费中
                </div>
              </div>
              <div class="ticker-amount"><em>¥</em><span id="tick-val">0.00</span></div>
              <div class="ticker-rate">¥280.00/h · 每 6 秒扣费一次</div>
              <div class="ticker-grid">
                <div class="ticker-stat">
                  <div class="ts-label">累计工时</div>
                  <div class="ts-val" id="tick-time">00:00:00</div>
                </div>
                <div class="ticker-stat">
                  <div class="ts-label">本次费率</div>
                  <div class="ts-val green">¥0.467<span style="font-size:9px;color:rgba(255,255,255,.3)">/6s</span></div>
                </div>
                <div class="ticker-stat">
                  <div class="ts-label">下次扣费</div>
                  <div class="ts-val amber" id="tick-cd">6s</div>
                </div>
              </div>
              <div class="countdown-bar"><div class="countdown-fill"></div></div>
            </div>
          </div>
        </div>
      </div>

      <!-- F08-05: 账单查询 -->
      <div class="card" id="bill">
        <div class="card-head">
          <div>
            <div class="card-title">账单查询</div>
            <div class="card-meta">F08-05 · P0 · 月度汇总</div>
          </div>
        </div>
        <div class="card-body">
          <div class="bill-period">
            <button class="period-btn" onclick="selectPeriod(this)">1月</button>
            <button class="period-btn" onclick="selectPeriod(this)">2月</button>
            <button class="period-btn active" onclick="selectPeriod(this)">3月</button>
            <button class="period-btn" onclick="selectPeriod(this)">自定义</button>
          </div>
          <div class="bill-overview">
            <div class="bill-block">
              <div class="bb-label">本月收入</div>
              <div class="bb-val inc">+¥6,720</div>
              <div class="bb-sub">18 笔订单收益</div>
            </div>
            <div class="bill-block">
              <div class="bb-label">本月支出</div>
              <div class="bb-val exp">−¥1,280</div>
              <div class="bb-sub">充值 4 次</div>
            </div>
          </div>

          <div style="font-family:var(--mono);font-size:9px;color:var(--muted);letter-spacing:.1em;margin-bottom:10px;text-transform:uppercase">日收入趋势</div>
          <div class="chart-bar-wrap" id="chartBars">
            <!-- generated by JS -->
          </div>
        </div>
      </div>
    </div>

    <!-- ── ROW 2: DEDUCTION RECORDS ── -->
    <div class="card" id="records">
      <div class="card-head">
        <div>
          <div class="card-title">扣费记录</div>
          <div class="card-meta">F08-04 · P0 · 按订单 / 时间维度查询</div>
        </div>
        <div class="sec-actions">
          <select class="bank-select" style="width:120px;padding:6px 28px 6px 10px">
            <option>全部订单</option>
            <option>ORD-2024-001</option>
            <option>ORD-2024-002</option>
          </select>
          <select class="bank-select" style="width:100px;padding:6px 28px 6px 10px">
            <option>本月</option>
            <option>上月</option>
            <option>近3月</option>
          </select>
          <button class="tb-btn tb-btn-outline" onclick="showToast('明细已导出','📄')">导出</button>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>时间</th>
              <th>订单号</th>
              <th>服务者</th>
              <th>类型</th>
              <th>工时</th>
              <th>金额</th>
              <th>余额</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody id="deductTable">
            <!-- generated by JS -->
          </tbody>
        </table>
      </div>
      <div class="table-footer">
        <div class="tf-info">共 142 条记录 · 当前显示 1-8</div>
        <div class="pagination">
          <button class="pg-btn" disabled>‹</button>
          <button class="pg-btn active">1</button>
          <button class="pg-btn" onclick="this.classList.add('active');this.previousElementSibling.classList.remove('active')">2</button>
          <button class="pg-btn">3</button>
          <button class="pg-btn">›</button>
        </div>
      </div>
    </div>

    <!-- ── ROW 3: EARNINGS + WITHDRAW ── -->
    <div class="grid-2">

      <!-- F08-06 F08-07: 收益 -->
      <div class="card" id="earnings">
        <div class="card-head">
          <div>
            <div class="card-title">收益入账 & 明细</div>
            <div class="card-meta">F08-06 · F08-07 · P0</div>
          </div>
        </div>
        <div class="earnings-header">
          <div class="eh-icon">💵</div>
          <div>
            <div class="eh-val">¥4,360.00</div>
            <div class="eh-label">待提现收益 · 3月已结算</div>
          </div>
          <div style="margin-left:auto;text-align:right">
            <div style="font-family:var(--mono);font-size:11px;color:var(--muted)">本月累计</div>
            <div style="font-family:var(--mono);font-size:18px;font-weight:700;color:var(--ink)">¥6,720</div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr auto;align-items:start">
          <div class="earnings-breakdown">
            <div class="eb-row">
              <span class="eb-label">
                <span class="eb-dot" style="background:#0d7c4b"></span>
                服务费收入
              </span>
              <span class="eb-val" style="color:var(--green)">¥7,896.00<span class="eb-pct">78%</span></span>
            </div>
            <div class="eb-row">
              <span class="eb-label">
                <span class="eb-dot" style="background:#c0392b"></span>
                平台抽成
              </span>
              <span class="eb-val" style="color:var(--red)">−¥1,176.00<span class="eb-pct">12%</span></span>
            </div>
            <div class="eb-row">
              <span class="eb-label">
                <span class="eb-dot" style="background:#92710a"></span>
                认证年费摊销
              </span>
              <span class="eb-val" style="color:var(--amber)">−¥360.00<span class="eb-pct">4%</span></span>
            </div>
            <div class="eb-row" style="background:var(--green-bg);border:1px solid rgba(13,124,75,.1)">
              <span class="eb-label" style="font-weight:600">实际到账</span>
              <span class="eb-val" style="color:var(--green);font-size:16px">¥6,360.00</span>
            </div>
          </div>

          <div class="donut-wrap">
            <div class="donut">
              <svg viewBox="0 0 110 110">
                <circle cx="55" cy="55" r="42" fill="none" stroke="#f0ece4" stroke-width="12"/>
                <circle cx="55" cy="55" r="42" fill="none" stroke="#0d7c4b" stroke-width="12"
                  stroke-dasharray="208 55" stroke-linecap="round"/>
                <circle cx="55" cy="55" r="42" fill="none" stroke="#c0392b" stroke-width="12"
                  stroke-dasharray="31 232" stroke-dashoffset="-208" stroke-linecap="round"/>
                <circle cx="55" cy="55" r="42" fill="none" stroke="#b45309" stroke-width="12"
                  stroke-dasharray="10 253" stroke-dashoffset="-239" stroke-linecap="round"/>
              </svg>
              <div class="donut-label">
                <div class="donut-pct">78%</div>
                <div class="donut-sub">净收益率</div>
              </div>
            </div>
          </div>
        </div>

        <!-- earnings history mini table -->
        <div style="border-top:1px solid var(--border)">
          <table>
            <thead><tr><th>订单</th><th>验收时间</th><th>服务费</th><th>到账金额</th><th>状态</th></tr></thead>
            <tbody>
              <tr><td class="td-mono">ORD-031</td><td class="td-mono">03-08 14:32</td><td class="td-mono">¥1,120</td><td class="td-amount-pos">+¥875</td><td><span class="pill pill-green">已入账</span></td></tr>
              <tr><td class="td-mono">ORD-030</td><td class="td-mono">03-07 09:15</td><td class="td-mono">¥840</td><td class="td-amount-pos">+¥655</td><td><span class="pill pill-green">已入账</span></td></tr>
              <tr><td class="td-mono">ORD-029</td><td class="td-mono">03-06 18:44</td><td class="td-mono">¥2,240</td><td class="td-amount-pos">+¥1,747</td><td><span class="pill pill-green">已入账</span></td></tr>
              <tr><td class="td-mono">ORD-028</td><td class="td-mono">03-05 11:22</td><td class="td-mono">¥560</td><td class="td-mono" style="color:var(--amber)">待结算</td><td><span class="pill pill-amber">验收中</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- F08-08 F08-09: 提现 -->
      <div class="card" id="withdraw">
        <div class="card-head">
          <div>
            <div class="card-title">提现申请 & 记录</div>
            <div class="card-meta">F08-08 · F08-09 · P0 · T+1 到账</div>
          </div>
        </div>
        <div class="withdraw-form">
          <div class="form-group">
            <label>提现到银行卡</label>
            <select class="bank-select">
              <option>🏦 招商银行 (尾号 6789)</option>
              <option>🏦 工商银行 (尾号 1234)</option>
              <option>+ 添加新银行卡</option>
            </select>
          </div>
          <div class="form-group">
            <label>提现金额（元）</label>
            <input class="form-input" type="number" placeholder="最低 100 元" id="withdrawAmt" value="1000">
          </div>
          <div>
            <div style="font-family:var(--mono);font-size:9px;color:var(--muted);letter-spacing:.1em;margin-bottom:8px;text-transform:uppercase">快速选择</div>
            <div class="quick-amounts">
              <div class="qa-btn" onclick="setWithdraw(this,1000)">¥1,000</div>
              <div class="qa-btn sel" onclick="setWithdraw(this,2000)">¥2,000</div>
              <div class="qa-btn" onclick="setWithdraw(this,4360)">全部</div>
            </div>
          </div>
          <div class="withdraw-info">
            ⚠ 提现时间：工作日 09:00–17:00，预计 T+1 到账。单笔最低 ¥100，最高 ¥50,000。每日可提现 3 次。
          </div>
          <button class="withdraw-submit" onclick="doWithdraw()">申请提现 ¥<span id="withdraw-show">2,000</span></button>
        </div>

        <!-- F08-09: 提现记录 -->
        <div class="withdraw-history">
          <div class="card-head" style="border-top:none">
            <div class="card-title-mono">提现历史</div>
          </div>
          <table>
            <thead><tr><th>申请时间</th><th>金额</th><th>银行卡</th><th>预计到账</th><th>状态</th></tr></thead>
            <tbody>
              <tr><td class="td-mono">03-01 10:22</td><td class="td-amount-pos">¥3,000</td><td class="td-mono">招行 6789</td><td class="td-mono">03-02</td><td><span class="pill pill-green">已到账</span></td></tr>
              <tr><td class="td-mono">02-22 14:08</td><td class="td-amount-pos">¥2,500</td><td class="td-mono">招行 6789</td><td class="td-mono">02-23</td><td><span class="pill pill-green">已到账</span></td></tr>
              <tr><td class="td-mono">02-15 09:35</td><td class="td-amount-pos">¥1,800</td><td class="td-mono">工行 1234</td><td class="td-mono">02-16</td><td><span class="pill pill-green">已到账</span></td></tr>
              <tr><td class="td-mono">02-08 16:50</td><td class="td-amount-pos">¥4,200</td><td class="td-mono">招行 6789</td><td class="td-mono">02-09</td><td><span class="pill pill-green">已到账</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ── ROW 4: RECONCILE + INVOICE + COUPON ── -->
    <div class="grid-3">

      <!-- F08-10: 对账单 -->
      <div class="card" id="reconcile">
        <div class="card-head">
          <div>
            <div class="card-title">对账单</div>
            <div class="card-meta">F08-10 · P1 · 月度对账</div>
          </div>
          <button class="tb-btn tb-btn-outline" style="padding:5px 12px;font-size:11px" onclick="showToast('对账单已下载','📊')">下载</button>
        </div>
        <div class="card-body">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
            <div class="bill-block">
              <div class="bb-label">平台账单</div>
              <div class="bb-val" style="font-size:16px">¥6,720.00</div>
            </div>
            <div class="bill-block">
              <div class="bb-label">银行流水</div>
              <div class="bb-val" style="font-size:16px">¥6,720.00</div>
            </div>
          </div>
          <div style="background:var(--green-bg);border:1px solid rgba(13,124,75,.15);border-radius:5px;padding:10px 12px;font-size:12px;color:var(--green);margin-bottom:16px">
            ✓ 2026年3月账单已对账完毕，数据一致
          </div>
          <table>
            <thead><tr><th>月份</th><th>平台</th><th>银行</th><th>差异</th><th>状态</th></tr></thead>
            <tbody>
              <tr><td class="td-mono">2026-03</td><td class="td-mono">¥6,720</td><td class="td-mono">¥6,720</td><td class="td-mono" style="color:var(--green)">¥0</td><td><span class="pill pill-green">已核对</span></td></tr>
              <tr><td class="td-mono">2026-02</td><td class="td-mono">¥5,460</td><td class="td-mono">¥5,460</td><td class="td-mono" style="color:var(--green)">¥0</td><td><span class="pill pill-green">已核对</span></td></tr>
              <tr><td class="td-mono">2026-01</td><td class="td-mono">¥4,200</td><td class="td-mono">¥4,200</td><td class="td-mono" style="color:var(--green)">¥0</td><td><span class="pill pill-green">已核对</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- F08-11: 发票申请 -->
      <div class="card" id="invoice">
        <div class="card-head">
          <div>
            <div class="card-title">发票申请</div>
            <div class="card-meta">F08-11 · P2 · 增值税 / 普通发票</div>
          </div>
        </div>
        <div class="card-body">
          <div class="invoice-type-tabs">
            <button class="itab active" onclick="switchTab(this)">增值税专票</button>
            <button class="itab" onclick="switchTab(this)">普通发票</button>
            <button class="itab" onclick="switchTab(this)">电子发票</button>
          </div>
          <div class="inv-form">
            <div class="form-group">
              <label>发票抬头</label>
              <input class="form-input" placeholder="公司名称">
            </div>
            <div class="form-group">
              <label>税号</label>
              <input class="form-input" placeholder="纳税人识别号">
            </div>
            <div class="form-group">
              <label>开票金额</label>
              <input class="form-input" value="6720.00">
            </div>
            <div class="form-group">
              <label>开票月份</label>
              <select class="bank-select">
                <option>2026年3月</option>
                <option>2026年2月</option>
              </select>
            </div>
            <div class="form-group" style="grid-column:span 2">
              <label>收件邮箱</label>
              <input class="form-input" placeholder="发票将发送至此邮箱">
            </div>
            <button class="inv-submit" onclick="showToast('发票申请已提交，3个工作日内发送','🧾')">提交申请</button>
          </div>
        </div>
      </div>

      <!-- F08-12: 优惠券 -->
      <div class="card" id="coupon">
        <div class="card-head">
          <div>
            <div class="card-title">优惠券</div>
            <div class="card-meta">F08-12 · P2 · 共 3 张可用</div>
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            <input class="form-input" style="width:110px;padding:6px 10px;font-size:12px" placeholder="输入券码">
            <button class="tb-btn tb-btn-outline" style="padding:6px 12px;font-size:11px" onclick="showToast('兑换成功！已添加一张 ¥50 优惠券','🎫')">兑换</button>
          </div>
        </div>
        <div class="card-body">

          <div class="coupon-card">
            <div class="coupon-left">
              <div class="coupon-val">80</div>
              <div class="coupon-unit">元</div>
            </div>
            <div class="coupon-mid">
              <div class="coupon-name">新用户充值优惠券</div>
              <div class="coupon-cond">满 500 元可用</div>
              <div class="coupon-exp">有效期至 2026-04-30</div>
            </div>
            <div class="coupon-right">
              <button class="coupon-use" onclick="useCoupon(this,'80元新用户券')">立即使用</button>
            </div>
          </div>

          <div class="coupon-card">
            <div class="coupon-left">
              <div class="coupon-val">50</div>
              <div class="coupon-unit">元</div>
            </div>
            <div class="coupon-mid">
              <div class="coupon-name">平台推广优惠券</div>
              <div class="coupon-cond">满 200 元可用</div>
              <div class="coupon-exp">有效期至 2026-05-15</div>
            </div>
            <div class="coupon-right">
              <button class="coupon-use" onclick="useCoupon(this,'50元推广券')">立即使用</button>
            </div>
          </div>

          <div class="coupon-card">
            <div class="coupon-left">
              <div class="coupon-val">50</div>
              <div class="coupon-unit">元</div>
            </div>
            <div class="coupon-mid">
              <div class="coupon-name">季度活跃奖励券</div>
              <div class="coupon-cond">满 300 元可用</div>
              <div class="coupon-exp">有效期至 2026-06-01</div>
            </div>
            <div class="coupon-right">
              <button class="coupon-use" onclick="useCoupon(this,'50元活跃券')">立即使用</button>
            </div>
          </div>

          <div class="coupon-card coupon-used" style="opacity:.55">
            <div class="coupon-left">
              <div class="coupon-val" style="text-decoration:line-through">100</div>
              <div class="coupon-unit">元</div>
            </div>
            <div class="coupon-mid">
              <div class="coupon-name">春节特惠券</div>
              <div class="coupon-cond">满 800 元可用 · 已使用</div>
              <div class="coupon-exp">已于 2026-02-14 使用</div>
            </div>
            <div class="coupon-right">
              <button class="coupon-use" disabled>已使用</button>
            </div>
          </div>

        </div>
      </div>
    </div>

  </div><!-- /page -->
</div><!-- /main -->
</div><!-- /app -->

<script>
/* ── BILLING TICKER ── */
let secs=0,cost=0,cd=6;const RATE=280/3600;
function tickBilling(){
  secs++;cost+=RATE;cd--;
  if(cd<=0)cd=6;
  const h=String(Math.floor(secs/3600)).padStart(2,'0');
  const m=String(Math.floor((secs%3600)/60)).padStart(2,'0');
  const s=String(secs%60).padStart(2,'0');
  document.getElementById('tick-val').textContent=cost.toFixed(2);
  document.getElementById('tick-time').textContent=`${h}:${m}:${s}`;
  document.getElementById('tick-cd').textContent=cd+'s';
}
setInterval(tickBilling,1000);

/* ── CHART BARS ── */
const days=[{d:'03-04',inc:820,exp:200},{d:'03-05',inc:540,exp:100},{d:'03-06',inc:1120,exp:300},{d:'03-07',inc:480,exp:80},{d:'03-08',inc:960,exp:180}];
const cb=document.getElementById('chartBars');
days.forEach(d=>{
  const max=1400;
  cb.innerHTML+=`
    <div class="chart-row">
      <div class="chart-label">${d.d}</div>
      <div class="chart-track">
        <div class="chart-fill inc" style="width:${(d.inc/max*100)}%">+¥${d.inc}</div>
      </div>
    </div>
    <div class="chart-row" style="margin-top:-4px;margin-bottom:4px">
      <div class="chart-label"></div>
      <div class="chart-track" style="height:14px">
        <div class="chart-fill exp" style="width:${(d.exp/max*100)}%">−¥${d.exp}</div>
      </div>
    </div>`;
});

/* ── DEDUCTION TABLE ── */
const deductions=[
  {t:'14:32:06',ord:'ORD-031',sv:'DataBot Pro',type:'按时计费',dur:'6s',amt:'-0.47',bal:'1842.50',st:'success'},
  {t:'14:32:00',ord:'ORD-031',sv:'DataBot Pro',type:'按时计费',dur:'6s',amt:'-0.47',bal:'1842.97',st:'success'},
  {t:'09:15:00',ord:'ORD-030',sv:'王数据师',type:'套餐结算',dur:'4h',amt:'-560.00',bal:'1843.44',st:'success'},
  {t:'08:50:18',ord:'ORD-030',sv:'王数据师',type:'按时计费',dur:'6s',amt:'-0.30',bal:'2403.44',st:'success'},
  {t:'昨日 18:44',ord:'ORD-029',sv:'CodeWeaver',type:'按时计费',dur:'6s',amt:'-0.53',bal:'2403.74',st:'success'},
  {t:'昨日 16:00',ord:'ORD-028',sv:'李建国',type:'充值到账',dur:'—',amt:'+500.00',bal:'2404.27',st:'charge'},
  {t:'昨日 11:22',ord:'ORD-028',sv:'李建国',type:'按时计费',dur:'6s',amt:'-0.23',bal:'1904.27',st:'success'},
  {t:'03-06 09:00',ord:'ORD-027',sv:'AutoReport',type:'余额不足暂停',dur:'—',amt:'0.00',bal:'1904.50',st:'warn'},
];
const pillMap={success:'pill-green',charge:'pill-blue',warn:'pill-amber'};
const labelMap={success:'扣费成功',charge:'充值到账',warn:'已暂停'};
const dt=document.getElementById('deductTable');
deductions.forEach(r=>{
  dt.innerHTML+=`<tr>
    <td class="td-mono" style="color:var(--muted)">${r.t}</td>
    <td class="td-mono" style="color:var(--blue)">${r.ord}</td>
    <td style="font-size:12px">${r.sv}</td>
    <td style="font-size:12px">${r.type}</td>
    <td class="td-mono">${r.dur}</td>
    <td class="${r.amt.startsWith('+')? 'td-amount-pos':r.amt==='0.00'?'td-mono':'td-amount-neg'}">${r.amt}</td>
    <td class="td-mono">¥${r.bal}</td>
    <td><span class="pill ${pillMap[r.st]}">${labelMap[r.st]}</span></td>
  </tr>`;
});

/* ── INTERACTIONS ── */
let selRechargeAmt=100;
function selectRecharge(el,amt){
  document.querySelectorAll('.recharge-btn').forEach(b=>b.classList.remove('selected'));
  el.classList.add('selected');
  selRechargeAmt=amt;
  document.getElementById('recharge-amt').textContent=amt;
}
function selectMethod(el){
  document.querySelectorAll('.method-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
}
function doRecharge(){
  showModal(
    '确认充值',
    `即将充值 ¥${selRechargeAmt}，款项将立即到账至您的平台余额`,
    ()=>{showToast(`充值成功！余额增加 ¥${selRechargeAmt}`,'💰')}
  );
}
function toggleAuto(cb){
  document.getElementById('autoSettings').classList.toggle('show',cb.checked);
  if(cb.checked) showToast('自动充值已启用','🔄');
}
function selectPeriod(el){
  document.querySelectorAll('.period-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
}
function setWithdraw(el,amt){
  document.querySelectorAll('.qa-btn').forEach(b=>b.classList.remove('sel'));
  el.classList.add('sel');
  document.getElementById('withdrawAmt').value=amt;
  document.getElementById('withdraw-show').textContent=amt.toLocaleString();
}
document.getElementById('withdrawAmt').addEventListener('input',function(){
  document.getElementById('withdraw-show').textContent=parseFloat(this.value||0).toLocaleString();
});
function doWithdraw(){
  const amt=document.getElementById('withdrawAmt').value;
  showModal('确认提现',`申请提现 ¥${amt} 至招商银行 (尾号 6789)，预计 T+1 工作日到账`,()=>{
    showToast(`提现申请成功！¥${amt} 预计明日到账`,'🏦');
  });
}
function useCoupon(btn,name){
  showModal('使用优惠券',`确认使用「${name}」用于下次充值抵扣？`,()=>{
    btn.textContent='已使用';btn.style.background='var(--bg2)';btn.style.color='var(--muted)';
    showToast(`优惠券已添加，下次充值自动抵用`,'🎫');
  });
}
function switchTab(el){
  document.querySelectorAll('.itab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
}

/* ── MODAL ── */
let confirmCb=null;
function showModal(title,sub,cb){
  document.getElementById('modal-title').textContent=title;
  document.getElementById('modal-sub').textContent=sub;
  document.getElementById('modal-body').innerHTML='';
  confirmCb=cb;
  document.getElementById('modal').classList.add('open');
}
document.getElementById('modal-confirm').onclick=()=>{
  hideModal();
  if(confirmCb) setTimeout(confirmCb,200);
};
function hideModal(){document.getElementById('modal').classList.remove('open')}
function closeModal(e){if(e.target===document.getElementById('modal'))hideModal()}

/* ── TOAST ── */
let toastTimer;
function showToast(msg,icon='✓'){
  clearTimeout(toastTimer);
  const t=document.getElementById('toast');
  document.getElementById('toast-msg').textContent=msg;
  t.querySelector('.toast-icon').textContent=icon;
  t.classList.add('show');
  toastTimer=setTimeout(()=>t.classList.remove('show'),3200);
}

/* ── SIDEBAR ACTIVE ── */
document.querySelectorAll('.nav-item').forEach(a=>{
  a.addEventListener('click',function(){
    document.querySelectorAll('.nav-item').forEach(x=>x.classList.remove('active'));
    this.classList.add('active');
  });
});

/* ── SCROLL SPY ── */
const sections=['balance','auto','bill','records','earnings','withdraw','reconcile','invoice','coupon'];
window.addEventListener('scroll',()=>{
  sections.forEach(id=>{
    const el=document.getElementById(id);
    if(!el) return;
    const rect=el.getBoundingClientRect();
    if(rect.top<200 && rect.bottom>100){
      const link=document.querySelector(`.nav-item[href="#${id}"]`);
      if(link){
        document.querySelectorAll('.nav-item').forEach(x=>x.classList.remove('active'));
        link.classList.add('active');
      }
    }
  });
},{passive:true});
</script>
</body>
</html>