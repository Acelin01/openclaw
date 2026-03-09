/**
 * 技能服务市场 - React 版本（增强版）
 * 包含：搜索、筛选、订阅、收藏、对比、评价等功能
 */

import React, { useState, useEffect } from 'react';
import './SkillMarket.css';

interface SkillService {
  id: string;
  name: string;
  provider: string;
  providerType: 'ai' | 'bot' | 'hybrid';
  category: string;
  description: string;
  price: number;
  unit: string;
  rating: number;
  reviews: number;
  tags: string[];
  avatar: string;
  status: 'active' | 'pending' | 'offline';
  features: string[];
  deliveryTime: string;
  revisions: number;
}

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  content: string;
  date: string;
  helpful: number;
}

const categories = [
  { id: 'all', name: '全部', icon: '📊' },
  { id: 'dev', name: '开发编程', icon: '💻' },
  { id: 'design', name: '设计创意', icon: '🎨' },
  { id: 'data', name: '数据分析', icon: '📈' },
  { id: 'writing', name: '文案写作', icon: '✍️' },
  { id: 'marketing', name: '营销推广', icon: '📣' },
  { id: 'support', name: '客服支持', icon: '🎧' },
];

const mockServices: SkillService[] = [
  {
    id: 'svc-001',
    name: '智能数据分析师',
    provider: 'DataBot Pro',
    providerType: 'bot',
    category: 'data',
    description: '自动化数据分析报告生成，支持多数据源接入和可视化展示，帮助企业快速洞察业务数据价值。',
    price: 280,
    unit: '小时',
    rating: 4.9,
    reviews: 312,
    tags: ['数据分析', 'Python', '可视化', 'BI'],
    avatar: '🤖',
    status: 'active',
    features: ['多数据源接入', '自动化报告', '可视化图表', '数据洞察'],
    deliveryTime: '24 小时',
    revisions: 3,
  },
  {
    id: 'svc-002',
    name: 'UI 设计评审助手',
    provider: 'DesignBot',
    providerType: 'bot',
    category: 'design',
    description: '专业 UI/UX 设计评审，提供改进建议和最佳实践指导，帮助提升产品用户体验。',
    price: 180,
    unit: '小时',
    rating: 4.8,
    reviews: 156,
    tags: ['UI 设计', 'UX', '评审', '最佳实践'],
    avatar: '🎨',
    status: 'active',
    features: ['设计评审', '交互建议', '可访问性检查', '设计规范'],
    deliveryTime: '12 小时',
    revisions: 2,
  },
  {
    id: 'svc-003',
    name: '全栈开发智能助手',
    provider: '李晓梅 + AI',
    providerType: 'hybrid',
    category: 'dev',
    description: '人机协作的全栈开发服务，React/Node.js/数据库一站式解决方案，高效交付高质量代码。',
    price: 320,
    unit: '小时',
    rating: 4.9,
    reviews: 89,
    tags: ['全栈开发', 'React', 'Node.js', '数据库'],
    avatar: '⚡',
    status: 'active',
    features: ['前后端开发', '数据库设计', 'API 开发', '代码审查'],
    deliveryTime: '48 小时',
    revisions: 5,
  },
  {
    id: 'svc-004',
    name: '文档整理助手',
    provider: 'DocuBot',
    providerType: 'ai',
    category: 'writing',
    description: '自动整理和归类文档，支持多格式转换和知识图谱构建，让知识管理更高效。',
    price: 120,
    unit: '小时',
    rating: 4.7,
    reviews: 234,
    tags: ['文档管理', 'AI', '自动化', '知识图谱'],
    avatar: '📄',
    status: 'active',
    features: ['文档分类', '格式转换', '知识图谱', '智能搜索'],
    deliveryTime: '6 小时',
    revisions: 2,
  },
  {
    id: 'svc-005',
    name: '测试用例生成器',
    provider: 'TestBot',
    providerType: 'bot',
    category: 'dev',
    description: '基于需求文档自动生成测试用例，支持单元测试和 E2E 测试，提升测试覆盖率。',
    price: 200,
    unit: '小时',
    rating: 4.8,
    reviews: 167,
    tags: ['测试', '自动化', 'QA', '单元测试'],
    avatar: '✅',
    status: 'active',
    features: ['用例生成', '自动化测试', '覆盖率分析', '回归测试'],
    deliveryTime: '24 小时',
    revisions: 3,
  },
  {
    id: 'svc-006',
    name: '品牌 VI 设计服务',
    provider: '王晓雨',
    providerType: 'hybrid',
    category: 'design',
    description: '专业品牌视觉识别系统设计，包含 Logo、配色、字体等全套方案，打造独特品牌形象。',
    price: 500,
    unit: '项目',
    rating: 5.0,
    reviews: 42,
    tags: ['品牌设计', 'VI', '平面', 'Logo'],
    avatar: '🎨',
    status: 'active',
    features: ['Logo 设计', 'VI 手册', '配色方案', '字体规范'],
    deliveryTime: '7 天',
    revisions: 5,
  },
  {
    id: 'svc-007',
    name: 'SEO 优化顾问',
    provider: 'SEOBot',
    providerType: 'ai',
    category: 'marketing',
    description: '智能 SEO 分析与优化建议，提升网站搜索引擎排名，增加有机流量。',
    price: 150,
    unit: '小时',
    rating: 4.6,
    reviews: 198,
    tags: ['SEO', '搜索引擎', '优化', '流量'],
    avatar: '🔍',
    status: 'active',
    features: ['关键词分析', '页面优化', '外链建议', '排名追踪'],
    deliveryTime: '24 小时',
    revisions: 2,
  },
  {
    id: 'svc-008',
    name: '智能客服助手',
    provider: 'ServiceBot',
    providerType: 'bot',
    category: 'support',
    description: '7x24 小时智能客服，自动回答常见问题，支持多语言，提升客户满意度。',
    price: 220,
    unit: '小时',
    rating: 4.7,
    reviews: 276,
    tags: ['客服', 'AI', '多语言', '自动化'],
    avatar: '🎧',
    status: 'active',
    features: ['自动回复', '多语言支持', '情绪识别', '工单转接'],
    deliveryTime: '即时',
    revisions: 1,
  },
];

