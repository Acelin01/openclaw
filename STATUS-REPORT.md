# OpenClaw 服务状态检查报告

**检查时间:** 2026-03-01 02:15 AM  
**检查范围:** uxin-mcp 技能连接 + 飞书机器人对接

---

## 📊 服务状态总览

| 服务                   | 状态        | 详情                         |
| ---------------------- | ----------- | ---------------------------- |
| **Gateway**            | 🟢 运行中   | PID 245, 端口 18789          |
| **飞书机器人**         | 🟢 已启动   | App ID: cli_a928659889f8dcb1 |
| **Telegram (xulinyi)** | 🟢 运行中   | @xulinyi_bot                 |
| **Telegram (rrvccn)**  | 🟢 运行中   | @rrvccn_bot                  |
| **MCP 服务**           | 🟡 独立运行 | 未与 Gateway 集成            |

---

## ⚠️ 发现的问题

### 问题 1: MCP 技能未正确加载

**现象:**

```
[ws] ⇄ res ✗ skills.list 2ms errorCode=INVALID_REQUEST
errorMessage=unknown method: skills.list
```

**原因:**

- Gateway 配置的 MCP 服务路径与实际运行的不一致
- 配置中使用 `pnpm mcp:stdio`，但实际运行的是 `tsx apps/api/src/mcp-server/index.ts`

**当前 Gateway 配置:**

```json
{
  "mcpServers": {
    "uxin-mcp": {
      "command": "pnpm",
      "args": ["--dir", "/Users/acelin/Documents/Next/AIGC/uxin/apps/api", "mcp:stdio"],
      "env": {
        "UXIN_API_TOKEN": "uxin-service-secret-123",
        "API_BASE_URL": "http://101.201.105.24:8000"
      }
    }
  }
}
```

**实际运行的 MCP 进程:**

```bash
npm exec tsx /Users/acelin/Documents/Next/AIGC/openclaw/apps/api/src/mcp-server/index.ts
```

**解决方案:**

1. 停止当前独立运行的 MCP 进程
2. 更新 Gateway 配置使用正确的路径
3. 重启 Gateway 让 MCP 作为子进程启动

---

### 问题 2: 飞书机器人对接问题

**当前状态:**

```
[feishu] [main] starting Feishu provider (uxin)
[info]: [ 'event-dispatch is ready' ]
```

**可能的问题:**

#### A. 飞书开放平台配置

- ❓ 事件订阅是否已启用？
- ❓ 是否添加了 `im.message.receive_v1` 事件？
- ❓ 长连接模式是否已配置？
- ❓ 应用是否已发布？

#### B. 权限配置

需要以下权限：

```json
{
  "scopes": {
    "tenant": [
      "im:message",
      "im:message:send_as_bot",
      "im:chat.access_event.bot_p2p_chat:read",
      "im:message.p2p_msg:readonly",
      "im:message.group_at_msg:readonly"
    ]
  }
}
```

#### C. 配对流程

首次使用需要配对：

```bash
# 查看配对请求
openclaw pairing list feishu

# 批准配对
openclaw pairing approve feishu <CODE>
```

---

## 🔧 修复步骤

### 修复 MCP 连接

```bash
# 1. 停止独立运行的 MCP 进程
killall -f tsx  # 或手动 kill 相关进程

# 2. 更新 openclaw.json 配置
# 使用正确的路径和命令

# 3. 重启 Gateway
launchctl kickstart -k gui/$UID/ai.openclaw.gateway

# 4. 检查日志
tail -f /Users/acelin/.openclaw/logs/gateway.log | grep -i mcp
```

### 修复飞书对接

```bash
# 1. 登录飞书开放平台
# https://open.feishu.cn/app

# 2. 检查应用配置
# - App ID: cli_a928659889f8dcb1
# - 事件订阅：启用长连接
# - 事件：im.message.receive_v1

# 3. 测试连接
# 在飞书中搜索机器人并发送消息

# 4. 查看 Gateway 日志
tail -f /Users/acelin/.openclaw/logs/gateway.log | grep feishu
```

---

## 📋 检查清单

### MCP 技能连接

- [ ] 停止独立运行的 MCP 进程
- [ ] 更新 Gateway 配置
- [ ] 重启 Gateway
- [ ] 验证 `skills.list` 方法可用
- [ ] 测试技能调用

### 飞书机器人

- [ ] 登录飞书开放平台
- [ ] 验证事件订阅配置
- [ ] 验证权限配置
- [ ] 应用已发布
- [ ] 测试发送消息
- [ ] 完成配对流程（如需要）

---

## 📞 快速诊断命令

```bash
# Gateway 状态
ps aux | grep gateway | grep -v grep

# MCP 进程
ps aux | grep mcp | grep -v grep

# Gateway 日志
tail -50 /Users/acelin/.openclaw/logs/gateway.log

# 错误日志
tail -50 /Users/acelin/.openclaw/logs/gateway.err.log

# 飞书相关日志
tail -f /Users/acelin/.openclaw/logs/gateway.log | grep feishu

# 配对请求
openclaw pairing list feishu
```

---

_报告生成时间：2026-03-01 02:15_
