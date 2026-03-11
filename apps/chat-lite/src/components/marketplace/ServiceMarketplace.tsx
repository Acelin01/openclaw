/**
 * ServiceMarketplace - 技能服务市场
 * 基于文档：服务市场.md (F03-01 ~ F03-12)
 * 
 * 功能列表:
 * - F03-01: 服务浏览与搜索
 * - F03-02: 服务详情查看
 * - F03-03: 服务筛选 (行业/类型/价格)
 * - F03-04: AI 智能匹配
 * - F03-05: 服务下单
 * - F03-06: 服务收藏
 * - F03-07: 服务商信息
 * - F03-08: 服务评价
 * - F03-09: 服务套餐选择
 * - F03-10: 服务对比
 * - F03-11: 行业解决方案
 * - F03-12: 游客模式
 */

import React, { useState, useEffect } from 'react';
import './ServiceMarketplace.css';

// 类型定义
interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  basePrice: number;
  rating: number;
  reviewCount: number;
  sellerName: string;
  sellerAvatar: string;
  sellerType: 'robot' | 'human' | 'hybrid';
  tags: string[];
  responseTime: string;
  isFeatured?: boolean;
  isCertified?: boolean;
  industry: string;
}

interface FilterState {
  industry: string;
  serviceType: string;
  certification: string[];
  minRating: number;
  minPrice: number;
  maxPrice: number;
  responseTime: string;
}

// 模拟数据
const MOCK_SERVICES: Service[] = [
  {
    id: '1',
    name: '全自动数据分析与可视化报告',
    description: '上传原始数据，机器人自动清洗、分析、生成交互式可视化报告，支持 Excel/CSV/数据库多源接入。',
    icon: '📊',
    basePrice: 280,
    rating: 4.9,
    reviewCount: 342,
    sellerName: 'DataBot Pro',
    sellerAvatar: 'DA',
    sellerType: 'robot',
    tags: ['AI 增强', '平台认证'],
    responseTime: '42min',
    isFeatured: true,
    isCertified: true,
    industry: '数据分析'
  },
  {
    id: '2',
    name: 'SEO 内容创作 + AI 优化',
    description: '专业文案团队结合 AI 工具，提供高转化率的文章、产品描述、广告语，含关键词分析与排名追踪。',
    icon: '✍️',
    basePrice: 150,
    rating: 4.8,
    reviewCount: 256,
    sellerName: '李文昊',
    sellerAvatar: '李',
    sellerType: 'hybrid',
    tags: ['混合服务', '平台认证'],
    responseTime: '1.2h',
    isFeatured: false,
    isCertified: true,
    industry: '内容创作'
  },
  {
    id: '3',
    name: '全栈 Web 应用自动开发机器人',
    description: '描述需求即可生成完整前后端代码，支持 React/Vue/Node.js，自动部署到云端，含单元测试与文档。',
    icon: '⚙️',
    basePrice: 320,
    rating: 4.6,
    reviewCount: 189,
    sellerName: 'CodeWeaver Bot',
    sellerAvatar: 'CW',
    sellerType: 'robot',
    tags: ['机器人服务'],
    responseTime: '8min',
    isFeatured: false,
    isCertified: false,
    industry: '软件开发'
  },
  {
    id: '4',
    name: 'UI/UX 设计 + Figma 原型交付',
    description: '从用户调研到高保真原型，提供品牌一致的界面设计方案，含组件库与开发规范，支持快速迭代。',
    icon: '🎨',
    basePrice: 200,
    rating: 5.0,
    reviewCount: 423,
    sellerName: '陈晓宇',
    sellerAvatar: '陈',
    sellerType: 'hybrid',
    tags: ['混合服务', '平台认证'],
    responseTime: '2.4h',
    isFeatured: false,
    isCertified: true,
    industry: '设计创意'
  },
  {
    id: '5',
    name: '7×24 智能客服机器人部署',
    description: '基于 RAG 技术的知识库问答机器人，支持多渠道接入（微信/网页/APP），自动升级复杂问题给人工，含完整对话分析。',
    icon: '🤖',
    basePrice: 180,
    rating: 4.9,
    reviewCount: 567,
    sellerName: 'ServiceAI Bot',
    sellerAvatar: 'CS',
    sellerType: 'robot',
    tags: ['机器人服务', '平台认证'],
    responseTime: '3min',
    isFeatured: true,
    isCertified: true,
    industry: 'AI 自动化'
  },
  {
    id: '6',
    name: 'AI 辅助短视频脚本与剪辑',
    description: 'AI 自动生成短视频脚本，结合专业剪辑师完成后期制作，包含字幕、配乐、特效，适配抖音/小红书/B 站多平台格式。',
    icon: '🎬',
    basePrice: 240,
    rating: 4.7,
    reviewCount: 298,
    sellerName: '王子轩',
    sellerAvatar: '王',
    sellerType: 'hybrid',
    tags: ['AI 增强'],
    responseTime: '4.1h',
    isFeatured: false,
    isCertified: false,
    industry: '视频制作'
  },
];

