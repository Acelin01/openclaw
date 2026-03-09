/**
 * 订单管理页面 - React 版本
 * 包含：订单列表、订单处理、状态管理、筛选功能等
 */

import React, { useState } from 'react';
import './OrderManagement.css';

interface Order {
  id: string;
  serviceId: string;
  serviceName: string;
  customerName: string;
  customerAvatar: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
  deliveryTime: string;
  type: 'subscription' | 'project';
}

const mockOrders: Order[] = [
  {
    id: 'ORD-20260309-001',
    serviceId: 'svc-001',
    serviceName: '智能数据分析师',
    customerName: '张先生',
    customerAvatar: '张',
    amount: 280,
    status: 'processing',
    createdAt: '2026-03-09 14:30',
    deliveryTime: '24 小时内',
    type: 'subscription',
  },
  {
    id: 'ORD-20260309-002',
    serviceId: 'svc-002',
    serviceName: 'UI 设计评审助手',
    customerName: '李女士',
    customerAvatar: '李',
    amount: 180,
    status: 'pending',
    createdAt: '2026-03-09 13:15',
    deliveryTime: '12 小时内',
    type: 'subscription',
  },
  {
    id: 'ORD-20260308-001',
    serviceId: 'svc-006',
    serviceName: '品牌 VI 设计服务',
    customerName: '王经理',
    customerAvatar: '王',
    amount: 5000,
    status: 'processing',
    createdAt: '2026-03-08 16:45',
    deliveryTime: '7 天内',
    type: 'project',
  },
  {
    id: 'ORD-20260308-002',
    serviceId: 'svc-004',
    serviceName: '文档整理助手',
    customerName: '陈总监',
    customerAvatar: '陈',
    amount: 120,
    status: 'completed',
    createdAt: '2026-03-08 10:20',
    deliveryTime: '已完成',
    type: 'subscription',
  },
  {
    id: 'ORD-20260307-001',
    serviceId: 'svc-001',
    serviceName: '智能数据分析师',
    customerName: '刘总',
    customerAvatar: '刘',
    amount: 280,
    status: 'completed',
    createdAt: '2026-03-07 09:00',
    deliveryTime: '已完成',
    type: 'subscription',
  },
  {
    id: 'ORD-20260306-001',
    serviceId: 'svc-002',
    serviceName: 'UI 设计评审助手',
    customerName: '赵先生',
    customerAvatar: '赵',
    amount: 180,
    status: 'cancelled',
    createdAt: '2026-03-06 15:30',
    deliveryTime: '已取消',
    type: 'subscription',
  },
];

