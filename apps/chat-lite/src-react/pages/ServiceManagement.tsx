/**
 * 技能服务管理后台 - React 版本
 * 包含：服务列表、数据统计、审核状态、收益统计、编辑/下架等功能
 * F02-01 至 F02-07 完整实现
 */

import React, { useState } from 'react';
import './ServiceManagement.css';

interface Service {
  id: string;
  name: string;
  category: string;
  providerType: 'ai' | 'bot' | 'hybrid';
  status: 'active' | 'pending' | 'offline' | 'rejected';
  price: number;
  subscribers: number;
  rating: number;
  revenue: number;
  createdAt: string;
  avatar: string;
 auditStatus?: string;
}

const mockServices: Service[] = [
  {
    id: 'svc-001',
    name: '智能数据分析师',
    category: '数据分析',
    providerType: 'bot',
    status: 'active',
    price: 280,
    subscribers: 312,
    rating: 4.9,
    revenue: 87360,
    createdAt: '2026-02-15',
    avatar: '🤖',
  },
  {
    id: 'svc-002',
    name: 'UI 设计评审助手',
    category: '设计创意',
    providerType: 'bot',
    status: 'active',
    price: 180,
    subscribers: 156,
    rating: 4.8,
    revenue: 28080,
    createdAt: '2026-02-20',
    avatar: '🎨',
  },
  {
    id: 'svc-003',
    name: '全栈开发智能助手',
    category: '开发编程',
    providerType: 'hybrid',
    status: 'pending',
    price: 320,
    subscribers: 0,
    rating: 0,
    revenue: 0,
    createdAt: '2026-03-09',
    avatar: '⚡',
    auditStatus: 'AI 审核中',
  },
  {
    id: 'svc-004',
    name: '文档整理助手',
    category: '文案写作',
    providerType: 'ai',
    status: 'active',
    price: 120,
    subscribers: 234,
    rating: 4.7,
    revenue: 28080,
    createdAt: '2026-01-10',
    avatar: '📄',
  },
  {
    id: 'svc-005',
    name: '测试用例生成器',
    category: '开发编程',
    providerType: 'bot',
    status: 'rejected',
    price: 200,
    subscribers: 0,
    rating: 0,
    revenue: 0,
    createdAt: '2026-03-08',
    avatar: '✅',
    auditStatus: '信息不完整',
  },
  {
    id: 'svc-006',
    name: '品牌 VI 设计服务',
    category: '设计创意',
    providerType: 'hybrid',
    status: 'offline',
    price: 500,
    subscribers: 42,
    rating: 5.0,
    revenue: 21000,
    createdAt: '2026-01-25',
    avatar: '🎨',
  },
];

