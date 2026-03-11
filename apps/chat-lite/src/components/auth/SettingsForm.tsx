/**
 * SettingsForm - 账号设置组件
 * 包含：个人资料、账号安全、角色管理、注销账号
 */

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

type SettingsTab = 'profile' | 'security' | 'role' | 'cancel';

export function SettingsForm() {
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setTab] = useState<SettingsTab>('profile');
  const [showPassForm, setShowPassForm] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState('');
  const [toast, setToast] = useState<{ type: 'ok' | 'err' | ''; title: string; sub?: string } | null>(null);

  const showToast = (type: 'ok' | 'err' | '', title: string, sub = '') => {
    setToast({ type, title, sub });
    setTimeout(() => setToast(null), 2800);
  };

  const handleSaveProfile = () => {
    showToast('ok', '资料已保存', 'F01-07 个人资料更新成功');
  };

  const handleActivateFreelancer = () => {
    showToast('ok', '自由职业者已激活', 'F01-04 · 请前往实名认证完成后续流程');
  };

  const handleCancelAccount = () => {
    if (cancelConfirm !== '注销账号') {
      showToast('err', '请输入确认文字', '请输入「注销账号」以确认');
      return;
    }
    showToast('', '注销申请已提交', 'F01-08 · 7 天冷静期，期间可撤回');
  };

  // 倒计时 (7 天冷静期)
  const [cdSec] = useState(7 * 86400 - 98);
  const d = Math.floor(cdSec / 86400);
  const h = String(Math.floor((cdSec % 86400) / 3600)).padStart(2, '0');
  const m = String(Math.floor((cdSec % 3600) / 60)).padStart(2, '0');
  const s = String(cdSec % 60).padStart(2, '0');

  return (
    <div className="screen on" id="sc-settings">
      <div className="s-head">
        <div className="s-eyebrow">M01 · 账号设置</div>
        <div className="s-title">账号管理</div>
      </div>

      {/* 顶部 Tab */}
      <div className="stabs" style={{ display: 'flex', borderBottom: '1.5px solid var(--border)', marginBottom: '20px', gap: '0' }}>
        <button className={`stab ${activeTab === 'profile' ? 'on' : ''}`} onClick={() => setTab('profile')}>个人资料</button>
        <button className={`stab ${activeTab === 'security' ? 'on' : ''}`} onClick={() => setTab('security')}>账号安全</button>
        <button className={`stab ${activeTab === 'role' ? 'on' : ''}`} onClick={() => setTab('role')}>角色管理</button>
        <button className={`stab ${activeTab === 'cancel' ? 'on' : ''}`} onClick={() => setTab('cancel')}>注销账号</button>
      </div>

      {/* 个人资料 */}
      {activeTab === 'profile' && (
        <div id="sp-p">
          <div className="av-row" style={{ display: 'flex', alignItems: 'center', gap: '18px', padding: '14px 0' }}>
            <div 
              className="av-ring"
              onClick={() => showToast('', '更换头像', 'F01-07 · 压缩至 500KB')}
              style={{
                width: 74, height: 74, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--copper), var(--gold))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--serif)', fontSize: 26, color: '#fff',
                cursor: 'pointer', position: 'relative',
                border: '3px solid var(--cream)',
                boxShadow: '0 0 0 1.5px var(--border)',
                transition: 'all var(--ease)'
              }}
            >
              {user?.name?.[0] || '用'}
              <div className="av-ov" style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: 'rgba(26,18,8,.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: 0, transition: 'opacity var(--ease)'
              }}>
                <svg fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.6" style={{ width: 20, height: 20, color: '#fff' }}>
                  <path d="M13 2H7L5 6H2a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-3L13 2Z" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="10" cy="11" r="3"/>
                </svg>
              </div>
            </div>
            <div className="av-info">
              <strong style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: 'var(--ink)', marginBottom: 3 }}>点击更换头像</strong>
              <span style={{ fontSize: '12px', color: 'var(--ink3)', lineHeight: 1.55 }}>
                支持 JPG / PNG<br />自动压缩至 500KB · F01-07
              </span>
            </div>
          </div>

          <form className="form">
            <div className="fg">
              <div className="fl">昵称</div>
              <div className="fw">
                <input className="fi" defaultValue={user?.name || ''} />
              </div>
            </div>
            <div className="fg">
              <div className="fl">个人简介</div>
              <textarea 
                className="fta"
                style={{
                  width: '100%', padding: '11px 14px', resize: 'none',
                  border: '1.5px solid var(--border)', borderRadius: 'var(--r)',
                  background: 'var(--surface)', color: 'var(--ink)', fontSize: '13px',
                  fontFamily: 'var(--body)', lineHeight: 1.6, outline: 'none',
                  minHeight: 68, transition: 'border-color var(--ease)'
                }}
                defaultValue="全栈工程师，专注 React + Node.js，4 年经验，擅长高性能后台系统开发。"
              />
            </div>
            <div className="fg">
              <div className="fl">技能标签 <span className="badge-id">F01-07</span></div>
              <div 
                className="tag-field"
                onClick={() => (this as any).focus()}
                style={{
                  display: 'flex', flexWrap: 'wrap', gap: '5px',
                  padding: '8px 10px', border: '1.5px solid var(--border)',
                  borderRadius: 'var(--r)', background: 'var(--surface)',
                  minHeight: 44, cursor: 'text', transition: 'border-color var(--ease)'
                }}
              >
                <span className="tchip" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  background: 'var(--cream3)', border: '1px solid var(--border2)',
                  color: 'var(--ink2)', fontSize: '11.5px', padding: '3px 8px 3px 9px',
                  borderRadius: 3, fontWeight: 500
                }}>
                  React <button onClick={(e) => { e.stopPropagation(); }} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--dust)', fontSize: 13, lineHeight: 1, padding: 0
                  }}>×</button>
                </span>
                <span className="tchip">TypeScript <button>×</button></span>
                <span className="tchip">Node.js <button>×</button></span>
                <input 
                  className="tag-in"
                  placeholder="添加标签 Enter"
                  style={{
                    border: 'none', outline: 'none', background: 'transparent',
                    fontSize: '12.5px', fontFamily: 'var(--body)',
                    color: 'var(--ink)', minWidth: 80, flex: 1
                  }}
                />
              </div>
              <div className="hint">最多 10 个标签，用于智能匹配推荐</div>
            </div>
            <button className="btn-ink" type="button" onClick={handleSaveProfile}>保存修改</button>
          </form>
        </div>
      )}

      {/* 账号安全 */}
      {activeTab === 'security' && (
        <div id="sp-s">
          <div style={{ fontSize: '13px', color: 'var(--ink3)', marginBottom: 15, lineHeight: 1.6 }}>
            密码修改、邮件/短信双重验证 <span className="badge-id" style={{ marginLeft: 4 }}>F01-06</span>
          </div>
          <div className="sec-list" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* 修改密码 */}
            <div 
              className="sec-item"
              onClick={() => setShowPassForm(!showPassForm)}
              style={{
                display: 'flex', alignItems: 'center', gap: 11,
                border: '1.5px solid var(--border)', borderRadius: 'var(--r)',
                padding: '13px 15px', background: 'var(--surface)',
                cursor: 'pointer', transition: 'all var(--ease)'
              }}
            >
              <div className="sec-ico" style={{
                width: 34, height: 34, borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, flexShrink: 0, background: 'var(--copper-bg)'
              }}>🔑</div>
              <div className="sec-body" style={{ flex: 1 }}>
                <div className="sec-name" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>登录密码</div>
                <div className="sec-desc" style={{ fontSize: '11.5px', color: 'var(--ink3)', marginTop: 1 }}>上次修改：30 天前</div>
              </div>
              <div className="sec-tag tag-set" style={{
                fontSize: '9.5px', fontWeight: 600, padding: '3px 7px',
                borderRadius: 3, flexShrink: 0, fontFamily: 'var(--mono)',
                background: 'var(--copper-bg)', color: 'var(--copper)',
                border: '1px solid var(--copper-bd)'
              }}>修改</div>
              <div className="sec-chev" style={{ color: 'var(--dust)', fontSize: 16 }}>›</div>
            </div>

            {showPassForm && (
              <div style={{
                border: '1.5px solid var(--border)', borderRadius: 'var(--r)',
                padding: 15, background: 'var(--cream)'
              }}>
                <form className="form" style={{ gap: 11 }}>
                  <div className="fg">
                    <div className="fl">当前密码</div>
                    <div className="fw">
                      <input className="fi has-e" type="password" placeholder="请输入当前密码" />
                    </div>
                  </div>
                  <div className="fg">
                    <div className="fl">新密码</div>
                    <div className="fw">
                      <input className="fi" type="password" placeholder="至少 8 位，包含字母和数字" />
                    </div>
                  </div>
                  <div className="fg">
                    <div className="fl">确认新密码</div>
                    <div className="fw">
                      <input className="fi" type="password" placeholder="再次输入新密码" />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-ghost" type="button" onClick={() => setShowPassForm(false)}>取消</button>
                    <button 
                      className="btn-ink" 
                      type="button" 
                      onClick={() => { showToast('ok', '密码已更新', 'F01-06 新密码设置成功'); setShowPassForm(false); }}
                      style={{ flex: 1 }}
                    >
                      确认修改
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 短信 2FA */}
            <div className="sec-item" style={{
              display: 'flex', alignItems: 'center', gap: 11,
              border: '1.5px solid var(--border)', borderRadius: 'var(--r)',
              padding: '13px 15px', background: 'var(--surface)'
            }}>
              <div className="sec-ico" style={{
                width: 34, height: 34, borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, flexShrink: 0, background: 'var(--jade-bg)'
              }}>📱</div>
              <div className="sec-body" style={{ flex: 1 }}>
                <div className="sec-name">短信二次验证 2FA</div>
                <div className="sec-desc">138****0042 · F01-06</div>
              </div>
              <button 
                className="toggler on"
                onClick={(e) => { e.stopPropagation(); }}
                style={{
                  width: 38, height: 21, borderRadius: 11,
                  border: '1.5px solid var(--border)',
                  background: 'var(--jade)', borderColor: 'var(--jade)',
                  cursor: 'pointer', position: 'relative', flexShrink: 0,
                  transition: 'all var(--ease)'
                }}
              >
                <div style={{
                  position: 'absolute', top: 2, left: 19,
                  width: 13, height: 13, borderRadius: '50%',
                  background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.2)',
                  transition: 'left var(--ease)'
                }}></div>
              </button>
            </div>

            {/* 邮件 2FA */}
            <div className="sec-item" style={{
              display: 'flex', alignItems: 'center', gap: 11,
              border: '1.5px solid var(--border)', borderRadius: 'var(--r)',
              padding: '13px 15px', background: 'var(--surface)'
            }}>
              <div className="sec-ico" style={{
                width: 34, height: 34, borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, flexShrink: 0, background: 'var(--cream3)'
              }}>📧</div>
              <div className="sec-body" style={{ flex: 1 }}>
                <div className="sec-name">邮件二次验证 2FA</div>
                <div className="sec-desc">ch**@gmail.com · F01-06</div>
              </div>
              <button 
                className="toggler"
                onClick={(e) => { e.stopPropagation(); }}
                style={{
                  width: 38, height: 21, borderRadius: 11,
                  border: '1.5px solid var(--border)',
                  background: 'var(--cream3)',
                  cursor: 'pointer', position: 'relative', flexShrink: 0,
                  transition: 'all var(--ease)'
                }}
              >
                <div style={{
                  position: 'absolute', top: 2, left: 2,
                  width: 13, height: 13, borderRadius: '50%',
                  background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.2)',
                  transition: 'left var(--ease)'
                }}></div>
              </button>
            </div>

            {/* 设备管理 */}
            <div 
              className="sec-item"
              onClick={() => showToast('', '设备管理', '查看所有在线设备')}
              style={{
                display: 'flex', alignItems: 'center', gap: 11,
                border: '1.5px solid var(--border)', borderRadius: 'var(--r)',
                padding: '13px 15px', background: 'var(--surface)',
                cursor: 'pointer'
              }}
            >
              <div className="sec-ico" style={{
                width: 34, height: 34, borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, flexShrink: 0, background: 'var(--cream3)'
              }}>🖥</div>
              <div className="sec-body" style={{ flex: 1 }}>
                <div className="sec-name">登录设备管理</div>
                <div className="sec-desc">当前 2 台设备在线</div>
              </div>
              <div className="sec-tag tag-on" style={{
                fontSize: '9.5px', fontWeight: 600, padding: '3px 7px',
                borderRadius: 3, flexShrink: 0, fontFamily: 'var(--mono)',
                background: 'var(--jade-bg)', color: 'var(--jade)',
                border: '1px solid var(--jade-bd)'
              }}>管理</div>
              <div className="sec-chev" style={{ color: 'var(--dust)', fontSize: 16 }}>›</div>
            </div>
          </div>
        </div>
      )}

      {/* 角色管理 */}
      {activeTab === 'role' && (
        <div id="sp-r">
          <div style={{ fontSize: '13px', color: 'var(--ink3)', marginBottom: 15 }}>
            客户与自由职业者双重身份 <span className="badge-id" style={{ marginLeft: 4 }}>F01-04</span>
          </div>
          <div className="role-grid" style={{ marginBottom: 13 }}>
            <div className="rcard sel">
              <div className="rchk">✓</div>
              <span className="rcard-glyph">💼</span>
              <div className="rcard-name">客 户</div>
              <div className="rcard-desc" style={{ color: 'var(--jade)', fontWeight: 600, marginTop: 5 }}>✓ 当前已激活</div>
            </div>
            <div 
              className="rcard"
              onClick={handleActivateFreelancer}
            >
              <div className="rchk">✓</div>
              <span className="rcard-glyph">🤖</span>
              <div className="rcard-name">自由职业者</div>
              <div className="rcard-desc">点击激活 · 需实名认证后接单</div>
            </div>
          </div>
          <div className="info-box">
            激活自由职业者后需完成 F01-05 实名认证，方可上架服务接受资金托管结算
          </div>
        </div>
      )}

      {/* 注销账号 */}
      {activeTab === 'cancel' && (
        <div id="sp-c">
          <div className="danger-card" style={{
            background: 'var(--rose-bg)', border: '1.5px solid #f8c0c0',
            borderRadius: 'var(--r)', padding: '12px 14px',
            display: 'flex', gap: 9, marginBottom: 14
          }}>
            <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.8" style={{ width: 15, height: 15, color: 'var(--rose)', flexShrink: 0, marginTop: 1 }}>
              <circle cx="8" cy="8" r="6.5"/>
              <path d="M8 5v4M8 10.5v.5" strokeLinecap="round"/>
            </svg>
            <p style={{ fontSize: '12px', color: 'var(--rose)', lineHeight: 1.65 }}>
              账号注销不可撤销。7 天冷静期结束后，个人信息将被匿名化处理，资金自动退回绑定账户。
            </p>
          </div>

          <div className="cancel-flow" style={{ display: 'flex', flexDirection: 'column', gap: 0, margin: '12px 0' }}>
            <div className="cstep" style={{ display: 'flex', gap: 13, padding: '11px 0', position: 'relative' }}>
              <div className="ccirc done" style={{
                width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10.5px', fontWeight: 700, zIndex: 1,
                background: 'var(--jade)', borderColor: 'var(--jade)', color: '#fff',
                border: '1.5px solid var(--border)'
              }}>✓</div>
              <div className="ctxt" style={{ flex: 1, paddingTop: 1 }}>
                <div className="ct" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>提交注销申请</div>
                <div className="cd" style={{ fontSize: '12px', color: 'var(--ink3)', marginTop: 2, lineHeight: 1.5 }}>确认无进行中订单及未结算余额</div>
              </div>
            </div>
            <div className="cstep" style={{ display: 'flex', gap: 13, padding: '11px 0', position: 'relative' }}>
              <div className="ccirc act" style={{
                width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10.5px', fontWeight: 700, zIndex: 1,
                background: 'var(--ink)', borderColor: 'var(--ink)', color: '#fff',
                border: '1.5px solid var(--border)'
              }}>2</div>
              <div className="ctxt" style={{ flex: 1, paddingTop: 1 }}>
                <div className="ct">冷静期 7 天</div>
                <div className="cd">期间可随时撤回，继续正常使用账号</div>
                <div className="timer-pill" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: 'var(--copper-bg)', border: '1px solid var(--copper-bd)',
                  borderRadius: 3, padding: '3px 9px', fontSize: '11.5px',
                  fontWeight: 600, color: 'var(--copper), fontFamily: 'var(--mono)',
                  marginTop: 5
                }}>
                  <svg fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.6" style={{ width: 11, height: 11 }}>
                    <circle cx="6" cy="6" r="4.5"/>
                    <path d="M6 3.5V6l2 2" strokeLinecap="round"/>
                  </svg>
                  剩余 {d}天 {h}:{m}:{s}
                </div>
              </div>
            </div>
            <div className="cstep" style={{ display: 'flex', gap: 13, padding: '11px 0', position: 'relative' }}>
              <div className="ccirc" style={{
                width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10.5px', fontWeight: 700, zIndex: 1,
                background: 'var(--cream3)', borderColor: 'var(--border)', color: 'var(--dust)',
                border: '1.5px solid var(--border)'
              }}>3</div>
              <div className="ctxt" style={{ flex: 1, paddingTop: 1 }}>
                <div className="ct">数据匿名化处理</div>
                <div className="cd">个人信息匿名化，订单流水脱敏保留供审计</div>
              </div>
            </div>
          </div>

          <form className="form" style={{ gap: 11, marginTop: 4 }}>
            <div className="fg">
              <div className="fl">注销原因</div>
              <select className="fsel" style={{
                width: '100%', padding: '11px 34px 11px 14px',
                border: '1.5px solid var(--border)', borderRadius: 'var(--r)',
                background: 'var(--surface)', color: 'var(--ink)',
                fontSize: '13px', fontFamily: 'var(--body)',
                outline: 'none', cursor: 'pointer',
                appearance: 'none'
              }}>
                <option>请选择注销原因</option>
                <option>不再使用此平台</option>
                <option>担心隐私安全</option>
                <option>创建了新账号</option>
                <option>其他原因</option>
              </select>
            </div>
            <div className="fg">
              <div className="fl">输入「注销账号」确认</div>
              <div className="fw">
                <input 
                  className="fi" 
                  placeholder="注销账号"
                  value={cancelConfirm}
                  onChange={(e) => setCancelConfirm(e.target.value)}
                />
              </div>
            </div>
            <button className="btn-rose" type="button" onClick={handleCancelAccount} style={{
              width: '100%', padding: 12, background: 'var(--rose)',
              border: 'none', borderRadius: 'var(--r)', fontSize: 14,
              fontWeight: 600, fontFamily: 'var(--body)', color: '#fff',
              cursor: 'pointer', letterSpacing: '.04em',
              transition: 'all var(--ease)',
              boxShadow: '0 4px 14px rgba(192,64,80,.25)'
            }}>
              申请注销账号 · F01-08
            </button>
            <button 
              className="btn-ghost" 
              type="button"
              onClick={() => showToast('ok', '申请已撤回', '账号已恢复正常使用')}
              style={{
                width: '100%', padding: '11px 16px', background: 'transparent',
                border: '1.5px solid var(--border)', borderRadius: 'var(--r)',
                fontSize: '13.5px', fontWeight: 500, fontFamily: 'var(--body)',
                color: 'var(--ink2)', cursor: 'pointer',
                textAlign: 'center', transition: 'all var(--ease)'
              }}
            >
              撤回注销申请
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

export default SettingsForm;
