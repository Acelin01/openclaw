import React from 'react';

interface TestPlan {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'active' | 'completed';
  start_date?: string;
  end_date?: string;
  owner?: string;
}

interface TestPlanListProps {
  data: {
    test_plans?: TestPlan[];
    [key: string]: any;
  };
}

export function TestPlanList({ data }: TestPlanListProps) {
  const testPlans = data.test_plans || [];

  return (
    <div className="test-plan-list">
      <div className="test-plan-header">
        <h2>测试计划列表</h2>
        <span className="test-plan-count">共 {testPlans.length} 个</span>
      </div>
      
      {testPlans.length === 0 ? (
        <div className="test-plan-empty">
          <p>暂无测试计划</p>
        </div>
      ) : (
        <div className="test-plan-grid">
          {testPlans.map((plan) => (
            <div key={plan.id} className="test-plan-card">
              <div className="test-plan-title">{plan.title}</div>
              {plan.description && (
                <div className="test-plan-description">{plan.description}</div>
              )}
              <div className="test-plan-meta">
                <span className={`test-plan-status status-${plan.status}`}>
                  {plan.status === 'draft' && '草稿'}
                  {plan.status === 'active' && '进行中'}
                  {plan.status === 'completed' && '已完成'}
                </span>
                {plan.owner && <span className="test-plan-owner">{plan.owner}</span>}
              </div>
              {(plan.start_date || plan.end_date) && (
                <div className="test-plan-dates">
                  {plan.start_date && <span>开始：{plan.start_date}</span>}
                  {plan.end_date && <span>结束：{plan.end_date}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
