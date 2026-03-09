/**
 * 回复模板管理页面
 * 包含：模板列表、新建模板、编辑模板、分类管理等
 */

import React, { useState } from 'react';
import './ReplyTemplates.css';

interface ReplyTemplate {
  id: string;
  name: string;
  content: string;
  category: 'thanks' | 'apology' | 'guide' | 'other';
  usage: number;
  createdAt: string;
}

const mockTemplates: ReplyTemplate[] = [
  {
    id: 'tpl-001',
    name: '感谢好评',
    content: '非常感谢您的认可！我们会继续努力提供高质量的服务。如果您有任何其他需求，随时联系我们！',
    category: 'thanks',
    usage: 156,
    createdAt: '2026-02-15',
  },
  {
    id: 'tpl-002',
    name: '道歉回复',
    content: '非常抱歉给您带来了不好的体验。我们会立即改进这个问题，并为您提供补偿方案。感谢您的理解和反馈！',
    category: 'apology',
    usage: 89,
    createdAt: '2026-02-20',
  },
  {
    id: 'tpl-003',
    name: '使用引导',
    content: '感谢您的订购！请按以下步骤开始使用服务：\n1. 点击"开始服务"按钮\n2. 填写需求描述\n3. 等待服务启动\n如有任何问题，请随时联系我们。',
    category: 'guide',
    usage: 234,
    createdAt: '2026-02-10',
  },
  {
    id: 'tpl-004',
    name: '交付通知',
    content: '您的服务已完成交付！请查看交付内容并确认验收。如有任何修改意见，请在 3 天内提出，我们会免费为您调整。',
    category: 'guide',
    usage: 178,
    createdAt: '2026-02-25',
  },
  {
    id: 'tpl-005',
    name: '中评回复',
    content: '感谢您的反馈！我们会认真对待您的建议，不断改进服务质量。希望能有机会为您提供更好的服务体验。',
    category: 'other',
    usage: 67,
    createdAt: '2026-03-01',
  },
];

export const ReplyTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<ReplyTemplate[]>(mockTemplates);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ReplyTemplate | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'thanks' | 'apology' | 'guide' | 'other'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = templates.filter(t => {
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      thanks: '感谢回复',
      apology: '道歉回复',
      guide: '使用引导',
      other: '其他',
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      thanks: '#10b981',
      apology: '#f59e0b',
      guide: '#0ea5e9',
      other: '#6b7280',
    };
    return colors[category] || '#6b7280';
  };

  const deleteTemplate = (id: string) => {
    if (confirm('确定要删除此模板吗？')) {
      setTemplates(prev => prev.filter(t => t.id !== id));
    }
  };

  const duplicateTemplate = (template: ReplyTemplate) => {
    const newTemplate = {
      ...template,
      id: `tpl-${Date.now()}`,
      name: `${template.name} (副本)`,
      usage: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTemplates(prev => [...prev, newTemplate]);
  };

  return (
    <div className="reply-templates">
      {/* 顶部导航 */}
      <nav className="mgmt-topnav">
        <div className="market-logo">
          <span className="logo-icon">🛠️</span>
          <span className="logo-text">技能服务市场 · 回复模板</span>
        </div>
        <ul className="market-nav-links">
          <li><a href="/market">服务市场</a></li>
          <li><a href="/market/manage">服务管理</a></li>
          <li><a href="/market/reviews" className="active">评价管理</a></li>
          <li><a href="#" className="active">回复模板</a></li>
        </ul>
      </nav>

      <div className="templates-layout">
        {/* 侧边栏 */}
        <aside className="mgmt-sidenav">
          <div className="sidenav-section">
            <div className="sidenav-label">模板分类</div>
            <div
              className={`nav-item ${categoryFilter === 'all' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('all')}
            >
              全部模板
              <span className="nav-badge">{templates.length}</span>
            </div>
            <div
              className={`nav-item ${categoryFilter === 'thanks' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('thanks')}
            >
              感谢回复
            </div>
            <div
              className={`nav-item ${categoryFilter === 'apology' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('apology')}
            >
              道歉回复
            </div>
            <div
              className={`nav-item ${categoryFilter === 'guide' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('guide')}
            >
              使用引导
            </div>
            <div
              className={`nav-item ${categoryFilter === 'other' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('other')}
            >
              其他
            </div>
          </div>

          <div className="sidenav-footer">
            <button className="btn-new-template" onClick={() => setShowModal(true)}>
              + 新建模板
            </button>
          </div>
        </aside>

        {/* 主内容区 */}
        <main className="templates-main">
          {/* 顶部栏 */}
          <div className="templates-header">
            <h1>回复模板管理</h1>
            <div className="header-actions">
              <div className="search-box">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="6" cy="6" r="4.5" />
                  <path d="m11 11 2.5 2.5" strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  placeholder="搜索模板..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="btn-primary" onClick={() => setShowModal(true)}>
                + 新建模板
              </button>
            </div>
          </div>

          {/* 模板列表 */}
          <div className="templates-grid">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="template-card">
                <div className="template-header">
                  <div className="template-name">{template.name}</div>
                  <span
                    className="template-category"
                    style={{
                      background: `${getCategoryColor(template.category)}20`,
                      color: getCategoryColor(template.category),
                    }}
                  >
                    {getCategoryLabel(template.category)}
                  </span>
                </div>

                <div className="template-content">
                  {template.content}
                </div>

                <div className="template-footer">
                  <div className="template-stats">
                    <span className="usage-count">已使用 {template.usage} 次</span>
                    <span className="create-date">{template.createdAt}</span>
                  </div>
                  <div className="template-actions">
                    <button
                      className="action-btn copy"
                      onClick={() => navigator.clipboard.writeText(template.content)}
                    >
                      复制
                    </button>
                    <button
                      className="action-btn edit"
                      onClick={() => {
                        setEditingTemplate(template);
                        setShowModal(true);
                      }}
                    >
                      编辑
                    </button>
                    <button
                      className="action-btn duplicate"
                      onClick={() => duplicateTemplate(template)}
                    >
                      复制
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => deleteTemplate(template.id)}
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* 新建/编辑模板弹窗 */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="template-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTemplate ? '编辑模板' : '新建模板'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">模板名称</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="例：感谢好评、道歉回复..."
                  defaultValue={editingTemplate?.name}
                />
              </div>

              <div className="form-group">
                <label className="form-label">模板分类</label>
                <select className="form-select" defaultValue={editingTemplate?.category}>
                  <option value="thanks">感谢回复</option>
                  <option value="apology">道歉回复</option>
                  <option value="guide">使用引导</option>
                  <option value="other">其他</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">回复内容</label>
                <textarea
                  className="form-textarea"
                  placeholder="请输入模板内容，支持换行..."
                  rows={8}
                  defaultValue={editingTemplate?.content}
                />
                <div className="form-hint">
                  提示：使用 {"{name}"} 可以插入用户昵称，使用 {"{service}"} 可以插入服务名称
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">快捷短语</label>
                <div className="quick-phrases">
                  <button className="phrase-tag">{"{name}"}</button>
                  <button className="phrase-tag">{"{service}"}</button>
                  <button className="phrase-tag">{"{date}"}</button>
                  <button className="phrase-tag">{"{order_id}"}</button>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setShowModal(false)}>取消</button>
              <button className="btn-primary">
                {editingTemplate ? '保存修改' : '创建模板'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
