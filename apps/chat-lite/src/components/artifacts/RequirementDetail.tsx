import React from 'react';

interface RequirementDetailProps {
  data: {
    id?: string;
    title?: string;
    description?: string;
    priority?: string;
    status?: string;
    assignee?: string;
    acceptance_criteria?: string[];
    estimated_hours?: number;
    [key: string]: any;
  };
}

export function RequirementDetail({ data }: RequirementDetailProps) {
  return (
    <div className="requirement-detail">
      <div className="requirement-detail-header">
        <h2>{data.title || '需求详情'}</h2>
        <div className="requirement-badges">
          {data.priority && (
            <span className={`priority-${data.priority}`}>{data.priority}</span>
          )}
          {data.status && (
            <span className={`status-${data.status}`}>{data.status}</span>
          )}
        </div>
      </div>
      
      <div className="requirement-detail-body">
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
            {data.assignee && <div className="detail-item"><label>负责人:</label><span>{data.assignee}</span></div>}
            {data.estimated_hours && <div className="detail-item"><label>预估工时:</label><span>{data.estimated_hours} 小时</span></div>}
          </div>
        </div>
        
        {data.acceptance_criteria && data.acceptance_criteria.length > 0 && (
          <div className="detail-section">
            <h3>验收标准</h3>
            <ul className="acceptance-criteria">
              {data.acceptance_criteria.map((criteria, idx) => (
                <li key={idx} className="criteria-item">{criteria}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
