# OpenClaw Project Collaboration MCP Server

这是一个基于 Model Context Protocol (MCP) 的项目协同工具服务端，旨在为 OpenClaw 提供项目管理能力。

## 功能

- **项目管理**: 创建、查询项目。
- **任务管理**: 创建、更新任务状态。
- **里程碑**: 管理项目里程碑。
- **构件生成**: 自动生成项目概览、进度报告等构件 (Artifact)，支持在 OpenClaw UI 中以富文本形式展示。

## 安装

通常作为 OpenClaw 的一个 Skill 安装。

在 `skills/project-collab/SKILL.md` 中配置：

```markdown
---
name: project-collab
description: Project collaboration tools
tools:
  - name: mcp-server
    command: node
    args:
      - /path/to/packages/openclaw-project-collab-mcp/index.js
---
```

## 开发

### 启动服务

```bash
pnpm start
```

服务通过 Stdio 通信，适合作为子进程被 OpenClaw 或其他 MCP 客户端调用。

## 依赖

- `@modelcontextprotocol/sdk`
