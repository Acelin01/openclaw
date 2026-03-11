/**
 * RegisterForm - 注册表单组件
 * 多步骤流程：1.账号信息 2.选择角色 3.完善资料
 */

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

type RegisterMethod = 'phone' | 'email';

export function RegisterForm() {
  const { register, isLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState<RegisterMethod>('phone');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'PROVIDER'>('CUSTOMER');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [toast, setToast] = useState<{ type: 'ok' | 'err' | ''; title: string; sub?: string } | null>(null);

  // 显示 Toast
  const showToast = (type: 'ok' | 'err' | '', title: string, sub = '') => {
    setToast({ type, title, sub });
    setTimeout(() => setToast(null), 2800);
  };

  // 评估密码强度
  const evalPassword = (value: string) => {
    let score = 0;
    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;
    setPasswordStrength(score);
  };

  // 下一步
  const nextStep = () => {
    if (step === 1) {
      if (!agreeTerms) {
        showToast('err', '请同意服务协议', '注册前需阅读并同意相关协议');
        return;
      }
      if (!email || !password || !name) {
        showToast('err', '请填写完整信息', '所有字段均为必填');
        return;
      }
    }
    setStep(step + 1);
  };

  // 上一步
  const prevStep = () => setStep(step - 1);

  // 完成注册
  const finishRegister = async () => {
    const result = await register(email, name, password, role);
    if (result.success) {
      showToast('ok', '🎉 注册成功！', '欢迎加入平台');
      setTimeout(() => {
        const event = new CustomEvent('switch-to-login');
        window.dispatchEvent(event);
      }, 1600);
    } else {
      showToast('err', '注册失败', result.message);
    }
  };

  // 获取密码强度标签
  const getPasswordStrengthLabel = () => {
    if (passwordStrength <= 1) return { text: '弱', color: 'var(--rose)', width: '25%' };
    if (passwordStrength === 2) return { text: '一般', color: 'var(--gold)', width: '50%' };
    if (passwordStrength === 3) return { text: '中等', color: 'var(--copper)', width: '76%' };
    return { text: '强', color: 'var(--jade)', width: '100%' };
  };

  const strength = getPasswordStrengthLabel();

  return (
    <div className="screen on" id="sc-register">
      {/* 步骤指示器 */}
      <div className="steps">
        <div className={`snode ${step >= 1 ? (step > 1 ? 'done' : 'on') : ''}`}>1</div>
        <div className={`sline ${step > 1 ? 'done' : ''}`}></div>
        <div className={`snode ${step >= 2 ? (step > 2 ? 'done' : 'on') : ''}`}>2</div>
        <div className={`sline ${step > 2 ? 'done' : ''}`}></div>
        <div className={`snode ${step >= 3 ? 'on' : ''}`}>3</div>
      </div>

      {/* Step 1: 账号信息 */}
      {step === 1 && (
        <div id="rs1">
          <div className="s-head">
            <div className="s-eyebrow">F01-01 手机 · F01-02 邮箱 <span className="badge-id">F01-10 免审核</span></div>
            <div className="s-title">创建账号</div>
            <div className="s-sub">注册成功后直接登录，无需人工审核</div>
          </div>

          <div className="mchips">
            <button 
              className={`mchip ${method === 'phone' ? 'on' : ''}`}
              onClick={() => setMethod('phone')}
            >
              📱 手机号
            </button>
            <button 
              className={`mchip ${method === 'email' ? 'on' : ''}`}
              onClick={() => setMethod('email')}
            >
              📧 邮箱
            </button>
          </div>

          <form className="form">
            <div className="fg">
              <div className="fl">昵称</div>
              <div className="fw">
                <input 
                  className="fi" 
                  type="text" 
                  placeholder="如何称呼您？"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {method === 'phone' ? (
              <div className="fg">
                <div className="fl">手机号 <span className="badge-id">F01-01</span></div>
                <div className="phone-row">
                  <select className="cpick">
                    <option>🇨🇳 +86</option>
                    <option>🇺🇸 +1</option>
                  </select>
                  <input 
                    className="fi" 
                    type="tel" 
                    placeholder="请输入手机号"
                    maxLength={11}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="hint">
                  <svg fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.7" style={{ width: 11, height: 11 }}>
                    <circle cx="6" cy="6" r="4.5"/>
                    <path d="M6 4v2.5M6 8v.5" strokeLinecap="round"/>
                  </svg>
                  60 秒内有效 · 24 小时最多发送 10 次
                </div>
              </div>
            ) : (
              <div className="fg">
                <div className="fl">邮箱地址 <span className="badge-id">F01-02</span></div>
                <div className="fw">
                  <input 
                    className="fi" 
                    type="email" 
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="hint ok">
                  <svg fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.7" style={{ width: 11, height: 11 }}>
                    <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  支持 Gmail · QQ 邮箱 · 163 · Outlook
                </div>
              </div>
            )}

            <div className="fg">
              <div className="fl">设置密码</div>
              <div className="fw">
                <input 
                  className="fi" 
                  type={showPassword ? 'text' : 'password'}
                  placeholder="至少 8 位，包含字母和数字"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    evalPassword(e.target.value);
                  }}
                />
                <span 
                  className="feye" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.6">
                    <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z"/>
                    <circle cx="8" cy="8" r="2.5"/>
                  </svg>
                </span>
              </div>
              {password && (
                <div id="pStr">
                  <div className="ptrack">
                    <div 
                      className="pfill" 
                      style={{ width: strength.width, background: strength.color }}
                    ></div>
                  </div>
                  <div className={`hint ${passwordStrength <= 1 ? 'err' : passwordStrength === 2 ? 'warn' : 'ok'}`}>
                    强度：{strength.text}
                  </div>
                </div>
              )}
            </div>

            <div className="terms">
              <input 
                type="checkbox" 
                id="tc"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <label htmlFor="tc">
                我已阅读并同意 <a onClick={() => showToast('', '服务协议', '打开协议详情')}>《服务协议》</a>
                和<a onClick={() => showToast('', '隐私政策', '打开隐私政策')}>《隐私政策》</a>
              </label>
            </div>

            <button 
              className="btn-ink" 
              type="button"
              onClick={nextStep}
            >
              下一步：选择身份角色
            </button>
          </form>
        </div>
      )}

      {/* Step 2: 选择角色 */}
      {step === 2 && (
        <div id="rs2">
          <div className="s-head">
            <div className="s-eyebrow">F01-04 角色管理 <span className="badge-id">双重身份</span></div>
            <div className="s-title">选择身份</div>
            <div className="s-sub">支持双重身份，注册后可在设置中随时添加另一角色</div>
          </div>

          <div className="role-grid" style={{ marginBottom: '13px' }}>
            <div 
              className={`rcard ${role === 'CUSTOMER' ? 'sel' : ''}`}
              onClick={() => setRole('CUSTOMER')}
            >
              <div className="rchk">✓</div>
              <span className="rcard-glyph">💼</span>
              <div className="rcard-name">客 户</div>
              <div className="rcard-desc">发布需求，雇佣机器人或自由职业者完成工作</div>
            </div>
            <div 
              className={`rcard ${role === 'PROVIDER' ? 'sel' : ''}`}
              onClick={() => setRole('PROVIDER')}
            >
              <div className="rchk">✓</div>
              <span className="rcard-glyph">🤖</span>
              <div className="rcard-name">自由职业者</div>
              <div className="rcard-desc">提供技能服务，接单赚收益，机器人辅助执行</div>
            </div>
          </div>

          <div className="info-box" style={{ marginBottom: '15px' }}>
            ✦ 选择后可继续激活双重身份 · 自由职业者需完成实名认证（F01-05）方可接单
          </div>

          <div style={{ display: 'flex', gap: '9px' }}>
            <button className="btn-ghost" onClick={prevStep}>← 上一步</button>
            <button className="btn-ink" style={{ flex: 1 }} onClick={nextStep}>
              下一步：完善资料
            </button>
          </div>
        </div>
      )}

      {/* Step 3: 完成 */}
      {step === 3 && (
        <div id="rs3">
          <div className="s-head">
            <div className="s-eyebrow">F01-07 个人资料 <span className="badge-id">P1</span></div>
            <div className="s-title">确认信息</div>
            <div className="s-sub">请确认以下信息无误后完成注册</div>
          </div>

          <div className="info-box" style={{ marginBottom: '15px' }}>
            <div style={{ marginBottom: '8px' }}><strong>邮箱：</strong>{email}</div>
            <div style={{ marginBottom: '8px' }}><strong>昵称：</strong>{name}</div>
            <div><strong>角色：</strong>{role === 'CUSTOMER' ? '客户' : '自由职业者'}</div>
          </div>

          <div style={{ display: 'flex', gap: '9px' }}>
            <button className="btn-ghost" onClick={prevStep}>← 上一步</button>
            <button 
              className={`btn-copper ${isLoading ? 'loading' : ''}`}
              style={{ flex: 1 }}
              onClick={finishRegister}
              disabled={isLoading}
            >
              {isLoading ? '注册中...' : '🎉 完成注册'}
            </button>
          </div>
        </div>
      )}

      <div className="slink">
        已有账号？
        <a onClick={() => {
          const event = new CustomEvent('switch-to-login');
          window.dispatchEvent(event);
        }}>
          立即登录
        </a>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          <div className="t-glyph">{toast.type === 'ok' ? '✓' : toast.type === 'err' ? '✕' : '·'}</div>
          <div>
            <strong>{toast.title}</strong>
            {toast.sub && <small>{toast.sub}</small>}
          </div>
        </div>
      )}
    </div>
  );
}

export default RegisterForm;
