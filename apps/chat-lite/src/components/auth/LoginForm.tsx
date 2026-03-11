/**
 * LoginForm - 登录表单组件
 * 支持密码登录和短信验证码登录
 */

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

type LoginMethod = 'pwd' | 'sms';

export function LoginForm() {
  const { login, isLoading } = useAuth();
  const [method, setMethod] = useState<LoginMethod>('pwd');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);
  const [smsCountdown, setSmsCountdown] = useState(0);
  const [toast, setToast] = useState<{ type: 'ok' | 'err' | ''; title: string; sub?: string } | null>(null);

  // 显示 Toast
  const showToast = (type: 'ok' | 'err' | '', title: string, sub = '') => {
    setToast({ type, title, sub });
    setTimeout(() => setToast(null), 2800);
  };

  // 发送短信验证码
  const sendSmsCode = async () => {
    if (phone.length < 11) {
      showToast('err', '请输入完整手机号', '请填写 11 位手机号');
      return;
    }
    showToast('', '验证码已发送', '60 秒内有效');
    setSmsCountdown(60);
    const interval = setInterval(() => {
      setSmsCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // OTP 输入处理
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  // 处理登录
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (method === 'pwd') {
      if (!email || !password) {
        showToast('err', '请填写完整信息', '邮箱和密码不能为空');
        return;
      }
      const result = await login(email, password);
      if (result.success) {
        showToast('ok', '登录成功', `欢迎回来`);
      } else {
        showToast('err', '登录失败', result.message);
      }
    } else {
      const otpCode = otp.join('');
      if (otpCode.length !== 6) {
        showToast('err', '请填写完整验证码', '6 位短信验证码');
        return;
      }
      // TODO: 实现短信登录 API
      showToast('err', '暂未实现', '短信登录接口待开发');
    }
  };

  return (
    <div className="screen on" id="sc-login">
      <div className="s-head">
        <div className="s-eyebrow">M01 · F01-03 <span className="badge-id">OAuth2.0</span></div>
        <div className="s-title">欢迎回来</div>
      </div>

      {/* 社交登录 */}
      <div className="soc-row">
        <button className="soc-btn" onClick={() => showToast('', '微信 OAuth2.0', '正在跳转授权...')}>
          <svg viewBox="0 0 24 24" fill="#07c160" style={{ width: 17, height: 17 }}>
            <path d="M8.5 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm7 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8Z"/>
          </svg>
          微信登录
        </button>
        <button className="soc-btn" onClick={() => showToast('', 'GitHub OAuth2.0', '正在跳转授权...')}>
          <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 17, height: 17 }}>
            <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z"/>
          </svg>
          GitHub
        </button>
      </div>

      <div className="divider">或使用账号登录</div>

      {/* 登录方式切换 */}
      <div className="mchips">
        <button 
          className={`mchip ${method === 'pwd' ? 'on' : ''}`}
          onClick={() => setMethod('pwd')}
        >
          密码登录
        </button>
        <button 
          className={`mchip ${method === 'sms' ? 'on' : ''}`}
          onClick={() => setMethod('sms')}
        >
          短信验证码
        </button>
      </div>

      <form className="form" onSubmit={handleLogin}>
        {method === 'pwd' ? (
          <>
            <div className="fg">
              <div className="fl">邮箱地址</div>
              <div className="fw">
                <input 
                  className="fi" 
                  type="email" 
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="fg">
              <div className="fl">
                密码 
                <a onClick={() => showToast('', '重置密码', '验证码已发送')}>忘记密码？</a>
              </div>
              <div className="fw">
                <input 
                  className="fi" 
                  type={showPassword ? 'text' : 'password'}
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            </div>
          </>
        ) : (
          <>
            <div className="fg">
              <div className="fl">手机号</div>
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
            </div>

            <div className="fg">
              <div className="fl">短信验证码</div>
              <div className="otp-row">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    className={`otp ${digit ? 'fill' : ''}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                  />
                ))}
              </div>
              <div className="hint">
                60 秒有效 · 
                <a 
                  onClick={sendSmsCode}
                  style={{ 
                    color: smsCountdown > 0 ? 'var(--dust)' : 'var(--copper)',
                    cursor: smsCountdown > 0 ? 'default' : 'pointer',
                    borderBottom: '1px solid rgba(192,120,64,.3)'
                  }}
                >
                  {smsCountdown > 0 ? `${smsCountdown}秒后重发` : '重新发送'}
                </a>
              </div>
            </div>
          </>
        )}

        <button 
          className={`btn-ink ${isLoading ? 'loading' : ''}`} 
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? '登录中...' : '登 录'}
        </button>
      </form>

      <div className="slink">
        没有账号？
        <a onClick={() => {
          const event = new CustomEvent('switch-to-register');
          window.dispatchEvent(event);
        }}>
          免审核注册
        </a>
        · F01-10
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

export default LoginForm;
