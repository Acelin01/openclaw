import React from 'react';

interface DefectDetailProps {
  data: {
    id?: string;
    title?: string;
    description?: string;
    severity?: string;
    priority?: string;
    status?: string;
    assignee?: string;
    steps_to_reproduce?: string[];
    expected_result?: string;
    actual_result?: string;
    [key: string]: any;
  };
}

export function DefectDetail({ data }: DefectDetailProps) {
  return (
    <div className="defect-detail">
      <div className="defect-detail-header">
        <h2>{data.title || '缺陷详情'}</h2>
        <div className="defect-badges">
          {data.severity && (
            <span className={`severity-${data.severity}`}>{data.severity}</span>
          )}
          {data.priority && (
            <span className={`priority-${data.priority}`}>{data.priority}</span>
          )}
          {data.status && (
            <span className={`status-${data.status}`}>{data.status}</span>
          )}
        </div>
      </div>
      
      <div className="defect-detail-body">
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
          </div>
        </div>
        
        {data.steps_to_reproduce && data.steps_to_reproduce.length > 0 && (
          <div className="detail-section">
            <h3>重现步骤</h3>
            <ol className="defect-steps">
              {data.steps_to_reproduce.map((step, idx) => (
                <li key={idx} className="defect-step">{step}</li>
              ))}
            </ol>
          </div>
        )}
        
        <div className="detail-section">
          <h3>期望结果</h3>
          <p className="expected-result">{data.expected_result || '未指定'}</p>
        </div>
        
        {data.actual_result && (
          <div className="detail-section">
            <h3>实际结果</h3>
            <p className="actual-result">{data.actual_result}</p>
          </div>
        )}
      </div>
    </div>
  );
}
