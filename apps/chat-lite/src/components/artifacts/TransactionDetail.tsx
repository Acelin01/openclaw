import React from 'react';

interface TransactionDetailProps {
  data?: {
    transaction_id?: string;
    client_name?: string;
    freelancer_name?: string;
    service_name?: string;
    amount?: number;
    currency?: string;
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    created_at?: string;
    description?: string;
  };
}

export function TransactionDetail({ data }: TransactionDetailProps) {
  return (
    <div className="transaction-detail">
      {/* 头部 */}
      <div className="detail-header">
        <div className="header-left">
          <h1 className="transaction-title">交易详情</h1>
          <div className="transaction-meta">
            <span className={`status-badge status-${data?.status}`}>
              {data?.status === 'pending' && '待处理'}
              {data?.status === 'in_progress' && '进行中'}
              {data?.status === 'completed' && '已完成'}
              {data?.status === 'cancelled' && '已取消'}
            </span>
            <span className="transaction-id">{data?.transaction_id}</span>
          </div>
        </div>
      </div>

      {/* 交易信息 */}
      <div className="transaction-info">
        <div className="amount-section">
          <div className="amount-label">交易金额</div>
          <div className="amount-value">
            ¥{data?.amount?.toLocaleString() || 0}
            <span className="currency">{data?.currency || 'CNY'}</span>
          </div>
        </div>

        <div className="info-grid">
          <div className="info-card">
            <div className="card-label">客户</div>
            <div className="card-value">{data?.client_name || '-'}</div>
          </div>

          <div className="info-card">
            <div className="card-label">服务提供者</div>
            <div className="card-value">{data?.freelancer_name || '-'}</div>
          </div>

          <div className="info-card">
            <div className="card-label">服务项目</div>
            <div className="card-value">{data?.service_name || '-'}</div>
          </div>

          <div className="info-card">
            <div className="card-label">创建时间</div>
            <div className="card-value">{data?.created_at || '-'}</div>
          </div>
        </div>

        {data?.description && (
          <div className="description-section">
            <h3 className="section-title">交易描述</h3>
            <div className="description-content">{data.description}</div>
          </div>
        )}
      </div>

      {/* 样式 */}
      <style>{`
        .transaction-detail {
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
          background: linear-gradient(135deg, #722ed1 0%, #9254de 100%);
          color: white;
        }

        .header-left {
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
        }

        .transaction-title {
          font-size: 24px;
          font-weight: 600;
          margin: 0;
        }

        .transaction-meta {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 500;
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .transaction-id {
          font-size: 13px;
          opacity: 0.9;
        }

        .transaction-info {
          padding: 24px;
        }

        .amount-section {
          text-align: center;
          padding: 32px;
          background: linear-gradient(135deg, #f6ffed 0%, #e6f7ff 100%);
          border-radius: 8px;
          margin-bottom: 24px;
        }

        .amount-label {
          font-size: 14px;
          color: #646a73;
          margin-bottom: 8px;
        }

        .amount-value {
          font-size: 36px;
          font-weight: 700;
          color: #722ed1;
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 8px;
        }

        .currency {
          font-size: 16px;
          font-weight: 500;
          color: #646a73;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .info-card {
          background: #f5f7fa;
          padding: 16px;
          border-radius: 6px;
        }

        .card-label {
          font-size: 13px;
          color: #646a73;
          margin-bottom: 6px;
        }

        .card-value {
          font-size: 16px;
          color: #1f2329;
          font-weight: 600;
        }

        .description-section {
          margin-top: 24px;
        }

        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: #1f2329;
          margin-bottom: 12px;
        }

        .description-content {
          background: #f5f7fa;
          padding: 16px;
          border-radius: 6px;
          font-size: 14px;
          line-height: 1.8;
          color: #1f2329;
        }
      `}</style>
    </div>
  );
}
