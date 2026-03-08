import React from 'react';

interface WorkflowDetailProps {
  data?: {
    workflow_id?: string;
    title?: string;
    description?: string;
    status?: 'draft' | 'active' | 'completed' | 'archived';
    steps?: Array<{
      step_number: number;
      name: string;
      description?: string;
      assignee?: string;
      status?: 'pending' | 'in_progress' | 'completed';
    }>;
    created_by?: string;
    created_at?: string;
  };
}

export function WorkflowDetail({ data }: WorkflowDetailProps) {
  return (
    <div className="workflow-detail">
      {/* 头部 */}
      <div className="detail-header">
        <div className="header-left">
          <h1 className="workflow-title">{data?.title || '工作流详情'}</h1>
          <div className="workflow-meta">
            <span className={`status-badge status-${data?.status}`}>
              {data?.status === 'draft' && '草稿'}
              {data?.status === 'active' && '进行中'}
              {data?.status === 'completed' && '已完成'}
              {data?.status === 'archived' && '已归档'}
            </span>
            <span className="workflow-id">{data?.workflow_id}</span>
          </div>
        </div>
      </div>

      {/* 工作流信息 */}
      <div className="workflow-info">
        {/* 基本信息 */}
        <div className="info-section">
          <h2 className="section-title">基本信息</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">创建者</span>
              <span className="info-value">{data?.created_by || '-'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">创建时间</span>
              <span className="info-value">{data?.created_at || '-'}</span>
            </div>
          </div>
        </div>

        {/* 描述 */}
        <div className="description-section">
          <h2 className="section-title">工作流描述</h2>
          <div className="description-content">
            {data?.description || (
              <div className="content-placeholder">暂无描述</div>
            )}
          </div>
        </div>

        {/* 步骤列表 */}
        {data?.steps && data.steps.length > 0 && (
          <div className="steps-section">
            <h2 className="section-title">流程步骤</h2>
            <div className="steps-timeline">
              {data.steps.map((step, index) => (
                <div key={index} className="step-item">
                  <div className="step-marker">
                    <span className="step-number">{step.step_number}</span>
                  </div>
                  <div className="step-content">
                    <div className="step-header">
                      <h3 className="step-name">{step.name}</h3>
                      <span className={`step-status status-${step.status}`}>
                        {step.status === 'pending' && '待处理'}
                        {step.status === 'in_progress' && '进行中'}
                        {step.status === 'completed' && '已完成'}
                      </span>
                    </div>
                    {step.description && (
                      <p className="step-description">{step.description}</p>
                    )}
                    {step.assignee && (
                      <div className="step-assignee">
                        <span className="assignee-label">负责人:</span>
                        <span className="assignee-name">{step.assignee}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 样式 */}
      <style>{`
        .workflow-detail {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .detail-header {
          padding: 24px;
          border-bottom: 1px solid #e8e8e8;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
          color: white;
        }

        .header-left {
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
        }

        .workflow-title {
          font-size: 24px;
          font-weight: 600;
          margin: 0;
        }

        .workflow-meta {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .status-badge,
        .workflow-id {
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 500;
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .workflow-info {
          padding: 24px;
        }

        .info-section,
        .description-section,
        .steps-section {
          margin-bottom: 24px;
        }

        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2329;
          margin-bottom: 16px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .info-label {
          font-size: 13px;
          color: #646a73;
        }

        .info-value {
          font-size: 14px;
          color: #1f2329;
          font-weight: 600;
        }

        .description-content {
          background: #f5f7fa;
          padding: 16px;
          border-radius: 6px;
          font-size: 14px;
          line-height: 1.8;
          color: #1f2329;
        }

        .content-placeholder {
          color: #646a73;
          text-align: center;
          padding: 20px;
        }

        .steps-timeline {
          display: flex;
          flex-direction: column;
          gap: 0;
          position: relative;
        }

        .steps-timeline::before {
          content: '';
          position: absolute;
          left: 20px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #e8e8e8;
        }

        .step-item {
          display: flex;
          gap: 16px;
          position: relative;
          padding: 20px 0;
        }

        .step-marker {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 16px;
          z-index: 1;
        }

        .step-content {
          flex: 1;
          background: #f5f7fa;
          padding: 16px;
          border-radius: 8px;
        }

        .step-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .step-name {
          font-size: 16px;
          font-weight: 600;
          color: #1f2329;
          margin: 0;
        }

        .step-status {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .step-status.pending {
          background: #f0f2f5;
          color: #646a73;
        }

        .step-status.in_progress {
          background: #e6f7ff;
          color: #0077b6;
        }

        .step-status.completed {
          background: #f6ffed;
          color: #00b42a;
        }

        .step-description {
          font-size: 14px;
          color: #1f2329;
          line-height: 1.6;
          margin: 0 0 12px 0;
        }

        .step-assignee {
          display: flex;
          gap: 8px;
          font-size: 13px;
        }

        .assignee-label {
          color: #646a73;
        }

        .assignee-name {
          color: #1f2329;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
