import React from 'react';

interface ReleaseDetailProps {
  data?: {
    release_id?: string;
    title?: string;
    version?: string;
    status?: 'planned' | 'in_progress' | 'released' | 'cancelled';
    release_date?: string;
    description?: string;
    features?: string[];
    bugs_fixed?: string[];
  };
}

export function ReleaseDetail({ data }: ReleaseDetailProps) {
  return (
    <div className="release-detail">
      {/* 头部 */}
      <div className="detail-header">
        <div className="header-left">
          <h1 className="release-title">{data?.title || '发布详情'}</h1>
          <div className="release-meta">
            <span className="version-badge">v{data?.version || '1.0.0'}</span>
            <span className={`status-badge status-${data?.status}`}>
              {data?.status === 'planned' && '计划中'}
              {data?.status === 'in_progress' && '进行中'}
              {data?.status === 'released' && '已发布'}
              {data?.status === 'cancelled' && '已取消'}
            </span>
            {data?.release_date && (
              <span className="date-badge">📅 {data.release_date}</span>
            )}
          </div>
        </div>
      </div>

      {/* 发布信息 */}
      <div className="release-info">
        {/* 描述 */}
        <div className="description-section">
          <h2 className="section-title">发布说明</h2>
          <div className="description-content">
            {data?.description || (
              <div className="content-placeholder">暂无说明</div>
            )}
          </div>
        </div>

        {/* 新功能 */}
        {data?.features && data.features.length > 0 && (
          <div className="features-section">
            <h2 className="section-title">✨ 新功能</h2>
            <ul className="feature-list">
              {data.features.map((feature, index) => (
                <li key={index} className="feature-item">
                  <span className="feature-icon">✅</span>
                  <span className="feature-text">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Bug 修复 */}
        {data?.bugs_fixed && data.bugs_fixed.length > 0 && (
          <div className="bugs-section">
            <h2 className="section-title">🐛 Bug 修复</h2>
            <ul className="bug-list">
              {data.bugs_fixed.map((bug, index) => (
                <li key={index} className="bug-item">
                  <span className="bug-icon">🔧</span>
                  <span className="bug-text">{bug}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 样式 */}
      <style>{`
        .release-detail {
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
          background: linear-gradient(135deg, #eb2f96 0%, #ff85c0 100%);
          color: white;
        }

        .header-left {
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
        }

        .release-title {
          font-size: 24px;
          font-weight: 600;
          margin: 0;
        }

        .release-meta {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
        }

        .version-badge,
        .status-badge,
        .date-badge {
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 500;
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .release-info {
          padding: 24px;
        }

        .description-section,
        .features-section,
        .bugs-section {
          margin-bottom: 24px;
        }

        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2329;
          margin-bottom: 16px;
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

        .feature-list,
        .bug-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .feature-item,
        .bug-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px;
          background: #f5f7fa;
          border-radius: 6px;
          margin-bottom: 8px;
        }

        .feature-icon,
        .bug-icon {
          font-size: 18px;
          flex-shrink: 0;
        }

        .feature-text,
        .bug-text {
          font-size: 14px;
          color: #1f2329;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}
