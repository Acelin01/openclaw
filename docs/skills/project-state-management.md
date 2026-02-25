---
title: "Project State Management"
description: "Event-driven alternative to Kanban for project tracking"
---

Kanban boards become stale and lose context. This skill replaces manual updates with an event-driven project state system that preserves decisions, blockers, and progress history.

---

## I. Atomic Skill Library (Underlying Capabilities)

These are the smallest functional units used to build the project state workflow.

| Atomic Skill     | Description              | Input Example     | Output Example |
| ---------------- | ------------------------ | ----------------- | -------------- |
| `state_store`    | Persist project state    | Project data      | State snapshot |
| `event_log`      | Append an event          | Type, description | Event id       |
| `blocker_track`  | Track blockers           | Blocker detail    | Blocker id     |
| `commit_link`    | Link git commits         | Repo, commit      | Linked event   |
| `status_query`   | Query project status     | Project name      | Status summary |
| `daily_summary`  | Generate standup summary | Time range        | Summary text   |
| `sessions_spawn` | Spawn analysis sub-agent | Project list      | Session id     |

---

## II. Composite Skills (Task-Oriented Advanced Tools)

Atomic skills are combined into end-to-end project workflows.

### 1. Composite Skill: `event_driven_state_update`

- **Skill Name**: `event_driven_state_update`
- **Description**: Log conversational updates into project state.
- **Input Parameters**:
  ```json
  {
    "project": "Gateway Revamp",
    "event_type": "progress",
    "description": "Finished auth flow, starting dashboard"
  }
  ```
- **Internal Execution Flow**:
  1. Call `event_log` to store the update.
  2. Call `state_store` to update status and phase.
  3. Call `blocker_track` if the event indicates a blocker.
- **Output Results**:
  ```json
  {
    "event_id": "evt_102",
    "state": "active"
  }
  ```

### 2. Composite Skill: `project_state_query`

- **Skill Name**: `project_state_query`
- **Description**: Answer status and decision history questions.
- **Input Parameters**:
  ```json
  {
    "project": "Gateway Revamp",
    "question": "What's blocking us?"
  }
  ```
- **Internal Execution Flow**:
  1. Call `status_query` for the latest state.
  2. Call `blocker_track` to list open blockers.
  3. Return the full context summary.
- **Output Results**:
  ```json
  {
    "status": "blocked",
    "blockers": ["Waiting on API approval"]
  }
  ```

### 3. Composite Skill: `daily_state_summary`

- **Skill Name**: `daily_state_summary`
- **Description**: Generate daily standup summaries with commit links.
- **Input Parameters**:
  ```json
  {
    "range": "last_24_hours",
    "project": "Gateway Revamp"
  }
  ```
- **Internal Execution Flow**:
  1. Call `commit_link` to associate commits with events.
  2. Call `daily_summary` to generate the report.
  3. Send summary to the team channel.
- **Output Results**:
  ```json
  {
    "summary": "2 events logged, 1 blocker open",
    "commits": 3
  }
  ```

---

## III. Setup

1. Create a project state database (Postgres or SQLite).
2. Create a channel for updates (Telegram or Discord).
3. Prompt OpenClaw:

```text
When I say "Finished [task]", log a progress event and update state.
When I say "Blocked on [issue]", create a blocker and mark status blocked.
When I ask "What's the status of [project]?", return latest events and blockers.

Every morning at 9 AM, scan git commits from the past 24 hours, link them to projects,
and post a standup summary to #project-state.
```

---

## IV. Key Insights

- Event logs preserve the why behind decisions.
- Daily summaries keep projects visible without manual updates.
- Commit linking improves traceability.

---

## Related Links

- [Event Sourcing Pattern](https://martinfowler.com/eaaDev/EventSourcing.html)
- [Telegram](/channels/telegram)
