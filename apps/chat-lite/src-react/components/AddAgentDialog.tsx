import React, { useState } from 'react';
import './AddAgentDialog.css';

export interface NewAgentData {
  name: string;
  description: string;
  gatewayUrl: string;
  gatewayToken: string;
  model: string;
  skills: string[];
}

interface AddAgentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: NewAgentData) => void;
}

const AddAgentDialog: React.FC<AddAgentDialogProps> = ({
  isOpen,
  onClose,
  onAdd
}) => {
  const [formData, setFormData] = useState<NewAgentData>({
    name: '',
    description: '',
    gatewayUrl: '',
    gatewayToken: '',
    model: 'bailian/qwen3.5-plus',
    skills: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [skillCount, setSkillCount] = useState<number>(0);

  if (!isOpen) return null;

  const handleChange = (field: keyof NewAgentData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSkillChange = (index: number, value: string) => {
    const newSkills = [...formData.skills];
    newSkills[index] = value;
    setFormData(prev => ({ ...prev, skills: newSkills }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '请输入智能体名称';
    }

    if (!formData.gatewayUrl.trim()) {
      newErrors.gatewayUrl = '请输入 Gateway 地址';
    } else if (!formData.gatewayUrl.startsWith('ws://')) {
      newErrors.gatewayUrl = 'Gateway 地址必须以 ws:// 开头';
    }

    if (!formData.gatewayToken.trim()) {
      newErrors.gatewayToken = '请输入 Gateway Token';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const agentData: NewAgentData = {
      ...formData,
      skills: formData.skills.filter(s => s.trim())
    };

    onAdd(agentData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      gatewayUrl: '',
      gatewayToken: '',
      model: 'bailian/qwen3.5-plus',
      skills: []
    });
    setErrors({});
    setSkillCount(0);
    onClose();
  };

  return (
    <div className="dialog-overlay" onClick={handleClose}>
      <div className="dialog" onClick={e => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>🤖 添加智能体</h2>
          <button className="close-btn" onClick={handleClose}>✕</button>
        </div>

        <div className="dialog-body">
          <div className="form-group">
            <label>智能体名称 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
              placeholder="例如：客服助手"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>描述</label>
            <textarea
              value={formData.description}
              onChange={e => handleChange('description', e.target.value)}
              placeholder="描述智能体的用途和功能"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Gateway 地址 *</label>
            <input
              type="text"
              value={formData.gatewayUrl}
              onChange={e => handleChange('gatewayUrl', e.target.value)}
              placeholder="ws://127.0.0.1:18789 或 ws://192.168.1.100:18789"
              className={errors.gatewayUrl ? 'error' : ''}
            />
            {errors.gatewayUrl && <span className="error-text">{errors.gatewayUrl}</span>}
            <small>支持本地 (ws://127.0.0.1) 和远程 (ws://192.168.x.x) 地址</small>
          </div>

          <div className="form-group">
            <label>Gateway Token *</label>
            <input
              type="text"
              value={formData.gatewayToken}
              onChange={e => handleChange('gatewayToken', e.target.value)}
              placeholder="输入认证 Token"
              className={errors.gatewayToken ? 'error' : ''}
            />
            {errors.gatewayToken && <span className="error-text">{errors.gatewayToken}</span>}
            <small>用于 Gateway 认证的 Token</small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>模型</label>
              <select
                value={formData.model}
                onChange={e => handleChange('model', e.target.value)}
              >
                <option value="bailian/qwen3.5-plus">通义千问 3.5 Plus</option>
                <option value="deepseek-chat">DeepSeek Chat</option>
                <option value="glm-4">GLM-4</option>
                <option value="kimi-k2.5">Kimi K2.5</option>
              </select>
            </div>

            <div className="form-group">
              <label>技能数量</label>
              <input
                type="number"
                value={skillCount}
                onChange={e => {
                  const count = parseInt(e.target.value) || 0;
                  setSkillCount(Math.min(count, 10));
                  setFormData(prev => ({
                    ...prev,
                    skills: new Array(Math.min(count, 10)).fill('')
                  }));
                }}
                min="0"
                max="10"
              />
              <small>最多 10 个技能</small>
            </div>
          </div>

          {skillCount > 0 && (
            <div className="form-group">
              <label>技能列表</label>
              {formData.skills.map((skill: string, index: number) => (
                <input
                  key={index}
                  type="text"
                  value={skill}
                  onChange={e => handleSkillChange(index, e.target.value)}
                  placeholder={`技能 ${index + 1}`}
                  className="skill-input"
                />
              ))}
            </div>
          )}
        </div>

        <div className="dialog-footer">
          <button className="btn btn-secondary" onClick={handleClose}>
            取消
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            添加智能体
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAgentDialog;
