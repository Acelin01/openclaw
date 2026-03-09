/**
 * 流量分析页面 - React 版本
 * 包含：访问量趋势图、转化率统计、用户来源分析、热门服务排行等
 */

import React, { useState } from 'react';
import './TrafficAnalytics.css';

interface TrafficData {
  date: string;
  views: number;
  visitors: number;
  orders: number;
  conversion: number;
}

interface SourceData {
  source: string;
  visitors: number;
  percentage: number;
  color: string;
}

interface ServiceData {
  id: string;
  name: string;
  views: number;
  orders: number;
  conversion: number;
  revenue: number;
}

const mockTrafficData: TrafficData[] = [
  { date: '2026-03-01', views: 1280, visitors: 856, orders: 45, conversion: 5.3 },
  { date: '2026-03-02', views: 1560, visitors: 1042, orders: 52, conversion: 5.0 },
  { date: '2026-03-03', views: 1820, visitors: 1215, orders: 61, conversion: 5.0 },
  { date: '2026-03-04', views: 1450, visitors: 968, orders: 48, conversion: 5.0 },
  { date: '2026-03-05', views: 2100, visitors: 1402, orders: 68, conversion: 4.9 },
  { date: '2026-03-06', views: 1980, visitors: 1322, orders: 63, conversion: 4.8 },
  { date: '2026-03-07', views: 2350, visitors: 1569, orders: 75, conversion: 4.8 },
  { date: '2026-03-08', views: 2680, visitors: 1790, orders: 82, conversion: 4.6 },
  { date: '2026-03-09', views: 1890, visitors: 1262, orders: 58, conversion: 4.6 },
];

const mockSourceData: SourceData[] = [
  { source: '直接访问', visitors: 4520, percentage: 35, color: '#0ea5e9' },
  { source: '搜索引擎', visitors: 3240, percentage: 25, color: '#10b981' },
  { source: '社交媒体', visitors: 2592, percentage: 20, color: '#8b5cf6' },
  { source: '外部链接', visitors: 1944, percentage: 15, color: '#f59e0b' },
  { source: '其他', visitors: 648, percentage: 5, color: '#6b7280' },
];

const mockServiceData: ServiceData[] = [
  { id: 'svc-001', name: '智能数据分析师', views: 5680, orders: 312, conversion: 5.5, revenue: 87360 },
  { id: 'svc-002', name: 'UI 设计评审助手', views: 3420, orders: 156, conversion: 4.6, revenue: 28080 },
  { id: 'svc-004', name: '文档整理助手', views: 4250, orders: 234, conversion: 5.5, revenue: 28080 },
  { id: 'svc-006', name: '品牌 VI 设计服务', views: 2180, orders: 42, conversion: 1.9, revenue: 21000 },
  { id: 'svc-003', name: '全栈开发智能助手', views: 1890, orders: 89, conversion: 4.7, revenue: 28480 },
];

