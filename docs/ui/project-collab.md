# 项目协同技能集成文档

本文档介绍如何在 OpenClaw 中集成项目协同 MCP 工具。

## 概述

项目协同技能基于 MCP (Model Context Protocol) 协议实现，由两部分组成：

1.  **MCP 服务端** (`openclaw-project-collab-mcp`)：负责处理业务逻辑，如项目创建、任务管理等，并返回结构化的 Artifact 数据。
2.  **Artifact 客户端** (`openclaw-project-collab-client`)：负责解析服务端返回的 Artifact 数据，并渲染为可视化组件（如项目卡片、项目看板等）。

## 技能定义

技能定义文件位于 `skills/project-collab/SKILL.md`，它告诉 OpenClaw 如何安装、启动 MCP 服务以及如何加载 UI 组件。

```yaml
---
name: project-collab
description: 项目协同 MCP 工具
metadata:
  openclaw:
    type: "mcp"
    mcp:
      transport: "stdio"
      command: "node"
      args: ["%INSTALL_DIR%/index.js"]
    ui:
      package: "openclaw-project-collab-client"
---
```

## MCP 服务端实现

服务端位于 `packages/openclaw-project-collab-mcp`。它使用 `@modelcontextprotocol/sdk` 实现，提供了以下工具：

- `project_create`: 创建新项目
- `task_create`: 创建任务
- `project_dashboard`: 获取项目概览（包含 Artifact）

当调用 `project_dashboard` 时，服务端会返回如下结构的 JSON：

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"artifact\": {\"kind\": \"project-collab\", ...}}"
    }
  ]
}
```

## Artifact 客户端实现

客户端位于 `packages/openclaw-project-collab-client`。它导出了辅助函数 `parseProjectCollabArtifact`，用于将服务端返回的 JSON 字符串解析为结构化对象。

OpenClaw 的 UI 层（`ui/src/ui/chat`）会使用这些数据来渲染卡片。

## 使用方法

1.  在 OpenClaw 中安装 `project-collab` 技能。
2.  在对话中输入指令，例如：“创建一个名为‘年度规划’的项目”。
3.  AI 调用 MCP 工具完成操作。
4.  如果是查询类操作（如“查看项目看板”），AI 会调用 `project_dashboard`，界面将显示可视化的项目看板。

## 开发指南

如果您需要扩展此功能：

1.  修改 `packages/openclaw-project-collab-mcp` 中的逻辑，增加新的工具或字段。
2.  修改 `packages/openclaw-project-collab-client` 中的解析逻辑。
3.  在 `ui/src/ui/chat/tool-cards.ts` 中更新渲染逻辑（如果需要新的 UI 样式）。
