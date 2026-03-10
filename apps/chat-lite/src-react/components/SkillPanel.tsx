/**
 * 技能面板组件 - 从 OpenClaw uxin-mcp 获取技能服务
 */

import React, { useState, useEffect } from 'react';
import { fetchSkills, type MCPSkill } from '../lib/skill-api';
import './SkillPanel.css';

interface SkillPanelProps {
  visible: boolean;
  onSelectSkill: (skill: MCPSkill) => void;
  onClose: () => void;
}

// 静态技能列表（降级方案）
const FALLBACK_SKILLS: MCPSkill[] = [
  { name: 'project_create', description: '创建新项目' },
  { name: 'project_query', description: '查询项目信息' },
  { name: 'task_create', description: '创建任务' },
  { name: 'task_list', description: '获取任务列表' },
  { name: 'task_update_status', description: '更新任务状态' },
  { name: 'requirement_create', description: '创建需求' },
  { name: 'milestone_create', description: '创建里程碑' },
  { name: 'milestone_monitor', description: '监控里程碑' },
  { name: 'defect_create', description: '创建缺陷报告' },
  { name: 'risk_create', description: '创建项目风险' },
  { name: 'document_query', description: '查询文档' },
  { name: 'iteration_create', description: '创建迭代' },
  { name: 'iteration_query', description: '查询迭代' },
  { name: 'iteration_list', description: '获取迭代列表' },
  { name: 'iteration_planning', description: '迭代规划' },
];

export const SkillPanel: React.FC<SkillPanelProps> = ({
  visible,
  onSelectSkill,
  onClose,
}) => {
  const [skills, setSkills] = useState<MCPSkill[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // 从 uxin-mcp 加载技能列表
  useEffect(() => {
    if (visible) {
      loadSkills();
    }
  }, [visible]);

  async function loadSkills() {
    try {
      setLoading(true);
      setError(null);
      const skillList = await fetchSkills();
      
      // 如果没有获取到技能，使用降级方案
      if (skillList.length === 0) {
        console.log('使用静态技能列表');
        setSkills(FALLBACK_SKILLS);
      } else {
        setSkills(skillList);
      }
    } catch (err) {
      console.error('加载技能失败:', err);
      setError('加载技能失败，使用离线模式');
      setSkills(FALLBACK_SKILLS);
    } finally {
      setLoading(false);
    }
  }

  // 过滤技能
  const filteredSkills = skills.filter(skill => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      skill.name.toLowerCase().includes(query) ||
      skill.description?.toLowerCase().includes(query)
    );
  });

  if (!visible) return null;

  return (
    <div className="skill-panel-overlay" onClick={onClose}>
      <div className="skill-panel" onClick={(e) => e.stopPropagation()}>
        <div className="skill-panel-header">
          <h4>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            uxin-mcp 技能服务
          </h4>
          <button className="skill-panel-close" onClick={onClose}>×</button>
        </div>

        <div className="skill-panel-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="搜索技能..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="skill-panel-content">
          {loading ? (
            <div className="skill-loading">
              <div className="loading-spinner"></div>
              <p>正在加载技能列表...</p>
            </div>
          ) : error ? (
            <div className="skill-error">
              <p>⚠️ {error}</p>
              <button onClick={loadSkills}>重试</button>
            </div>
          ) : filteredSkills.length === 0 ? (
            <div className="skill-empty">
              <p>暂无技能</p>
            </div>
          ) : (
            <div className="skill-list">
              {filteredSkills.map((skill) => (
                <div
                  key={skill.name}
                  className="skill-card"
                  onClick={() => onSelectSkill(skill)}
                >
                  <div className="skill-icon">🔧</div>
                  <div className="skill-body">
                    <div className="skill-name">{skill.name}</div>
                    {skill.description && (
                      <div className="skill-desc">{skill.description}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="skill-panel-footer">
          <span className="skill-count">共 {filteredSkills.length} 个技能</span>
          <span className="skill-source">{skills.length > 0 ? 'uxin-mcp' : '离线模式'}</span>
        </div>
      </div>
    </div>
  );
};
