/**
 * 服务发布页面 - 自由职业者/机器人开发者发布技能服务
 * 包含：基本信息、定价配置、技能标签、接入配置等
 */

import React, { useState } from 'react';
import './ServicePublish.css';

interface PricingTier {
  name: string;
  price: number;
  features: string[];
}

export const ServicePublish: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    serviceName: '',
    description: '',
    category: '',
    providerType: 'bot' as 'ai' | 'bot' | 'hybrid',
    avatar: '🤖',
    pricing: {
      basic: { name: '基础版', price: 90, features: ['基础功能', '标准支持'] },
      premium: { name: '升级版', price: 120, features: ['全部功能', '优先支持'] },
      enterprise: { name: '企业版', price: 150, features: ['定制开发', '专属客服'] },
    },
    skills: [] as string[],
    deliveryTime: '24 小时',
    revisions: 3,
    autoAccept: true,
    maxBudget: 1000,
  });

  const [newSkill, setNewSkill] = useState('');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePricingChange = (tier: 'basic' | 'premium' | 'enterprise', field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [tier]: { ...prev.pricing[tier], [field]: value }
      }
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && formData.skills.length < 10) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }));
  };

  const handleSubmit = () => {
    console.log('提交服务发布:', formData);
    alert('服务发布申请已提交，等待 AI 审核！');
  };

  const steps = [
    { num: 1, title: '基本信息', desc: '服务名称、描述、分类' },
    { num: 2, title: '定价配置', desc: 'F02-02 三档定价' },
    { num: 3, title: '技能标签', desc: 'F02-06 用于智能匹配' },
    { num: 4, title: '接入配置', desc: 'F02-03/04 OpenClaw 接入' },
    { num: 5, title: '审核发布', desc: 'F02-05 提交 AI 审核' },
  ];

  return (
    <div className="service-publish">
      {/* 顶部导航 */}
      <nav className="publish-topnav">
        <div className="market-logo">
          <span className="logo-icon">🛠️</span>
          <span className="logo-text">技能服务市场</span>
        </div>
        <ul className="market-nav-links">
          <li><a href="/market">服务市场</a></li>
          <li><a href="#">我的订阅</a></li>
          <li><a href="#" className="active">服务管理</a></li>
          <li><a href="#">收益统计</a></li>
        </ul>
        <div className="market-nav-right">
          <button className="btn-ghost">返回市场</button>
        </div>
      </nav>

      {/* 发布向导 */}
      <div className="publish-wizard">
        <div className="wizard-header">
          <h1>发布新服务</h1>
          <p>F02-01 至 F02-07 · 填写后提交 AI 审核</p>
        </div>

        {/* 步骤导航 */}
        <div className="wizard-steps">
          {steps.map((step, index) => (
            <div
              key={step.num}
              className={`wizard-step ${currentStep === step.num ? 'active' : ''} ${currentStep > step.num ? 'done' : ''}`}
              onClick={() => setCurrentStep(step.num)}
            >
              <div className="step-number">
                {currentStep > step.num ? '✓' : step.num}
              </div>
              <div className="step-info">
                <div className="step-title">{step.title}</div>
                <div className="step-desc">{step.desc}</div>
              </div>
              {index < steps.length - 1 && <div className="step-line" />}
            </div>
          ))}
        </div>

        {/* 步骤内容 */}
        <div className="wizard-content">
          {/* 步骤 1: 基本信息 */}
          {currentStep === 1 && (
            <div className="step-panel">
              <h2>基本信息</h2>
              
              <div className="form-group">
                <label className="form-label">服务名称 <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="例：智能数据分析师 · 自动化报告生成"
                  value={formData.serviceName}
                  onChange={(e) => handleInputChange('serviceName', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">服务描述 <span className="required">*</span></label>
                <textarea
                  className="form-textarea"
                  placeholder="详细描述您的服务内容、适用场景、交付形式等..."
                  rows={5}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">服务分类 <span className="required">*</span></label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                  >
                    <option value="">选择分类</option>
                    <option value="dev">开发编程</option>
                    <option value="design">设计创意</option>
                    <option value="data">数据分析</option>
                    <option value="writing">文案写作</option>
                    <option value="marketing">营销推广</option>
                    <option value="support">客服支持</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">服务类型 <span className="required">*</span></label>
                  <div className="type-selector">
                    <div
                      className={`type-option ${formData.providerType === 'bot' ? 'selected' : ''}`}
                      onClick={() => handleInputChange('providerType', 'bot')}
                    >
                      <span className="type-icon">🤖</span>
                      <span className="type-name">机器人</span>
                      <span className="type-desc">全自动服务</span>
                    </div>
                    <div
                      className={`type-option ${formData.providerType === 'ai' ? 'selected' : ''}`}
                      onClick={() => handleInputChange('providerType', 'ai')}
                    >
                      <span className="type-icon">✨</span>
                      <span className="type-name">AI 服务</span>
                      <span className="type-desc">AI 驱动</span>
                    </div>
                    <div
                      className={`type-option ${formData.providerType === 'hybrid' ? 'selected' : ''}`}
                      onClick={() => handleInputChange('providerType', 'hybrid')}
                    >
                      <span className="type-icon">⚡</span>
                      <span className="type-name">人机协作</span>
                      <span className="type-desc">人工 +AI</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">服务头像</label>
                <div className="avatar-selector">
                  {['🤖', '🎨', '⚡', '📄', '✅', '🔍', '🎧', '✍️'].map((emoji) => (
                    <button
                      key={emoji}
                      className={`avatar-option ${formData.avatar === emoji ? 'selected' : ''}`}
                      onClick={() => handleInputChange('avatar', emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 步骤 2: 定价配置 */}
          {currentStep === 2 && (
            <div className="step-panel">
              <h2>定价配置 <span className="step-subtitle">F02-02 · 基础/升级/高级三档</span></h2>
              
              <div className="pricing-grid">
                {(['basic', 'premium', 'enterprise'] as const).map((tier) => (
                  <div key={tier} className="pricing-card">
                    <div className="pricing-header">
                      <input
                        type="text"
                        className="pricing-name"
                        value={formData.pricing[tier].name}
                        onChange={(e) => handlePricingChange(tier, 'name', e.target.value)}
                      />
                      {tier === 'premium' && <span className="popular-tag">热门推荐</span>}
                    </div>
                    
                    <div className="pricing-body">
                      <div className="price-input-group">
                        <span className="currency">¥</span>
                        <input
                          type="number"
                          className="price-input"
                          value={formData.pricing[tier].price}
                          onChange={(e) => handlePricingChange(tier, 'price', parseInt(e.target.value) || 0)}
                        />
                        <span className="unit">/ 小时</span>
                      </div>

                      <div className="features-input">
                        <label className="feature-label">服务特色</label>
                        {formData.pricing[tier].features.map((feature, index) => (
                          <div key={index} className="feature-item">
                            <input
                              type="text"
                              value={feature}
                              onChange={(e) => {
                                const newFeatures = [...formData.pricing[tier].features];
                                newFeatures[index] = e.target.value;
                                handlePricingChange(tier, 'features', newFeatures);
                              }}
                            />
                            <button
                              className="remove-feature"
                              onClick={() => {
                                const newFeatures = formData.pricing[tier].features.filter((_, i) => i !== index);
                                handlePricingChange(tier, 'features', newFeatures);
                              }}
                            >×</button>
                          </div>
                        ))}
                        <button
                          className="add-feature"
                          onClick={() => {
                            handlePricingChange(tier, 'features', [...formData.pricing[tier].features, '']);
                          }}
                        >+ 添加特色</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">交付时间</label>
                  <select
                    className="form-select"
                    value={formData.deliveryTime}
                    onChange={(e) => handleInputChange('deliveryTime', e.target.value)}
                  >
                    <option value="即时">即时</option>
                    <option value="6 小时">6 小时</option>
                    <option value="12 小时">12 小时</option>
                    <option value="24 小时">24 小时</option>
                    <option value="48 小时">48 小时</option>
                    <option value="7 天">7 天</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">免费修改次数</label>
                  <select
                    className="form-select"
                    value={formData.revisions}
                    onChange={(e) => handleInputChange('revisions', parseInt(e.target.value))}
                  >
                    <option value={1}>1 次</option>
                    <option value={2}>2 次</option>
                    <option value={3}>3 次</option>
                    <option value={5}>5 次</option>
                    <option value={999}>无限次</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 步骤 3: 技能标签 */}
          {currentStep === 3 && (
            <div className="step-panel">
              <h2>技能标签 <span className="step-subtitle">F02-06 · 最多 10 个，用于智能匹配</span></h2>
              
              <div className="form-group">
                <label className="form-label">添加技能标签</label>
                <div className="skill-input-group">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="输入技能标签，如：React、Python、数据分析..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  />
                  <button className="btn-add" onClick={addSkill}>添加</button>
                </div>
                <p className="skill-hint">已添加 {formData.skills.length}/10 个标签</p>
              </div>

              <div className="skills-display">
                {formData.skills.map((skill, index) => (
                  <div key={index} className="skill-tag">
                    {skill}
                    <button onClick={() => removeSkill(index)}>×</button>
                  </div>
                ))}
                {formData.skills.length === 0 && (
                  <p className="no-skills">暂无技能标签，请添加</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">自动接单设置</label>
                <div className="toggle-group">
                  <div className="toggle-row">
                    <span>开启自动接单</span>
                    <button
                      className={`toggle ${formData.autoAccept ? 'on' : ''}`}
                      onClick={() => handleInputChange('autoAccept', !formData.autoAccept)}
                    />
                  </div>
                  <div className="toggle-row">
                    <span>单任务预算上限 ¥1,000</span>
                    <button
                      className={`toggle on`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 步骤 4: 接入配置 */}
          {currentStep === 4 && (
            <div className="step-panel">
              <h2>接入配置 <span className="step-subtitle">F02-03 · F02-04 · OpenClaw 接入</span></h2>
              
              <div className="form-group">
                <label className="form-label">OpenClaw 接入端点</label>
                <input
                  type="text"
                  className="form-input mono"
                  placeholder="wss://your-bot.openclaw.io/api"
                />
                <p className="form-hint">WebSocket 协议端点，用于建立安全通信</p>
              </div>

              <div className="form-group">
                <label className="form-label">机器人版本</label>
                <input
                  type="text"
                  className="form-input mono"
                  placeholder="v1.0.0"
                  defaultValue="v2.1.0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Token 配置</label>
                <div className="token-display">
                  <div className="token-value">uxin_tok_••••••••••••••••••••</div>
                  <button className="btn-copy">复制</button>
                </div>
                <p className="form-hint">将 Token 配置到您的 OpenClaw 机器人，或点击"自动同步"</p>
              </div>

              <div className="form-group">
                <label className="form-label">安全配置</label>
                <div className="toggle-group">
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
              </div>
            </div>
          )}

          {/* 步骤 5: 审核发布 */}
          {currentStep === 5 && (
            <div className="step-panel">
              <h2>审核发布 <span className="step-subtitle">F02-05 · 联系客服助手发起</span></h2>
              
              <div className="preview-card">
                <h3>服务预览</h3>
                <div className="preview-content">
                  <div className="preview-avatar">{formData.avatar}</div>
                  <div className="preview-info">
                    <h4>{formData.serviceName || '未命名服务'}</h4>
                    <p>{formData.description || '暂无描述'}</p>
                    <div className="preview-meta">
                      <span>分类：{formData.category || '未选择'}</span>
                      <span>类型：{formData.providerType}</span>
                      <span>交付：{formData.deliveryTime}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="checklist">
                <h3>发布前检查</h3>
                <div className="check-item">
                  <input type="checkbox" id="check1" />
                  <label htmlFor="check1">服务信息填写完整</label>
                </div>
                <div className="check-item">
                  <input type="checkbox" id="check2" />
                  <label htmlFor="check2">定价配置合理</label>
                </div>
                <div className="check-item">
                  <input type="checkbox" id="check3" />
                  <label htmlFor="check3">技能标签准确（至少 3 个）</label>
                </div>
                <div className="check-item">
                  <input type="checkbox" id="check4" />
                  <label htmlFor="check4">OpenClaw 接入配置正确</label>
                </div>
              </div>

              <div className="submit-info">
                <p>提交后，AI 将在 <strong>2-4 小时</strong> 内完成审核</p>
                <p>审核结果将通过消息通知您</p>
              </div>
            </div>
          )}
        </div>

        {/* 底部操作按钮 */}
        <div className="wizard-footer">
          <button
            className="btn-prev"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            ← 上一步
          </button>
          
          {currentStep < 5 ? (
            <button
              className="btn-next"
              onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
            >
              下一步 →
            </button>
          ) : (
            <button
              className="btn-submit"
              onClick={handleSubmit}
            >
              提交审核
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
