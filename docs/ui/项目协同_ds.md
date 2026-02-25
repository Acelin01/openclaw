从您提供的 `apple-notes` 示例可以看出，openclaw 的技能集成主要通过一个 Markdown 描述文件实现，文件头包含 YAML frontmatter 元数据，用于向 openclaw 声明技能的基本信息、兼容性、依赖和安装方式。正文则提供详细的使用说明，帮助用户理解技能的用途和用法。openclaw 通过解析这些文件，在界面中展示技能，并在用户启用时自动检查环境、执行安装脚本，最后将技能注册为可调用的工具。

您的目标是为项目协同场景创建一个 **MCP 工具服务端**，让 openclaw 能够快速将其作为一项技能加入。同时，配套一个客户端 npm 包，用于在调用技能时呈现丰富的 artifact 界面。下面我将结合 openclaw 的集成模式，为您设计一套适配方案。

---

## 1. openclaw 技能集成要点解析

从示例中，我们可以提炼出 openclaw 集成技能的关键要素：

- **唯一标识**：`name` 字段（如 `apple-notes`）作为技能 ID。
- **显示信息**：`description` 用于简短介绍，`homepage` 提供更多信息，`metadata.openclaw.emoji` 用于界面图标。
- **兼容性约束**：`metadata.openclaw.os` 限制操作系统，`metadata.openclaw.requires.bins` 检查所需命令行工具是否存在。
- **安装方式**：`metadata.openclaw.install` 是一个数组，每个元素描述一种安装方法（如 `brew`、`pip`、`npm` 等），包含命令、生成的可执行文件路径等。openclaw 会据此引导用户一键安装。
- **执行逻辑**：示例中的技能是一个 CLI 工具（`memo`），通过交互式参数完成各种操作。openclaw 在调用时，会将用户的自然语言指令映射到对应的命令行参数并执行。

对于您的 MCP 服务端，它本身不是一个直接可执行的 CLI 工具，而是一个符合 MCP 协议的服务器进程。openclaw 若要调用它，需要能够以 MCP 客户端的方式连接并调用其暴露的工具（skills）。因此，集成方式需稍作调整。

---

## 2. MCP 服务端在 openclaw 中的集成方式

假设 openclaw 未来或现已支持 MCP 协议（或通过插件机制支持），集成一个 MCP 服务端通常需要提供以下信息：

- **启动命令**：如何运行 MCP 服务器（例如 `node /path/to/server.js` 或一个二进制文件）。
- **通信协议**：stdio 或 SSE（通常 stdio 更适用于本地工具）。
- **工具列表**：服务器提供的具体工具名称及描述（可选，因为 MCP 本身支持动态发现）。
- **关联的客户端 UI 包**：用于渲染 artifact 的 npm 包名称及如何加载。

基于这些需求，我们可以扩展 openclaw 的技能描述格式，增加 MCP 特定字段。

### 2.1 技能描述文件示例（面向 MCP 服务）

创建一个名为 `project-collab.md` 的文件，内容如下：

```markdown
---
name: project-collab
description: 项目协同 MCP 工具，可创建项目、添加任务、生成甘特图等。调用后会返回结构化数据，由配套 UI 组件渲染为可视化看板。
homepage: https://github.com/yourname/mcp-project-collab
metadata:
  openclaw:
    emoji: "📊"
    os: ["darwin", "linux", "win32"]
    type: "mcp" # 新增：标识这是一个 MCP 服务
    mcp:
      transport: "stdio" # 或 "sse"
      command: "node" # 启动命令
      args: ["%INSTALL_DIR%/server/dist/server.js"]
      env: {} # 可选环境变量
    ui:
      package: "mcp-project-collab-client" # 用于渲染 artifact 的 npm 包
      version: "latest" # 可指定版本
    requires:
      bins: ["node"] # 需要 node 环境
    install:
      - id: "npm"
        kind: "npm"
        package: "mcp-project-collab-server" # 假设服务端发布为 npm 包
        bins: ["mcp-project-collab-server"] # 安装后生成的可执行命令（如果有）
        label: "通过 npm 安装 MCP 服务端"
      - id: "git"
        kind: "git"
        url: "https://github.com/yourname/mcp-project-collab.git"
        post_install: "npm install && npm run build"
        label: "从源码构建"
---

# 项目协同 MCP 工具

这是一个基于 [Model Context Protocol (MCP)](https://modelcontextprotocol.io) 的服务端，为 AI 助手提供项目协同能力。通过自然语言，您可以：

- **创建项目**：`创建一个名为“新产品发布”的项目，描述为“Q3 重点”`
- **添加任务**：`在项目“新产品发布”中添加任务“设计原型”，截止日期明天`
- **查看项目状态**：`显示“新产品发布”的甘特图`
- **更多功能**：任务分配、进度跟踪、风险标记等。

调用后，AI 将返回结构化的 artifact 数据，并由配套 UI 组件渲染为可视化的项目看板，您可以直接在 openclaw 中查看和操作。

## 安装说明

- 确保已安装 Node.js (>=18)。
- 通过下方“安装”按钮选择合适的方式安装服务端。
- 安装完成后，openclaw 会自动启动 MCP 服务并加载 UI 组件。

## 使用示例

- “帮我创建一个新项目，名字叫‘网站改版’，描述是‘提升用户体验’”
- “在‘网站改版’中添加一个任务‘设计首页原型’，指派给@设计师”
- “展示‘网站改版’的甘特图”

更多细节请访问 [项目主页](https://github.com/yourname/mcp-project-collab)。
```

