/**
 * OrderService - 服务市场下单模块
 * 基于文档：M03 服务市场全流程 (F03-01 ~ F03-12)
 * 
 * 包含 8 个视图：
 * 1. 服务浏览 (Browse)
 * 2. 服务详情 (Detail)
 * 3. 分享&收藏 (Share)
 * 4. 沟通聊天 (Chat)
 * 5. 创建订单 (CreateOrder)
 * 6. 订单支付 (Payment)
 * 7. 订单跟踪 (Tracking)
 * 8. 我的收藏 (Favorites)
 */

import React, { useState, useEffect } from 'react';
import './OrderService.css';

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
  tags: string[];
  isHot?: boolean;
  isNew?: boolean;
}

interface Package {
  type: 'BASIC' | 'PRO' | 'ENTERPRISE';
  name: string;
  price: number;
  features: string[];
}

type OrderView = 'browse' | 'detail' | 'share' | 'chat' | 'order' | 'pay' | 'track' | 'favs';

// 模拟数据
const MOCK_SERVICES: Service[] = [
  {
    id: '1',
    name: '全自动数据分析与可视化报告',
    description: '上传数据即可获得专业可视化报告，支持 Excel/CSV/数据库',
    icon: '📊',
    basePrice: 280,
    rating: 4.9,
    reviewCount: 312,
    sellerName: 'DataBot Pro',
    sellerAvatar: 'DB',
    tags: ['机器人服务', '平台认证'],
    isHot: true,
  },
  {
    id: '2',
    name: 'SEO 内容创作 + AI 优化',
    description: '结合 AI 工具提供高转化率文章，含关键词分析',
    icon: '✍️',
    basePrice: 150,
    rating: 4.8,
    reviewCount: 156,
    sellerName: '李文昊',
    sellerAvatar: '李',
    tags: ['混合服务', '平台认证'],
  },
  {
    id: '3',
    name: '全栈 Web 应用自动开发',
    description: '描述需求即生成完整前后端代码',
    icon: '⚙️',
    basePrice: 320,
    rating: 4.6,
    reviewCount: 89,
    sellerName: 'CodeWeaver Bot',
    sellerAvatar: 'CW',
    tags: ['机器人服务'],
    isHot: true,
  },
];

const PACKAGES: Package[] = [
  { type: 'BASIC', name: '基础版', price: 280, features: ['单数据源分析', '基础图表 5 种', 'PDF 导出'] },
  { type: 'PRO', name: '专业版', price: 380, features: ['多数据源对比', '图表 20+ 种', '交互 Dashboard', '趋势预测'] },
  { type: 'ENTERPRISE', name: '企业版', price: 580, features: ['定制分析模型', '实时数据接入', '私有部署'] },
];

