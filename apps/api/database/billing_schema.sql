-- ════════════════════════════════════════
-- 计费结算模块数据库表结构
-- 对应文档：M08 计费结算
-- ════════════════════════════════════════

-- 用户余额表
CREATE TABLE IF NOT EXISTS user_balances (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) UNIQUE NOT NULL,
  balance DECIMAL(12,2) DEFAULT 0.00,
  frozen_balance DECIMAL(12,2) DEFAULT 0.00,
  total_income DECIMAL(12,2) DEFAULT 0.00,
  total_expense DECIMAL(12,2) DEFAULT 0.00,
  total_recharge DECIMAL(12,2) DEFAULT 0.00,
  total_withdrawal DECIMAL(12,2) DEFAULT 0.00,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 账单记录表
CREATE TABLE IF NOT EXISTS billing_records (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  order_id VARCHAR(50),
  type VARCHAR(20) NOT NULL, -- charge, deduction, income, withdrawal, refund
  amount DECIMAL(12,2) NOT NULL,
  balance DECIMAL(12,2) NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 收益表
CREATE TABLE IF NOT EXISTS earnings (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  order_id VARCHAR(50) NOT NULL,
  service_fee DECIMAL(12,2) NOT NULL,
  platform_fee DECIMAL(12,2) NOT NULL,
  actual_amount DECIMAL(12,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, settled, cancelled
  settled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 提现申请表
CREATE TABLE IF NOT EXISTS withdrawals (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  bank_name VARCHAR(100) NOT NULL,
  bank_account VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, rejected
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP,
  rejected_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 自动充值配置表
CREATE TABLE IF NOT EXISTS auto_recharge_configs (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT false,
  threshold DECIMAL(10,2) DEFAULT 100.00,
  recharge_amount DECIMAL(10,2) DEFAULT 300.00,
  payment_method VARCHAR(20) DEFAULT 'alipay',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 优惠券码表 (可兑换的券码)
CREATE TABLE IF NOT EXISTS coupon_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  name VARCHAR(100) NOT NULL,
  condition_amount DECIMAL(10,2) DEFAULT 0.00,
  expiry_date DATE NOT NULL,
  used BOOLEAN DEFAULT false,
  used_by VARCHAR(50),
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户优惠券表 (已兑换的券)
CREATE TABLE IF NOT EXISTS coupons (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  name VARCHAR(100) NOT NULL,
  condition_amount DECIMAL(10,2) DEFAULT 0.00,
  expiry_date DATE NOT NULL,
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 发票申请表
CREATE TABLE IF NOT EXISTS invoices (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  type VARCHAR(20) NOT NULL, -- vat, normal, electronic
  title VARCHAR(200) NOT NULL,
  tax_id VARCHAR(50) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  period VARCHAR(20) NOT NULL, -- 开票月份
  email VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, processing, sent, rejected
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP
);

-- ════════════════════════════════════════
-- 索引
-- ════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_billing_records_user_id ON billing_records(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_records_created_at ON billing_records(created_at);
CREATE INDEX IF NOT EXISTS idx_billing_records_type ON billing_records(type);
CREATE INDEX IF NOT EXISTS idx_earnings_user_id ON earnings(user_id);
CREATE INDEX IF NOT EXISTS idx_earnings_status ON earnings(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_coupons_user_id ON coupons(user_id);
CREATE INDEX IF NOT EXISTS idx_coupons_used ON coupons(used);

-- ════════════════════════════════════════
-- 初始数据
-- ════════════════════════════════════════

-- 插入一些测试优惠券码
INSERT INTO coupon_codes (code, amount, name, condition_amount, expiry_date) VALUES
  ('WELCOME80', 80, '新用户充值优惠券', 500, '2026-04-30'),
  ('PROMO50', 50, '平台推广优惠券', 200, '2026-05-15'),
  ('ACTIVE50', 50, '季度活跃奖励券', 300, '2026-06-01'),
  ('SPRING100', 100, '春节特惠券', 800, '2026-03-31')
ON CONFLICT (code) DO NOTHING;
