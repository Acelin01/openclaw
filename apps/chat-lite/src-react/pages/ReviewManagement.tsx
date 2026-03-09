/**
 * 评价管理页面 - React 版本
 * 包含：评价列表、回复功能、富文本编辑、回复历史记录等
 */

import React, { useState } from 'react';
import './ReviewManagement.css';

interface Review {
  id: string;
  serviceId: string;
  serviceName: string;
  userName: string;
  userAvatar: string;
  rating: number;
  content: string;
  createdAt: string;
  status: 'pending' | 'replied' | 'ignored';
  helpful: number;
  reply?: {
    content: string;
    createdAt: string;
  };
}

const mockReviews: Review[] = [
  {
    id: 'REV-001',
    serviceId: 'svc-001',
    serviceName: '智能数据分析师',
    userName: '张先生',
    userAvatar: '张',
    rating: 5,
    content: '非常好用的数据分析服务，报告质量很高，帮助我们发现了很多业务问题！强烈推荐给需要做数据分析的朋友。',
    createdAt: '2026-03-05 14:30',
    status: 'replied',
    helpful: 23,
    reply: {
      content: '非常感谢您的认可！我们会继续努力提供高质量的数据分析服务。如果您有任何其他需求，随时联系我们！',
      createdAt: '2026-03-05 16:45',
    },
  },
  {
    id: 'REV-002',
    serviceId: 'svc-002',
    serviceName: 'UI 设计评审助手',
    userName: '李女士',
    userAvatar: '李',
    rating: 5,
    content: '评审意见很专业，指出了很多我没注意到的细节问题，对我的设计改进帮助很大。',
    createdAt: '2026-03-06 10:15',
    status: 'pending',
    helpful: 15,
  },
  {
    id: 'REV-003',
    serviceId: 'svc-004',
    serviceName: '文档整理助手',
    userName: '王经理',
    userAvatar: '王',
    rating: 4,
    content: '整体不错，就是价格稍微有点高。希望能有更多优惠活动。',
    createdAt: '2026-03-07 09:20',
    status: 'pending',
    helpful: 12,
  },
  {
    id: 'REV-004',
    serviceId: 'svc-006',
    serviceName: '品牌 VI 设计服务',
    userName: '陈总监',
    userAvatar: '陈',
    rating: 5,
    content: '专业的品牌设计服务，LOGO 和 VI 手册都很满意，提升了我们公司的品牌形象。',
    createdAt: '2026-03-08 15:40',
    status: 'replied',
    helpful: 28,
    reply: {
      content: '感谢您的信任！能为您打造满意的品牌形象是我们的荣幸。后续如有任何调整需求，我们随时为您服务！',
      createdAt: '2026-03-08 17:20',
    },
  },
  {
    id: 'REV-005',
    serviceId: 'svc-001',
    serviceName: '智能数据分析师',
    userName: '刘总',
    userAvatar: '刘',
    rating: 3,
    content: '服务还可以，但是交付时间有点长，希望能加快一些。',
    createdAt: '2026-03-09 11:00',
    status: 'pending',
    helpful: 8,
  },
];