const INDUSTRIES = [
  { name: '全部行业', count: 2438, icon: '' },
  { name: '💻 软件开发', count: 612, icon: '💻' },
  { name: '📊 数据分析', count: 389, icon: '📊' },
  { name: '🎨 设计创意', count: 347, icon: '🎨' },
  { name: '✍️ 内容创作', count: 298, icon: '✍️' },
  { name: '🤖 AI 自动化', count: 256, icon: '🤖' },
  { name: '📣 营销运营', count: 214, icon: '📣' },
  { name: '🎬 视频制作', count: 178, icon: '🎬' },
  { name: '🏢 企业服务', count: 144, icon: '🏢' },
];

const SEARCH_TAGS = ['#数据分析', '#内容创作', '#代码开发', '#设计视觉', '#AI 自动化', '#客服运营', '#视频制作'];

export const ServiceMarketplace: React.FC = () => {
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES);
  const [filteredServices, setFilteredServices] = useState<Service[]>(MOCK_SERVICES);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    industry: '全部行业',
    serviceType: '全部',
    certification: [],
    minRating: 0,
    minPrice: 0,
    maxPrice: 500,
    responseTime: '全部',
  });
  const [sortBy, setSortBy] = useState('comprehensive');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 筛选服务
  useEffect(() => {
    let result = [...services];

    // 搜索过滤
    if (searchQuery) {
      result = result.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // 行业过滤
    if (filters.industry !== '全部行业') {
      result = result.filter(s => s.industry === filters.industry);
    }

    // 服务类型过滤
    if (filters.serviceType !== '全部') {
      const typeMap: Record<string, string> = {
        '机器人服务': 'robot',
        '人工服务': 'human',
        '混合服务': 'hybrid',
      };
      result = result.filter(s => s.sellerType === typeMap[filters.serviceType]);
    }

    // 认证过滤
    if (filters.certification.includes('平台认证')) {
      result = result.filter(s => s.isCertified);
    }

    // 评分过滤
    if (filters.minRating > 0) {
      result = result.filter(s => s.rating >= filters.minRating);
    }

    // 价格过滤
    result = result.filter(s => s.basePrice >= filters.minPrice && s.basePrice <= filters.maxPrice);

    // 排序
    switch (sortBy) {
      case 'sales':
        result.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case 'price_asc':
        result.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    setFilteredServices(result);
    setCurrentPage(1);
  }, [searchQuery, filters, sortBy, services]);

  const handleIndustrySelect = (industry: string) => {
    setFilters(prev => ({ ...prev, industry }));
  };

  const handleFilterToggle = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleCertificationToggle = (cert: string) => {
    setFilters(prev => ({
      ...prev,
      certification: prev.certification.includes(cert)
        ? prev.certification.filter(c => c !== cert)
        : [...prev.certification, cert]
    }));
  };

  const handleFavorite = (serviceId: string) => {
    console.log('Favorite service:', serviceId);
  };

  const handleOrder = (serviceId: string) => {
    console.log('Order service:', serviceId);
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    return (
      <span className="stars">
        {'★'.repeat(fullStars)}
        {hasHalfStar ? '½' : ''}
        {'☆'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0))}
      </span>
    );
  };

  return (
    <div className="service-marketplace">
      {/* TOP NAV */}
      <nav className="topnav">
        <div className="topnav-logo">
          <div className="dot"></div>
          ROBOT·SKILLS·PLATFORM
        </div>
        <ul className="topnav-links">
          <li><a href="#">首页</a></li>
          <li><a href="#" className="active">服务市场</a></li>
          <li><a href="#">行业解决方案</a></li>
          <li><a href="#">机器人中心</a></li>
          <li><a href="#">关于平台</a></li>
        </ul>
        <div className="topnav-right">
          <button className="btn-ghost" onClick={() => setIsLoggedIn(!isLoggedIn)}>
            {isLoggedIn ? '个人中心' : '登录'}
          </button>
          <button className="btn-primary">免费注册</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-grid"></div>
        <div className="hero-content">
          <div className="hero-eyebrow">服务市场 · Service Marketplace</div>
          <h1>找到你的<em>机器人搭档</em><br/>与人类专家</h1>
          <p className="hero-desc">
            浏览 2,400+ 认证技能服务，AI 需求分析为你精准匹配最优自由职业者与机器人服务者，支持实时工时计费与全程协作。
          </p>
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-num">2,4<span>00+</span></div>
              <div className="stat-label">认证服务</div>
            </div>
            <div className="stat">
              <div className="stat-num">1,2<span>30</span></div>
              <div className="stat-label">自由职业者</div>
            </div>
            <div className="stat">
              <div className="stat-num">4<span>98</span></div>
              <div className="stat-label">活跃机器人</div>
            </div>
            <div className="stat">
              <div className="stat-num">98<span>%</span></div>
              <div className="stat-label">验收通过率</div>
            </div>
          </div>
          <div className="search-bar">
            <input
              type="text"
              placeholder="搜索服务…例如：Python 数据分析、SEO 内容创作、3D 建模"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button>AI 智能匹配</button>
          </div>
          <div className="search-tags">
            {SEARCH_TAGS.map(tag => (
              <span key={tag} className="search-tag" onClick={() => setSearchQuery(tag)}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* MARQUEE STRIP */}
      <div className="marquee-strip">
        <div className="marquee-inner">
          <span className="marquee-item">✦ <span>智能匹配引擎</span></span>
          <span className="marquee-sep">·</span>
          <span className="marquee-item">✦ <span>技能标签 40% 权重</span></span>
          <span className="marquee-sep">·</span>
          <span className="marquee-item">✦ <span>历史评分 20% 权重</span></span>
          <span className="marquee-sep">·</span>
          <span className="marquee-item">✦ <span>每 6 秒实时计费</span></span>
          <span className="marquee-sep">·</span>
          <span className="marquee-item">✦ <span>资金托管保障</span></span>
          <span className="marquee-sep">·</span>
          <span className="marquee-item">✦ <span>AI 仲裁机制</span></span>
          <span className="marquee-sep">·</span>
          <span className="marquee-item">✦ <span>7×24 客服智能体</span></span>
          <span className="marquee-sep">·</span>
          <span className="marquee-item">✦ <span>OpenClaw 机器人接入</span></span>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-wrap">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-section">
            <div className="sidebar-title">行业分类</div>
            <div className="industry-list">
              {INDUSTRIES.map(ind => (
                <div
                  key={ind.name}
                  className={`industry-item ${filters.industry === ind.name ? 'active' : ''}`}
                  onClick={() => handleIndustrySelect(ind.name)}
                >
                  {ind.icon} {ind.name} <span className="count">{ind.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-title">服务类型</div>
            <div className="filter-group">
              <div className="filter-options">
                {['全部', '机器人服务', '人工服务', '混合服务'].map(type => (
                  <button
                    key={type}
                    className={`filter-chip ${filters.serviceType === type ? 'active' : ''}`}
                    onClick={() => handleFilterToggle('serviceType', type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-title">认证状态</div>
            <div className="filter-group">
              <div className="filter-options">
                {['平台认证', '精选推荐', '新上架'].map(cert => (
                  <button
                    key={cert}
                    className={`filter-chip ${filters.certification.includes(cert) ? 'active' : ''}`}
                    onClick={() => handleCertificationToggle(cert)}
                  >
                    {cert}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-title">评分筛选</div>
            <div className="filter-group">
              <div className="filter-options">
                {[4.5, 4.0, 0].map(rating => (
                  <button
                    key={rating}
                    className={`filter-chip ${filters.minRating === rating ? 'active' : ''}`}
                    onClick={() => handleFilterToggle('minRating', rating)}
                  >
                    {rating > 0 ? `⭐ ${rating}+` : '全部评分'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-title">价格区间 (¥/小时)</div>
            <div className="price-range">
              <input
                className="price-input"
                type="number"
                placeholder="最低"
                value={filters.minPrice}
                onChange={(e) => handleFilterToggle('minPrice', Number(e.target.value))}
              />
              <span className="price-sep">—</span>
              <input
                className="price-input"
                type="number"
                placeholder="最高"
                value={filters.maxPrice}
                onChange={(e) => handleFilterToggle('maxPrice', Number(e.target.value))}
              />
            </div>
          </div>
        </aside>

        {/* CONTENT */}
        <main>
          {/* GUEST BANNER */}
          {!isLoggedIn && (
            <div className="guest-banner">
              <div className="guest-icon">👋</div>
              <div className="guest-text">
                你正在以<strong>游客身份</strong>浏览服务市场。登录后可享受 AI 智能匹配、一键下单及实时工时协作等完整功能。
              </div>
              <button className="btn-login" onClick={() => setIsLoggedIn(true)}>登录 / 注册</button>
            </div>
          )}

          {/* SOLUTION BANNER */}
          <div className="solution-banner">
            <div>
              <div className="solution-eyebrow">行业解决方案 · Industry Solutions</div>
              <div className="solution-title">为你的行业定制一站式智能服务方案</div>
              <div className="solution-desc">
                将多个技能服务打包为场景化解决方案，覆盖电商、教育、金融、医疗等 12 个核心行业，开箱即用。
              </div>
              <div className="solution-chips">
                <span className="sol-chip">电商运营</span>
                <span className="sol-chip">教育内容</span>
                <span className="sol-chip">金融合规</span>
                <span className="sol-chip">品牌营销</span>
                <span className="sol-chip">技术研发</span>
                <span className="sol-chip">+7 更多</span>
              </div>
            </div>
            <button className="solution-btn">浏览全部方案 →</button>
          </div>

          {/* CONTENT HEAD */}
          <div className="content-head">
            <div className="content-title">
              服务列表
              <span>共 {filteredServices.length} 个服务</span>
            </div>
            <div className="sort-bar">
              <span className="sort-label">排序：</span>
              <button className={`sort-btn ${sortBy === 'comprehensive' ? 'active' : ''}`} onClick={() => setSortBy('comprehensive')}>综合</button>
              <button className={`sort-btn ${sortBy === 'sales' ? 'active' : ''}`} onClick={() => setSortBy('sales')}>销量</button>
              <button className={`sort-btn ${sortBy === 'price_asc' ? 'active' : ''}`} onClick={() => setSortBy('price_asc')}>价格↑</button>
              <button className={`sort-btn ${sortBy === 'rating' ? 'active' : ''}`} onClick={() => setSortBy('rating')}>评分</button>
            </div>
          </div>

          {/* CARDS GRID */}
          <div className="cards-grid">
            {filteredServices.map(service => (
              <div key={service.id} className={`card ${service.isFeatured ? 'featured' : ''}`}>
                <div className="card-thumb" style={{ background: `linear-gradient(135deg, #0d1117 0%, #1a2744 100%)` }}>
                  <div className="card-thumb-icon">{service.icon}</div>
                </div>
                <div class="card-body">
                  <div className="card-tags">
                    {service.tags.map(tag => (
                      <span key={tag} className={`tag tag-${tag.includes('AI') ? 'ai' : tag.includes('机器人') ? 'bot' : 'mix'}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="card-title">{service.name}</div>
                  <div className="card-desc">{service.description}</div>
                  <div className="card-meta">
                    <div className="card-meta-item">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/>
                      </svg>
                      均响应 {service.responseTime}
                    </div>
                    <div className="card-meta-item">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M8 1l1.8 3.6L14 5.4l-3 2.9.7 4.1L8 10.4l-3.7 2 .7-4.1L2 5.4l4.2-.8z"/>
                      </svg>
                      {renderStars(service.rating)} {service.rating}
                    </div>
                    <div className="card-price">
                      <div className="card-price-num">¥{service.basePrice}</div>
                      <div className="card-price-unit">/小时</div>
                    </div>
                  </div>
                </div>
                <div className="card-footer">
                  <div className="seller">
                    <div className="seller-avatar" style={{ background: '#1a4fd6' }}>{service.sellerAvatar}</div>
                    <div>
                      <div className="seller-name">{service.sellerName}</div>
                      <div className="seller-cert">✓ 认证{service.sellerType === 'robot' ? '机器人' : '自由职业者'}</div>
                    </div>
                  </div>
                  <div className="card-actions">
                    <button className="btn-fav" onClick={(e) => { e.stopPropagation(); handleFavorite(service.id); }}>♡</button>
                    <button className="btn-order" onClick={(e) => { e.stopPropagation(); handleOrder(service.id); }}>立即下单</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION */}
          <div className="pagination">
            <button className="page-btn" disabled>‹</button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <button className="page-btn">4</button>
            <span style={{ color: 'var(--muted)', fontSize: '13px' }}>…</span>
            <button className="page-btn">48</button>
            <button className="page-btn">›</button>
          </div>
        </main>
      </div>

      {/* FOOTER */}
      <footer className="site-footer">
        <div>© 2026 Robot Skills Sharing Platform · 机器人技能共享平台</div>
        <div style={{ display: 'flex', gap: '24px' }}>
          <a href="#">用户协议</a>
          <a href="#">隐私政策</a>
          <a href="#">服务商入驻</a>
          <a href="#">帮助中心</a>
        </div>
        <div style={{ fontSize: '11px', color: '#444' }}>v1.2 · F03 服务市场模块</div>
      </footer>
    </div>
  );
};

export default ServiceMarketplace;
