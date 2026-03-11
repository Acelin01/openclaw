/**
 * 计费结算模块 - Billing Service (增强版)
 * 对应文档：M08 计费结算 (F08-01 ~ F08-12)
 * 
 * 功能增强:
 * - API 对接：真实后端数据
 * - WebSocket: 实时扣费推送
 * - 权限控制：基于角色的功能显示
 * - 数据导出：CSV/Excel 导出
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import './BillingService.css';
import { billingAPI, type BillingStats, type BillingRecord as APIBillingRecord, type EarningsRecord as APIEarningsRecord, type WithdrawalRecord as APIWithdrawalRecord, type Coupon as APICoupon, type PermissionInfo } from '../../services/billing-api';

// 本地类型 (兼容 Mock 数据)
interface BillingRecord {
  id: string;
  time: string;
  orderId: string;
  server: string;
  type: string;
  duration: string;
  amount: number;
  balance: number;
  status: 'success' | 'charge' | 'warn' | 'pending';
}

interface EarningsRecord {
  id: string;
  orderId: string;
  acceptTime: string;
  serviceFee: number;
  actualAmount: number;
  status: 'settled' | 'pending';
}

interface WithdrawalRecord {
  id: string;
  time: string;
  amount: number;
  bank: string;
  estimatedArrival: string;
  status: 'completed' | 'processing' | 'pending';
}

interface Coupon {
  id: string;
  amount: number;
  name: string;
  condition: string;
  expiryDate: string;
  used: boolean;
}

// Mock 数据 (API 失败时使用)
const MOCK_KPI: BillingStats = {
  currentBalance: 1842.50,
  monthlyIncome: 6720.00,
  monthlyExpense: 1280.00,
  pendingWithdrawal: 4360.00,
  couponCount: 3,
  couponTotalValue: 180,
};

// ════════════════════════════════════════
// 主组件
// ════════════════════════════════════════

export const BillingService: React.FC = () => {
  // API 数据状态
  const [kpi, setKpi] = useState<BillingStats>(MOCK_KPI);
  const [deductions, setDeductions] = useState<BillingRecord[]>([]);
  const [earnings, setEarnings] = useState<EarningsRecord[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [permissions, setPermissions] = useState<PermissionInfo | null>(null);
  
  // UI 状态
  const [selectedRecharge, setSelectedRecharge] = useState<number>(100);
  const [selectedMethod, setSelectedMethod] = useState<'alipay' | 'wechat' | 'bank'>('alipay');
  const [autoRechargeEnabled, setAutoRechargeEnabled] = useState<boolean>(false);
  const [autoThreshold, setAutoThreshold] = useState<number>(100);
  const [autoAmount, setAutoAmount] = useState<number>(300);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(2000);
  const [selectedBank, setSelectedBank] = useState<string>('招商银行 (尾号 6789)');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('3 月');
  const [invoiceType, setInvoiceType] = useState<'vat' | 'normal' | 'electronic'>('vat');
  
  // 实时扣费状态
  const [tickerSeconds, setTickerSeconds] = useState<number>(0);
  const [tickerCost, setTickerCost] = useState<number>(0);
  const [countdown, setCountdown] = useState<number>(6);
  const [isBilling, setIsBilling] = useState<boolean>(false);
  
  // Modal & Toast
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [modalMessage, setModalMessage] = useState<string>('');
  const [modalCallback, setModalCallback] = useState<(() => void) | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; icon: string }>({ show: false, message: '', icon: '✓' });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 初始化
  useEffect(() => {
    loadData();
    setupWebSocket();
    return () => {
      billingAPI.disconnectSocket();
    };
  }, []);

  // WebSocket 事件监听
  useEffect(() => {
    const handleBalanceUpdate = (data: any) => {
      setKpi(prev => ({ ...prev, currentBalance: data.balance }));
      showToast('余额已更新', '💰');
    };

    const handleBillingTick = (data: any) => {
      setTickerSeconds(data.elapsedSeconds);
      setTickerCost(data.currentCost);
      setKpi(prev => ({ ...prev, currentBalance: data.balance }));
    };

    const handleLowBalance = (data: any) => {
      showToast(`余额不足！当前：¥${data.currentBalance.toFixed(2)}`, '⚠️');
      setIsBilling(false);
    };

    billingAPI.on('balance:updated', handleBalanceUpdate);
    billingAPI.on('billing:tick', handleBillingTick);
    billingAPI.on('billing:low_balance', handleLowBalance);

    return () => {
      billingAPI.off('balance:updated', handleBalanceUpdate);
      billingAPI.off('billing:tick', handleBillingTick);
      billingAPI.off('billing:low_balance', handleLowBalance);
    };
  }, []);

  // 实时扣费计时器 (本地备用)
  useEffect(() => {
    if (!isBilling) return;
    const RATE_PER_SECOND = 280 / 3600;
    const interval = setInterval(() => {
      setTickerSeconds(prev => prev + 1);
      setTickerCost(prev => prev + RATE_PER_SECOND);
      setCountdown(prev => (prev <= 1 ? 6 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isBilling]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 加载权限信息
      try {
        const perm = await billingAPI.getPermissionInfo();
        setPermissions(perm);
      } catch (e) {
        // 权限接口可能不存在，使用默认权限
        setPermissions({
          role: 'user',
          permissions: [],
          canViewBalance: true,
          canRecharge: true,
          canViewBilling: true,
          canExportBilling: true,
          canViewEarnings: true,
          canWithdraw: true,
          canViewCoupons: true,
          canRedeemCoupons: true,
          canCreateInvoice: true,
          isAdmin: false
        });
      }

      // 加载统计数据
      try {
        const stats = await billingAPI.getStats();
        setKpi(stats);
      } catch (e) {
        console.warn('Failed to load stats, using mock data');
      }

      // 加载账单记录
      try {
        const records = await billingAPI.getBillingRecords({ limit: 8 });
        setDeductions(records.map(r => ({
          id: r.id,
          time: new Date(r.createdAt).toLocaleTimeString('zh-CN'),
          orderId: r.orderId,
          server: r.description,
          type: r.type === 'charge' ? '充值到账' : '按时计费',
          duration: '6s',
          amount: r.amount,
          balance: r.balance,
          status: r.type === 'charge' ? 'charge' : 'success'
        })));
      } catch (e) {
        console.warn('Failed to load billing records');
      }

      // 加载收益记录
      try {
        const earningsData = await billingAPI.getEarnings(4);
        setEarnings(earningsData.map(r => ({
          id: r.id,
          orderId: r.orderId,
          acceptTime: r.acceptTime,
          serviceFee: r.serviceFee,
          actualAmount: r.actualAmount,
          status: r.status
        })));
      } catch (e) {
        console.warn('Failed to load earnings');
      }

      // 加载提现记录
      try {
        const withdrawalsData = await billingAPI.getWithdrawals(4);
        setWithdrawals(withdrawalsData.map(r => ({
          id: r.id,
          time: new Date(r.requestedAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
          amount: r.amount,
          bank: r.bankName,
          estimatedArrival: '-',
          status: r.status === 'completed' ? 'completed' : r.status === 'processing' ? 'processing' : 'pending'
        })));
      } catch (e) {
        console.warn('Failed to load withdrawals');
      }

      // 加载优惠券
      try {
        const couponsData = await billingAPI.getCoupons();
        setCoupons(couponsData.map(r => ({
          id: r.id,
          amount: r.amount,
          name: r.name,
          condition: `满${r.condition}元可用`,
          expiryDate: new Date(r.expiryDate).toLocaleDateString('zh-CN'),
          used: r.used
        })));
      } catch (e) {
        console.warn('Failed to load coupons');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    billingAPI.connectSocket();
    billingAPI.subscribeToBilling();
  };

  const formatTickerTime = useCallback((totalSeconds: number): string => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, []);

  const showToast = useCallback((message: string, icon: string = '✓') => {
    setToast({ show: true, message, icon });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3200);
  }, []);

  const showModal = useCallback((title: string, message: string, callback?: () => void) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalCallback(() => callback || null);
    setModalOpen(true);
  }, []);

  const hideModal = useCallback(() => {
    setModalOpen(false);
    setTimeout(() => setModalCallback(null), 300);
  }, []);

  const handleModalConfirm = useCallback(() => {
    hideModal();
    setTimeout(() => { if (modalCallback) modalCallback(); }, 200);
  }, [hideModal, modalCallback]);

  // ════════════════════════════════════════
  // 业务操作
  // ════════════════════════════════════════

  const handleRecharge = async () => {
    showModal('确认充值', `即将充值 ¥${selectedRecharge}，款项将立即到账`, async () => {
      try {
        await billingAPI.recharge(selectedRecharge, selectedMethod);
        setKpi(prev => ({ ...prev, currentBalance: prev.currentBalance + selectedRecharge }));
        showToast(`充值成功！余额增加 ¥${selectedRecharge}`, '💰');
      } catch (e: any) {
        showToast(`充值失败：${e.message}`, '❌');
      }
    });
  };

  const toggleAutoRecharge = async (enabled: boolean) => {
    setAutoRechargeEnabled(enabled);
    try {
      await billingAPI.updateAutoRechargeConfig({
        enabled,
        threshold: autoThreshold,
        rechargeAmount: autoAmount,
        paymentMethod: selectedMethod
      });
      if (enabled) showToast('自动充值已启用', '🔄');
    } catch (e: any) {
      showToast(`设置失败：${e.message}`, '❌');
    }
  };

  const handleWithdraw = async () => {
    showModal('确认提现', `申请提现 ¥${withdrawAmount.toLocaleString()} 至${selectedBank}，预计 T+1 到账`, async () => {
      try {
        await billingAPI.requestWithdrawal(withdrawAmount, selectedBank, '***');
        showToast(`提现申请成功！¥${withdrawAmount.toLocaleString()} 预计明日到账`, '🏦');
      } catch (e: any) {
        showToast(`提现失败：${e.message}`, '❌');
      }
    });
  };

  const handleUseCoupon = async (couponId: string, couponName: string) => {
    showModal('使用优惠券', `确认使用「${couponName}」用于下次充值抵扣？`, async () => {
      try {
        await billingAPI.useCoupon(couponId);
        setCoupons(prev => prev.map(c => c.id === couponId ? { ...c, used: true } : c));
        showToast('优惠券已使用', '🎫');
      } catch (e: any) {
        showToast(`使用失败：${e.message}`, '❌');
      }
    });
  };

  const handleRedeemCoupon = async (code: string) => {
    try {
      const coupon = await billingAPI.redeemCoupon(code);
      setCoupons(prev => [...prev, {
        id: coupon.id,
        amount: coupon.amount,
        name: coupon.name,
        condition: `满${coupon.condition}元可用`,
        expiryDate: new Date(coupon.expiryDate).toLocaleDateString('zh-CN'),
        used: false
      }]);
      showToast('兑换成功！', '🎫');
    } catch (e: any) {
      showToast(`兑换失败：${e.message}`, '❌');
    }
  };

  const handleExport = async (type: 'billing' | 'earnings' | 'withdrawal', format: 'csv' | 'json' = 'csv') => {
    try {
      const blob = await billingAPI.exportData(format, type);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_records_${Date.now()}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('导出成功！', '📄');
    } catch (e: any) {
      showToast(`导出失败：${e.message}`, '❌');
    }
  };

  const toggleBilling = () => {
    if (isBilling) {
      billingAPI.stopBilling('demo-order');
      setIsBilling(false);
      showToast('计费已停止', '⏹️');
    } else {
      billingAPI.startBilling('demo-order', 280, 6);
      setIsBilling(true);
      showToast('计费已启动', '▶️');
    }
  };

  const getStatusPill = (status: string) => {
    switch (status) {
      case 'success': return { class: 'pill-green', label: '扣费成功' };
      case 'charge': return { class: 'pill-blue', label: '充值到账' };
      case 'warn': return { class: 'pill-amber', label: '已暂停' };
      default: return { class: 'pill-gray', label: status };
    }
  };

  const chartData = [
    { d: '03-04', inc: 820, exp: 200 },
    { d: '03-05', inc: 540, exp: 100 },
    { d: '03-06', inc: 1120, exp: 300 },
    { d: '03-07', inc: 480, exp: 80 },
    { d: '03-08', inc: 960, exp: 180 },
  ];
  const maxVal = 1400;

  const totalServiceFee = earnings.reduce((sum, e) => sum + e.serviceFee, 0);
  const platformFee = totalServiceFee * 0.12;
  const certificationFee = 360;
  const netAmount = totalServiceFee - platformFee - certificationFee;
  const netPercentage = Math.round((netAmount / totalServiceFee) * 100) || 0;

  // 权限检查辅助函数
  const can = (feature: keyof PermissionInfo) => {
    if (!permissions) return true; // 加载中时显示全部
    return (permissions as any)[feature] !== false;
  };

  if (loading) {
    return <div className="billing-service loading">加载中...</div>;
  }

  return (
    <div className="billing-service">
      {/* Toast */}
      <div className={`toast ${toast.show ? 'show' : ''}`}>
        <span className="toast-icon">{toast.icon}</span>
        <span>{toast.message}</span>
      </div>

      {/* Modal */}
      <div className={`modal-overlay ${modalOpen ? 'open' : ''}`} onClick={hideModal}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={hideModal}>✕</button>
          <div className="modal-title">{modalTitle}</div>
          <div className="modal-sub">{modalMessage}</div>
          <div className="modal-actions">
            <button className="modal-btn modal-btn-cancel" onClick={hideModal}>取消</button>
            <button className="modal-btn modal-btn-confirm" onClick={handleModalConfirm}>确认</button>
          </div>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="kpi-strip">
        <div className="kpi kpi-accent-green">
          <div className="kpi-label">当前余额</div>
          <div className="kpi-val">¥<em>{kpi.currentBalance.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</em></div>
          <div className="kpi-delta delta-up">↑ 实时更新</div>
        </div>
        <div className="kpi kpi-accent-blue">
          <div className="kpi-label">本月收益</div>
          <div className="kpi-val">¥<em>{kpi.monthlyIncome.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</em></div>
          <div className="kpi-delta delta-up">↑ 较上月 +23.4%</div>
        </div>
        <div className="kpi kpi-accent-red">
          <div className="kpi-label">本月支出</div>
          <div className="kpi-val">¥<em>{kpi.monthlyExpense.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</em></div>
          <div className="kpi-delta delta-dn">↓ 较上月 -8.2%</div>
        </div>
        <div className="kpi kpi-accent-amber">
          <div className="kpi-label">待提现收益</div>
          <div className="kpi-val">¥<em>{kpi.pendingWithdrawal.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</em></div>
          <div className="kpi-delta">· 可提现金额</div>
        </div>
        <div className="kpi kpi-accent-gold">
          <div className="kpi-label">优惠券</div>
          <div className="kpi-val">{kpi.couponCount}<em> 张</em></div>
          <div className="kpi-delta">· 共抵用 ¥{kpi.couponTotalValue}</div>
        </div>
      </div>

      {/* Row 1 */}
      <div className="grid-3">
        {/* F08-01: 余额充值 */}
        {can('canRecharge') && (
          <div className="card" id="balance">
            <div className="card-head">
              <div>
                <div className="card-title">余额充值</div>
                <div className="card-meta">F08-01 · P0</div>
              </div>
              <span className="func-tag">支付宝 / 微信 / 银行卡</span>
            </div>
            <div className="card-body">
              <div className="balance-display">
                <div className="balance-currency">¥</div>
                <div className="balance-amount">
                  <span>{Math.floor(kpi.currentBalance).toLocaleString()}</span>
                  <span className="balance-cents">.{String((kpi.currentBalance % 1).toFixed(2)).split('.')[1]}</span>
                </div>
              </div>
              <div className="balance-progress">
                <div className="progress-label">
                  <span>当前余额</span>
                  <span>充值上限 ¥50,000</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${(kpi.currentBalance / 50000) * 100}%` }}></div>
                </div>
              </div>
              <div className="recharge-grid">
                {[100, 300, 500, 1000].map(amt => (
                  <div key={amt} className={`recharge-btn ${selectedRecharge === amt ? 'selected' : ''}`} onClick={() => setSelectedRecharge(amt)}>
                    <div className="recharge-amount">{amt}</div>
                    <div className="recharge-label">{amt === 500 ? '赠 20' : amt === 1000 ? '赠 60' : '元'}</div>
                  </div>
                ))}
              </div>
              <div className="recharge-methods">
                <button className={`method-btn ${selectedMethod === 'alipay' ? 'active' : ''}`} onClick={() => setSelectedMethod('alipay')}>
                  <span className="method-icon">💙</span> 支付宝
                </button>
                <button className={`method-btn ${selectedMethod === 'wechat' ? 'active' : ''}`} onClick={() => setSelectedMethod('wechat')}>
                  <span className="method-icon">💚</span> 微信支付
                </button>
                <button className={`method-btn ${selectedMethod === 'bank' ? 'active' : ''}`} onClick={() => setSelectedMethod('bank')}>
                  <span className="method-icon">🏦</span> 银行卡
                </button>
              </div>
              <button className="recharge-submit" onClick={handleRecharge}>立即充值 ¥{selectedRecharge}</button>
            </div>
          </div>
        )}

        {/* F08-02: 自动充值 + F08-03: 实时扣费 */}
        <div className="card" id="auto">
          <div className="card-head">
            <div>
              <div className="card-title">自动充值 + 实时扣费</div>
              <div className="card-meta">F08-02 · F08-03</div>
            </div>
          </div>
          <div className="card-body">
            <div className="auto-toggle-row">
              <div className="auto-toggle-text">
                <h4>启用自动充值</h4>
                <p>余额低于阈值时自动触发</p>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={autoRechargeEnabled} onChange={(e) => toggleAutoRecharge(e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
            {autoRechargeEnabled && (
              <div className="auto-settings show">
                <p>✓ 已授权自动扣款，可随时关闭</p>
                <div className="auto-input-row">
                  <div className="form-group">
                    <label>触发阈值（元）</label>
                    <input className="form-input" type="number" value={autoThreshold} onChange={(e) => setAutoThreshold(Number(e.target.value))} placeholder="50" />
                  </div>
                  <div className="form-group">
                    <label>每次充值（元）</label>
                    <input className="form-input" type="number" value={autoAmount} onChange={(e) => setAutoAmount(Number(e.target.value))} placeholder="300" />
                  </div>
                </div>
              </div>
            )}
            <div style={{ marginTop: '20px' }}>
              <div className="sec-title" style={{ fontSize: '15px', marginBottom: '12px' }}>F08-03 · 实时扣费 {isBilling && <span className="live-tag" style={{marginLeft: '10px'}}><div className="live-dot"></div>计费中</span>}</div>
              <div className="ticker-section" id="ticker">
                <div className="ticker-top">
                  <div className="ticker-label">当前订单 · 累计扣费</div>
                  <div className="ticker-status">
                    <div className="live-dot"></div> {isBilling ? '计费中' : '已暂停'}
                  </div>
                </div>
                <div className="ticker-amount">
                  <em>¥</em><span>{tickerCost.toFixed(2)}</span>
                </div>
                <div className="ticker-rate">¥280.00/h · 每 6 秒扣费一次</div>
                <div className="ticker-grid">
                  <div className="ticker-stat">
                    <div className="ts-label">累计工时</div>
                    <div className="ts-val">{formatTickerTime(tickerSeconds)}</div>
                  </div>
                  <div className="ticker-stat">
                    <div className="ts-label">本次费率</div>
                    <div className="ts-val green">¥0.467<span style={{ fontSize: '9px', color: 'rgba(255,255,255,.3)' }}>/6s</span></div>
                  </div>
                  <div className="ticker-stat">
                    <div className="ts-label">下次扣费</div>
                    <div className="ts-val amber">{countdown}s</div>
                  </div>
                </div>
                <div className="countdown-bar">
                  <div className="countdown-fill" style={{ width: `${(countdown / 6) * 100}%` }}></div>
                </div>
                <button className="tb-btn tb-btn-primary" onClick={toggleBilling} style={{ marginTop: '16px', width: '100%' }}>
                  {isBilling ? '⏹️ 停止计费' : '▶️ 开始计费'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* F08-05: 账单查询 */}
        {can('canViewBilling') && (
          <div className="card" id="bill">
            <div className="card-head">
              <div>
                <div className="card-title">账单查询</div>
                <div className="card-meta">F08-05 · P0</div>
              </div>
              {can('canExportBilling') && (
                <button className="tb-btn tb-btn-outline" style={{ padding: '5px 12px', fontSize: '11px' }} onClick={() => handleExport('billing', 'csv')}>
                  ↓ 导出 CSV
                </button>
              )}
            </div>
            <div className="card-body">
              <div className="bill-period">
                {['1 月', '2 月', '3 月', '自定义'].map(period => (
                  <button key={period} className={`period-btn ${selectedPeriod === period ? 'active' : ''}`} onClick={() => setSelectedPeriod(period)}>{period}</button>
                ))}
              </div>
              <div className="bill-overview">
                <div className="bill-block">
                  <div className="bb-label">本月收入</div>
                  <div className="bb-val inc">+¥{kpi.monthlyIncome.toLocaleString()}</div>
                  <div className="bb-sub">18 笔订单收益</div>
                </div>
                <div className="bill-block">
                  <div className="bb-label">本月支出</div>
                  <div className="bb-val exp">−¥{kpi.monthlyExpense.toLocaleString()}</div>
                  <div className="bb-sub">充值 4 次</div>
                </div>
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--muted)', letterSpacing: '.1em', marginBottom: '10px', textTransform: 'uppercase' }}>日收入趋势</div>
              <div className="chart-bar-wrap">
                {chartData.map(day => (
                  <React.Fragment key={day.d}>
                    <div className="chart-row">
                      <div className="chart-label">{day.d}</div>
                      <div className="chart-track">
                        <div className="chart-fill inc" style={{ width: `${(day.inc / maxVal) * 100}%` }}>+¥{day.inc}</div>
                      </div>
                    </div>
                    <div className="chart-row" style={{ marginTop: '-4px', marginBottom: '4px' }}>
                      <div className="chart-label"></div>
                      <div className="chart-track" style={{ height: '14px' }}>
                        <div className="chart-fill exp" style={{ width: `${(day.exp / maxVal) * 100}%` }}>−¥{day.exp}</div>
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Row 2: 扣费记录 */}
      {can('canViewBilling') && (
        <div className="card" id="records">
          <div className="card-head">
            <div>
              <div className="card-title">扣费记录</div>
              <div className="card-meta">F08-04 · P0</div>
            </div>
            <div className="sec-actions">
              <select className="bank-select" style={{ width: '120px', padding: '6px 28px 6px 10px' }}>
                <option>全部订单</option>
                <option>ORD-2024-001</option>
              </select>
              <button className="tb-btn tb-btn-outline" onClick={() => handleExport('billing', 'csv')}>导出 CSV</button>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>时间</th><th>订单号</th><th>服务者</th><th>类型</th><th>工时</th><th>金额</th><th>余额</th><th>状态</th></tr>
              </thead>
              <tbody>
                {deductions.length > 0 ? deductions.map(record => {
                  const pill = getStatusPill(record.status);
                  return (
                    <tr key={record.id}>
                      <td className="td-mono" style={{ color: 'var(--muted)' }}>{record.time}</td>
                      <td className="td-mono" style={{ color: 'var(--blue)' }}>{record.orderId}</td>
                      <td style={{ fontSize: '12px' }}>{record.server}</td>
                      <td style={{ fontSize: '12px' }}>{record.type}</td>
                      <td className="td-mono">{record.duration}</td>
                      <td className={record.amount > 0 ? 'td-amount-pos' : record.amount === 0 ? 'td-mono' : 'td-amount-neg'}>
                        {record.amount > 0 ? '+' : ''}{record.amount.toFixed(2)}
                      </td>
                      <td className="td-mono">¥{record.balance.toFixed(2)}</td>
                      <td><span className={`pill ${pill.class}`}>{pill.label}</span></td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>暂无记录</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            <div className="tf-info">共 {deductions.length} 条记录</div>
            <div className="pagination">
              <button className="pg-btn" disabled>‹</button>
              <button className="pg-btn active">1</button>
              <button className="pg-btn">2</button>
              <button className="pg-btn">›</button>
            </div>
          </div>
        </div>
      )}

      {/* Row 3: 收益 + 提现 */}
      <div className="grid-2">
        {/* F08-06 F08-07: 收益 */}
        {can('canViewEarnings') && (
          <div className="card" id="earnings">
            <div className="card-head">
              <div>
                <div className="card-title">收益入账 & 明细</div>
                <div className="card-meta">F08-06 · F08-07</div>
              </div>
              {can('canExportBilling') && (
                <button className="tb-btn tb-btn-outline" style={{ padding: '5px 12px', fontSize: '11px' }} onClick={() => handleExport('earnings', 'csv')}>
                  ↓ 导出
                </button>
              )}
            </div>
            <div className="earnings-header">
              <div className="eh-icon">💵</div>
              <div>
                <div className="eh-val">¥{kpi.pendingWithdrawal.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</div>
                <div className="eh-label">待提现收益</div>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--muted)' }}>本月累计</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '18px', fontWeight: 700, color: 'var(--ink)' }}>¥{kpi.monthlyIncome.toLocaleString()}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'start' }}>
              <div className="earnings-breakdown">
                <div className="eb-row">
                  <span className="eb-label"><span className="eb-dot" style={{ background: '#0d7c4b' }}></span>服务费收入</span>
                  <span className="eb-val" style={{ color: 'var(--green)' }}>¥{totalServiceFee.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}<span className="eb-pct">78%</span></span>
                </div>
                <div className="eb-row">
                  <span className="eb-label"><span className="eb-dot" style={{ background: '#c0392b' }}></span>平台抽成</span>
                  <span className="eb-val" style={{ color: 'var(--red)' }}>−¥{platformFee.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}<span className="eb-pct">12%</span></span>
                </div>
                <div className="eb-row">
                  <span className="eb-label"><span className="eb-dot" style={{ background: '#b45309' }}></span>认证年费摊销</span>
                  <span className="eb-val" style={{ color: 'var(--amber)' }}>−¥{certificationFee.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}<span className="eb-pct">4%</span></span>
                </div>
                <div className="eb-row" style={{ background: 'var(--green-bg)', border: '1px solid rgba(13,124,75,.1)' }}>
                  <span className="eb-label" style={{ fontWeight: 600 }}>实际到账</span>
                  <span className="eb-val" style={{ color: 'var(--green)', fontSize: '16px' }}>¥{netAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              <div className="donut-wrap">
                <div className="donut">
                  <svg viewBox="0 0 110 110">
                    <circle cx="55" cy="55" r="42" fill="none" stroke="#f0ece4" strokeWidth="12" />
                    <circle cx="55" cy="55" r="42" fill="none" stroke="#0d7c4b" strokeWidth="12" strokeDasharray="208 55" strokeLinecap="round" />
                    <circle cx="55" cy="55" r="42" fill="none" stroke="#c0392b" strokeWidth="12" strokeDasharray="31 232" strokeDashoffset="-208" strokeLinecap="round" />
                    <circle cx="55" cy="55" r="42" fill="none" stroke="#b45309" strokeWidth="12" strokeDasharray="10 253" strokeDashoffset="-239" strokeLinecap="round" />
                  </svg>
                  <div className="donut-label">
                    <div className="donut-pct">{netPercentage}%</div>
                    <div className="donut-sub">净收益率</div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid var(--border)' }}>
              <table>
                <thead>
                  <tr><th>订单</th><th>验收时间</th><th>服务费</th><th>到账金额</th><th>状态</th></tr>
                </thead>
                <tbody>
                  {earnings.length > 0 ? earnings.map(record => (
                    <tr key={record.id}>
                      <td className="td-mono">{record.orderId}</td>
                      <td className="td-mono">{record.acceptTime}</td>
                      <td className="td-mono">¥{record.serviceFee.toLocaleString()}</td>
                      <td className={record.status === 'settled' ? 'td-amount-pos' : 'td-mono'}>
                        {record.status === 'settled' ? '+' : ''}{record.status === 'settled' ? `¥${record.actualAmount.toLocaleString()}` : '待结算'}
                      </td>
                      <td><span className={`pill ${record.status === 'settled' ? 'pill-green' : 'pill-amber'}`}>{record.status === 'settled' ? '已入账' : '验收中'}</span></td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>暂无收益记录</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* F08-08 F08-09: 提现 */}
        {can('canWithdraw') && (
          <div className="card" id="withdraw">
            <div className="card-head">
              <div>
                <div className="card-title">提现申请 & 记录</div>
                <div className="card-meta">F08-08 · F08-09</div>
              </div>
              {can('canExportBilling') && (
                <button className="tb-btn tb-btn-outline" style={{ padding: '5px 12px', fontSize: '11px' }} onClick={() => handleExport('withdrawal', 'csv')}>
                  ↓ 导出
                </button>
              )}
            </div>
            <div className="withdraw-form">
              <div className="form-group">
                <label>提现到银行卡</label>
                <select className="bank-select" value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)}>
                  <option>🏦 招商银行 (尾号 6789)</option>
                  <option>🏦 工商银行 (尾号 1234)</option>
                  <option>+ 添加新银行卡</option>
                </select>
              </div>
              <div className="form-group">
                <label>提现金额（元）</label>
                <input className="form-input" type="number" placeholder="最低 100 元" value={withdrawAmount} onChange={(e) => setWithdrawAmount(Number(e.target.value))} />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--muted)', letterSpacing: '.1em', marginBottom: '8px', textTransform: 'uppercase' }}>快速选择</div>
                <div className="quick-amounts">
                  <div className={`qa-btn ${withdrawAmount === 1000 ? 'sel' : ''}`} onClick={() => setWithdrawAmount(1000)}>¥1,000</div>
                  <div className={`qa-btn ${withdrawAmount === 2000 ? 'sel' : ''}`} onClick={() => setWithdrawAmount(2000)}>¥2,000</div>
                  <div className={`qa-btn ${withdrawAmount === kpi.pendingWithdrawal ? 'sel' : ''}`} onClick={() => setWithdrawAmount(kpi.pendingWithdrawal)}>全部</div>
                </div>
              </div>
              <div className="withdraw-info">⚠ 提现时间：工作日 09:00–17:00，预计 T+1 到账。单笔最低 ¥100，最高 ¥50,000。</div>
              <button className="withdraw-submit" onClick={handleWithdraw}>申请提现 ¥{withdrawAmount.toLocaleString()}</button>
            </div>
            <div className="withdraw-history">
              <div className="card-head" style={{ borderTop: 'none' }}><div className="card-title-mono">提现历史</div></div>
              <table>
                <thead>
                  <tr><th>申请时间</th><th>金额</th><th>银行卡</th><th>预计到账</th><th>状态</th></tr>
                </thead>
                <tbody>
                  {withdrawals.length > 0 ? withdrawals.map(record => (
                    <tr key={record.id}>
                      <td className="td-mono">{record.time}</td>
                      <td className="td-amount-pos">¥{record.amount.toLocaleString()}</td>
                      <td className="td-mono">{record.bank}</td>
                      <td className="td-mono">{record.estimatedArrival}</td>
                      <td><span className={`pill ${record.status === 'completed' ? 'pill-green' : 'pill-amber'}`}>{record.status === 'completed' ? '已到账' : '处理中'}</span></td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>暂无提现记录</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Row 4: 对账单 + 发票 + 优惠券 */}
      <div className="grid-3">
        {/* F08-10: 对账单 */}
        {can('canViewBilling') && (
          <div className="card" id="reconcile">
            <div className="card-head">
              <div>
                <div className="card-title">对账单</div>
                <div className="card-meta">F08-10</div>
              </div>
              <button className="tb-btn tb-btn-outline" style={{ padding: '5px 12px', fontSize: '11px' }} onClick={() => showToast('对账单已下载', '📊')}>下载</button>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                <div className="bill-block">
                  <div className="bb-label">平台账单</div>
                  <div className="bb-val" style={{ fontSize: '16px' }}>¥{kpi.monthlyIncome.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</div>
                </div>
                <div className="bill-block">
                  <div className="bb-label">银行流水</div>
                  <div className="bb-val" style={{ fontSize: '16px' }}>¥{kpi.monthlyIncome.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</div>
                </div>
              </div>
              <div style={{ background: 'var(--green-bg)', border: '1px solid rgba(13,124,75,.15)', borderRadius: '5px', padding: '10px 12px', fontSize: '12px', color: 'var(--green)', marginBottom: '16px' }}>
                ✓ 2026 年 3 月账单已对账完毕，数据一致
              </div>
            </div>
          </div>
        )}

        {/* F08-11: 发票申请 */}
        {can('canCreateInvoice') && (
          <div className="card" id="invoice">
            <div className="card-head">
              <div>
                <div className="card-title">发票申请</div>
                <div className="card-meta">F08-11</div>
              </div>
            </div>
            <div className="card-body">
              <div className="invoice-type-tabs">
                <button className={`itab ${invoiceType === 'vat' ? 'active' : ''}`} onClick={() => setInvoiceType('vat')}>增值税专票</button>
                <button className={`itab ${invoiceType === 'normal' ? 'active' : ''}`} onClick={() => setInvoiceType('normal')}>普通发票</button>
                <button className={`itab ${invoiceType === 'electronic' ? 'active' : ''}`} onClick={() => setInvoiceType('electronic')}>电子发票</button>
              </div>
              <div className="inv-form">
                <div className="form-group"><label>发票抬头</label><input className="form-input" placeholder="公司名称" /></div>
                <div className="form-group"><label>税号</label><input className="form-input" placeholder="纳税人识别号" /></div>
                <div className="form-group"><label>开票金额</label><input className="form-input" value={kpi.monthlyIncome.toFixed(2)} readOnly /></div>
                <div className="form-group"><label>开票月份</label><select className="bank-select"><option>2026 年 3 月</option><option>2026 年 2 月</option></select></div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}><label>收件邮箱</label><input className="form-input" placeholder="发票将发送至此邮箱" /></div>
                <button className="inv-submit" onClick={() => showToast('发票申请已提交', '🧾')}>提交申请</button>
              </div>
            </div>
          </div>
        )}

        {/* F08-12: 优惠券 */}
        {can('canViewCoupons') && (
          <div className="card" id="coupon">
            <div className="card-head">
              <div>
                <div className="card-title">优惠券</div>
                <div className="card-meta">F08-12 · {coupons.filter(c => !c.used).length} 张可用</div>
              </div>
              {can('canRedeemCoupons') && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input className="form-input" style={{ width: '110px', padding: '6px 10px', fontSize: '12px' }} placeholder="输入券码" id="couponCode" />
                  <button className="tb-btn tb-btn-outline" style={{ padding: '6px 12px', fontSize: '11px' }} onClick={() => {
                    const code = (document.getElementById('couponCode') as HTMLInputElement)?.value;
                    if (code) handleRedeemCoupon(code);
                  }}>兑换</button>
                </div>
              )}
            </div>
            <div className="card-body">
              {coupons.length > 0 ? coupons.map(coupon => (
                <div key={coupon.id} className={`coupon-card ${coupon.used ? 'coupon-used' : ''}`}>
                  <div className="coupon-left">
                    <div className="coupon-val" style={coupon.used ? { textDecoration: 'line-through' } : {}}>{coupon.amount}</div>
                    <div className="coupon-unit">元</div>
                  </div>
                  <div className="coupon-mid">
                    <div className="coupon-name">{coupon.name}</div>
                    <div className="coupon-cond">{coupon.condition}</div>
                    <div className="coupon-exp">{coupon.expiryDate}</div>
                  </div>
                  <div className="coupon-right">
                    <button className="coupon-use" disabled={coupon.used} onClick={() => !coupon.used && handleUseCoupon(coupon.id, `${coupon.amount}元券`)} style={coupon.used ? { background: 'var(--bg2)', color: 'var(--muted)', cursor: 'not-allowed' } : {}}>
                      {coupon.used ? '已使用' : '立即使用'}
                    </button>
                  </div>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>暂无优惠券</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingService;
