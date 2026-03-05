import React from 'react';

interface Milestone {
  id: string;
  title: string;
  description?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'delayed';
  due_date?: string;
  completion_rate?: number;
  created_at?: string;
}

interface MilestoneListProps {
  data: {
    milestones?: Milestone[];
    [key: string]: any;
  };
}

export function MilestoneList({ data }: MilestoneListProps) {
  const milestones = data.milestones || [];

  return (
    <div className="milestone-list">
      <div className="milestone-header">
        <h2>里程碑列表</h2>
        <span className="milestone-count">共 {milestones.length} 个</span>
      </div>
      
      {milestones.length === 0 ? (
        <div className="milestone-empty">
          <p>暂无里程碑</p>
        </div>
      ) : (
        <div className="milestone-table">
          <table>
            <thead>
              <tr>
                <th>标题</th>
                <th>状态</th>
                <th>截止日期</th>
                <th>完成率</th>
                <th>创建时间</th>
              </tr>
            </thead>
            <tbody>
              {milestones.map((milestone) => (
                <tr key={milestone.id} className="milestone-row">
                  <td className="milestone-title">{milestone.title}</td>
                  <td>
                    <span className={`status-${milestone.status}`}>
                      {milestone.status === 'planned' && '计划中'}
                      {milestone.status === 'in_progress' && '进行中'}
                      {milestone.status === 'completed' && '已完成'}
                      {milestone.status === 'delayed' && '延迟'}
                    </span>
                  </td>
                  <td>{milestone.due_date || '-'}</td>
                  <td>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${milestone.completion_rate || 0}%` }}
                      />
                      <span>{milestone.completion_rate || 0}%</span>
                    </div>
                  </td>
                  <td>{milestone.created_at || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
