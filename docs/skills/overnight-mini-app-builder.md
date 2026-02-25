---
title: "Goal-Driven Autonomous Tasks"
description: "Autonomous daily tasks and overnight MVP delivery"
---

Your AI agent is powerful but reactive. This skill turns OpenClaw into a self-directed teammate that plans daily tasks, executes them, and reports progress against your goals.

---

## I. Atomic Skill Library (Underlying Capabilities)

These are the smallest functional units used to build the autonomous task workflow.

| Atomic Skill      | Description            | Input Example          | Output Example |
| ----------------- | ---------------------- | ---------------------- | -------------- |
| `goal_capture`    | Capture user goals     | Goal list              | Goal profile   |
| `task_plan`       | Generate daily tasks   | Goals, constraints     | Task list      |
| `task_schedule`   | Schedule execution     | Task list, time window | Schedule       |
| `sessions_spawn`  | Spawn sub-agent        | Task context           | Session id     |
| `sessions_send`   | Send task instructions | Session id, task       | Ack            |
| `status_track`    | Track progress         | Task id                | Status update  |
| `report_generate` | Generate daily report  | Task results           | Report         |

---

## II. Composite Skills (Task-Oriented Advanced Tools)

Atomic skills are combined into end-to-end execution workflows.

### 1. Composite Skill: `daily_autonomous_tasks`

- **Skill Name**: `daily_autonomous_tasks`
- **Description**: Create and execute daily tasks aligned with goals.
- **Input Parameters**:
  ```json
  {
    "goals": ["launch MVP", "grow newsletter"],
    "daily_task_count": 5,
    "time_window": "09:00-18:00"
  }
  ```
- **Internal Execution Flow**:
  1. Call `goal_capture` to load goal context.
  2. Call `task_plan` to generate tasks.
  3. Call `task_schedule` to timebox execution.
  4. Call `sessions_spawn` + `sessions_send` to execute tasks.
  5. Call `status_track` to collect progress.
- **Output Results**:
  ```json
  {
    "tasks_started": 5,
    "tasks_completed": 3
  }
  ```

### 2. Composite Skill: `overnight_mvp_builder`

- **Skill Name**: `overnight_mvp_builder`
- **Description**: Build a surprise mini-app MVP overnight.
- **Input Parameters**:
  ```json
  {
    "goal_area": "workflow automation",
    "constraints": "ship in 1 night"
  }
  ```
- **Internal Execution Flow**:
  1. Call `task_plan` to define MVP scope.
  2. Call `sessions_spawn` to run a builder sub-agent.
  3. Call `sessions_send` to execute build steps.
  4. Call `report_generate` to summarize output.
- **Output Results**:
  ```json
  {
    "mvp_summary": "Automation mini-app shipped",
    "artifacts": ["repo link", "demo link"]
  }
  ```

### 3. Composite Skill: `goal_progress_reporting`

- **Skill Name**: `goal_progress_reporting`
- **Description**: Generate progress reports across goals.
- **Input Parameters**:
  ```json
  {
    "range": "weekly",
    "goals": ["launch MVP", "grow newsletter"]
  }
  ```
- **Internal Execution Flow**:
  1. Call `status_track` to collect task results.
  2. Call `report_generate` to summarize progress.
- **Output Results**:
  ```json
  {
    "completed": 18,
    "blocked": 4
  }
  ```

---

## III. Setup

1. Share your goals with OpenClaw.
2. Define the daily task cadence and time window.
3. Prompt OpenClaw:

```text
Every morning at 8:00, generate 4-5 tasks that move my goals forward.
Execute them autonomously and report progress at 6:00 PM.
If possible, build a small MVP overnight that aligns with my goals.
```

---

## IV. Key Insights

- Rich goals lead to better task planning.
- Sub-agents help parallelize execution.
- Daily reports keep momentum visible.

---

## Related Links

- [Sessions](/cli/sessions)
- [Message CLI](/cli/message)
