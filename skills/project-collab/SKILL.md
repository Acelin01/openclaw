---
name: project-collab
description: 项目协同 MCP 工具，可创建项目、添加任务、生成项目看板等。调用后会返回结构化数据，由配套 UI 组件渲染为可视化看板。
homepage: https://github.com/openclaw/openclaw/tree/main/packages/openclaw-project-collab-mcp
metadata:
  openclaw:
    emoji: "📊"
    os: ["darwin", "linux", "win32"]
    type: "mcp"
    mcp:
      transport: "stdio"
      command: "node"
      args: ["packages/openclaw-project-collab-mcp/index.js"]
      env: {}
    ui:
      package: "openclaw-project-collab-client"
      version: "latest"
    requires:
      bins: ["node"]
    install:
      - id: "npm"
        kind: "npm"
        package: "openclaw-project-collab-mcp"
        label: "通过 npm 安装"
      - id: "local"
        kind: "local"
        path: "packages/openclaw-project-collab-mcp"
        label: "使用本地包 (开发模式)"
---

# 项目协同 MCP 工具

这是一个基于 [Model Context Protocol (MCP)](https://modelcontextprotocol.io) 的服务端，为 AI 助手提供项目协同能力。通过自然语言，您可以：

- **创建项目**：`创建一个名为“新产品发布”的项目，描述为“Q3 重点”`
- **添加任务**：`在项目“新产品发布”中添加任务“设计原型”，截止日期明天`
- **查看项目状态**：`显示“新产品发布”的项目看板`
- **更多功能**：任务分配、进度跟踪、风险标记等。

调用后，AI 将返回结构化的 artifact 数据，并由配套 UI 组件渲染为可视化的项目看板，您可以直接在 OpenClaw 中查看和操作。

## 安装说明

- 确保已安装 Node.js (>=18)。
- 通过下方“安装”按钮选择合适的方式安装服务端。
- 安装完成后，OpenClaw 会自动启动 MCP 服务并加载 UI 组件。

## 使用示例

- “帮我创建一个新项目，名字叫‘网站改版’，描述是‘提升用户体验’”
- “在‘网站改版’中添加一个任务‘设计首页原型’，指派给@设计师”
- “展示‘网站改版’的项目看板”

更多细节请访问 [项目主页](https://github.com/openclaw/openclaw)。
