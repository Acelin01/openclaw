/**
 * Artifact 查看器组件 - 分屏展示，支持拖动调整宽度
 */

import React, { useState, useRef, useEffect } from 'react';
import './ArtifactViewer.css';

interface ArtifactViewerProps {
  visible: boolean;
  skillName?: string;
  artifactType?: string;
  data?: any;
  onClose: () => void;
  onRefresh?: () => void;
}

export const ArtifactViewer: React.FC<ArtifactViewerProps> = ({
  visible,
  skillName,
  artifactType,
  data,
  onClose,
  onRefresh,
}) => {
  const [width, setWidth] = useState(600);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 处理拖动开始
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  // 处理拖动
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = containerRect.right - e.clientX;
      
      // 限制最小和最大宽度
      if (newWidth >= 400 && newWidth <= 1200) {
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // 根据技能类型渲染不同的 Artifact
  const renderArtifactContent = () => {
    // uxin-mcp 技能到 artifact 类型的映射
    const skillToArtifactMap: Record<string, string> = {
      'task_list': 'task-list',
      'task_query': 'task-detail',
      'requirement_list': 'requirement-list',
      'requirement_query': 'requirement-detail',
      'milestone_list': 'milestone-list',
      'milestone_query': 'milestone-detail',
      'project_list': 'project-list',
      'project_query': 'project-detail',
      'defect_list': 'defect-list',
      'defect_query': 'defect-detail',
      'document_list': 'document-list',
      'document_query': 'document-detail',
      'iteration_list': 'iteration-list',
      'iteration_query': 'iteration-overview',
    };

    // 从技能名称解析 artifact 类型
    const artifactKind = skillName ? skillToArtifactMap[skillName] || skillName : artifactType;

    // 渲染对应的 Lit Web Component
    switch (artifactKind) {
      case 'task-list':
        return <chatlite-task-list content={data} />;
      case 'task-detail':
        return <chatlite-task-detail content={data} />;
      case 'requirement-list':
        return <chatlite-requirement-list content={data} />;
      case 'requirement-detail':
        return <chatlite-requirement-detail content={data} />;
      case 'milestone-list':
        return <chatlite-milestone-list content={data} />;
      case 'milestone-detail':
        return <chatlite-milestone-detail content={data} />;
      case 'project-list':
        return <chatlite-project-list content={data} />;
      case 'project-detail':
        return <chatlite-project-detail content={data} />;
      case 'defect-list':
        return <chatlite-defect-list content={data} />;
      case 'defect-detail':
        return <chatlite-defect-detail content={data} />;
      case 'document-list':
        return <chatlite-document-list content={data} />;
      case 'document-detail':
        return <chatlite-document-detail content={data} />;
      case 'iteration-list':
        return <chatlite-iteration-list content={data} />;
      case 'iteration-overview':
        return <chatlite-iteration-overview content={data} />;
      // 降级到默认渲染
      case 'weather-dashboard':
        return <WeatherDashboard data={data} />;
      case 'code-editor':
        return <CodeEditor data={data} />;
      case 'search-results':
        return <SearchResults data={data} />;
      case 'data-dashboard':
        return <DataDashboard data={data} />;
      case 'design-preview':
        return <DesignPreview data={data} />;
      case 'document-editor':
        return <DocumentEditor data={data} />;
      case 'summary-viewer':
        return <SummaryViewer data={data} />;
      case 'mind-map':
        return <MindMap data={data} />;
      case 'code-review':
        return <CodeReview data={data} />;
      case 'translation-viewer':
        return <TranslationViewer data={data} />;
      default:
        return <DefaultArtifact skillName={skillName} data={data} />;
    }
  };

  if (!visible) return null;

  return (
    <div className="artifact-viewer-container" ref={containerRef} style={{ width }}>
      <div className="artifact-resize-handle" onMouseDown={handleMouseDown}>
        <div className="resize-grip" />
      </div>
      
      <div className="artifact-viewer">
        {/* 头部 */}
        <div className="artifact-header">
          <div className="artifact-title-section">
            <h2 className="artifact-title">
              {skillName ? `${skillName} - Artifact` : 'Artifact 预览'}
            </h2>
            {artifactType && (
              <span className="artifact-type-badge">{artifactType}</span>
            )}
          </div>
          <div className="artifact-actions">
            {onRefresh && (
              <button className="artifact-icon-btn" onClick={onRefresh} title="刷新">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <path d="M23 4v6h-6M1 20v-6h6"/>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
              </button>
            )}
            <button className="artifact-icon-btn" onClick={onClose} title="关闭">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* 内容区 */}
        <div className="artifact-content">
          {renderArtifactContent()}
        </div>
      </div>
    </div>
  );
};

// ========== 各种 Artifact 类型组件 ==========