export const OrderManagement: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'processing' | 'completed' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const filteredOrders = mockOrders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = order.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: mockOrders.length,
    pending: mockOrders.filter(o => o.status === 'pending').length,
    processing: mockOrders.filter(o => o.status === 'processing').length,
    completed: mockOrders.filter(o => o.status === 'completed').length,
    totalRevenue: mockOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.amount, 0),
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: '待处理',
      processing: '进行中',
      completed: '已完成',
      cancelled: '已取消',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: '#f59e0b',
      processing: '#0ea5e9',
      completed: '#10b981',
      cancelled: '#6b7280',
    };
    return colors[status] || '#6b7280';
  };

  return (
    <div className="order-management">
      {/* 顶部导航 */}
      <nav className="mgmt-topnav">
        <div className="market-logo">
          <span className="logo-icon">🛠️</span>
          <span className="logo-text">技能服务市场 · 订单管理</span>
        </div>
        <ul className="market-nav-links">
          <li><a href="/market">服务市场</a></li>
          <li><a href="#">我的订阅</a></li>
          <li><a href="/market/manage">服务管理</a></li>
          <li><a href="#" className="active">订单管理</a></li>
        </ul>
        <div className="market-nav-right">
          <button className="btn-ghost">导出数据</button>
        </div>
      </nav>

      <div className="order-layout">
        {/* 侧边栏导航 */}
        <aside className="mgmt-sidenav">
          <div className="sidenav-section">
            <div className="sidenav-label">服务管理</div>
            <div className="nav-item" onClick={() => window.location.href = '/market/manage'}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="12" height="12" rx="2" />
                <path d="M2 6h12M6 2v12" />
              </svg>
              我的服务
            </div>
            <div className="nav-item" onClick={() => window.location.href = '/market/reviews'}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 2l1.5 3h3.5l-2.8 2 1 3.5-3.2-2.3-3.2 2.3 1-3.5-2.8-2h3.5z" />
              </svg>
              评价管理
              <span className="nav-badge green">+12</span>
            </div>
            <div className="nav-item active">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="8" cy="8" r="6" />
                <path d="M8 4v4l3 2" />
              </svg>
              订单管理
              <span className="nav-badge">{stats.pending}</span>
            </div>
          </div>

          <div className="sidenav-section">
            <div className="sidenav-label">数据分析</div>
            <div className="nav-item" onClick={() => window.location.href = '/market/revenue'}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3v10h10" />
                <path d="M7 13l3-3 2 2 3-5" />
              </svg>
              收益统计
            </div>
            <div className="nav-item" onClick={() => window.location.href = '/market/analytics'}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="8" width="3" height="6" />
                <rect x="7" y="4" width="3" height="10" />
                <rect x="12" y="2" width="3" height="12" />
              </svg>
              流量分析
            </div>
          </div>

          <div className="sidenav-footer">
            <div className="user-card">
              <div className="user-avatar">李</div>
              <div className="user-info">
                <div className="user-name">李晓梅</div>
                <div className="user-role">认证服务者</div>
              </div>
            </div>
          </div>
        </aside>

        {/* 主内容区 */}
        <main className="order-main">
          {/* 顶部栏 */}
          <div className="order-header">
            <h1>订单管理</h1>
            <div className="order-stats">
              <div className="order-stat">
                <div className="stat-label">总订单</div>
                <div className="stat-value">{stats.total}</div>
              </div>
              <div className="order-stat pending">
                <div className="stat-label">待处理</div>
                <div className="stat-value">{stats.pending}</div>
              </div>
              <div className="order-stat processing">
                <div className="stat-label">进行中</div>
                <div className="stat-value">{stats.processing}</div>
              </div>
              <div className="order-stat completed">
                <div className="stat-label">已完成</div>
                <div className="stat-value">{stats.completed}</div>
              </div>
              <div className="order-stat revenue">
                <div className="stat-label">总收入</div>
                <div className="stat-value">¥{stats.totalRevenue.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* 筛选栏 */}
          <div className="filter-bar">
            <div className="search-box">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="6" cy="6" r="4.5" />
                <path d="m11 11 2.5 2.5" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="搜索订单 ID、服务名称或客户..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-chips">
              <button
                className={`chip ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                全部
              </button>
              <button
                className={`chip ${statusFilter === 'pending' ? 'active' : ''}`}
                onClick={() => setStatusFilter('pending')}
              >
                待处理
              </button>
              <button
                className={`chip ${statusFilter === 'processing' ? 'active' : ''}`}
                onClick={() => setStatusFilter('processing')}
              >
                进行中
              </button>
              <button
                className={`chip ${statusFilter === 'completed' ? 'active' : ''}`}
                onClick={() => setStatusFilter('completed')}
              >
                已完成
              </button>
              <button
                className={`chip ${statusFilter === 'cancelled' ? 'active' : ''}`}
                onClick={() => setStatusFilter('cancelled')}
              >
                已取消
              </button>
            </div>

            <select className="sort-select">
              <option>时间降序</option>
              <option>时间升序</option>
              <option>金额降序</option>
              <option>金额升序</option>
            </select>
          </div>

          {/* 订单列表 */}
          <div className="orders-table">
            <div className="table-header">
              <div className="th">订单 ID</div>
              <div className="th">服务信息</div>
              <div className="th">客户</div>
              <div className="th">金额</div>
              <div className="th">状态</div>
              <div className="th">创建时间</div>
              <div className="th">交付时间</div>
              <div className="th">操作</div>
            </div>

            {filteredOrders.map((order, index) => (
              <div key={order.id} className="table-row" style={{ animationDelay: `${index * 0.05}s` }}>
                <div className="td mono">{order.id}</div>
                <div className="td service">
                  <div className="service-name">{order.serviceName}</div>
                  <div className="service-type">{order.type === 'subscription' ? '订阅' : '项目'}</div>
                </div>
                <div className="td customer">
                  <div className="customer-avatar">{order.customerAvatar}</div>
                  <div className="customer-name">{order.customerName}</div>
                </div>
                <div className="td amount">¥{order.amount}</div>
                <div className="td">
                  <span
                    className="status-badge"
                    style={{
                      background: `${getStatusColor(order.status)}20`,
                      color: getStatusColor(order.status),
                      borderColor: getStatusColor(order.status),
                    }}
                  >
                    <span
                      className="status-dot"
                      style={{ background: getStatusColor(order.status) }}
                    />
                    {getStatusLabel(order.status)}
                  </span>
                </div>
                <div className="td date">{order.createdAt}</div>
                <div className="td delivery">{order.deliveryTime}</div>
                <div className="td actions">
                  <button
                    className="action-btn view"
                    onClick={() => { setSelectedOrder(order); setShowDetail(true); }}
                  >
                    详情
                  </button>
                  {order.status === 'pending' && (
                    <button className="action-btn accept">接单</button>
                  )}
                  {order.status === 'processing' && (
                    <button className="action-btn deliver">交付</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* 订单详情弹窗 */}
      {showDetail && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="order-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>订单详情</h2>
              <button className="modal-close" onClick={() => setShowDetail(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h3>订单信息</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-label">订单 ID</div>
                    <div className="info-value mono">{selectedOrder.id}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">下单时间</div>
                    <div className="info-value">{selectedOrder.createdAt}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">订单状态</div>
                    <div className="info-value">
                      <span
                        className="status-badge"
                        style={{
                          background: `${getStatusColor(selectedOrder.status)}20`,
                          color: getStatusColor(selectedOrder.status),
                        }}
                      >
                        {getStatusLabel(selectedOrder.status)}
                      </span>
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">订单类型</div>
                    <div className="info-value">{selectedOrder.type === 'subscription' ? '订阅' : '项目'}</div>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>服务信息</h3>
                <div className="service-detail-card">
                  <div className="service-detail-name">{selectedOrder.serviceName}</div>
                  <div className="service-detail-desc">专业、高效的服务，确保满足您的需求</div>
                </div>
              </div>

              <div className="detail-section">
                <h3>客户信息</h3>
                <div className="customer-detail">
                  <div className="customer-detail-avatar">{selectedOrder.customerAvatar}</div>
                  <div className="customer-detail-info">
                    <div className="customer-detail-name">{selectedOrder.customerName}</div>
                    <div className="customer-detail-email">zhang***@example.com</div>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>支付信息</h3>
                <div className="payment-info">
                  <div className="payment-row">
                    <span className="payment-label">订单金额</span>
                    <span className="payment-value">¥{selectedOrder.amount}</span>
                  </div>
                  <div className="payment-row">
                    <span className="payment-label">支付方式</span>
                    <span className="payment-value">支付宝</span>
                  </div>
                  <div className="payment-row total">
                    <span className="payment-label">实付金额</span>
                    <span className="payment-value">¥{selectedOrder.amount}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              {selectedOrder.status === 'pending' ? (
                <>
                  <button className="btn-ghost" onClick={() => setShowDetail(false)}>关闭</button>
                  <button className="btn-accept">接单</button>
                  <button className="btn-reject">拒绝</button>
                </>
              ) : selectedOrder.status === 'processing' ? (
                <>
                  <button className="btn-ghost" onClick={() => setShowDetail(false)}>关闭</button>
                  <button className="btn-deliver">确认交付</button>
                </>
              ) : (
                <button className="btn-primary" onClick={() => setShowDetail(false)}>关闭</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