export function OrderService() {
  const [currentView, setCurrentView] = useState<OrderView>('browse');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<Package>(PACKAGES[1]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  // 视图导航
  const navigateTo = (view: OrderView, service?: Service) => {
    if (service) setSelectedService(service);
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 收藏切换
  const toggleFavorite = (serviceId: string) => {
    setFavorites(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  // 渲染步骤导航
  const renderStepNav = () => (
    <nav className="order-step-nav">
      {[
        { id: 'browse', label: '服务浏览', icon: '🔍' },
        { id: 'detail', label: '服务详情', icon: '📋' },
        { id: 'share', label: '分享&收藏', icon: '🔖' },
        { id: 'chat', label: '沟通', icon: '💬' },
        { id: 'order', label: '创建订单', icon: '📝' },
        { id: 'pay', label: '支付', icon: '💳' },
        { id: 'track', label: '跟踪', icon: '📊' },
        { id: 'favs', label: '收藏', icon: '❤️' },
      ].map((step, idx) => (
        <button
          key={step.id}
          className={`step-item ${currentView === step.id ? 'active' : ''} ${
            ['browse', 'detail', 'share', 'chat', 'order', 'pay', 'track', 'favs'].indexOf(currentView) > idx ? 'done' : ''
          }`}
          onClick={() => navigateTo(step.id as OrderView)}
        >
          <span className="step-num">{idx + 1}</span>
          <span className="step-label">{step.label}</span>
        </button>
      ))}
    </nav>
  );

  // 渲染服务卡片
  const renderServiceCard = (service: Service) => (
    <div 
      key={service.id} 
      className="service-card"
      onClick={() => navigateTo('detail', service)}
    >
      <div className="sc-thumb">
        {service.isHot && <span className="sc-badge hot">HOT</span>}
        {service.isNew && <span className="sc-badge new">NEW</span>}
        <span className="sc-icon">{service.icon}</span>
      </div>
      <div className="sc-body">
        <div className="sc-tags">
          {service.tags.map((tag, i) => (
            <span key={i} className={`tag tag-${i === 0 ? 'pine' : 'gold'}`}>{tag}</span>
          ))}
        </div>
        <h3 className="sc-name">{service.name}</h3>
        <p className="sc-desc">{service.description}</p>
        <div className="sc-meta">
          <div className="sc-rating">⭐ {service.rating} ({service.reviewCount})</div>
          <div className="sc-price">¥{service.basePrice}<span>/小时</span></div>
        </div>
      </div>
      <div className="sc-footer">
        <div className="sc-seller">
          <div className="avatar">{service.sellerAvatar}</div>
          <div>
            <div className="seller-name">{service.sellerName}</div>
            <div className="seller-cert">✓ 认证</div>
          </div>
        </div>
        <button 
          className={`fav-btn ${favorites.includes(service.id) ? 'on' : ''}`}
          onClick={(e) => { e.stopPropagation(); toggleFavorite(service.id); }}
        >
          {favorites.includes(service.id) ? '♥' : '♡'}
        </button>
      </div>
    </div>
  );

  // 视图 1: 服务浏览
  const renderBrowse = () => (
    <div className="view-browse">
      {/* 搜索区 */}
      <div className="search-hero">
        <div className="sh-label">M03 · 服务市场</div>
        <h1 className="sh-title">发现<em>人机协作</em>的最优服务者</h1>
        <div className="search-box">
          <input 
            placeholder="搜索技能服务…支持模糊匹配与语义搜索"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="search-btn">🔍 智能搜索</button>
        </div>
      </div>

      {/* 筛选和内容 */}
      <div className="order-wrap">
        <aside className="filter-sidebar">
          <div className="filter-section">
            <div className="filter-head">服务类型</div>
            <div className="filter-body">
              {['全部', '机器人服务', '人工服务', '混合服务'].map(type => (
                <div 
                  key={type}
                  className={`filter-chip ${filterType === type ? 'on' : ''}`}
                  onClick={() => setFilterType(type)}
                >
                  {type}
                </div>
              ))}
            </div>
          </div>
          <div className="filter-section">
            <div className="filter-head">价格区间 (¥/h)</div>
            <div className="filter-body">
              <input type="number" placeholder="最低" className="price-input" defaultValue={0} />
              <span>—</span>
              <input type="number" placeholder="最高" className="price-input" defaultValue={600} />
            </div>
          </div>
        </aside>

        <main className="service-main">
          <div className="sort-bar">
            <span className="result-count">共 {MOCK_SERVICES.length} 个服务</span>
            <div className="sort-pills">
              <button className="pill on">综合排序</button>
              <button className="pill">销量优先</button>
              <button className="pill">价格 ↑</button>
            </div>
          </div>

          <div className="section-label">🔥 热门推荐</div>
          <div className="cards-grid">
            {MOCK_SERVICES.filter(s => s.isHot).map(renderServiceCard)}
          </div>

          <div className="section-label">✨ 全部服务</div>
          <div className="cards-grid">
            {MOCK_SERVICES.map(renderServiceCard)}
          </div>
        </main>
      </div>
    </div>
  );

  // 视图 2: 服务详情
  const renderDetail = () => {
    if (!selectedService) return null;
    
    return (
      <div className="view-detail">
        <button className="back-btn" onClick={() => navigateTo('browse')}>← 返回服务市场</button>
        <div className="detail-layout">
          <div className="detail-main">
            <div className="detail-media">{selectedService.icon}</div>
            <div className="detail-card">
              <div className="tags-row">
                <span className="tag tag-pine">机器人服务</span>
                <span className="tag tag-gold">平台认证</span>
              </div>
              <h1 className="detail-title">{selectedService.name}</h1>
              <div className="detail-meta">
                ⭐ <strong>{selectedService.rating}</strong> ({selectedService.reviewCount}条评价)
              </div>
              <p className="detail-desc">{selectedService.description}</p>
              
              <div className="section-label">套餐对比</div>
              <div className="pkg-grid">
                {PACKAGES.map(pkg => (
                  <div 
                    key={pkg.type}
                    className={`pkg-card ${selectedPackage.type === pkg.type ? 'sel' : ''}`}
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    {pkg.type === 'PRO' && <div className="pkg-rec">推荐</div>}
                    <div className="pkg-tier">{pkg.name}</div>
                    <div className="pkg-price">¥{pkg.price}<em>/h</em></div>
                    <ul className="pkg-feats">
                      {pkg.features.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="order-sidebar">
            <div className="os-header">
              <div className="os-label">当前套餐</div>
              <div className="os-price">¥{selectedPackage.price}</div>
              <div className="os-unit">/ 小时 · {selectedPackage.name}</div>
            </div>
            <div className="os-body">
              <button className="btn-pine btn-full" onClick={() => navigateTo('chat')}>
                💬 先与服务者沟通
              </button>
              <button className="btn-ink btn-full" onClick={() => navigateTo('order')}>
                立即下单 →
              </button>
            </div>
          </aside>
        </div>
      </div>
    );
  };

  // 主渲染
  return (
    <div className="order-service">
      {renderStepNav()}
      {currentView === 'browse' && renderBrowse()}
      {currentView === 'detail' && renderDetail()}
      {currentView === 'share' && <div className="view-placeholder">分享&收藏视图</div>}
      {currentView === 'chat' && <div className="view-placeholder">沟通聊天视图</div>}
      {currentView === 'order' && <div className="view-placeholder">创建订单视图</div>}
      {currentView === 'pay' && <div className="view-placeholder">订单支付视图</div>}
      {currentView === 'track' && <div className="view-placeholder">订单跟踪视图</div>}
      {currentView === 'favs' && <div className="view-placeholder">我的收藏视图</div>}
    </div>
  );
}

export default OrderService;

  // 视图 3: 分享&收藏
  const renderShare = () => {
    if (!selectedService) return null;
    
    return (
      <div className="view-share">
        <button className="back-btn" onClick={() => navigateTo('detail')}>← 返回服务详情</button>
        <div className="share-layout">
          {/* 分享 */}
          <div className="card share-card">
            <div className="card-head">
              <div className="card-head-title">服务分享 · F03-07</div>
              <div className="card-head-mono">生成分享链接或卡片</div>
            </div>
            <div className="card-body">
              <p className="share-desc">将该服务分享给朋友或同事，通过链接或专属卡片形式。</p>
              
              <div className="share-methods">
                {[
                  { icon: '💚', label: '微信好友', color: '#07c160' },
                  { icon: '📱', label: '微信群组', color: '#07c160' },
                  { icon: '🔵', label: '微博', color: '#e6162d' },
                  { icon: '🔗', label: '复制链接', color: '#1A1916' },
                ].map((method, i) => (
                  <button 
                    key={i} 
                    className="share-method"
                    onClick={() => alert(`已生成${method.label}分享`)}
                  >
                    <span className="share-method-icon">{method.icon}</span>
                    <span className="share-method-label">{method.label}</span>
                  </button>
                ))}
              </div>

              <div className="section-label">分享链接</div>
              <div className="share-link-row">
                <input 
                  className="share-link-input" 
                  readOnly 
                  value={`https://rsp.ai/s/${selectedService.id}?ref=share`}
                />
                <button 
                  className="copy-btn"
                  onClick={() => alert('链接已复制到剪贴板')}
                >
                  复制
                </button>
              </div>

              {/* 分享卡片预览 */}
              <div className="share-card-preview">
                <div className="scp-header">
                  <span className="scp-icon">{selectedService.icon}</span>
                  <div className="scp-info">
                    <div className="scp-name">{selectedService.name}</div>
                    <div className="scp-sub">{selectedService.sellerName} · ⭐{selectedService.rating}</div>
                  </div>
                </div>
                <div className="scp-footer">
                  <span className="scp-url">rsp.ai/s/{selectedService.id}</span>
                  <span className="scp-price">¥{selectedService.basePrice}/h 起</span>
                </div>
              </div>
            </div>
          </div>

          {/* 收藏 */}
          <div className="card fav-card">
            <div className="card-head">
              <div className="card-head-title">服务收藏 · F03-06</div>
              <div className="card-head-mono">收藏感兴趣的服务</div>
            </div>
            <div className="card-body">
              <p className="share-desc">收藏服务后可在「我的收藏」列表中随时查看。</p>

              <div className="fav-current">
                <div className="fav-service-row">
                  <span className="fav-icon">{selectedService.icon}</span>
                  <div className="fav-info">
                    <div className="fav-name">{selectedService.name}</div>
                    <div className="fav-tags">
                      {selectedService.tags.map((tag, i) => (
                        <span key={i} className={`tag tag-${i === 0 ? 'pine' : 'gold'}`}>{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="fav-price">¥{selectedService.basePrice}<span>/h 起</span></div>
                </div>
                <div className="fav-actions">
                  <button 
                    className={`btn-fav ${favorites.includes(selectedService.id) ? 'on' : ''}`}
                    onClick={() => toggleFavorite(selectedService.id)}
                  >
                    {favorites.includes(selectedService.id) ? '♥ 已收藏' : '♡ 收藏此服务'}
                  </button>
                  <button className="btn-ghost" onClick={() => navigateTo('favs')}>
                    查看收藏列表 →
                  </button>
                </div>
              </div>

              <div className="section-label">我的收藏预览</div>
              <div className="fav-preview-list">
                {favorites.length > 0 ? (
                  favorites.slice(0, 3).map(id => {
                    const s = MOCK_SERVICES.find(x => x.id === id);
                    if (!s) return null;
                    return (
                      <div key={id} className="fav-preview-item">
                        <span className="fav-p-icon">{s.icon}</span>
                        <div className="fav-p-info">
                          <div className="fav-p-name">{s.name}</div>
                          <div className="fav-p-meta">¥{s.basePrice}/h · {s.sellerName}</div>
                        </div>
                        <button 
                          className="fav-p-btn"
                          onClick={() => toggleFavorite(id)}
                        >
                          ♥
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="empty-fav">暂无收藏，浏览服务后点击 ♡ 收藏</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="share-actions">
          <button className="btn-pine" onClick={() => navigateTo('chat')}>
            继续：与服务者沟通 →
          </button>
          <button className="btn-ghost" onClick={() => navigateTo('order')}>
            跳过沟通，直接下单
          </button>
        </div>
      </div>
    );
  };

  // 视图 4: 沟通聊天
  const renderChat = () => {
    const [messages, setMessages] = useState([
      { id: 1, type: 'theirs', text: '您好！我是 DataBot Pro，专注数据分析与可视化报告。请问您需要分析什么类型的数据？', time: '09:30' },
      { id: 2, type: 'mine', text: '我们电商平台有近半年的销售数据，大概 50 万行，想做销售趋势分析和品类对比报告。', time: '09:31' },
      { id: 3, type: 'theirs', text: '明白！50 万行数据完全没问题。我可以为您提供：\n\n① 月度/周度销售趋势图\n② 品类销售占比与环比对比\n③ Top 商品排行与库存预警\n④ 客单价与转化率分析\n\n建议选择「专业版」套餐，预计 25-35 分钟完成报告。', time: '09:32' },
    ]);
    const [inputText, setInputText] = useState('');

    const sendMessage = () => {
      if (!inputText.trim()) return;
      setMessages([...messages, { id: messages.length + 1, type: 'mine', text: inputText, time: '刚刚' }]);
      setInputText('');
      setTimeout(() => {
        setMessages(prev => [...prev, { id: prev.length + 1, type: 'theirs', text: '收到！如需进一步了解或直接下单，点击右上角「下单」按钮即可。', time: '刚刚' }]);
      }, 800);
    };

    return (
      <div className="view-chat">
        <div className="chat-wrap">
          {/* 聊天主区域 */}
          <div className="chat-main">
            <div className="chat-top">
              <div className="chat-contact">
                <div className="avatar avatar-lg">DB</div>
                <div className="online-dot"></div>
                <div>
                  <div className="ct-name">DataBot Pro</div>
                  <div className="ct-sub">认证机器人 · 在线 · 均响应 8min</div>
                </div>
              </div>
              <div className="chat-top-btns">
                <button className="btn-ghost btn-sm" onClick={() => navigateTo('share')}>分享</button>
                <button className="btn-ghost btn-sm" onClick={() => toggleFavorite(selectedService?.id || '')}>
                  {favorites.includes(selectedService?.id || '') ? '♥ 收藏' : '♡ 收藏'}
                </button>
                <button className="btn-pine btn-sm" onClick={() => navigateTo('order')}>下单 →</button>
              </div>
            </div>

            <div className="chat-msgs">
              {messages.map(msg => (
                <div key={msg.id} className={`msg ${msg.type}`}>
                  <div className={`msg-av ${msg.type === 'mine' ? 'me' : 'seller'}`}>
                    {msg.type === 'mine' ? '我' : 'DB'}
                  </div>
                  <div className="msg-content">
                    <div className="msg-bbl">{msg.text}</div>
                    <div className="msg-t">{msg.time}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="chat-input-wrap">
              <button className="svc-menu-btn" title="智能服务菜单">⊕</button>
              <textarea 
                className="chat-ta"
                placeholder="描述需求或提问…Enter 发送，Shift+Enter 换行"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                rows={1}
              />
              <button className="send-btn" onClick={sendMessage}>发送</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 视图 5: 创建订单
  const renderOrder = () => {
    const [hours, setHours] = useState(2);
    const unitPrice = selectedPackage.price;
    const subtotal = unitPrice * hours;
    const serviceFee = subtotal * 0.1;
    const total = subtotal + serviceFee;

    return (
      <div className="view-order">
        <button className="back-btn" onClick={() => navigateTo('detail')}>← 返回服务详情</button>
        
        <div className="order-header">
          <div className="page-eyebrow">第 5 步 · 创建订单</div>
          <h1 className="page-title">确认订单信息</h1>
          <p className="page-sub">请核对服务信息并填写需求说明</p>
        </div>

        <div className="order-layout">
          <div className="order-main">
            {/* 服务信息 */}
            <div className="card">
              <div className="card-head"><div className="card-head-title">服务信息</div></div>
              <div className="card-body">
                <div className="service-summary">
                  <span className="ss-icon">{selectedService?.icon}</span>
                  <div className="ss-info">
                    <div className="ss-name">{selectedService?.name}</div>
                    <div className="ss-tags">
                      <span className="tag tag-pine">{selectedPackage.name}</span>
                      <span className="tag tag-gold">平台认证</span>
                    </div>
                  </div>
                  <div className="ss-price">¥{unitPrice}<span>/小时</span></div>
                </div>
              </div>
            </div>

            {/* 需求说明 */}
            <div className="card">
              <div className="card-head"><div className="card-head-title">需求说明</div></div>
              <div className="card-body">
                <div className="field">
                  <label className="field-label">项目标题</label>
                  <input className="input" defaultValue="2024 年 H1 电商销售数据分析报告" />
                </div>
                <div className="field">
                  <label className="field-label">详细需求描述</label>
                  <textarea className="textarea" defaultValue="数据为近半年（2024.01-06）的电商平台销售记录，约 50 万行，CSV 格式。需要输出：月度销售趋势图、品类对比分析、Top50 商品排行、客单价分布图。最终交付交互式 Dashboard 和 PDF 报告各一份。" />
                </div>
                <div className="field-row">
                  <div className="field">
                    <label className="field-label">预期交付时间</label>
                    <select className="select">
                      <option>1 小时内（加急）</option>
                      <option selected>2-4 小时</option>
                      <option>当天内</option>
                    </select>
                  </div>
                  <div className="field">
                    <label className="field-label">预估工时（小时）</label>
                    <input 
                      className="input" 
                      type="number" 
                      value={hours}
                      onChange={(e) => setHours(Number(e.target.value))}
                      min={1}
                      max={100}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 订单摘要 */}
          <aside className="order-sum-sidebar">
            <div className="order-sum">
              <div className="osum-head">
                <div className="osum-label">订单摘要</div>
                <div className="osum-name">{selectedService?.name} · {selectedPackage.name}</div>
              </div>
              <div className="osum-body">
                <div className="osum-row"><span className="osum-k">单价</span><span className="osum-v">¥{unitPrice} / 小时</span></div>
                <div className="osum-row"><span className="osum-k">预估工时</span><span className="osum-v">{hours} 小时</span></div>
                <div className="osum-row"><span className="osum-k">小计</span><span className="osum-v">¥{subtotal.toFixed(2)}</span></div>
                <div className="osum-row"><span className="osum-k">平台服务费 (10%)</span><span className="osum-v">¥{serviceFee.toFixed(2)}</span></div>
                <div className="coupon-row">
                  <input className="coupon-in" placeholder="优惠券码" />
                  <button className="coupon-apply">使用</button>
                </div>
                <div className="osum-total">
                  <span className="osum-total-l">预付总计</span>
                  <span className="osum-total-r">¥{total.toFixed(2)}</span>
                </div>
                <div className="info-box-pine">✓ 资金托管保障：验收通过后款项释放，争议可申请 AI 仲裁</div>
                <button className="btn-pine btn-full btn-lg" onClick={() => navigateTo('pay')}>
                  确认下单 · 去支付 →
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  };

  // 视图 6: 订单支付
  const renderPay = () => {
    const [payMethod, setPayMethod] = useState('balance');
    const total = selectedPackage.price * 2 * 1.1; // 2 小时 + 10% 服务费

    return (
      <div className="view-pay">
        <button className="back-btn" onClick={() => navigateTo('order')}>← 返回修改订单</button>
        
        <div className="order-header">
          <div className="page-eyebrow">第 6 步 · 订单支付</div>
          <h1 className="page-title">完成支付</h1>
          <p className="page-sub">订单号 ORD-2026-031 · 请在 <strong style={{color:'#C75B00'}}>14:58</strong> 内完成支付</p>
        </div>

        <div className="order-layout">
          <div className="pay-main">
            <div className="card">
              <div className="card-head"><div className="card-head-title">选择支付方式</div></div>
              <div className="card-body">
                <div className="pay-methods">
                  {[
                    { id: 'balance', icon: '💰', name: '平台余额', sub: '余额 ¥1,842.50' },
                    { id: 'alipay', icon: '💙', name: '支付宝', sub: '扫码 / 账号' },
                    { id: 'wechat', icon: '💚', name: '微信支付', sub: '扫码 / 小程序' },
                  ].map(method => (
                    <div 
                      key={method.id}
                      className={`pay-method-card ${payMethod === method.id ? 'sel' : ''}`}
                      onClick={() => setPayMethod(method.id)}
                    >
                      <div className="pm-icon">{method.icon}</div>
                      <div className="pm-name">{method.name}</div>
                      <div className="pm-sub">{method.sub}</div>
                    </div>
                  ))}
                </div>

                <div className="pay-info-box">
                  <span>当前余额 <strong>¥1,842.50</strong>，支付后剩余 <strong>¥{ (1842.50 - total).toFixed(2) }</strong></span>
                  <button className="btn-ghost btn-sm">充值</button>
                </div>

                <div className="pay-breakdown">
                  <div className="pb-row"><span className="pb-k">服务费（预估 2h × ¥{selectedPackage.price}）</span><span className="pb-v">¥{(selectedPackage.price * 2).toFixed(2)}</span></div>
                  <div className="pb-row"><span className="pb-k">平台服务费（10%）</span><span className="pb-v">¥{(selectedPackage.price * 2 * 0.1).toFixed(2)}</span></div>
                  <div className="pb-row"><span className="pb-k">优惠券抵扣</span><span className="pb-v" style={{color:'#1B5E52'}}>−¥0.00</span></div>
                  <div className="pb-divider"></div>
                  <div className="pb-total"><span>实付金额</span><span className="pb-total-v">¥{total.toFixed(2)}</span></div>
                </div>

                <button 
                  className="pay-confirm-btn"
                  onClick={() => { alert('支付成功！'); navigateTo('track'); }}
                >
                  确认支付 ¥{total.toFixed(2)}
                </button>
                <div className="security-note">🔒 资金由平台托管 · SSL 加密 · 随时可退款</div>
              </div>
            </div>
          </div>

          <aside className="pay-sidebar">
            <div className="pay-confirm-card">
              <div className="pcc-head">
                <div className="pcc-label">订单确认</div>
                <div className="pcc-svc">
                  <span className="pcc-icon">{selectedService?.icon}</span>
                  <div className="pcc-info">
                    <div className="pcc-name">{selectedService?.name}</div>
                    <div className="pcc-sub">{selectedPackage.name} · {selectedService?.sellerName}</div>
                  </div>
                </div>
              </div>
              <div className="pcc-body">
                <div className="pcc-row"><span className="pcc-k">订单号</span><span className="pcc-v">ORD-2026-031</span></div>
                <div className="pcc-row"><span className="pcc-k">服务者</span><span className="pcc-v">{selectedService?.sellerName}</span></div>
                <div className="pcc-row"><span className="pcc-k">预估工时</span><span className="pcc-v">2 小时</span></div>
                <div className="pcc-row"><span className="pcc-k">计费方式</span><span className="pcc-v">实时计费 / 6 秒</span></div>
              </div>
              <div className="pcc-total">
                <div className="pcc-total-l">实付总计</div>
                <div className="pcc-total-r">¥{total.toFixed(2)}</div>
              </div>
            </div>
            <div className="info-box-amber">
              ⏱ 支付后服务者将在 <strong>15 分钟内</strong> 开始执行，请保持消息畅通
            </div>
          </aside>
        </div>
      </div>
    );
  };

  // 视图 7: 订单跟踪
  const renderTrack = () => {
    const [elapsed, setElapsed] = useState(0);
    const [cost, setCost] = useState(0);
    const RATE = selectedPackage.price / 3600; // 每秒费率

    useEffect(() => {
      const timer = setInterval(() => {
        setElapsed(e => e + 1);
        setCost(c => c + RATE);
      }, 1000);
      return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    return (
      <div className="view-track">
        <div className="track-header">
          <div>
            <div className="page-eyebrow">第 7 步 · 订单详情跟踪</div>
            <h1 className="page-title">ORD-2026-031</h1>
            <p className="page-sub">{selectedService?.name} · {selectedPackage.name} · {selectedService?.sellerName}</p>
          </div>
          <div className="track-actions">
            <button className="btn-ghost" onClick={() => navigateTo('chat')}>💬 联系服务者</button>
            <button className="btn-ghost danger" onClick={() => alert('仲裁申请已提交')}>申请仲裁</button>
          </div>
        </div>

        {/* 状态栏 */}
        <div className="status-bar">
          <div className="status-badge">● 执行中</div>
          <div className="sb-item">
            <div className="sb-val pine">¥{cost.toFixed(2)}</div>
            <div className="sb-label">当前费用</div>
          </div>
          <div className="sb-item">
            <div className="sb-val">{formatTime(elapsed)}</div>
            <div className="sb-label">累计工时</div>
          </div>
          <div className="sb-item">
            <div className="sb-val">¥{(selectedPackage.price * 2 * 1.1).toFixed(2)}</div>
            <div className="sb-label">预付金额</div>
          </div>
        </div>

        <div className="track-layout">
          <div className="track-main">
            {/* 进度时间线 */}
            <div className="card">
              <div className="card-head"><div className="card-head-title">订单进度</div></div>
              <div className="timeline">
                {[
                  { icon: '✓', title: '订单创建 & 支付成功', desc: '预付款 ¥836.00 已进入平台托管账户', time: '2026-03-08 09:34:22', done: true },
                  { icon: '✓', title: '服务者接单', desc: 'DataBot Pro 已接受订单，开始准备处理环境', time: '2026-03-08 09:38:05', done: true },
                  { icon: '⚙', title: '服务执行中', desc: '正在处理您的数据，每 6 秒自动记录工时并扣费。当前进度：数据清洗完成，正在生成可视化图表…', time: '进行中', cur: true },
                  { icon: '4', title: '提交交付物', desc: '服务者上传完成的报告文件', time: '' },
                  { icon: '5', title: '客户验收', desc: '您确认验收后，款项自动结算', time: '' },
                  { icon: '6', title: '双向评价', desc: '完成后对服务质量进行评价', time: '' },
                ].map((step, i) => (
                  <div key={i} className="tl-item">
                    <div className="tl-left">
                      <div className={`tl-dot ${step.done ? 'done' : ''} ${step.cur ? 'cur' : ''}`}>{step.icon}</div>
                      {i < 5 && <div className={`tl-line ${step.done ? 'done' : ''}`}></div>}
                    </div>
                    <div className="tl-content">
                      <div className={`tl-title ${!step.done && !step.cur ? 'done-text' : ''}`}>{step.title}</div>
                      <div className={`tl-desc ${!step.done && !step.cur ? 'done-text' : ''}`}>{step.desc}</div>
                      {step.time && <div className="tl-time">{step.time}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 交付物验收 */}
            <div className="card">
              <div className="card-head"><div className="card-head-title">交付物验收</div></div>
              <div className="card-body">
                <div className="upload-zone">
                  <div className="uz-icon">📁</div>
                  <div className="uz-text">等待服务者上传交付物</div>
                  <div className="uz-sub">服务完成后自动显示下载链接</div>
                </div>
                <div className="verdict-pair">
                  <button className="btn-accept" onClick={() => alert('验收成功！款项已结算')}>✓ 确认验收</button>
                  <button className="btn-request" onClick={() => alert('修改意见已提交')}>提出修改</button>
                </div>
              </div>
            </div>
          </div>

          <aside className="track-sidebar">
            {/* 实时计费 */}
            <div className="billing-widget">
              <div className="bw-eyebrow">实时扣费 · 每 6 秒计费一次</div>
              <div className="bw-amount"><em>¥</em>{cost.toFixed(2)}</div>
              <div className="bw-rate">¥{selectedPackage.price}/h · ¥{(selectedPackage.price/60).toFixed(3)}/分钟</div>
              <div className="bw-grid">
                <div className="bw-cell"><div className="bwc-l">工时</div><div className="bwc-v">{formatTime(elapsed)}</div></div>
                <div className="bw-cell"><div className="bwc-l">余额</div><div className="bwc-v">¥1,006</div></div>
              </div>
              <div className="bw-bar"><div className="bw-bar-fill"></div></div>
            </div>

            {/* 服务者信息 */}
            <div className="card">
              <div className="card-head"><div className="card-head-title">服务者信息</div></div>
              <div className="card-body">
                <div className="seller-row">
                  <div className="avatar avatar-md">DB</div>
                  <div className="online-dot"></div>
                  <div>
                    <div className="seller-name">{selectedService?.sellerName}</div>
                    <div className="seller-sub">认证机器人 · 平均响应 8min</div>
                  </div>
                </div>
                <div className="seller-stats">
                  <div className="ss-row"><span className="ss-k">历史订单</span><span className="ss-v">1,240 个</span></div>
                  <div className="ss-row"><span className="ss-k">综合评分</span><span className="ss-v">⭐ 4.9</span></div>
                  <div className="ss-row"><span className="ss-k">验收通过率</span><span className="ss-v pine">99.2%</span></div>
                </div>
                <button className="btn-pine btn-full btn-sm" onClick={() => navigateTo('chat')}>💬 发消息</button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  };

  // 视图 8: 我的收藏
  const renderFavs = () => {
    const favServices = MOCK_SERVICES.filter(s => favorites.includes(s.id));

    return (
      <div className="view-favs">
        <div className="favs-header">
          <div>
            <div className="page-eyebrow">F03-06 · 服务收藏</div>
            <h1 className="page-title">我的收藏</h1>
            <p className="page-sub">收藏感兴趣的服务，随时快速下单</p>
          </div>
          <button className="btn-ghost" onClick={() => navigateTo('browse')}>浏览更多服务</button>
        </div>

        {favServices.length > 0 ? (
          <div className="cards-grid">
            {favServices.map(renderServiceCard)}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🔖</div>
            <div className="empty-title">暂无收藏服务</div>
            <div className="empty-sub">浏览服务市场，点击 ♡ 收藏感兴趣的服务</div>
            <button className="btn-pine" onClick={() => navigateTo('browse')}>去浏览服务</button>
          </div>
        )}
      </div>
    );
  };

  // 主渲染
  return (
    <div className="order-service">
      {renderStepNav()}
      {currentView === 'browse' && renderBrowse()}
      {currentView === 'detail' && renderDetail()}
      {currentView === 'share' && renderShare()}
      {currentView === 'chat' && renderChat()}
      {currentView === 'order' && renderOrder()}
      {currentView === 'pay' && renderPay()}
      {currentView === 'track' && renderTrack()}
      {currentView === 'favs' && renderFavs()}
    </div>
  );
}

export default OrderService;
