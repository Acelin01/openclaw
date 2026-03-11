# 计费结算模块文档

**版本**: 1.0.0  
**对应文档**: M08 计费结算  
**实现日期**: 2026-03-11

---

## 📋 功能概述

计费结算模块提供完整的资金管理、实时扣费、收益结算、提现处理等功能。

### 功能模块

| 编号 | 功能 | 说明 | 优先级 |
|------|------|------|--------|
| F08-01 | 余额充值 | 支持支付宝/微信/银行卡 | P0 |
| F08-02 | 自动充值 | 余额低于阈值自动触发 | P1 |
| F08-03 | 实时扣费 | 按小时费率，每 6 秒扣费 | P0 |
| F08-04 | 扣费记录 | 按订单/时间维度查询 | P0 |
| F08-05 | 账单查询 | 月度汇总，图表趋势 | P0 |
| F08-06 | 收益入账 | 订单完成后自动入账 | P0 |
| F08-07 | 收益明细 | 服务费/抽成/摊销明细 | P0 |
| F08-08 | 提现申请 | T+1 工作日到账 | P0 |
| F08-09 | 提现记录 | 历史提现查询 | P1 |
| F08-10 | 对账单 | 平台账单与银行流水核对 | P1 |
| F08-11 | 发票申请 | 增值税/普通/电子发票 | P2 |
| F08-12 | 优惠券 | 兑换/使用/管理 | P2 |

---

## 🏗️ 架构设计

### 后端服务

```
apps/api/src/
├── services/
│   ├── billing.service.ts       # 计费服务核心
│   └── billing-socket.service.ts # WebSocket 实时推送
├── routes/
│   └── billing.ts               # RESTful API 路由
├── middleware/
│   └── permissions.ts           # 权限控制中间件
└── database/
    └── billing_schema.sql       # 数据库表结构
```

### 前端组件

```
apps/chat-lite/src/
├── components/billing/
│   ├── BillingService.tsx       # 主组件
│   └── BillingService.css       # 样式文件
└── services/
    └── billing-api.ts           # API 客户端
```

---

## 🔌 API 接口

### 基础 URL
```
http://localhost:8000/api/v1/billing
```

### 认证
所有接口需要 JWT Token 认证（部分接口支持游客访问）
```
Authorization: Bearer <token>
```

### 接口列表

#### 1. 获取余额和统计
```http
GET /billing/balance
```

**响应**:
```json
{
  "success": true,
  "data": {
    "balance": {
      "userId": "user-001",
      "balance": 1842.50,
      "frozenBalance": 0
    },
    "stats": {
      "currentBalance": 1842.50,
      "monthlyIncome": 6720.00,
      "monthlyExpense": 1280.00,
      "pendingWithdrawal": 4360.00,
      "couponCount": 3,
      "couponTotalValue": 180
    }
  }
}
```

#### 2. 充值
```http
POST /billing/recharge
Content-Type: application/json

{
  "amount": 500,
  "method": "alipay"
}
```

#### 3. 自动充值配置
```http
GET  /billing/auto-recharge
POST /billing/auto-recharge

{
  "enabled": true,
  "threshold": 100,
  "rechargeAmount": 300,
  "paymentMethod": "alipay"
}
```

#### 4. 实时扣费控制
```http
POST /billing/billing/start
{
  "orderId": "order-001",
  "ratePerHour": 280,
  "intervalSeconds": 6
}

POST /billing/billing/stop
{
  "orderId": "order-001"
}

GET /billing/billing/status/:orderId
```

#### 5. 账单记录
```http
GET /billing/records?limit=50&offset=0&startDate=2026-03-01&type=charge
```

#### 6. 收益记录
```http
GET /billing/earnings?limit=50
```

#### 7. 提现申请
```http
POST /billing/withdrawal
{
  "amount": 2000,
  "bankName": "招商银行",
  "bankAccount": "6225880000000000"
}
```

#### 8. 优惠券
```http
GET    /billing/coupons
POST   /billing/coupons/redeem
POST   /billing/coupons/:couponId/use
```

#### 9. 数据导出
```http
POST /billing/export
{
  "format": "csv",
  "type": "billing",
  "startDate": "2026-03-01",
  "endDate": "2026-03-31"
}
```

