# ChatLite 流程验证报告

## ✅ 运行状态

| 组件 | 状态 | 端口 | 进程 |
|------|------|------|------|
| Gateway | 🟢 运行中 | 18789 | PID 96102 |
| ChatLite Dev Server | 🟢 运行中 | 3000 | PID 66994 |

---

## 📋 完整流程验证

### 流程 1: 用户发送消息 → Gateway 接收

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
│  用户输入    │ ──► │  chat-client.ts │ ──► │  WebSocket   │
│  (UI Input)  │     │  sendMessage()  │     │  (port 18789)│
└──────────────┘     └─────────────────┘     └──────────────┘
```

**代码路径:**
```typescript
// src/components/app.ts: _sendMessage()
await chatClient.sendMessage(content);

// src/client/chat-client.ts: sendMessage()
await this.client.request("chat.send", {
  message,
  timestamp: Date.now(),
});

// src/lib/gateway.ts: request()
this.ws.send(JSON.stringify({ type: "req", id, method, params }));
```

---

### 流程 2: 技能匹配与解析

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
│  用户输入    │ ──► │ skill-matcher.ts│ ──► │ ParsedSkill  │
│  (文本)      │     │  parseSkillCall │     │  Call 对象   │
└──────────────┘     └─────────────────┘     └──────────────┘
```

**支持的调用格式:**

| 格式 | 示例 | 置信度 |
|------|------|--------|
| @提及 | `@project-manager 创建需求` | 高 |
| /命令 | `/project-manager create` | 高 |
| 自然语言 | `帮我创建一个项目` | 中 (关键词匹配) |

**代码路径:**
```typescript
// src/services/skill-matcher.ts: parseSkillCall()

// 1. @提及格式检测
const mentionMatch = userInput.match(/@(\S+)\s*(.*)/);

// 2. /命令格式检测
const commandMatch = userInput.match(/^\/(\S+)\s*(.*)/);

// 3. 自然语言匹配 (关键词 + 描述匹配)
const matches = this.match(userInput);
```

**参数提取:**
- `标题：xxx` → `params.title`
- `描述：xxx` → `params.description`
- `项目：xxx` → `params.projectName`

---

### 流程 3: 技能调用 → Gateway 处理

```
┌─────────────────┐     ┌──────────────┐     ┌──────────────┐
│  invokeSkill()  │ ──► │  Gateway     │ ──► │  Skill       │
│  (chat-client)  │     │  Router      │     │  Executor    │
└─────────────────┘     └──────────────┘     └──────────────┘
```

**代码路径:**
```typescript
// src/components/app.ts: _sendMessage()
await chatClient.invokeSkill(parsedCall.skillName, {
  action: parsedCall.action,
  ...parsedCall.params,
});

// src/client/chat-client.ts: invokeSkill()
return this.client.request(`skill.${skillName}`, params);
```

---

### 流程 4: 需求草稿创建 (本地)

```
┌──────────────┐     ┌─────────────────────┐     ┌──────────────┐
│  ParsedSkill │ ──► │ requirement-manager │ ──► │ Requirement  │
│  Call        │     │  createDraft()      │     │  Draft       │
└──────────────┘     └─────────────────────┘     └──────────────┘
```

**代码路径:**
```typescript
// src/components/app.ts: _sendMessage()
const draft = requirementManager.createDraft(
  parsedCall.params.title as string || "新需求",
  parsedCall.params.description as string || content,
  [parsedCall.skillName],
  parsedCall.params
);

// src/services/requirement-manager.ts: createDraft()
this.drafts.set(draft.id, draft);
```

**草稿状态流转:**
```
draft → pending_review → approved → ProjectRequirement
                      → rejected
```

---

### 流程 5: 消息接收与 Artifact 显示

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
│  Gateway     │ ──► │  chat-client.ts │ ──► │  app.ts      │
│  Event       │     │  handleEvent()  │     │  _handleMsg  │
└──────────────┘     └─────────────────┘     └──────────────┘
                              │
                              ▼
                     ┌─────────────────┐
                     │  artifact-viewer│
                     │  (Lit Component)│
                     └─────────────────┘
```

**代码路径:**
```typescript
// src/lib/gateway.ts: handleMessage()
if (frame.type === "event" && evt.event === "chat.message") {
  this.eventHandler?.(evt);
}

// src/client/chat-client.ts: handleEvent()
case "chat.message":
  const msg: ChatMessage = {
    id: payload.id,
    role: payload.role || "assistant",
    content: payload.content || "",
    artifact: payload.artifact,  // ← Artifact 数据
  };
  this.messageHandlers.forEach((h) => h(msg));

