---
title: "自主项目管理"
description: "基于子代理的项目管理流程与去中心化协作"
---

当项目拥有多个并行工作流时，持续切换上下文、追踪进度、手动协调交付会非常耗费精力。本流程通过子代理自主执行与共享状态协作，让主会话聚焦策略与优先级管理。

---

## 一、原子技能库（基础能力）

这些是构建自主项目管理体系的最小功能单元。

| 原子技能         | 描述                 | 输入示例                | 输出示例        |
| ---------------- | -------------------- | ----------------------- | --------------- |
| `sessions_spawn` | 创建带范围的子代理   | Label, task description | Subagent id     |
| `sessions_send`  | 发送更新或新任务     | Label, message          | Delivery status |
| `state_read`     | 读取共享项目状态     | Project id, file path   | Parsed state    |
| `state_write`    | 更新共享项目状态     | State patch             | Updated state   |
| `task_split`     | 将目标拆分为任务单元 | Goal, constraints       | Task list       |
| `risk_scan`      | 识别阻塞与依赖       | Task list               | Risk list       |
| `status_rollup`  | 汇总跨工作流状态     | State file              | Status report   |
| `doc_sync`       | 同步产出到文档或报告 | Output files            | Report summary  |

---

## 二、组合技能（面向任务的高级工具）

原子技能按照业务流程组合成一站式能力。每个组合技能接收结构化输入，执行完整流程，并返回结构化结果。

### 1. 组合技能：`autonomous_project_bootstrap`

- **技能名称**：`autonomous_project_bootstrap`
- **描述**：初始化项目，拆分任务，创建子代理，并生成共享状态文件。
- **输入参数**：
  ```json
  {
    "project_id": "website-redesign",
    "goal": "Redesign marketing website with new pricing page",
    "workstreams": ["frontend", "content", "seo"],
    "owners": ["pm-frontend", "pm-content", "pm-seo"]
  }
  ```
- **内部执行流程**：
  1. 调用 `task_split` 按工作流生成任务清单。
  2. 调用 `sessions_spawn` 创建各工作流子代理。
  3. 调用 `state_write` 创建初始 `STATE.yaml`。
  4. 返回子代理列表与首批任务。
- **输出结果**：
  ```json
  {
    "project_state_path": "projects/website-redesign/STATE.yaml",
    "subagents": ["pm-frontend", "pm-content", "pm-seo"],
    "tasks": [{ "id": "homepage-hero", "owner": "pm-frontend" }]
  }
  ```

### 2. 组合技能：`autonomous_project_execution`

- **技能名称**：`autonomous_project_execution`
- **描述**：并行执行任务，更新状态，并暴露阻塞项。
- **输入参数**：
  ```json
  {
    "project_id": "website-redesign",
    "state_path": "projects/website-redesign/STATE.yaml",
    "check_interval_minutes": 30
  }
  ```
- **内部执行流程**：
  1. 调用 `state_read` 拉取当前任务和归属。
  2. 调用 `sessions_send` 分发下一步任务。
  3. 调用 `risk_scan` 识别阻塞与依赖。
  4. 调用 `state_write` 记录进度与下一步行动。
- **输出结果**：
  ```json
  {
    "status": "running",
    "blocked_tasks": ["content-migration"],
    "next_actions": ["pm-content: Resume once api-auth is done"]
  }
  ```

### 3. 组合技能：`autonomous_project_report`

- **技能名称**：`autonomous_project_report`
- **描述**：聚合进度并生成主会话或干系人可读的总结。
- **输入参数**：
  ```json
  {
    "project_id": "website-redesign",
    "state_path": "projects/website-redesign/STATE.yaml",
    "include_risks": true
  }
  ```
- **内部执行流程**：
  1. 调用 `state_read` 加载当前进展。
  2. 调用 `status_rollup` 生成简短摘要。
  3. 调用 `doc_sync` 写入共享报告文件。
- **输出结果**：
  ```json
  {
    "summary": "Frontend 60% done, content blocked by API schema",
    "report_path": "projects/website-redesign/REPORT.md"
  }
  ```

---

## 三、核心模式：STATE.yaml

