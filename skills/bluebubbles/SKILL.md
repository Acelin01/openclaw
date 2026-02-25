---
name: bluebubbles
description: 需要通过 BlueBubbles 发送或管理 iMessage 时使用（推荐的 iMessage 集成），调用通用 message 工具并设置 channel="bluebubbles"。
metadata: { "openclaw": { "emoji": "🫧", "requires": { "config": ["channels.bluebubbles"] } } }
---

# BlueBubbles 动作

## 概览

BlueBubbles 是 OpenClaw 推荐的 iMessage 集成。使用 `message` 工具并设置 `channel: "bluebubbles"` 来发送消息和管理 iMessage 会话：发送文本与附件、回应（Tapback）、编辑/撤回、线程回复，以及管理群聊成员/名称/图标。

## 需要收集的输入

- `target`（优先 `chat_guid:...`；也可用 E.164 格式 `+15551234567` 或 `user@example.com`）
- `message` 用于发送/编辑/回复的文本
- `messageId` 用于回应/编辑/撤回/回复
- 附件本地文件用 `path`，或 base64 用 `buffer` + `filename`

如果用户表述含糊（如“给我妈发消息”），请询问收件人标识或 chat guid 与具体内容。

## 动作

### 发送消息

```json
{
  "action": "send",
  "channel": "bluebubbles",
  "target": "+15551234567",
  "message": "hello from OpenClaw"
}
```

### 回应（Tapback）

```json
{
  "action": "react",
  "channel": "bluebubbles",
  "target": "+15551234567",
  "messageId": "<message-guid>",
  "emoji": "❤️"
}
```

### 移除回应

```json
{
  "action": "react",
  "channel": "bluebubbles",
  "target": "+15551234567",
  "messageId": "<message-guid>",
  "emoji": "❤️",
  "remove": true
}
```

### 编辑已发送消息

```json
{
  "action": "edit",
  "channel": "bluebubbles",
  "target": "+15551234567",
  "messageId": "<message-guid>",
  "message": "updated text"
}
```

### 撤回消息

```json
{
  "action": "unsend",
  "channel": "bluebubbles",
  "target": "+15551234567",
  "messageId": "<message-guid>"
}
```

### 回复指定消息

```json
{
  "action": "reply",
  "channel": "bluebubbles",
  "target": "+15551234567",
  "replyTo": "<message-guid>",
  "message": "replying to that"
}
```

### 发送附件

```json
{
  "action": "sendAttachment",
  "channel": "bluebubbles",
  "target": "+15551234567",
  "path": "/tmp/photo.jpg",
  "caption": "here you go"
}
```

### 发送带 iMessage 效果的消息

```json
{
  "action": "sendWithEffect",
  "channel": "bluebubbles",
  "target": "+15551234567",
  "message": "big news",
  "effect": "balloons"
}
```

## 说明

- 需要配置网关 `channels.bluebubbles`（serverUrl/password/webhookPath）。
- 可用 `chat_guid` 时优先使用（特别是群聊）。
- BlueBubbles 支持丰富动作，但部分受 macOS 版本影响（例如编辑在 macOS 26 Tahoe 可能不可用）。
- 网关可能暴露短 ID 和完整 ID；完整 ID 在重启后更稳定。
- 插件开发参考在 `extensions/bluebubbles/README.md`。

## 可尝试的用法

- 用 Tapback 回应以确认请求。
- 当用户引用特定消息时用线程回复。
- 发送带简短说明的文件附件。
