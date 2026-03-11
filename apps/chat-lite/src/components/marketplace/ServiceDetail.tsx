/**
 * ServiceDetail - 服务详情页
 * 对应文档：服务市场.md (F03-02)
 * 
 * 功能:
 * - 完整服务描述
 * - 套餐选择 (BASIC/PRO/ENTERPRISE)
 * - 服务商详情
 * - 评价列表
 * - 服务案例展示
 * - 常见问题
 */

import React, { useState, useEffect } from 'react';
import './ServiceDetail.css';

// 类型定义
interface ServicePackage {
  type: 'BASIC' | 'PRO' | 'ENTERPRISE';
  name: string;
  price: number;
  features: string[];
  deliveryTime: string;
  revisions: number;
  isPopular?: boolean;
}

interface ServiceReview {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  images?: string[];
}

interface ServiceProvider {
  name: string;
  avatar: string;
  type: 'robot' | 'human' | 'hybrid';
  rating: number;
  reviewCount: number;
  completedOrders: number;
  responseTime: string;
  isCertified: boolean;
  description: string;
  skills: string[];
  joinDate: string;
}

interface ServiceDetail {
  id: string;
  name: string;
  description: string;
  fullDescription: string;
  icon: string;
  images?: string[];
  videoUrl?: string;
  basePrice: number;
  rating: number;
  reviewCount: number;
  packages: ServicePackage[];
  provider: ServiceProvider;
  reviews: ServiceReview[];
  faqs: { question: string; answer: string }[];
  tags: string[];
  deliveryTime: string;
  sourceFiles: boolean;
  commercialUse: boolean;
}

// 模拟数据
const MOCK_SERVICE: ServiceDetail = {
  id: '1',
  name: '全自动数据分析与可视化报告',
  description: '上传原始数据，机器人自动清洗、分析、生成交互式可视化报告',
  fullDescription: `
    ## 服务详情
    
    本服务使用先进的 AI 技术，为您提供专业的数据分析与可视化报告。
    
    ### 服务流程
    1. **数据上传**: 支持 Excel、CSV、数据库等多种数据源
    2. **数据清洗**: 自动处理缺失值、异常值、重复数据
    3. **数据分析**: 描述性统计、相关性分析、趋势分析
    4. **可视化**: 交互式图表、仪表板、可下载报告
    5. **交付**: 48 小时内交付完整分析报告
    
    ### 适用场景
    - 销售数据分析
    - 用户行为分析
    - 市场调研报告
    - 财务报表可视化
    - 运营数据监控
    
    ### 交付内容
    - 交互式可视化报告 (HTML)
    - 原始分析数据 (Excel/CSV)
    - 分析结论摘要 (PDF)
    - 源代码 (可选)
  `,
  icon: '📊',
  images: [
    'https://via.placeholder.com/800x450/0d1117/ffffff?text=Dashboard+Preview+1',
    'https://via.placeholder.com/800x450/1a2744/ffffff?text=Dashboard+Preview+2',
    'https://via.placeholder.com/800x450/0d3354/ffffff?text=Dashboard+Preview+3',
  ],
  basePrice: 280,
  rating: 4.9,
  reviewCount: 342,
  deliveryTime: '48 小时',
  sourceFiles: true,
  commercialUse: true,
  tags: ['AI 增强', '平台认证', '快速交付'],
  packages: [
    {
      type: 'BASIC',
      name: '基础版',
      price: 280,
      features: [
        '基础数据清洗',
        '描述性统计分析',
        '5 个可视化图表',
        'PDF 报告',
        '1 次修改机会',
      ],
      deliveryTime: '48 小时',
      revisions: 1,
    },
    {
      type: 'PRO',
      name: '专业版',
      price: 560,
      features: [
        '高级数据清洗',
        '深度统计分析',
        '15 个可视化图表',
        '交互式仪表板',
        'PDF + Excel 报告',
        '源代码',
        '3 次修改机会',
      ],
      deliveryTime: '72 小时',
      revisions: 3,
      isPopular: true,
    },
    {
      type: 'ENTERPRISE',
      name: '企业版',
      price: 1120,
      features: [
        '企业级数据处理',
        '预测性分析',
        '无限可视化图表',
        '交互式仪表板',
        '完整报告套件',
        '源代码 + 文档',
        'API 集成支持',
        '无限修改机会',
        '专属客服',
      ],
      deliveryTime: '96 小时',
      revisions: 999,
    },
  ],
  provider: {
    name: 'DataBot Pro',
    avatar: 'DA',
    type: 'robot',
    rating: 4.9,
    reviewCount: 1234,
    completedOrders: 5678,
    responseTime: '42min',
    isCertified: true,
    description: '专业数据分析机器人，基于最先进的 AI 技术，已服务 5000+ 客户，专注于提供高质量的数据分析与可视化服务。',
    skills: ['Python', '数据分析', '机器学习', '可视化', '统计学'],
    joinDate: '2024-01',
  },
  reviews: [
    {
      id: '1',
      userName: '张先生',
      userAvatar: '张',
      rating: 5,
      comment: '非常专业的服务！数据分析深入，可视化效果很棒，报告直接用于公司汇报，老板很满意。',
      date: '2026-03-08',
      helpful: 23,
      images: ['https://via.placeholder.com/200x150?text=Review+1'],
    },
    {
      id: '2',
      userName: '李女士',
      userAvatar: '李',
      rating: 5,
      comment: '速度很快，分析结果准确，可视化图表很专业，下次还会合作！',
      date: '2026-03-05',
      helpful: 15,
    },
    {
      id: '3',
      userName: '王总',
      userAvatar: '王',
      rating: 4,
      comment: '整体不错，就是第一次交付的图表风格需要调整，沟通后很快修改了。',
      date: '2026-03-01',
      helpful: 8,
    },
    {
      id: '4',
      userName: '陈经理',
      userAvatar: '陈',
      rating: 5,
      comment: '数据分析师水平很高，不仅提供了数据，还给出了业务建议，非常有价值。',
      date: '2026-02-28',
      helpful: 31,
    },
  ],
  faqs: [
    {
      question: '支持哪些数据格式？',
      answer: '支持 Excel (.xlsx, .xls)、CSV、JSON、数据库导出文件等常见格式。如果是特殊格式，请先联系客服确认。',
    },
    {
      question: '数据安全如何保障？',
      answer: '我们严格保护客户数据隐私，分析完成后 7 天内会自动删除所有原始数据。可签署保密协议 (NDA)。',
    },
    {
      question: '可以加急吗？',
      answer: '可以，加急服务需额外收取 50% 费用，最快 24 小时交付。请联系客服安排。',
    },
    {
      question: '提供售后服务吗？',
      answer: '提供 30 天免费售后支持，包括报告解读、数据更新、小幅调整等。',
    },
  ],
};

