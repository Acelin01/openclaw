# 客户机器人 uxin 配置指南

## 📋 配置概览

### 服务器连接信息
| 配置项 | 值 |
|--------|-----|
| 服务器地址 | 192.168.31.154 |
| 服务器端口 | 7000 |
| 认证 Token | openclaw-platform-token-2026 |
| 客户端 ID | machine-XLY.local |

### 代理隧道配置
| 配置项 | 值 |
|--------|-----|
| 代理名称 | openclaw-gateway |
| 类型 | tcp |
| 本地 IP | 127.0.0.1 |
| 本地端口 | 18789 |
| 远程端口 | 60123 |
| 健康检查 | tcp (30 秒间隔) |

## 🚀 快速开始

### 1. 安装 FRP 客户端

```bash
# 使用 Homebrew 安装
brew install frp

# 或从 GitHub 下载
# https://github.com/fatedier/frp/releases
```

### 2. 启动本地 Gateway 服务

```bash
cd /Users/mac/Documents/GitHub/openclaw
pnpm gateway:dev
```

### 3. 启动 FRP 隧道

```bash
# 使用启动脚本
bash /Users/mac/Documents/GitHub/openclaw/apps/chat-lite/scripts/start-uxin-bot.sh

# 或手动启动
frpc -c ~/.openclaw-frp/frpc.ini
```

### 4. 验证连接

```bash
# 测试本地 Gateway
curl ws://127.0.0.1:18789

# 测试远程隧道（从其他机器）
curl ws://192.168.31.154:60123
```

### 5. 访问 chat-lite

打开浏览器访问：http://localhost:3003

在智能体选择器中选择 "客户机器人 uxin"。

## 📁 配置文件位置

- **智能体配置**: `/Users/mac/Documents/GitHub/openclaw/apps/chat-lite/config/agents.config.json`
- **FRP 配置**: `~/.openclaw-frp/frpc.ini`
- **FRP 日志**: `~/.openclaw-frp/logs/frpc.log`

## 🔧 故障排查

### FRP 连接失败

1. 检查服务器是否运行：
```bash
nc -z -v 192.168.31.154 7000
```

2. 检查防火墙设置：
```bash
# macOS
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off
```

3. 查看 FRP 日志：
```bash
tail -f ~/.openclaw-frp/logs/frpc.log
```

### Gateway 连接失败

1. 确认 Gateway 服务运行：
```bash
lsof -i :18789
```

2. 重启 Gateway 服务：
```bash
pkill -f "openclaw.*gateway"
pnpm gateway:dev
```

### 机器人无响应

1. 检查智能体状态（在浏览器控制台）：
```javascript
// 查看智能体列表
multiAgentClient.getAgentList()
```

2. 查看消息日志：
```bash
tail -f /tmp/openclaw/openclaw-*.log
```

## 🛠️ 高级配置

### 修改欢迎语

编辑 `agents.config.json`：
```json
{
  "config": {
    "greeting": "您好！我是 uxin 客服助手，很高兴为您服务！"
  }
}
```

### 修改工作时间

```json
{
  "config": {
    "workingHours": {
      "start": "08:30",
      "end": "20:00"
    }
  }
}
```

### 启用自动回复

```json
{
  "config": {
    "autoReply": true,
    "fallback": "抱歉，我暂时无法回答，将为您转接人工客服。"
  }
}
```

## 📊 监控和维护

### 查看 FRP 状态

```bash
ps aux | grep frpc
```

### 停止服务

```bash
# 停止 FRP
pkill -f "frpc -c"

# 停止 Gateway
pkill -f "openclaw.*gateway"
```

### 查看连接统计

访问 FRP 服务器管理界面（如果配置了）：
```
http://192.168.31.154:7500
```

## 📞 技术支持

如有问题，请查看：
- FRP 官方文档：https://github.com/fatedier/frp
- OpenClaw 文档：/Users/mac/Documents/GitHub/openclaw/docs
