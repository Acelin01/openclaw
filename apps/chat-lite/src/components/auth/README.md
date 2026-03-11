# ChatLite 认证组件

基于设计文档实现的完整登录注册系统，对接 API 端接口。

## 📁 文件结构

```
src/
├── components/auth/
│   ├── AuthPage.tsx          # 主认证页面 (400px 左侧品牌区)
│   ├── AuthPage.css          # 完整样式 (Luxury Editorial)
│   ├── LoginForm.tsx         # 登录表单 (密码/短信)
│   ├── RegisterForm.tsx      # 注册表单 (3 步骤流程)
│   ├── VerifyForm.tsx        # 实名认证 (个人/企业)
│   ├── SettingsForm.tsx      # 账号设置 (4 个 Tab)
│   ├── index.ts              # 统一导出
│   └── README.md             # 本文档
├── hooks/
│   └── useAuth.ts            # 认证状态 Hook
└── services/
    └── auth.ts               # 认证服务 (API 对接)
```

## 🎨 设计风格

- **主题**: Luxury Editorial · Ink & Parchment
- **配色**: Cream (#faf7f2) / Espresso (#1a1208) / Copper (#c07840)
- **字体**: DM Serif Display + DM Sans
- **布局**: 400px 左侧品牌区 + 右侧内容区
- **动画**: 流畅的过渡效果 (cubic-bezier)

## 🔌 使用方法

### 1. 引入认证页面

```tsx
import { AuthPage } from './components/auth';

function App() {
  return <AuthPage />;
}
```

### 2. 使用 Hook

```tsx
import { useAuth } from './hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (isAuthenticated) {
    return <div>欢迎，{user.name}!</div>;
  }
  
  return <button onClick={() => login('email', 'password')}>登录</button>;
}
```

### 3. 单独使用组件

```tsx
import { LoginForm, RegisterForm, VerifyForm, SettingsForm } from './components/auth';

// 在任何页面中使用
<LoginForm />
<RegisterForm />
<VerifyForm />
<SettingsForm />
```

## 🔧 API 接口

### 现有接口 ✅

| 端点 | 方法 | 说明 | 状态 |
|------|------|------|------|
| `/api/auth/register` | POST | 用户注册 | ✅ 已实现 |
| `/api/auth/login` | POST | 用户登录 | ✅ 已实现 |
| `/api/auth/guest` | POST | 访客登录 | ✅ 已实现 |
| `/api/auth/health` | GET | 健康检查 | ✅ 已实现 |

### 新增接口 🆕

| 端点 | 方法 | 说明 | 状态 |
|------|------|------|------|
| `/api/auth/sms/send` | POST | 发送短信验证码 | ✅ 已实现 (待集成短信服务商) |
| `/api/auth/sms/login` | POST | 短信验证码登录 | ✅ 已实现 |
| `/api/auth/sms/register` | POST | 短信验证码注册 | ✅ 已实现 |
| `/api/auth/captcha` | GET | 获取图形验证码 | ✅ 已实现 |

### 待补充接口

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/auth/email/send` | POST | 发送邮件验证码 |
| `/api/auth/password/reset` | POST | 重置密码 |
| `/api/auth/oauth/wechat` | GET | 微信 OAuth |
| `/api/auth/oauth/github` | GET | GitHub OAuth |

## 📊 功能特性

### 登录页面 (LoginForm)
- ✅ 密码登录
- ✅ 短信验证码登录 (UI 完整，API 待集成)
- ✅ 微信/GitHub OAuth 入口 (UI 完成)
- ✅ 忘记密码
- ✅ 记住设备 30 天
- ✅ 密码显示/隐藏切换

### 注册页面 (RegisterForm)
- ✅ 多步骤流程 (3 步)
  1. 账号信息 (手机/邮箱 + 密码)
  2. 角色选择 (客户/自由职业者)
  3. 确认信息
- ✅ 密码强度实时检测
- ✅ 服务协议同意
- ✅ 免审核注册 (F01-10)

### 实名认证 (VerifyForm)
- ✅ 个人认证
  - 真实姓名 + 身份证号
  - 身份证正反面上传
  - 图形验证码
- ✅ 企业认证
  - 企业全称 + 信用代码
  - 营业执照上传
  - 法人信息
- ✅ 第三方核验状态显示

### 账号设置 (SettingsForm)
- ✅ 个人资料 (F01-07)
  - 头像上传 (自动压缩 500KB)
  - 昵称修改
  - 个人简介
  - 技能标签管理
- ✅ 账号安全 (F01-06)
  - 密码修改
  - 短信 2FA 开关
  - 邮件 2FA 开关
  - 登录设备管理
- ✅ 角色管理 (F01-04)
  - 双重身份切换
  - 激活自由职业者
- ✅ 注销账号 (F01-08)
  - 7 天冷静期倒计时
  - 注销原因收集
  - 申请撤回

## 🎯 集成步骤

### 1. 配置路由

```tsx
// App.tsx
import { AuthPage } from './components/auth';
import { useAuth } from './hooks/useAuth';

function App() {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/auth" />} />
    </Routes>
  );
}
```

### 2. 配置 API 代理

```ts
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
```

### 3. 集成短信服务 (可选)

```ts
// apps/api/src/routes/auth.ts
import AliyunSms from '@alicloud/dysmsapi20170525';

// 在 /api/auth/sms/send 中集成
const client = new AliyunSms({
  accessKeyId: process.env.ALIYUN_ACCESS_KEY,
  accessKeySecret: process.env.ALIYUN_ACCESS_SECRET,
});

await client.sendSms({
  PhoneNumbers: phone,
  SignName: '技能共享平台',
  TemplateCode: 'SMS_123456789',
  TemplateParam: JSON.stringify({ code }),
});
```

## ⚠️ 注意事项

1. **样式依赖**: 需要引入 Google Fonts
   ```html
   <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans&display=swap" rel="stylesheet">
   ```

2. **短信服务**: 开发环境验证码固定为 `123456`，生产环境需集成阿里云/腾讯云

3. **文件上传**: 头像/身份证上传需要配置 OSS 或本地存储

4. **安全性**: 
   - 生产环境需启用 HTTPS
   - 密码需加密传输
   - Token 安全存储

## 🎨 自定义主题

修改 `AuthPage.css` 中的 CSS 变量：

```css
:root {
  --copper: #c07840;      /* 主色调 */
  --ink: #1a1208;         /* 深色文字 */
  --cream: #faf7f2;       /* 背景色 */
  --jade: #2a7a60;        /* 成功色 */
  --rose: #c04050;        /* 危险色 */
}
```

---

**创建时间**: 2026-03-10  
**设计文档**: `/docs/官网/注册登陆.md`  
**总代码量**: 1803 行 (TSX + TS + CSS)
