import React from 'react';

interface IterationDetailProps {
  data: {
    id?: string;
    title?: string;
    goal?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
    work_items?: any[];
    [key: string]: any;
  };
}

export function IterationDetail({ data }: IterationDetailProps) {
  return (
    <div className="iteration-detail">
      <div className="iteration-detail-header">
        <h2>{data.title || '迭代详情'}</h2>
        {data.status && (
          <span className={`iteration-status status-${data.status}`}>
            {data.status}
          </span>
        )}
      </div>
      
      <div className="iteration-detail-body">
        {data.goal && (
          <div className="detail-section">
            <h3>迭代目标</h3>
            <p>{data.goal}</p>
          </div>
        )}
        
        <div className="detail-section">
          <h3>基本信息</h3>
          <div className="detail-grid">
            {data.id && <div className="detail-item"><label>ID:</label><span>{data.id}</span></div>}
            {data.start_date && <div className="detail-item"><label>开始日期:</label><span>{data.start_date}</span></div>}
            {data.end_date && <div className="detail-item"><label>结束日期:</label><span>{data.end_date}</span></div>}
          </div>
        </div>
        
        {data.work_items && data.work_items.length > 0 && (
          <div className="detail-section">
            <h3>工作项 ({data.work_items.length})</h3>
            <ul className="work-item-list">
              {data.work_items.map((item, idx) => (
                <li key={idx} className="work-item">
                  {item.title || `工作项 ${idx + 1}`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
