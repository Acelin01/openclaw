/**
 * 技能输入框组件 - React 版本
 * 显示技能预览和参数输入引导
 */

import React, { useState, useRef, useEffect } from 'react';
import { type SkillPattern, getSkillParamTemplate } from '../../lib/skill-matcher';
import './SkillInput.css';

interface SkillInputProps {
  skill?: SkillPattern;
  placeholder?: string;
  onSendSkill: (skill: string, command: string, params: Record<string, string>) => void;
  onCancelSkill: () => void;
}

export const SkillInput: React.FC<SkillInputProps> = ({
  skill,
  placeholder = '输入消息...',
  onSendSkill,
  onCancelSkill
}) => {
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [currentParamIndex, setCurrentParamIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 获取当前参数
  const currentParam = skill?.params 
    ? skill.params.filter(p => p.required)[currentParamIndex] 
    : undefined;

  // 是否所有参数都已填写
  const allParamsFilled = skill?.params
    ? skill.params.filter(p => p.required).every(p => paramValues[p.name]?.trim())
    : true;

  // 获取下一个未填写的参数索引
  const getNextEmptyParamIndex = () => {
    if (!skill?.params) return -1;
    const requiredParams = skill.params.filter(p => p.required);
    return requiredParams.findIndex(p => !paramValues[p.name]?.trim());
  };

  const updateParam = (name: string, value: string) => {
    setParamValues(prev => ({ ...prev, [name]: value }));
  };

  const handleParamKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        // Shift+Tab: 上一个参数
        setCurrentParamIndex(Math.max(0, index - 1));
      } else {
        // Tab: 下一个参数
        const nextIndex = getNextEmptyParamIndex();
        setCurrentParamIndex(nextIndex > 0 ? nextIndex : index + 1);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allParamsFilled) {
        handleSend();
      } else {
        const nextIndex = getNextEmptyParamIndex();
        if (nextIndex > 0) {
          setCurrentParamIndex(nextIndex);
        }
      }
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleSend = () => {
    if (!skill) return;

    const command = buildCommand();
    onSendSkill(skill.skill, command, { ...paramValues });
    reset();
  };

  const handleCancel = () => {
    reset();
    onCancelSkill();
  };

  const buildCommand = () => {
    if (!skill) return '';
    
    const params = Object.entries(paramValues)
      .filter(([_, value]) => value.trim())
      .map(([name, value]) => `${name}=${value}`)
      .join(' ');
    
    return `@${skill.skill} ${params}`;
  };

  const reset = () => {
    setParamValues({});
    setCurrentParamIndex(0);
    setIsEditing(false);
  };

  // 公开方法：开始编辑技能
  const startEdit = (newSkill: SkillPattern) => {
    setParamValues({});
    setCurrentParamIndex(0);
    setIsEditing(true);
    
    setTimeout(() => {
      const firstInput = document.querySelector('.param-input') as HTMLInputElement;
      firstInput?.focus();
    }, 0);
  };

  if (!skill || !isEditing) {
    return (
      <div className="normal-input">
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
        />
      </div>
    );
  }

  const requiredParams = skill.params?.filter(p => p.required) || [];

  return (
    <div className="skill-input-container">
      <div className="skill-preview">
        <div className="skill-command">
          <span className="at-symbol">@</span>
          <span className="skill-name">{skill.skill}</span>
        </div>
        {skill.description && (
          <div className="skill-description">{skill.description}</div>
        )}
      </div>

      <div className="param-inputs">
        {requiredParams.map((param, index) => {
          const isCurrent = index === currentParamIndex;
          const isFilled = !!paramValues[param.name]?.trim();
          
          return (
            <div 
              key={param.name} 
              className={`param-input-wrapper ${isCurrent ? 'current' : ''} ${isFilled ? 'filled' : ''}`}
            >
              <label className="param-label">
                <span className="param-name">{param.name}</span>
                {param.required && <span className="required">*</span>}
              </label>
              <div className="param-input-row">
                <input
                  type="text"
                  placeholder={param.example || param.description}
                  value={paramValues[param.name] || ''}
                  onChange={(e) => updateParam(param.name, e.target.value)}
                  onFocus={() => setCurrentParamIndex(index)}
                  onKeyDown={(e) => handleParamKeyDown(e, index)}
                  className="param-input"
                  autoFocus={isCurrent && index === 0}
                />
                {param.example && (
                  <span className="param-example">{param.example}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="input-actions">
        <button className="btn btn-cancel" onClick={handleCancel}>
          取消
        </button>
        <button 
          className="btn btn-send" 
          onClick={handleSend}
          disabled={!allParamsFilled}
        >
          发送
        </button>
      </div>
    </div>
  );
};

// 导出 startEdit 方法供外部调用
export const startEdit = (skill: SkillPattern) => {
  const event = new CustomEvent('skill-start-edit', { detail: { skill } });
  window.dispatchEvent(event);
};
