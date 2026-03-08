import React from 'react';

interface ServiceDetailProps {
  data?: {
    service_id?: string;
    title?: string;
    description?: string;
    category?: 'web_development' | 'mobile_app' | 'design' | 'writing' | 'marketing' | 'consulting';
    price_type?: 'hourly' | 'fixed' | 'milestone';
    price?: number;
    delivery_time?: string;
    freelancer_name?: string;
    rating?: number;
    status?: 'active' | 'inactive' | 'completed';
  };
  onContact?: () => void;
  onOrder?: () => void;
}

export function ServiceDetail({ data, onContact, onOrder }: ServiceDetailProps) {
  return (
    <div className="service-detail">
      {/* 头部 */}
      <div className="service-header">
        <div className="header-left">
          <h1 className="service-title">{data?.title || '服务详情'}</h1>
          <div className="service-meta">
            <span className={`category-badge category-${data?.category}`}>
              {data?.category === 'web_development' && '网站开发'}
              {data?.category === 'mobile_app' && '移动应用'}
              {data?.category === 'design' && '设计'}
              {data?.category === 'writing' && '写作'}
              {data?.category === 'marketing' && '营销'}
              {data?.category === 'consulting' && '咨询'}
            </span>
            <span className={`status-badge status-${data?.status}`}>
              {data?.status === 'active' && '进行中'}
              {data?.status === 'inactive' && '未激活'}
              {data?.status === 'completed' && '已完成'}
            </span>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={onContact}>
            <i className="icon-contact"></i>
            联系
          </button>
          <button className="btn btn-primary" onClick={onOrder}>
            <i className="icon-order"></i>
            订购
          </button>
        </div>
      </div>

      {/* 服务信息 */}
      <div className="service-info">
        <div className="info-section">
          <h2 className="section-title">服务信息</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">服务 ID</span>
              <span className="info-value">{data?.service_id || '-'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">服务提供者</span>
              <span className="info-value">{data?.freelancer_name || '-'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">计价方式</span>
              <span className="info-value">
                {data?.price_type === 'hourly' && '按小时'}
                {data?.price_type === 'fixed' && '固定价格'}
                {data?.price_type === 'milestone' && '按里程碑'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">价格</span>
              <span className="info-value price">¥{data?.price || 0}</span>
            </div>
            <div className="info-item">
              <span className="info-label">交付时间</span>
              <span className="info-value">{data?.delivery_time || '-'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">评分</span>
              <div className="rating">
                {'⭐'.repeat(Math.floor(data?.rating || 0))}
                <span className="rating-value">{data?.rating || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 服务描述 */}
        <div className="description-section">
          <h2 className="section-title">服务描述</h2>
          <div className="description-content">
            {data?.description || (
              <div className="content-placeholder">暂无描述</div>
            )}
          </div>
        </div>
      </div>

      {/* 样式 */}
      <style>{`
        .service-detail {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .service-header {
          padding: 24px;
          border-bottom: 1px solid #e8e8e8;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          background: linear-gradient(135deg, #fa8c16 0%, #ffc53d 100%);
          color: white;
        }

        .header-left {
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
        }

        .service-title {
          font-size: 24px;
          font-weight: 600;
          margin: 0;
        }

        .service-meta {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .category-badge,
        .status-badge {
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
          color: #fa8c16;
        }

        .btn-primary:hover {
          background: #fff7e6;
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

        .service-info {
          padding: 24px;
        }

        .info-section,
        .description-section {
          margin-bottom: 24px;
        }

        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: #1f2329;
          margin: 0 0 16px 0;
          padding-bottom: 12px;
          border-bottom: 2px solid #fa8c16;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
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

        .info-value.price {
          color: #fa8c16;
          font-size: 18px;
        }

        .rating {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .rating-value {
          font-size: 14px;
          color: #fa8c16;
          font-weight: 600;
        }

        .description-content {
          font-size: 14px;
          line-height: 1.8;
          color: #1f2329;
          background: #f5f7fa;
          padding: 16px;
          border-radius: 6px;
        }

        .content-placeholder {
          color: #646a73;
          text-align: center;
          padding: 20px;
        }
      `}</style>
    </div>
  );
}
