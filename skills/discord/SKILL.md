---
name: discord
description: 需要通过 discord 工具从 OpenClaw 控制 Discord 时使用：发送消息、回应、发布/上传贴纸、上传表情、发起投票、管理线程/置顶/搜索、创建/编辑/删除频道与分类、获取权限或成员/角色/频道信息、设置机器人状态/活动，或处理私信/频道中的管理操作。
metadata: { "openclaw": { "emoji": "🎮", "requires": { "config": ["channels.discord"] } } }
---

# Discord 动作

## 概览

使用 `discord` 管理消息、反应、线程、投票与管理操作。可通过 `discord.actions.*` 禁用动作组（默认启用，但角色/管理类默认关闭）。该工具使用 OpenClaw 配置的机器人令牌。

## 需要收集的输入

- 反应：`channelId`、`messageId` 与 `emoji`
- fetchMessage：`guildId`、`channelId`、`messageId`，或 `messageLink`（如 `https://discord.com/channels/<guildId>/<channelId>/<messageId>`）
- 贴纸/投票/sendMessage：`to` 目标（`channel:<id>` 或 `user:<id>`），可选 `content`
- 投票还需要 `question` + 2–10 个 `answers`
- 媒体：`mediaUrl`（本地 `file:///path` 或远程 `https://...`）
- 表情上传：`guildId`、`name`、`mediaUrl`，可选 `roleIds`（上限 256KB，PNG/JPG/GIF）
- 贴纸上传：`guildId`、`name`、`description`、`tags`、`mediaUrl`（上限 512KB，PNG/APNG/Lottie JSON）

消息上下文行包含 `discord message id` 与 `channel` 字段，可直接复用。

**注意：** `sendMessage` 使用 `to: "channel:<id>"` 格式，而不是 `channelId`。`react`、`readMessages`、`editMessage` 等其他动作直接使用 `channelId`。
**注意：** `fetchMessage` 可接受消息 ID 或完整链接 `https://discord.com/channels/<guildId>/<channelId>/<messageId>`。

## 动作

### 对消息添加反应

```json
{
  "action": "react",
  "channelId": "123",
  "messageId": "456",
  "emoji": "✅"
}
```

### 列出反应与用户

```json
{
  "action": "reactions",
  "channelId": "123",
  "messageId": "456",
  "limit": 100
}
```

### 发送贴纸

```json
{
  "action": "sticker",
  "to": "channel:123",
  "stickerIds": ["9876543210"],
  "content": "Nice work!"
}
```

- 每条消息最多 3 个贴纸 ID。
- `to` 可用 `user:<id>` 发送私信。

### 上传自定义表情

```json
{
  "action": "emojiUpload",
  "guildId": "999",
  "name": "party_blob",
  "mediaUrl": "file:///tmp/party.png",
  "roleIds": ["222"]
}
```

- 表情图片必须是 PNG/JPG/GIF 且不超过 256KB。
- `roleIds` 可选；不填则所有人可用。

### 上传贴纸

```json
{
  "action": "stickerUpload",
  "guildId": "999",
  "name": "openclaw_wave",
  "description": "OpenClaw waving hello",
  "tags": "👋",
  "mediaUrl": "file:///tmp/wave.png"
}
```

- 贴纸需要 `name`、`description` 与 `tags`。
- 上传文件必须是 PNG/APNG/Lottie JSON 且不超过 512KB。

### 创建投票

```json
{
  "action": "poll",
  "to": "channel:123",
  "question": "Lunch?",
  "answers": ["Pizza", "Sushi", "Salad"],
  "allowMultiselect": false,
  "durationHours": 24,
  "content": "Vote now"
}
```

- `durationHours` 默认 24；最大 32 天（768 小时）。

### 查询机器人在频道中的权限

```json
{
  "action": "permissions",
  "channelId": "123"
}
```

## 可尝试的用法

- 用 ✅/⚠️ 标记状态更新
- 发起快速投票决定发布或会议时间
- 部署成功后发送庆祝贴纸
- 为发布时刻上传新表情/贴纸
- 在团队频道每周发起“优先级确认”投票
- 用户请求完成后私信贴纸表示确认

## 动作开关

使用 `discord.actions.*` 禁用动作组：