### 2.2 关键新增字段解释

- **`type: "mcp"`**：告诉 openclaw 这是一个 MCP 服务，而不是普通的 CLI 工具。
- **`mcp` 对象**：包含服务端启动的具体配置。
  - `transport`：通信方式，`stdio` 或 `sse`。对于本地服务，通常用 `stdio`。
  - `command` 和 `args`：启动命令及其参数。`%INSTALL_DIR%` 是一个占位符，openclaw 在安装时会替换为实际的安装路径。
  - `env`：可选的环境变量。
- **`ui` 对象**：指定用于渲染 artifact 的客户端包。
  - `package`：npm 包名，该包应导出 React 组件（或其他框架组件），openclaw 会在调用技能后加载此组件并传入 artifact 数据进行渲染。
  - `version`：可指定版本，默认为 `latest`。
- **`requires.bins`**：此处检查 `node` 是否存在，因为服务端依赖 Node.js。
- **`install` 数组**：提供了两种安装方式：通过 npm 安装预构建的包，或从源码构建。安装后，openclaw 会记录服务端的安装路径，并用于后续启动。

### 2.3 openclaw 如何处理这样的技能

1. **解析描述**：openclaw 读取 Markdown 文件，提取元数据。
2. **检查环境**：确认当前操作系统是否在 `os` 列表中，并检查 `requires.bins` 中指定的命令是否存在（如 `node`）。
3. **展示安装选项**：根据 `install` 数组提供多种安装方式，用户选择一种后执行相应命令。
4. **注册 MCP 服务**：安装完成后，openclaw 根据 `mcp` 配置生成 MCP 客户端配置（类似 Claude Desktop 的配置文件），启动子进程连接服务端。
5. **发现工具**：通过 MCP 的 `tools/list` 请求获取服务端提供的工具列表，并在 UI 中展示给用户。
6. **调用工具**：当用户通过自然语言触发某个工具时，openclaw 构造 MCP `tools/call` 请求，并将参数传递给服务端。
7. **渲染 artifact**：服务端返回的结果如果包含 artifact 数据（例如 `{ artifact: "project_created", data: {...} }`），openclaw 会加载 `ui.package` 指定的 npm 包，调用其默认导出组件（或根据 artifact 类型选择对应组件），并将数据作为 props 传入，从而在界面中显示丰富的可视化内容。

---

## 3. 配套客户端 npm 包设计

该包需要满足 openclaw 的加载要求：

- **导出组件**：包应默认导出一个 React 组件（或其他框架组件），该组件接收一个 `artifact` prop（可能是任意 JSON 数据），并根据数据内容渲染不同的 UI。
- **支持按 artifact 类型渲染**：例如 `artifact.type === 'project_created'` 时显示项目卡片，`artifact.type === 'gantt_chart'` 时显示甘特图。
- **样式隔离**：建议使用 CSS Modules 或 styled-components 避免影响宿主样式。
- **轻量**：只包含必要的依赖，避免打包过大。

示例组件代码（React）：

```tsx
import React from "react";

interface Artifact {
  type: string;
  data: any;
}

const ArtifactRenderer: React.FC<{ artifact: Artifact }> = ({ artifact }) => {
  switch (artifact.type) {
    case "project_created":
      return <ProjectCard project={artifact.data} />;
    case "task_added":
      return <TaskItem task={artifact.data} />;
    case "gantt_chart":
      return <GanttChart tasks={artifact.data} />;
    default:
      return <pre>{JSON.stringify(artifact, null, 2)}</pre>;
  }
};

export default ArtifactRenderer;
```

在 `package.json` 中指定入口文件，并确保导出类型定义。

