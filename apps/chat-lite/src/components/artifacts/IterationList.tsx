import React from 'react';

interface Iteration {
  id: string;
  title: string;
  status?: 'planning' | 'active' | 'completed';
  start_date?: string;
  end_date?: string;
  goal?: string;
  work_items_count?: number;
}

interface IterationListProps {
  data: {
    iterations?: Iteration[];
    [key: string]: any;
  };
}

export function IterationList({ data }: IterationListProps) {
  const iterations = data.iterations || [];

  return (
    <div className="iteration-list">
      <div className="iteration-header">
        <h2>迭代列表</h2>
        <span className="iteration-count">共 {iterations.length} 个</span>
      </div>
      
      {iterations.length === 0 ? (
        <div className="iteration-empty">
          <p>暂无迭代</p>
        </div>
      ) : (
        <div className="iteration-grid">
          {iterations.map((iteration) => (
            <div key={iteration.id} className="iteration-card">
              <div className="iteration-title">{iteration.title}</div>
              {iteration.goal && (
                <div className="iteration-goal">{iteration.goal}</div>
              )}
              <div className="iteration-meta">
                <span className={`iteration-status status-${iteration.status || 'planning'}`}>
                  {iteration.status === 'planning' && '规划中'}
                  {iteration.status === 'active' && '进行中'}
                  {iteration.status === 'completed' && '已完成'}
                </span>
                {iteration.work_items_count !== undefined && (
                  <span className="work-items-count">{iteration.work_items_count} 个工作项</span>
                )}
              </div>
              {(iteration.start_date || iteration.end_date) && (
                <div className="iteration-dates">
                  {iteration.start_date && <span>开始：{iteration.start_date}</span>}
                  {iteration.end_date && <span>结束：{iteration.end_date}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
