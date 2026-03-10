/**
 * ChatLite 官网首页
 * 机器人技能共享平台
 */

import React, { useState, useEffect } from 'react';
import './HomePage.css';

export const HomePage: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [ticker, setTicker] = useState(0);
  const [workTime, setWorkTime] = useState('00:00:00');

  // 滚动效果
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 实时计费模拟
  useEffect(() => {
    const rate = 280 / 3600; // 每小时 280 元
    let seconds = 0;
    
    const timer = setInterval(() => {
      seconds++;
      setTicker(prev => prev + rate);
      
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      setWorkTime(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="home-page">
      {/* NAV */}
      <nav className={`home-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-logo">
          <div className="logo-mark">⚡</div>
          ChatLite · 机器人技能共享
        </div>
        <ul className="nav-links">
          <li><a href="#features">平台介绍</a></li>
          <li><a href="#services">服务市场</a></li>
          <li><a href="#solutions">行业方案</a></li>
          <li><a href="#robots">机器人中心</a></li>
          <li><a href="#pricing">定价</a></li>
        </ul>
        <div className="nav-cta">
          <button className="btn-outline">登录</button>
          <button className="btn-solid">免费注册 →</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-mesh"></div>
        <div className="hero-grid"></div>
        <div className="orb orb1"></div>
        <div className="orb orb2"></div>
        <div className="orb orb3"></div>

        <div className="hero-content">
          <div className="hero-badge">
            <div className="badge-dot"></div>
            ROBOT SKILLS PLATFORM · v1.2 正式上线
          </div>

          <h1>
            连接<span className="outline-text">客户</span>、自由职业者<br/>
            与<span className="line2">机器人</span>的智能协作生态
          </h1>

          <p className="hero-sub">
            以聊天为核心交互入口，融合 AI 需求分析、智能匹配、任务拆分与实时计费，
            打造人机协作的新型服务交付模式。
          </p>

          <div className="hero-actions">
            <button className="btn-hero"><span>立即开始使用 →</span></button>
            <button className="btn-ghost-hero">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="8" cy="8" r="6"/>
                <path d="M6.5 5.5l3 2.5-3 2.5"/>
              </svg>
              观看演示视频
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-n">2,4<em>00+</em></div>
              <div className="stat-l">认证技能服务</div>
            </div>
            <div className="stat-item">
              <div className="stat-n"><em>98</em>%</div>
              <div className="stat-l">订单验收通过率</div>
            </div>
            <div className="stat-item">
              <div className="stat-n"><em>6</em>秒</div>
              <div className="stat-l">实时计费精度</div>
            </div>
            <div className="stat-item">
              <div className="stat-n">7<em>×</em>24</div>
              <div className="stat-l">AI 客服在线</div>
            </div>
          </div>
        </div>

        <div className="scroll-hint">
          <div className="scroll-line"></div>
          SCROLL
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee-wrap">
        <div className="marquee-inner">
          <div className="m-item">聊天驱动交付 <b>CHAT-FIRST</b></div>
          <div className="m-item">· AI 智能需求分析 <b>DEMAND ANALYSIS</b></div>
          <div className="m-item">· 多维度匹配算法 <b>SMART MATCHING</b></div>
          <div className="m-item">· 实时工时计费 <b>REAL-TIME BILLING</b></div>
          <div className="m-item">· 资金托管保障 <b>ESCROW SYSTEM</b></div>
          <div className="m-item">· 机器人 MCP 接入 <b>ROBOT PROTOCOL</b></div>
          <div className="m-item">· AI 仲裁机制 <b>AI ARBITRATION</b></div>
          <div className="m-item">· 三方协作空间 <b>TRIPARTY COLLAB</b></div>
          {/* repeat */}
          <div className="m-item">聊天驱动交付 <b>CHAT-FIRST</b></div>
          <div className="m-item">· AI 智能需求分析 <b>DEMAND ANALYSIS</b></div>
          <div className="m-item">· 多维度匹配算法 <b>SMART MATCHING</b></div>
          <div className="m-item">· 实时工时计费 <b>REAL-TIME BILLING</b></div>
          <div className="m-item">· 资金托管保障 <b>ESCROW SYSTEM</b></div>
          <div className="m-item">· 机器人 MCP 接入 <b>ROBOT PROTOCOL</b></div>
          <div className="m-item">· AI 仲裁机制 <b>AI ARBITRATION</b></div>
          <div className="m-item">· 三方协作空间 <b>TRIPARTY COLLAB</b></div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section className="how">
        <div className="section-inner">
          <div className="how-text reveal">
            <div className="eyebrow">核心工作流程</div>
            <h2>从需求到交付<br/><span>全程 AI 驱动</span></h2>
            <p>登录即可在聊天框中描述需求，无需繁琐表单。AI 自动分析意图，匹配最优服务者，全程工时透明可追溯。</p>

            <div className="steps">
              <div className="step">
                <div className="step-num">01</div>
                <div className="step-body">
                  <h4>描述需求，AI 实时分析</h4>
                  <p>在聊天框输入需求，需求分析机器人自动识别意图、提取关键信息，生成结构化需求总结。</p>
                </div>
              </div>
              <div className="step">
                <div className="step-num">02</div>
                <div className="step-body">
                  <h4>多维匹配，Artifact 展示结果</h4>
                  <p>基于技能标签 (40%)、历史评分 (20%)、响应速度 (15%) 等维度智能排序，以卡片形式呈现最优选项。</p>
                </div>
              </div>
              <div className="step">
                <div className="step-num">03</div>
                <div className="step-body">
                  <h4>一键下单，建立协作通道</h4>
                  <p>确认服务者后支付预付款，系统自动在消息列表创建与服务者的直接通道。</p>
                </div>
              </div>
              <div className="step">
                <div className="step-num">04</div>
                <div className="step-body">
                  <h4>拉入机器人，实时工时计费</h4>
                  <p>支持拉入机器人协作，每 6 秒自动记录工时并扣费，全程透明可追溯，余额不足自动提醒。</p>
                </div>
              </div>
              <div className="step">
                <div className="step-num">05</div>
                <div className="step-body">
                  <h4>验收结算，资金安全释放</h4>
                  <p>客户验收通过后款项自动释放，存在争议可申请 AI 仲裁 + 人工确认双层保障。</p>
                </div>
              </div>
            </div>
          </div>

          <div className="terminal reveal">
            <div className="terminal-bar">
              <div className="t-dot r"></div>
              <div className="t-dot y"></div>
              <div className="t-dot g"></div>
              <span className="t-title">需求分析机器人 · 实时交互</span>
            </div>
            <div className="terminal-body">
              <div className="t-line"><span className="t-prompt">user ›</span><span className="t-cmd">我需要一个电商数据分析报告，每周自动生成</span></div>
              <div className="t-line"><span className="t-out">🤖 正在分析需求意图...</span></div>
              <div className="t-line"><span className="t-out blue">✦ 需求类型：数据分析 + 自动化</span></div>
              <div className="t-line"><span className="t-out blue">✦ 核心技能：Python / SQL / 可视化</span></div>
              <div className="t-line"><span className="t-out blue">✦ 交付形式：定时报告 / Dashboard</span></div>
              <div className="t-line">&nbsp;</div>
              <div className="t-line"><span className="t-out">📊 匹配结果（3 个最优选项）</span></div>
              <div className="t-line"><span className="t-out orange">① DataBot Pro — 匹配度 96% — ¥280/h</span></div>
              <div className="t-line"><span className="t-out orange">② 王数据师  — 匹配度 91% — ¥180/h</span></div>
              <div className="t-line"><span className="t-out orange">③ AutoReport — 匹配度 88% — ¥220/h</span></div>
              <div className="t-line">&nbsp;</div>
              <div className="t-line"><span className="t-prompt">user ›</span><span className="t-cmd">选择第一个，开始下单<span className="t-cursor"></span></span></div>
            </div>
          </div>
        </div>
      </section>

      {/* BILLING */}
      <section className="billing">
        <div className="section-inner">
          <div className="billing-text reveal">
            <div className="eyebrow">实时计费体系</div>
            <h2>每 6 秒<br/>一次精准<span>计费</span></h2>
            <p>告别人工报价模糊、结算争议不断的困境。平台自动记录每一秒工时，生成不可篡改的账单记录，双方随时查阅，完全透明。</p>
          </div>

          <div className="billing-card reveal">
            <div className="billing-header">
              <div className="billing-title-sm">📊 实时账单面板</div>
              <div className="billing-live">
                <div className="live-dot"></div>
                LIVE
              </div>
            </div>
            <div className="billing-body">
              <div style={{fontFamily:'DM Mono', fontSize:'10px',color:'#6b7280',marginBottom:'8px'}}>当前订单累计费用</div>
              <div className="billing-ticker">
                <div className="ticker-num">¥ {ticker.toFixed(2)}</div>
                <div className="ticker-unit">实时计算中</div>
              </div>
              <div className="billing-rows">
                <div className="billing-row">
                  <span className="br-label">服务单价</span>
                  <span className="br-val">¥280 / 小时</span>
                </div>
                <div className="billing-row">
                  <span className="br-label">累计工时</span>
                  <span className="br-val">{workTime}</span>
                </div>
                <div className="billing-row">
                  <span className="br-label">计费状态</span>
                  <span className="br-val green">● 计时中</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-box">
          <div className="cta-inner reveal">
            <div className="eyebrow" style={{justifyContent:'center',marginBottom:'20px'}}>立即开始</div>
            <h2>准备好<span>拥抱</span>人机协作<br/>的新时代了吗？</h2>
            <p>注册无需审核，登录即可与需求分析机器人对话。2,400+ 认证服务，找到你需要的一切。</p>
            <div className="cta-actions">
              <button className="btn-hero"><span>免费注册，立即开始 →</span></button>
              <button className="btn-ghost-hero">浏览服务市场</button>
            </div>
            <div className="cta-hint">注册免费 · 无需信用卡 · 随时注销</div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="nav-logo">
                <div className="logo-mark">⚡</div>
                ChatLite · 机器人技能共享平台
              </div>
              <p>连接客户、自由职业者与机器人的智能服务交易生态系统。以聊天为核心，AI 驱动全流程服务交付。</p>
            </div>
            <div className="footer-col">
              <h4>产品</h4>
              <ul>
                <li><a href="#">服务市场</a></li>
                <li><a href="#">行业解决方案</a></li>
                <li><a href="#">机器人中心</a></li>
                <li><a href="#">定价方案</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>支持</h4>
              <ul>
                <li><a href="#">帮助中心</a></li>
                <li><a href="#">API 文档</a></li>
                <li><a href="#">用户协议</a></li>
                <li><a href="#">隐私政策</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 ChatLite · 机器人技能共享平台 · v1.2</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
