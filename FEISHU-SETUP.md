# 飞书机器人配置完成 ✅

## 📋 已完成的配置

### 1. OpenClaw 配置已更新

**文件:** `openclaw.json`

```json
{
  "channels": {
    "feishu": {
      "enabled": true,
      "dmPolicy": "pairing",
      "groupPolicy": "open",
      "accounts": {
        "main": {
          "appId": "cli_a928659889f8dcb1",
          "appSecret": "EMD3fiRiIxx5Q4KK6CztrcTygmxAOgtd",
          "botName": "OpenClaw Assistant"
        }
      }
    }
  }
}
```

### 2. Gateway 状态

- **状态:** 🟢 运行中
- **端口:** 18789
- **PID:** 96102
- **日志:** `/Users/acelin/.openclaw/logs/gateway.log`

---

## 🔧 飞书开放平台配置步骤

### 重要：飞书使用 WebSocket 长连接，无需内网穿透！

### 步骤 1: 登录飞书开放平台

访问：https://open.feishu.cn/app

### 步骤 2: 找到你的应用

- App ID: `cli_a928659889f8dcb1`
- 在应用列表中找到并点击进入

### 步骤 3: 配置权限

在 **权限管理** 页面，批量导入以下权限：

```json
{
  "scopes": {
    "tenant": [
      "aily:file:read",
      "aily:file:write",
      "application:application.app_message_stats.overview:readonly",
      "application:application:self_manage",
      "application:bot.menu:write",
      "contact:user.employee_id:readonly",
      "corehr:file:download",
      "event:ip_list",
      "im:chat.access_event.bot_p2p_chat:read",
      "im:chat.members:bot_access",
      "im:message",
      "im:message.group_at_msg:readonly",
      "im:message.p2p_msg:readonly",
      "im:message:readonly",
      "im:message:send_as_bot",
      "im:resource"
    ],
    "user": ["aily:file:read", "aily:file:write", "im:chat.access_event.bot_p2p_chat:read"]
  }
}
```

### 步骤 4: 启用机器人

在 **应用功能** → **机器人** 页面：

1. 启用机器人
2. 设置机器人名称：`OpenClaw Assistant`
3. 设置机器人头像（可选）

### 步骤 5: 配置事件订阅（关键！）

在 **事件订阅** 页面：

1. **启用事件订阅**
2. **选择长连接模式**（WebSocket）
3. 添加事件：`im.message.receive_v1`
4. 点击 **保存**

⚠️ **注意：**

- 确保 Gateway 正在运行（已确认 ✅）
- 如果保存失败，等待 10 秒后重试
- 状态应显示 **验证成功**

### 步骤 6: 发布应用

1. 进入 **版本管理与发布**
2. 创建新版本
3. 提交审核（企业应用通常自动通过）
4. 等待发布完成

---

## 🧪 测试连接

### 1. 在飞书中添加机器人为好友

- 搜索 `OpenClaw Assistant`
- 或扫描应用页面的二维码

### 2. 发送测试消息

发送任意消息，例如：`你好`

### 3. 查看配对请求

首次连接会收到配对码，在终端执行：

```bash
# 查看配对请求
/opt/homebrew/opt/node@22/bin/node /Users/acelin/Documents/Next/AIGC/openclaw/openclaw.mjs pairing list feishu

# 批准配对（替换 CODE 为实际配对码）
/opt/homebrew/opt/node@22/bin/node /Users/acelin/Documents/Next/AIGC/openclaw/openclaw.mjs pairing approve feishu CODE
```

### 4. 查看日志

```bash
# 实时查看日志
tail -f /Users/acelin/.openclaw/logs/gateway.log

# 或查看错误日志
tail -f /Users/acelin/.openclaw/logs/gateway.err.log
```

---

## 📱 群聊配置

### 添加机器人到群聊

1. 在飞书群聊中点击右上角设置
2. 选择 **添加成员**
3. 选择 `OpenClaw Assistant`

### 配置群聊权限

当前配置：**不需要 @mention**（`requireMention: false`）

如需修改，编辑 `openclaw.json`：

```json
{
  "channels": {
    "feishu": {
      "groups": {
        "*": {
          "requireMention": true // 改为 true 需要 @mention
        }
      }
    }
  }
}
```

---

## 🔍 故障排查

### 问题 1: "应用未建立长连接"

**原因:** 事件订阅未正确配置

**解决:**

1. 确认 Gateway 正在运行
2. 确认事件订阅已启用
3. 确认添加了 `im.message.receive_v1` 事件
4. 重新保存事件订阅配置

### 问题 2: 机器人不回复

**检查:**

1. 机器人是否已发布
2. 权限是否完整
3. 配对是否已批准（DM）
4. 是否需要 @mention（群聊）

**查看日志:**

```bash
tail -f /Users/acelin/.openclaw/logs/gateway.log | grep feishu
```

### 问题 3: 配置未生效

**重启 Gateway:**

```bash
launchctl kickstart -k gui/$UID/ai.openclaw.gateway
```

---

## 📞 获取帮助

- **文档:** `/Users/acelin/Documents/Next/AIGC/openclaw/docs/channels/feishu.md`
- **检查清单:** `/Users/acelin/Documents/Next/AIGC/openclaw/docs/feishu-checklist.md`
- **飞书开放平台:** https://open.feishu.cn/

---

_配置时间：2025-02-28 20:45_
_App ID: cli_a928659889f8dcb1_
