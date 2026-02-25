---
name: imsg
description: 用于列出聊天、历史、监听与发送的 iMessage/SMS CLI。
homepage: https://imsg.to
metadata:
  {
    "openclaw":
      {
        "emoji": "📨",
        "os": ["darwin"],
        "requires": { "bins": ["imsg"] },
        "install":
          [
            {
              "id": "brew",
              "kind": "brew",
              "formula": "steipete/tap/imsg",
              "bins": ["imsg"],
              "label": "Install imsg (brew)",
            },
          ],
      },
  }
---

# imsg 动作

## 概览

使用 `imsg` 在 macOS 上读取与发送 Messages.app 的 iMessage/SMS。

前置条件：Messages.app 已登录；终端具备“完全磁盘访问”权限；发送需要“自动化”权限以控制 Messages.app。

## 需要收集的输入

- `send` 的接收方（手机号/邮箱）
- `history/watch` 的 `chatId`（来自 `imsg chats --limit 10 --json`）
- 发送内容 `text` 与可选 `file` 路径

## 动作

### 列出聊天

```bash
imsg chats --limit 10 --json
```

### 获取聊天记录

```bash
imsg history --chat-id 1 --limit 20 --attachments --json
```

### 监听聊天

```bash
imsg watch --chat-id 1 --attachments
```

### 发送消息

```bash
imsg send --to "+14155551212" --text "hi" --file /path/pic.jpg
```

## 说明

- `--service imessage|sms|auto` 控制发送通道。
- 发送前确认收件人与内容。

## 可尝试的用法

- 用 `imsg chats --limit 10 --json` 查找 chat id。
- 监听高优先级聊天以实时获取新消息。