- `reactions`（react + reactions list + emojiList）
- `stickers`、`polls`、`permissions`、`messages`、`threads`、`pins`、`search`
- `emojiUploads`、`stickerUploads`
- `memberInfo`、`roleInfo`、`channelInfo`、`voiceStatus`、`events`
- `roles`（角色增删，默认 `false`）
- `channels`（频道/分类创建编辑删除移动，默认 `false`）
- `moderation`（timeout/kick/ban，默认 `false`）
- `presence`（机器人状态/活动，默认 `false`）

### 读取最近消息

```json
{
  "action": "readMessages",
  "channelId": "123",
  "limit": 20
}
```

### 获取单条消息

```json
{
  "action": "fetchMessage",
  "guildId": "999",
  "channelId": "123",
  "messageId": "456"
}
```

```json
{
  "action": "fetchMessage",
  "messageLink": "https://discord.com/channels/999/123/456"
}
```

### 发送/编辑/删除消息

```json
{
  "action": "sendMessage",
  "to": "channel:123",
  "content": "Hello from OpenClaw"
}
```

**带媒体附件：**

```json
{
  "action": "sendMessage",
  "to": "channel:123",
  "content": "Check out this audio!",
  "mediaUrl": "file:///tmp/audio.mp3"
}
```

- `to` 使用 `channel:<id>` 或 `user:<id>`（不是 `channelId`）
- `mediaUrl` 支持本地文件（`file:///path/to/file`）与远程 URL（`https://...`）
- 可选 `replyTo`，填消息 ID 以回复指定消息

```json
{
  "action": "editMessage",
  "channelId": "123",
  "messageId": "456",
  "content": "Fixed typo"
}
```

```json
{
  "action": "deleteMessage",
  "channelId": "123",
  "messageId": "456"
}
```

### 线程

```json
{
  "action": "threadCreate",
  "channelId": "123",
  "name": "Bug triage",
  "messageId": "456"
}
```

```json
{
  "action": "threadList",
  "guildId": "999"
}
```

```json
{
  "action": "threadReply",
  "channelId": "777",
  "content": "Replying in thread"
}
```

### 置顶

```json
{
  "action": "pinMessage",
  "channelId": "123",
  "messageId": "456"
}
```

```json
{
  "action": "listPins",
  "channelId": "123"
}
```

### 搜索消息

```json
{
  "action": "searchMessages",
  "guildId": "999",
  "content": "release notes",
  "channelIds": ["123", "456"],
  "limit": 10
}
```

### 成员与角色信息

```json
{
  "action": "memberInfo",
  "guildId": "999",
  "userId": "111"
}
```

```json
{
  "action": "roleInfo",
  "guildId": "999"
}
```

### 列出可用自定义表情

```json
{
  "action": "emojiList",
  "guildId": "999"
}
```

### 角色变更（默认关闭）

```json
{
  "action": "roleAdd",
  "guildId": "999",
  "userId": "111",
  "roleId": "222"
}
```

### 频道信息

```json
{
  "action": "channelInfo",
  "channelId": "123"
}
```

```json
{
  "action": "channelList",
  "guildId": "999"
}
```

### 频道管理（默认关闭）

创建、编辑、删除并移动频道与分类。通过 `discord.actions.channels: true` 启用。

**创建文本频道：**

```json
{
  "action": "channelCreate",
  "guildId": "999",
  "name": "general-chat",
  "type": 0,
  "parentId": "888",
  "topic": "General discussion"
}
```

- `type`：Discord 频道类型整数（0=文本，2=语音，4=分类；也支持其他值）
- `parentId`：所属分类 ID（可选）
- `topic`、`position`、`nsfw`：可选

**创建分类：**

```json
{
  "action": "categoryCreate",
  "guildId": "999",
  "name": "Projects"
}
```

**编辑频道：**

```json
{
  "action": "channelEdit",
  "channelId": "123",
  "name": "new-name",
  "topic": "Updated topic"
}
```

- 支持 `name`、`topic`、`position`、`parentId`（设为 null 以移出分类）、`nsfw`、`rateLimitPerUser`

**移动频道：**

```json
{
  "action": "channelMove",
  "guildId": "999",
  "channelId": "123",
  "parentId": "888",
  "position": 2
}
```

- `parentId`：目标分类（设为 null 代表移动到顶层）

**删除频道：**

```json
{
  "action": "channelDelete",
  "channelId": "123"
}
```

**编辑/删除分类：**

