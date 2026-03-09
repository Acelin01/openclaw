/**
 * 新建任务页面 - React 版本
 * 参考文档：/docs/项目协作/任务_新建.md
 */

import React, { useState } from 'react';
import './TaskCreate.css';

interface TaskFormData {
  title: string;
  description: string;
  parentTask?: string;
  status: 'todo' | 'inprogress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  startDate?: string;
  dueDate?: string;
  tags: string[];
  iteration?: string;
  storyPoints?: number;
}

export const TaskCreate: React.FC = () => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    tags: [],
  });
  const [showParentInput, setShowParentInput] = useState(false);
  const [parentSearch, setParentSearch] = useState('');
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  const handleInputChange = (field: keyof TaskFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleInputChange('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      alert('请输入任务标题');
      return;
    }
    console.log('提交任务:', formData);
    alert('任务创建成功！');
  };

  return (
    <div className="task-create-page">
      {/* 顶部导航 */}
      <nav className="task-topnav">
        <div className="market-logo">
          <span className="logo-icon">✅</span>
          <span className="logo-text">任务管理</span>
        </div>
        <ul className="market-nav-links">
          <li><a href="/market">服务市场</a></li>
          <li><a href="/task-manage">任务管理</a></li>
          <li><a href="#" className="active">新建任务</a></li>
        </ul>
      </nav>

      {/* 主内容区 */}
      <div className="task-create-content">
        <div className="create-header">
          <h1>新建任务</h1>
          <div className="header-actions">
            <button className="btn btn-ghost">取消</button>
            <button className="btn btn-primary" onClick={handleSubmit}>创建任务</button>
          </div>
        </div>

        <div className="create-body">
          {/* 左侧编辑区 */}
          <div className="editor-section">
            <div className="title-container">
              <input
                type="text"
                className="title-input"
                placeholder="输入任务标题..."
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
              
              {/* 父任务输入框 */}
              <div className={`parent-input-container ${showParentInput ? 'active' : ''}`}>
                <div className="parent-input-wrapper">
                  <input
                    type="text"
                    className="parent-input"
                    placeholder="搜索父任务..."
                    value={parentSearch}
                    onChange={(e) => setParentSearch(e.target.value)}
                  />
                  <button
                    className="parent-input-cancel"
                    onClick={() => {
                      setShowParentInput(false);
                      setParentSearch('');
                      handleInputChange('parentTask', undefined);
                    }}
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>

            <div className="editor-scroll-container">
              {/* 描述编辑区 */}
              <div className="description-section">
                <div className="section-header">
                  <span className="section-title">描述</span>
                </div>
                <textarea
                  className="description-textarea"
                  placeholder="添加任务描述，支持 Markdown 格式..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={8}
                />
              </div>

              {/* 标签区域 */}
              <div className="tags-section">
                <div className="section-header">
                  <span className="section-title">标签</span>
                  <button
                    className="btn-add-tag"
                    onClick={() => setShowTagInput(!showTagInput)}
                  >
                    + 添加标签
                  </button>
                </div>
                <div className="tags-list">
                  {formData.tags.map((tag, index) => (
                    <div key={index} className="tag-item">
                      <span>{tag}</span>
                      <button onClick={() => removeTag(tag)}>×</button>
                    </div>
                  ))}
                  {showTagInput && (
                    <div className="tag-input-wrapper">
                      <input
                        type="text"
                        className="tag-input"
                        placeholder="输入标签名称..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      />
                      <button className="btn-confirm" onClick={addTag}>确认</button>
                      <button className="btn-cancel" onClick={() => setShowTagInput(false)}>取消</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 右侧属性栏 */}
          <div className="attributes-panel">
            {/* 父任务 */}
            <div className="attribute-item">
              <label className="attribute-label">父任务</label>
              <div className="attribute-value">
                {formData.parentTask ? (
                  <div className="parent-task-display">
                    <span>{formData.parentTask}</span>
                    <button onClick={() => handleInputChange('parentTask', undefined)}>×</button>
                  </div>
                ) : (
                  <button
                    className="btn-add-attribute"
                    onClick={() => setShowParentInput(true)}
                  >
                    + 设置父任务
                  </button>
                )}
              </div>
            </div>

            {/* 状态 */}
            <div className="attribute-item">
              <label className="attribute-label">状态</label>
              <select
                className="attribute-select"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <option value="todo">待处理</option>
                <option value="inprogress">进行中</option>
                <option value="done">已完成</option>
              </select>
            </div>

            {/* 优先级 */}
            <div className="attribute-item">
              <label className="attribute-label">优先级</label>
              <select
                className="attribute-select"
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>
            </div>

            {/* 负责人 */}
            <div className="attribute-item">
              <label className="attribute-label">负责人</label>
              <div className="attribute-value">
                <button className="btn-add-attribute">+ 指派负责人</button>
              </div>
            </div>

            {/* 开始日期 */}
            <div className="attribute-item">
              <label className="attribute-label">开始日期</label>
              <input
                type="date"
                className="attribute-date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
              />
            </div>

            {/* 截止日期 */}
            <div className="attribute-item">
              <label className="attribute-label">截止日期</label>
              <input
                type="date"
                className="attribute-date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
              />
            </div>

            {/* 迭代 */}
            <div className="attribute-item">
              <label className="attribute-label">迭代</label>
              <select className="attribute-select">
                <option value="">未分配</option>
                <option value="1.0">迭代 1.0</option>
                <option value="1.1">迭代 1.1</option>
                <option value="2.0">迭代 2.0</option>
              </select>
            </div>

            {/* 故事点 */}
            <div className="attribute-item">
              <label className="attribute-label">故事点</label>
              <input
                type="number"
                className="attribute-number"
                placeholder="0"
                value={formData.storyPoints}
                onChange={(e) => handleInputChange('storyPoints', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
