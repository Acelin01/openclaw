# ChatLite React - OpenClaw Gateway 集成说明

## ✅ 已完成

- ✅ 使用 OpenClaw Gateway (端口 18789)
- ✅ 通过 `/tools/invoke` 端点调用工具
- ✅ 支持 `sessions_list`、`sessions_send`、`sessions_history` 工具
- ✅ 使用 Bearer Token 认证
- ✅ 真实消息发送和接收

## 🔌 技术架构

```
ChatLite React (3002)
    ↓
openclaw-client.ts
    ↓
POST /tools/invoke (18789)
    ↓
OpenClaw Gateway
    ↓
工具执行 (sessions_send, sessions_history, etc.)
    ↓
OpenClaw 智能体 + 技能匹配
    ↓
返回响应
```

## ⚙️ 配置

### 环境变量

`.env` 文件：

```bash
# OpenClaw Gateway 配置
VITE_OPENCLAW_GATEWAY_URL=http://localhost:18789
VITE_OPENCLAW_GATEWAY_TOKEN=test-token
```

### Gateway 认证

Token 位于：`/Users/acelin/Documents/Next/AIGC/openclaw/.env`

```bash
OPENCLAW_GATEWAY_TOKEN=test-token
```

## 🛠️ 使用的工具

| 工具 | 说明 | 参数 |
|------|------|------|
| `sessions_list` | 获取会话列表 | `messageLimit`, `limit` |
| `sessions_send` | 发送消息到会话 | `message`, `sessionKey` |
| `sessions_history` | 获取消息历史 | `sessionKey`, `limit`, `includeTools` |

## 📝 消息格式

### OpenClaw 消息结构

```json
{
  "role": "user|assistant|system",
  "content": [
    {
      "type": "text",
      "text": "消息内容"
    },
    {
      "type": "thinking",
      "thinking": "思考内容"
    }
  ],
  "timestamp": 1234567890
}
```

### React 消息结构

```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;  // 已提取纯文本
  timestamp: number;
  sessionId: string;
  metadata?: {
    skillMatched?: string;
    modelUsed?: string;
  };
}
```

## 🧪 测试

### 1. 访问聊天界面

```
http://localhost:3002/chat
```

### 2. 测试会话列表

```bash
curl -s http://localhost:18789/tools/invoke \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer test-token' \
  -d '{"tool":"sessions_list","args":{}}'
```

### 3. 测试发送消息

```bash
curl -s http://localhost:18789/tools/invoke \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer test-token' \
  -d '{
    "tool":"sessions_send",
    "args":{"message":"帮我查天气","sessionKey":"agent:agent_xulinyi:main"}
  }'
```

### 4. 测试消息历史

```bash
curl -s http://localhost:18789/tools/invoke \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer test-token' \
  -d '{
    "tool":"sessions_history",
    "args":{"sessionKey":"agent:agent_xulinyi:main","limit":10}
  }'
```

## 🔄 消息流程

1. **用户在 React UI 输入消息**
2. **Chat 组件调用 `sendMessage()`**
3. **useChatStore 调用 `openclawClient.sendMessage()`**
4. **客户端调用 Gateway `/tools/invoke`**
   - `tool: "sessions_send"`
   - `args: { message: "...", sessionKey: "..." }`
5. **Gateway 执行工具**
   - 发送到 OpenClaw 智能体
   - 智能体处理消息（技能匹配、模型调用）
6. **返回响应**
7. **React UI 更新显示**

## ⚠️ 注意事项

1. **会话键格式**: `agent:<agent_id>:main`
2. **消息内容**: OpenClaw 返回的 content 是数组，需要提取 text 类型
3. **认证**: 必须提供正确的 Bearer Token
4. **CORS**: 开发时 Vite 代理已配置

## 📁 关键文件

| 文件 | 说明 |
|------|------|
| `src-react/lib/openclaw-client.ts` | Gateway API 客户端 |
| `src-react/store/chat-store.ts` | 聊天状态管理 |
| `src-react/components/Chat.tsx` | 聊天 UI 组件 |
| `.env` | 环境配置 |

## 🚀 启动

```bash
# 1. 确保 Gateway 运行
openclaw gateway status

# 2. 启动 React 开发服务器
cd /Users/acelin/Documents/Next/AIGC/openclaw/apps/chat-lite
pnpm dev

# 3. 访问
http://localhost:3002/chat
```

## 🎯 功能验证

- [x] 加载会话列表
- [x] 发送消息
- [x] 接收响应
- [x] 显示消息历史
- [ ] 技能匹配显示（需要真实技能调用）
- [ ] 流式响应（需要 WebSocket 支持）

---

**更新时间**: 2026-03-09  
**Gateway 端口**: 18789  
**React 端口**: 3002
