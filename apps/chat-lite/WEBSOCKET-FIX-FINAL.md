# WebSocket 认证最终修复

## 问题历程

### 第一轮：协议理解错误
**现象**: WebSocket 连接后反复断开
**原因**: 收到 `connect.challenge` 后发送了错误的响应格式
**修复**: 实现正确的 challenge/response 流程

### 第二轮：参数验证失败
**现象**: 返回 `ok: false` 错误
**原因**: connect 请求参数不符合 Gateway 协议要求

**发现的问题**:
1. ❌ `mode: 'frontend'` - 不是有效的 mode
2. ❌ `role: 'user'` - 不是有效的 role
3. ❌ `scopes: ['chat.send', 'chat.read']` - 不符合 role 的默认 scope
4. ❌ 包含 `nonce` 在顶层 - 仅 device auth 需要

## 最终解决方案

### 正确的 Connect 请求格式

```json
{
  "type": "req",
  "id": "connect-1773112xxx",
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

### 关键参数说明

| 参数 | 有效值 | 说明 |
|------|--------|------|
| `client.mode` | `webchat`, `cli`, `ui`, `backend`, `node`, `probe`, `test` | 客户端模式 |
| `role` | `operator`, `node` | 用户角色 |
| `scopes` | 根据 role 自动分配 | operator 默认 `operator.admin` |
| `nonce` | 可选 | 仅 device auth 需要，普通 token 认证不需要 |

### 代码位置

**文件**: `apps/chat-lite/src-react/lib/openclaw-ws-client.ts`

**关键方法**:
```typescript
private handleChallenge(payload: any): void {
  const nonce = payload?.nonce;
  
  this.ws.send(JSON.stringify({
    type: 'req',
    id: `connect-${Date.now()}`,
    method: 'connect',
    params: {
      minProtocol: 1,
      maxProtocol: 1,
      client: {
        id: 'webchat',
        displayName: 'ChatLite React',
        version: '1.0.0',
        platform: 'web',
        mode: 'webchat'  // ✅ 有效 mode
      },
      auth: { token: this.token },
      role: 'operator',  // ✅ 有效 role
      scopes: ['operator.admin']  // ✅ 默认 scope
    }
  }));
}
```

## 认证流程

```
Client                              Gateway
  |                                    |
  |---------- TCP Connect ------------>|
  |                                    |
  |<--- event: connect.challenge ------|
  |     { nonce: "uuid", ts: xxx }     |
  |                                    |
  |------ req: connect (with token) -->|
  |     {                              |
  |       client: { mode: "webchat" },|
  |       auth: { token: "xxx" },      |
  |       role: "operator",            |
  |       scopes: ["operator.admin"]   |
  |     }                              |
  |                                    |
  |<----- res: connect (ok) -----------|
  |     { ok: true, ... }              |
  |                                    |
  |<==== 正常通信 (req/res/event) =====>|
```

## 测试方法

### 1. 使用测试页面

访问：http://localhost:3002/test-ws.html

**预期日志**:
```
[10:xx:xx] 📝 尝试连接：ws://localhost:18789/ws
[10:xx:xx] 📝 WebSocket 连接成功
[10:xx:xx] 📝 收到：{type: "event", event: "connect.challenge", ...}
[10:xx:xx] 📝 收到 challenge，nonce: xxx...
[10:xx:xx] 📝 已发送 connect 请求
[10:xx:xx] 📝 收到：{type: "res", payload: {ok: true, ...}}
[10:xx:xx] ✅ 认证成功！
```

### 2. 在 ChatLite 中

打开浏览器控制台，访问 http://localhost:3002/chat

**预期日志**:
```
✅ WebSocket 连接成功
📥 收到响应：{type: 'event', event: 'connect.challenge', ...}
🔐 收到挑战，准备响应认证
🔐 已发送 connect 请求
📥 收到响应：{type: 'res', ok: true, ...}
✅ 认证成功，已连接
```

## 参考文档

- Gateway 协议定义：`src/gateway/protocol/schema/frames.ts`
- Client mode 定义：`src/gateway/protocol/client-info.ts`
- 认证逻辑：`src/gateway/auth.ts`
- Connect 处理：`src/gateway/server/ws-connection/message-handler.ts`

## 常见问题

### Q: 为什么 role 不能是 'user'？

A: Gateway 的 role 系统设计用于区分不同类型的连接：
- `operator`: 管理员/操作员，可以执行各种操作
- `node`: 远程节点，用于分布式部署

普通的 Web 客户端使用 `operator` role，配合 scopes 限制权限。

### Q: 如何限制客户端权限？

A: 通过 scopes 控制：
```typescript
scopes: ['operator.admin']  // 完全权限
// 或自定义 scope，需要在 Gateway 配置中定义
```

### Q: Device auth 是什么？

A: Device auth 是一种更安全的认证方式，使用非对称加密：
1. Client 生成密钥对
2. Server 保存公钥
3. Client 用私钥签名请求
4. Server 验证签名

普通 Token 认证已经足够用于开发环境。

---

**修复完成时间**: 2026-03-10 11:00  
**状态**: ✅ 已验证通过
