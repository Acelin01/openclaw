/**
 * 收益统计页面 - React 版本
 * 包含：收益图表、趋势分析、订单统计、收入明细等
 */

import React, { useState } from 'react';
import './RevenueStats.css';

interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
  subscribers: number;
}

interface ServiceRevenue {
  id: string;
  name: string;
  revenue: number;
  orders: number;
  growth: number;
}

const mockRevenueData: RevenueData[] = [
  { date: '2026-03-01', revenue: 12800, orders: 45, subscribers: 12 },
  { date: '2026-03-02', revenue: 15600, orders: 52, subscribers: 15 },
  { date: '2026-03-03', revenue: 18200, orders: 61, subscribers: 18 },
  { date: '2026-03-04', revenue: 14500, orders: 48, subscribers: 10 },
  { date: '2026-03-05', revenue: 21000, orders: 68, subscribers: 22 },
  { date: '2026-03-06', revenue: 19800, orders: 63, subscribers: 19 },
  { date: '2026-03-07', revenue: 23500, orders: 75, subscribers: 25 },
  { date: '2026-03-08', revenue: 26800, orders: 82, subscribers: 28 },
  { date: '2026-03-09', revenue: 18900, orders: 58, subscribers: 16 },
];

const mockServiceRevenue: ServiceRevenue[] = [
  { id: 'svc-001', name: '智能数据分析师', revenue: 87360, orders: 312, growth: 15.2 },
  { id: 'svc-002', name: 'UI 设计评审助手', revenue: 28080, orders: 156, growth: 8.5 },
  { id: 'svc-004', name: '文档整理助手', revenue: 28080, orders: 234, growth: -3.2 },
  { id: 'svc-006', name: '品牌 VI 设计服务', revenue: 21000, orders: 42, growth: 22.1 },
];

