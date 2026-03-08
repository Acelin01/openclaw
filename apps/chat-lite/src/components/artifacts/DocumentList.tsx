import React, { useState } from 'react';

interface Document {
  id: string;
  title: string;
  kind: 'requirement' | 'design' | 'api' | 'test' | 'other';
  status: 'draft' | 'published' | 'archived';
  author?: string;
  created_at?: string;
  updated_at?: string;
}

interface DocumentListProps {
  data?: {
    documents?: Document[];
    project_id?: string;
  };
  onDocumentClick?: (docId: string) => void;
}

export function DocumentList({ data, onDocumentClick }: DocumentListProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKind, setFilterKind] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  // 示例文档数据
  const documents: Document[] = data?.documents || [
    { id: 'DOC-001', title: '需求规格说明书', kind: 'requirement', status: 'published', author: '张三', created_at: '2026-03-01' },
    { id: 'DOC-002', title: '系统设计文档', kind: 'design', status: 'draft', author: '李四', created_at: '2026-03-02' },
    { id: 'DOC-003', title: 'API 接口文档', kind: 'api', status: 'published', author: '王五', created_at: '2026-03-03' },
    { id: 'DOC-004', title: '测试计划', kind: 'test', status: 'draft', author: '赵六', created_at: '2026-03-04' },
    { id: 'DOC-005', title: '项目总结报告', kind: 'other', status: 'archived', author: '张三', created_at: '2026-03-05' },
  ];

  // 过滤文档
  const filteredDocuments = documents.filter(doc => {
    const matchSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchKind = !filterKind || doc.kind === filterKind;
    const matchStatus = !filterStatus || doc.status === filterStatus;
    return matchSearch && matchKind && matchStatus;
  });

  return (
    <div className="document-list">
      {/* 头部 */}
      <div className="list-header">
        <div className="header-left">
          <h2 className="list-title">文档列表</h2>
          <span className="doc-count">共 {filteredDocuments.length} 个文档</span>
        </div>
        <div className="header-actions">
          <button
            className={`view-toggle ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <i className="icon-list"></i>
            列表
          </button>
          <button
            className={`view-toggle ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <i className="icon-grid"></i>
            网格
          </button>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="filter-bar">
        <input
          type="text"
          className="search-input"
          placeholder="搜索文档..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="filter-select"
          value={filterKind}
          onChange={(e) => setFilterKind(e.target.value)}
        >
          <option value="">全部类型</option>
          <option value="requirement">需求</option>
          <option value="design">设计</option>
          <option value="api">API</option>
          <option value="test">测试</option>
          <option value="other">其他</option>
        </select>
        <select
          className="filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">全部状态</option>
          <option value="draft">草稿</option>
          <option value="published">已发布</option>
          <option value="archived">已归档</option>
        </select>
      </div>

      {/* 文档列表 */}
      {viewMode === 'list' ? (
        <div className="document-table-container">
          <table className="document-table">
            <thead>
              <tr>
                <th>标题</th>
                <th>类型</th>
                <th>状态</th>
                <th>作者</th>
                <th>创建时间</th>
                <th>更新时间</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((doc) => (
                <tr
                  key={doc.id}
                  className="doc-row"
                  onClick={() => onDocumentClick?.(doc.id)}
                >
                  <td className="col-title">
                    <span className="doc-title">{doc.title}</span>
                  </td>
                  <td className="col-kind">
                    <span className={`kind-badge kind-${doc.kind}`}>
                      {doc.kind === 'requirement' && '需求'}
                      {doc.kind === 'design' && '设计'}
                      {doc.kind === 'api' && 'API'}
                      {doc.kind === 'test' && '测试'}
                      {doc.kind === 'other' && '其他'}
                    </span>
                  </td>
                  <td className="col-status">
                    <span className={`status-badge status-${doc.status}`}>
                      {doc.status === 'draft' && '草稿'}
                      {doc.status === 'published' && '已发布'}
                      {doc.status === 'archived' && '已归档'}
                    </span>
                  </td>
                  <td className="col-author">{doc.author || '-'}</td>
                  <td className="col-date">{doc.created_at || '-'}</td>
                  <td className="col-date">{doc.updated_at || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="document-grid">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="doc-card"
              onClick={() => onDocumentClick?.(doc.id)}
            >
              <div className="card-icon">
                <i className={`icon-${doc.kind}`}></i>
              </div>
              <div className="card-body">
                <h3 className="card-title">{doc.title}</h3>
                <div className="card-meta">
                  <span className={`kind-badge kind-${doc.kind}`}>
                    {doc.kind === 'requirement' && '需求'}
                    {doc.kind === 'design' && '设计'}
                    {doc.kind === 'api' && 'API'}
                    {doc.kind === 'test' && '测试'}
                    {doc.kind === 'other' && '其他'}
                  </span>
                  <span className={`status-badge status-${doc.status}`}>
                    {doc.status === 'draft' && '草稿'}
                    {doc.status === 'published' && '已发布'}
                    {doc.status === 'archived' && '已归档'}
                  </span>
                </div>
                <div className="card-footer">
                  <span className="card-author">{doc.author}</span>
                  <span className="card-date">{doc.created_at}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 空状态 */}
      {filteredDocuments.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <div className="empty-text">暂无文档</div>
        </div>
      )}

      {/* 样式 */}
      <style>{`
        .document-list {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .list-header {
          padding: 20px 24px;
          border-bottom: 1px solid #e8e8e8;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .list-title {
          font-size: 20px;
          font-weight: 600;
          color: #1f2329;
          margin: 0;
        }

        .doc-count {
          font-size: 14px;
          color: #646a73;
        }

        .header-actions {
          display: flex;
          gap: 8px;
        }

        .view-toggle {
          padding: 6px 12px;
          background: #f0f2f5;
          border: 1px solid #d9d9d9;
          border-radius: 4px;
          color: #1f2329;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
        }

        .view-toggle:hover,
        .view-toggle.active {
          background: #00b42a;
          color: white;
          border-color: #00b42a;
        }

        .filter-bar {
          padding: 16px 24px;
          background: #f5f7fa;
          display: flex;
          gap: 12px;
          border-bottom: 1px solid #e8e8e8;
        }

        .search-input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #d9d9d9;
          border-radius: 4px;
          font-size: 14px;
        }

        .filter-select {
          padding: 8px 12px;
          border: 1px solid #d9d9d9;
          border-radius: 4px;
          font-size: 14px;
          background: white;
          cursor: pointer;
          min-width: 120px;
        }

        .document-table-container {
          overflow-x: auto;
        }

        .document-table {
          width: 100%;
          border-collapse: collapse;
        }

        .document-table th {
          padding: 12px 16px;
          text-align: left;
          font-size: 13px;
          font-weight: 600;
          color: #646a73;
          background: #f5f7fa;
          border-bottom: 2px solid #e8e8e8;
        }

        .document-table td {
          padding: 12px 16px;
          border-bottom: 1px solid #f0f0f0;
        }

        .doc-row {
          cursor: pointer;
          transition: all 0.3s;
        }

        .doc-row:hover {
          background: #f5f7fa;
        }

        .col-title {
          min-width: 300px;
        }

        .doc-title {
          color: #1f2329;
          font-weight: 500;
        }

        .kind-badge,
        .status-badge {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .kind-requirement {
          background: #e6f7ff;
          color: #0077b6;
        }

        .kind-design {
          background: #fff7e6;
          color: #fa8c16;
        }

        .kind-api {
          background: #f6ffed;
          color: #00b42a;
        }

        .kind-test {
          background: #fff1f0;
          color: #f5222d;
        }

        .kind-other {
          background: #f0f2f5;
          color: #646a73;
        }

        .status-draft {
          background: #f0f2f5;
          color: #646a73;
        }

        .status-published {
          background: #e6f7ff;
          color: #0077b6;
        }

        .status-archived {
          background: #f6ffed;
          color: #00b42a;
        }

        .col-author,
        .col-date {
          color: #646a73;
          font-size: 13px;
        }

        .document-grid {
          padding: 24px;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        .doc-card {
          background: white;
          border: 1px solid #e8e8e8;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s;
        }

        .doc-card:hover {
          border-color: #00b42a;
          box-shadow: 0 4px 12px rgba(0, 180, 42, 0.15);
          transform: translateY(-2px);
        }

        .card-icon {
          height: 120px;
          background: linear-gradient(135deg, #00b42a 0%, #23c343 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 48px;
        }

        .card-body {
          padding: 16px;
        }

        .card-title {
          font-size: 16px;
          font-weight: 600;
          color: #1f2329;
          margin: 0 0 12px 0;
          line-height: 1.5;
        }

        .card-meta {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #646a73;
        }

        .empty-state {
          padding: 60px 20px;
          text-align: center;
          color: #646a73;
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .empty-text {
          font-size: 16px;
        }
      `}</style>
    </div>
  );
}
