/**
 * Artifact 查看器组件 - React 版本
 * 根据技能自动渲染对应的 Artifact
 */

import React, { useState } from 'react';
import './ArtifactViewer.css';

interface ArtifactViewerProps {
  visible: boolean;
  skillName?: string;
  data?: any;
  title?: string;
  onClose: () => void;
  onRefresh?: () => void;
}

// 技能到 Artifact 类型的映射
const SKILL_TO_ARTIFACT_MAP: Record<string, string> = {
  'task_query': 'task-detail',
  'task_list': 'task-list',
  'requirement_query': 'requirement-detail',
  'requirement_list': 'requirement-list',
  'milestone_query': 'milestone-detail',
  'milestone_list': 'milestone-list',
  'defect_query': 'defect-detail',
  'defect_list': 'defect-list',
  'iteration_query': 'iteration-overview',
  'iteration_list': 'iteration-list',
  'iteration_planning': 'iteration-plan',
  'document_query': 'document-detail',
  'document_list': 'document-list',
  'project_query': 'project-detail',
  'project_list': 'project-list',
  'work_statistics': 'workhour-list',
  'report_query': 'report-detail',
};

export const ArtifactViewer: React.FC<ArtifactViewerProps> = ({
  visible,
  skillName,
  data,
  title,
  onClose,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState('detail');

  if (!visible) return null;

  const getArtifactKind = () => {
    if (!skillName) return null;
    return SKILL_TO_ARTIFACT_MAP[skillName] || null;
  };

  const getArtifactTitle = () => {
    const artifactKind = getArtifactKind();
    const titles: Record<string, string> = {
      'task-detail': '任务详情',
      'task-list': '任务列表',
      'requirement-detail': '需求详情',
      'requirement-list': '需求列表',
      'milestone-detail': '里程碑详情',
      'milestone-list': '里程碑列表',
      'defect-detail': '缺陷详情',
      'defect-list': '缺陷列表',
      'iteration-overview': '迭代概览',
      'iteration-list': '迭代列表',
      'document-detail': '文档详情',
      'document-list': '文档列表',
      'project-detail': '项目详情',
      'project-list': '项目列表',
    };
    return title || (artifactKind ? titles[artifactKind] : 'Artifact');
  };

  const renderArtifact = () => {
    const artifactKind = getArtifactKind();
    
    if (artifactKind && data) {
      return (
        <div className="artifact-content">
          <pre className="data-preview">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      );
    }

    return (
      <div className="artifact-fallback">
        <div className="fallback-icon">📋</div>
        <h3>Artifact 预览</h3>
        {skillName && (
          <p className="skill-name">技能：@{skillName}</p>
        )}
        {data && (
          <pre className="data-preview">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    );
  };

  return (
    <div className="artifact-viewer-wrapper">
      <div className="artifact-viewer">
      <div className="artifact-header">
        <div className="artifact-title-section">
          <h2 className="artifact-title">{getArtifactTitle()}</h2>
          {skillName && (
            <span className="skill-badge">@{skillName}</span>
          )}
        </div>
        <div className="artifact-actions">
          {onRefresh && (
            <button className="icon-btn" onClick={onRefresh} title="刷新">
              🔄
            </button>
          )}
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
      </div>

      <div className="artifact-tabs">
        {['detail', 'list', 'create'].map(tab => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'detail' ? '详情' : tab === 'list' ? '列表' : '创建'}
          </button>
        ))}
      </div>

      <div className="artifact-content">
        {renderArtifact()}
      </div>
      </div>
    </div>
  );
};
