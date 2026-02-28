# ChatLite

基于 Lit 构建的 OpenClaw 轻量级聊天应用，与 `ui/` 采用相同的架构模式。

## 功能特性

- 🔌 **Gateway 连接** - 使用 `GatewayBrowserClient` 连接到 OpenClaw Gateway
- 🤖 **技能匹配** - 自动匹配用户输入到合适的技能
- 📋 **需求文档** - 创建和管理项目需求文档
- 🎨 **Artifact 查看器** - 显示技能生成的 artifact 内容
- ⚡ **实时通信** - WebSocket 实时消息推送

## 架构

```
┌─────────────────────────────────────────────────────────────┐
│                        ChatLite App                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │ Chat Client │  │ Skill Matcher│  │ Requirement Manager │ │
│  │             │  │              │  │                     │ │
│  │ - connect   │  │ - match()    │  │ - createDraft()     │ │
│  │ - sendMsg   │  │ - parse()    │  │ - submitReview()    │ │
│  │ - invoke    │  │ - extract()  │  │ - approve()         │ │
│  └──────┬──────┘  └──────┬───────┘  └──────────┬──────────┘ │
│         │                │                      │            │
│         └────────────────┼──────────────────────┘            │
│                          │                                   │
│              ┌───────────▼───────────┐                       │
│              │   GatewayBrowserClient │                       │
│              │      (WebSocket)       │                       │
│              └───────────┬───────────┘                       │
└──────────────────────────┼───────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │  Gateway    │
                    │  (:18789)   │
                    └─────────────┘
```

## 快速开始

### 安装依赖

```bash
cd apps/chat-lite
pnpm install
```

### 开发模式

```bash
pnpm dev
```

访问 http://localhost:3000

### 构建

```bash
pnpm build
```

## 核心模块

### ChatClient (`src/client/chat-client.ts`)

封装与 Gateway 的通信逻辑：

```typescript
import { chatClient } from "./client/chat-client";

// 连接
await chatClient.connect("ws://localhost:18789");

// 发送消息
await chatClient.sendMessage("Hello");

// 获取技能列表
const skills = await chatClient.getAvailableSkills();

// 调用技能
await chatClient.invokeSkill("project-manager", {
  action: "create-requirement",
  title: "新功能",
  description: "..."
});

// 监听消息
chatClient.onMessage((msg) => {
  console.log("New message:", msg);
});
```

### SkillMatcher (`src/services/skill-matcher.ts`)

智能匹配用户输入到技能：

```typescript
import { skillMatcher } from "./services/skill-matcher";

// 设置技能列表
skillMatcher.setSkills([
  { name: "project-manager", description: "项目管理..." }
]);

// 匹配技能
const matches = skillMatcher.match("创建一个新项目需求");
// => [{ skill: {...}, confidence: 0.8, extractedParams: {...} }]

// 解析技能调用
const parsed = skillMatcher.parseSkillCall("@project-manager 创建需求");
// => { skillName: "project-manager", params: {...} }
```

### RequirementManager (`src/services/requirement-manager.ts`)

管理需求文档生命周期：

```typescript
import { requirementManager } from "./services/requirement-manager";

// 创建草稿
const draft = requirementManager.createDraft(
  "登录功能",
  "用户需要通过邮箱登录",
  ["project-manager"]
);

// 提交审核
requirementManager.submitForReview(draft.id);

// 审核通过
requirementManager.reviewRequirement(draft.id, true);

// 转换为正式需求
const requirement = requirementManager.approveToRequirement(draft);
```

### Artifact 组件

基于 Lit 的 Web Components：

- `chatlite-project-requirement` - 项目需求文档查看器
- `chatlite-artifact-viewer` - 通用 artifact 查看器

```typescript
// 在 HTML 中使用
<chatlite-project-requirement
  .content=${{
    kind: "project-requirement",
    requirement: {...},
    editable: true
  }}
></chatlite-project-requirement>
```

## 技能调用格式

### 1. @提及格式
```
@project-manager create 标题：登录功能 描述：用户需要通过邮箱登录
```

### 2. /命令格式
```
/project-manager create 标题：登录功能
```

### 3. 自然语言
```
帮我创建一个登录功能的需求文档
```

## 与 OpenClaw Gateway 集成

### 可用 RPC 方法

| 方法 | 参数 | 说明 |
|------|------|------|
| `connect` | client info | 连接到 Gateway |
| `chat.send` | { message } | 发送聊天消息 |
| `skills.list` | {} | 获取可用技能 |
| `skill.{name}` | params | 调用指定技能 |

### 事件监听

```typescript
chatClient.onEvent((evt) => {
  if (evt.event === "chat.message") {
    console.log("Received:", evt.payload);
  }

  if (evt.event === "skills.updated") {
    console.log("Skills updated:", evt.payload);
  }
});
```

## 项目结构

```
apps/chat-lite/
├── src/
│   ├── client/
│   │   └── chat-client.ts       # Gateway 客户端
│   ├── services/
│   │   ├── skill-matcher.ts     # 技能匹配服务
│   │   └── requirement-manager.ts # 需求管理
│   ├── artifacts/
│   │   ├── project-requirement/
│   │   │   └── element.tsx      # 需求文档组件
│   │   └── viewer.ts            # Artifact 查看器
│   ├── components/
│   │   └── app.ts               # 主应用组件
│   ├── lib/
│   │   └── utils.ts             # 工具函数
│   └── main.ts                  # 入口文件
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 扩展 Artifact

添加新的 artifact 类型：

1. 创建组件 `src/artifacts/{name}/element.tsx`
2. 注册到 `src/artifacts/viewer.ts`
3. 在 `src/main.ts` 中导入

```typescript
// src/artifacts/my-artifact/element.tsx
@customElement("chatlite-my-artifact")
export class MyArtifact extends LitElement {
  @property({ type: Object })
  content: MyArtifactContent | null = null;

  render() {
    return html`<div>...</div>`;
  }
}

// src/artifacts/viewer.ts
switch (this.content.kind) {
  case "my-artifact":
    return html`<chatlite-my-artifact ...></chatlite-my-artifact>`;
}
```

## License

MIT
