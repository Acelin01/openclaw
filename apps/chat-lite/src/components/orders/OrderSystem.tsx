/**
 * OrderSystem - 订单系统
 * 对应文档：订单系统.md (F04-01 ~ F04-15)
 * 
 * 功能列表:
 * - F04-01: 创建订单
 * - F04-02: 支付预付款
 * - F04-03: 订单列表与筛选
 * - F04-04: 订单详情
 * - F04-05: 取消订单
 * - F04-06: 实时工时记录
 * - F04-07: 实时计费扣费
 * - F04-08: 余额预警多级通知
 * - F04-09: 订单状态跟踪
 * - F04-10: 任务进度与交付物
 * - F04-11: 验收确认 (72 小时)
 * - F04-12: 修改请求
 * - F04-13: 订单申诉 AI 仲裁
 * - F04-14: 双向评价 AI 审核
 * - F04-15: 导出订单明细
 */

import React, { useState, useEffect, useRef } from 'react';
import './OrderSystem.css';
import { orderAPI, type Order, type OrderStats, type OrderFilter } from '../../services/order-api';

// 状态类型
type OrderStatus = 'all' | 'active' | 'review' | 'pending' | 'done' | 'disputed' | 'cancelled';
type TabType = 'all' | 'active' | 'review' | 'pending' | 'done';

