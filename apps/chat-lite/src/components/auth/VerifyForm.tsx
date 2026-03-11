/**
 * VerifyForm - 实名认证组件 (F01-05)
 * 支持个人认证和企业认证
 */

import React, { useState } from 'react';

type VerifyType = 'personal' | 'enterprise';

export function VerifyForm() {
  const [verifyType, setVerifyType] = useState<VerifyType>('personal');
  const [captchaCode, setCaptchaCode] = useState('K8W3');
  const [toast, setToast] = useState<{ type: 'ok' | 'err' | ''; title: string; sub?: string } | null>(null);

  const showToast = (type: 'ok' | 'err' | '', title: string, sub = '') => {
    setToast({ type, title, sub });
    setTimeout(() => setToast(null), 2800);
  };

  const refreshCaptcha = () => {
    const codes = ['K8W3', '9XQ7', 'A4NF', 'H2ZB', 'D6MR', 'T3PJ'];
    setCaptchaCode(codes[Math.floor(Math.random() * codes.length)]);
  };

  const handleSubmit = () => {
    showToast('', '认证已提交', 'F01-05 · 第三方接口核验中，约 1-3 分钟');
  };

  return (
    <div className="screen on" id="sc-verify">
      <div className="s-head">
        <div className="s-eyebrow">F01-05 实名认证 <span className="badge-id">第三方接口核验</span></div>
        <div className="s-title">实名认证</div>
        <div className="s-sub">认证通过后可提供服务、参与资金托管结算，通常 1-3 分钟完成</div>
      </div>

      {/* 类型切换 */}
      <div className="stabs" style={{ display: 'flex', borderBottom: '1.5px solid var(--border)', marginBottom: '20px', gap: '0' }}>
        <button 
          className={`stab ${verifyType === 'personal' ? 'on' : ''}`}
          onClick={() => setVerifyType('personal')}
        >
          👤 个人认证
        </button>
        <button 
          className={`stab ${verifyType === 'enterprise' ? 'on' : ''}`}
          onClick={() => setVerifyType('enterprise')}
        >
          🏢 企业认证
        </button>
      </div>

      {/* 个人认证 */}
      {verifyType === 'personal' && (
        <div id="vp">
          <form className="form">
            <div className="fg2">
              <div className="fg">
                <div className="fl">真实姓名</div>
                <div className="fw">
                  <input className="fi" placeholder="请输入真实姓名" />
                </div>
              </div>
              <div className="fg">
                <div className="fl">身份证号</div>
                <div className="fw">
                  <input className="fi mono" placeholder="18 位身份证" maxLength={18} />
                </div>
              </div>
            </div>

            <div className="fg2">
              <div className="fg">
                <div className="fl" style={{ marginBottom: '5px' }}>身份证正面</div>
                <div 
                  className="upload" 
                  onClick={() => showToast('ok', '文件已上传', 'id-front.jpg')}
                  style={{ 
                    border: '2px dashed var(--border)', 
                    borderRadius: 'var(--R)', 
                    padding: '20px 14px', 
                    textAlign: 'center', 
                    cursor: 'pointer',
                    transition: 'all var(--ease)',
                    background: 'var(--cream2)'
                  }}
                >
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" style={{ width: 22, height: 22, color: 'var(--dust)', marginBottom: '6px' }}>
                    <path d="M12 15V5M9 8l3-3 3 3M5 19v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div className="upload-t" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink2)', marginBottom: '2px' }}>点击上传</div>
                  <div className="upload-s" style={{ fontSize: '11px', color: 'var(--dust)' }}>JPG/PNG · ≤5MB</div>
                </div>
              </div>
              <div className="fg">
                <div className="fl" style={{ marginBottom: '5px' }}>身份证背面</div>
                <div 
                  className="upload done"
                  style={{ 
                    border: '2px solid var(--jade-bd)', 
                    borderRadius: 'var(--R)', 
                    padding: '20px 14px', 
                    textAlign: 'center',
                    background: 'var(--jade-bg)'
                  }}
                >
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" style={{ width: 22, height: 22, color: 'var(--jade)', marginBottom: '6px' }}>
                    <path d="M9 12l2 2 4-4M12 3a9 9 0 1 0 0 18A9 9 0 0 0 12 3Z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div className="upload-t done" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--jade)', marginBottom: '2px' }}>已上传</div>
                  <div className="upload-s" style={{ fontSize: '11px', color: 'var(--dust)' }}>id_back.jpg</div>
                </div>
              </div>
            </div>

            <div className="fg">
              <div className="fl">图形验证码</div>
              <div className="cap-row" style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                <div className="fw" style={{ flex: 1 }}>
                  <input className="fi" placeholder="输入右侧验证码" />
                </div>
                <div 
                  className="cap-img"
                  onClick={refreshCaptcha}
                  style={{ 
                    flex: 1, 
                    height: '44px', 
                    border: '1.5px solid var(--border)', 
                    borderRadius: 'var(--r)',
                    background: 'linear-gradient(135deg, var(--cream3), var(--warm))',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontFamily: 'var(--mono)',
                    fontSize: '20px',
                    fontWeight: 500,
                    color: 'var(--ink2)',
                    letterSpacing: '.35em',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'border-color var(--ease)'
                  }}
                >
                  {captchaCode}
                </div>
                <button 
                  className="cap-btn"
                  onClick={refreshCaptcha}
                  type="button"
                  style={{ 
                    padding: '0 12px', 
                    border: '1.5px solid var(--border)', 
                    borderRadius: 'var(--r)',
                    background: 'var(--surface)', 
                    color: 'var(--ink3)', 
                    cursor: 'pointer',
                    display: 'flex', 
                    alignItems: 'center',
                    transition: 'all var(--ease)'
                  }}
                >
                  <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.8" style={{ width: 15, height: 15 }}>
                    <path d="M13 7A5 5 0 1 1 8 3" strokeLinecap="round"/>
                    <path d="M8 3l2 2-2 2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className="vstatus" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '11px', 
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--r)',
              padding: '12px 14px',
              background: 'var(--cream2)',
              marginTop: '6px'
            }}>
              <div className="vsico" style={{ 
                width: 32, height: 32, borderRadius: 8, 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 15, flexShrink: 0, background: 'var(--copper-bg)'
              }}>⏳</div>
              <div>
                <div className="vsname" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>等待提交审核</div>
                <div className="vssub" style={{ fontSize: '11.5px', color: 'var(--ink3)', marginTop: 1 }}>第三方接口核验 · 通常 1-3 分钟完成</div>
              </div>
            </div>

            <button className="btn-ink" type="button" onClick={handleSubmit}>
              提交实名认证
            </button>
          </form>
        </div>
      )}

      {/* 企业认证 */}
      {verifyType === 'enterprise' && (
        <div id="vb">
          <form className="form">
            <div className="fg">
              <div className="fl">企业全称</div>
              <div className="fw">
                <input className="fi" placeholder="请输入工商注册全称" />
              </div>
            </div>
            <div className="fg">
              <div className="fl">统一社会信用代码</div>
              <div className="fw">
                <input className="fi mono" placeholder="18 位社会信用代码" />
              </div>
            </div>
            <div className="fg">
              <div className="fl" style={{ marginBottom: '5px' }}>营业执照</div>
              <div 
                className="upload"
                onClick={() => showToast('ok', '文件已上传', 'license.pdf')}
                style={{ 
                  border: '2px dashed var(--border)', 
                  borderRadius: 'var(--R)', 
                  padding: '26px', 
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all var(--ease)',
                  background: 'var(--cream2)'
                }}
              >
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" style={{ width: 22, height: 22, color: 'var(--dust)', marginBottom: '6px' }}>
                  <path d="M12 15V5M9 8l3-3 3 3M5 19v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div className="upload-t" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink2)', marginBottom: '2px' }}>上传营业执照</div>
                <div className="upload-s" style={{ fontSize: '11px', color: 'var(--dust)' }}>原件扫描或加盖公章 · PDF/JPG · ≤10MB</div>
              </div>
            </div>
            <div className="fg">
              <div className="fl">法人姓名</div>
              <div className="fw">
                <input className="fi" placeholder="法定代表人姓名" />
              </div>
            </div>
            <button className="btn-ink" type="button" onClick={handleSubmit}>
              提交企业认证
            </button>
          </form>
        </div>
      )}

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

export default VerifyForm;