// src/components/app.ts: _handleIncomingMessage()
if (msg.artifact) {
  this.currentArtifact = {
    kind: msg.artifact.kind,
    data: JSON.parse(msg.artifact.content),
  };
}
```

---

### 流程 6: Artifact 渲染

```
┌─────────────────┐     ┌─────────────────────┐     ┌──────────────┐
│  ArtifactContent│ ──► │  artifact-viewer.ts │ ──► │  Specific    │
│  (kind + data)  │     │  switch(kind)       │     │  Component   │
└─────────────────┘     └─────────────────────┘     └──────────────┘
```

**代码路径:**
```typescript
// src/artifacts/viewer.ts: render()
switch (this.content.kind) {
  case "project-requirement":
    return html`
      <chatlite-project-requirement
        .content=${{
          kind: "project-requirement",
          requirement: data.requirement,
          editable: this.editable,
        }}
      ></chatlite-project-requirement>
    `;
}

// src/artifacts/project-requirement/element.tsx
@customElement("chatlite-project-requirement")
export class ProjectRequirementArtifact extends LitElement {
  render() {
    // 渲染需求文档 UI (标题、状态、描述、元数据)
  }
}
```

---

## 🗂️ 核心模块关系

```
apps/chat-lite/src/
├── components/
│   └── app.ts                    # 主应用组件 (UI + 状态管理)
├── client/
│   └── chat-client.ts            # Gateway 通信封装
├── services/
│   ├── skill-matcher.ts          # 技能匹配与解析
│   └── requirement-manager.ts    # 需求文档管理
├── artifacts/
│   ├── viewer.ts                 # Artifact 查看器 (路由)
│   └── project-requirement/
│       └── element.tsx           # 需求文档组件
└── lib/
    ├── gateway.ts                # WebSocket 客户端
    └── utils.ts                  # 工具函数
```

---

## 🔌 Gateway 通信协议

### 连接流程
```
1. WebSocket 连接 ws://localhost:18789
2. 接收 "connect.challenge" 事件 (含 nonce)
3. 发送 "connect" 请求 (含 token)
4. 接收 "hello-ok" 响应 → 连接成功
```

### RPC 方法
| 方法 | 参数 | 说明 |
|------|------|------|
| `chat.send` | `{ message, timestamp }` | 发送聊天消息 |
| `skills.list` | `{}` | 获取可用技能列表 |
| `skill.{name}` | `params` | 调用指定技能 |

### 事件订阅
| 事件 | Payload | 说明 |
|------|---------|------|
| `chat.message` | `{ role, content, artifact? }` | 新消息 |
| `skills.updated` | `{ skills }` | 技能列表更新 |

---

## 🧪 测试用例

### 测试 1: 普通消息发送
```
输入: "你好"
预期: 
  - 消息发送到 Gateway
  - 收到 assistant 回复
  - 无 artifact 显示
```

### 测试 2: @技能调用
```
输入: "@project-manager 创建需求 标题：登录功能 描述：用户邮箱登录"
预期:
  - 解析出 skillName: "project-manager"
  - 创建草稿 (状态: draft)
  - 调用 skill.project-manager RPC
  - 待审核列表显示草稿
  - 批准后 artifact 面板显示需求文档
```

### 测试 3: 自然语言匹配
```
输入: "帮我创建一个项目需求文档"
预期:
  - skill-matcher 匹配到 project-manager (置信度 > 0.5)
  - 同上流程
```

### 测试 4: Artifact 查看
```
前置: 已批准的需求文档
操作: 点击消息中的 artifact 链接
预期:
  - artifact 面板显示 chatlite-project-requirement 组件
  - 显示标题、状态徽章、描述、元数据
```

---

## 🐛 已知问题/注意事项

1. **本地模式降级**: Gateway 未连接时使用 `_handleLocalResponse()` 模拟响应
2. **Artifact 解析**: `JSON.parse(msg.artifact.content)` 可能失败 (需错误处理)
3. **技能匹配阈值**: 置信度 > 0.3 才显示，> 0.5 才自动调用
4. **WebSocket 重连**: 当前无自动重连逻辑

---

## 📊 性能指标

| 指标 | 目标 | 当前 |
|------|------|------|
| WebSocket 连接延迟 | < 100ms | - |
| 技能匹配耗时 | < 50ms | - |
| Artifact 渲染 | < 200ms | - |
| 消息端到端延迟 | < 500ms | - |

---

## ✅ 验证清单

- [x] Gateway 运行在 18789 端口
- [x] ChatLite Dev Server 运行在 3000 端口
- [x] WebSocket 客户端实现完整
- [x] 技能匹配器支持 3 种调用格式
- [x] 需求管理器支持完整状态流转
- [x] Artifact 查看器支持 project-requirement 类型
- [x] 组件使用 Lit 框架正确注册

---

*生成时间: 2025-02-28*
*验证工具: OpenClaw ChatLite v0.1.0*