```json
{
  "action": "categoryEdit",
  "categoryId": "888",
  "name": "Renamed Category"
}
```

```json
{
  "action": "categoryDelete",
  "categoryId": "888"
}
```

### 语音状态

```json
{
  "action": "voiceStatus",
  "guildId": "999",
  "userId": "111"
}
```

### 计划事件

```json
{
  "action": "eventList",
  "guildId": "999"
}
```

### 管理操作（默认关闭）

```json
{
  "action": "timeout",
  "guildId": "999",
  "userId": "111",
  "durationMinutes": 10
}
```

### 机器人状态/活动（默认关闭）

设置机器人的在线状态与活动。通过 `discord.actions.presence: true` 启用。

Discord 机器人只能设置 `name`、`state`、`type` 和 `url`。其他 Activity 字段（details、emoji、assets）网关接受但会被 Discord 忽略。

**不同 activity 类型的展示规则：**

- **playing、streaming、listening、watching、competing**：`activityName` 在侧边栏机器人名称下展示（如 type=playing 且 name=with fire 时显示“with fire”）。`activityState` 显示在个人资料弹窗中。
- **custom**：`activityName` 被忽略，仅显示 `activityState` 作为侧边栏状态文本。
- **streaming**：`activityUrl` 可能在客户端展示或嵌入。

**设置 playing 状态：**

```json
{
  "action": "setPresence",
  "activityType": "playing",
  "activityName": "with fire"
}
```

侧边栏结果：“with fire”。资料弹窗显示：“Playing: with fire”。

**带 state（展示在弹窗）：**

```json
{
  "action": "setPresence",
  "activityType": "playing",
  "activityName": "My Game",
  "activityState": "In the lobby"
}
```

侧边栏结果：“My Game”。弹窗显示：“Playing: My Game（换行）In the lobby”。

**设置 streaming（可选 URL，机器人可能不展示）：**

```json
{
  "action": "setPresence",
  "activityType": "streaming",
  "activityName": "Live coding",
  "activityUrl": "https://twitch.tv/example"
}
```

**设置 listening/watching：**

```json
{
  "action": "setPresence",
  "activityType": "listening",
  "activityName": "Spotify"
}
```

```json
{
  "action": "setPresence",
  "activityType": "watching",
  "activityName": "the logs"
}
```

**设置自定义状态（侧边栏文本）：**

```json
{
  "action": "setPresence",
  "activityType": "custom",
  "activityState": "Vibing"
}
```

侧边栏结果：“Vibing”。注意：custom 类型会忽略 `activityName`。

**仅设置在线状态（不带活动/清空活动）：**

```json
{
  "action": "setPresence",
  "status": "dnd"
}
```

**参数：**

- `activityType`：`playing`、`streaming`、`listening`、`watching`、`competing`、`custom`
- `activityName`：非 custom 类型在侧边栏展示文本（`custom` 会忽略）
- `activityUrl`：streaming 类型的 Twitch/YouTube URL（可选，机器人可能不展示）
- `activityState`：`custom` 为状态文本；其他类型显示在资料弹窗
- `status`：`online`（默认）、`dnd`、`idle`、`invisible`

## Discord 文案风格指南

**保持对话感！** Discord 是聊天平台，不是文档。

### 推荐

- 短而有力（1–3 句最佳）
- 多条短回复优于一大段
- 用 emoji 表达语气/强调 🦞
- 小写随意风格没问题
- 将信息拆成易读的小块
- 呼应对话氛围

### 不推荐

- 不用 Markdown 表格（会渲染成难看的 `| text |`）
- 不用 `## 标题`（用**加粗**或大写强调）
- 避免多段长篇
- 不要对简单问题过度解释
- 跳过“很高兴帮你”这类客套话

### 可用格式

- **加粗** 用于强调
- `code` 用于技术术语
- 列表用于多项内容
- > 引用用于引用
- 多个链接用 `<>` 包裹以避免嵌入

### 示例转换

❌ 不好：

```
很高兴帮你！下面是版本策略的完整概览：

## 语义化版本
Semver 使用 MAJOR.MINOR.PATCH 格式……

## 日历版本
CalVer 使用日期格式，例如……
```

✅ 更好：

```
版本选项：semver（1.2.3）、calver（2026.01.04）或 yolo（`latest` 永远）。你们的发布节奏更适合哪种？
```
