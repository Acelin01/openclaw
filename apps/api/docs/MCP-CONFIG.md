# uxin-mcp 连接配置指南

## 概述

本文档说明如何配置和启动 uxin-mcp 服务器的两种模式：**Stdio** 和 **SSE**。

---

## 环境变量

| 变量名 | 必填 | 说明 | 默认值 |
|--------|------|------|--------|
| `UXIN_API_TOKEN` | 是 | JWT Token 或服务密钥 | `uxin-service-secret-123` |
| `UXIN_USER_ID` | 否 | 用户 ID（如不提供，将从 JWT Token 中自动提取） | `mcp-system` |
| `API_BASE_URL` | 否 | API 服务器地址 | `http://127.0.0.1:8000` |
| `SERVER_API_URL` | 否 | 同 `API_BASE_URL`（兼容） | - |
| `NEXT_PUBLIC_API_URL` | 否 | 同 `API_BASE_URL`（兼容） | - |
| `MCP_PORT` | 否 | SSE 服务器端口 | `3004` |

---

## 模式一：Stdio（推荐用于本地客户端）

适用于 Claude Desktop、Cursor 等本地 MCP 客户端。

### 配置示例

```json
{
  "mcpServers": {
    "uxin-mcp": {
      "command": "npx",
      "args": ["tsx", "/Users/acelin/Documents/Next/AIGC/openclaw/apps/api/src/mcp-server/index.ts"],
      "env": {
        "UXIN_API_TOKEN": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "API_BASE_URL": "http://localhost:8000"
      }
    }
  }
}
```

### 启动命令

```bash
cd /Users/acelin/Documents/Next/AIGC/openclaw/apps/api
UXIN_API_TOKEN=<your-token> API_BASE_URL=http://localhost:8000 pnpm run mcp:stdio
```

---

## 模式二：SSE（推荐用于远程客户端）

适用于 Web 应用、远程服务等需要 HTTP 连接的场景。

### 启动命令

```bash
# 使用默认端口 3004
pnpm run mcp:sse

# 或自定义端口
MCP_PORT=3005 pnpm run mcp:sse

# 或使用启动脚本
./scripts/start-mcp-sse.sh 3004
```

### 端点

启动后，将提供以下端点：

| 服务器 | SSE 端点 | 消息端点 |
|--------|---------|---------|
| Project | `/project/sse` | `/project/messages` |
| Freelancer | `/freelancer/sse` | `/freelancer/messages` |
| Agent | `/agent/sse` | `/agent/messages` |

### SSE 连接示例

```bash
# 连接到 Project 服务器
curl -N http://localhost:3004/project/sse
```

---

## 获取 API Token

### 方式 1：从登录会话获取

```bash
# Token 存储在
cat ~/.openclaw/credentials/uxin-api-token
```

### 方式 2：使用服务密钥

```bash
UXIN_API_TOKEN=uxin-service-secret-123
UXIN_USER_ID=admin-user-id
```

---

## API 端点

### 健康检查

```bash
curl http://localhost:8000/api/v1/mcp/health
```

### 配置信息（需要认证）

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/v1/mcp/config
```

### 外部 MCP 配置（需要认证）

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/v1/external/mcp/config
```

---

## 故障排除

### 1. API 服务未响应

```bash
# 检查 API 健康
curl http://localhost:8000/health

# 启动 API 服务
pnpm run dev
```

### 2. Token 解析失败

确保 Token 是有效的 JWT 格式：
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxx.xxx
```

### 3. 端口冲突

```bash
# 检查端口占用
lsof -i :8000
lsof -i :3004

# 修改端口
MCP_PORT=3005 pnpm run mcp:sse
```

---

## 架构图

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  MCP Client     │────▶│  API Server      │────▶│  Database       │
│  (Claude Desk)  │     │  (Port 8000)     │     │  (PostgreSQL)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │
         │ Stdio                 │ HTTP
         ▼                       ▼
┌─────────────────┐     ┌──────────────────┐
│  MCP Server     │     │  SSE Server      │
│  (index.ts)     │     │  (sse-server.ts) │
└─────────────────┘     └──────────────────┘
                        Port: 3004
```
