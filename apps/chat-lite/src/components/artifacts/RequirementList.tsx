import React from 'react';

interface Requirement {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'approved' | 'in_progress' | 'completed' | 'rejected';
  assignee?: string;
  created_at?: string;
}

interface RequirementListProps {
  data: {
    requirements?: Requirement[];
    [key: string]: any;
  };
}

export function RequirementList({ data }: RequirementListProps) {
  const requirements = data.requirements || [];

  return (
    <div className="requirement-list">
      <div className="requirement-header">
        <h2>需求列表</h2>
        <span className="requirement-count">共 {requirements.length} 个</span>
      </div>
      
      {requirements.length === 0 ? (
        <div className="requirement-empty">
          <p>暂无需求</p>
        </div>
      ) : (
        <div className="requirement-table">
          <table>
            <thead>
              <tr>
                <th>标题</th>
                <th>优先级</th>
                <th>状态</th>
                <th>负责人</th>
                <th>创建时间</th>
              </tr>
            </thead>
            <tbody>
              {requirements.map((req) => (
                <tr key={req.id} className="requirement-row">
                  <td className="requirement-title">{req.title}</td>
                  <td>
                    <span className={`priority-${req.priority}`}>
                      {req.priority === 'low' && '低'}
                      {req.priority === 'medium' && '中'}
                      {req.priority === 'high' && '高'}
                      {req.priority === 'critical' && '紧急'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-${req.status}`}>
                      {req.status === 'draft' && '草稿'}
                      {req.status === 'approved' && '已批准'}
                      {req.status === 'in_progress' && '进行中'}
                      {req.status === 'completed' && '已完成'}
                      {req.status === 'rejected' && '已拒绝'}
                    </span>
                  </td>
                  <td>{req.assignee || '未分配'}</td>
                  <td>{req.created_at || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
