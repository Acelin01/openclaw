-- ChatLite 订单系统数据库表结构
-- 1. 服务表
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  icon VARCHAR(20) DEFAULT '📊',
  base_price DECIMAL(10,2) NOT NULL,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  category VARCHAR(50),
  service_type VARCHAR(20) DEFAULT 'MIXED',
  seller_id UUID NOT NULL,
  is_hot BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 服务套餐表
CREATE TABLE IF NOT EXISTS service_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL,
  type VARCHAR(20) NOT NULL,
  name VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (service_id) REFERENCES services(id)
);

-- 3. 订单表
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  service_id UUID NOT NULL,
  package_type VARCHAR(20) NOT NULL,
  title VARCHAR(100) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4-7. 其他表 (简化版)
CREATE TABLE IF NOT EXISTS order_logs (id UUID PRIMARY KEY, order_id UUID, status VARCHAR(20), message TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS favorites (id UUID PRIMARY KEY, user_id UUID, service_id UUID, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_id, service_id));
CREATE TABLE IF NOT EXISTS reviews (id UUID PRIMARY KEY, service_id UUID, user_id UUID, rating INTEGER, review TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);

-- 初始数据
INSERT INTO services (id, name, description, icon, base_price, rating, review_count, is_hot) VALUES 
(gen_random_uuid(), '全自动数据分析与可视化报告', '上传数据即可获得专业可视化报告', '📊', 280, 4.9, 312, true),
(gen_random_uuid(), 'SEO 内容创作 + AI 优化', '结合 AI 工具提供高转化率文章', '✍️', 150, 4.8, 156, false),
(gen_random_uuid(), '全栈 Web 应用自动开发', '描述需求即生成完整前后端代码', '⚙️', 320, 4.6, 89, true)
ON CONFLICT DO NOTHING;