export const TrafficAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [metricType, setMetricType] = useState<'views' | 'visitors' | 'orders'>('views');

  const totalViews = mockTrafficData.reduce((sum, d) => sum + d.views, 0);
  const totalVisitors = mockTrafficData.reduce((sum, d) => sum + d.visitors, 0);
  const totalOrders = mockTrafficData.reduce((sum, d) => sum + d.orders, 0);
  const avgConversion = (mockTrafficData.reduce((sum, d) => sum + d.conversion, 0) / mockTrafficData.length).toFixed(1);
  const viewsGrowth = ((mockTrafficData[mockTrafficData.length - 1].views - mockTrafficData[0].views) / mockTrafficData[0].views * 100).toFixed(1);

  const maxMetric = Math.max(...mockTrafficData.map(d => d[metricType]));

  return (
    <div className="traffic-analytics">
      {/* 顶部导航 */}
      <nav className="mgmt-topnav">
        <div className="market-logo">
          <span className="logo-icon">🛠️</span>
          <span className="logo-text">技能服务市场 · 流量分析</span>
        </div>
        <ul className="market-nav-links">
          <li><a href="/market">服务市场</a></li>
          <li><a href="#">我的订阅</a></li>
          <li><a href="/market/manage">服务管理</a></li>
          <li><a href="#" className="active">流量分析</a></li>
        </ul>
        <div className="market-nav-right">
          <button className="btn-ghost">导出报告</button>
        </div>
      </nav>

      <div className="analytics-layout">
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
            <div className="nav-item" onClick={() => window.location.href = '/market/revenue'}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3v10h10" />
                <path d="M7 13l3-3 2 2 3-5" />
              </svg>
              收益统计
            </div>
            <div className="nav-item active">
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
        <main className="analytics-main">
          {/* 顶部栏 */}
          <div className="analytics-header">
            <h1>流量分析</h1>
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
            <div className="stat-card views">
              <div className="stat-label">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                总访问量
              </div>
              <div className="stat-val">{totalViews.toLocaleString()}</div>
              <div className="stat-sub">
                <span className="up">↑ {viewsGrowth}%</span> 较上期
              </div>
            </div>

            <div className="stat-card visitors">
              <div className="stat-label">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2Zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm-2 4a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" />
                </svg>
                访客数
              </div>
              <div className="stat-val">{totalVisitors.toLocaleString()}</div>
              <div className="stat-sub">
                <span className="up">↑ 22%</span> 较上期
              </div>
            </div>

            <div className="stat-card orders">
              <div className="stat-label">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="8" cy="8" r="6" />
                  <path d="M8 4v4l3 2" />
                </svg>
                订单数
              </div>
              <div className="stat-val">{totalOrders}</div>
              <div className="stat-sub">
                <span className="up">↑ 18%</span> 较上期
              </div>
            </div>

            <div className="stat-card conversion">
              <div className="stat-label">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3v10h10" />
                  <path d="M7 13l3-3 2 2 3-5" />
                </svg>
                平均转化率
              </div>
              <div className="stat-val">{avgConversion}%</div>
              <div className="stat-sub">
                <span className="down">↓ 0.2%</span> 较上期
              </div>
            </div>
          </div>

          {/* 访问量趋势图 */}
          <div className="chart-section">
            <div className="chart-header">
              <h2>访问量趋势</h2>
              <div className="chart-metrics">
                <button
                  className={`metric-btn ${metricType === 'views' ? 'active' : ''}`}
                  onClick={() => setMetricType('views')}
                >
                  访问量
                </button>
                <button
                  className={`metric-btn ${metricType === 'visitors' ? 'active' : ''}`}
                  onClick={() => setMetricType('visitors')}
                >
                  访客数
                </button>
                <button
                  className={`metric-btn ${metricType === 'orders' ? 'active' : ''}`}
                  onClick={() => setMetricType('orders')}
                >
                  订单数
                </button>
              </div>
            </div>
            <div className="chart-container">
              <div className="chart-area">
                <div className="chart-line" style={{ height: '100%' }}>
                  {mockTrafficData.map((data, index) => (
                    <div
                      key={index}
                      className="chart-point"
                      style={{
                        left: `${(index / (mockTrafficData.length - 1)) * 100}%`,
                        bottom: `${(data[metricType] / maxMetric) * 100}%`,
                      }}
                    >
                      <div className="point-dot" />
                      <div className="point-tooltip">
                        {data[metricType].toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="chart-x-axis">
                  {mockTrafficData.map((data, index) => (
                    <div key={index} className="x-label">
                      {data.date.slice(5)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 用户来源分析 */}
          <div className="sources-section">
            <div className="section-header">
              <h2>用户来源分析</h2>
            </div>
            <div className="sources-content">
              <div className="sources-chart">
                <div className="pie-chart">
                  {mockSourceData.map((source, index) => (
                    <div
                      key={index}
                      className="pie-segment"
                      style={{
                        background: `conic-gradient(${source.color} 0% ${source.percentage}%, transparent ${source.percentage}% 100%)`,
                        transform: `rotate(${mockSourceData.slice(0, index).reduce((sum, s) => sum + s.percentage, 0) * 3.6}deg)`,
                      }}
                    />
                  ))}
                </div>
                <div className="pie-center">
                  <div className="center-value">{totalVisitors.toLocaleString()}</div>
                  <div className="center-label">总访客</div>
                </div>
              </div>
              <div className="sources-list">
                {mockSourceData.map((source, index) => (
                  <div key={index} className="source-item">
                    <div className="source-indicator" style={{ background: source.color }} />
                    <div className="source-info">
                      <div className="source-name">{source.source}</div>
                      <div className="source-visitors">{source.visitors.toLocaleString()} 访客</div>
                    </div>
                    <div className="source-percentage">{source.percentage}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 热门服务排行 */}
          <div className="services-section">
            <div className="section-header">
              <h2>热门服务排行</h2>
              <button className="view-all-btn">查看全部 →</button>
            </div>
            <div className="services-table">
              <div className="table-header">
                <div className="th">排名</div>
                <div className="th">服务名称</div>
                <div className="th">访问量</div>
                <div className="th">订单数</div>
                <div className="th">转化率</div>
                <div className="th">收益</div>
              </div>
              {mockServiceData.map((service, index) => (
                <div key={service.id} className="table-row">
                  <div className="td rank">
                    <div className={`rank-badge rank-${index + 1}`}>{index + 1}</div>
                  </div>
                  <div className="td service-name">{service.name}</div>
                  <div className="td views">{service.views.toLocaleString()}</div>
                  <div className="td orders">{service.orders}</div>
                  <div className="td conversion">
                    <div className="conversion-bar">
                      <div
                        className="conversion-fill"
                        style={{ width: `${Math.min(service.conversion * 10, 100)}%` }}
                      />
                    </div>
                    <span className="conversion-value">{service.conversion}%</span>
                  </div>
                  <div className="td revenue">¥{service.revenue.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
