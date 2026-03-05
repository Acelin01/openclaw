import React from 'react';

interface TaskDetailProps {
  data: {
    id?: string;
    title?: string;
    description?: string;
    priority?: string;
    status?: string;
    assignee?: string;
    due_date?: string;
    labels?: string[];
    estimated_hours?: number;
    [key: string]: any;
  };
}

export function TaskDetail({ data }: TaskDetailProps) {
  return (
    <div className="task-detail">
      <div className="task-detail-header">
        <h2>{data.title || '任务详情'}</h2>
        <div className="task-badges">
          {data.priority && (
            <span className={`priority-${data.priority}`}>{data.priority}</span>
          )}
          {data.status && (
            <span className={`status-${data.status}`}>{data.status}</span>
          )}
        </div>
      </div>
      
      <div className="task-detail-body">
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
            {data.due_date && <div className="detail-item"><label>截止日期:</label><span>{data.due_date}</span></div>}
            {data.estimated_hours && <div className="detail-item"><label>预估工时:</label><span>{data.estimated_hours} 小时</span></div>}
          </div>
        </div>
        
        {data.labels && data.labels.length > 0 && (
          <div className="detail-section">
            <h3>标签</h3>
            <div className="labels">
              {data.labels.map((label, idx) => (
                <span key={idx} className="label">{label}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