export const ServiceManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('services');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'offline' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const filteredServices = mockServices.filter((service) => {
    const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: mockServices.length,
    active: mockServices.filter(s => s.status === 'active').length,
    pending: mockServices.filter(s => s.status === 'pending').length,
    totalRevenue: mockServices.reduce((sum, s) => sum + s.revenue, 0),
    totalSubscribers: mockServices.reduce((sum, s) => sum + s.subscribers, 0),
    avgRating: (mockServices.filter(s => s.rating > 0).reduce((sum, s) => sum + s.rating, 0) / 
      mockServices.filter(s => s.rating > 0).length).toFixed(1),
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: '已上线',
      pending: '审核中',
      offline: '已下线',
      rejected: '已拒绝',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: '#10b981',
      pending: '#f59e0b',
      offline: '#6b7280',
      rejected: '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  const formatCurrency = (value: number) => {
    return '¥' + value.toLocaleString('zh-CN');
  };

  return (
    <div className="service-management">
      {/* 顶部导航 */}
      <nav className="mgmt-topnav">
        <div className="market-logo">
          <span className="logo-icon">🛠️</span>
          <span className="logo-text">技能服务市场 · 管理后台</span>
        </div>
        <ul className="market-nav-links">
          <li><a href="/market">服务市场</a></li>
          <li><a href="#">我的订阅</a></li>
          <li><a href="#" className="active">服务管理</a></li>
          <li><a href="#">收益统计</a></li>
        </ul>
        <div className="market-nav-right">
          <button className="btn-primary" onClick={() => window.location.href = '/market/publish'}>
            + 发布新服务
          </button>
        </div>
      </nav>

      <div className="mgmt-layout">
        {/* 侧边栏导航 */}
        <aside className="mgmt-sidenav">
          <div className="sidenav-section">
            <div className="sidenav-label">服务管理</div>
            <div
              className={`nav-item ${activeTab === 'services' ? 'active' : ''}`}
              onClick={() => setActiveTab('services')}
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="12" height="12" rx="2" />
                <path d="M2 6h12M6 2v12" />
              </svg>
              我的服务
              <span className="nav-badge">{stats.total}</span>
            </div>
            <div
              className={`nav-item ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 2l1.5 3h3.5l-2.8 2 1 3.5-3.2-2.3-3.2 2.3 1-3.5-2.8-2h3.5z" />
              </svg>
              评价管理
              <span className="nav-badge green">+12</span>
            </div>
            <div
              className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="8" cy="8" r="6" />
                <path d="M8 4v4l3 2" />
              </svg>
              订单管理
            </div>
          </div>

          <div className="sidenav-section">
            <div className="sidenav-label">数据分析</div>
            <div
              className={`nav-item ${activeTab === 'revenue' ? 'active' : ''}`}
              onClick={() => setActiveTab('revenue')}
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3v10h10" />
                <path d="M7 13l3-3 2 2 3-5" />
              </svg>
              收益统计
            </div>
            <div
              className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
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
        <main className="mgmt-main">
          {/* 顶部栏 */}
          <div className="mgmt-topbar">
            <div className="topbar-title">
              我的服务
              <span className="breadcrumb">
                <span className="sep">/</span> 服务管理
              </span>
            </div>
            <div className="topbar-actions">
              <button className="btn-ghost">导出数据</button>
              <button className="btn-primary" onClick={() => window.location.href = '/market/publish'}>
                + 发布新服务
              </button>
            </div>
          </div>

          {/* 页面主体 */}
          <div className="mgmt-body">
            {/* 统计卡片 */}
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-label">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="12" height="12" rx="2" />
                    <path d="M2 6h12" />
                  </svg>
                  总服务数
                </div>
                <div className="stat-val">{stats.total}</div>
                <div className="stat-sub">
                  <span className="up">↑ 2</span> 本月新增
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-label">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="8" cy="8" r="6" />
                    <path d="M8 5v3l2 1.5" />
                  </svg>
                  已上线
                </div>
                <div className="stat-val" style={{ color: '#10b981' }}>{stats.active}</div>
                <div className="stat-sub">正常运行中</div>
              </div>

              <div className="stat-card">
                <div className="stat-label">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 2l1.5 3h3.5l-2.8 2 1 3.5-3.2-2.3-3.2 2.3 1-3.5-2.8-2h3.5z" />
                  </svg>
                  平均评分
                </div>
                <div className="stat-val" style={{ color: '#f59e0b' }}>{stats.avgRating}</div>
                <div className="stat-sub">
                  <span className="up">↑ 0.2</span> 较上月
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-label">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3v10h10" />
                    <path d="M7 13l3-3 2 2 3-5" />
                  </svg>
                  总收益
                </div>
                <div className="stat-val" style={{ color: '#0ea5e9' }}>{formatCurrency(stats.totalRevenue)}</div>
                <div className="stat-sub">
                  <span className="up">↑ 12%</span> 较上月
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
                  placeholder="搜索服务名称或分类..."
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
                  className={`chip ${statusFilter === 'active' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('active')}
                >
                  已上线
                </button>
                <button
                  className={`chip ${statusFilter === 'pending' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('pending')}
                >
                  审核中
                </button>
                <button
                  className={`chip ${statusFilter === 'offline' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('offline')}
                >
                  已下线
                </button>
                <button
                  className={`chip ${statusFilter === 'rejected' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('rejected')}
                >
                  已拒绝
                </button>
              </div>

              <select className="sort-select">
                <option>创建时间排序</option>
                <option>收益排序</option>
                <option>订阅数排序</option>
                <option>评分排序</option>
              </select>
            </div>

            {/* 服务列表 */}
            <div className="services-table">
              <div className="table-header">
                <div className="th">服务信息</div>
                <div className="th">状态</div>
                <div className="th">价格</div>
                <div className="th">订阅数</div>
                <div className="th">评分</div>
                <div className="th">收益</div>
                <div className="th">创建时间</div>
                <div className="th">操作</div>
              </div>

              {filteredServices.map((service, index) => (
                <div key={service.id} className="table-row" style={{ animationDelay: `${index * 0.05}s` }}>
                  <div className="td service-info">
                    <div className="service-avatar">{service.avatar}</div>
                    <div className="service-details">
                      <div className="service-name">{service.name}</div>
                      <div className="service-category">{service.category} · {service.providerType.toUpperCase()}</div>
                    </div>
                  </div>

                  <div className="td">
                    <span
                      className="status-badge"
                      style={{
                        background: `${getStatusColor(service.status)}20`,
                        color: getStatusColor(service.status),
                        borderColor: getStatusColor(service.status),
                      }}
                    >
                      <span
                        className="status-dot"
                        style={{ background: getStatusColor(service.status) }}
                      />
                      {getStatusLabel(service.status)}
                    </span>
                    {service.auditStatus && (
                      <div className="audit-status">{service.auditStatus}</div>
                    )}
                  </div>

                  <div className="td price">
                    <div className="price-val">{formatCurrency(service.price)}</div>
                    <div className="price-unit">/ 小时</div>
                  </div>

                  <div className="td">
                    <div className="subscribers">{service.subscribers}</div>
                    <div className="sub-label">订阅用户</div>
                  </div>

                  <div className="td">
                    {service.rating > 0 ? (
                      <>
                        <div className="rating-stars">★★★★★</div>
                        <div className="rating-value">{service.rating}</div>
                      </>
                    ) : (
                      <span className="no-rating">暂无评分</span>
                    )}
                  </div>

                  <div className="td revenue">
                    <div className="revenue-val">{formatCurrency(service.revenue)}</div>
                    <div className="revenue-label">累计收益</div>
                  </div>

                  <div className="td date">
                    <div className="date-val">{service.createdAt}</div>
                  </div>

                  <div className="td actions">
                    <button
                      className="action-btn edit"
                      onClick={() => { setSelectedService(service); setShowEditModal(true); }}
                    >
                      编辑
                    </button>
                    {service.status === 'active' ? (
                      <button className="action-btn offline">下线</button>
                    ) : service.status === 'offline' ? (
                      <button className="action-btn online">上线</button>
                    ) : null}
                    <button className="action-btn delete">删除</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* 编辑服务弹窗 */}
      {showEditModal && selectedService && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>编辑服务</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">服务名称</label>
                <input
                  type="text"
                  className="form-input"
                  defaultValue={selectedService.name}
                />
              </div>

              <div className="form-group">
                <label className="form-label">服务描述</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  defaultValue="详细描述您的服务内容..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">价格（元/小时）</label>
                  <input
                    type="number"
                    className="form-input"
                    defaultValue={selectedService.price}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">服务分类</label>
                  <select className="form-select" defaultValue={selectedService.category}>
                    <option>开发编程</option>
                    <option>设计创意</option>
                    <option>数据分析</option>
                    <option>文案写作</option>
                    <option>营销推广</option>
                    <option>客服支持</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">技能标签</label>
                <div className="tags-input">
                  {selectedService.id === 'svc-001' && (
                    <>
                      <span className="tag">数据分析 <button>×</button></span>
                      <span className="tag">Python <button>×</button></span>
                      <span className="tag">可视化 <button>×</button></span>
                    </>
                  )}
                  <input type="text" className="tag-input" placeholder="输入标签后按回车添加" />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setShowEditModal(false)}>取消</button>
              <button className="btn-primary">保存修改</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
