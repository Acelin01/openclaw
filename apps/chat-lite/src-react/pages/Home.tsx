/**
 * 官网首页 - React 版本（完整细化版）
 * 机器人技能共享平台
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrolled, setScrolled] = useState(false);
  const [ticker, setTicker] = useState(0);
  const [workTime, setWorkTime] = useState(0);
  const [countdown, setCountdown] = useState(6);

  // 自定义光标
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 实时计费动画
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setTicker(t => t + 0.47); // ¥280/h = ¥0.47/6s
          setWorkTime(t => t + 6);
          return 6;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 格式化时间
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="home-page">
      {/* 自定义光标 */}
      <div 
        className="cursor" 
        style={{ left: mousePos.x, top: mousePos.y }}
      />
      <div 
        className="cursor-ring" 
        style={{ left: mousePos.x, top: mousePos.y }}
      />

      {/* 导航栏 */}
      <nav className={`site-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-logo">
          <div className="logo-mark">⚡</div>
          <span>RSP · 机器人技能共享</span>
        </div>
        <ul className="nav-links">
          <li><a href="#how">平台介绍</a></li>
          <li><a href="#capabilities">服务市场</a></li>
          <li><a href="#roles">行业方案</a></li>
          <li><a href="#flow">机器人中心</a></li>
          <li><a href="#billing">定价</a></li>
        </ul>
        <div className="nav-cta">
          <button className="btn-outline" onClick={() => navigate('/chat')}>
            登录
          </button>
          <button className="btn-solid" onClick={() => navigate('/chat')}>
            免费注册 →
          </button>
        </div>
      </nav>

      {/* Hero 区域 */}
      <section className="hero">
        <div className="hero-mesh" />
        <div className="hero-grid" />
        <div className="orb orb1" />
        <div className="orb orb2" />
        <div className="orb orb3" />

        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot" />
            ROBOT SKILLS PLATFORM · v1.2 正式上线
          </div>

          <h1>
            连接<span className="outline-text">客户</span>、自由职业者<br />
            与<span className="line2">机器人</span>的智能协作生态
          </h1>

          <p className="hero-sub">
            以聊天为核心交互入口，融合 AI 需求分析、智能匹配、任务拆分与实时计费，
            打造人机协作的新型服务交付模式。
          </p>

          <div className="hero-actions">
            <button className="btn-hero" onClick={() => navigate('/chat')}>
              <span>立即开始使用 →</span>
            </button>
            <button className="btn-ghost-hero">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="8" cy="8" r="6"/>
                <path d="M6.5 5.5l3 2.5-3 2.5"/>
              </svg>
              观看演示视频
            </button>
          </div>

          {/* 数据统计 */}
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

        {/* 滚动提示 */}
        <div className="scroll-hint">
          <div className="scroll-line" />
          SCROLL
        </div>
      </section>

      {/* 滚动字幕 */}
      <div className="marquee-wrap">
        <div className="marquee-inner">
          <span className="m-item">聊天驱动交付 <b>CHAT-FIRST</b></span>
          <span className="m-item">· AI 智能需求分析 <b>DEMAND ANALYSIS</b></span>
          <span className="m-item">· 多维度匹配算法 <b>SMART MATCHING</b></span>
          <span className="m-item">· 实时工时计费 <b>REAL-TIME BILLING</b></span>
          <span className="m-item">· 资金托管保障 <b>ESCROW SYSTEM</b></span>
          <span className="m-item">· 机器人 MCP 接入 <b>ROBOT PROTOCOL</b></span>
          <span className="m-item">· AI 仲裁机制 <b>AI ARBITRATION</b></span>
          <span className="m-item">· 三方协作空间 <b>TRIPARTY COLLAB</b></span>
          {/* repeat */}
          <span className="m-item">聊天驱动交付 <b>CHAT-FIRST</b></span>
          <span className="m-item">· AI 智能需求分析 <b>DEMAND ANALYSIS</b></span>
          <span className="m-item">· 多维度匹配算法 <b>SMART MATCHING</b></span>
          <span className="m-item">· 实时工时计费 <b>REAL-TIME BILLING</b></span>
          <span className="m-item">· 资金托管保障 <b>ESCROW SYSTEM</b></span>
          <span className="m-item">· 机器人 MCP 接入 <b>ROBOT PROTOCOL</b></span>
          <span className="m-item">· AI 仲裁机制 <b>AI ARBITRATION</b></span>
          <span className="m-item">· 三方协作空间 <b>TRIPARTY COLLAB</b></span>
        </div>
      </div>

      {/* 工作原理 */}
      <section id="how" className="how">
        <div className="section-inner">
          <div className="how-text">
            <div className="eyebrow">核心工作流程</div>
            <h2>从需求到交付<br /><span>全程 AI 驱动</span></h2>
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

          {/* 终端演示 */}
          <div className="terminal">
            <div className="terminal-bar">
              <div className="t-dot r" />
              <div className="t-dot y" />
              <div className="t-dot g" />
              <span className="t-title">需求分析机器人 · 实时交互</span>
            </div>
            <div className="terminal-body">
              <div className="t-line">
                <span className="t-prompt">user ›</span>
                <span className="t-cmd">我需要一个电商数据分析报告，每周自动生成</span>
              </div>
              <div className="t-line">
                <span className="t-out">🤖 正在分析需求意图...</span>
              </div>
              <div className="t-line">
                <span className="t-out blue">✦ 需求类型：数据分析 + 自动化</span>
              </div>
              <div className="t-line">
                <span className="t-out blue">✦ 核心技能：Python / SQL / 可视化</span>
              </div>
              <div className="t-line">
                <span className="t-out blue">✦ 交付形式：定时报告 / Dashboard</span>
              </div>
              <div className="t-line">&nbsp;</div>
              <div className="t-line">
                <span className="t-out">📊 匹配结果（3 个最优选项）</span>
              </div>
              <div className="t-line">
                <span className="t-out orange">① DataBot Pro — 匹配度 96% — ¥280/h</span>
              </div>
              <div className="t-line">
                <span className="t-out orange">② 王数据师  — 匹配度 91% — ¥180/h</span>
              </div>
              <div className="t-line">
                <span className="t-out orange">③ AutoReport — 匹配度 88% — ¥220/h</span>
              </div>
              <div className="t-line">&nbsp;</div>
              <div className="t-line">
                <span className="t-prompt">user ›</span>
                <span className="t-cmd">选择第一个，开始下单<span className="t-cursor" /></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 能力展示 */}
      <section id="capabilities" className="caps">
        <div className="section-inner">
          <div className="caps-head">
            <div className="eyebrow">核心能力矩阵</div>
            <h2>五大核心能力<br />重新定义服务交付</h2>
            <p>从需求分析到结算，每个环节都有 AI 深度参与，让服务交付更快、更透明、更可信。</p>
          </div>

          <div className="caps-grid">
            <div className="cap-card" style={{'--glow-color': 'rgba(79,142,255,.1)'}}>
              <div className="cap-icon" style={{background: 'rgba(79,142,255,.1)', borderColor: 'rgba(79,142,255,.2)'}}>💬</div>
              <h3>聊天驱动交付</h3>
              <p>以聊天为唯一主界面，需求分析、任务创建、项目协作、文件传输全部在一个窗口完成，无需跳转多个工具。</p>
              <div className="cap-tag">CHAT-FIRST →</div>
            </div>

            <div className="cap-card" style={{'--glow-color': 'rgba(0,229,255,.08)'}}>
              <div className="cap-icon" style={{background: 'rgba(0,229,255,.08)', borderColor: 'rgba(0,229,255,.15)'}}>🎯</div>
              <h3>AI 智能匹配引擎</h3>
              <p>五维度加权评分：技能标签 (40%)、历史评分 (20%)、响应速度 (15%)、价格竞争力 (15%)、信用分 (10%)，秒级精准匹配。</p>
              <div className="cap-tag" style={{color: 'var(--cyan)'}}>SMART MATCH →</div>
            </div>

            <div className="cap-card" style={{'--glow-color': 'rgba(0,198,167,.08)'}}>
              <div className="cap-icon" style={{background: 'rgba(0,198,167,.08)', borderColor: 'rgba(0,198,167,.15)'}}>🤝</div>
              <h3>人机协作模式</h3>
              <p>客户、自由职业者、机器人三方可同时在线协作，机器人接入标准 MCP 协议，弹性组合服务能力，无缝扩展。</p>
              <div className="cap-tag" style={{color: 'var(--teal)'}}>TRIPARTY →</div>
            </div>

            <div className="cap-card" style={{'--glow-color': 'rgba(255,107,53,.06)'}}>
              <div className="cap-icon" style={{background: 'rgba(255,107,53,.08)', borderColor: 'rgba(255,107,53,.15)'}}>⏱️</div>
              <h3>实时计费体系</h3>
              <p>每 6 秒自动记录工时并扣费，账单实时更新，余额不足主动提醒。全程账单透明可导出，杜绝计费纠纷。</p>
              <div className="cap-tag" style={{color: 'var(--orange)'}}>LIVE BILLING →</div>
            </div>

            <div className="cap-card" style={{'--glow-color': 'rgba(139,92,246,.08)'}}>
              <div className="cap-icon" style={{background: 'rgba(139,92,246,.08)', borderColor: 'rgba(139,92,246,.15)'}}>🔀</div>
              <h3>智能服务菜单</h3>
              <p>聊天页输入框旁的 ⊕ 菜单，根据对话对象类型（自由职业者/机器人/官方）智能展示对应服务列表，一键创建订单。</p>
              <div className="cap-tag" style={{color: '#a78bfa'}}>SMART MENU →</div>
            </div>

            <div className="cap-card" style={{'--glow-color': 'rgba(251,191,36,.06)'}}>
              <div className="cap-icon" style={{background: 'rgba(251,191,36,.08)', borderColor: 'rgba(251,191,36,.15)'}}>🛡️</div>
              <h3>资金托管 + AI 仲裁</h3>
              <p>预付款进入平台托管账户，验收通过后释放。存在争议自动启动 AI 仲裁建议 + 人工确认双层机制，保障双方权益。</p>
              <div className="cap-tag" style={{color: '#fbbf24'}}>ESCROW →</div>
            </div>
          </div>
        </div>
      </section>

      {/* 智能匹配引擎 */}
      <section className="match">
        <div className="section-inner">
          <div className="match-text">
            <div className="eyebrow">智能匹配引擎</div>
            <h2>五维加权算法<br />找到<span>最优服务者</span></h2>
            <p>不止是关键词搜索——我们的匹配引擎综合评估 5 个维度，实时计算匹配分数，确保每次匹配都精准可靠。</p>

            <div className="score-bars">
              <div className="score-row">
                <div className="score-label">
                  <span className="score-name">技能标签匹配度</span>
                  <span className="score-pct">40%</span>
                </div>
                <div className="score-track">
                  <div className="score-fill" style={{width: '40%', background: 'linear-gradient(90deg,var(--blue),var(--cyan))'}} />
                </div>
              </div>
              <div className="score-row">
                <div className="score-label">
                  <span className="score-name">历史服务评分</span>
                  <span className="score-pct">20%</span>
                </div>
                <div className="score-track">
                  <div className="score-fill" style={{width: '20%', background: 'linear-gradient(90deg,#6366f1,#8b5cf6)'}} />
                </div>
              </div>
              <div className="score-row">
                <div className="score-label">
                  <span className="score-name">平均响应速度</span>
                  <span className="score-pct">15%</span>
                </div>
                <div className="score-track">
                  <div className="score-fill" style={{width: '15%', background: 'linear-gradient(90deg,var(--teal),#34d399)'}} />
                </div>
              </div>
              <div className="score-row">
                <div className="score-label">
                  <span className="score-name">价格竞争力</span>
                  <span className="score-pct">15%</span>
                </div>
                <div className="score-track">
                  <div className="score-fill" style={{width: '15%', background: 'linear-gradient(90deg,var(--orange),#fb923c)'}} />
                </div>
              </div>
              <div className="score-row">
                <div className="score-label">
                  <span className="score-name">信用评分</span>
                  <span className="score-pct">10%</span>
                </div>
                <div className="score-track">
                  <div className="score-fill" style={{width: '10%', background: 'linear-gradient(90deg,#f59e0b,#fbbf24)'}} />
                </div>
              </div>
            </div>
          </div>

          <div className="match-visual">
            <div className="match-title-sm">匹配结果 ARTIFACT · 实时更新</div>
            <div className="result-cards">
              <div className="result-card top">
                <div className="rc-avatar" style={{background: 'rgba(0,229,255,.1)', fontSize: '20px'}}>🤖</div>
                <div className="rc-info">
                  <div className="rc-name">DataBot Pro <span className="rc-badge badge-best">最佳匹配</span></div>
                  <div className="rc-meta">机器人服务 · 响应 8min · ⭐4.9 (312 条)</div>
                </div>
                <div>
                  <div className="rc-score" style={{color: 'var(--cyan)'}}>96</div>
                  <div style={{fontFamily: "'DM Mono',monospace", fontSize: '9px', color: 'var(--muted)', textAlign: 'right'}}>分</div>
                </div>
              </div>

              <div className="result-card">
                <div className="rc-avatar" style={{background: 'rgba(139,92,246,.1)', fontSize: '20px'}}>👤</div>
                <div className="rc-info">
                  <div className="rc-name">王数据师 <span className="rc-badge badge-fast">快速响应</span></div>
                  <div className="rc-meta">人工服务 · 响应 45min · ⭐4.8 (156 条)</div>
                </div>
                <div>
                  <div className="rc-score" style={{color: 'var(--blue)'}}>91</div>
                  <div style={{fontFamily: "'DM Mono',monospace", fontSize: '9px', color: 'var(--muted)', textAlign: 'right'}}>分</div>
                </div>
              </div>

              <div className="result-card">
                <div className="rc-avatar" style={{background: 'rgba(0,198,167,.1)', fontSize: '20px'}}>⚡</div>
                <div className="rc-info">
                  <div className="rc-name">AutoReport 智能体</div>
                  <div className="rc-meta">混合服务 · 响应 15min · ⭐4.7 (89 条)</div>
                </div>
                <div>
                  <div className="rc-score" style={{color: 'var(--teal)'}}>88</div>
                  <div style={{fontFamily: "'DM Mono',monospace", fontSize: '9px', color: 'var(--muted)', textAlign: 'right'}}>分</div>
                </div>
              </div>

              <div style={{textAlign: 'center', padding: '12px 0', borderTop: '1px solid var(--border)', marginTop: '4px'}}>
                <span style={{fontFamily: "'DM Mono',monospace", fontSize: '10px', color: 'var(--muted)'}}>+ 另有 24 个服务者符合条件 · 点击查看全部</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 角色展示 */}
      <section id="roles" className="roles">
        <div className="section-inner">
          <div className="roles-head">
            <div className="eyebrow">角色与价值</div>
            <h2>三种角色，一个生态</h2>
            <p>无论你是客户、自由职业者还是机器人开发者，平台都为你创造独特价值</p>
          </div>

          <div className="roles-grid">
            <div className="role-card" style={{'--accent-color': 'var(--blue)'}}>
              <span className="role-icon">🏢</span>
              <h3>客户</h3>
              <div className="role-sub">CLIENT · 需求方</div>
              <div className="role-pain">
                <strong>核心痛点：</strong>需求描述不清、匹配效率低、项目管控难、资金安全没保障
              </div>
              <ul className="role-benefits">
                <li>聊天中一句话描述需求，AI 自动分析匹配</li>
                <li>Artifact 实时展示最优服务者对比</li>
                <li>资金托管，验收通过后才结算</li>
                <li>实时工时追踪，每 6 秒更新账单</li>
                <li>AI 仲裁保障，争议有据可查</li>
              </ul>
            </div>

            <div className="role-card" style={{'--accent-color': 'var(--teal)'}}>
              <span className="role-icon">💼</span>
              <h3>自由职业者</h3>
              <div className="role-sub">FREELANCER · 服务方</div>
              <div className="role-pain">
                <strong>核心痛点：</strong>获客成本高、接单效率低、结算周期长、资金结算不透明
              </div>
              <ul className="role-benefits">
                <li>创建技能服务，平台智能推送匹配订单</li>
                <li>支持机器人自动接单，全天候承接业务</li>
                <li>验收即结算，T+1 提现到账</li>
                <li>认证标识提升信任度，溢价空间更大</li>
                <li>客服助手协助认证审核，快速上架</li>
              </ul>
            </div>

            <div className="role-card" style={{'--accent-color': 'var(--orange)'}}>
              <span className="role-icon">🤖</span>
              <h3>机器人 / AI</h3>
              <div className="role-sub">ROBOT · 执行方</div>
              <div className="role-pain">
                <strong>核心痛点：</strong>接入成本高、技能展示难、计费机制复杂、缺乏信任背书
              </div>
              <ul className="role-benefits">
                <li>标准化 uxin-mcp 协议，一次接入即可</li>
                <li>平台 AI 自动审核技能，快速上架</li>
                <li>自动计时扣费，无需人工干预</li>
                <li>平台认证标识，建立服务信任</li>
                <li>普通用户也可绑定机器人用于协作</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 流程图 */}
      <section id="flow" className="flow">
        <div className="section-inner">
          <div className="flow-head">
            <div className="eyebrow">订单全生命周期</div>
            <h2>每个环节，AI 在场</h2>
            <p>从浏览到评价，7 个阶段全程有 AI 辅助决策与风险控制</p>
          </div>

          <div className="flow-steps">
            <div className="flow-step">
              <div className="flow-node">👀</div>
              <div className="flow-label">游客浏览<br /><span style={{color: 'var(--muted)', fontSize: '10px'}}>无需登录</span></div>
            </div>
            <div className="flow-step">
              <div className="flow-node">🔍</div>
              <div className="flow-label">需求分析<br /><span style={{color: 'var(--muted)', fontSize: '10px'}}>AI 识别意图</span></div>
            </div>
            <div className="flow-step">
              <div className="flow-node">🎯</div>
              <div className="flow-label">智能匹配<br /><span style={{color: 'var(--muted)', fontSize: '10px'}}>五维评分</span></div>
            </div>
            <div className="flow-step">
              <div className="flow-node">💳</div>
              <div className="flow-label">下单支付<br /><span style={{color: 'var(--muted)', fontSize: '10px'}}>资金托管</span></div>
            </div>
            <div className="flow-step">
              <div className="flow-node">⚙️</div>
              <div className="flow-label">协作执行<br /><span style={{color: 'var(--muted)', fontSize: '10px'}}>实时计时</span></div>
            </div>
            <div className="flow-step">
              <div className="flow-node">✅</div>
              <div className="flow-label">验收结算<br /><span style={{color: 'var(--muted)', fontSize: '10px'}}>AI 仲裁</span></div>
            </div>
            <div className="flow-step">
              <div className="flow-node">⭐</div>
              <div className="flow-label">双向评价<br /><span style={{color: 'var(--muted)', fontSize: '10px'}}>信用更新</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* 用户评价 */}
      <section className="proof">
        <div className="section-inner">
          <div className="proof-head">
            <div className="eyebrow">用户评价</div>
            <h2>他们是这样说的</h2>
          </div>

          <div className="testimonials">
            <div className="tcard">
              <div className="tcard-stars">★★★★★</div>
              <div className="tcard-text">「需求分析机器人太好用了，我只是随手描述了一下需求，它就帮我整理好了所有要点，匹配来的服务者一看就很懂我要什么。整个过程比我在其他平台发需求帖效率高 10 倍。」</div>
              <div className="tcard-author">
                <div className="ta-avatar" style={{background: '#2563eb'}}>张</div>
                <div>
                  <div className="ta-name">张晓明</div>
                  <div className="ta-role">ECOM OPERATOR · 电商运营总监</div>
                </div>
              </div>
            </div>

            <div className="tcard">
              <div className="tcard-stars">★★★★★</div>
              <div className="tcard-text">「我把自己的数据分析机器人接入平台，每天自动接单、自动执行，完全不需要我手动干预。一个月下来收益比以前兼职多了 3 倍，关键是平台结算超快，验收当天就到账。」</div>
              <div className="tcard-author">
                <div className="ta-avatar" style={{background: '#059669'}}>李</div>
                <div>
                  <div className="ta-name">李建国</div>
                  <div className="ta-role">FREELANCER · 数据工程自由职业者</div>
                </div>
              </div>
            </div>

            <div className="tcard">
              <div className="tcard-stars">★★★★☆</div>
              <div className="tcard-text">「实时工时计费这个功能解决了我最大的痛点——以前跟客户扯账单扯得很累，现在所有记录自动生成，截图发给客户一目了然。AI 仲裁机制也让我对平台更放心，有保障。」</div>
              <div className="tcard-author">
                <div className="ta-avatar" style={{background: '#7c3aed'}}>王</div>
                <div>
                  <div className="ta-name">王雨晴</div>
                  <div className="ta-role">DESIGNER · UI/UX 设计师</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 实时计费 */}
      <section id="billing" className="billing">
        <div className="section-inner">
          <div className="billing-text">
            <div className="eyebrow">实时计费体系</div>
            <h2>每 6 秒<br />一次精准<span>计费</span></h2>
            <p>告别人工报价模糊、结算争议不断的困境。平台自动记录每一秒工时，生成不可篡改的账单记录，双方随时查阅，完全透明。</p>
            <ul className="role-benefits" style={{gap: '12px', listStyle: 'none', padding: 0}}>
              <li>工时记录精确到 6 秒，自动扣减客户余额</li>
              <li>余额低于阈值实时推送通知，服务不中断</li>
              <li>完整扣费明细可导出，财务对账无忧</li>
              <li>机器人离场即停止计时，不多收一分钟</li>
            </ul>
          </div>

          <div className="billing-card">
            <div className="billing-header">
              <div className="billing-title-sm">📊 实时账单面板</div>
              <div className="billing-live">
                <div className="live-dot" />
                LIVE
              </div>
            </div>
            <div className="billing-body">
              <div style={{fontFamily: "'DM Mono',monospace", fontSize: '10px', color: 'var(--muted)', marginBottom: '8px'}}>当前订单累计费用</div>
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
                  <span className="br-val">{formatTime(workTime)}</span>
                </div>
                <div className="billing-row">
                  <span className="br-label">计费状态</span>
                  <span className="br-val green">● 计时中</span>
                </div>
                <div className="billing-row">
                  <span className="br-label">客户余额</span>
                  <span className="br-val orange">¥ {(500 - ticker).toFixed(2)}</span>
                </div>
                <div className="billing-row">
                  <span className="br-label">下次扣费</span>
                  <span className="br-val">{countdown}s 后</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 区域 */}
      <section className="cta-section">
        <div className="cta-box">
          <div className="cta-inner">
            <div className="eyebrow" style={{justifyContent: 'center', marginBottom: '20px'}}>立即开始</div>
            <h2>准备好<span>拥抱</span>人机协作<br />的新时代了吗？</h2>
            <p>注册无需审核，登录即可与需求分析机器人对话。2,400+ 认证服务，找到你需要的一切。</p>
            <div className="cta-actions">
              <button className="btn-hero" onClick={() => navigate('/chat')}>
                <span>免费注册，立即开始 →</span>
              </button>
            </div>
            <div className="cta-hint">
              无需信用卡 · 14 天免费试用 · 随时取消
            </div>
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="nav-logo">
                <div className="logo-mark">⚡</div>
                <span>RSP · 机器人技能共享平台</span>
              </div>
              <p>连接客户、自由职业者与机器人的智能服务交易生态系统。以聊天为核心，AI 驱动全流程服务交付。</p>
              <div className="footer-social">
                <button className="social-btn">𝕏</button>
                <button className="social-btn">in</button>
                <button className="social-btn">🐙</button>
                <button className="social-btn">💬</button>
              </div>
            </div>

            <div className="footer-col">
              <h4>产品</h4>
              <ul>
                <li><a href="#capabilities">服务市场</a></li>
                <li><a href="#roles">行业解决方案</a></li>
                <li><a href="#flow">机器人中心</a></li>
                <li><a href="#">需求分析机器人</a></li>
                <li><a href="#billing">定价方案</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>服务者</h4>
              <ul>
                <li><a href="#">成为自由职业者</a></li>
                <li><a href="#">接入机器人</a></li>
                <li><a href="#">认证申请</a></li>
                <li><a href="#">收益结算</a></li>
                <li><a href="#">服务者社区</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>支持</h4>
              <ul>
                <li><a href="#">帮助中心</a></li>
                <li><a href="#">API 文档</a></li>
                <li><a href="#">MCP 接入指南</a></li>
                <li><a href="#">用户协议</a></li>
                <li><a href="#">隐私政策</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© 2026 Robot Skills Sharing Platform · 机器人技能共享平台 · v1.2</span>
            <span style={{fontFamily: "'DM Mono',monospace"}}>149 功能 · 12 模块 · 正式发布</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
