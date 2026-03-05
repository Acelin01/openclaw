import React from 'react';

interface Defect {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignee?: string;
  created_at?: string;
}

interface DefectListProps {
  data: {
    defects?: Defect[];
    [key: string]: any;
  };
}

export function DefectList({ data }: DefectListProps) {
  const defects = data.defects || [];

  return (
    <div className="defect-list">
      <div className="defect-header">
        <h2>缺陷列表</h2>
        <span className="defect-count">共 {defects.length} 个</span>
      </div>
      
      {defects.length === 0 ? (
        <div className="defect-empty">
          <p>暂无缺陷</p>
        </div>
      ) : (
        <div className="defect-table">
          <table>
            <thead>
              <tr>
                <th>标题</th>
                <th>严重程度</th>
                <th>优先级</th>
                <th>状态</th>
                <th>负责人</th>
              </tr>
            </thead>
            <tbody>
              {defects.map((defect) => (
                <tr key={defect.id} className="defect-row">
                  <td className="defect-title">{defect.title}</td>
                  <td>
                    <span className={`severity-${defect.severity}`}>
                      {defect.severity === 'low' && '低'}
                      {defect.severity === 'medium' && '中'}
                      {defect.severity === 'high' && '高'}
                      {defect.severity === 'critical' && '严重'}
                    </span>
                  </td>
                  <td>
                    <span className={`priority-${defect.priority}`}>
                      {defect.priority === 'low' && '低'}
                      {defect.priority === 'medium' && '中'}
                      {defect.priority === 'high' && '高'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-${defect.status}`}>
                      {defect.status === 'open' && '打开'}
                      {defect.status === 'in_progress' && '进行中'}
                      {defect.status === 'resolved' && '已解决'}
                      {defect.status === 'closed' && '已关闭'}
                    </span>
                  </td>
                  <td>{defect.assignee || '未分配'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
