import React from 'react';

interface TestCaseDetailProps {
  data: {
    id?: string;
    title?: string;
    description?: string;
    priority?: string;
    status?: string;
    steps?: string[];
    expected_result?: string;
    actual_result?: string;
    [key: string]: any;
  };
}

export function TestCaseDetail({ data }: TestCaseDetailProps) {
  return (
    <div className="test-case-detail">
      <div className="test-case-detail-header">
        <h2>{data.title || '测试用例详情'}</h2>
        <div className="test-case-badges">
          {data.priority && (
            <span className={`priority-${data.priority}`}>{data.priority}</span>
          )}
          {data.status && (
            <span className={`status-${data.status}`}>{data.status}</span>
          )}
        </div>
      </div>
      
      <div className="test-case-detail-body">
        {data.description && (
          <div className="detail-section">
            <h3>描述</h3>
            <p>{data.description}</p>
          </div>
        )}
        
        {data.steps && data.steps.length > 0 && (
          <div className="detail-section">
            <h3>测试步骤</h3>
            <ol className="test-steps">
              {data.steps.map((step, idx) => (
                <li key={idx} className="test-step">{step}</li>
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
