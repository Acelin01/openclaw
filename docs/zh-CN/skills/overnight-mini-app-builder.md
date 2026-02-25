---
title: "目标驱动型自主任务"
description: "自主每日任务与夜间 MVP 交付"
---

你的 AI 代理很强，但通常是被动响应。该技能将 OpenClaw 变成自驱型队友，基于目标规划每日任务、自动执行并输出进度汇报。

---

## 一、原子技能库（基础能力）

这些是构建自主任务流程的最小功能单元。

| 原子技能          | 描述         | 输入示例               | 输出示例      |
| ----------------- | ------------ | ---------------------- | ------------- |
| `goal_capture`    | 记录目标     | Goal list              | Goal profile  |
| `task_plan`       | 生成每日任务 | Goals, constraints     | Task list     |
| `task_schedule`   | 安排执行节奏 | Task list, time window | Schedule      |
| `sessions_spawn`  | 启动子代理   | Task context           | Session id    |
| `sessions_send`   | 下发任务指令 | Session id, task       | Ack           |
| `status_track`    | 跟踪进度     | Task id                | Status update |
| `report_generate` | 生成汇报     | Task results           | Report        |

---

## 二、组合技能（面向任务的高级工具）

原子技能组合成端到端的执行工作流。

### 1. 组合技能：`daily_autonomous_tasks`

- **技能名称**：`daily_autonomous_tasks`
- **描述**：根据目标生成并执行每日任务。
- **输入参数**：
  ```json
  {
    "goals": ["launch MVP", "grow newsletter"],
    "daily_task_count": 5,
    "time_window": "09:00-18:00"
  }
  ```
- **内部执行流程**：
  1. 调用 `goal_capture` 读取目标背景。
  2. 调用 `task_plan` 生成任务列表。
  3. 调用 `task_schedule` 排程执行。
  4. 调用 `sessions_spawn` + `sessions_send` 进行执行。
  5. 调用 `status_track` 汇总进度。
- **输出结果**：
  ```json
  {
    "tasks_started": 5,
    "tasks_completed": 3
  }
  ```

### 2. 组合技能：`overnight_mvp_builder`

- **技能名称**：`overnight_mvp_builder`
- **描述**：夜间构建一个与目标相关的 MVP。
- **输入参数**：
  ```json
  {
    "goal_area": "workflow automation",
    "constraints": "ship in 1 night"
  }
  ```
- **内部执行流程**：
  1. 调用 `task_plan` 定义 MVP 范围。
  2. 调用 `sessions_spawn` 启动构建子代理。
  3. 调用 `sessions_send` 执行构建步骤。
  4. 调用 `report_generate` 输出结果。
- **输出结果**：
  ```json
  {
    "mvp_summary": "Automation mini-app shipped",
    "artifacts": ["repo link", "demo link"]
  }
  ```

### 3. 组合技能：`goal_progress_reporting`

- **技能名称**：`goal_progress_reporting`
- **描述**：输出目标进度报告。
- **输入参数**：
  ```json
  {
    "range": "weekly",
    "goals": ["launch MVP", "grow newsletter"]
  }
  ```
- **内部执行流程**：
  1. 调用 `status_track` 汇总执行结果。
  2. 调用 `report_generate` 生成进度汇报。
- **输出结果**：
  ```json
  {
    "completed": 18,
    "blocked": 4
  }
  ```

---

## 三、配置步骤

1. 将你的目标提供给 OpenClaw。
2. 设定每日任务数量与执行时间窗。
3. 提示 OpenClaw：

```text
Every morning at 8:00, generate 4-5 tasks that move my goals forward.
Execute them autonomously and report progress at 6:00 PM.
If possible, build a small MVP overnight that aligns with my goals.
```

---

## 四、关键要点

- 目标越清晰，任务规划越有效。
- 子代理可并行执行任务。
- 日报周报让进度可视化。

---

## 相关链接

- [Sessions](/cli/sessions)
- [Message CLI](/cli/message)
