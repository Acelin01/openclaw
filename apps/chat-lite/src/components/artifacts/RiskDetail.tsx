import React from 'react';

interface RiskDetailProps {
  data: {
    id?: string;
    title?: string;
    description?: string;
    probability?: string;
    impact?: string;
    status?: string;
    owner?: string;
    mitigation_plan?: string;
    [key: string]: any;
  };
}

export function RiskDetail({ data }: RiskDetailProps) {
  return (
    <div className="risk-detail">
      <div className="risk-detail-header">
        <h2>{data.title || '风险详情'}</h2>
        <div className="risk-badges">
          {data.probability && (
            <span className={`probability-${data.probability}`}>概率：{data.probability}</span>
          )}
          {data.impact && (
            <span className={`impact-${data.impact}`}>影响：{data.impact}</span>
          )}
          {data.status && (
            <span className={`status-${data.status}`}>{data.status}</span>
          )}
        </div>
      </div>
      
      <div className="risk-detail-body">
        {data.description && (
          <div className="detail-section">
            <h3>风险描述</h3>
            <p>{data.description}</p>
          </div>
        )}
        
        <div className="detail-section">
          <h3>基本信息</h3>
          <div className="detail-grid">
            {data.id && <div className="detail-item"><label>ID:</label><span>{data.id}</span></div>}
            {data.owner && <div className="detail-item"><label>负责人:</label><span>{data.owner}</span></div>}
          </div>
        </div>
        
        {data.mitigation_plan && (
          <div className="detail-section">
            <h3>缓解计划</h3>
            <p className="mitigation-plan">{data.mitigation_plan}</p>
          </div>
        )}
      </div>
    </div>
  );
}