每个项目保留一个 `STATE.yaml` 作为唯一事实来源。

```yaml
project: website-redesign
updated: 2026-02-10T14:30:00Z

tasks:
  - id: homepage-hero
    status: in_progress
    owner: pm-frontend
    started: 2026-02-10T12:00:00Z
    notes: "Working on responsive layout"

  - id: api-auth
    status: done
    owner: pm-backend
    completed: 2026-02-10T14:00:00Z
    output: "src/api/auth.ts"

  - id: content-migration
    status: blocked
    owner: pm-content
    blocked_by: api-auth
    notes: "Waiting for new endpoint schema"

next_actions:
  - "pm-content: Resume migration now that api-auth is done"
  - "pm-frontend: Review hero with design team"
```

---

## 四、示例 STATE.yaml（可直接复制）

```yaml
project: demo-project
updated: 2026-02-24T08:00:00Z
owners:
  coordinator: pm-core

tasks:
  - id: auth-refactor
    status: in_progress
    owner: pm-backend
    started: 2026-02-24T08:10:00Z
    notes: "Refactor auth middleware and tests"

  - id: docs-update
    status: todo
    owner: pm-docs
    notes: "Update CLI docs after auth changes"

dependencies:
  - from: docs-update
    on: auth-refactor

next_actions:
  - "pm-backend: Finish middleware changes"
  - "pm-docs: Start updates after auth-refactor completes"
```

---

## 五、子代理执行脚本（真实命令）

```bash
export OPENCLAW_GATEWAY_URL="ws://127.0.0.1:18789"
export OPENCLAW_GATEWAY_TOKEN="<your-token>"

openclaw agent --agent <agent-id> --message "Initialize autonomous project management for project_id=demo-project. Goal: refactor auth and update docs. Workstreams: backend, docs. Owners: pm-backend, pm-docs. Use sessions_spawn and create projects/demo-project/STATE.yaml."

openclaw agent --agent <agent-id> --message "Run autonomous_project_execution for project_id=demo-project with state_path=projects/demo-project/STATE.yaml. Update state and return blocked_tasks and next_actions."

openclaw agent --agent <agent-id> --message "Run autonomous_project_report for project_id=demo-project with state_path=projects/demo-project/STATE.yaml and include_risks=true. Return summary and report_path."
```

---

## 六、子代理工作流

1. 主会话收到项目目标。
2. `autonomous_project_bootstrap` 创建任务并启动子代理。
3. 子代理执行任务并更新 `STATE.yaml`。
4. `autonomous_project_execution` 协调进度并解阻。
5. `autonomous_project_report` 汇总输出给主会话。

---

## 七、AGENTS.md 模式示例

```text
## PM Delegation Pattern

Main session = coordinator only. Execution runs in subagents.

Workflow:
1. New task arrives
2. Check PROJECT_REGISTRY.md for existing PM
3. If PM exists -> sessions_send(label="pm-xxx", message="[task]")
4. If new project -> sessions_spawn(label="pm-xxx", task="[task]")
5. PM executes, updates STATE.yaml, reports back
6. Main agent summarizes to user

Rules:
- Main session: 0-2 tool calls max (spawn/send only)
- PMs own their STATE.yaml files
- PMs can spawn sub-subagents for parallel subtasks
- All state changes committed to git
```

---

## 八、示例：创建 PM 子代理

```text
User: "Refactor the auth module and update the docs"

Main agent:
1. Checks registry -> no active pm-auth
2. Spawns: sessions_spawn(
     label="pm-auth-refactor",
     task="Refactor auth module, update docs. Track in STATE.yaml"
   )
3. Responds: "Spawned pm-auth-refactor. I'll report back when done."

PM subagent:
1. Creates STATE.yaml with task breakdown
2. Works through tasks, updating status
3. Commits changes
4. Reports completion to main
```

---

## 九、关键要点

- **状态优先**：文件化协作比消息转发更可扩展。
- **Git 作为审计**：提交 `STATE.yaml` 便于追溯。
- **清晰标签**：使用 `pm-{project}-{scope}` 便于定位。
- **主会话要薄**：聚焦策略，执行交给子代理。
