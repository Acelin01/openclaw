/**
 * 技能面板组件 - 底部弹出式
 * 显示可用技能列表，支持搜索和选择
 */

import React, { useState, useMemo } from 'react';
import { skillPatterns, type SkillPattern, CATEGORIES } from '../lib/skill-matcher';
import './SkillPanel.css';

interface SkillPanelProps {
  visible: boolean;
  selectedSkill?: SkillPattern;
  onSkillSelect: (skill: SkillPattern) => void;
  onClose: () => void;
}

export const SkillPanel: React.FC<SkillPanelProps> = ({
  visible,
  selectedSkill,
  onSkillSelect,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'commands' | 'skills'>('all');

  // 过滤技能列表
  const filteredSkills = useMemo(() => {
    if (!searchQuery) return skillPatterns;
    
    const query = searchQuery.toLowerCase();
    return skillPatterns.filter(skill => {
      return (
        skill.name.toLowerCase().includes(query) ||
        skill.description.toLowerCase().includes(query) ||
        skill.patterns.some(p => p.toLowerCase().includes(query))
      );
    });
  }, [searchQuery]);

  // 按分类分组
  const groupedSkills = useMemo(() => {
    const groups: Record<string, SkillPattern[]> = {};
    
    filteredSkills.forEach(skill => {
      const category = CATEGORIES[skill.category as keyof typeof CATEGORIES] || '其他';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(skill);
    });
    
    return groups;
  }, [filteredSkills]);

  if (!visible) return null;

  return (
    <div className="skill-panel-overlay" onClick={onClose}>
      <div className="skill-panel" onClick={e => e.stopPropagation()}>
        {/* 头部 */}
        <div className="skill-panel-header">
          <h4>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            技能服务
          </h4>
          <button className="skill-panel-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* 标签页 */}
        <div className="skill-panel-tabs">
          <button 
            className={`skill-panel-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            全部
          </button>
          <button 
            className={`skill-panel-tab ${activeTab === 'commands' ? 'active' : ''}`}
            onClick={() => setActiveTab('commands')}
          >
            命令
          </button>
          <button 
            className={`skill-panel-tab ${activeTab === 'skills' ? 'active' : ''}`}
            onClick={() => setActiveTab('skills')}
          >
            技能
          </button>
        </div>

        {/* 搜索框 */}
        <div className="skill-panel-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="搜索技能或命令..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* 技能列表 */}
        <div className="skill-panel-body">
          {Object.entries(groupedSkills).map(([category, skills]) => (
            <div key={category} className="skill-category">
              <div className="skill-category-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
                {category}
                <span className="skill-count">{skills.length}</span>
              </div>
              
              <div className="category-skills">
                {skills.map(skill => (
                  <div
                    key={skill.id}
                    className={`command-item ${selectedSkill?.id === skill.id ? 'selected' : ''}`}
                    onClick={() => {
                      onSkillSelect(skill);
                      onClose();
                    }}
                  >
                    <div className="command-item-icon">
                      {skill.icon}
                    </div>
                    <div className="command-item-content">
                      <div className="command-item-header">
                        <div className="command-item-title">{skill.name}</div>
                      </div>
                      <div className="command-item-desc">{skill.description}</div>
                      <div className="command-item-tags">
                        {skill.patterns.slice(0, 3).map((pattern, i) => (
                          <span key={i} className="command-item-tag">{pattern}</span>
                        ))}
                        {skill.patterns.length > 3 && (
                          <span className="command-item-tag">+{skill.patterns.length - 3}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {filteredSkills.length === 0 && (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <p>未找到匹配的技能</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