export const ReviewManagement: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'replied' | 'ignored'>('all');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const filteredReviews = mockReviews.filter((review) => {
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
    const matchesRating = ratingFilter === 'all' || review.rating === ratingFilter;
    const matchesSearch = review.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesRating && matchesSearch;
  });

  const stats = {
    total: mockReviews.length,
    pending: mockReviews.filter(r => r.status === 'pending').length,
    replied: mockReviews.filter(r => r.status === 'replied').length,
    avgRating: (mockReviews.reduce((sum, r) => sum + r.rating, 0) / mockReviews.length).toFixed(1),
  };

  const handleReply = () => {
    if (replyContent.trim() && selectedReview) {
      alert('回复成功！');
      setReplyContent('');
      setShowReplyModal(false);
      setSelectedReview(null);
    }
  };

  const openReplyModal = (review: Review) => {
    setSelectedReview(review);
    setShowReplyModal(true);
  };

  return (
    <div className="review-management">
      {/* 顶部导航 */}
      <nav className="mgmt-topnav">
        <div className="market-logo">
          <span className="logo-icon">🛠️</span>
          <span className="logo-text">技能服务市场 · 评价管理</span>
        </div>
        <ul className="market-nav-links">
          <li><a href="/market">服务市场</a></li>
          <li><a href="#">我的订阅</a></li>
          <li><a href="/market/manage">服务管理</a></li>
          <li><a href="#" className="active">评价管理</a></li>
        </ul>
        <div className="market-nav-right">
          <button className="btn-ghost">导出数据</button>
        </div>
      </nav>

      <div className="review-layout">
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
            <div className="nav-item active">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 2l1.5 3h3.5l-2.8 2 1 3.5-3.2-2.3-3.2 2.3 1-3.5-2.8-2h3.5z" />
              </svg>
              评价管理
              <span className="nav-badge green">{stats.pending}</span>
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
        <main className="review-main">
          {/* 顶部栏 */}
          <div className="review-header">
            <h1>评价管理</h1>
            <div className="review-stats">
              <div className="review-stat">
                <div className="stat-label">总评价</div>
                <div className="stat-value">{stats.total}</div>
              </div>
              <div className="review-stat pending">
                <div className="stat-label">待回复</div>
                <div className="stat-value">{stats.pending}</div>
              </div>
              <div className="review-stat replied">
                <div className="stat-label">已回复</div>
                <div className="stat-value">{stats.replied}</div>
              </div>
              <div className="review-stat rating">
                <div className="stat-label">平均评分</div>
                <div className="stat-value">★{stats.avgRating}</div>
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
                placeholder="搜索评价内容、服务名称或用户..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-group">
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
                  待回复
                </button>
                <button
                  className={`chip ${statusFilter === 'replied' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('replied')}
                >
                  已回复
                </button>
              </div>

              <select
                className="rating-select"
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              >
                <option value="all">全部评分</option>
                <option value="5">⭐⭐⭐⭐⭐</option>
                <option value="4">⭐⭐⭐⭐</option>
                <option value="3">⭐⭐⭐</option>
                <option value="2">⭐⭐</option>
                <option value="1">⭐</option>
              </select>
            </div>
          </div>

          {/* 评价列表 */}
          <div className="reviews-list">
            {filteredReviews.map((review, index) => (
              <div key={review.id} className="review-card" style={{ animationDelay: `${index * 0.05}s` }}>
                <div className="review-header-row">
                  <div className="user-info">
                    <div className="user-avatar">{review.userAvatar}</div>
                    <div className="user-details">
                      <div className="user-name">{review.userName}</div>
                      <div className="service-name">{review.serviceName}</div>
                    </div>
                  </div>
                  <div className="review-meta">
                    <div className="rating">
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </div>
                    <div className="date">{review.createdAt}</div>
                  </div>
                </div>

                <div className="review-content">
                  {review.content}
                </div>

                {review.reply && (
                  <div className="review-reply">
                    <div className="reply-header">
                      <span className="reply-label">官方回复</span>
                      <span className="reply-date">{review.reply.createdAt}</span>
                    </div>
                    <div className="reply-content">
                      {review.reply.content}
                    </div>
                  </div>
                )}

                <div className="review-footer">
                  <div className="helpful">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9V1H5v12h3a3 3 0 0 0 3-3v-1z" />
                    </svg>
                    {review.helpful}人认为有用
                  </div>
                  <div className="review-actions">
                    {review.status === 'pending' ? (
                      <button
                        className="action-btn reply"
                        onClick={() => openReplyModal(review)}
                      >
                        回复评价
                      </button>
                    ) : (
                      <>
                        <button
                          className="action-btn view-reply"
                          onClick={() => setShowHistory(true)}
                        >
                          查看回复记录
                        </button>
                        <button
                          className="action-btn edit-reply"
                          onClick={() => openReplyModal(review)}
                        >
                          编辑回复
                        </button>
                      </>
                    )}
                    <button className="action-btn ignore">忽略</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* 回复评价弹窗 */}
      {showReplyModal && selectedReview && (
        <div className="modal-overlay" onClick={() => setShowReplyModal(false)}>
          <div className="reply-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedReview.reply ? '编辑回复' : '回复评价'}</h2>
              <button className="modal-close" onClick={() => setShowReplyModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="review-preview">
                <div className="preview-label">用户评价</div>
                <div className="preview-content">
                  <div className="preview-user">{selectedReview.userName}</div>
                  <div className="preview-rating">
                    {'★'.repeat(selectedReview.rating)}{'☆'.repeat(5 - selectedReview.rating)}
                  </div>
                  <div className="preview-text">{selectedReview.content}</div>
                </div>
              </div>

              <div className="reply-form">
                <label className="form-label">回复内容</label>
                <div className="rich-text-toolbar">
                  <button className="toolbar-btn" title="加粗"><b>B</b></button>
                  <button className="toolbar-btn" title="斜体"><i>I</i></button>
                  <button className="toolbar-btn" title="下划线"><u>U</u></button>
                  <span className="toolbar-divider">|</span>
                  <button className="toolbar-btn" title="列表">☰</button>
                  <button className="toolbar-btn" title="引用">❝</button>
                  <button className="toolbar-btn" title="链接">🔗</button>
                  <span className="toolbar-divider">|</span>
                  <button className="toolbar-btn emoji" title="表情">😊</button>
                </div>
                <textarea
                  className="reply-textarea"
                  placeholder="请输入回复内容，支持富文本格式..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={6}
                />
                <div className="char-count">
                  {replyContent.length}/500 字
                </div>
              </div>

              <div className="reply-tips">
                <div className="tip-title">💡 回复建议</div>
                <ul className="tip-list">
                  <li>保持礼貌和专业的语气</li>
                  <li>针对用户的具体问题进行回复</li>
                  <li>如有问题，提供解决方案或联系方式</li>
                  <li>感谢用户的反馈和建议</li>
                </ul>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setShowReplyModal(false)}>取消</button>
              <button className="btn-template">使用模板</button>
              <button className="btn-primary" onClick={handleReply}>
                {selectedReview.reply ? '保存修改' : '发布回复'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 回复历史弹窗 */}
      {showHistory && selectedReview && (
        <div className="modal-overlay" onClick={() => setShowHistory(false)}>
          <div className="history-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>回复历史记录</h2>
              <button className="modal-close" onClick={() => setShowHistory(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="history-timeline">
                <div className="history-item">
                  <div className="history-marker">
                    <div className="marker-dot" />
                    <div className="marker-line" />
                  </div>
                  <div className="history-content">
                    <div className="history-header">
                      <span className="history-type">用户评价</span>
                      <span className="history-date">{selectedReview.createdAt}</span>
                    </div>
                    <div className="history-text">{selectedReview.content}</div>
                  </div>
                </div>

                {selectedReview.reply && (
                  <div className="history-item">
                    <div className="history-marker">
                      <div className="marker-dot replied" />
                      <div className="marker-line" />
                    </div>
                    <div className="history-content">
                      <div className="history-header">
                        <span className="history-type reply">官方回复</span>
                        <span className="history-date">{selectedReview.reply.createdAt}</span>
                      </div>
                      <div className="history-text">{selectedReview.reply.content}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setShowHistory(false)}>关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
