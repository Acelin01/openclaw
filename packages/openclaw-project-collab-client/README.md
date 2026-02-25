# OpenClaw Project Collaboration Client Helper

这是一个配套的客户端辅助包，用于在 OpenClaw UI 中解析和渲染由 `openclaw-project-collab-mcp` 生成的构件 (Artifact)。

## 功能

- **Artifact 解析**: 将 MCP 工具输出的 JSON 字符串解析为结构化的 `ProjectCollabArtifact` 对象。
- **Artifact 渲染**: 提供辅助函数或组件逻辑，将 Artifact 数据转换为 UI 展示（如 HTML 字符串或前端组件数据）。

## 使用

在 OpenClaw UI 项目中：

```typescript
import {
  parseProjectCollabArtifact,
  type ProjectCollabArtifact,
} from "openclaw-project-collab-client";

// 解析工具输出
const artifact = parseProjectCollabArtifact(toolOutput);

if (artifact) {
  // 渲染 artifact
  console.log(artifact.title);
  console.log(artifact.metrics);
}
```

## 类型定义

本包提供了完整的 TypeScript 类型定义，支持开发时的类型检查和自动补全。