---

## 4. 总结

通过上述设计，您可以：

- **让 openclaw 无缝集成您的 MCP 服务端**：只需提供一个符合 openclaw 规范的技能描述文件，用户即可一键安装并使用。
- **提供丰富的 artifact 界面**：通过配套的客户端 npm 包，openclaw 能够渲染出结构化的可视化结果，提升用户体验。
- **复用 MCP 生态**：您的服务端也兼容任何支持 MCP 的客户端（如 Claude Desktop、Continue 等），扩大了工具的适用范围。

这种集成方式既遵循了 openclaw 现有的技能管理模式，又扩展了对 MCP 协议的支持，为未来更多复杂的 AI 工具集成奠定了基础。如果您在具体实现中遇到任何问题，欢迎进一步交流！

以下是模拟 MCP 项目协同工具技能调用后，由配套客户端 npm 包渲染 artifact 的 HTML 交互演示页面。您可以直接运行此文件，体验不同技能返回的可视化界面。

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>项目协同 MCP · Artifact 演示</title>
    <style>
      * {
        box-sizing: border-box;
        margin: 0;
        font-family:
          system-ui,
          -apple-system,
          "Segoe UI",
          Roboto,
          "Helvetica Neue",
          sans-serif;
      }
      body {
        background: #f4f6f9;
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
      }
      .demo-container {
        max-width: 900px;
        width: 100%;
        background: white;
        border-radius: 24px;
        box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.15);
        overflow: hidden;
      }
      .header {
        padding: 24px 30px;
        background: linear-gradient(145deg, #1e2b3c, #0f1a26);
        color: white;
      }
      .header h1 {
        font-size: 1.8rem;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .header h1 span {
        background: #2d4d6e;
        padding: 4px 12px;
        border-radius: 40px;
        font-size: 0.9rem;
        font-weight: 400;
        color: #cbd5e1;
      }
      .header p {
        margin-top: 10px;
        opacity: 0.8;
        font-size: 1rem;
      }
      .toolbar {
        padding: 16px 30px;
        background: #f8fafd;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: center;
      }
      .skill-badge {
        background: #e9ecf3;
        color: #1e2b3c;
        padding: 6px 14px;
        border-radius: 40px;
        font-size: 0.85rem;
        font-weight: 500;
        letter-spacing: 0.3px;
      }
      .button-group {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-left: auto;
      }
      .btn {
        background: white;
        border: 1px solid #cbd5e1;
        padding: 8px 18px;
        border-radius: 40px;
        font-size: 0.9rem;
        font-weight: 500;
        color: #1e2b3c;
        cursor: pointer;
        transition: all 0.15s;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
      }
      .btn:hover {
        background: #e2e8f0;
        border-color: #94a3b8;
      }
      .btn.primary {
        background: #1e2b3c;
        border-color: #1e2b3c;
        color: white;
      }
      .btn.primary:hover {
        background: #2d4055;
      }
      .artifact-panel {
        padding: 30px;
        background: white;
        min-height: 350px;
      }
      .artifact-placeholder {
        border: 2px dashed #cbd5e1;
        border-radius: 20px;
        padding: 40px;
        text-align: center;
        color: #64748b;
        background: #f9fbfd;
      }
      /* 各个 artifact 样式 */
      .project-card {
        background: linear-gradient(135deg, #f8fafc, #ffffff);
        border-radius: 20px;
        padding: 24px;
        box-shadow: 0 8px 20px -8px rgba(0, 32, 64, 0.08);
        border: 1px solid #e9edf2;
      }
      .project-header {
        display: flex;
        align-items: center;
        gap: 15px;
      }
      .project-icon {
        width: 50px;
        height: 50px;
        background: #1e2b3c;
        color: white;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 26px;
      }
      .project-info h3 {
        font-size: 1.6rem;
        font-weight: 600;
        margin-bottom: 6px;
        color: #0b1a2a;
      }
      .project-meta {
        display: flex;
        gap: 20px;
        color: #475569;
        font-size: 0.9rem;
        margin-top: 16px;
      }
      .task-list {
        margin-top: 20px;
        border-top: 1px solid #e2e8f0;
        padding-top: 20px;
      }
      .task-item {
        display: flex;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #edf2f7;
      }
      .task-check {
        margin-right: 15px;
        color: #94a3b8;
      }
      .task-title {
        flex: 1;
        font-weight: 500;
      }
      .task-assignee {
        background: #e9ecf3;
        padding: 4px 10px;
        border-radius: 30px;
        font-size: 0.8rem;
        color: #334155;
      }
      .gantt-chart {
        margin-top: 20px;
      }
      .gantt-row {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
      }
      .gantt-label {
        width: 100px;
        font-size: 0.9rem;
        font-weight: 500;
        color: #1e293b;
      }
      .gantt-bar-container {
        flex: 1;
        height: 30px;
        background: #e9ecf3;
        border-radius: 30px;
        position: relative;
        overflow: hidden;
      }
      .gantt-bar {
        height: 100%;
        background: linear-gradient(90deg, #3b82f6, #2563eb);
        border-radius: 30px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding-right: 10px;
        color: white;
        font-size: 0.75rem;
        font-weight: 500;
        white-space: nowrap;
      }
      .footer-note {
        margin-top: 30px;
        font-size: 0.8rem;
        color: #94a3b8;
        text-align: center;
        border-top: 1px solid #e2e8f0;
        padding-top: 20px;
      }
      .badge-npm {
        background: #cb0000;
        color: white;
        padding: 2px 8px;
        border-radius: 20px;
        font-size: 0.7rem;
        font-weight: 600;
        margin-left: 8px;
      }
    </style>
  </head>
  <body>
    <div class="demo-container">
      <div class="header">
        <h1>
          📊 project-collab
          <span>MCP 工具集</span>
        </h1>
        <p>
          调用技能后，由
          <code style="background:#2d4d6e; padding:2px 6px; border-radius:6px;"
            >mcp-project-collab-client</code
          >
          渲染的 Artifact 示例
        </p>
      </div>

      <div class="toolbar">
        <span class="skill-badge">🛠️ 可用技能: create_project, add_task, get_gantt</span>
        <div class="button-group">
          <button class="btn" id="btnProject">📌 创建项目</button>
          <button class="btn" id="btnTask">✅ 添加任务</button>
          <button class="btn primary" id="btnGantt">📈 查看甘特图</button>
        </div>
      </div>

      <div class="artifact-panel" id="artifactPanel">
        <!-- 动态渲染 artifact 的区域 -->
        <div class="artifact-placeholder" id="placeholderMsg">
          👆 点击上方按钮模拟技能调用，将显示对应的 artifact
        </div>
      </div>

      <div class="footer-note">
        ⚡ 模拟 MCP 调用返回的结构化数据 → 由客户端包解析并渲染。<span class="badge-npm">npm</span>
      </div>
    </div>

    <script>
      (function () {
        const panel = document.getElementById("artifactPanel");

        // 清空面板并渲染新内容
        function renderArtifact(artifact) {
          panel.innerHTML = ""; // 移除原有内容（包括占位符）

          // 根据 artifact.type 选择渲染函数
          switch (artifact.type) {
            case "project_created":
              panel.appendChild(renderProjectCreated(artifact.data));
              break;
            case "task_added":
              panel.appendChild(renderTaskAdded(artifact.data));
              break;
            case "gantt_chart":
              panel.appendChild(renderGanttChart(artifact.data));
              break;
            default:
              const pre = document.createElement("pre");
              pre.style.background = "#f1f5f9";
              pre.style.padding = "20px";
              pre.style.borderRadius = "12px";
              pre.style.overflow = "auto";
              pre.textContent = JSON.stringify(artifact, null, 2);
              panel.appendChild(pre);
          }
        }

        // 项目卡片
        function renderProjectCreated(data) {
          const div = document.createElement("div");
          div.className = "project-card";
          div.innerHTML = `
                    <div class="project-header">
                        <div class="project-icon">📁</div>
                        <div class="project-info">
                            <h3>${escapeHtml(data.name)}</h3>
                            <p style="color:#475569;">${escapeHtml(data.description) || "无描述"}</p>
                        </div>
                    </div>
                    <div class="project-meta">
                        <span>🆔 ${escapeHtml(data.id)}</span>
                        <span>📅 创建于 ${new Date().toLocaleDateString()}</span>
                    </div>
                    <div class="task-list">
                        <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
                            <span><strong>待办任务</strong> (${data.tasks ? data.tasks.length : 0})</span>
                            <span style="color:#2563eb;">+ 添加任务</span>
                        </div>
                        ${
                          data.tasks && data.tasks.length
                            ? data.tasks
                                .map(
                                  (task) => `
                            <div class="task-item">
                                <span class="task-check">○</span>
                                <span class="task-title">${escapeHtml(task.title)}</span>
                                ${task.assignee ? `<span class="task-assignee">${escapeHtml(task.assignee)}</span>` : ""}
                            </div>
                        `,
                                )
                                .join("")
                            : '<div style="color:#94a3b8; padding:12px 0;">暂无任务，点击“添加任务”模拟</div>'
                        }
                    </div>
                `;
          return div;
        }

        // 任务添加成功提示
        function renderTaskAdded(data) {
          const div = document.createElement("div");
          div.className = "project-card";
          div.innerHTML = `
                    <div style="display:flex; gap:20px; align-items:center;">
                        <span style="font-size:40px;">✅</span>
                        <div>
                            <h3 style="margin-bottom:6px;">任务已添加</h3>
                            <p style="color:#1e293b;"><strong>${escapeHtml(data.title)}</strong> 已加入项目「${escapeHtml(data.project)}」</p>
                            ${data.dueDate ? `<p style="color:#64748b;">截止日期: ${escapeHtml(data.dueDate)}</p>` : ""}
                            ${data.assignee ? `<p style="color:#64748b;">负责人: ${escapeHtml(data.assignee)}</p>` : ""}
                        </div>
                    </div>
                `;
          return div;
        }

        // 甘特图 (简化版)
        function renderGanttChart(data) {
          const div = document.createElement("div");
          div.className = "project-card";
          div.innerHTML = `<h3 style="margin-bottom:20px;">📊 项目甘特图 · ${escapeHtml(data.projectName)}</h3>`;
          const chartDiv = document.createElement("div");
          chartDiv.className = "gantt-chart";

          if (data.tasks && data.tasks.length) {
            data.tasks.forEach((task) => {
              const row = document.createElement("div");
              row.className = "gantt-row";
              const label = document.createElement("div");
              label.className = "gantt-label";
              label.textContent = task.name;
              const barContainer = document.createElement("div");
              barContainer.className = "gantt-bar-container";
              const bar = document.createElement("div");
              bar.className = "gantt-bar";
              // 模拟进度宽度 (30% ~ 90%)
              const width = task.progress || Math.floor(Math.random() * 60 + 20);
              bar.style.width = width + "%";
              bar.textContent = width + "%";
              barContainer.appendChild(bar);
              row.appendChild(label);
              row.appendChild(barContainer);
              chartDiv.appendChild(row);
            });
          } else {
            chartDiv.innerHTML = '<p style="color:#94a3b8;">暂无任务数据</p>';
          }
          div.appendChild(chartDiv);
          return div;
        }

        // 简单防XSS
        function escapeHtml(unsafe) {
          if (!unsafe) return unsafe;
          return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
        }

        // 模拟数据
        const demoData = {
          project: {
            type: "project_created",
            data: {
              id: "proj_1234",
              name: "新产品发布",
              description: "Q3 重点市场推广",
              tasks: [
                { title: "市场调研", assignee: "张敏" },
                { title: "原型设计", assignee: "李雷" },
                { title: "文案撰写" },
              ],
            },
          },
          task: {
            type: "task_added",
            data: {
              title: "设计首页原型",
              project: "新产品发布",
              dueDate: "2025-03-10",
              assignee: "韩梅梅",
            },
          },
          gantt: {
            type: "gantt_chart",
            data: {
              projectName: "新产品发布",
              tasks: [
                { name: "需求分析", progress: 100 },
                { name: "设计", progress: 65 },
                { name: "开发", progress: 30 },
                { name: "测试", progress: 10 },
              ],
            },
          },
        };

        // 绑定按钮
        document.getElementById("btnProject").addEventListener("click", () => {
          renderArtifact(demoData.project);
        });
        document.getElementById("btnTask").addEventListener("click", () => {
          renderArtifact(demoData.task);
        });
        document.getElementById("btnGantt").addEventListener("click", () => {
          renderArtifact(demoData.gantt);
        });

        // 默认显示项目卡片（可选）
        // renderArtifact(demoData.project);
      })();
    </script>
  </body>
</html>
```

### 交互说明

- 页面顶部展示了 MCP 工具集名称和对应的客户端 npm 包。
- 中间工具栏显示当前可用技能（模拟），并提供三个按钮分别触发“创建项目”、“添加任务”、“查看甘特图”。
- 下方区域会根据点击动态渲染对应的 artifact 卡片：
  - **创建项目**：展示项目详情、ID、创建日期以及一个简单的任务列表。
  - **添加任务**：显示任务添加成功的确认卡片，包含项目名、截止日期和负责人。
  - **查看甘特图**：以进度条形式展示各任务的完成百分比。
- 所有样式均采用现代化、圆角设计，与常见设计系统保持一致。

您可以直接将此 HTML 保存为文件，在浏览器中打开体验。后续可将此原型作为客户端 npm 包组件开发的参考。
