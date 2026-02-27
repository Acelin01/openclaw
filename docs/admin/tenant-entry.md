# 租户前端入口

本文档统一说明租户相关的前端入口与启动方式。

## 1. 管理端（租户管理后台）

- 启动：`pnpm --dir apps/admin-console dev`
- 访问：`http://localhost:3000/admin`
- 功能：租户、项目、权限、审批、告警、外部 MCP 管理

## 2. 网关控制台（Control UI）

- 启动：`pnpm ui:dev`
- 访问：`http://localhost:5173`
- 功能：网关连接、状态查看、调试与控制

## 3. AI Chat 前端（若面向终端用户）

- 启动：`pnpm --dir apps/aiChat dev`
- 访问：`http://localhost:3000`
- 说明：与管理端端口冲突时请改端口

## 建议

- 以管理端作为租户主入口
- 需要网关调试时再启 Control UI
- 终端用户场景再启 AI Chat