export const RevenueStats: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [showDetail, setShowDetail] = useState(false);

  const totalRevenue = mockRevenueData.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = mockRevenueData.reduce((sum, d) => sum + d.orders, 0);
  const totalSubscribers = mockRevenueData.reduce((sum, d) => sum + d.subscribers, 0);
  const avgOrderValue = totalRevenue / totalOrders;
  const growthRate = ((mockRevenueData[mockRevenueData.length - 1].revenue - mockRevenueData[0].revenue) / mockRevenueData[0].revenue * 100).toFixed(1);

  const maxRevenue = Math.max(...mockRevenueData.map(d => d.revenue));

  return (
    <div className="revenue-stats">
      {/* 顶部导航 */}
      <nav className="mgmt-topnav">
        <div className="market-logo">
          <span className="logo-icon">🛠️</span>
          <span className="logo-text">技能服务市场 · 收益统计</span>
        </div>
        <ul className="market-nav-links">
          <li><a href="/market">服务市场</a></li>
          <li><a href="#">我的订阅</a></li>
          <li><a href="/market/manage" className="active">服务管理</a></li>
          <li><a href="#" className="active">收益统计</a></li>
        </ul>
        <div className="market-nav-right">
          <button className="btn-ghost">导出数据</button>
        </div>
      </nav>

      <div className="revenue-layout">
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
            <div className="nav-item">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 2l1.5 3h3.5l-2.8 2 1 3.5-3.2-2.3-3.2 2.3 1-3.5-2.8-2h3.5z" />
              </svg>
              评价管理
              <span className="nav-badge green">+12</span>
            </div>
            <div className="nav-item" onClick={() => window.location.href = '/market/orders'}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="8" cy="8" r="6" />
                <path d="M8 4v4l3 2" />
              </svg>
              订单管理
            </div>
          </div>

          <div className="sidenav-section">
            <div className="sidenav-label">数据分析</div>
            <div className="nav-item active">
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
        <main className="revenue-main">
          {/* 顶部栏 */}
          <div className="revenue-header">
            <h1>收益统计</h1>
            <div className="time-range-selector">
              <button
                className={`range-btn ${timeRange === 'week' ? 'active' : ''}`}
                onClick={() => setTimeRange('week')}
              >
                近 7 天
              </button>
              <button
                className={`range-btn ${timeRange === 'month' ? 'active' : ''}`}
                onClick={() => setTimeRange('month')}
              >
                近 30 天
              </button>
              <button
                className={`range-btn ${timeRange === 'year' ? 'active' : ''}`}
                onClick={() => setTimeRange('year')}
              >
                本年度
              </button>
            </div>
          </div>

          {/* 统计卡片 */}
          <div className="stats-row">
            <div className="stat-card revenue">
              <div className="stat-label">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3v10h10" />
                  <path d="M7 13l3-3 2 2 3-5" />
                </svg>
                总收益
              </div>
              <div className="stat-val">¥{totalRevenue.toLocaleString('zh-CN')}</div>
              <div className="stat-sub">
                <span className="up">↑ {growthRate}%</span> 较上期
              </div>
            </div>

            <div className="stat-card orders">
              <div className="stat-label">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="8" cy="8" r="6" />
                  <path d="M8 4v4l3 2" />
                </svg>
                总订单数
              </div>
              <div className="stat-val">{totalOrders}</div>
              <div className="stat-sub">
                <span className="up">↑ 18%</span> 较上期
              </div>
            </div>

            <div className="stat-card subscribers">
              <div className="stat-label">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2Zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm-2 4a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" />
                </svg>
                新增订阅
              </div>
              <div className="stat-val">{totalSubscribers}</div>
              <div className="stat-sub">
                <span className="up">↑ 25%</span> 较上期
              </div>
            </div>

            <div className="stat-card avg">
              <div className="stat-label">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="6" width="12" height="8" rx="2" />
                  <path d="M6 6V4a2 2 0 0 1 4 0v2" />
                </svg>
                客单价
              </div>
              <div className="stat-val">¥{avgOrderValue.toFixed(0)}</div>
              <div className="stat-sub">
                <span className="down">↓ 5%</span> 较上期
              </div>
            </div>
          </div>

          {/* 收益趋势图表 */}
          <div className="chart-section">
            <div className="chart-header">
              <h2>收益趋势</h2>
              <div className="chart-actions">
                <button className="chart-btn active">收益</button>
                <button className="chart-btn">订单数</button>
                <button className="chart-btn">订阅数</button>
              </div>
            </div>
            <div className="chart-container">
              <div className="chart-bars">
                {mockRevenueData.map((data, index) => (
                  <div key={index} className="chart-bar-wrapper">
                    <div
                      className="chart-bar"
                      style={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                      title={`¥${data.revenue.toLocaleString()}`}
                    />
                    <div className="chart-label">
                      {data.date.slice(5)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="chart-y-axis">
                <div className="y-label">¥{(maxRevenue / 1000).toFixed(0)}k</div>
                <div className="y-label">¥{(maxRevenue * 0.75 / 1000).toFixed(0)}k</div>
                <div className="y-label">¥{(maxRevenue * 0.5 / 1000).toFixed(0)}k</div>
                <div className="y-label">¥{(maxRevenue * 0.25 / 1000).toFixed(0)}k</div>
                <div className="y-label">¥0</div>
              </div>
            </div>
          </div>

          {/* 服务收益排行 */}
          <div className="service-revenue-section">
            <div className="section-header">
              <h2>服务收益排行</h2>
              <button className="view-all-btn" onClick={() => setShowDetail(true)}>
                查看全部 →
              </button>
            </div>
            <div className="service-revenue-list">
              {mockServiceRevenue.map((service, index) => (
                <div key={service.id} className="service-revenue-item">
                  <div className="rank">{index + 1}</div>
                  <div className="service-info">
                    <div className="service-name">{service.name}</div>
                    <div className="service-stats">
                      <span>{service.orders} 订单</span>
                    </div>
                  </div>
                  <div className="revenue-info">
                    <div className="revenue-amount">¥{service.revenue.toLocaleString()}</div>
                    <div className={`revenue-growth ${service.growth >= 0 ? 'up' : 'down'}`}>
                      {service.growth >= 0 ? '↑' : '↓'} {Math.abs(service.growth)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 收入明细表 */}
          <div className="revenue-detail-section">
            <div className="section-header">
              <h2>收入明细</h2>
              <button className="export-btn">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 2v8m0 0l3-3m-3 3-3-3M3 11v2a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2" />
                </svg>
                导出 Excel
              </button>
            </div>
            <div className="detail-table">
              <div className="detail-header">
                <div className="th">日期</div>
                <div className="th">服务名称</div>
                <div className="th">订单 ID</div>
                <div className="th">类型</div>
                <div className="th">金额</div>
                <div className="th">状态</div>
              </div>
              {[
                { date: '2026-03-09', service: '智能数据分析师', orderId: 'ORD-20260309-001', type: '订阅', amount: 280, status: '已完成' },
                { date: '2026-03-09', service: 'UI 设计评审助手', orderId: 'ORD-20260309-002', type: '订阅', amount: 180, status: '已完成' },
                { date: '2026-03-08', service: '品牌 VI 设计服务', orderId: 'ORD-20260308-001', type: '项目', amount: 5000, status: '已完成' },
                { date: '2026-03-08', service: '文档整理助手', orderId: 'ORD-20260308-002', type: '订阅', amount: 120, status: '已完成' },
                { date: '2026-03-07', service: '智能数据分析师', orderId: 'ORD-20260307-001', type: '订阅', amount: 280, status: '已完成' },
              ].map((item, index) => (
                <div key={index} className="detail-row">
                  <div className="td">{item.date}</div>
                  <div className="td">{item.service}</div>
                  <div className="td mono">{item.orderId}</div>
                  <div className="td">
                    <span className="type-tag">{item.type}</span>
                  </div>
                  <div className="td amount">¥{item.amount}</div>
                  <div className="td">
                    <span className="status-badge completed">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
