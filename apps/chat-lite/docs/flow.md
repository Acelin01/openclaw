# ChatLite 技能调用流程

## 整体流程

```
用户输入
    │
    ▼
┌─────────────────┐
│  SkillMatcher   │
│  parseSkillCall │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
有技能调用   无技能调用
    │         │
    ▼         ▼
┌─────────┐  ┌──────────────┐
│Create   │  │SendMessage   │
│Draft    │  │to Gateway    │
└────┬────┘  └──────────────┘
     │
     ▼
┌─────────────────┐
│RequirementMgr   │
│submitForReview  │
└────────┬────────┘
         │
         ▼
    ┌────┴────┐
    │         │
    ▼         ▼
  提交      批准
    │         │
    ▼         ▼
┌────────┐ ┌──────────────┐
│Gateway │ │Generate      │
│Skill   │ │Artifact      │
│Invoke  │ │Display       │
└────────┘ └──────────────┘
```

## 消息处理流程

### 1. 用户输入处理

```typescript
// 用户输入示例
"@project-manager 创建需求 标题：登录功能 描述：用户需要邮箱登录"

// SkillMatcher 解析
parseSkillCall(input) {
  // 1. 检测 @ 提及
  mentionMatch = input.match(/@(\S+)\s*(.*)/)

  // 2. 提取技能名和参数
  skillName = "project-manager"
  rest = "创建需求 标题：登录功能 描述：用户需要邮箱登录"

  // 3. 解析 action 和 params
  action = "create"
  params = {
    title: "登录功能",
    description: "用户需要邮箱登录"
  }

  return { skillName, action, params, rawInput }
}
```

### 2. 需求草稿创建

```typescript
// RequirementManager 创建草稿
createDraft(title, description, skills, params) {
  draft = {
    id: generateUUID(),
    title: "登录功能",
    description: "用户需要邮箱登录",
    skills: ["project-manager"],
    status: "draft",
    createdAt: Date.now()
  }

  drafts.set(draft.id, draft)
  return draft
}
```

### 3. Gateway 通信

```typescript
// ChatClient 发送请求
async invokeSkill(skillName, params) {
  // 通过 WebSocket 发送 RPC 请求
  const result = await client.request(`skill.${skillName}`, {
    action: params.action,
    ...params
  })

  return result
}
```

### 4. Artifact 显示

```typescript
// Gateway 返回 artifact 内容
onEvent(evt) {
  if (evt.event === "chat.message") {
    msg = {
      role: "assistant",
      content: "已创建需求文档",
      artifact: {
        kind: "project-requirement",
        content: JSON.stringify(requirement)
      }
    }

    // 显示 artifact
    currentArtifact = {
      kind: msg.artifact.kind,
      data: JSON.parse(msg.artifact.content)
    }
  }
}
```

## 状态流转

### 需求文档状态

```
draft ──submitForReview──> pending_review ──approve──> approved
                              │
                              └─────reject────> rejected
```

### 连接状态

```
disconnected ──connect()──> connecting ──onHello──> connected
                                │
                                └──timeout/error──> disconnected
```

## 参数提取规则

### 中文格式

```
标题：[内容]     -> params.title = [内容]
描述：[内容]     -> params.description = [内容]
项目：[内容]     -> params.projectName = [内容]
```

### Key-Value 格式

```
title=登录功能   -> params.title = "登录功能"
desc=...         -> params.desc = "..."
```

### 自然语言推断

```
"创建一个登录功能" -> params.content = "创建一个登录功能"
                    skillMatcher 推断可能需要的技能
```

## 扩展点

### 添加新技能

1. 在 Gateway 注册技能
2. 更新 `SkillMatcher` 的关键词匹配逻辑
3. 创建对应的 Artifact 组件

### 添加新的 Artifact 类型

1. 创建 `src/artifacts/{name}/element.tsx`
2. 实现 Lit 组件
3. 在 `viewer.ts` 中添加 case 分支
4. 在 `main.ts` 中导入注册
