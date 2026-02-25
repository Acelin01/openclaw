# Canvas 技能

在已连接的 OpenClaw 节点（Mac 应用、iOS、Android）上显示 HTML 内容。

## 概览

canvas 工具可将 Web 内容呈现在任意已连接节点的画布视图中，适用于：

- 展示游戏、可视化、仪表盘
- 展示生成的 HTML 内容
- 交互式演示

## 工作原理

### 架构

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│  Canvas Host    │────▶│   Node Bridge    │────▶│  Node App   │
│  (HTTP Server)  │     │  (TCP Server)    │     │ (Mac/iOS/   │
│  Port 18793     │     │  Port 18790      │     │  Android)   │
└─────────────────┘     └──────────────────┘     └─────────────┘
```

1. **Canvas Host Server**：从 `canvasHost.root` 目录提供静态 HTML/CSS/JS
2. **Node Bridge**：将画布 URL 传给已连接节点
3. **Node Apps**：在 WebView 中渲染内容

### Tailscale 集成

canvas host 服务根据 `gateway.bind` 配置进行绑定：

| 绑定模式   | 服务绑定地址   | Canvas URL 使用            |
| ---------- | -------------- | -------------------------- |
| `loopback` | 127.0.0.1      | localhost（仅本地）        |
| `lan`      | 局域网接口     | 局域网 IP 地址             |
| `tailnet`  | Tailscale 接口 | Tailscale 主机名           |
| `auto`     | 最佳可用       | Tailscale > LAN > loopback |

**关键点：** `canvasHostHostForBridge` 由 `bridgeHost` 推导。当绑定到 Tailscale 时，节点会收到如下 URL：

```
http://<tailscale-hostname>:18793/__openclaw__/canvas/<file>.html
```

这就是 localhost URL 失效的原因：节点从 bridge 端获取的是 Tailscale 主机名。

## 动作

| 动作       | 说明                       |
| ---------- | -------------------------- |
| `present`  | 显示画布（可指定目标 URL） |
| `hide`     | 隐藏画布                   |
| `navigate` | 跳转到新的 URL             |
| `eval`     | 在画布中执行 JavaScript    |
| `snapshot` | 截图画布内容               |

## 配置

在 `~/.openclaw/openclaw.json` 中：

```json
{
  "canvasHost": {
    "enabled": true,
    "port": 18793,
    "root": "/Users/you/clawd/canvas",
    "liveReload": true
  },
  "gateway": {
    "bind": "auto"
  }
}
```

### 实时刷新

当 `liveReload: true`（默认）时，canvas host 会：

- 监视根目录变化（通过 chokidar）
- 在 HTML 中注入 WebSocket 客户端
- 文件变更时自动刷新已连接画布

非常适合开发调试。

## 使用流程

### 1. 创建 HTML 内容

将文件放入画布根目录（默认 `~/clawd/canvas/`）：

```bash
cat > ~/clawd/canvas/my-game.html << 'HTML'
<!DOCTYPE html>
<html>
<head><title>My Game</title></head>
<body>
  <h1>Hello Canvas!</h1>
</body>
</html>
HTML
```

### 2. 获取画布主机 URL

检查网关绑定方式：

```bash
cat ~/.openclaw/openclaw.json | jq '.gateway.bind'
```

然后拼接 URL：

- **loopback**：`http://127.0.0.1:18793/__openclaw__/canvas/<file>.html`
- **lan/tailnet/auto**：`http://<hostname>:18793/__openclaw__/canvas/<file>.html`

获取 Tailscale 主机名：

```bash
tailscale status --json | jq -r '.Self.DNSName' | sed 's/\.$//'
```

### 3. 查找已连接节点

```bash
openclaw nodes list
```

查找支持画布能力的 Mac/iOS/Android 节点。

### 4. 展示内容

```
canvas action:present node:<node-id> target:<full-url>
```

**示例：**

```
canvas action:present node:mac-63599bc4-b54d-4392-9048-b97abd58343a target:http://peters-mac-studio-1.sheep-coho.ts.net:18793/__openclaw__/canvas/snake.html
```

### 5. 跳转、截图或隐藏

```
canvas action:navigate node:<node-id> url:<new-url>
canvas action:snapshot node:<node-id>
canvas action:hide node:<node-id>
```

## 调试

### 白屏/内容无法加载

**原因：** 服务绑定地址与节点预期不一致。

**排查步骤：**

1. 检查服务绑定：`cat ~/.openclaw/openclaw.json | jq '.gateway.bind'`
2. 检查画布端口：`lsof -i :18793`
3. 直接测试 URL：`curl http://<hostname>:18793/__openclaw__/canvas/<file>.html`

**解决办法：** 使用与绑定模式一致的完整主机名，不要用 localhost。

### “node required” 错误

务必指定 `node:<node-id>` 参数。

### “node not connected” 错误

节点离线。使用 `openclaw nodes list` 查找在线节点。

### 内容未更新

实时刷新不生效时：

1. 确认配置中 `liveReload: true`
2. 确保文件位于画布根目录
3. 查看日志中的 watcher 报错

## URL 路径结构

canvas host 使用 `/__openclaw__/canvas/` 前缀提供内容：

```
http://<host>:18793/__openclaw__/canvas/index.html  → ~/clawd/canvas/index.html
http://<host>:18793/__openclaw__/canvas/games/snake.html → ~/clawd/canvas/games/snake.html
```

`/__openclaw__/canvas/` 前缀由 `CANVAS_HOST_PATH` 常量定义。

## 小贴士

- 尽量让 HTML 自包含（内联 CSS/JS）以获得最佳效果
- 使用默认 index.html 作为测试页（包含 bridge 诊断）
- 画布会持续显示，直到 `hide` 或跳转离开
- 实时刷新可加速开发体验，保存即更新
- A2UI JSON 推送仍在开发中，暂以 HTML 文件为主
