---
title: "Project Calendar & Task Assistant"
description: "Project calendar aggregation and task tracking for delivery teams"
---

Project work spans meetings, deadlines, release windows, and cross-team dependencies. This skill turns OpenClaw into a project assistant that aggregates project calendars, tracks task status, and delivers briefings and alerts to your team channel.

---

## I. Atomic Skill Library (Underlying Capabilities)

These are the smallest functional units used to build the project assistant workflow.

| Atomic Skill      | Description             | Input Example            | Output Example  |
| ----------------- | ----------------------- | ------------------------ | --------------- |
| `calendar_fetch`  | Pull project calendars  | Calendar ids, time range | Event list      |
| `task_sync`       | Sync tasks from tracker | Project id, filters      | Task list       |
| `task_update`     | Update task status      | Task id, status          | Updated task    |
| `risk_scan`       | Identify schedule risks | Events, tasks            | Risk list       |
| `briefing_render` | Render briefing summary | Events, tasks            | Summary text    |
| `alert_send`      | Notify stakeholders     | Channel, message         | Delivery result |
| `cron_schedule`   | Schedule recurring runs | Interval, timezone       | Schedule id     |

---

## II. Composite Skills (Task-Oriented Advanced Tools)

Atomic skills are combined into end-to-end project workflows.

### 1. Composite Skill: `project_calendar_briefing`

- **Skill Name**: `project_calendar_briefing`
- **Description**: Generate a daily project calendar and task briefing.
- **Input Parameters**:
  ```json
  {
    "project_name": "Gateway Revamp",
    "calendar_ids": ["eng-release", "product-sync"],
    "task_filters": { "status": ["todo", "in_progress"] },
    "timezone": "Asia/Shanghai"
  }
  ```
- **Internal Execution Flow**:
  1. Call `calendar_fetch` to pull upcoming project events.
  2. Call `task_sync` to fetch active tasks.
  3. Call `risk_scan` to detect schedule conflicts or overdue tasks.
  4. Call `briefing_render` to compile a briefing.
- **Output Results**:
  ```json
  {
    "briefing": "Today: Release sync 10:00; 6 tasks active; 2 at risk.",
    "risks": ["API freeze overdue by 2 days"]
  }
  ```

### 2. Composite Skill: `project_task_tracking`

- **Skill Name**: `project_task_tracking`
- **Description**: Track task progress and push updates into the calendar.
- **Input Parameters**:
  ```json
  {
    "project_id": "gateway-revamp",
    "update_rules": [
      { "status": "in_progress", "calendar_tag": "active" },
      { "status": "blocked", "calendar_tag": "risk" }
    ]
  }
  ```
- **Internal Execution Flow**:
  1. Call `task_sync` to fetch task state.
  2. Call `task_update` to apply rules or labels.
  3. Call `calendar_fetch` to annotate relevant milestones.
  4. Call `briefing_render` to summarize changes.
- **Output Results**:
  ```json
  {
    "updated_tasks": 12,
    "summary": "2 tasks blocked, 4 moved to in_progress"
  }
  ```

### 3. Composite Skill: `project_alerts`

- **Skill Name**: `project_alerts`
- **Description**: Notify when tasks or milestones are at risk.
- **Input Parameters**:
  ```json
  {
    "thresholds": [
      { "metric": "overdue_tasks", "value_gt": 3 },
      { "metric": "milestone_slip_days", "value_gt": 2 }
    ],
    "channel": "@project-updates"
  }
  ```
- **Internal Execution Flow**:
  1. Call `task_sync` to detect overdue work.
  2. Call `risk_scan` for milestone slippage.
  3. Call `alert_send` to notify stakeholders.
- **Output Results**:
  ```json
  {
    "alerts_sent": 1,
    "alerts": ["Milestone M2 slipped by 3 days"]
  }
  ```

---

## III. Setup

```text
Run a daily project briefing at 09:00.
Aggregate calendars: eng-release, product-sync.
Track tasks from the gateway-revamp project.
Post the briefing to @project-updates.
Alert if overdue tasks > 3 or milestone slip > 2 days.
```

---

## IV. Key Insights

- Unified calendars + tasks reduce context switching.
- Risk alerts keep milestones visible before they slip.
- Scheduling the briefing creates a steady project rhythm.

---

## Related Links

- [Cron jobs](/automation/cron-jobs)
- [Sessions](/cli/sessions)
- [Message CLI](/cli/message)
