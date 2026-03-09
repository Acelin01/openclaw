# ChatLite React - 使用说明

## 🚀 快速开始

### 访问地址

- **主页**: http://localhost:3002/
- **聊天**: http://localhost:3002/chat

### 当前模式：**演示模式 (Mock)**

当前配置使用 Mock 数据，无需后端即可测试 UI 界面。

---

## 🎯 功能演示

### 1. 访问聊天界面

打开浏览器访问：http://localhost:3002/chat

### 2. 测试技能匹配

在聊天框中输入以下测试消息：

| 输入 | 匹配技能 | 预期响应 |
|------|---------|---------|
| `帮我查下天气` | weather | 🌤️ 天气信息 |
| `写个 Python 代码` | coding | 💻 代码助手 |
| `搜索一下` | search | 🔍 搜索服务 |
| `翻译这句话` | translate | 🌐 翻译服务 |
| 其他消息 | - | 默认响应 |

### 3. 会话管理

- ✅ 创建新会话
- ✅ 切换会话
- ✅ 查看消息历史
- ✅ 删除会话

---

## ⚙️ 切换到真实 API

### 1. 配置环境变量

编辑 `.env` 文件：

```bash
# 关闭 Mock 模式
VITE_USE_MOCK=false

# OpenClaw API 地址
VITE_OPENCLAW_API_URL=http://localhost:8000
```

### 2. 获取认证 Token

```bash
# 登录获取 token（示例）
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"your-password"}'
```

### 3. 在 UI 中设置 Token

（需要添加 Token 设置界面，目前存储在 localStorage）

```javascript
localStorage.setItem('openclaw_token', 'your-token-here');
```

### 4. 重启开发服务器

```bash
pnpm dev
```

---

## 📁 项目结构

```
src-react/
├── components/
│   ├── Chat.tsx          # 聊天主组件 ⭐
│   └── Chat.css          # 样式
├── store/
│   └── chat-store.ts     # Zustand 状态管理
├── lib/
│   ├── openclaw-client.ts        # 真实 API 客户端
│   └── openclaw-client-mock.ts   # Mock 客户端（当前使用）
├── App.tsx               # 应用根组件（路由）
├── main.tsx              # 入口
└── index.css             # 全局样式
```

---

## 🔌 OpenClaw 技能匹配流程

```
用户发送消息
    ↓
Chat 组件 (React)
    ↓
useChatStore (Zustand)
    ↓
openclawClient.sendMessage()
    ↓
[Mock 模式] → 本地技能检测 → 返回 Mock 响应
[真实模式] → POST /api/v1/ai/chat → OpenClaw Gateway
    ↓
OpenClaw 技能匹配引擎
    ↓
执行对应 Skill (如 /skills/weather/SKILL.md)
    ↓
返回响应 → React 渲染（显示技能 badge）
```

---

## 🛠️ 开发命令

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview

# 类型检查
pnpm type-check
```

---

## 📝 待办事项

### 高优先级

- [ ] 添加 Token 设置界面
- [ ] 实现 Markdown 渲染
- [ ] 添加技能面板组件
- [ ] 支持文件上传

### 中优先级

- [ ] 消息搜索功能
- [ ] 主题切换（亮/暗）
- [ ] PWA 支持
- [ ] 消息导出

### 低优先级

- [ ] 语音输入
- [ ] 表情选择器
- [ ] 消息引用回复
- [ ] 聊天记录云同步

---

## 🐛 已知问题

1. **WebSocket 流式响应** - Mock 模式暂不支持
2. **Token 认证** - 需要手动设置 localStorage
3. **错误处理** - 部分 API 错误未友好提示

---

## 📚 相关文档

- [React 迁移指南](./REACT-MIGRATION.md)
- [OpenClaw 文档](https://docs.openclaw.ai)
- [Zustand 文档](https://github.com/pmndrs/zustand)
- [React Router 文档](https://reactrouter.com/)

---

## 💡 提示

- 按 `Enter` 发送消息，`Shift+Enter` 换行
- 点击左侧侧边栏按钮可折叠/展开
- Mock 模式下所有响应都是模拟的，不会调用真实 API
- 切换到真实模式前确保 OpenClaw Gateway 已启动

---

**🎉 Happy Chatting!**