const WeatherDashboard: React.FC<{ data?: any }> = ({ data }) => (
  <div className="artifact-weather">
    <div className="weather-main">
      <div className="weather-icon">🌤️</div>
      <div className="weather-temp">25°C</div>
      <div className="weather-desc">晴转多云</div>
    </div>
    <div className="weather-details">
      <div className="weather-detail-item">
        <span className="detail-label">风力</span>
        <span className="detail-value">东北风 2-3 级</span>
      </div>
      <div className="weather-detail-item">
        <span className="detail-label">湿度</span>
        <span className="detail-value">45%</span>
      </div>
      <div className="weather-detail-item">
        <span className="detail-label">空气质量</span>
        <span className="detail-value">良</span>
      </div>
    </div>
  </div>
);

const CodeEditor: React.FC<{ data?: any }> = ({ data }) => (
  <div className="artifact-code">
    <div className="code-header">
      <span className="code-filename">example.ts</span>
      <div className="code-actions">
        <button className="code-btn">复制</button>
        <button className="code-btn">运行</button>
      </div>
    </div>
    <pre className="code-content">
      <code>{`// 示例代码
function helloWorld() {
  console.log('Hello, World!');
}

helloWorld();`}</code>
    </pre>
  </div>
);

const SearchResults: React.FC<{ data?: any }> = ({ data }) => (
  <div className="artifact-search">
    <div className="search-result-item">
      <h3>搜索结果 1</h3>
      <p>这是搜索结果的描述信息...</p>
      <a href="#">https://example.com/page1</a>
    </div>
    <div className="search-result-item">
      <h3>搜索结果 2</h3>
      <p>这是搜索结果的描述信息...</p>
      <a href="#">https://example.com/page2</a>
    </div>
  </div>
);

const DataDashboard: React.FC<{ data?: any }> = ({ data }) => (
  <div className="artifact-data">
    <div className="data-chart-placeholder">
      <div className="chart-bar" style={{height: '60%'}} />
      <div className="chart-bar" style={{height: '80%'}} />
      <div className="chart-bar" style={{height: '45%'}} />
      <div className="chart-bar" style={{height: '90%'}} />
      <div className="chart-bar" style={{height: '70%'}} />
    </div>
    <div className="data-stats">
      <div className="stat-item">
        <div className="stat-value">1,234</div>
        <div className="stat-label">总数</div>
      </div>
      <div className="stat-item">
        <div className="stat-value">+23%</div>
        <div className="stat-label">增长率</div>
      </div>
    </div>
  </div>
);

const DesignPreview: React.FC<{ data?: any }> = ({ data }) => (
  <div className="artifact-design">
    <div className="design-placeholder">
      <div className="design-mockup">
        <div className="mockup-header" />
        <div className="mockup-content" />
        <div className="mockup-sidebar" />
      </div>
    </div>
  </div>
);

const DocumentEditor: React.FC<{ data?: any }> = ({ data }) => (
  <div className="artifact-document">
    <div className="doc-toolbar">
      <button className="doc-tool">B</button>
      <button className="doc-tool">I</button>
      <button className="doc-tool">U</button>
    </div>
    <div className="doc-content">
      <p>在此编辑文档内容...</p>
    </div>
  </div>
);

const SummaryViewer: React.FC<{ data?: any }> = ({ data }) => (
  <div className="artifact-summary">
    <h3>内容摘要</h3>
    <ul>
      <li>要点 1：关键信息总结</li>
      <li>要点 2：重要内容提取</li>
      <li>要点 3：核心观点概述</li>
    </ul>
  </div>
);

const MindMap: React.FC<{ data?: any }> = ({ data }) => (
  <div className="artifact-mindmap">
    <div className="mindmap-node center">中心主题</div>
    <div className="mindmap-branch">
      <div className="mindmap-node">分支 1</div>
      <div className="mindmap-node">分支 2</div>
      <div className="mindmap-node">分支 3</div>
    </div>
  </div>
);

const CodeReview: React.FC<{ data?: any }> = ({ data }) => (
  <div className="artifact-review">
    <div className="review-item success">
      <span className="review-icon">✓</span>
      <span className="review-text">代码风格良好</span>
    </div>
    <div className="review-item warning">
      <span className="review-icon">⚠</span>
      <span className="review-text">建议添加注释</span>
    </div>
    <div className="review-item error">
      <span className="review-icon">✕</span>
      <span className="review-text">发现潜在 bug</span>
    </div>
  </div>
);

const TranslationViewer: React.FC<{ data?: any }> = ({ data }) => (
  <div className="artifact-translation">
    <div className="translation-pair">
      <div className="translation-source">
        <div className="translation-label">原文</div>
        <p>Hello, World!</p>
      </div>
      <div className="translation-target">
        <div className="translation-label">译文</div>
        <p>你好，世界！</p>
      </div>
    </div>
  </div>
);

const DefaultArtifact: React.FC<{ skillName?: string; data?: any }> = ({ skillName, data }) => (
  <div className="artifact-default">
    <div className="artifact-placeholder">
      <div className="placeholder-icon">📋</div>
      <h3>{skillName || 'Artifact'} 预览</h3>
      <p>根据技能类型显示相应的内容</p>
      {data && (
        <pre className="data-preview">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  </div>
);
