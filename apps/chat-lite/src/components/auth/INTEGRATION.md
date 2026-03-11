# ChatLite 认证系统集成指南

## 📦 新增服务文件

### 后端服务 (API)

```
apps/api/src/services/
├── sms.service.ts          # 短信服务 (阿里云/腾讯云)
├── oauth.service.ts        # OAuth 服务 (微信/GitHub)
├── upload.service.ts       # 文件上传服务 (本地/OSS)
└── ../routes/
    ├── uploads.ts          # 文件上传路由
    └── auth.ts             # 已更新 (新增 OAuth/短信接口)
```

### 前端组件 (ChatLite)

```
apps/chat-lite/src/components/auth/
├── AuthRoutes.tsx          # 认证路由组件 (新增)
├── AuthPage.tsx            # 主认证页面
├── LoginForm.tsx           # 登录表单
├── RegisterForm.tsx        # 注册表单
├── VerifyForm.tsx          # 实名认证
├── SettingsForm.tsx        # 账号设置
└── index.ts                # 统一导出
```

---

## 1️⃣ 集成短信服务商

### 阿里云短信

**安装依赖**:
```bash
cd apps/api
pnpm add @alicloud/dysmsapi20170525 @alicloud/openapi-client
```

**配置环境变量**:
```bash
ALIYUN_ACCESS_KEY_ID=LTAI5t...
ALIYUN_ACCESS_KEY_SECRET=...
ALIYUN_SMS_SIGN_NAME=技能共享平台
ALIYUN_SMS_TEMPLATE_CODE=SMS_123456789
```

**使用示例**:
```ts
import { smsService } from './services/sms.service';

// 初始化
smsService.init('aliyun');

// 发送验证码
const result = await smsService.sendVerificationCode('13800138000', '123456');
```

### 腾讯云短信

**安装依赖**:
```bash
pnpm add tencentcloud-sdk-nodejs
```

**配置环境变量**:
```bash
TENCENT_ACCESS_KEY_ID=...
TENCENT_ACCESS_KEY_SECRET=...
TENCENT_SMS_SIGN_NAME=技能共享平台
TENCENT_SMS_TEMPLATE_CODE=123456
```

**使用示例**:
```ts
import { smsService } from './services/sms.service';

smsService.init('tencent');
await smsService.sendVerificationCode('13800138000', '123456');
```

---

## 2️⃣ 配置 OAuth

### 微信开放平台

