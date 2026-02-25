---
title: "Todoist Task Manager"
description: "Agent task visibility with Todoist sync"
---

Long-running agent workflows can feel opaque. This skill pushes task plans, progress logs, and status changes to Todoist so users can track execution in real time.

---

## I. Atomic Skill Library (Underlying Capabilities)

These are the smallest functional units used to build the task visibility workflow.

| Atomic Skill          | Description           | Input Example    | Output Example |
| --------------------- | --------------------- | ---------------- | -------------- |
| `todoist_task_create` | Create a Todoist task | Content, project | Task id        |
| `todoist_task_update` | Update task metadata  | Task id, section | Updated task   |
| `todoist_comment_add` | Add progress comment  | Task id, text    | Comment id     |
| `plan_capture`        | Capture agent plan    | Plan text        | Plan block     |
| `status_stream`       | Stream step updates   | Step result      | Update         |
| `heartbeat_check`     | Detect stalled work   | Task id, SLA     | Alert          |

---

## II. Composite Skills (Task-Oriented Advanced Tools)

Atomic skills are combined into end-to-end visibility workflows.

### 1. Composite Skill: `todoist_task_visibility`

- **Skill Name**: `todoist_task_visibility`
- **Description**: Create a task and stream live progress.
- **Input Parameters**:
  ```json
  {
    "task_title": "Build reporting dashboard",
    "plan": "Define schema → build API → ship UI",
    "section": "In Progress"
  }
  ```
- **Internal Execution Flow**:
  1. Call `plan_capture` to format the plan.
  2. Call `todoist_task_create` to create the task.
  3. Call `todoist_comment_add` for step completions.
  4. Call `todoist_task_update` when status changes.
- **Output Results**:
  ```json
  {
    "task_id": "task_123",
    "status": "in_progress"
  }
  ```

### 2. Composite Skill: `todoist_stall_monitor`

- **Skill Name**: `todoist_stall_monitor`
- **Description**: Detect stalled tasks and alert the user.
- **Input Parameters**:
  ```json
  {
    "task_id": "task_123",
    "sla_minutes": 45
  }
  ```
- **Internal Execution Flow**:
  1. Call `heartbeat_check` to detect inactivity.
  2. Call `todoist_comment_add` with a status ping.
  3. Notify the user if stalled.
- **Output Results**:
  ```json
  {
    "stalled": true,
    "last_update_minutes": 62
  }
  ```

---

## III. Setup

1. Create a Todoist project and sections: In Progress, Waiting, Done.
2. Create the Todoist API wrapper scripts or install a dedicated skill.
3. Prompt OpenClaw:

```text
For every complex task:
1. Create a Todoist task in In Progress with my plan.
2. Add a comment for each step you finish.
3. Move the task to Done when complete.

If no updates for 45 minutes, alert me and post a status check comment.
```

---

## IV. Key Insights

- Externalized plans improve trust and clarity.
- Comment streams show real-time progress.
- Heartbeat checks prevent silent stalls.

---

## Related Links

- [Todoist REST API Documentation](https://developer.todoist.com/rest/v2/)
