/**
 * 机器人管理页面 - React 版本（完全匹配文档）
 * Cyberpunk Terminal 风格 · 包含所有 F07 功能模块
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RobotManage.css';

interface Robot {
  id: string;
  name: string;
  model: string;
  botId: string;
  status: 'online' | 'offline' | 'executing';
  skills: string[];
  avatar: string;
  certified: boolean;
  autoAccept: boolean;
  type: 'freelance' | 'personal';
  token: string;
  tokenExpired: boolean;
  workload: { current: string; earnings: string; month: string };
}

interface Project {
  id: string;
  name: string;
  sub: string;
  icon: string;
  bound: boolean;
}

interface CertStep {
  title: string;
  desc: string;
  icon: string;
  status: 'done' | 'active' | 'pending';
}

export const RobotManage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRobot, setSelectedRobot] = useState<string>('1');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [userType, setUserType] = useState<'freelance' | 'personal'>('freelance');

  const [robots] = useState<Robot[]>([
    {
      id: '1',
      name: 'DataBot',
      model: 'OpenClaw v2.1',
      botId: 'BOT-0042',
      status: 'executing',
      skills: ['React', 'TypeScript', 'API 集成', '数据可视化'],
      avatar: '⚡',
      certified: true,
      autoAccept: true,
      type: 'freelance',
      token: 'uxin_tok_••••••••••••••••••••4f8e',
      tokenExpired: false,
      workload: { current: '02:14', earnings: '¥268', month: '128h' },
    },
    {
      id: '2',
      name: 'DesignBot',
      model: 'OpenClaw v1.8',
      botId: 'BOT-0071',
      status: 'online',
      skills: ['Figma', 'UI 设计', '品牌 VI'],
      avatar: '🎨',
      certified: true,
      autoAccept: false,
      type: 'freelance',
      token: 'uxin_tok_••••••••••••••••••••8b2a',
      tokenExpired: false,
      workload: { current: '00:00', earnings: '¥0', month: '42h' },
    },
    {
      id: '3',
      name: 'AssistBot',
      model: 'OpenClaw v1.5',
      botId: 'BOT-0103',
      status: 'offline',
      skills: ['文档整理', '日程管理', '邮件助手'],
      avatar: '🛠',
      certified: false,
      autoAccept: false,
      type: 'personal',
      token: 'uxin_tok_••••••••••••••••••••[过期]',
      tokenExpired: true,
      workload: { current: '-', earnings: '-', month: '-' },
    },
  ]);

  const [projects] = useState<Project[]>([
    { id: '1', name: '机器人后台开发', sub: 'DataBot · 计时中 · 02:14', icon: '💻', bound: true },
    { id: '2', name: 'UI 设计项目', sub: '无机器人 · 与李晓梅', icon: '🎨', bound: false },
    { id: '3', name: '数据分析任务', sub: '无机器人 · 个人项目', icon: '📊', bound: false },
  ]);

  const [certSteps] = useState<CertStep[]>([
    { title: '提交技能描述', desc: 'DataBot 已提交 · React 全栈开发、数据可视化等 4 项技能', icon: '✅', status: 'done' },
    { title: 'AI 审核技能质量', desc: '全部通过 · 匹配准确率 94%', icon: '🤖', status: 'done' },
    { title: '服务上架至市场 · F07-12', desc: '已上架「全栈开发智能助手」· 升级版 ¥120/h', icon: '🚀', status: 'active' },
    { title: 'DesignBot · 待审核技能 ×2', desc: '交互动效、品牌 VI · 预计 2-4 小时完成', icon: '⏳', status: 'pending' },
  ]);

  const selectedRobotData = robots.find(r => r.id === selectedRobot);

  // 工时计时器
  useEffect(() => {
    const timer = setInterval(() => {
      // 模拟工时更新
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyToken = () => {
    alert('Token 已复制到剪贴板');
  };

  const handleRegenToken = (name: string) => {
    alert(`${name} Token 已重新生成并同步`);
  };

  const handleUnbind = (name: string) => {
    if (confirm(`确认解绑 ${name}？`)) {
      alert(`${name} 已解绑`);
    }
  };

  const handleBindProject = (projName: string) => {
    alert(`已拉入机器人到 ${projName}`);
  };

  return (
    <div className="robot-manage-page">
      {/* 顶部栏 */}
      <nav className="topbar">
        <div className="logo">
          <div className="logo-hex">🤖</div>
          <div>
            <div className="logo-name">SkillHub</div>
            <div className="logo-sub">ROBOT CONTROL</div>
          </div>
        </div>
        <span className="nav-link" onClick={() => navigate('/skills')}>工作台</span>
        <span className="nav-link" onClick={() => navigate('/skills')}>技能服务</span>
        <span className="nav-link" onClick={() => navigate('/chat')}>订单管理</span>
        <span className="nav-link active">机器人管理</span>
        <span className="nav-link">收益结算</span>

        <div className="topbar-right">
          <div className="sys-status">
            <div className="pulse-dot" />
            SYS ONLINE · 3 BOTS
          </div>
          <button className="icon-btn" title="消息">
            <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.7">
              <path d="M3 3h10a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H5l-3 2V4a1 1 0 0 1 1-1Z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="icon-btn" title="通知">
            <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.7">
              <path d="M8 2a5.5 5.5 0 0 0-5.5 5.5v2L1 11.5h14l-1.5-2v-2A5.5 5.5 0 0 0 8 2Z" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6.5 13.5a1.5 1.5 0 0 0 3 0" strokeLinecap="round"/>
            </svg>
          </button>
          <div className="user-avatar">陈</div>
        </div>
      </nav>

      {/* 页面主体 */}
      <div className="page">
        {/* 页面头部 */}
        <div className="page-header">
          <div className="page-title-block">
            <div className="page-eyebrow">M07 · Robot Management</div>
            <div className="page-title">
              <span className="page-title-glow">机器人管理</span>
            </div>
            <div className="page-sub">F07-01 至 F07-12 · 12 个功能模块 · 管理、绑定、认证、监控所有 OpenClaw 机器人</div>
          </div>
          <div className="page-actions">
            <button className="btn btn-ghost">
              <svg fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.8" width="12" height="12">
                <path d="M12 7A5 5 0 1 1 7 2" strokeLinecap="round"/>
                <path d="M7 2l2 2-2 2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              刷新状态
            </button>
            <button className="btn btn-teal" onClick={() => setDrawerOpen(true)}>
              <svg fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="2" width="12" height="12">
                <path d="M7 2v10M2 7h10" strokeLinecap="round"/>
              </svg>
              绑定新机器人
            </button>
          </div>
        </div>

        {/* HUD 数据条 */}
        <div className="hud-strip">
          <div className="hud-cell">
            <div className="hud-label">
              <svg fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.8">
                <rect x="1" y="3" width="10" height="7" rx="1.5"/>
                <path d="M4 3V2a2 2 0 0 1 4 0v1" strokeLinecap="round"/>
              </svg>
              总机器人数
            </div>
            <div className="hud-val teal">3</div>
            <div className="hud-sub"><span className="up">+1</span> 本月新增</div>
          </div>

          <div className="hud-cell">
            <div className="hud-label">
              <svg fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.8">
                <circle cx="6" cy="6" r="4.5"/>
                <circle cx="6" cy="6" r="1.5" fill="currentColor"/>
              </svg>
              在线运行
            </div>
            <div className="hud-val green">2</div>
            <div className="hud-sub">实时同步 F07-08</div>
          </div>

          <div className="hud-cell">
            <div className="hud-label">
              <svg fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.8">
                <circle cx="6" cy="6" r="4.5"/>
                <path d="M6 3.5v3l2 1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              本月工时
            </div>
            <div className="hud-val teal">128h</div>
            <div className="hud-sub">F07-06 自动计时</div>
          </div>

          <div className="hud-cell">
            <div className="hud-label">
              <svg fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.8">
                <path d="M2 9.5l3-3 2.5 2 3.5-4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              执行任务
            </div>
            <div className="hud-val amber">47</div>
            <div className="hud-sub">F07-07 本月累计</div>
          </div>

          <div className="hud-cell">
            <div className="hud-label">
              <svg fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 1l1.1 3.3H11L8.4 6.4l1.1 3.3-3-2.2-3 2.2L4.6 6.4 2 4.3h3.4Z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              已认证技能
            </div>
            <div className="hud-val violet">12</div>
            <div className="hud-sub">F07-04 AI 审核通过</div>
          </div>
        </div>

        {/* 主内容区 */}
        <div className="main-grid">
          {/* 左侧：机器人列表 */}
          <div className="robot-list-panel">
            <div className="panel-header">
              <div className="panel-header-title">
                <svg fill="none" viewBox="0 0 13 13" stroke="currentColor" strokeWidth="1.8">
                  <rect x="2" y="4" width="9" height="7" rx="1.5"/>
                  <path d="M4.5 4V3a2 2 0 0 1 4 0v1" strokeLinecap="round"/>
                  <circle cx="5" cy="7.5" r=".8" fill="currentColor"/>
                  <circle cx="8" cy="7.5" r=".8" fill="currentColor"/>
                </svg>
                我的机器人 F07-09
              </div>
              <span className="live-badge">● LIVE SYNC</span>
              <button className="btn btn-ghost" style={{fontSize:'11px',padding:'5px 10px'}}>批量管理</button>
            </div>

            {/* 筛选 */}
            <div className="filter-row">
              <div className="search-box">
                <svg fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="6" cy="6" r="4.5"/>
                  <path d="m11 11 2.5 2.5" strokeLinecap="round"/>
                </svg>
                <input placeholder="搜索机器人名称或技能标签..." />
              </div>
              <button className="filter-chip active">全部</button>
              <button className="filter-chip">在线</button>
              <button className="filter-chip">服务者</button>
              <button className="filter-chip">个人</button>
            </div>

            {/* 机器人卡片 */}
            <div className="robot-grid">
              {robots.map(robot => (
                <div
                  key={robot.id}
                  className={`robot-card ${selectedRobot === robot.id ? 'selected' : ''}`}
                  onClick={() => setSelectedRobot(robot.id)}
                >
                  <div className="robot-card-glow" />
                  
                  <div className="rc-header">
                    <div className="rc-avatar" style={robot.status === 'offline' ? {opacity: 0.6} : {}}>
                      {robot.avatar}
                      <div className={`rc-status ${robot.status}`} />
                    </div>
                    <div className="rc-info">
                      <div className="rc-name" style={robot.status === 'offline' ? {opacity: 0.7} : {}}>
                        {robot.name}
                        <span className={`status-label sl-${robot.status}`}>{robot.status === 'online' ? '在线' : robot.status === 'offline' ? '离线' : '执行中'}</span>
                      </div>
                      <div className="rc-model">{robot.model} · ID: {robot.botId}</div>
                      <div className="rc-badges">
                        {robot.certified && <span className="badge badge-certified">认证</span>}
                        {robot.autoAccept && <span className="badge badge-auto">自动接单</span>}
                        {robot.type === 'freelance' && <span className="badge badge-freelance">服务上架</span>}
                        {robot.type === 'personal' && <span className="badge badge-personal">个人协作</span>}
                      </div>
                    </div>
                  </div>

                  <div className="rc-body">
                    <div className="rc-skills">
                      {robot.skills.map((skill, i) => (
                        <span key={i} className="skill-tag">{skill}</span>
                      ))}
                    </div>

                    {robot.tokenExpired ? (
                      <div className="token-expired-notice">
                        <svg fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.7" width="11" height="11">
                          <circle cx="6" cy="6" r="4.5"/>
                          <path d="M6 3.5v3.5M6 8.5v.5" strokeLinecap="round"/>
                        </svg>
                        Token 已过期 · 需重新同步 F07-03
                      </div>
                    ) : (
                      <div className="rc-wl">
                        <div className="rc-wl-cell">
                          <div className="rc-wl-val">{robot.workload.current}</div>
                          <div className="rc-wl-key">当前工时</div>
                        </div>
                        <div className="rc-wl-cell">
                          <div className="rc-wl-val">{robot.workload.earnings}</div>
                          <div className="rc-wl-key">本次收益</div>
                        </div>
                        <div className="rc-wl-cell">
                          <div className="rc-wl-val">{robot.workload.month}</div>
                          <div className="rc-wl-key">月累计</div>
                        </div>
                      </div>
                    )}

                    <div className="rc-token" style={robot.tokenExpired ? {opacity: 0.5} : {}}>
                      <div className="rc-token-val">{robot.token}</div>
                      <button className="rc-token-copy" onClick={(e) => { e.stopPropagation(); handleCopyToken(); }}>
                        <svg fill="none" viewBox="0 0 11 11" stroke="currentColor" strokeWidth="1.7" width="10" height="10">
                          <rect x="3" y="3" width="6.5" height="7.5" rx="1"/>
                          <path d="M1 8V1.5a1 1 0 0 1 1-1H7" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="rc-footer">
                    <button className="btn btn-outline" style={{fontSize:'11px'}} onClick={(e) => { e.stopPropagation(); alert('详情'); }}>详情</button>
                    <button className="btn btn-ghost" style={{fontSize:'11px'}} onClick={(e) => { e.stopPropagation(); alert('拉入项目'); }}>
                      <svg fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.7" width="10" height="10">
                        <path d="M6 2v8M2 6h8" strokeLinecap="round"/>
                      </svg>
                      拉入项目
                    </button>
                    {robot.tokenExpired ? (
                      <button className="btn btn-teal" style={{fontSize:'11px'}} onClick={(e) => { e.stopPropagation(); handleRegenToken(robot.name); }}>
                        <svg fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.7" width="10" height="10">
                          <path d="M10 6A4 4 0 1 1 6 2" strokeLinecap="round"/>
                          <path d="M6 2l1.5 1.5L6 5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        重新同步
                      </button>
                    ) : (
                      <button className="btn btn-danger" style={{fontSize:'11px'}} onClick={(e) => { e.stopPropagation(); handleUnbind(robot.name); }}>解绑</button>
                    )}
                  </div>
                </div>
              ))}

              {/* 添加新机器人卡片 */}
              <div
                className="add-robot-card"
                onClick={() => setDrawerOpen(true)}
              >
                <div className="add-robot-icon">
                  <svg fill="none" viewBox="0 0 18 18" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
                    <path d="M9 3v12M3 9h12" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="add-robot-text">
                  <div className="add-robot-title">绑定新机器人</div>
                  <div className="add-robot-sub">F07-01 · 支持所有用户</div>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧面板 */}
          <div className="right-panel">
            {/* Token 面板 */}
            <div className="token-panel">
              <div className="panel-header">
                <div className="panel-header-title">
                  <svg fill="none" viewBox="0 0 13 13" stroke="currentColor" strokeWidth="1.8">
                    <rect x="1.5" y="4" width="10" height="7.5" rx="1.5"/>
                    <path d="M4 4V3a2.5 2.5 0 0 1 5 0v1" strokeLinecap="round"/>
                    <circle cx="6.5" cy="7.5" r="1" fill="currentColor"/>
                    <path d="M6.5 8.5v1.5" strokeLinecap="round"/>
                  </svg>
                  Token 管理 · F07-02/03
                </div>
              </div>
              <div className="token-display-large">
                <div className="token-val-large">
                  uxin_tok_7f3a91bc2d5e8f4a1093dc6b<br/>
                  e720f8459ab1cd3082ef56a74b9c
                </div>
              </div>
              <div className="sync-status">
                <div className="sync-icon">✅</div>
                <div className="sync-text">{selectedRobotData?.name || 'DataBot'} · Token 已同步</div>
                <div className="sync-time">3 秒前</div>
              </div>
              <div className="token-actions">
                <button className="btn btn-outline" style={{fontSize:'11.5px'}} onClick={handleCopyToken}>
                  <svg fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.7" width="11" height="11">
                    <rect x="3" y="3" width="7.5" height="8.5" rx="1"/>
                    <path d="M1 9V1.5a1 1 0 0 1 1-1H9" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  复制 Token
                </button>
                <button className="btn btn-teal" style={{fontSize:'11.5px'}} onClick={() => handleRegenToken(selectedRobotData?.name || 'DataBot')}>
                  <svg fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.7" width="11" height="11">
                    <path d="M10 6A4 4 0 1 1 6 2" strokeLinecap="round"/>
                    <path d="M6 2l1.5 1.5L6 5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  重新生成
                </button>
                <button className="btn btn-danger" style={{fontSize:'11.5px'}} onClick={() => alert('Token 已吊销')}>
                  <svg fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.7" width="11" height="11">
                    <circle cx="6" cy="6" r="4.5"/>
                    <path d="M4 4l4 4M8 4l-4 4" strokeLinecap="round"/>
                  </svg>
                  吊销
                </button>
              </div>
            </div>

            {/* 项目绑定 */}
            <div className="project-bind">
              <div className="panel-header">
                <div className="panel-header-title">
                  <svg fill="none" viewBox="0 0 13 13" stroke="currentColor" strokeWidth="1.8">
                    <path d="M2 7.5 6.5 3 11 7.5M4 10V7.5h2V10H4Zm4-2.5v2h2V7.5H8Z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  项目绑定 · F07-05
                </div>
                <button className="btn btn-ghost" style={{fontSize:'11px',padding:'4px 9px'}}>+ 新建</button>
              </div>
              <div className="project-list">
                {projects.map(proj => (
                  <div
                    key={proj.id}
                    className={`proj-item ${proj.bound ? 'bound' : ''}`}
                    onClick={() => !proj.bound && handleBindProject(proj.name)}
                  >
                    <div className="proj-icon" style={{background: proj.bound ? 'rgba(0,229,204,0.1)' : 'rgba(167,139,250,0.1)'}}>{proj.icon}</div>
                    <div className="proj-info">
                      <div className="proj-name">{proj.name}</div>
                      <div className="proj-sub">{proj.sub}</div>
                    </div>
                    <div className="proj-action" style={{color: proj.bound ? 'var(--green)' : 'var(--teal2)'}}>
                      {proj.bound ? '已绑定' : '拉入 →'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 技能认证 */}
            <div className="cert-panel">
              <div className="panel-header">
                <div className="panel-header-title">
                  <svg fill="none" viewBox="0 0 13 13" stroke="currentColor" strokeWidth="1.8">
                    <path d="M6.5 1l1.1 3.3H11L8.4 6.4l1.1 3.3-3-2.2-3 2.2L4.6 6.4 2 4.3h3.4Z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  技能认证 · F07-04/12
                </div>
                <button className="btn btn-ghost" style={{fontSize:'11px',padding:'4px 9px'}}>申请认证</button>
              </div>
              <div className="cert-steps">
                {certSteps.map((step, i) => (
                  <div key={i} className={`cert-step ${step.status}`} onClick={step.status === 'pending' ? () => alert('技能待认证') : undefined}>
                    <div className={`cs-icon ${step.status}`}>{step.icon}</div>
                    <div className="cs-info">
                      <div className="cs-title">{step.title}</div>
                      <div className="cs-desc">{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 绑定机器人抽屉 */}
      {drawerOpen && (
        <>
          <div className="drawer-overlay open" onClick={() => setDrawerOpen(false)} />
          <div className={`drawer ${drawerOpen ? 'open' : ''}`}>
            <div className="drawer-header">
              <div>
                <div className="drawer-title">绑定新机器人</div>
                <div className="drawer-sub">F07-01 · 支持所有用户类型 · 完成后自动生成 Token</div>
              </div>
              <button className="icon-btn" onClick={() => setDrawerOpen(false)}>
                <svg fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="2" width="14" height="14">
                  <path d="M2 2l10 10M12 2 2 12" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <div className="drawer-body">
              {/* Wizard 步骤 */}
              <div className="wizard-steps">
                <div className={`ws ${wizardStep >= 1 ? 'done' : ''} ${wizardStep === 1 ? 'active' : ''}`} onClick={() => setWizardStep(1)}>
                  <div className="ws-num">1</div>
                  基础配置
                </div>
                <div className={`ws ${wizardStep >= 2 ? 'done' : ''} ${wizardStep === 2 ? 'active' : ''}`} onClick={() => setWizardStep(2)}>
                  <div className="ws-num">2</div>
                  Token 同步
                </div>
                <div className={`ws ${wizardStep >= 3 ? 'done' : ''} ${wizardStep === 3 ? 'active' : ''}`} onClick={() => setWizardStep(3)}>
                  <div className="ws-num">3</div>
                  技能配置
                </div>
                <div className={`ws ${wizardStep >= 4 ? 'done' : ''} ${wizardStep === 4 ? 'active' : ''}`} onClick={() => setWizardStep(4)}>
                  <div className="ws-num">4</div>
                  服务上架
                </div>
              </div>

              {/* 步骤 1：基础配置 */}
              {wizardStep === 1 && (
                <>
                  <div className="section-title">
                    <svg fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.8">
                      <path d="M6 7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM2 10.5a4 4 0 0 1 8 0" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    绑定用户类型 · F07-11
                  </div>
                  <div className="type-selector">
                    <div className={`type-opt ${userType === 'freelance' ? 'selected' : ''}`} onClick={() => setUserType('freelance')}>
                      <span className="type-opt-icon">🏢</span>
                      <div className="type-opt-name">自由职业者</div>
                      <div className="type-opt-sub">可上架服务市场</div>
                    </div>
                    <div className={`type-opt ${userType === 'personal' ? 'selected' : ''}`} onClick={() => setUserType('personal')}>
                      <span className="type-opt-icon">👤</span>
                      <div className="type-opt-name">普通用户</div>
                      <div className="type-opt-sub">个人协作使用</div>
                    </div>
                  </div>

                  <div className="section-title">
                    <svg fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.8">
                      <rect x="1.5" y="3" width="9" height="7" rx="1.5"/>
                      <path d="M4 3V2a2 2 0 0 1 4 0v1" strokeLinecap="round"/>
                      <circle cx="4.5" cy="6.5" r=".7" fill="currentColor"/>
                      <circle cx="7.5" cy="6.5" r=".7" fill="currentColor"/>
                    </svg>
                    机器人基本信息
                  </div>

                  <div className="form-group">
                    <div className="label">机器人名称 <span style={{color:'var(--red)'}}>*</span></div>
                    <input className="input" placeholder="例：DataBot · 我的 AI 助手" />
                  </div>
                  <div className="form-group">
                    <div className="label">OpenClaw 接入端点 <span style={{color:'var(--red)'}}>*</span></div>
                    <input className="input input-mono" placeholder="wss://your-bot.openclaw.io/api" />
                    <div style={{fontSize:'11px',color:'var(--text3)',marginTop:'3px'}}>WebSocket 协议端点，用于建立安全通信</div>
                  </div>
                  <div className="form-group">
                    <div className="label">机器人版本</div>
                    <input className="input input-mono" placeholder="v1.0.0" defaultValue="v2.1.0" />
                  </div>
                  <div className="form-group">
                    <div className="label">描述 <span className="opt">（可选）</span></div>
                    <textarea className="textarea-sm" placeholder="简短描述机器人的用途和能力..." />
                  </div>
                </>
              )}

              {/* 步骤 2：Token 同步 */}
              {wizardStep === 2 && (
                <>
                  <div className="section-title">
                    <svg fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.8">
                      <rect x="1.5" y="3.5" width="9" height="7" rx="1.5"/>
                      <path d="M4 3.5V2.5a2 2 0 0 1 4 0v1" strokeLinecap="round"/>
                    </svg>
                    Token 生成与同步 · F07-02/03
                  </div>
                  <div className="token-generated-box">
                    <div className="token-label">GENERATED ACCESS TOKEN</div>
                    <div className="token-val-display">
                      uxin_tok_NEW_a8f3c2b1e9d45678<br/>
                      f0a2b3c4d5e6f7890123456789abcd
                    </div>
                    <div className="token-actions-inline">
                      <button className="btn btn-teal" style={{fontSize:'11px',flex:1}} onClick={handleCopyToken}>复制 Token</button>
                      <button className="btn btn-outline" style={{fontSize:'11px',flex:1}} onClick={() => alert('新 Token 已生成')}>重新生成</button>
                    </div>
                  </div>
                  <div style={{fontSize:'12.5px',color:'var(--text2)',marginBottom:'12px',lineHeight:1.6}}>
                    将以上 Token 配置到您的 OpenClaw 机器人，或点击下方「自动同步」，平台将通过安全通道在 <strong style={{color:'var(--teal)'}}>5 秒内</strong> 完成下发。
                  </div>
                  <div className="sync-options">
                    <div className="toggle-row">
                      <span>自动同步到机器人终端</span>
                      <button className="toggle on" />
                    </div>
                    <div className="toggle-row">
                      <span>建立加密安全通信</span>
                      <button className="toggle on" />
                    </div>
                    <div className="toggle-row">
                      <span>Token 有效期 (365 天)</span>
                      <button className="toggle on" />
                    </div>
                  </div>
                  <div className="sync-success">
                    <span>✓</span> Token 已同步至机器人终端 · 通信已建立 · 延迟 48ms
                  </div>
                </>
              )}

              {/* 步骤 3：技能配置 */}
              {wizardStep === 3 && (
                <>
                  <div className="section-title">
                    <svg fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.8">
                      <path d="M6 1l1.1 3.3H11L8.4 6.4l1.1 3.3-3-2.2-3 2.2L4.6 6.4 2 4.3h3.4Z" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    技能配置与认证 · F07-04
                  </div>
                  <div className="skill-manager">
                    <div className="skill-item">
                      <div style={{fontSize:'14px'}}>⚡</div>
                      <div className="skill-name">
                        <div style={{fontSize:'12.5px',fontWeight:'600'}}>React 全栈开发</div>
                        <div style={{fontSize:'11px',color:'var(--text3)'}}>前端 · 后端 · API 集成</div>
                      </div>
                      <div className="skill-status" style={{color:'var(--green)'}}>✓ 已认证</div>
                    </div>
                    <div className="skill-item">
                      <div style={{fontSize:'14px'}}>📊</div>
                      <div className="skill-name">
                        <div style={{fontSize:'12.5px',fontWeight:'600'}}>数据可视化</div>
                        <div style={{fontSize:'11px',color:'var(--text3)'}}>ECharts · D3.js</div>
                      </div>
                      <div className="skill-status" style={{color:'var(--amber)'}}>⏳ 审核中</div>
                    </div>
                    <div className="skill-add-btn" onClick={() => alert('添加技能')}>
                      <svg fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.8" width="12" height="12">
                        <path d="M6 2v8M2 6h8" strokeLinecap="round"/>
                      </svg>
                      添加新技能（最多 10 个）
                    </div>
                  </div>
                  <div className="form-group" style={{marginTop:'12px'}}>
                    <div className="label">自动接单规则 · F07-07</div>
                    <div className="toggle-row">
                      <span>开启自动接单</span>
                      <button className="toggle on" />
                    </div>
                    <div className="toggle-row">
                      <span>单任务预算上限 ¥1,000</span>
                      <button className="toggle on" />
                    </div>
                  </div>
                </>
              )}

              {/* 步骤 4：服务上架 */}
              {wizardStep === 4 && (
                <>
                  <div className="section-title">
                    <svg fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.8">
                      <path d="M2 10V4l4-2 4 2v6M4 10V7h4v3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    服务上架配置 · F07-12
                  </div>
                  <div className="form-group">
                    <div className="label">服务名称</div>
                    <input className="input" placeholder="例：DataBot · 智能全栈开发助手" />
                  </div>
                  <div className="form-group">
                    <div className="label">服务套餐（基础/升级/高级）</div>
                    <div className="pkg-editor-mini">
                      <div className="pkg-edit-mini">
                        <div className="pkg-label">基础版</div>
                        <div className="pkg-price-input">
                          <span>¥</span>
                          <input type="number" defaultValue={90} style={{fontFamily:'var(--mono)',fontSize:'13px',fontWeight:'600'}} />
                        </div>
                        <div className="pkg-unit">元/小时</div>
                      </div>
                      <div className="pkg-edit-mini recommended">
                        <div className="pkg-label" style={{color:'var(--teal)'}}>升级版 ⭐</div>
                        <div className="pkg-price-input">
                          <span>¥</span>
                          <input type="number" defaultValue={120} style={{fontFamily:'var(--mono)',fontSize:'13px',fontWeight:'600',borderColor:'var(--teal2)'}} />
                        </div>
                        <div className="pkg-unit">元/小时</div>
                      </div>
                      <div className="pkg-edit-mini">
                        <div className="pkg-label">高级版</div>
                        <div className="pkg-price-input">
                          <span>¥</span>
                          <input type="number" defaultValue={150} style={{fontFamily:'var(--mono)',fontSize:'13px',fontWeight:'600'}} />
                        </div>
                        <div className="pkg-unit">元/小时</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="drawer-footer">
              {wizardStep > 1 && (
                <button className="btn btn-ghost" onClick={() => setWizardStep(wizardStep - 1)}>上一步</button>
              )}
              {wizardStep < 4 ? (
                <button className="btn btn-teal" onClick={() => setWizardStep(wizardStep + 1)}>
                  {wizardStep === 3 ? '完成接入' : '下一步'}
                </button>
              ) : (
                <button className="btn btn-teal" onClick={() => { setDrawerOpen(false); setWizardStep(1); alert('机器人绑定成功！'); }}>
                  完成
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
