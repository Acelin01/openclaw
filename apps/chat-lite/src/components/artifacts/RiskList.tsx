import React from 'react';

interface Risk {
  id: string;
  title: string;
  description?: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high' | 'critical';
  status: 'identified' | 'assessed' | 'mitigated' | 'closed';
  owner?: string;
  created_at?: string;
}

interface RiskListProps {
  data: {
    risks?: Risk[];
    [key: string]: any;
  };
}

export function RiskList({ data }: RiskListProps) {
  const risks = data.risks || [];

  return (
    <div className="risk-list">
      <div className="risk-header">
        <h2>风险列表</h2>
        <span className="risk-count">共 {risks.length} 个</span>
      </div>
      
      {risks.length === 0 ? (
        <div className="risk-empty">
          <p>暂无风险</p>
        </div>
      ) : (
        <div className="risk-table">
          <table>
            <thead>
              <tr>
                <th>标题</th>
                <th>发生概率</th>
                <th>影响程度</th>
                <th>状态</th>
                <th>负责人</th>
              </tr>
            </thead>
            <tbody>
              {risks.map((risk) => (
                <tr key={risk.id} className="risk-row">
                  <td className="risk-title">{risk.title}</td>
                  <td>
                    <span className={`probability-${risk.probability}`}>
                      {risk.probability === 'low' && '低'}
                      {risk.probability === 'medium' && '中'}
                      {risk.probability === 'high' && '高'}
                    </span>
                  </td>
                  <td>
                    <span className={`impact-${risk.impact}`}>
                      {risk.impact === 'low' && '低'}
                      {risk.impact === 'medium' && '中'}
                      {risk.impact === 'high' && '高'}
                      {risk.impact === 'critical' && '严重'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-${risk.status}`}>
                      {risk.status === 'identified' && '已识别'}
                      {risk.status === 'assessed' && '已评估'}
                      {risk.status === 'mitigated' && '已缓解'}
                      {risk.status === 'closed' && '已关闭'}
                    </span>
                  </td>
                  <td>{risk.owner || '未分配'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
