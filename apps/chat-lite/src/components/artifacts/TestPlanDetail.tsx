import React from 'react';

interface TestPlanDetailProps {
  data: {
    id?: string;
    title?: string;
    description?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
    owner?: string;
    test_cases?: any[];
    [key: string]: any;
  };
}

export function TestPlanDetail({ data }: TestPlanDetailProps) {
  return (
    <div className="test-plan-detail">
      <div className="test-plan-detail-header">
        <h2>{data.title || '测试计划详情'}</h2>
        {data.status && (
          <span className={`test-plan-status status-${data.status}`}>
            {data.status}
          </span>
        )}
      </div>
      
      <div className="test-plan-detail-body">
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
            {data.owner && <div className="detail-item"><label>负责人:</label><span>{data.owner}</span></div>}
            {data.start_date && <div className="detail-item"><label>开始日期:</label><span>{data.start_date}</span></div>}
            {data.end_date && <div className="detail-item"><label>结束日期:</label><span>{data.end_date}</span></div>}
          </div>
        </div>
        
        {data.test_cases && data.test_cases.length > 0 && (
          <div className="detail-section">
            <h3>测试用例 ({data.test_cases.length})</h3>
            <ul className="test-case-list">
              {data.test_cases.map((tc, idx) => (
                <li key={idx} className="test-case-item">
                  {tc.title || `测试用例 ${idx + 1}`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
