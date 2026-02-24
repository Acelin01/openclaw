---
title: "Autonomous Project Management"
description: "Subagent-based project management workflow with decentralized coordination"
---

Managing complex projects with multiple parallel workstreams is exhausting. You end up context switching, tracking status across tools, and manually coordinating handoffs. This workflow uses subagents that operate autonomously and coordinate through shared state, keeping the main session focused on strategy and prioritization.

---

## I. Atomic Skill Library (Underlying Capabilities)

These are the smallest functional units used to build the autonomous project management system.

| Atomic Skill     | Description                            | Input Example           | Output Example  |
| ---------------- | -------------------------------------- | ----------------------- | --------------- |
| `sessions_spawn` | Create subagents with scoped tasks     | Label, task description | Subagent id     |
| `sessions_send`  | Send updates or new tasks to subagents | Label, message          | Delivery status |
| `state_read`     | Read shared project state              | Project id, file path   | Parsed state    |
| `state_write`    | Update shared project state            | State patch             | Updated state   |
| `task_split`     | Break a goal into task units           | Goal, constraints       | Task list       |
| `risk_scan`      | Identify blockers and dependencies     | Task list               | Risk list       |
| `status_rollup`  | Summarize status across workstreams    | State file              | Status report   |
| `doc_sync`       | Sync outputs to docs or reports        | Output files            | Report summary  |

---

## II. Composite Skills (Task-Oriented Advanced Tools)

Atomic skills are combined into higher-level workflows. Each composite skill accepts structured inputs, executes a full workflow, and returns structured outputs.

### 1. Composite Skill: `autonomous_project_bootstrap`

- **Skill Name**: `autonomous_project_bootstrap`
- **Description**: Initialize a project, split tasks, spawn subagents, and create the shared state file.
- **Input Parameters**:
  ```json
  {
    "project_id": "website-redesign",
    "goal": "Redesign marketing website with new pricing page",
    "workstreams": ["frontend", "content", "seo"],
    "owners": ["pm-frontend", "pm-content", "pm-seo"]
  }
  ```
- **Internal Execution Flow**:
  1. Call `task_split` to generate task list by workstream.
  2. Call `sessions_spawn` for each workstream owner.
  3. Call `state_write` to create the initial `STATE.yaml`.
  4. Return the subagent registry and first set of tasks.
- **Output Results**:
  ```json
  {
    "project_state_path": "projects/website-redesign/STATE.yaml",
    "subagents": ["pm-frontend", "pm-content", "pm-seo"],
    "tasks": [{ "id": "homepage-hero", "owner": "pm-frontend" }]
  }
  ```

### 2. Composite Skill: `autonomous_project_execution`

- **Skill Name**: `autonomous_project_execution`
- **Description**: Execute work in parallel, update state, and surface blockers.
- **Input Parameters**:
  ```json
  {
    "project_id": "website-redesign",
    "state_path": "projects/website-redesign/STATE.yaml",
    "check_interval_minutes": 30
  }
  ```
- **Internal Execution Flow**:
  1. Call `state_read` to fetch current tasks and ownership.
  2. Call `sessions_send` to dispatch the next tasks to each subagent.
  3. Call `risk_scan` to detect blocked or dependent tasks.
  4. Call `state_write` to record progress and next actions.
- **Output Results**:
  ```json
  {
    "status": "running",
    "blocked_tasks": ["content-migration"],
    "next_actions": ["pm-content: Resume once api-auth is done"]
  }
  ```

### 3. Composite Skill: `autonomous_project_report`

- **Skill Name**: `autonomous_project_report`
- **Description**: Aggregate progress into a clear summary for the main agent or stakeholders.
- **Input Parameters**:
  ```json
  {
    "project_id": "website-redesign",
    "state_path": "projects/website-redesign/STATE.yaml",
    "include_risks": true
  }
  ```
- **Internal Execution Flow**:
  1. Call `state_read` to load current progress.
  2. Call `status_rollup` to build a short summary.
  3. Call `doc_sync` to write the report to a shared file.
- **Output Results**:
  ```json
  {
    "summary": "Frontend 60% done, content blocked by API schema",
    "report_path": "projects/website-redesign/REPORT.md"
  }
  ```

---

## III. Core Pattern: STATE.yaml

Each project keeps a `STATE.yaml` file as the single source of truth.

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

## IV. Example STATE.yaml (Ready to Copy)

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

## V. Subagent Execution Script (Real Commands)

```bash
export OPENCLAW_GATEWAY_URL="ws://127.0.0.1:18789"
export OPENCLAW_GATEWAY_TOKEN="<your-token>"

openclaw agent --agent <agent-id> --message "Initialize autonomous project management for project_id=demo-project. Goal: refactor auth and update docs. Workstreams: backend, docs. Owners: pm-backend, pm-docs. Use sessions_spawn and create projects/demo-project/STATE.yaml."

openclaw agent --agent <agent-id> --message "Run autonomous_project_execution for project_id=demo-project with state_path=projects/demo-project/STATE.yaml. Update state and return blocked_tasks and next_actions."

openclaw agent --agent <agent-id> --message "Run autonomous_project_report for project_id=demo-project with state_path=projects/demo-project/STATE.yaml and include_risks=true. Return summary and report_path."
```

---

## VI. Subagent Workflow

1. Main agent receives a project goal.
2. `autonomous_project_bootstrap` creates tasks and spawns subagents.
3. Subagents execute tasks and update `STATE.yaml`.
4. `autonomous_project_execution` coordinates progress and unblocks work.
5. `autonomous_project_report` summarizes outcomes for the main session.

---

## VII. AGENTS.md Pattern (Example)

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

## VIII. Example: Spawning a PM

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

## IX. Key Insights

- **State file first**: File-based coordination scales better than message passing.
- **Git as audit log**: Commit `STATE.yaml` changes for traceability.
- **Clear labels**: Use `pm-{project}-{scope}` for easy tracking.
- **Thin main session**: Strategy only, execution stays in subagents.
