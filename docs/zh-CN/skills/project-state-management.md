---
title: "项目状态管理系统"
description: "看板的事件驱动替代方案"
---

传统看板需要手动更新且容易丢失上下文。该技能用事件驱动的方式记录进展、决策与阻塞，提供可追溯的项目状态管理。

---

## 一、原子技能库（基础能力）

这些是构建项目状态管理流程的最小功能单元。

| 原子技能         | 描述           | 输入示例          | 输出示例       |
| ---------------- | -------------- | ----------------- | -------------- |
| `state_store`    | 持久化项目状态 | Project data      | State snapshot |
| `event_log`      | 记录事件       | Type, description | Event id       |
| `blocker_track`  | 跟踪阻塞       | Blocker detail    | Blocker id     |
| `commit_link`    | 关联提交       | Repo, commit      | Linked event   |
| `status_query`   | 查询状态       | Project name      | Status summary |
| `daily_summary`  | 输出日报       | Time range        | Summary text   |
| `sessions_spawn` | 启动分析子代理 | Project list      | Session id     |

---

## 二、组合技能（面向任务的高级工具）

原子技能组合成端到端的项目工作流。

### 1. 组合技能：`event_driven_state_update`

- **技能名称**：`event_driven_state_update`
- **描述**：将对话式更新写入项目状态。
- **输入参数**：
  ```json
  {
    "project": "Gateway Revamp",
    "event_type": "progress",
    "description": "Finished auth flow, starting dashboard"
  }
  ```
- **内部执行流程**：
  1. 调用 `event_log` 记录事件。
  2. 调用 `state_store` 更新状态与阶段。
  3. 如遇阻塞，调用 `blocker_track`。
- **输出结果**：
  ```json
  {
    "event_id": "evt_102",
    "state": "active"
  }
  ```

### 2. 组合技能：`project_state_query`

- **技能名称**：`project_state_query`
- **描述**：回答状态与决策上下文问题。
- **输入参数**：
  ```json
  {
    "project": "Gateway Revamp",
    "question": "What's blocking us?"
  }
  ```
- **内部执行流程**：
  1. 调用 `status_query` 获取最新状态。
  2. 调用 `blocker_track` 列出未解决阻塞。
  3. 输出状态与上下文总结。
- **输出结果**：
  ```json
  {
    "status": "blocked",
    "blockers": ["Waiting on API approval"]
  }
  ```

### 3. 组合技能：`daily_state_summary`

- **技能名称**：`daily_state_summary`
- **描述**：生成每日站会摘要与提交关联。
- **输入参数**：
  ```json
  {
    "range": "last_24_hours",
    "project": "Gateway Revamp"
  }
  ```
- **内部执行流程**：
  1. 调用 `commit_link` 关联提交记录。
  2. 调用 `daily_summary` 生成报告。
  3. 发送至团队频道。
- **输出结果**：
  ```json
  {
    "summary": "2 events logged, 1 blocker open",
    "commits": 3
  }
  ```

---

## 三、配置步骤

1. 创建项目状态数据库（Postgres 或 SQLite）。
2. 建立更新频道（Telegram 或 Discord）。
3. 提示 OpenClaw：

```text
When I say "Finished [task]", log a progress event and update state.
When I say "Blocked on [issue]", create a blocker and mark status blocked.
When I ask "What's the status of [project]?", return latest events and blockers.

Every morning at 9 AM, scan git commits from the past 24 hours, link them to projects,
and post a standup summary to #project-state.
```

---

## 四、关键要点

- 事件日志保留决策原因。
- 日报机制减少手动维护。
- 提交关联提升可追溯性。

---

## 相关链接

- [Event Sourcing Pattern](https://martinfowler.com/eaaDev/EventSourcing.html)
- [Telegram](/channels/telegram)
