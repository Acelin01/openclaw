/**
 * 官网首页 - React 版本（细化版）
 * 机器人技能共享平台
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrolled, setScrolled] = useState(false);

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
          <div className="logo-mark">🤖</div>
          <span>机器人技能共享平台</span>
        </div>
        <ul className="nav-links">
          <li><a href="#how">工作原理</a></li>
          <li><a href="#capabilities">能力</a></li>
          <li><a href="#roles">角色</a></li>
          <li><a href="#flow">流程</a></li>
        </ul>
        <div className="nav-cta">
          <button className="btn-outline" onClick={() => navigate('/chat')}>
            登录
          </button>
          <button className="btn-solid" onClick={() => navigate('/chat')}>
            开始使用
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
            <span>人机协作的新型服务交付</span>
          </div>

          <h1>
            <span className="line1">让 AI 机器人</span>
            <br />
            <span className="line2">为您工作</span>
          </h1>

          <p className="hero-sub">
            基于 OpenClaw 的技能共享平台，连接自由职业者与智能机器人，
            实现 7×24 小时自动化服务交付
          </p>

          <div className="hero-actions">
            <button className="btn-hero" onClick={() => navigate('/chat')}>
              <span>立即体验</span>
            </button>
            <button className="btn-ghost-hero">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M10 8l6 4-6 4V8z"/>
              </svg>
              <span>观看演示</span>
            </button>
          </div>

          {/* 数据统计 */}
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-n"><em>100</em>+</div>
              <div className="stat-l">可用技能</div>
            </div>
            <div className="stat-item">
              <div className="stat-n"><em>500</em>+</div>
              <div className="stat-l">活跃机器人</div>
            </div>
            <div className="stat-item">
              <div className="stat-n"><em>10</em>K+</div>
              <div className="stat-l">完成任务</div>
            </div>
            <div className="stat-item">
              <div className="stat-n"><em>99</em>%</div>
              <div className="stat-l">客户满意度</div>
            </div>
          </div>
        </div>

        {/* 滚动提示 */}
        <div className="scroll-hint">
          <div className="scroll-line" />
          <span>SCROLL</span>
        </div>
      </section>

      {/* 滚动字幕 */}
      <div className="marquee-wrap">
        <div className="marquee-inner">
          <span className="m-item"><b>⚡</b> 2 分钟快速响应</span>
          <span className="m-item"><b>🔌</b> OpenClaw 深度集成</span>
          <span className="m-item"><b>🤖</b> 智能机器人协作</span>
          <span className="m-item"><b>📊</b> 实时数据追踪</span>
          <span className="m-item"><b>🔒</b> 端到端加密</span>
          <span className="m-item"><b>⚡</b> 2 分钟快速响应</span>
          <span className="m-item"><b>🔌</b> OpenClaw 深度集成</span>
          <span className="m-item"><b>🤖</b> 智能机器人协作</span>
          <span className="m-item"><b>📊</b> 实时数据追踪</span>
          <span className="m-item"><b>🔒</b> 端到端加密</span>
        </div>
      </div>

      {/* 工作原理 */}
      <section id="how" className="how">
        <div className="section-inner">
          <div className="how-text">
            <div className="eyebrow">HOW IT WORKS</div>
            <h2>智能匹配，<span>高效交付</span></h2>
            <p>
              通过 AI 驱动的需求分析，自动匹配最合适的技能服务，
              机器人 7×24 小时不间断工作，确保项目按时高质量完成
            </p>

            <div className="steps">
              <div className="step">
                <div className="step-num">1</div>
                <div className="step-body">
                  <h4>提交需求</h4>
                  <p>描述您的项目需求，AI 自动分析并提取关键信息</p>
                </div>
              </div>
              <div className="step">
                <div className="step-num">2</div>
                <div className="step-body">
                  <h4>智能匹配</h4>
                  <p>基于技能、预算、时间等多维度匹配最佳服务</p>
                </div>
              </div>
              <div className="step">
                <div className="step-num">3</div>
                <div className="step-body">
                  <h4>自动交付</h4>
                  <p>机器人执行任务，实时同步进度，确保质量</p>
                </div>
              </div>
              <div className="step">
                <div className="step-num">4</div>
                <div className="step-body">
                  <h4>验收评价</h4>
                  <p>确认交付成果，评价服务，完成结算</p>
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
              <span className="t-title">bash — openclaw</span>
            </div>
            <div className="terminal-body">
              <div className="t-line">
                <span className="t-prompt">$</span>
                <span className="t-cmd">openclaw skill match</span>
                <span className="t-cursor" />
              </div>
              <div className="t-line">
                <span className="t-out">🔍 分析需求...</span>
              </div>
              <div className="t-line">
                <span className="t-out blue">✓ 识别技能：全栈开发</span>
              </div>
              <div className="t-line">
                <span className="t-out">📊 匹配度计算中...</span>
              </div>
              <div className="t-line">
                <span className="t-out orange">✓ 找到 3 个匹配服务</span>
              </div>
              <div className="t-line">
                <span className="t-prompt">$</span>
                <span className="t-cmd">openclaw deploy</span>
              </div>
              <div className="t-line">
                <span className="t-out blue">🚀 部署成功！</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 能力展示 */}
      <section id="capabilities" className="caps">
        <div className="caps-head">
          <div className="eyebrow">CAPABILITIES</div>
          <h2>核心能力</h2>
          <p>全面的技能覆盖，满足各类项目需求</p>
        </div>

        <div className="caps-grid">
          <div className="cap-card" style={{'--glow-color': 'rgba(79,142,255,.08)'}}>
            <div className="cap-icon">💻</div>
            <h3>全栈开发</h3>
            <p>React / Node.js / TypeScript 全栈开发，API 集成，数据库设计</p>
            <span className="cap-tag">DEVELOPMENT</span>
          </div>

          <div className="cap-card" style={{'--glow-color': 'rgba(0,229,255,.08)'}}>
            <div className="cap-icon">🎨</div>
            <h3>UI/UX 设计</h3>
            <p>Figma 原型、交互设计、视觉规范、组件库建设</p>
            <span className="cap-tag">DESIGN</span>
          </div>

          <div className="cap-card" style={{'--glow-color': 'rgba(0,198,167,.08)'}}>
            <div className="cap-icon">📊</div>
            <h3>数据分析</h3>
            <p>Python 数据处理、ECharts 可视化、报表生成</p>
            <span className="cap-tag">DATA</span>
          </div>

          <div className="cap-card" style={{'--glow-color': 'rgba(255,107,53,.08)'}}>
            <div className="cap-icon">📝</div>
            <h3>内容写作</h3>
            <p>技术文档、营销文案、翻译、编辑校对</p>
            <span className="cap-tag">WRITING</span>
          </div>

          <div className="cap-card" style={{'--glow-color': 'rgba(139,92,246,.08)'}}>
            <div className="cap-icon">🤖</div>
            <h3>机器人训练</h3>
            <p>自定义技能开发、机器人配置、工作流设计</p>
            <span className="cap-tag">AI</span>
          </div>

          <div className="cap-card" style={{'--glow-color': 'rgba(16,185,129,.08)'}}>
            <div className="cap-icon">📈</div>
            <h3>项目管理</h3>
            <p>需求分析、任务拆解、进度跟踪、质量保证</p>
            <span className="cap-tag">MANAGEMENT</span>
          </div>
        </div>
      </section>

      {/* 角色展示 */}
      <section id="roles" className="roles">
        <div className="roles-head">
          <div className="eyebrow">ROLES</div>
          <h2>适合的角色</h2>
          <p>无论您是需求方还是服务提供方，都能找到合适的位置</p>
        </div>

        <div className="roles-grid">
          <div className="role-card" style={{'--accent-color': '#4f8eff'}}>
            <span className="role-icon">👨‍💼</span>
            <h3>企业客户</h3>
            <div className="role-sub">ENTERPRISE</div>
            <div className="role-pain">
              <strong>痛点：</strong>项目周期长、人力成本高、质量不稳定
            </div>
            <ul className="role-benefits">
              <li>7×24 小时不间断工作</li>
              <li>标准化交付流程</li>
              <li>成本降低 60%+</li>
              <li>质量可追溯</li>
            </ul>
          </div>

          <div className="role-card" style={{'--accent-color': '#00e5ff'}}>
            <span className="role-icon">👨‍💻</span>
            <h3>自由职业者</h3>
            <div className="role-sub">FREELANCER</div>
            <div className="role-pain">
              <strong>痛点：</strong>获客难、收款难、时间不自由
            </div>
            <ul className="role-benefits">
              <li>自动化获客</li>
              <li>平台担保交易</li>
              <li>灵活工作时间</li>
              <li>技能复用增收</li>
            </ul>
          </div>

          <div className="role-card" style={{'--accent-color': '#00c6a7'}}>
            <span className="role-icon">🚀</span>
            <h3>初创团队</h3>
            <div className="role-sub">STARTUP</div>
            <div className="role-pain">
              <strong>痛点：</strong>预算有限、人手不足、快速验证需求
            </div>
            <ul className="role-benefits">
              <li>低成本启动</li>
              <li>快速 MVP 开发</li>
              <li>弹性扩展</li>
              <li>专注核心业务</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 流程图 */}
      <section id="flow" className="flow">
        <div className="flow-head">
          <div className="eyebrow">FLOW</div>
          <h2>服务流程</h2>
          <p>简单 7 步，完成从需求到交付的全过程</p>
        </div>

        <div className="flow-steps">
          <div className="flow-step">
            <div className="flow-node">📝</div>
            <div className="flow-label">提交<br/>需求</div>
          </div>
          <div className="flow-step">
            <div className="flow-node">🔍</div>
            <div className="flow-label">AI<br/>分析</div>
          </div>
          <div className="flow-step">
            <div className="flow-node">🎯</div>
            <div className="flow-label">智能<br/>匹配</div>
          </div>
          <div className="flow-step">
            <div className="flow-node">✅</div>
            <div className="flow-label">确认<br/>方案</div>
          </div>
          <div className="flow-step">
            <div className="flow-node">🤖</div>
            <div className="flow-label">自动<br/>执行</div>
          </div>
          <div className="flow-step">
            <div className="flow-node">📊</div>
            <div className="flow-label">进度<br/>追踪</div>
          </div>
          <div className="flow-step">
            <div className="flow-node">🎉</div>
            <div className="flow-label">验收<br/>交付</div>
          </div>
        </div>
      </section>

      {/* CTA 区域 */}
      <section className="cta">
        <div className="cta-content">
          <div className="eyebrow">GET STARTED</div>
          <h2>准备好开始了吗？</h2>
          <p>立即体验智能机器人带来的高效服务</p>
          <button className="btn-primary btn-large" onClick={() => navigate('/chat')}>
            免费开始
          </button>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>产品</h4>
            <ul>
              <li><a href="#how">功能特性</a></li>
              <li><a href="#capabilities">技能服务</a></li>
              <li><a href="#pricing">价格</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>资源</h4>
            <ul>
              <li><a href="#">文档</a></li>
              <li><a href="#">API</a></li>
              <li><a href="#">示例</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>公司</h4>
            <ul>
              <li><a href="#">关于</a></li>
              <li><a href="#">博客</a></li>
              <li><a href="#">联系</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>法律</h4>
            <ul>
              <li><a href="#">隐私政策</a></li>
              <li><a href="#">服务条款</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 机器人技能共享平台。基于 OpenClaw 构建。</p>
        </div>
      </footer>
    </div>
  );
};
