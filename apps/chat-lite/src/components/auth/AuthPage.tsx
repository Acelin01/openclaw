/**
 * AuthPage - 认证主页面组件
 * 包含登录、注册两个主要功能模块
 */

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import './AuthPage.css';

type AuthTab = 'login' | 'register';

export function AuthPage() {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const { isAuthenticated, user, logout } = useAuth();

  // 如果已登录，显示用户信息
  if (isAuthenticated && user) {
    return (
      <div className="auth-root">
        <aside className="auth-stage">
          <div className="stage-inner">
            <div className="brand">
              <div className="brand-diamond">🤖</div>
              <div>
                <div className="brand-name">技能共享平台</div>
                <div className="brand-sub">Robot Skills · OpenClaw</div>
              </div>
            </div>
            <div className="stage-hero">
              <div className="eyebrow">已登录</div>
              <div className="stage-h">欢迎回来，<em>{user.name}</em></div>
              <div className="stats">
                <div className="stat">
                  <div className="stat-v">{user.role}</div>
                  <div className="stat-k">当前角色</div>
                </div>
              </div>
            </div>
          </div>
        </aside>
        <main className="auth-content">
          <nav className="top-nav">
            <span style={{ color: 'var(--ink2)', fontSize: '13px' }}>
              👤 {user.email}
            </span>
            <button 
              className="ntab" 
              onClick={logout}
              style={{ marginLeft: 'auto' }}
            >
              退出登录
            </button>
          </nav>
          <div className="carea">
            <div className="s-head">
              <div className="s-title">登录成功</div>
              <div className="s-sub">
                您已成功登录，可以开始使用平台功能了。
              </div>
            </div>
            <button className="btn-copper" onClick={() => window.location.href = '/'}>
              返回首页
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="auth-root">
      {/* 左侧品牌区 */}
      <aside className="auth-stage">
        <div className="stage-inner">
          <div className="brand">
            <div className="brand-diamond">🤖</div>
            <div>
              <div className="brand-name">技能共享平台</div>
              <div className="brand-sub">Robot Skills · OpenClaw</div>
            </div>
          </div>

          <div className="stage-hero">
            <div className="eyebrow">Platform v2.0</div>
            <div className="stage-h">
              让<em>AI 机器人</em>
              <br />成为你的
              <br />最佳搭档
            </div>
            <div className="stage-p">
              一站式机器人技能交付平台。发布需求、智能匹配、实时计费、安全结算——一切尽在掌控。
            </div>
            
            <div className="stats">
              <div className="stat">
                <div className="stat-v">2,840</div>
                <div className="stat-k">注册用户</div>
              </div>
              <div className="stat">
                <div className="stat-v">186</div>
                <div className="stat-k">活跃机器人</div>
              </div>
              <div className="stat">
                <div className="stat-v">98 万</div>
                <div className="stat-k">累计成交</div>
              </div>
            </div>

            <div className="feats">
              <div className="feat">
                <div className="feat-dot"></div>
                注册免审核，即注即用 · F01-10
              </div>
              <div className="feat">
                <div className="feat-dot"></div>
                SMS / 邮箱多方式登录
              </div>
              <div className="feat">
                <div className="feat-dot"></div>
                平台资金安全托管
              </div>
            </div>
          </div>

          <div className="stage-foot" style={{ 
            fontSize: '10px', 
            color: 'rgba(255,255,255,.22)', 
            paddingTop: '14px', 
            borderTop: '1px solid rgba(255,255,255,.06)' 
          }}>
            © 2026 机器人技能共享平台
          </div>
        </div>
      </aside>

      {/* 右侧内容区 */}
      <main className="auth-content">
        <nav className="top-nav">
          <button 
            className={`ntab ${activeTab === 'login' ? 'on' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            登录
          </button>
          <button 
            className={`ntab ${activeTab === 'register' ? 'on' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            注册账号
          </button>
        </nav>

        <div className="carea">
          {activeTab === 'login' ? (
            <LoginForm />
          ) : (
            <RegisterForm />
          )}
        </div>
      </main>

      {/* Toast 通知容器 */}
      <div className="toast-stack" id="toastStack"></div>
    </div>
  );
}

export default AuthPage;
