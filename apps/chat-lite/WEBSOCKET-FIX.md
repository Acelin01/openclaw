# WebSocket 认证修复指南

## 问题诊断

### 现象

WebSocket 连接后反复断开重连，日志显示：

```
✅ WebSocket 连接成功
🔐 已发送认证
💓 心跳已启动
📥 收到响应：{type: 'event', event: 'connect.challenge', payload: {...}}
🔌 WebSocket 连接关闭
🔄 尝试重连 (1/5)，延迟 1000ms
```

### 根本原因

客户端在收到 `connect.challenge` 事件后，没有按照 OpenClaw Gateway 协议正确响应。

**错误的做法**:
- 连接后立即发送 `auth` 消息
- 收到 challenge 后发送自定义的 `auth.response`

**正确的做法**:
- 等待 server 发送 `connect.challenge`
- 收到 nonce 后发送标准的 `connect` 请求

---

## OpenClaw Gateway 认证协议

### 认证流程

```
Client                          Server
  |                               |
  |--------- TCP Connect -------->|
  |                               |
  |<--- connect.challenge (nonce)-|
  |                               |
  |------ connect (with nonce) --->|
  |                               |
  |<------ connect response ------|
  |                               |
  |<====== 正常通信 ==============>|
```

### 消息格式

**1. Server 发送 Challenge**:
```json
{
  "type": "event",
  "event": "connect.challenge",
  "payload": {
    "nonce": "uuid-string",
    "ts": 1234567890
  }
}
```

**2. Client 响应 Connect**:
```json
{
  "type": "req",
  "id": "connect-123",
  "method": "connect",
  "params": {
    "minProtocol": 1,
    "maxProtocol": 1,
    "client": {
      "id": "webchat",
      "displayName": "ChatLite React",
      "version": "1.0.0",
      "platform": "web",
      "mode": "webchat"
    },
    "auth": {
      "token": "test-token"
    },
    "role": "operator",
    "scopes": ["operator.admin"]
  }
}
```

**关键字段说明**:
- `client.mode`: 必须是 `webchat`, `cli`, `ui`, `backend`, `node`, `probe`, `test` 之一
- `role`: 必须是 `operator` 或 `node`
- `scopes`: operator 的默认 scope 是 `operator.admin`
- `nonce`: 仅在使用 device auth 时需要，普通 token 认证不需要

**3. Server 响应**:
```json
{
  "type": "res",
  "id": "connect-123",
  "payload": {
    "ok": true,
    "client": { ... },
    "scopes": [...]
  }
}
```

---

## 修复内容

### 文件：`src-react/lib/openclaw-ws-client.ts`

#### 1. 移除自动 auth 发送

**修改前**:
```typescript
this.ws.onopen = () => {
  console.log('✅ WebSocket 连接成功');
  this.connectionState = 'connected';
  
  // 发送认证消息 ❌
  this.sendAuth();
  
  this.startPing();
  resolve();
};
```

**修改后**:
```typescript
this.ws.onopen = () => {
  console.log('✅ WebSocket 连接成功');
  this.connectionState = 'connecting';
  
  // 等待 server 发送 connect.challenge ✅
  // 不主动发送 auth
  
  resolve();
};
```

#### 2. 实现 challenge 处理

**新增方法**:
```typescript
private handleChallenge(payload: any): void {
  if (this.ws && this.ws.readyState === WebSocket.OPEN) {
    const nonce = payload?.nonce;
    if (!nonce) {
      console.error('❌ challenge 缺少 nonce');
      return;
    }
    
    // 发送符合 OpenClaw 协议的 connect 请求
    this.ws.send(JSON.stringify({
      type: 'req',
      id: `connect-${Date.now()}`,
      method: 'connect',
      params: {
        minProtocol: 1,
        maxProtocol: 1,
        client: {
          id: 'chat-lite',
          displayName: 'ChatLite React',
          version: '1.0.0',
          platform: 'web',
          mode: 'frontend'
        },
        auth: { token: this.token },
        role: 'user',
        scopes: ['chat.send', 'chat.read', 'sessions.list'],
        nonce: nonce
      }
    }));
    console.log('🔐 已发送 connect 请求');
  }
}
```

#### 3. 更新消息处理器

**修改后**:
```typescript
this.ws.onmessage = (event) => {
  const data: any = JSON.parse(event.data);
  
  // 处理 challenge 认证
  if (data.type === 'event' && data.event === 'connect.challenge') {
    this.handleChallenge(data.payload);
    return;
  }
  
  // 处理 connect 响应
  if (data.type === 'res' && data.method === 'connect') {
    if (data.payload?.ok) {
      console.log('✅ 认证成功，已连接');
      this.connectionState = 'connected';
    } else {
      console.error('❌ 认证失败:', data.payload?.error);
      this.connectionState = 'disconnected';
    }
    return;
  }
  
  // 处理心跳
  if (data.type === 'event' && data.event === 'tick') {
    return;
  }
  
  // 其他消息
  this.messageHandlers.forEach(handler => handler(data));
};
```

---

## 测试方法

### 1. 使用测试页面

访问：http://localhost:3002/test-ws.html

步骤：
1. 输入 WebSocket URL: `ws://localhost:18789/ws`
2. 输入 Token: `test-token`
3. 点击"连接"
4. 观察日志输出

**预期结果**:
```
[10:xx:xx] 📝 尝试连接：ws://localhost:18789/ws
[10:xx:xx] 📝 WebSocket 连接成功
[10:xx:xx] 📝 等待 server 发送 challenge...
[10:xx:xx] 📝 收到：{type: "event", event: "connect.challenge", ...}
[10:xx:xx] 📝 收到 challenge，nonce: xxx...
[10:xx:xx] 📝 已发送 connect 请求
[10:xx:xx] ✅ 认证成功！
```

### 2. 在 ChatLite 中测试

1. 打开 http://localhost:3002/chat
2. 检查浏览器控制台日志
3. 应该看到：
   - ✅ WebSocket 连接成功
   - 🔐 收到挑战，准备响应认证
   - 🔐 已发送 connect 请求
   - ✅ 认证成功，已连接

---

## 参考文档

- OpenClaw Gateway 协议：`/src/gateway/protocol/index.ts`
- Gateway 客户端实现：`/src/gateway/client.ts`
- WebSocket 连接处理：`/src/gateway/server/ws-connection.ts`
- 消息处理器：`/src/gateway/server/ws-connection/message-handler.ts`

---

## 常见问题

### Q: 为什么不能直接发送 auth 消息？

A: OpenClaw Gateway 使用 challenge-response 认证机制来防止重放攻击。Server 需要先生成 nonce，client 用这个 nonce 进行签名或包含在请求中，证明是实时连接而非重放。

### Q: Token 在哪里配置？

A: 在 `.env` 文件中：
```bash
VITE_OPENCLAW_GATEWAY_TOKEN=test-token
```

Gateway 配置在 `/Users/acelin/Documents/Next/AIGC/openclaw/.openclaw-local/openclaw.json`:
```json
{
  "gateway": {
    "auth": {
      "token": "test-token",
      "mode": "token"
    }
  }
}
```

### Q: 如果还是连接失败怎么办？

A: 检查以下步骤：
1. 确认 Gateway 正在运行：`ps aux | grep openclaw-gateway`
2. 检查 Gateway 日志：查看是否有认证错误
3. 验证 Token 是否匹配
4. 检查防火墙/网络设置

---

**修复时间**: 2026-03-10  
**修复文件**: `apps/chat-lite/src-react/lib/openclaw-ws-client.ts`  
**测试工具**: `apps/chat-lite/test-ws.html`