export const OrderSystem: React.FC = () => {
  // 状态管理
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [filter, setFilter] = useState<OrderFilter>({
    status: 'all',
    search: '',
    amountRange: 'all',
    sortBy: 'latest',
  });
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [isLoading, setIsLoading] = useState(true);
  
  // 实时计时器
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [countdownSeconds, setCountdownSeconds] = useState(47 * 3600 + 23 * 60 + 18);
  
  // Modal 状态
  const [showPayModal, setShowPayModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAlert, setShowAlert] = useState(true);

  // 加载数据
  useEffect(() => {
    loadOrders();
    loadStats();
    
    // 启动实时计时器
    const timerInterval = setInterval(() => {
      setTimerSeconds(prev => prev + 1);
    }, 1000);
    
    const countdownInterval = setInterval(() => {
      setCountdownSeconds(prev => Math.max(0, prev - 1));
    }, 1000);
    
    return () => {
      clearInterval(timerInterval);
      clearInterval(countdownInterval);
    };
  }, []);

  // 加载订单列表
  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const data = await orderAPI.getOrders(filter);
      setOrders(data);
    } catch (error) {
      console.error('加载订单失败:', error);
      toast('error', '加载失败', '请刷新页面重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 加载统计
  const loadStats = async () => {
    try {
      const data = await orderAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error('加载统计失败:', error);
    }
  };

  // 筛选订单
  const filterOrders = () => {
    loadOrders();
  };

  // 设置 Tab
  const setTab = (tab: TabType) => {
    setActiveTab(tab);
    setFilter(prev => ({ ...prev, status: tab === 'all' ? 'all' : tab }));
  };

  // 选择订单
  const selectOrder = (order: Order) => {
    setSelectedOrder(order);
  };

  // 创建订单
  const createOrder = () => {
    setShowPayModal(true);
  };

  // 导出订单
  const exportOrders = () => {
    setShowExportModal(true);
  };

  // 格式化时间
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // 计算已消耗金额
  const calculateSpend = (ratePerHour: number, seconds: number) => {
    return (ratePerHour / 3600 * seconds).toFixed(2);
  };

  // 获取状态样式
  const getStatusClass = (status: string) => {
    const map: Record<string, string> = {
      'pending_pay': 'sp-pending-pay',
      'pending_take': 'sp-pending-take',
      'active': 'sp-active',
      'review': 'sp-review',
      'done': 'sp-done',
      'disputed': 'sp-dispute',
      'cancelled': 'sp-cancelled',
    };
    return map[status] || 'sp-done';
  };

  // 获取状态文本
  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      'pending_pay': '待支付',
      'pending_take': '待接单',
      'active': '进行中',
      'review': '待验收',
      'done': '已完成',
      'disputed': '申诉中',
      'cancelled': '已取消',
    };
    return map[status] || '未知';
  };

  return (
    <div className="order-system">
      {/* 导航栏 */}
      <nav className="navbar">
        <div className="nav-brand">
          <div className="nav-logo">🤖</div>
          <span className="nav-brand-name">技能共享平台</span>
        </div>
        <div className="nav-links">
          <div className="nav-link" onClick={() => toast('info', '数据概览', '跳转中...')}>工作台</div>
          <div className="nav-link" onClick={() => toast('info', '技能服务', '跳转中...')}>技能服务</div>
          <div className="nav-link active">订单管理</div>
          <div className="nav-link" onClick={() => toast('info', '收益结算', '跳转中...')}>收益结算</div>
          <div className="nav-link" onClick={() => toast('info', '工时记录', '跳转中...')}>工时记录</div>
        </div>
        <div className="nav-right">
          <div className="nav-balance">
            <div className="nav-balance-dot"></div>
            余额
            <span className="nav-balance-val">¥4,850.00</span>
          </div>
          <button className="topup-btn" onClick={() => toast('info', '余额充值', '请选择充值金额')}>充值</button>
          <div className="nav-avatar">陈</div>
        </div>
      </nav>

      <div className="app-body">
        {/* 侧边栏 */}
        <div className="sidebar">
          <div className="sb-icon" onClick={() => toast('info', '首页', '')}>
            <svg fill="none" viewBox="0 0 18 18" stroke="currentColor" strokeWidth="1.7">
              <path d="M2 7.5 9 2l7 5.5V16H12v-4H6v4H2V7.5Z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="sb-icon active">
            <svg fill="none" viewBox="0 0 18 18" stroke="currentColor" strokeWidth="1.7">
              <rect x="2" y="3" width="14" height="12" rx="2"/>
              <path d="M6 7h6M6 10.5h4" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="sb-icon" onClick={() => toast('info', '机器人', '')}>
            <svg fill="none" viewBox="0 0 18 18" stroke="currentColor" strokeWidth="1.7">
              <rect x="3" y="6" width="12" height="9" rx="2"/>
              <path d="M6 6V4.5a3 3 0 0 1 6 0V6" strokeLinecap="round"/>
              <circle cx="7" cy="10.5" r="1" fill="currentColor"/>
              <circle cx="11" cy="10.5" r="1" fill="currentColor"/>
            </svg>
          </div>
          <div className="sb-divider"></div>
          <div className="sb-icon" onClick={() => toast('info', '消息', '')}>
            <svg fill="none" viewBox="0 0 18 18" stroke="currentColor" strokeWidth="1.7">
              <path d="M3 4h12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H5l-3 2V5a1 1 0 0 1 1-1Z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="sb-icon" onClick={() => toast('info', '设置', '')}>
            <svg fill="none" viewBox="0 0 18 18" stroke="currentColor" strokeWidth="1.7">
              <circle cx="9" cy="9" r="3"/>
              <path d="M9 2v2M9 14v2M2 9h2M14 9h2M4.2 4.2l1.4 1.4M12.4 12.4l1.4 1.4M4.2 13.8l1.4-1.4M12.4 5.6l1.4-1.4" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* 主内容区 */}
        <div className="main">
          {/* 子标题 */}
          <div className="subheader">
            <div className="page-title">
              订单系统
              <small>F04 · 15 个功能模块 · P0×12, P1×2, P2×1</small>
            </div>
            <button className="btn btn-ghost" onClick={exportOrders}>
              <svg fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.8">
                <path d="M7 9V2M4 6.5l3 3 3-3M2 11h10" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              导出 CSV
            </button>
            <button className="btn btn-primary" onClick={createOrder}>
              <svg fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="2">
                <path d="M7 2v10M2 7h10" strokeLinecap="round"/>
              </svg>
              创建订单
            </button>
          </div>

          <div className="content">
            {/* 左侧：订单列表 */}
            <div className="list-panel">
              {/* 统计条 */}
              <div className="stats-strip">
                <div className="stat-cell">
                  <div className="stat-cell-val" style={{ color: 'var(--accent)' }}>{stats?.total || 0}</div>
                  <div className="stat-cell-key">全部订单</div>
                </div>
                <div className="stat-cell">
                  <div className="stat-cell-val" style={{ color: 'var(--green)' }}>{stats?.active || 0}</div>
                  <div className="stat-cell-key">进行中</div>
                </div>
                <div className="stat-cell">
                  <div className="stat-cell-val" style={{ color: 'var(--amber)' }}>{stats?.pending || 0}</div>
                  <div className="stat-cell-key">待处理</div>
                </div>
                <div className="stat-cell">
                  <div className="stat-cell-val" style={{ color: 'var(--text2)' }}>¥{stats?.totalAmount || 0}</div>
                  <div className="stat-cell-key">累计金额</div>
                </div>
              </div>

              {/* 余额预警 */}
              {showAlert && (
                <div className="alert-banner" onClick={() => setShowAlert(false)}>
                  <svg fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="7" cy="7" r="5.5"/>
                    <path d="M7 4v3.5M7 9.5v.5" strokeLinecap="round"/>
                  </svg>
                  <strong>余额预警</strong>：「电商小程序开发」订单余额仅剩 20%，约可支撑 2.8 小时工时
                  <span className="dismiss">× 知道了</span>
                </div>
              )}

              {/* 筛选区 */}
              <div className="filter-wrap">
                <div className="search-row">
                  <div className="search-box">
                    <svg fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.8">
                      <circle cx="6" cy="6" r="4.5"/>
                      <path d="m11 11 2.5 2.5" strokeLinecap="round"/>
                    </svg>
                    <input 
                      placeholder="搜索订单号、服务名称..." 
                      id="searchInput" 
                      value={filter.search}
                      onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                      onKeyUp={filterOrders}
                    />
                  </div>
                  <select 
                    className="filter-sel" 
                    value={filter.amountRange}
                    onChange={(e) => setFilter(prev => ({ ...prev, amountRange: e.target.value }))}
                  >
                    <option value="all">全部金额</option>
                    <option value="0-500">¥0~500</option>
                    <option value="500-2000">¥500~2000</option>
                    <option value="2000+">¥2000 以上</option>
                  </select>
                  <select 
                    className="filter-sel"
                    value={filter.sortBy}
                    onChange={(e) => setFilter(prev => ({ ...prev, sortBy: e.target.value }))}
                  >
                    <option value="latest">最新优先</option>
                    <option value="highest">金额最高</option>
                    <option value="expiring">即将到期</option>
                  </select>
                </div>
                {/* 状态标签 */}
                <div className="tab-row">
                  <button 
                    className={`tab ${activeTab === 'all' ? 'active' : ''}`} 
                    onClick={() => setTab('all')}
                  >
                    全部 <span className="cnt">{stats?.total || 0}</span>
                  </button>
                  <button 
                    className={`tab ${activeTab === 'active' ? 'active' : ''}`} 
                    onClick={() => setTab('active')}
                  >
                    进行中 <span className="cnt">{stats?.active || 0}</span>
                  </button>
                  <button 
                    className={`tab ${activeTab === 'review' ? 'active' : ''}`} 
                    onClick={() => setTab('review')}
                  >
                    待验收 <span className="cnt">{stats?.review || 0}</span>
                  </button>
                  <button 
                    className={`tab ${activeTab === 'pending' ? 'active' : ''}`} 
                    onClick={() => setTab('pending')}
                  >
                    待处理 <span className="cnt">{stats?.pending || 0}</span>
                  </button>
                  <button 
                    className={`tab ${activeTab === 'done' ? 'active' : ''}`} 
                    onClick={() => setTab('done')}
                  >
                    已完成 <span className="cnt">{stats?.done || 0}</span>
                  </button>
                </div>
              </div>

              {/* 订单列表 */}
              <div className="order-list">
                {isLoading ? (
                  <div className="loading">加载中...</div>
                ) : orders.length === 0 ? (
                  <div className="empty">暂无订单</div>
                ) : (
                  orders.map(order => (
                    <div 
                      key={order.id} 
                      className={`order-item ${selectedOrder?.id === order.id ? 'selected' : ''}`}
                      onClick={() => selectOrder(order)}
                    >
                      <div className="order-item-top">
                        <div className="order-svc-icon" style={{ 
                          background: order.status === 'active' ? 'var(--accent-bg)' : 
                                     order.status === 'review' ? 'var(--purple-bg)' :
                                     order.status === 'pending_pay' ? 'var(--amber-bg)' :
                                     order.status === 'disputed' ? 'var(--red-bg)' :
                                     'var(--gray-bg)',
                          borderColor: order.status === 'active' ? 'var(--accent-bd)' :
                                      order.status === 'review' ? '#ddd6fe' :
                                      order.status === 'pending_pay' ? 'var(--amber-bd)' :
                                      order.status === 'disputed' ? 'var(--red-bd)' :
                                      'var(--border)'
                        }}>
                          {order.serviceIcon}
                        </div>
                        <div className="order-meta">
                          <div className="order-name">
                            {order.serviceName}
                            <span className={`status-pill ${getStatusClass(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                          </div>
                          <div className="order-sub">
                            <span>{order.sellerName}</span>·
                            <span className="order-no">{order.orderNo}</span>
                          </div>
                        </div>
                      </div>
                      <div className="order-item-bottom">
                        <div className="order-progress">
                          <div className="progress-bar">
                            <div className={`progress-fill ${order.status === 'done' ? 'green' : order.status === 'active' ? 'blue' : 'amber'}`} 
                                 style={{ width: `${order.progress}%` }}></div>
                          </div>
                        </div>
                        {order.status === 'active' && (
                          <span className="wl-chip pulse">⏱ {formatTime(timerSeconds)}</span>
                        )}
                        <span className={`order-amount ${order.status === 'done' ? 'done' : ''}`}>
                          ¥{order.amount}
                        </span>
                        <span className="order-time">{order.createdAt}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 右侧：订单详情 */}
            <div className="detail-panel">
              {selectedOrder ? (
                <>
                  {/* 详情头部 */}
                  <div className="detail-header">
                    <div className="detail-header-top">
                      <div className="detail-svc-icon">{selectedOrder.serviceIcon}</div>
                      <div className="detail-title">
                        <div className="detail-name">
                          {selectedOrder.serviceName}
                          <span className={`status-pill ${getStatusClass(selectedOrder.status)}`} style={{ fontSize: '11px' }}>
                            {getStatusText(selectedOrder.status)}
                          </span>
                        </div>
                        <div className="detail-meta">
                          <span>{selectedOrder.orderNo}</span>·
                          <span>{selectedOrder.sellerName} · {selectedOrder.sellerTitle}</span>·
                          <span>{selectedOrder.createdAt} 创建</span>
                        </div>
                      </div>
                      <div className="detail-actions">
                        <button className="btn btn-ghost" onClick={() => toast('info', '修改请求', '已提出修改意见，任务已重新开启')}>
                          <svg fill="none" viewBox="0 0 13 13" stroke="currentColor" strokeWidth="1.8" width="12" height="12">
                            <path d="M9 1.5l2.5 2.5-7 7H2V8.5l7-7Z" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          修改请求
                        </button>
                        <button className="btn btn-danger" onClick={() => toast('info', '取消申请', '进行中订单需协商取消，已通知服务者')}>
                          <svg fill="none" viewBox="0 0 13 13" stroke="currentColor" strokeWidth="1.8" width="12" height="12">
                            <circle cx="6.5" cy="6.5" r="5"/>
                            <path d="M4 4l5 5M9 4l-5 5" strokeLinecap="round"/>
                          </svg>
                          申请取消
                        </button>
                        <button className="btn btn-ghost" style={{ color: 'var(--red)', borderColor: 'var(--red-bd)' }} 
                                onClick={() => toast('error', '申诉已提交', 'AI 仲裁流程已启动，24 小时内处理')}>
                          申诉
                        </button>
                      </div>
                    </div>

                    {/* 状态时间线 */}
                    <div className="order-timeline">
                      {[
                        { label: '已下单', done: true },
                        { label: '已支付', done: true },
                        { label: '已接单', done: selectedOrder.status !== 'pending_pay' },
                        { label: '进行中', done: false, active: selectedOrder.status === 'active' },
                        { label: '待验收', done: false, active: selectedOrder.status === 'review' },
                        { label: '已完成', done: selectedOrder.status === 'done' },
                      ].map((step, i) => (
                        <div className="tl-step" key={i}>
                          <div className="tl-node">
                            <div className={`tl-dot ${step.done ? 'done' : ''} ${step.active ? 'active' : ''}`}>
                              {step.done ? '✓' : i + 1}
                            </div>
                            <div className="tl-label">{step.label}</div>
                          </div>
                          {i < 5 && <div className={`tl-line ${step.done ? 'done' : ''}`}></div>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 详情主体 */}
                  <div className="detail-body">
                    {/* 实时工时·计费 */}
                    {selectedOrder.status === 'active' && (
                      <div className="detail-section">
                        <div className="ds-header">
                          <svg fill="none" viewBox="0 0 13 13" stroke="currentColor" strokeWidth="1.8">
                            <circle cx="6.5" cy="6.5" r="5"/>
                            <path d="M6.5 3.5v3l2 2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          实时工时 · 计费 
                          <span style={{ 
                            fontFamily: 'var(--mono)', 
                            fontSize: '10px', 
                            background: 'var(--green-bg)', 
                            color: 'var(--green)', 
                            padding: '2px 6px', 
                            borderRadius: '4px', 
                            marginLeft: '4px' 
                          }}>● 计时中</span>
                          <span className="ds-action" onClick={() => toast('info', '扣费明细', '正在加载完整扣费记录...')}>查看明细</span>
                        </div>
                        <div className="ds-body">
                          <div className="worklog-live">
                            <div className="wl-cell">
                              <div className="wl-val tick">{formatTime(timerSeconds)}</div>
                              <div className="wl-key">当前工时</div>
                            </div>
                            <div className="wl-cell">
                              <div className="wl-val spend">¥{calculateSpend(120, timerSeconds)}</div>
                              <div className="wl-key">已消耗金额</div>
                            </div>
                            <div className="wl-cell">
                              <div className="wl-val remain">¥4,581.20</div>
                              <div className="wl-key">账户余额</div>
                            </div>
                          </div>
                          <div style={{ marginTop: '12px' }}>
                            <div className="billing-row">
                              <span className="billing-key">服务单价</span>
                              <span className="billing-val">¥120 / 小时</span>
                            </div>
                            <div className="billing-row">
                              <span className="billing-key">计费粒度</span>
                              <span className="billing-val">每 6 秒 = ¥0.20</span>
                            </div>
                            <div className="billing-row">
                              <span className="billing-key">本次已用工时</span>
                              <span className="billing-val green">{formatTime(timerSeconds)}</span>
                            </div>
                            <div className="billing-row">
                              <span className="billing-key">已消耗金额</span>
                              <span className="billing-val green">¥{calculateSpend(120, timerSeconds)}</span>
                            </div>
                            <div className="billing-row">
                              <span className="billing-key">预估总价</span>
                              <span className="billing-val total">¥6,000 ~ ¥7,200</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 余额预警 */}
                    <div className="detail-section">
                      <div className="ds-header">
                        <svg fill="none" viewBox="0 0 13 13" stroke="currentColor" strokeWidth="1.8">
                          <path d="M6.5 1l1.2 3.6H11L8.4 6.8 9.5 10.5l-3-2.2-3 2.2 1.1-3.7L2 4.6h3.3Z" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        余额预警 · 多级通知
                      </div>
                      <div className="ds-body">
                        <div className="balance-meter">
                          <div className="bm-labels">
                            <span>¥0</span>
                            <span>账户余额</span>
                            <span>¥4,850</span>
                          </div>
                          <div className="bm-track">
                            <div className="bm-fill"></div>
                          </div>
                          <div className="bm-marks">
                            <span className="bm-mark">耗尽</span>
                            <span className="bm-mark warn">⚠ 20%</span>
                            <span className="bm-mark warn">⚡ 50%</span>
                            <span className="bm-mark" style={{ color: 'var(--green)' }}>充足</span>
                          </div>
                        </div>
                        <div className="bm-alerts">
                          <div className="bm-alert ok">50% 预警<br/><span style={{ fontSize: '10px' }}>已触发 · 3 天前</span></div>
                          <div className="bm-alert triggered">20% 预警<br/><span style={{ fontSize: '10px' }}>⚠ 今日已触发</span></div>
                          <div className="bm-alert ok">即将耗尽<br/><span style={{ fontSize: '10px' }}>尚未触发</span></div>
                        </div>
                      </div>
                    </div>

                    {/* 订单详情 */}
                    <div className="detail-section">
                      <div className="ds-header">
                        <svg fill="none" viewBox="0 0 13 13" stroke="currentColor" strokeWidth="1.8">
                          <rect x="1.5" y="2" width="10" height="9.5" rx="1.5"/>
                          <path d="M4 5.5h5M4 7.5h3.5" strokeLinecap="round"/>
                        </svg>
                        订单详情
                      </div>
                      <div className="ds-body">
                        <div className="info-grid">
                          <div className="info-row">
                            <span className="info-key">订单编号</span>
                            <span className="info-val mono">{selectedOrder.orderNo}</span>
                          </div>
                          <div className="info-row">
                            <span className="info-key">服务套餐</span>
                            <span className="info-val">升级版 · 按时计费</span>
                          </div>
                          <div className="info-row">
                            <span className="info-key">服务提供者</span>
                            <span className="info-val">{selectedOrder.sellerName} ⭐ {selectedOrder.sellerRating}</span>
                          </div>
                          <div className="info-row">
                            <span className="info-key">机器人</span>
                            <span className="info-val">DataBot v2.1 · 在线</span>
                          </div>
                          <div className="info-row">
                            <span className="info-key">创建时间</span>
                            <span className="info-val">{selectedOrder.createdAt} {selectedOrder.createdTime}</span>
                          </div>
                          <div className="info-row">
                            <span className="info-key">预付款金额</span>
                            <span className="info-val green">¥{selectedOrder.prepayment} 已托管</span>
                          </div>
                          <div className="info-row" style={{ gridColumn: '1/-1' }}>
                            <span className="info-key">需求摘要</span>
                            <span className="info-val" style={{ fontSize: '12px' }}>{selectedOrder.requirements}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 任务进度·交付物 */}
                    <div className="detail-section">
                      <div className="ds-header">
                        <svg fill="none" viewBox="0 0 13 13" stroke="currentColor" strokeWidth="1.8">
                          <rect x="1.5" y="1.5" width="10" height="10" rx="1.5"/>
                          <path d="M4 6.5l2 2 3.5-3.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        任务进度 · 交付物
                        <span className="ds-action" onClick={() => toast('info', '任务管理', '跳转到任务管理模块')}>管理任务</span>
                      </div>
                      <div className="ds-body">
                        <div className="task-list">
                          {selectedOrder.tasks?.map((task, i) => (
                            <div className="task-row" key={i}>
                              <div className={`task-idx ${task.status}`}>
                                {task.status === 'done' ? '✓' : task.status === 'active' ? i + 1 : i + 1}
                              </div>
                              <div className="task-name">{task.name}</div>
                              <div className="task-meta">
                                <span>{task.hours}</span>
                                <span style={{ color: task.status === 'active' ? 'var(--accent)' : '' }}>
                                  {task.status === 'done' ? '已完成' : task.status === 'active' ? `进行中 · ${task.progress}%` : '待开始'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* 交付物 */}
                        <div style={{ marginTop: '14px' }}>
                          <div style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text3)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            交付物
                          </div>
                          {selectedOrder.deliveries?.map((delivery, i) => (
                            <div className="delivery-item" key={i}>
                              <div className="delivery-icon">
                                <svg fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.8">
                                  <rect x="2" y="1.5" width="9" height="11" rx="1.5"/>
                                  <path d="M4.5 5h5M4.5 7.5h3.5" strokeLinecap="round"/>
                                </svg>
                              </div>
                              <div className="delivery-info">
                                <div className="delivery-name">{delivery.name}</div>
                                <div className="delivery-sub">{delivery.sub}</div>
                              </div>
                              <div className="delivery-time">{delivery.time}</div>
                            </div>
                          ))}
                          <div className="delivery-zone" onClick={() => toast('info', '交付物提交', '支持文件/链接/文字说明，关联任务节点')}>
                            <svg fill="none" viewBox="0 0 22 22" stroke="currentColor" strokeWidth="1.5">
                              <path d="M11 14V4M7 8l4-4 4 4M4 16v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <p>提交新交付物</p>
                            <span>文件 · GitHub 链接 · 文字说明 · 关联任务节点</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 验收确认 */}
                    {selectedOrder.status === 'review' && (
                      <div className="detail-section">
                        <div className="ds-header">
                          <svg fill="none" viewBox="0 0 13 13" stroke="currentColor" strokeWidth="1.8">
                            <path d="M10.5 4L5.5 9 3 6.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="6.5" cy="6.5" r="5"/>
                          </svg>
                          验收确认 · F04-11
                        </div>
                        <div className="ds-body">
                          <div className="acceptance-timer">
                            <div>
                              <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '3px' }}>自动验收倒计时</div>
                              <div className="at-countdown">{formatTime(countdownSeconds)}</div>
                            </div>
                            <div className="at-info">
                              <strong>客户需在 72 小时内完成验收</strong>
                              <span>超时将自动确认验收，款项自动结算给服务者</span>
                            </div>
                            <div className="at-actions">
                              <button className="btn btn-ghost" style={{ fontSize: '12px' }} 
                                      onClick={() => toast('info', '修改请求', '已提出修改意见，关联任务已重新开启')}>
                                <svg fill="none" viewBox="0 0 13 13" stroke="currentColor" strokeWidth="1.8" width="11" height="11">
                                  <path d="M1 12l3-1 7-7-2-2-7 7-1 3Z" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                不通过
                              </button>
                              <button className="btn btn-primary" style={{ fontSize: '12px' }} 
                                      onClick={() => toast('success', '验收通过', '款项 T+1 日结算，请对服务者进行评价')}>
                                <svg fill="none" viewBox="0 0 13 13" stroke="currentColor" strokeWidth="1.8" width="11" height="11">
                                  <path d="M2 7l3 3 6-6" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                确认验收
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 服务评价 */}
                    {selectedOrder.status === 'done' && (
                      <div className="detail-section">
                        <div className="ds-header">
                          <svg fill="none" viewBox="0 0 13 13" stroke="currentColor" strokeWidth="1.8">
                            <path d="M6.5 1l1.1 3.3H11L8.4 6.4l1.1 3.3-3-2.2-3 2.2 1.1-3.3L2 4.3h3.4Z" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          服务评价 · F04-14 · 双向评分
                        </div>
                        <div className="ds-body">
                          <div style={{ fontSize: '12.5px', color: 'var(--text2)', marginBottom: '6px' }}>
                            验收完成后，双方均可对此次合作进行评价（AI 内容审核）
                          </div>
                          <div className="stars" id="starRow">
                            {[1, 2, 3, 4, 5].map(n => (
                              <span key={n} className="star" onClick={() => setStar(n)}>★</span>
                            ))}
                          </div>
                          <textarea className="review-textarea" placeholder="描述您的合作体验，评价内容将经 AI 内容审核后展示..."></textarea>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                            <button className="btn btn-ghost" onClick={() => toast('info', '匿名评价', '已设置为匿名，您的身份不会被公开')}>匿名评价</button>
                            <button className="btn btn-primary" onClick={() => toast('success', '评价已提交', '感谢您的反馈，评价正在 AI 审核中')}>提交评价</button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 订单申诉 */}
                    <div className="detail-section">
                      <div className="ds-header">
                        <svg fill="none" viewBox="0 0 13 13" stroke="currentColor" strokeWidth="1.8">
                          <circle cx="6.5" cy="6.5" r="5"/>
                          <path d="M6.5 3.5v4M6.5 9v.5" strokeLinecap="round"/>
                        </svg>
                        订单申诉 · AI 仲裁 · F04-13
                      </div>
                      <div className="ds-body">
                        <div className="dispute-card">
                          <div className="dispute-header">
                            <svg fill="none" viewBox="0 0 13 13" stroke="currentColor" strokeWidth="1.8">
                              <circle cx="6.5" cy="6.5" r="5"/>
                              <path d="M6.5 3.5v4M6.5 9v.5" strokeLinecap="round"/>
                            </svg>
                            申诉流程说明
                          </div>
                          <div className="dispute-step">
                            <div className="dispute-step-num">1</div>
                            双方提交争议说明与证据材料（截图/录屏/聊天记录）
                          </div>
                          <div className="dispute-step">
                            <div className="dispute-step-num">2</div>
                            AI 仲裁引擎分析证据，给出仲裁建议（24 小时内）
                          </div>
                          <div className="dispute-step">
                            <div className="dispute-step-num">3</div>
                            平台人工客服最终确认结果，执行款项处理
                          </div>
                        </div>
                        <button className="btn btn-danger" style={{ marginTop: '12px', width: '100%', justifyContent: 'center' }} 
                                onClick={() => toast('error', '申诉已提交', 'AI 仲裁流程已启动，请保持联系方式畅通')}>
                          <svg fill="none" viewBox="0 0 13 13" stroke="currentColor" strokeWidth="1.8" width="12" height="12">
                            <circle cx="6.5" cy="6.5" r="5"/>
                            <path d="M6.5 3.5v4M6.5 9v.5" strokeLinecap="round"/>
                          </svg>
                          提交申诉 · 启动 AI 仲裁
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="empty-detail">
                  <div className="empty-icon">📋</div>
                  <div className="empty-text">请选择一个订单查看详情</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 支付 Modal */}
      {showPayModal && (
        <div className="modal-overlay open" id="payModal">
          <div className="modal">
            <div className="modal-header">
              <h3>创建订单 · 支付预付款</h3>
              <button className="close-btn" onClick={() => setShowPayModal(false)}>
                <svg fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2" width="12" height="12">
                  <path d="M2 2l8 8M10 2 2 10" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <div className="label">订单概要</div>
                <div style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-bd)', borderRadius: '8px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: '700', marginBottom: '4px' }}>全栈开发智能助手 · 升级版套餐</div>
                  <div style={{ fontSize: '12px', color: 'var(--text3)' }}>服务者：陈振宇 · ¥120/小时 · 预估 40~60 小时</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--accent)', marginTop: '8px' }}>需求摘要：React + TS 机器人后台开发</div>
                </div>
              </div>
              <div className="form-group">
                <div className="label">选择支付方式 <span style={{ fontSize: '10.5px', color: 'var(--text3)', fontWeight: '400' }}>（预付款托管，验收后结算）</span></div>
                <div className="pay-methods">
                  <div className="pay-method selected" onClick={(e) => selectPay(e as HTMLElement)}>
                    <span className="pay-method-icon">💰</span>
                    <div className="pay-method-name">平台余额</div>
                    <div style={{ fontSize: '10.5px', color: 'var(--text3)', marginTop: '2px' }}>¥4,850 可用</div>
                  </div>
                  <div className="pay-method" onClick={(e) => selectPay(e as HTMLElement)}>
                    <span className="pay-method-icon">💚</span>
                    <div className="pay-method-name">微信支付</div>
                  </div>
                  <div className="pay-method" onClick={(e) => selectPay(e as HTMLElement)}>
                    <span className="pay-method-icon">🔵</span>
                    <div className="pay-method-name">支付宝</div>
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <div className="label">预付款金额</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ color: 'var(--text3)', fontSize: '14px' }}>¥</span>
                    <input className="input" defaultValue="5000" type="number" style={{ fontFamily: 'var(--mono)', fontSize: '15px', fontWeight: '600' }} />
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '3px' }}>建议预付款 ≥ 预估总价的 70%</div>
                </div>
                <div className="form-group">
                  <div className="label">余额充足后</div>
                  <select className="select">
                    <option>立即开始计费</option>
                    <option>等待手动确认</option>
                  </select>
                </div>
              </div>
              <div style={{ background: 'var(--amber-bg)', border: '1px solid var(--amber-bd)', borderRadius: '7px', padding: '10px 12px', fontSize: '12px', color: 'var(--amber)' }}>
                ⚠ 预付款将托管于平台，服务验收通过后 T+1 日结算给服务者。若订单取消，未使用部分自动退回。
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowPayModal(false)}>取消</button>
              <button className="btn btn-primary" onClick={() => {
                setShowPayModal(false);
                toast('success', '支付成功', '¥5,000 预付款已托管，订单已创建');
              }}>
                <svg fill="none" viewBox="0 0 13 13" stroke="currentColor" strokeWidth="1.8" width="12" height="12">
                  <path d="M2 6.5h9M8 3.5l3 3-3 3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                确认支付 ¥5,000
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 导出 Modal */}
      {showExportModal && (
        <div className="modal-overlay open" id="exportModal">
          <div className="modal">
            <div className="modal-header">
              <h3>导出订单明细</h3>
              <button className="close-btn" onClick={() => setShowExportModal(false)}>
                <svg fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2" width="12" height="12">
                  <path d="M2 2l8 8M10 2 2 10" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <div className="label">导出格式</div>
                <div className="export-format">
                  <div className="fmt-btn selected" onClick={(e) => selectFmt(e as HTMLElement)}>
                    <span className="fmt-icon">📊</span>CSV
                  </div>
                  <div className="fmt-btn" onClick={(e) => selectFmt(e as HTMLElement)}>
                    <span className="fmt-icon">📋</span>Excel
                  </div>
                  <div className="fmt-btn" onClick={(e) => selectFmt(e as HTMLElement)}>
                    <span className="fmt-icon">📄</span>PDF 账单
                  </div>
                </div>
              </div>
              <div className="form-group">
                <div className="label">自定义时间范围</div>
                <div className="form-row">
                  <input className="input" type="date" defaultValue="2026-02-01" />
                  <input className="input" type="date" defaultValue="2026-03-08" />
                </div>
              </div>
              <div className="form-group">
                <div className="label">包含字段</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked />订单编号
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked />服务名称
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked />工时记录
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked />扣费明细
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked />服务者信息
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', cursor: 'pointer' }}>
                    <input type="checkbox" />评价记录
                  </label>
                </div>
              </div>
              <div className="form-group">
                <div className="label">筛选订单状态</div>
                <select className="select">
                  <option>全部状态</option>
                  <option>进行中</option>
                  <option>已完成</option>
                  <option>已取消</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowExportModal(false)}>取消</button>
              <button className="btn btn-primary" onClick={() => {
                setShowExportModal(false);
                toast('success', '导出成功', '订单明细 CSV 已生成，正在下载...');
              }}>
                <svg fill="none" viewBox="0 0 13 13" stroke="currentColor" strokeWidth="1.8" width="12" height="12">
                  <path d="M6.5 8.5V2M4 6l2.5 3 2.5-3M2 11h9" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                导出文件
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast 容器 */}
      <div className="toast-stack" id="toastStack"></div>
    </div>
  );
};

// 设置评分
function setStar(n: number) {
  const stars = document.querySelectorAll('.star');
  stars.forEach((s, i) => s.classList.toggle('lit', i < n));
}

// 选择支付方式
function selectPay(el: HTMLElement) {
  document.querySelectorAll('.pay-method').forEach(p => p.classList.remove('selected'));
  el.classList.add('selected');
}

// 选择导出格式
function selectFmt(el: HTMLElement) {
  document.querySelectorAll('.fmt-btn').forEach(f => f.classList.remove('selected'));
  el.classList.add('selected');
}

// Toast 提示
let toastCount = 0;
function toast(type: 'success' | 'error' | 'info', title: string, sub = '') {
  const icons: Record<string, string> = { success: '✓', error: '✕', info: 'ℹ' };
  const stack = document.getElementById('toastStack');
  if (!stack) return;
  
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `
    <div class="toast-icon ti-${type}">${icons[type]}</div>
    <div class="toast-body"><strong>${title}</strong>${sub ? `<span>${sub}</span>` : ''}</div>
  `;
  stack.appendChild(el);
  setTimeout(() => {
    el.style.cssText += 'opacity:0;transform:translateX(10px);transition:0.25s ease';
    setTimeout(() => el.remove(), 260);
  }, 2800);
}

export default OrderSystem;