---

## 🔌 WebSocket 实时推送

### 连接
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:8000/billing', {
  auth: { token: userToken }
});
```

### 事件

#### 订阅计费事件
```javascript
socket.emit('billing:subscribe', { orderId: 'order-001' });
```

#### 接收扣费更新
```javascript
socket.on('billing:tick', (data) => {
  console.log('扣费更新:', {
    orderId: data.orderId,
    elapsedSeconds: data.elapsedSeconds,
    currentCost: data.currentCost,
    balance: data.balance
  });
});
```

#### 余额不足警告
```javascript
socket.on('billing:low_balance', (data) => {
  console.warn('余额不足!', {
    orderId: data.orderId,
    currentBalance: data.currentBalance,
    required: data.required
  });
});
```

---

## 🔐 权限控制

### 角色定义

| 角色 | 说明 |
|------|------|
| `guest` | 游客，仅查看余额 |
| `user` | 普通用户，可充值、查看账单 |
| `freelancer` | 自由职业者，可提现、开发票 |
| `enterprise` | 企业用户，不可提现 |
| `admin` | 管理员，所有权限 |

### 权限列表

| 权限 | guest | user | freelancer | enterprise | admin |
|------|-------|------|------------|------------|-------|
| `balance:view` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `balance:recharge` | ❌ | ✅ | ✅ | ✅ | ✅ |
| `billing:view` | ❌ | ✅ | ✅ | ✅ | ✅ |
| `billing:export` | ❌ | ❌ | ✅ | ✅ | ✅ |
| `earnings:view` | ❌ | ❌ | ✅ | ✅ | ✅ |
| `earnings:withdraw` | ❌ | ❌ | ✅ | ❌ | ✅ |
| `coupon:view` | ❌ | ✅ | ✅ | ✅ | ✅ |
| `coupon:redeem` | ❌ | ✅ | ✅ | ✅ | ✅ |
| `invoice:create` | ❌ | ❌ | ✅ | ✅ | ✅ |

### 使用示例

```typescript
// 后端中间件
import { requirePermission, requireRole } from './middleware/permissions';

app.post('/withdrawal', 
  authenticateToken,
  requirePermission('earnings:withdraw'),
  withdrawalController
);

// 前端条件渲染
{permissions?.canWithdraw && <WithdrawButton />}
{permissions?.canExportBilling && <ExportButton />}
```

---

## 📊 数据库表结构

### 主要表

1. **user_balances** - 用户余额
2. **billing_records** - 账单记录
3. **earnings** - 收益记录
4. **withdrawals** - 提现申请
5. **auto_recharge_configs** - 自动充值配置
6. **coupon_codes** - 优惠券码
7. **coupons** - 用户优惠券
8. **invoices** - 发票申请

详见：`/apps/api/database/billing_schema.sql`

---

## 🧪 测试

### 运行测试脚本
```bash
cd /Users/mac/Documents/GitHub/openclaw/apps/api
npx tsx src/scripts/test-billing.ts
```

### 测试覆盖
- ✅ 余额查询
- ✅ 充值操作
- ✅ 实时扣费
- ✅ 账单记录查询
- ✅ 收益管理
- ✅ 提现申请
- ✅ 自动充值配置
- ✅ 优惠券管理

---

## 🚀 部署配置

### 环境变量
```bash
# 计费配置
BILLING_RATE_PER_HOUR=280
BILLING_INTERVAL_SECONDS=6
WITHDRAWAL_MIN_AMOUNT=100
WITHDRAWAL_MAX_AMOUNT=50000
AUTO_RECHARGE_DEFAULT_THRESHOLD=100
AUTO_RECHARGE_DEFAULT_AMOUNT=300
```

### 数据库迁移
```bash
psql -d chatlite -f /apps/api/database/billing_schema.sql
```

---

## 📝 更新日志

### v1.0.0 (2026-03-11)
- ✅ 基础 UI 组件完成
- ✅ API 对接完成
- ✅ WebSocket 实时推送
- ✅ 权限控制
- ✅ 数据导出功能

---

## 📞 联系支持

如有问题，请联系开发团队或提交 Issue。