export const ServiceDetail: React.FC = () => {
  const [service, setService] = useState<ServiceDetail>(MOCK_SERVICE);
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage>(service.packages[1]);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'provider' | 'faq'>('description');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');

  const handleOrder = () => {
    console.log('Order package:', selectedPackage.type);
    // 跳转到订单页面
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const renderStars = (rating: number) => {
    return (
      <span className="stars">
        {'★'.repeat(Math.floor(rating))}
        {'☆'.repeat(5 - Math.floor(rating))}
      </span>
    );
  };

  return (
    <div className="service-detail">
      {/* TOP NAV - 复用导航 */}
      <nav className="detail-topnav">
        <div className="detail-nav-content">
          <button className="back-btn" onClick={() => window.history.back()}>← 返回服务市场</button>
          <div className="nav-actions">
            <button className={`fav-btn ${isFavorite ? 'active' : ''}`} onClick={handleFavorite}>
              {isFavorite ? '♥ 已收藏' : '♡ 收藏'}
            </button>
            <button className="share-btn">分享</button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="detail-hero">
        <div className="detail-hero-content">
          <div className="service-header">
            <span className="service-icon">{service.icon}</span>
            <div className="service-info">
              <h1 className="service-title">{service.name}</h1>
              <div className="service-meta">
                <span className="rating">
                  {renderStars(service.rating)}
                  <strong>{service.rating}</strong>
                  <span className="review-count">({service.reviewCount}条评价)</span>
                </span>
                <span className="tags">
                  {service.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </span>
              </div>
            </div>
          </div>

          <p className="service-short-desc">{service.description}</p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="detail-main">
        <div className="detail-content">
          {/* TABS */}
          <div className="detail-tabs">
            <button className={`tab ${activeTab === 'description' ? 'active' : ''}`} onClick={() => setActiveTab('description')}>
              服务详情
            </button>
            <button className={`tab ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
              评价 ({service.reviewCount})
            </button>
            <button className={`tab ${activeTab === 'provider' ? 'active' : ''}`} onClick={() => setActiveTab('provider')}>
              服务商
            </button>
            <button className={`tab ${activeTab === 'faq' ? 'active' : ''}`} onClick={() => setActiveTab('faq')}>
              常见问题
            </button>
          </div>

          {/* TAB CONTENT */}
          <div className="tab-content">
            {activeTab === 'description' && (
              <div className="description-tab">
                {/* IMAGES */}
                {service.images && (
                  <div className="service-images">
                    {service.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Service preview ${idx + 1}`}
                        onClick={() => handleImageClick(img)}
                        className="preview-image"
                      />
                    ))}
                  </div>
                )}

                {/* FULL DESCRIPTION */}
                <div className="full-description">
                  <h2>服务详情</h2>
                  <div className="description-content" dangerouslySetInnerHTML={{ __html: service.fullDescription.replace(/\n/g, '<br/>') }} />
                </div>

                {/* DELIVERY INFO */}
                <div className="delivery-info">
                  <h3>交付信息</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">交付时间</span>
                      <span className="value">{service.deliveryTime}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">源文件</span>
                      <span className="value">{service.sourceFiles ? '✓ 包含' : '✗ 不包含'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">商业用途</span>
                      <span className="value">{service.commercialUse ? '✓ 允许' : '✗ 不允许'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">修改次数</span>
                      <span className="value">{selectedPackage.revisions >= 999 ? '无限' : `${selectedPackage.revisions}次`}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="reviews-tab">
                <div className="reviews-header">
                  <h2>客户评价</h2>
                  <div className="rating-summary">
                    <div className="rating-big">{service.rating}</div>
                    <div className="rating-stars">{renderStars(service.rating)}</div>
                    <div className="rating-count">{service.reviewCount}条评价</div>
                  </div>
                </div>

                <div className="reviews-list">
                  {service.reviews.map(review => (
                    <div key={review.id} className="review-card">
                      <div className="review-header">
                        <div className="reviewer">
                          <div className="reviewer-avatar">{review.userAvatar}</div>
                          <div className="reviewer-info">
                            <div className="reviewer-name">{review.userName}</div>
                            <div className="review-date">{review.date}</div>
                          </div>
                        </div>
                        <div className="review-rating">{renderStars(review.rating)}</div>
                      </div>
                      <p className="review-comment">{review.comment}</p>
                      {review.images && (
                        <div className="review-images">
                          {review.images.map((img, idx) => (
                            <img key={idx} src={img} alt="Review" className="review-image" />
                          ))}
                        </div>
                      )}
                      <div className="review-footer">
                        <span className="helpful">👍 {review.helpful} 人觉得有用</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'provider' && (
              <div className="provider-tab">
                <div className="provider-card">
                  <div className="provider-header">
                    <div className="provider-avatar-large">{service.provider.avatar}</div>
                    <div className="provider-info">
                      <h3>{service.provider.name}</h3>
                      <div className="provider-meta">
                        <span className="provider-type">
                          {service.provider.type === 'robot' ? '🤖 认证机器人' : '👤 认证自由职业者'}
                        </span>
                        {service.provider.isCertified && <span className="certified">✓ 平台认证</span>}
                      </div>
                      <div className="provider-rating">
                        {renderStars(service.provider.rating)}
                        <strong>{service.provider.rating}</strong>
                        <span>({service.provider.reviewCount}条评价)</span>
                      </div>
                    </div>
                  </div>

                  <p className="provider-description">{service.provider.description}</p>

                  <div className="provider-stats">
                    <div className="stat">
                      <div className="stat-num">{service.provider.completedOrders}</div>
                      <div className="stat-label">完成订单</div>
                    </div>
                    <div className="stat">
                      <div className="stat-num">{service.provider.responseTime}</div>
                      <div className="stat-label">平均响应</div>
                    </div>
                    <div className="stat">
                      <div className="stat-num">{service.provider.joinDate}</div>
                      <div className="stat-label">加入时间</div>
                    </div>
                  </div>

                  <div className="provider-skills">
                    <h4>技能标签</h4>
                    <div className="skills-list">
                      {service.provider.skills.map(skill => (
                        <span key={skill} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="faq-tab">
                <h2>常见问题</h2>
                <div className="faq-list">
                  {service.faqs.map((faq, idx) => (
                    <div key={idx} className="faq-item">
                      <div className="faq-question">❓ {faq.question}</div>
                      <div className="faq-answer">{faq.answer}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR - PACKAGE SELECTION */}
        <div className="detail-sidebar">
          <div className="package-selection">
            <h3>选择套餐</h3>
            <div className="packages-list">
              {service.packages.map(pkg => (
                <div
                  key={pkg.type}
                  className={`package-card ${selectedPackage.type === pkg.type ? 'selected' : ''} ${pkg.isPopular ? 'popular' : ''}`}
                  onClick={() => setSelectedPackage(pkg)}
                >
                  {pkg.isPopular && <div className="popular-badge">热门推荐</div>}
                  <div className="package-header">
                    <div className="package-name">{pkg.name}</div>
                    <div className="package-price">¥{pkg.price}</div>
                  </div>
                  <div className="package-delivery">交付：{pkg.deliveryTime}</div>
                  <ul className="package-features">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="feature-item">✓ {feature}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="order-summary">
              <div className="summary-row">
                <span>套餐</span>
                <span>{selectedPackage.name}</span>
              </div>
              <div className="summary-row">
                <span>交付时间</span>
                <span>{selectedPackage.deliveryTime}</span>
              </div>
              <div className="summary-row total">
                <span>总计</span>
                <span className="total-price">¥{selectedPackage.price}</span>
              </div>
            </div>

            <button className="order-btn" onClick={handleOrder}>
              立即下单
            </button>

            <div className="trust-badges">
              <div className="badge">💰 资金托管</div>
              <div className="badge">✓ 验收保障</div>
              <div className="badge">🔄 免费修改</div>
            </div>
          </div>
        </div>
      </div>

      {/* IMAGE MODAL */}
      {showImageModal && (
        <div className="image-modal" onClick={() => setShowImageModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowImageModal(false)}>✕</button>
            <img src={selectedImage} alt="Preview" className="modal-image" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDetail;