**步骤**:
1. 注册微信开放平台账号 (https://open.weixin.qq.com)
2. 创建网站应用，获取 AppID 和 AppSecret
3. 配置授权回调域名为 `localhost:3002` (开发环境)

**环境变量**:
```bash
WECHAT_APP_ID=wx_xxxxxxxxxxxxxxxx
WECHAT_APP_SECRET=your-wechat-app-secret
WECHAT_REDIRECT_URI=http://localhost:3002/auth/callback/wechat
```

**前端集成**:
```tsx
// 在 LoginForm.tsx 中
const handleWechatLogin = async () => {
  const response = await fetch('/api/auth/oauth/wechat/url');
  const { data } = await response.json();
  window.location.href = data.url; // 跳转到微信授权页
};
```

### GitHub OAuth

**步骤**:
1. 创建 GitHub OAuth App (https://github.com/settings/developers)
2. 获取 Client ID 和 Client Secret
3. 配置 Authorization callback URL 为 `http://localhost:3002/auth/callback/github`

**环境变量**:
```bash
GITHUB_CLIENT_ID=Iv1.xxxxxxxxxxxx
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_REDIRECT_URI=http://localhost:3002/auth/callback/github
```

**前端集成**:
```tsx
const handleGithubLogin = async () => {
  const response = await fetch('/api/auth/oauth/github/url');
  const { data } = await response.json();
  window.location.href = data.url;
};
```

---

## 3️⃣ 文件上传服务

### 本地存储 (开发环境)

**环境变量**:
```bash
UPLOAD_PROVIDER=local
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880  # 5MB
```

**前端使用**:
```tsx
// 上传头像
const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/uploads/avatar', {
    method: 'POST',
    body: formData,
  });

  const { data } = await response.json();
  return data.url; // /uploads/xxx.jpg
};
```

### 阿里云 OSS (生产环境)

**安装依赖**:
```bash
pnpm add ali-oss
pnpm add -D @types/ali-oss
```

**环境变量**:
```bash
UPLOAD_PROVIDER=aliyun-oss
ALIYUN_OSS_REGION=oss-cn-hangzhou
ALIYUN_OSS_ACCESS_KEY_ID=...
ALIYUN_OSS_ACCESS_KEY_SECRET=...
ALIYUN_OSS_BUCKET=your-bucket-name
```

**自动压缩配置**:
```ts
// 头像上传 (自动压缩至 500KB)
await uploadService.upload(file, {
  compress: true,
  maxWidth: 500,
  maxHeight: 500,
  quality: 80,
});

// 身份证上传
await uploadService.upload(file, {
  compress: true,
  maxWidth: 1200,
  maxHeight: 800,
  quality: 85,
});
```

---

## 4️⃣ 路由集成到主应用

### 在 App.tsx 中集成

```tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthRoutes } from './components/auth/AuthRoutes';
import { Dashboard } from './pages/Dashboard';
import { Chat } from './pages/Chat';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 认证相关路由 */}
        <Route path="/*" element={<AuthRoutes />} />
        
        {/* 主应用路由 */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat" element={<Chat />} />
        
        {/* 默认重定向 */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### 使用受保护的路由

```tsx
import { ProtectedRoute } from './components/auth/AuthRoutes';

// 在需要登录的页面中使用
<Route
  path="/settings"
  element={
    <ProtectedRoute>
      <SettingsPage />
    </ProtectedRoute>
  }
/>
```

### 使用认证 Hook

```tsx
import { useAuth } from './hooks/useAuth';

function UserProfile() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  return (
    <div>
      <h1>欢迎，{user.name}!</h1>
      <button onClick={logout}>退出登录</button>
    </div>
  );
}
```

---

## 🔧 依赖安装

### 后端依赖

```bash
cd apps/api

# 短信服务 (二选一)
pnpm add @alicloud/dysmsapi20170525 @alicloud/openapi-client  # 阿里云
pnpm add tencentcloud-sdk-nodejs                               # 腾讯云

# 文件上传
pnpm add sharp uuid
pnpm add -D @types/uuid

# OSS (可选)
pnpm add ali-oss
pnpm add -D @types/ali-oss
```

### 前端依赖

```bash
cd apps/chat-lite

# 确保已安装
pnpm add react-router-dom
```

---

## 📝 API 接口汇总

### 短信接口

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/auth/sms/send` | POST | 发送验证码 |
| `/api/auth/sms/login` | POST | 短信登录 |
| `/api/auth/sms/register` | POST | 短信注册 |

### OAuth 接口

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/auth/oauth/wechat/url` | GET | 微信授权 URL |
| `/api/auth/oauth/github/url` | GET | GitHub 授权 URL |
| `/api/auth/oauth/wechat/callback` | POST | 微信回调 |
| `/api/auth/oauth/github/callback` | POST | GitHub 回调 |

### 文件上传接口

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/uploads/avatar` | POST | 上传头像 |
| `/api/uploads/id-card` | POST | 上传身份证 |
| `/api/uploads/business-license` | POST | 上传营业执照 |
| `/api/uploads/:filename` | DELETE | 删除文件 |

---

## 🚀 快速开始

1. **复制环境变量**:
   ```bash
   cp apps/api/.env.example apps/api/.env
   ```

2. **配置必要的密钥**:
   - 至少配置 `JWT_SECRET`
   - 开发环境短信使用模拟模式 (无需配置)
   - OAuth 可选配置

3. **启动服务**:
   ```bash
   # API
   cd apps/api && pnpm dev

   # ChatLite
   cd apps/chat-lite && pnpm dev
   ```

4. **访问认证页面**:
   ```
   http://localhost:3002/auth
   ```

---

**更新时间**: 2026-03-10  
**总代码量**: 2,500+ 行
