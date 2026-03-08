import React from 'react';

interface DocumentDetailProps {
  data?: {
    id?: string;
    title?: string;
    kind?: 'requirement' | 'design' | 'api' | 'test' | 'other';
    status?: 'draft' | 'published' | 'archived';
    content?: string;
    author?: string;
    created_at?: string;
    updated_at?: string;
    version?: string;
    tags?: string[];
    related_docs?: string[];
  };
  onEdit?: () => void;
  onDelete?: () => void;
}

export function DocumentDetail({ data, onEdit, onDelete }: DocumentDetailProps) {
  return (
    <div className="document-detail">
      {/* 头部 */}
      <div className="detail-header">
        <div className="header-left">
          <h1 className="doc-title">{data?.title || '文档详情'}</h1>
          <div className="doc-meta">
            <span className={`kind-badge kind-${data?.kind}`}>
              {data?.kind === 'requirement' && '需求'}
              {data?.kind === 'design' && '设计'}
              {data?.kind === 'api' && 'API'}
              {data?.kind === 'test' && '测试'}
              {data?.kind === 'other' && '其他'}
            </span>
            <span className={`status-badge status-${data?.status}`}>
              {data?.status === 'draft' && '草稿'}
              {data?.status === 'published' && '已发布'}
              {data?.status === 'archived' && '已归档'}
            </span>
            {data?.version && (
              <span className="version-badge">v{data.version}</span>
            )}
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={onDelete}>
            <i className="icon-delete"></i>
            删除
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
            <span className="info-label">文档 ID</span>
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
            <span className="info-label">更新时间</span>
            <span className="info-value">{data?.updated_at || '-'}</span>
          </div>
        </div>
      </div>

      {/* 文档内容 */}
      <div className="content-section">
        <h2 className="section-title">文档内容</h2>
        <div className="doc-content">
          {data?.content || (
            <div className="content-placeholder">
              <p>暂无内容</p>
            </div>
          )}
        </div>
      </div>

      {/* 标签 */}
      {data?.tags && data.tags.length > 0 && (
        <div className="tags-section">
          <h2 className="section-title">标签</h2>
          <div className="tag-list">
            {data.tags.map((tag, index) => (
              <span key={index} className="tag-item">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 相关文档 */}
      {data?.related_docs && data.related_docs.length > 0 && (
        <div className="related-section">
          <h2 className="section-title">相关文档</h2>
          <div className="related-list">
            {data.related_docs.map((doc, index) => (
              <div key={index} className="related-item">
                <i className="icon-doc"></i>
                <span className="related-name">{doc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 样式 */}
      <style>{`
        .document-detail {
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
          background: linear-gradient(135deg, #00b42a 0%, #23c343 100%);
          color: white;
        }

        .header-left {
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
        }

        .doc-title {
          font-size: 24px;
          font-weight: 600;
          margin: 0;
        }

        .doc-meta {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .kind-badge,
        .status-badge,
        .version-badge {
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
          color: #00b42a;
        }

        .btn-primary:hover {
          background: #f6ffed;
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
        .content-section,
        .tags-section,
        .related-section {
          padding: 24px;
          border-bottom: 1px solid #f0f0f0;
        }

        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: #1f2329;
          margin: 0 0 16px 0;
          padding-bottom: 12px;
          border-bottom: 2px solid #00b42a;
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

        .doc-content {
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

        .tag-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .tag-item {
          padding: 4px 12px;
          background: #f0f2f5;
          border-radius: 4px;
          font-size: 13px;
          color: #1f2329;
        }

        .related-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .related-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: #f5f7fa;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .related-item:hover {
          background: #f0f2f5;
          transform: translateX(4px);
        }

        .related-name {
          font-size: 14px;
          color: #1f2329;
        }
      `}</style>
    </div>
  );
}
