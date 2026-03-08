import React, { useState } from 'react';

interface TaskFormProps {
  data?: {
    task_id?: string;
    title?: string;
    description?: string;
    status?: 'pending' | 'in_progress' | 'completed' | 'blocked';
    priority?: 'low' | 'medium' | 'high' | 'critical';
    assignee_id?: string;
    due_date?: string;
    estimated_hours?: number;
    labels?: string[];
  };
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
}

export function TaskForm({ data, onSubmit, onCancel }: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: data?.title || '',
    description: data?.description || '',
    status: data?.status || 'pending',
    priority: data?.priority || 'medium',
    assignee_id: data?.assignee_id || '',
    due_date: data?.due_date || '',
    estimated_hours: data?.estimated_hours || 0,
    labels: data?.labels || []
  });

  const [newLabel, setNewLabel] = useState('');

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.({
      ...formData,
      task_id: data?.task_id
    });
  };

  const handleAddLabel = () => {
    if (newLabel.trim()) {
      handleChange('labels', [...formData.labels, newLabel.trim()]);
      setNewLabel('');
    }
  };

  const handleRemoveLabel = (label: string) => {
    handleChange('labels', formData.labels.filter(l => l !== label));
  };

  return (
    <div className="task-form">
      {/* 头部 */}
      <div className="form-header">
        <h2 className="form-title">
          {data?.task_id ? '编辑任务' : '创建任务'}
        </h2>
      </div>

      {/* 表单内容 */}
      <form onSubmit={handleSubmit} className="form-content">
        {/* 标题 */}
        <div className="form-group">
          <label className="form-label">
            标题 <span className="required">*</span>
          </label>
          <input
            type="text"
            className="form-input"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="请输入任务标题"
            required
          />
        </div>

        {/* 描述 */}
        <div className="form-group">
          <label className="form-label">描述</label>
          <textarea
            className="form-textarea"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="请输入任务描述"
            rows={4}
          />
        </div>

        {/* 状态和优先级 */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">状态</label>
            <select
              className="form-select"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              <option value="pending">待处理</option>
              <option value="in_progress">进行中</option>
              <option value="completed">已完成</option>
              <option value="blocked">阻塞</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">优先级</label>
            <select
              className="form-select"
              value={formData.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
            >
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
              <option value="critical">紧急</option>
            </select>
          </div>
        </div>

        {/* 负责人和截止日期 */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">负责人</label>
            <input
              type="text"
              className="form-input"
              value={formData.assignee_id}
              onChange={(e) => handleChange('assignee_id', e.target.value)}
              placeholder="请输入负责人"
            />
          </div>

          <div className="form-group">
            <label className="form-label">截止日期</label>
            <input
              type="date"
              className="form-input"
              value={formData.due_date}
              onChange={(e) => handleChange('due_date', e.target.value)}
            />
          </div>
        </div>

        {/* 预估工时 */}
        <div className="form-group">
          <label className="form-label">预估工时（小时）</label>
          <input
            type="number"
            className="form-input"
            value={formData.estimated_hours}
            onChange={(e) => handleChange('estimated_hours', parseInt(e.target.value) || 0)}
            placeholder="请输入预估工时"
            min="0"
            step="0.5"
          />
        </div>

        {/* 标签 */}
        <div className="form-group">
          <label className="form-label">标签</label>
          <div className="label-input-group">
            <input
              type="text"
              className="form-input"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="输入标签后按回车添加"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddLabel();
                }
              }}
            />
            <button
              type="button"
              className="btn btn-add-label"
              onClick={handleAddLabel}
            >
              添加
            </button>
          </div>
          {formData.labels.length > 0 && (
            <div className="label-list">
              {formData.labels.map((label, index) => (
                <span key={index} className="label-tag">
                  {label}
                  <button
                    type="button"
                    className="label-remove"
                    onClick={() => handleRemoveLabel(label)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 底部操作按钮 */}
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            取消
          </button>
          <button type="submit" className="btn btn-primary">
            {data?.task_id ? '更新' : '创建'}
          </button>
        </div>
      </form>

      {/* 样式 */}
      <style>{`
        .task-form {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          max-width: 800px;
          margin: 0 auto;
        }

        .form-header {
          padding: 20px 24px;
          border-bottom: 1px solid #e8e8e8;
          background: linear-gradient(135deg, #00b42a 0%, #23c343 100%);
          color: white;
        }

        .form-title {
          font-size: 20px;
          font-weight: 600;
          margin: 0;
        }

        .form-content {
          padding: 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #1f2329;
          margin-bottom: 8px;
        }

        .required {
          color: #f5222d;
          margin-left: 4px;
        }

        .form-input,
        .form-textarea,
        .form-select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d9d9d9;
          border-radius: 4px;
          font-size: 14px;
          transition: all 0.3s;
          font-family: inherit;
        }

        .form-input:focus,
        .form-textarea:focus,
        .form-select:focus {
          border-color: #00b42a;
          outline: none;
          box-shadow: 0 0 0 2px rgba(0, 180, 42, 0.2);
        }

        .form-textarea {
          resize: vertical;
          min-height: 100px;
        }

        .form-select {
          cursor: pointer;
          background: white;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .label-input-group {
          display: flex;
          gap: 8px;
        }

        .btn-add-label {
          padding: 8px 16px;
          background: #00b42a;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s;
          white-space: nowrap;
        }

        .btn-add-label:hover {
          background: #23c343;
        }

        .label-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }

        .label-tag {
          display: inline-flex;
          align-items: center;
          padding: 4px 12px;
          background: #f0f2f5;
          border-radius: 4px;
          font-size: 13px;
          color: #1f2329;
          gap: 6px;
        }

        .label-remove {
          background: none;
          border: none;
          color: #646a73;
          cursor: pointer;
          font-size: 16px;
          padding: 0 4px;
          line-height: 1;
        }

        .label-remove:hover {
          color: #f5222d;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding-top: 20px;
          border-top: 1px solid #e8e8e8;
        }

        .btn {
          padding: 8px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s;
        }

        .btn-primary {
          background: #00b42a;
          color: white;
        }

        .btn-primary:hover {
          background: #23c343;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 180, 42, 0.3);
        }

        .btn-secondary {
          background: #f0f2f5;
          color: #1f2329;
        }

        .btn-secondary:hover {
          background: #e3e5e8;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
