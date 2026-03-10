# Bug 修复：缺少 Authorization Header

## 问题

**现象**: 
```
POST http://localhost:3002/tools/invoke 500 (Internal Server Error)
```

**原因**: 
`openclaw-client.ts` 的 `sendMessage` 方法缺少 `Authorization` header，导致 Gateway 拒绝请求。

## 修复对比

### 修复前 ❌

```typescript
async sendMessage(request: ChatRequest): Promise<ChatResponse> {
  const response = await fetch('/tools/invoke', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // ❌ 缺少 Authorization header
    },
    body: JSON.stringify({
      tool: 'sessions_send',
      args: { message, sessionKey },
      sessionKey,
    }),
  });
}
```

### 修复后 ✅

```typescript
async sendMessage(request: ChatRequest): Promise<ChatResponse> {
  const response = await fetch('/tools/invoke', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`,  // ✅ 添加认证
    },
    body: JSON.stringify({
      tool: 'sessions_send',
      args: { message, sessionKey },
      sessionKey,
    }),
  });
}
```

## 影响范围

- **文件**: `apps/chat-lite/src-react/lib/openclaw-client.ts`
- **方法**: `sendMessage()`
- **影响功能**: 所有通过客户端发送的消息

## 测试

### 1. 直接测试 Gateway

```bash
curl -X POST http://localhost:18789/tools/invoke \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d '{"tool":"sessions_send","args":{"message":"test","sessionKey":"agent:agent_xulinyi:main"}}'
```

**预期**: 返回 `{"ok":true,...}`

### 2. 在 ChatLite 中测试

1. 打开 http://localhost:3002/chat
2. 发送一条消息
3. 检查浏览器控制台 - 不应该有 500 错误
4. 应该看到消息成功发送并收到响应

## 相关修复

确保所有 API 调用都包含认证：

| 方法 | 状态 | 说明 |
|------|------|------|
| `invokeTool()` | ✅ | 已包含 Authorization |
| `sendMessage()` | ✅ | 已修复 |
| `getSessions()` | ✅ | 使用 invokeTool |
| `getSessionMessages()` | ✅ | 使用 invokeTool |

## 最佳实践

**所有 Gateway API 调用都应该包含认证 header**:

```typescript
private getHeaders(): HeadersInit {
  return { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.token}`
  };
}
```

在 fetch 调用中使用：

```typescript
const response = await fetch('/tools/invoke', {
  method: 'POST',
  headers: this.getHeaders(),
  body: JSON.stringify(payload),
});
```

---

**修复时间**: 2026-03-10 11:15  
**状态**: ✅ 已修复
