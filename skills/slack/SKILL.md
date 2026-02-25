---
name: slack
description: 需要通过 slack 工具控制 Slack 时使用，包括消息反应、固定/取消固定频道或私信中的项目。
metadata: { "openclaw": { "emoji": "💬", "requires": { "config": ["channels.slack"] } } }
---

# Slack 动作

## 概览

使用 `slack` 来添加反应、管理置顶、发送/编辑/删除消息并获取成员信息。该工具使用 OpenClaw 配置的机器人 token。

## 需要收集的输入

- `channelId` 与 `messageId`（Slack 消息时间戳，例如 `1712023032.1234`）。
- 反应需要 `emoji`（Unicode 或 `:name:`）。
- 发送消息需要 `to`（`channel:<id>` 或 `user:<id>`）与 `content`。

消息上下文行包含 `slack message id` 与 `channel` 字段，可直接复用。

## 动作

### 动作分组

| Action group | Default | Notes                  |
| ------------ | ------- | ---------------------- |
| reactions    | enabled | React + list reactions |
| messages     | enabled | Read/send/edit/delete  |
| pins         | enabled | Pin/unpin/list         |
| memberInfo   | enabled | Member info            |
| emojiList    | enabled | Custom emoji list      |

### 添加反应

```json
{
  "action": "react",
  "channelId": "C123",
  "messageId": "1712023032.1234",
  "emoji": "✅"
}
```

### 列出反应

```json
{
  "action": "reactions",
  "channelId": "C123",
  "messageId": "1712023032.1234"
}
```

### 发送消息

```json
{
  "action": "sendMessage",
  "to": "channel:C123",
  "content": "Hello from OpenClaw"
}
```

### 编辑消息

```json
{
  "action": "editMessage",
  "channelId": "C123",
  "messageId": "1712023032.1234",
  "content": "Updated text"
}
```

### 删除消息

```json
{
  "action": "deleteMessage",
  "channelId": "C123",
  "messageId": "1712023032.1234"
}
```

### 读取最近消息

```json
{
  "action": "readMessages",
  "channelId": "C123",
  "limit": 20
}
```

### 置顶消息

```json
{
  "action": "pinMessage",
  "channelId": "C123",
  "messageId": "1712023032.1234"
}
```

### 取消置顶

```json
{
  "action": "unpinMessage",
  "channelId": "C123",
  "messageId": "1712023032.1234"
}
```

### 列出置顶项目

```json
{
  "action": "listPins",
  "channelId": "C123"
}
```

### 成员信息

```json
{
  "action": "memberInfo",
  "userId": "U123"
}
```

### 表情列表

```json
{
  "action": "emojiList"
}
```

## 可尝试的用法

- 用 ✅ 标记已完成任务。
- 置顶关键决策或周报。