const mockReviews: Record<string, Review[]> = {
  'svc-001': [
    { id: 'r1', userId: 'u1', userName: '张先生', rating: 5, content: '非常好用的数据分析服务，报告质量很高，帮助我们发现了很多业务问题！', date: '2026-03-05', helpful: 23 },
    { id: 'r2', userId: 'u2', userName: '李女士', rating: 5, content: '响应速度快，数据分析专业，可视化效果也很棒。', date: '2026-03-03', helpful: 18 },
    { id: 'r3', userId: 'u3', userName: '王经理', rating: 4, content: '整体不错，就是价格稍微有点高。', date: '2026-03-01', helpful: 12 },
  ],
  'svc-002': [
    { id: 'r4', userId: 'u4', userName: '陈设计师', rating: 5, content: '评审意见很专业，指出了很多我没注意到的细节问题。', date: '2026-03-06', helpful: 15 },
  ],
};

export const SkillMarket: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'ai' | 'bot' | 'hybrid'>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedService, setSelectedService] = useState<SkillService | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [compareList, setCompareList] = useState<string[]>([]);
  const [subscriptions, setSubscriptions] = useState<SkillService[]>([]);
  const [showSubscriptions, setShowSubscriptions] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [currentReviews, setCurrentReviews] = useState<Review[]>([]);
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'reviews'>('rating');

  // 从 localStorage 加载收藏和订阅
  useEffect(() => {
    const savedFavorites = localStorage.getItem('market-favorites');
    const savedSubscriptions = localStorage.getItem('market-subscriptions');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
    if (savedSubscriptions) {
      setSubscriptions(JSON.parse(savedSubscriptions));
    }
  }, []);

  // 保存收藏到 localStorage
  const toggleFavorite = (serviceId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(serviceId)) {
      newFavorites.delete(serviceId);
    } else {
      newFavorites.add(serviceId);
    }
    setFavorites(newFavorites);
    localStorage.setItem('market-favorites', JSON.stringify([...newFavorites]));
  };

  // 添加到对比
  const toggleCompare = (serviceId: string) => {
    if (compareList.includes(serviceId)) {
      setCompareList(compareList.filter(id => id !== serviceId));
    } else if (compareList.length < 3) {
      setCompareList([...compareList, serviceId]);
    }
  };

  // 订阅服务
  const subscribeService = (service: SkillService) => {
    if (!subscriptions.find(s => s.id === service.id)) {
      const newSubscriptions = [...subscriptions, service];
      setSubscriptions(newSubscriptions);
      localStorage.setItem('market-subscriptions', JSON.stringify(newSubscriptions));
      alert(`成功订阅 ${service.name}！`);
    } else {
      alert('您已经订阅过此服务了');
    }
  };

  // 取消订阅
  const unsubscribeService = (serviceId: string) => {
    const newSubscriptions = subscriptions.filter(s => s.id !== serviceId);
    setSubscriptions(newSubscriptions);
    localStorage.setItem('market-subscriptions', JSON.stringify(newSubscriptions));
  };

  // 查看评价
  const viewReviews = (serviceId: string) => {
    const reviews = mockReviews[serviceId] || [];
    setCurrentReviews(reviews);
    setShowReviews(true);
  };

  // 筛选和排序
  const filteredServices = mockServices
    .filter((service) => {
      const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = selectedType === 'all' || service.providerType === selectedType;
      const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
      return matchesSearch && matchesType && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating': return b.rating - a.rating;
        case 'price': return a.price - b.price;
        case 'reviews': return b.reviews - a.reviews;
        default: return 0;
      }
    });

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ai': return 'AI 服务';
      case 'bot': return '机器人';
      case 'hybrid': return '人机协作';
      default: return '全部';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'offline': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || categoryId;
  };

  return (
    <div className="skill-market">
      {/* 顶部导航 */}
      <nav className="market-topnav">
        <div className="market-logo">
          <span className="logo-icon">🛠️</span>
          <span className="logo-text">技能服务市场</span>
        </div>
        <ul className="market-nav-links">
          <li><a href="#" className="active">服务市场</a></li>
          <li>
            <a href="#" onClick={(e) => { e.preventDefault(); setShowSubscriptions(true); }}>
              我的订阅
              {subscriptions.length > 0 && <span className="nav-badge">{subscriptions.length}</span>}
            </a>
          </li>
          <li><a href="#">服务管理</a></li>
          <li><a href="#">收益统计</a></li>
        </ul>
        <div className="market-nav-right">
          <button className="btn-ghost">登录</button>
          <button className="btn-primary">发布服务</button>
        </div>
      </nav>

      {/* Hero 区域 */}
      <section className="market-hero">
        <div className="hero-content">
          <h1>发现专业<span className="highlight">技能服务</span></h1>
          <p>2,400+ 认证服务，AI 驱动的智能匹配，找到你需要的专业能力</p>
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-value">2,400+</div>
              <div className="stat-label">认证服务</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">98%</div>
              <div className="stat-label">满意度</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">6 秒</div>
              <div className="stat-label">智能匹配</div>
            </div>
          </div>
        </div>
      </section>

      {/* 分类导航 */}
      <div className="category-nav">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-chip ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            <span className="category-icon">{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* 工具栏 */}
      <div className="market-toolbar">
        <div className="search-box">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="6" cy="6" r="4.5" />
            <path d="m11 11 2.5 2.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="搜索服务名称、描述或标签..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <div className="filter-chips">
            {(['all', 'ai', 'bot', 'hybrid'] as const).map((type) => (
              <button
                key={type}
                className={`chip ${selectedType === type ? 'active' : ''}`}
                onClick={() => setSelectedType(type)}
              >
                {getTypeLabel(type)}
              </button>
            ))}
          </div>
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'rating' | 'price' | 'reviews')}
          >
            <option value="rating">评分优先</option>
            <option value="price">价格从低到高</option>
            <option value="reviews">评价最多</option>
          </select>
        </div>
      </div>

      {/* 对比栏 */}
      {compareList.length > 0 && (
        <div className="compare-bar">
          <span className="compare-label">对比 ({compareList.length}/3)</span>
          <div className="compare-items">
            {compareList.map((id) => {
              const svc = mockServices.find(s => s.id === id);
              return svc ? (
                <div key={id} className="compare-item">
                  <span className="compare-avatar">{svc.avatar}</span>
                  <span className="compare-name">{svc.name}</span>
                  <button onClick={() => toggleCompare(id)} className="compare-remove">×</button>
                </div>
              ) : null;
            })}
          </div>
          <button className="btn-compare">开始对比</button>
          <button className="btn-clear" onClick={() => setCompareList([])}>清空</button>
        </div>
      )}

      {/* 服务列表 */}
      <div className="services-grid">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className="service-card"
            onClick={() => setSelectedService(service)}
          >
            <button
              className={`favorite-btn ${favorites.has(service.id) ? 'active' : ''}`}
              onClick={(e) => { e.stopPropagation(); toggleFavorite(service.id); }}
            >
              {favorites.has(service.id) ? '❤️' : '🤍'}
            </button>

            <div className="card-header">
              <div className="provider-avatar">{service.avatar}</div>
              <div className="provider-info">
                <h3 className="service-name">{service.name}</h3>
                <div className="provider-meta">
                  <span className="provider-name">{service.provider}</span>
                  <span
                    className="status-dot"
                    style={{ backgroundColor: getStatusColor(service.status) }}
                  />
                  <span className="category-tag">{getCategoryName(service.category)}</span>
                </div>
              </div>
              <div className="service-rating">
                <span className="rating-stars">★★★★★</span>
                <span className="rating-value">{service.rating}</span>
                <span className="rating-count">({service.reviews})</span>
              </div>
            </div>

            <p className="service-description">{service.description}</p>

            <div className="service-tags">
              {service.tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>

            <div className="service-features">
              {service.features.slice(0, 3).map((feature, index) => (
                <div key={index} className="feature-item">
                  <span className="feature-check">✓</span>
                  {feature}
                </div>
              ))}
            </div>

            <div className="card-footer">
              <div className="service-price">
                <span className="price-value">¥{service.price}</span>
                <span className="price-unit">/{service.unit}</span>
              </div>
              <div className="card-actions">
                <button
                  className={`compare-btn ${compareList.includes(service.id) ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); toggleCompare(service.id); }}
                  title="加入对比"
                >
                  ⚖️
                </button>
                <button
                  className="btn-subscribe"
                  onClick={(e) => { e.stopPropagation(); subscribeService(service); }}
                >
                  立即订阅
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 服务详情弹窗 */}
      {selectedService && (
        <div className="modal-overlay" onClick={() => setSelectedService(null)}>
          <div className="service-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-avatar">{selectedService.avatar}</div>
              <div className="modal-title">
                <h2>{selectedService.name}</h2>
                <p>{selectedService.provider} · {getTypeLabel(selectedService.providerType)}</p>
              </div>
              <button className="modal-close" onClick={() => setSelectedService(null)}>×</button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h3>服务描述</h3>
                <p>{selectedService.description}</p>
              </div>

              <div className="detail-section">
                <h3>服务特色</h3>
                <div className="features-list">
                  {selectedService.features.map((feature, index) => (
                    <div key={index} className="feature-item-large">
                      <span className="feature-check-large">✓</span>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-item">
                  <h3>交付时间</h3>
                  <p className="detail-value">⏱️ {selectedService.deliveryTime}</p>
                </div>
                <div className="detail-item">
                  <h3>修改次数</h3>
                  <p className="detail-value">🔄 {selectedService.revisions}次</p>
                </div>
                <div className="detail-item">
                  <h3>服务分类</h3>
                  <p className="detail-value">{getCategoryName(selectedService.category)}</p>
                </div>
              </div>

              <div className="detail-section">
                <h3>服务标签</h3>
                <div className="service-tags">
                  {selectedService.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              </div>

              <div className="detail-section">
                <h3>
                  用户评价
                  <button className="view-all-reviews" onClick={() => viewReviews(selectedService.id)}>
                    查看全部 {selectedService.reviews} 条评价 →
                  </button>
                </h3>
                <div className="preview-reviews">
                  {(mockReviews[selectedService.id] || []).slice(0, 2).map((review) => (
                    <div key={review.id} className="review-preview">
                      <div className="review-header">
                        <span className="review-user">{review.userName}</span>
                        <span className="review-rating">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                      </div>
                      <p className="review-content">{review.content}</p>
                      <div className="review-meta">
                        <span className="review-date">{review.date}</span>
                        <span className="review-helpful">👍 {review.helpful}人认为有用</span>
                      </div>
                    </div>
                  ))}
                  {(mockReviews[selectedService.id] || []).length === 0 && (
                    <p className="no-reviews">暂无评价，快来成为第一个评价的用户吧！</p>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <h3>价格信息</h3>
                <div className="price-detail">
                  <span className="price-large">¥{selectedService.price}</span>
                  <span className="price-unit">/{selectedService.unit}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <div className="footer-left">
                <button
                  className={`favorite-btn-large ${favorites.has(selectedService.id) ? 'active' : ''}`}
                  onClick={() => toggleFavorite(selectedService.id)}
                >
                  {favorites.has(selectedService.id) ? '❤️ 已收藏' : '🤍 收藏'}
                </button>
                <button
                  className={`compare-btn-large ${compareList.includes(selectedService.id) ? 'active' : ''}`}
                  onClick={() => toggleCompare(selectedService.id)}
                >
                  ⚖️ 对比
                </button>
              </div>
              <button
                className="btn-primary-large"
                onClick={() => subscribeService(selectedService)}
              >
                立即订阅
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 评价列表弹窗 */}
      {showReviews && (
        <div className="modal-overlay" onClick={() => setShowReviews(false)}>
          <div className="reviews-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>用户评价</h2>
              <button className="modal-close" onClick={() => setShowReviews(false)}>×</button>
            </div>
            <div className="reviews-list">
              {currentReviews.map((review) => (
                <div key={review.id} className="review-item">
                  <div className="review-avatar">{review.userName[0]}</div>
                  <div className="review-body">
                    <div className="review-header">
                      <span className="review-user">{review.userName}</span>
                      <span className="review-rating">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                      <span className="review-date">{review.date}</span>
                    </div>
                    <p className="review-content">{review.content}</p>
                    <div className="review-actions">
                      <button className="review-helpful-btn">👍 有用 ({review.helpful})</button>
                      <button className="review-report-btn">举报</button>
                    </div>
                  </div>
                </div>
              ))}
              {currentReviews.length === 0 && (
                <p className="no-reviews">暂无评价</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 我的订阅弹窗 */}
      {showSubscriptions && (
        <div className="modal-overlay" onClick={() => setShowSubscriptions(false)}>
          <div className="subscriptions-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>我的订阅 ({subscriptions.length})</h2>
              <button className="modal-close" onClick={() => setShowSubscriptions(false)}>×</button>
            </div>
            <div className="subscriptions-list">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="subscription-item">
                  <div className="sub-avatar">{sub.avatar}</div>
                  <div className="sub-info">
                    <h3>{sub.name}</h3>
                    <p>{sub.provider} · ¥{sub.price}/{sub.unit}</p>
                  </div>
                  <div className="sub-actions">
                    <button className="btn-use">使用服务</button>
                    <button
                      className="btn-unsubscribe"
                      onClick={() => unsubscribeService(sub.id)}
                    >
                      取消订阅
                    </button>
                  </div>
                </div>
              ))}
              {subscriptions.length === 0 && (
                <p className="no-subs">暂无订阅服务，去市场逛逛吧！</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
