# ChatLite React - 迁移指南

## 📐 架构说明

ChatLite 已完成 React 化迁移，新架构如下：

```
src-react/
├── components/     # React 组件
│   ├── Chat.tsx   # 主聊天组件
│   └── Chat.css   # 组件样式
├── store/          # Zustand 状态管理
│   └── chat-store.ts
├── lib/            # 工具库
│   └── openclaw-client.ts  # OpenClaw API 客户端
├── hooks/          # 自定义 Hooks
├── pages/          # 页面组件
├── App.tsx         # 应用根组件
├── main.tsx        # 入口文件
└── index.css       # 全局样式
```

## 🚀 技术栈

| 功能 | 技术 |
|------|------|
| 框架 | React 19 |
| 状态管理 | Zustand |
| 路由 | React Router |
| 数据获取 | TanStack Query |
| 样式 | CSS (CSS Variables) |
| 构建工具 | Vite |

## 🔌 OpenClaw 集成

### 消息流程

```
用户发送消息
    ↓
Chat 组件 → useChatStore
    ↓
openclawClient.sendMessage()
    ↓
OpenClaw Gateway (http://localhost:8000/api/chat)
    ↓
OpenClaw 核心（技能匹配 + 模型调用）
    ↓
返回响应 → 更新 UI
```

### API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/chat` | POST | 发送消息 |
| `/api/sessions` | GET/POST | 获取/创建会话 |
| `/api/sessions/:id` | DELETE | 删除会话 |
| `/api/sessions/:id/messages` | GET | 获取消息历史 |
| `/ws` | WebSocket | 流式响应 |

## 📦 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 访问
http://localhost:3002/chat
```

## 🎯 功能特性

✅ **核心聊天**
- 发送/接收消息
- 消息历史加载
- 流式响应支持
- 打字机效果

✅ **会话管理**
- 创建新会话
- 切换会话
- 删除会话
- 会话列表

✅ **OpenClaw 集成**
- 自动技能匹配
- 模型调用
- 技能 badge 显示

✅ **UI/UX**
- 响应式设计
- 深色主题
- 侧边栏可折叠
- 加载状态
- 错误处理

## 🔄 与旧版对比

| 功能 | 旧版 (HTML) | 新版 (React) |
|------|-----------|-------------|
| 代码组织 | 分散 | 组件化 |
| 状态管理 | 内联 JS | Zustand |
| 样式 | 内联 CSS | CSS Variables |
| 路由 | 无 | React Router |
| API 调用 | fetch | React Query |
| 可维护性 | 低 | 高 |

## 📂 旧文件处理

以下旧文件**可以删除**（已迁移到 React）：

```
public/chat-access.html       ← 已迁移
public/chat-view.html         ← 已迁移
public/chat/index.html        ← 已迁移
```

以下文件**保留**（独立演示页）：

```
public/skill-service.html     ← 技能服务管理（独立功能）
public/robot-manage.html      ← 机器人管理（独立功能）
public/order-system.html      ← 订单系统（独立功能）
preview/*.html                ← 预览页面
```

## ⚠️ 注意事项

1. **环境变量**: 确保 `.env` 文件配置正确
2. **API 兼容**: OpenClaw Gateway 需要运行在 8000 端口
3. **WebSocket**: 流式响应需要 WebSocket 支持
4. **CORS**: 开发时注意跨域配置

## 🛠️ 后续优化

- [ ] 添加技能面板组件
- [ ] 实现消息搜索
- [ ] 添加文件上传
- [ ] 支持 Markdown 渲染
- [ ] 添加主题切换
- [ ] PWA 支持

## 📚 参考

- [Zustand 文档](https://github.com/pmndrs/zustand)
- [React Router 文档](https://reactrouter.com/)
- [TanStack Query 文档](https://tanstack.com/query)
- [OpenClaw 文档](https://docs.openclaw.ai)
