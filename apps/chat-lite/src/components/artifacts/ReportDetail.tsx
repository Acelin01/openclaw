import React from 'react';

interface ReportDetailProps {
  data?: {
    id?: string;
    title?: string;
    type?: 'weekly' | 'monthly' | 'quarterly' | 'project';
    status?: 'draft' | 'published' | 'archived';
    content?: string;
    author?: string;
    created_at?: string;
    period?: string;
    summary?: string;
  };
  onEdit?: () => void;
  onExport?: () => void;
}

export function ReportDetail({ data, onEdit, onExport }: ReportDetailProps) {
  return (
    <div className="report-detail">
      {/* 头部 */}
      <div className="detail-header">
        <div className="header-left">
          <h1 className="report-title">{data?.title || '报告详情'}</h1>
          <div className="report-meta">
            <span className={`type-badge type-${data?.type}`}>
              {data?.type === 'weekly' && '周报'}
              {data?.type === 'monthly' && '月报'}
              {data?.type === 'quarterly' && '季报'}
              {data?.type === 'project' && '项目报告'}
            </span>
            <span className={`status-badge status-${data?.status}`}>
              {data?.status === 'draft' && '草稿'}
              {data?.status === 'published' && '已发布'}
              {data?.status === 'archived' && '已归档'}
            </span>
            {data?.period && (
              <span className="period-badge">{data.period}</span>
            )}
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={onExport}>
            <i className="icon-export"></i>
            导出
          </button>
          <button className="btn btn-primary" onClick={onEdit}>
            <i className="icon-edit"></i>
            编辑
          </button>
        </div>
      </div>

      {/* 基本信息 */}
      <div className="info-section">
        <h2 className="section-title">基本信息</h2>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">报告 ID</span>
            <span className="info-value">{data?.id || '-'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">作者</span>
            <span className="info-value">{data?.author || '-'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">创建时间</span>
            <span className="info-value">{data?.created_at || '-'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">报告周期</span>
            <span className="info-value">{data?.period || '-'}</span>
          </div>
        </div>
      </div>

      {/* 摘要 */}
      {data?.summary && (
        <div className="summary-section">
          <h2 className="section-title">摘要</h2>
          <div className="summary-content">
            {data.summary}
          </div>
        </div>
      )}

      {/* 报告内容 */}
      <div className="content-section">
        <h2 className="section-title">报告内容</h2>
        <div className="report-content">
          {data?.content || (
            <div className="content-placeholder">
              <p>暂无内容</p>
            </div>
          )}
        </div>
      </div>

      {/* 样式 */}
      <style>{`
        .report-detail {
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
          background: linear-gradient(135deg, #0077b6 0%, #00a8e8 100%);
          color: white;
        }

        .header-left {
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
        }

        .report-title {
          font-size: 24px;
          font-weight: 600;
          margin: 0;
        }

        .report-meta {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .type-badge,
        .status-badge,
        .period-badge {
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 500;
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .btn-primary {
          background: white;
          color: #0077b6;
        }

        .btn-primary:hover {
          background: #e6f7ff;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .info-section,
        .summary-section,
        .content-section {
          padding: 24px;
          border-bottom: 1px solid #f0f0f0;
        }

        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: #1f2329;
          margin: 0 0 16px 0;
          padding-bottom: 12px;
          border-bottom: 2px solid #0077b6;
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
          font-weight: 500;
        }

        .summary-content {
          background: #f5f7fa;
          padding: 16px;
          border-radius: 6px;
          font-size: 14px;
          line-height: 1.8;
          color: #1f2329;
          border-left: 4px solid #0077b6;
        }

        .report-content {
          font-size: 14px;
          line-height: 1.8;
          color: #1f2329;
          min-height: 200px;
        }

        .content-placeholder {
          color: #646a73;
          text-align: center;
          padding: 40px 20px;
        }
      `}</style>
    </div>
  );
}
