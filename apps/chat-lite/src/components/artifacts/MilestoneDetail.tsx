import React from 'react';

interface MilestoneDetailProps {
  data: {
    id?: string;
    title?: string;
    description?: string;
    status?: string;
    due_date?: string;
    completion_rate?: number;
    dependencies?: string[];
    [key: string]: any;
  };
}

export function MilestoneDetail({ data }: MilestoneDetailProps) {
  return (
    <div className="milestone-detail">
      <div className="milestone-detail-header">
        <h2>{data.title || '里程碑详情'}</h2>
        {data.status && (
          <span className={`status-${data.status}`}>{data.status}</span>
        )}
      </div>
      
      <div className="milestone-detail-body">
        {data.description && (
          <div className="detail-section">
            <h3>描述</h3>
            <p>{data.description}</p>
          </div>
        )}
        
        <div className="detail-section">
          <h3>基本信息</h3>
          <div className="detail-grid">
            {data.id && <div className="detail-item"><label>ID:</label><span>{data.id}</span></div>}
            {data.due_date && <div className="detail-item"><label>截止日期:</label><span>{data.due_date}</span></div>}
          </div>
        </div>
        
        <div className="detail-section">
          <h3>完成进度</h3>
          <div className="progress-section">
            <div className="progress-bar-large">
              <div 
                className="progress-fill" 
                style={{ width: `${data.completion_rate || 0}%` }}
              />
            </div>
            <span className="progress-text">{data.completion_rate || 0}%</span>
          </div>
        </div>
        
        {data.dependencies && data.dependencies.length > 0 && (
          <div className="detail-section">
            <h3>依赖关系</h3>
            <ul className="dependency-list">
              {data.dependencies.map((dep, idx) => (
                <li key={idx} className="dependency-item">{dep}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
