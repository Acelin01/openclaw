/**
 * 技能服务管理页面 - React 版本
 */

import React, { useState } from 'react';
import { CreateServiceDrawer } from '../components/CreateServiceDrawer';
import { Toast } from '../components/Toast';
import './SkillService.css';

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  type: 'robot' | 'manual' | 'hybrid';
  status: 'online' | 'offline' | 'reviewing';
  coverStyle: string;
  emoji: string;
  tags: string[];
  packages: Array<{ name: string; price: number; unit: string; desc: string }>;
  stats: { views: number; favorites: number; orders: number; rating: number };
  robotInfo?: { name: string; version: string; autoAccept: boolean };
  certified: boolean;
  selectedPkg: number;
}

interface ToastState {
  type: 'success' | 'info' | 'error';
  title: string;
  message?: string;
}

export const SkillService: React.FC = () => {
  const [services, setServices] = useState<Service[]>([
    {
      id: '1',
      name: '全栈开发智能助手',
      description: 'React / Node.js / TypeScript 全栈开发，接入 OpenClaw 机器人，支持自动承接标准化开发任务，响应 < 2 分钟。',
      category: '开发',
      type: 'robot',
      status: 'online',
      coverStyle: 'blue',
      emoji: '🤖',
      tags: ['React', 'TypeScript', 'Node.js', 'API 集成', '全栈'],
      packages: [
        { name: '基础版', price: 90, unit: '/h', desc: '基础功能开发' },
        { name: '升级版', price: 120, unit: '/h', desc: '含代码审查' },
        { name: '高级版', price: 150, unit: '/h', desc: '架构设计 + 全程支持' },
      ],
      stats: { views: 1284, favorites: 47, orders: 23, rating: 98 },
      robotInfo: { name: 'DataBot', version: '2.1', autoAccept: true },
      certified: true,
      selectedPkg: 0,
    },
    {
      id: '2',
      name: 'UI/UX 设计与交付',
      description: 'Figma 原型、交互稿、视觉规范输出。擅长 SaaS 后台与移动端产品设计，可接受精细化需求迭代。',
      category: '设计',
      type: 'manual',
      status: 'online',
      coverStyle: 'green',
      emoji: '🎨',
      tags: ['Figma', '交互设计', '组件库', '设计规范', '品牌 VI'],
      packages: [
        { name: '基础版', price: 200, unit: '', desc: '单页面设计' },
        { name: '升级版', price: 500, unit: '', desc: '完整原型' },
        { name: '高级版', price: 1200, unit: '', desc: '全套设计规范' },
      ],
      stats: { views: 856, favorites: 31, orders: 12, rating: 100 },
      certified: true,
      selectedPkg: 1,
    },
    {
      id: '3',
      name: '数据分析与可视化',
      description: 'Python / ECharts / Tableau 数据分析，擅长销售、用户行为、运营指标类数据清洗与可视化报告产出。',
      category: '数据',
      type: 'hybrid',
      status: 'reviewing',
      coverStyle: 'purple',
      emoji: '📊',
      tags: ['Python', 'ECharts', '数据清洗', '报表'],
      packages: [
        { name: '基础版', price: 80, unit: '/h', desc: '数据整理' },
        { name: '升级版', price: 100, unit: '/h', desc: '可视化报告' },
        { name: '高级版', price: 130, unit: '/h', desc: '深度分析 + 建议' },
      ],
      stats: { views: 0, favorites: 0, orders: 0, rating: 0 },
      selectedPkg: 1,
    },
  ]);

  const [currentFilter, setCurrentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const filteredServices = services.filter(s => {
    if (currentFilter !== 'all' && s.status !== currentFilter) return false;
    if (searchQuery && !s.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const showToast = (type: 'success' | 'info' | 'error', title: string, message?: string) => {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setDrawerVisible(true);
  };

  const handleCreateService = (formData: any) => {
    const newService: Service = {
      id: String(Date.now()),
      name: formData.name,
      description: formData.description,
      category: formData.category,
      type: formData.type,
      status: 'reviewing',
      coverStyle: formData.coverStyle,
      emoji: formData.emoji,
      tags: formData.tags,
      packages: formData.packages,
      stats: { views: 0, favorites: 0, orders: 0, rating: 0 },
      robotInfo: formData.type === 'robot' || formData.type === 'hybrid' 
        ? { name: 'DataBot', version: '2.1', autoAccept: true }
        : undefined,
      certified: false,
      selectedPkg: 1,
    };
    setServices([newService, ...services]);
    setDrawerVisible(false);
    setEditingService(null);
    showToast('success', '已提交 AI 审核', `${formData.name} 预计 2-4 小时完成审核`);
  };

  const handleUpdateService = (formData: any) => {
    setServices(services.map(s => {
      if (s.id === editingService?.id) {
        return {
          ...s,
          name: formData.name,
          description: formData.description,
          category: formData.category,
          type: formData.type,
          status: 'reviewing',
          coverStyle: formData.coverStyle,
          emoji: formData.emoji,
          tags: formData.tags,
          packages: formData.packages,
          robotInfo: formData.type === 'robot' || formData.type === 'hybrid' 
            ? { name: 'DataBot', version: '2.1', autoAccept: true }
            : undefined,
        };
      }
      return s;
    }));
    setDrawerVisible(false);
    setEditingService(null);
    showToast('success', '已提交重新审核', `${formData.name} 预计 2-4 小时完成审核`);
  };

  const handleToggleService = (id: string) => {
    setServices(services.map(s => {
      if (s.id === id) {
        const newStatus = s.status === 'online' ? 'offline' : 'online';
        showToast('info', '状态已更新', s.name);
        return { ...s, status: newStatus };
      }
      return s;
    }));
  };

  const handleCopyService = (id: string) => {
    const service = services.find(s => s.id === id);
    if (service) {
      showToast('success', '服务已复制', `基于「${service.name}」创建了新草稿`);
    }
  };

  const confirmDelete = (id: string) => {
    setPendingDeleteId(id);
    setDeleteModalVisible(true);
  };

  const executeDelete = () => {
    if (pendingDeleteId) {
      setServices(services.filter(s => s.id !== pendingDeleteId));
      setDeleteModalVisible(false);
      setPendingDeleteId(null);
      showToast('success', '服务已删除', '已从平台移除');
    }
  };

  return (
    <div className="skill-service-page">
      {/* 侧边栏 */}
      <nav className="sidenav">
        <div className="sidenav-brand">
          <div className="brand-icon">🤖</div>
          <div className="brand-name">
            技能共享平台
            <small>自由职业者后台</small>
          </div>
        </div>

        <div className="sidenav-section">
          <div className="sidenav-label">工作台</div>
          <div className="nav-item active">
            <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.7">
              <path d="M2 4h12M2 8h8M2 12h5" strokeLinecap="round"/>
            </svg>
            技能服务
            <span className="nav-badge green">3</span>
          </div>
          <div className="nav-item">
            <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.7">
              <rect x="3" y="2" width="10" height="12" rx="1"/>
              <path d="M5 6h6M5 9h4" strokeLinecap="round"/>
            </svg>
            订单管理
            <span className="nav-badge">2</span>
          </div>
          <div className="nav-item">
            <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.7">
              <rect x="3" y="5" width="10" height="8" rx="2"/>
              <path d="M6 5V3.5a2 2 0 0 1 4 0V5" strokeLinecap="round"/>
              <circle cx="6" cy="9" r="1" fill="currentColor"/>
              <circle cx="10" cy="9" r="1" fill="currentColor"/>
            </svg>
            机器人管理
          </div>
        </div>

        <div className="sidenav-section">
          <div className="sidenav-label">财务</div>
          <div className="nav-item">
            <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.7">
              <path d="M8 2v12M5 7l3 3 3-3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            收益结算
          </div>
          <div className="nav-item">
            <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.7">
              <circle cx="8" cy="8" r="6"/>
              <path d="M8 5v3l2 2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            工时记录
          </div>
        </div>

        <div className="sidenav-section">
          <div className="sidenav-label">账号</div>
          <div className="nav-item">
            <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.7">
              <path d="M8 1l1.8 3.6 4 .6-2.9 2.8.7 4L8 10l-3.6 2 .7-4L2.2 5.2l4-.6Z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            认证中心
          </div>
          <div className="nav-item">
            <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.7">
              <circle cx="8" cy="8" r="2.5"/>
              <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" strokeLinecap="round"/>
            </svg>
            账号设置
          </div>
        </div>

        <div className="sidenav-footer">
          <div className="user-card">
            <div className="user-avatar">陈</div>
            <div className="user-info">
              <div className="user-name">陈振宇</div>
              <div className="user-role">认证自由职业者 ⭐4.9</div>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <div className="main">
        {/* 顶部栏 */}
        <header className="topbar">
          <div className="topbar-title">
            <span className="breadcrumb">工作台</span>
            <span className="sep">/</span>
            技能服务管理
          </div>
          <button className="btn btn-ghost">
            <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.7" width="14" height="14">
              <path d="M8 2v8M5 7l3 3 3-3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            导出报表
          </button>
          <button className="btn btn-ghost">
            <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.7" width="14" height="14">
              <path d="M8 2v8M5 7l3 3 3-3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            导出报表
          </button>
          <button className="btn btn-primary" onClick={() => setDrawerVisible(true)}>
            <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <path d="M8 2v12M2 8h12" strokeLinecap="round"/>
            </svg>
            创建服务
          </button>
        </header>

        {/* 页面主体 */}
        <div className="page-body">
          {/* 统计卡片 */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-label">
                <svg fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.7">
                  <path d="M2 3h10M2 7h7M2 11h5" strokeLinecap="round"/>
                </svg>
                服务总数
              </div>
              <div className="stat-val">3</div>
              <div className="stat-sub">
                <span className="up">↑ 1</span> 较上月
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">
                <svg fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.7">
                  <circle cx="7" cy="7" r="5"/>
                  <path d="M7 4v3l2 2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                本月成交
              </div>
              <div className="stat-val">18</div>
              <div className="stat-sub">
                <span className="up">↑ 23%</span> 较上月
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">
                <svg fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.7">
                  <path d="M2 12V5l5-3 5 3v7H9V8H5v4H2Z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                累计收益
              </div>
              <div className="stat-val" style={{fontSize: '22px'}}>¥28,640</div>
              <div className="stat-sub">
                <span className="up">↑ ¥4,200</span> 本月新增
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">
                <svg fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.7">
                  <path d="M7 1l1.5 3 3.5.5-2.5 2.5.5 3.5L7 9l-3 1.5.5-3.5L2 4.5 5.5 4Z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                综合好评率
              </div>
              <div className="stat-val">97.8%</div>
              <div className="stat-sub">
                <span className="up">Top 5%</span> 平台排名
              </div>
            </div>
          </div>

          {/* 筛选栏 */}
          <div className="filter-bar">
            <div className="search-box">
              <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.8">
                <circle cx="7" cy="7" r="5"/>
                <path d="m12 12 3 3" strokeLinecap="round"/>
              </svg>
              <input 
                placeholder="搜索服务名称或标签..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="filter-sep"/>
            <div className="filter-group">
              <button 
                className={`filter-chip ${currentFilter === 'all' ? 'active' : ''}`}
                onClick={() => setCurrentFilter('all')}
              >
                全部
              </button>
              <button 
                className={`filter-chip ${currentFilter === 'online' ? 'active' : ''}`}
                onClick={() => setCurrentFilter('online')}
              >
                已上架
              </button>
              <button 
                className={`filter-chip ${currentFilter === 'offline' ? 'active' : ''}`}
                onClick={() => setCurrentFilter('offline')}
              >
                已下架
              </button>
              <button 
                className={`filter-chip ${currentFilter === 'reviewing' ? 'active' : ''}`}
                onClick={() => setCurrentFilter('reviewing')}
              >
                审核中
              </button>
            </div>
            <div className="filter-sep"/>
            <select className="filter-select">
              <option>所有类型</option>
              <option>机器人服务</option>
              <option>人工服务</option>
              <option>混合服务</option>
            </select>
            <select className="filter-select">
              <option>排序：综合</option>
              <option>排序：成交量</option>
              <option>排序：价格↑</option>
              <option>排序：最新</option>
            </select>
            <div className="ml-auto" style={{display: 'flex', gap: '6px'}}>
              <button className="btn btn-ghost" style={{padding: '6px 10px'}}>
                <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.7" width="14" height="14">
                  <path d="M2 4h12M2 8h12M2 12h12" strokeLinecap="round"/>
                </svg>
              </button>
              <button className="btn btn-ghost" style={{padding: '6px 10px', color: 'var(--accent)', borderColor: 'var(--accent-border)', background: 'var(--accent-bg)'}}>
                <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.7" width="14" height="14">
                  <rect x="1" y="1" width="5" height="5" rx="1"/>
                  <rect x="10" y="1" width="5" height="5" rx="1"/>
                  <rect x="1" y="10" width="5" height="5" rx="1"/>
                  <rect x="10" y="10" width="5" height="5" rx="1"/>
                </svg>
              </button>
            </div>
          </div>

          {/* 服务网格 */}
          <div className="service-grid">
            {filteredServices.map(service => (
              <div key={service.id} className="service-card">
                <div className="card-cover">
                  <div className={`card-cover-bg ${service.coverStyle}`}/>
                  <div className="card-cover-pattern"/>
                  <div className="card-cover-emoji">{service.emoji}</div>
                  <div className={`card-status-badge ${service.status}`}>
                    <div className="card-status-dot"/>
                    {service.status === 'online' ? '已上架' : service.status === 'offline' ? '已下架' : 'AI 审核中'}
                  </div>
                  <div className="card-menu-btn">⋯</div>
                </div>

                <div className="card-body">
                  <div className="card-title">
                    {service.name}
                    {service.certified && <span className="cert-badge">✦ 认证</span>}
                  </div>

                  {service.robotInfo && (
                    <div className="robot-chip">
                      <svg fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.6">
                        <rect x="2" y="4" width="8" height="6" rx="1.5"/>
                        <path d="M4 4V3a2 2 0 0 1 4 0v1" strokeLinecap="round"/>
                        <circle cx="4.5" cy="7" r=".8" fill="currentColor"/>
                        <circle cx="7.5" cy="7" r=".8" fill="currentColor"/>
                      </svg>
                      {service.robotInfo.name} v{service.robotInfo.version} · 自动接单{service.robotInfo.autoAccept ? '已开启' : '已关闭'}
                    </div>
                  )}

                  {service.status === 'reviewing' && (
                    <>
                      <div style={{fontSize: '11.5px', color: '#b45309', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px', padding: '6px 10px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px'}}>
                        <svg fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.6" width="13" height="13">
                          <circle cx="7" cy="7" r="5.5"/>
                          <path d="M7 4v4M7 9.5v.5" strokeLinecap="round"/>
                        </svg>
                        服务修改后需重新 AI 审核，预计 2-4 小时完成
                      </div>
                      <div className="status-flow">
                        <div className="sf-step">
                          <div className="sf-dot done"/>
                          <div className="sf-label">提交</div>
                        </div>
                        <div className="sf-line done"/>
                        <div className="sf-step">
                          <div className="sf-dot active"/>
                          <div className="sf-label">AI 审核</div>
                        </div>
                        <div className="sf-line"/>
                        <div className="sf-step">
                          <div className="sf-dot"/>
                          <div className="sf-label">人工复核</div>
                        </div>
                        <div className="sf-line"/>
                        <div className="sf-step">
                          <div className="sf-dot"/>
                          <div className="sf-label">上架</div>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="card-desc">{service.description}</div>

                  <div className="tag-row">
                    {service.tags.slice(0, 5).map((tag, i) => (
                      <span key={i} className={`tag ${i < 2 ? 'accent' : ''}`}>{tag}</span>
                    ))}
                    {service.tags.length > 5 && <span className="tag">+{service.tags.length - 5}</span>}
                  </div>

                  <div className="packages">
                    {service.packages.map((pkg, i) => (
                      <div key={i} className={`pkg ${service.selectedPkg === i ? 'selected' : ''}`}>
                        <div className="pkg-name">{pkg.name}</div>
                        <div className="pkg-price">
                          ¥{pkg.price}
                          {pkg.unit ? <span className="pkg-unit">{pkg.unit}</span> : <div style={{fontSize: '9.5px', color: 'var(--text3)', textAlign: 'center', marginTop: '2px'}}>固定价</div>}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="card-stats">
                    <div className="cstat">
                      <div className="cstat-val">{service.stats.views || '—'}</div>
                      <div className="cstat-key">浏览量</div>
                    </div>
                    <div className="cstat">
                      <div className="cstat-val">{service.stats.favorites || '—'}</div>
                      <div className="cstat-key">收藏数</div>
                    </div>
                    <div className="cstat">
                      <div className="cstat-val">{service.stats.orders || '—'}</div>
                      <div className="cstat-key">成交单</div>
                    </div>
                    <div className="cstat">
                      <div className="cstat-val" style={{color: service.stats.rating ? '#10b981' : '#9ba3b8'}}>
                        {service.stats.rating ? service.stats.rating + '%' : '—'}
                      </div>
                      <div className="cstat-key">好评率</div>
                    </div>
                  </div>

                  {service.status !== 'reviewing' ? (
                    <div className="card-actions">
                      <button className="btn btn-ghost" onClick={() => handleEditService(service)}>
                        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                          <path d="M9 2l3 3-7 7H2V9L9 2Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        编辑
                      </button>
                      <button 
                        className="btn btn-ghost" 
                        style={{color: service.status === 'online' ? '#f59e0b' : '#10b981'}}
                        onClick={() => handleToggleService(service.id)}
                      >
                        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                          <path d="M1 7h12M10 4l3 3-3 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {service.status === 'online' ? '下架' : '上架'}
                      </button>
                      <button className="btn btn-ghost" onClick={() => handleCopyService(service.id)}>
                        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                          <rect x="4" y="4" width="8" height="9" rx="1.5"/>
                          <path d="M2 10V3a1 1 0 0 1 1-1h7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        复制
                      </button>
                    </div>
                  ) : (
                    <div className="card-actions">
                      <button className="btn btn-ghost" style={{opacity: 0.5, cursor: 'not-allowed'}} disabled>
                        审核中不可编辑
                      </button>
                      <button className="btn btn-danger" onClick={() => confirmDelete(service.id)}>
                        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                          <path d="M2 4h10M5 4V2.5h4V4M6 7v4M8 7v4M3 4l.7 8h6.6L11 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        撤回
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* 添加服务卡片 */}
            <div className="service-card add-card">
              <div className="add-icon">
                <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
                  <path d="M10 3v14M3 10h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <div className="add-title">创建新服务</div>
                <div className="add-subtitle">填写信息，提交 AI 审核后上架</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 创建/编辑服务抽屉 */}
      <CreateServiceDrawer
        visible={drawerVisible}
        onClose={() => {
          setDrawerVisible(false);
          setEditingService(null);
        }}
        onSubmit={editingService ? handleUpdateService : handleCreateService}
        editData={editingService || undefined}
      />

      {/* Toast 提示 */}
      {toast && (
        <div className="toast-stack">
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      {/* 删除确认对话框 */}
      {deleteModalVisible && (
        <div className="modal-overlay open" onClick={() => setDeleteModalVisible(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">
              <svg viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 6h16M8 6V4h6v2M19 6l-1 14H4L3 6M9 10v6M13 10v6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>删除服务 · <span style={{color: 'var(--red)'}}>{services.find(s => s.id === pendingDeleteId)?.name}</span></h3>
            <p>
              此操作无法撤销。删除后，该服务将从平台永久移除。<br/>
              <strong>注意：</strong>已有进行中订单的服务无法删除，请先等待订单完成。
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setDeleteModalVisible(false)}>取消</button>
              <button className="btn btn-danger" onClick={executeDelete}>
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <path d="M2 4h10M5 4V2.5h4V4M3 4l.7 8h6.6L11 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
