/**
 * 创建服务抽屉组件
 */

import React, { useState } from 'react';
import './CreateServiceDrawer.css';

interface FormData {
  name: string;
  category: string;
  type: 'robot' | 'manual' | 'hybrid';
  description: string;
  coverStyle: string;
  emoji: string;
  tags: string[];
  packages: Array<{ name: string; price: number; unit: string; desc: string; delivery: string }>;
}

interface CreateServiceDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  editData?: any;
}

const TAG_SUGGESTIONS = [
  'API 集成', '全栈', 'TypeScript', 'React', 'Node.js',
  'Python', '数据分析', 'Figma', 'UI 设计', '用户体验',
  '机器学习', '自动化', 'DevOps', '云计算', '移动开发'
];

const DEFAULT_PACKAGES = [
  { name: '基础版', price: 90, unit: '/h', desc: '基础功能开发', delivery: 'online' },
  { name: '升级版', price: 120, unit: '/h', desc: '含代码审查', delivery: 'online' },
  { name: '高级版', price: 150, unit: '/h', desc: '架构设计 + 全程支持', delivery: 'online' },
];

export const CreateServiceDrawer: React.FC<CreateServiceDrawerProps> = ({
  visible,
  onClose,
  onSubmit,
  editData,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    category: '',
    type: 'manual',
    description: '',
    coverStyle: 'blue',
    emoji: '🤖',
    tags: [],
    packages: [...DEFAULT_PACKAGES],
  });
  const [tagInput, setTagInput] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  // 初始化表单数据
  React.useEffect(() => {
    if (editData) {
      setIsEditMode(true);
      setFormData({
        name: editData.name || '',
        category: editData.category || '',
        type: editData.type || 'manual',
        description: editData.description || '',
        coverStyle: editData.coverStyle || 'blue',
        emoji: editData.emoji || '🤖',
        tags: editData.tags || [],
        packages: editData.packages?.length ? editData.packages : [...DEFAULT_PACKAGES],
      });
      setCurrentStep(0);
    }
  }, [editData, visible]);

  const showToast = (title: string, message?: string) => {
    // 简单的 alert 替代，实际应该通过 props 接收
    console.log(title, message);
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      onSubmit(formData);
      if (!isEditMode) {
        resetForm();
      }
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      type: 'manual',
      description: '',
      coverStyle: 'blue',
      emoji: '🤖',
      tags: [],
      packages: [...DEFAULT_PACKAGES],
    });
    setCurrentStep(0);
    setTagInput('');
  };

  const addTag = (tag: string) => {
    if (formData.tags.length >= 10) return;
    if (!formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const tag = tagInput.trim();
      if (tag) {
        addTag(tag);
        setTagInput('');
      }
    }
  };

  const updatePackage = (index: number, field: string, value: any) => {
    const newPackages = [...formData.packages];
    newPackages[index] = { ...newPackages[index], [field]: value };
    setFormData({ ...formData, packages: newPackages });
  };

  const STEPS = [
    { title: '基本信息', icon: 'M2 3h10M2 7h7M2 11h5' },
    { title: '套餐设置', icon: 'M3 3h10v10H3zM3 15h10v3H3zM15 3h3v10h-3zM15 15h3v3h-3z' },
    { title: '机器人配置', icon: 'M3 5h10v8H3zM6 5V3.5a2 2 0 0 1 4 0V5' },
    { title: '认证申请', icon: 'M7 1l1.2 2.4 2.8.4-2 2 .5 2.7L7 7l-2.5 1.5.5-3.5L2 4.5 5.5 4Z' },
  ];

  const COVER_COLORS = [
    { name: 'blue', gradient: 'linear-gradient(135deg, #0ea5e9, #06b6d4)' },
    { name: 'green', gradient: 'linear-gradient(135deg, #059669, #10b981)' },
    { name: 'purple', gradient: 'linear-gradient(135deg, #7c3aed, #8b5cf6)' },
    { name: 'amber', gradient: 'linear-gradient(135deg, #d97706, #f59e0b)' },
    { name: 'pink', gradient: 'linear-gradient(135deg, #be185d, #f472b6)' },
    { name: 'slate', gradient: 'linear-gradient(135deg, #0f172a, #334155)' },
  ];

  return (
    <>
      <div className={`drawer-overlay ${visible ? 'open' : ''}`} onClick={onClose} />
      <div className={`drawer ${visible ? 'open' : ''}`}>
        <div className="drawer-header">
          <div>
            <div className="drawer-title">
              {isEditMode ? '编辑技能服务' : currentStep === 0 ? '创建技能服务' : currentStep === 3 ? '提交审核' : '编辑技能服务'}
            </div>
            <div className="drawer-subtitle">
              {isEditMode ? '修改服务信息，提交后重新审核' : 'F02-01 至 F02-07 · 填写后提交 AI 审核'}
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <path d="M2 2l10 10M12 2 2 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="drawer-body">
          {/* 步骤条 */}
          <div className="steps">
            {STEPS.map((step, i) => (
              <div key={i} className={`step ${currentStep === i ? 'active' : currentStep > i ? 'done' : ''}`}>
                <div className="step-num">{i + 1}</div>
                <span className="step-label">{step.title}</span>
              </div>
            ))}
          </div>

          {/* 步骤 1: 基本信息 */}
          {currentStep === 0 && (
            <>
              <div className="form-section">
                <div className="form-section-title">
                  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14">
                    <path d="M2 3h10M2 7h7M2 11h5" strokeLinecap="round" />
                  </svg>
                  基本信息
                  <span style={{ marginLeft: 'auto', fontSize: '10.5px', color: 'var(--text3)', fontWeight: 400 }}>F02-01</span>
                </div>
                <div className="form-row">
                  <div className="form-group full">
                    <label className="label">服务名称 <span className="req">*</span></label>
                    <input
                      className="input"
                      placeholder="例：React 全栈开发 · 企业级后台"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">服务类别 <span className="req">*</span></label>
                    <select
                      className="select"
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="">选择类别</option>
                      <option value="开发">开发</option>
                      <option value="设计">设计</option>
                      <option value="数据">数据</option>
                      <option value="AI">AI / 机器学习</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="label">服务类型 <span className="req">*</span></label>
                    <select
                      className="select"
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                    >
                      <option value="manual">人工服务</option>
                      <option value="robot">机器人服务</option>
                      <option value="hybrid">混合服务</option>
                    </select>
                  </div>
                  <div className="form-group full">
                    <label className="label">服务描述 <span className="req">*</span></label>
                    <textarea
                      className="textarea"
                      placeholder="详细描述您的服务内容、适用场景与交付标准..."
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '12px' }}>
                <label className="label">封面风格 <span className="opt">（可选）</span></label>
                <div className="cover-selector">
                  {COVER_COLORS.map(color => (
                    <div
                      key={color.name}
                      className={`cover-opt ${formData.coverStyle === color.name ? 'selected' : ''}`}
                      style={{ background: color.gradient }}
                      onClick={() => setFormData({ ...formData, coverStyle: color.name })}
                    />
                  ))}
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">
                  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14">
                    <path d="M1 7V2h5l6 6-5 5-6-6Z" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="4" cy="5" r="1" fill="currentColor" />
                  </svg>
                  技能标签
                  <span style={{ marginLeft: 'auto', fontSize: '10.5px', color: 'var(--text3)', fontWeight: 400 }}>
                    F02-06 · 最多 10 个，用于智能匹配
                  </span>
                </div>
                <div className="tag-input-area">
                  {formData.tags.map(tag => (
                    <span key={tag} className="tag-pill">
                      {tag}
                      <button onClick={() => removeTag(tag)}>×</button>
                    </span>
                  ))}
                  <input
                    className="tag-input"
                    placeholder="输入标签后按 Enter 或从下方选择..."
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                  />
                </div>
                <div className="tag-suggestions">
                  {TAG_SUGGESTIONS.filter(t => !formData.tags.includes(t)).slice(0, 8).map(tag => (
                    <span key={tag} className="tag-suggestion" onClick={() => addTag(tag)}>
                      + {tag}
                    </span>
                  ))}
                </div>
                <div className="input-hint" style={{ marginTop: '6px' }}>
                  已添加 {formData.tags.length}/10 个标签
                </div>
              </div>
            </>
          )}

          {/* 步骤 2: 套餐设置 */}
          {currentStep === 1 && (
            <div className="form-section">
              <div className="form-section-title">
                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14">
                  <rect x="1" y="3" width="12" height="9" rx="1.5" />
                  <path d="M1 6h12" strokeLinecap="round" />
                </svg>
                套餐设置
                <span style={{ marginLeft: 'auto', fontSize: '10.5px', color: 'var(--text3)', fontWeight: 400 }}>
                  F02-02 · 基础/升级/高级三档
                </span>
              </div>
              <div className="pkg-editor">
                {formData.packages.map((pkg, i) => (
                  <div key={i} className={`pkg-edit-card ${i === 1 ? 'recommended' : ''}`}>
                    <div className="pkg-edit-name">
                      {pkg.name}
                      {i === 1 && ' ⭐'}
                      <span>{i === 0 ? '入门套餐' : i === 1 ? '推荐' : '企业定制'}</span>
                    </div>
                    <div className="form-group">
                      <label className="label" style={{ fontSize: '11px' }}>计费方式</label>
                      <select
                        className="select"
                        style={{ fontSize: '12px', padding: '5px 8px' }}
                        value={pkg.unit ? 'hourly' : 'fixed'}
                        onChange={e => updatePackage(i, 'unit', e.target.value === 'hourly' ? '/h' : '')}
                      >
                        <option value="hourly">按时计费 (元/小时)</option>
                        <option value="fixed">固定价格</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="label" style={{ fontSize: '11px' }}>价格</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text3)' }}>¥</span>
                        <input
                          className="input"
                          style={{ fontFamily: 'var(--mono)', fontSize: '13px', padding: '6px 8px' }}
                          type="number"
                          value={pkg.price}
                          onChange={e => updatePackage(i, 'price', Number(e.target.value))}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="label" style={{ fontSize: '11px' }}>说明</label>
                      <input
                        className="input"
                        style={{ fontSize: '12px', padding: '6px 8px' }}
                        placeholder={i === 0 ? '基础功能描述' : i === 1 ? '含代码审查、优化建议' : '架构设计 + 全程技术支持'}
                        value={pkg.desc}
                        onChange={e => updatePackage(i, 'desc', e.target.value)}
                      />
                    </div>
                    <div className="pkg-delivery">
                      <div className="pkg-delivery-label">交付方式</div>
                      <div className="pkg-delivery-options">
                        <div
                          className={`pkg-delivery-option ${pkg.delivery === 'online' ? 'selected' : ''}`}
                          onClick={() => updatePackage(i, 'delivery', 'online')}
                        >
                          线上交付
                        </div>
                        <div
                          className={`pkg-delivery-option ${pkg.delivery === 'onsite' ? 'selected' : ''}`}
                          onClick={() => updatePackage(i, 'delivery', 'onsite')}
                        >
                          现场支持
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 步骤 3: 机器人配置 */}
          {currentStep === 2 && (
            <div className="form-section">
              <div className="form-section-title">
                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14">
                  <rect x="2" y="4" width="10" height="8" rx="1.5" />
                  <path d="M5 4V3a2 2 0 0 1 4 0v1" strokeLinecap="round" />
                  <circle cx="5" cy="8" r=".8" fill="currentColor" />
                  <circle cx="9" cy="8" r=".8" fill="currentColor" />
                </svg>
                机器人配置
                <span style={{ marginLeft: 'auto', fontSize: '10.5px', color: 'var(--text3)', fontWeight: 400 }}>
                  F02-03 · F02-04 · OpenClaw 接入
                </span>
              </div>
              <div className="robot-config">
                <div className="robot-config-header">
                  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15">
                    <rect x="2" y="4" width="10" height="8" rx="1.5" />
                    <path d="M5 4V3a2 2 0 0 1 4 0v1" strokeLinecap="round" />
                    <circle cx="5" cy="8" r=".8" fill="currentColor" />
                    <circle cx="9" cy="8" r=".8" fill="currentColor" />
                  </svg>
                  <strong>OpenClaw 机器人 · DataBot v2.1</strong>
                </div>
                <div className="robot-status-row">
                  <div className="robot-dot" />
                  <span style={{ fontSize: '12.5px', color: 'var(--text2)' }}>已绑定 · 在线</span>
                  <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text3)' }}>上次心跳：刚刚</span>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <div className="label" style={{ marginBottom: '4px', fontSize: '11px' }}>
                    访问 Token <span style={{ fontSize: '10px', color: 'var(--text3)', fontWeight: 400 }}>
                      （5 秒内同步至机器人端）
                    </span>
                  </div>
                  <div className="token-display">
                    <div className="token-val">uxin_tok_••••••••••••••••••••••••••••••••4f8e</div>
                    <button className="token-copy" title="复制">
                      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" width="12" height="12">
                        <rect x="3" y="3" width="7" height="8" rx="1" />
                        <path d="M1 8V2a1 1 0 0 1 1-1h6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="auto-rule">
                  <span>自动接单规则（接收所有标准任务）</span>
                  <button className="toggle on" />
                </div>
                <div className="auto-rule" style={{ marginTop: '6px' }}>
                  <span>单任务预算上限 ¥1,000</span>
                  <button className="toggle on" />
                </div>
                <div className="auto-rule" style={{ marginTop: '6px' }}>
                  <span>工作时间外暂停接单</span>
                  <button className="toggle" />
                </div>
                <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                  <button className="btn btn-ghost" style={{ fontSize: '12px' }}>更换机器人</button>
                  <button className="btn btn-ghost" style={{ fontSize: '12px', color: 'var(--red)' }}>吊销 Token</button>
                </div>
              </div>
            </div>
          )}

          {/* 步骤 4: 认证申请 */}
          {currentStep === 3 && (
            <div className="form-section">
              <div className="form-section-title">
                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14">
                  <circle cx="7" cy="7" r="5.5" />
                  <path d="M7 4v4M7 9.5v.5" strokeLinecap="round" />
                </svg>
                认证申请
                <span style={{ marginLeft: 'auto', fontSize: '10.5px', color: 'var(--text3)', fontWeight: 400 }}>
                  F02-05 · 联系客服助手发起
                </span>
              </div>
              <div className="cert-block">
                <div className="cert-block-header">
                  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15">
                    <circle cx="7" cy="7" r="5.5" />
                    <path d="M7 4v4M7 9.5v.5" strokeLinecap="round" />
                  </svg>
                  认证可显著提升服务曝光与订单转化率（平均提升 3.2×）
                </div>
                <div className="form-row">
                  <div className="form-group full">
                    <div className="upload-zone">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24">
                        <path d="M12 16V4M8 8l4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p>上传认证材料</p>
                      <span>资质证书 · 作品集 · 项目截图（PNG/JPG/PDF，最大 20MB）</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="label">认证等级</label>
                    <select className="select">
                      <option>初级认证（¥99/年）</option>
                      <option>高级认证（¥299/年）</option>
                      <option>专家认证（¥599/年）</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="label">认证联系方式</label>
                    <input className="input" placeholder="通过客服助手发起认证审核" />
                  </div>
                </div>
                <div style={{ marginTop: '12px', padding: '12px', background: '#fff', border: '1px solid var(--border)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text2)', marginBottom: '8px' }}>认证权益</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11.5px', color: 'var(--text3)' }}>
                    <div>✓ 搜索排名优先</div>
                    <div>✓ 专属认证标识</div>
                    <div>✓ 更高佣金比例</div>
                    <div>✓ 专属客服支持</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="drawer-footer">
          <span className="draft-hint">
            {isEditMode 
              ? '💾 草稿已自动保存 · 修改后提交重新审核'
              : '💾 草稿已自动保存 · 提交后进入 AI 审核队列（预计 2-4 小时）'
            }
          </span>
          <button className="btn btn-ghost" onClick={onClose}>取消</button>
          <button className="btn btn-ghost" onClick={() => showToast('info', '草稿已保存', '您可稍后继续编辑')}>保存草稿</button>
          {currentStep > 0 && (
            <button className="btn btn-ghost" onClick={handlePrev}>上一步</button>
          )}
          <button className="btn btn-primary" onClick={handleNext}>
            {currentStep < 3 ? '下一步' : isEditMode ? '保存修改' : '提交审核'}
          </button>
        </div>
      </div>
    </>
  );
};
