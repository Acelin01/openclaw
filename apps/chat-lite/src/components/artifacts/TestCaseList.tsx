import React from 'react';

interface TestCase {
  id: string;
  title: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'draft' | 'active' | 'blocked';
  steps?: string[];
  expected_result?: string;
}

interface TestCaseListProps {
  data: {
    test_cases?: TestCase[];
    [key: string]: any;
  };
}

export function TestCaseList({ data }: TestCaseListProps) {
  const testCases = data.test_cases || [];

  return (
    <div className="test-case-list">
      <div className="test-case-header">
        <h2>测试用例列表</h2>
        <span className="test-case-count">共 {testCases.length} 个</span>
      </div>
      
      {testCases.length === 0 ? (
        <div className="test-case-empty">
          <p>暂无测试用例</p>
        </div>
      ) : (
        <div className="test-case-table">
          <table>
            <thead>
              <tr>
                <th>标题</th>
                <th>优先级</th>
                <th>状态</th>
                <th>步骤数</th>
              </tr>
            </thead>
            <tbody>
              {testCases.map((tc) => (
                <tr key={tc.id} className="test-case-row">
                  <td className="test-case-title">{tc.title}</td>
                  <td>
                    <span className={`priority-${tc.priority || 'medium'}`}>
                      {tc.priority === 'low' && '低'}
                      {tc.priority === 'medium' && '中'}
                      {tc.priority === 'high' && '高'}
                      {tc.priority === 'critical' && '紧急'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-${tc.status || 'draft'}`}>
                      {tc.status === 'draft' && '草稿'}
                      {tc.status === 'active' && '激活'}
                      {tc.status === 'blocked' && '阻塞'}
                    </span>
                  </td>
                  <td>{tc.steps?.length || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
