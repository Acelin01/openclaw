---
title: "Multi Agent Team"
description: "MCP-ready multi agent team configuration and collaboration workflows"
---

This use case turns OpenClaw into a coordinated team of specialized agents. Each agent has a role, private context, and shared memory, while a single control plane coordinates requests and results.

---

## I. Atomic Skill Library (Underlying Capabilities)

These are the smallest building blocks used by the multi agent team.

| Atomic Skill       | Description                             | Input Example                 | Output Example                |
| ------------------ | --------------------------------------- | ----------------------------- | ----------------------------- |
| `agents_list`      | List available agents and their roles   | None                          | Agent list with ids and names |
| `sessions_spawn`   | Spawn a background subagent run         | Task description, agent id    | Run id, session key           |
| `sessions_send`    | Send a message to another agent session | Session label or key, message | Delivery result               |
| `sessions_list`    | List active sessions across agents      | Filters by agent or label     | Session list with keys        |
| `sessions_history` | Fetch recent messages from a session    | Session key, limit            | Message transcript            |
| `memory_search`    | Retrieve shared memory items            | Query, limit                  | Relevant memory snippets      |

---

## II. Composite Skills (Task Oriented Team Workflows)

These workflows combine atomic skills into one call so the lead agent can orchestrate the full pipeline.

### 1. Composite Skill: `team_bootstrap`

- **Skill Name**: `team_bootstrap`
- **Description**: Set up a multi agent team, create shared memory structure, and register agent roles.
- **Input Parameters**:
  ```json
  {
    "team_name": "Founders Pod",
    "agents": [
      { "id": "agent_milo", "role": "strategy" },
      { "id": "agent_josh", "role": "growth" },
      { "id": "agent_marketing", "role": "marketing" },
      { "id": "agent_dev", "role": "engineering" }
    ],
    "shared_docs": ["GOALS.md", "DECISIONS.md", "PROJECT_STATUS.md"]
  }
  ```
- **Internal Execution Flow**:
  1. Call `agents_list` to confirm agent availability.
  2. Initialize shared memory and role metadata.
  3. Announce readiness to the control channel.
- **Output Results**:
  ```json
  {
    "team_id": "team_founders_pod",
    "registered_agents": ["agent_milo", "agent_josh", "agent_marketing", "agent_dev"],
    "shared_memory_paths": ["GOALS.md", "DECISIONS.md", "PROJECT_STATUS.md"]
  }
  ```

### 2. Composite Skill: `daily_standup_cycle`

- **Skill Name**: `daily_standup_cycle`
- **Description**: Gather updates from all agents and synthesize a single standup report.
- **Input Parameters**:
  ```json
  {
    "date": "2026-02-23",
    "focus": "metrics, milestones, blockers"
  }
  ```
- **Internal Execution Flow**:
  1. Call `sessions_spawn` for each agent to collect updates.
  2. Call `sessions_send` to request clarifications if needed.
  3. Summarize into a standup report and post to the control channel.
- **Output Results**:
  ```json
  {
    "standup_report": "Summary with wins, blockers, next steps",
    "agent_updates": [
      { "agent": "agent_milo", "status": "ok" },
      { "agent": "agent_josh", "status": "ok" }
    ]
  }
  ```

### 3. Composite Skill: `cross_agent_delivery`

- **Skill Name**: `cross_agent_delivery`
- **Description**: Split a product objective across agents and merge outputs into a delivery plan.
- **Input Parameters**:
  ```json
  {
    "objective": "Improve activation rate",
    "tracks": ["research", "design", "implementation", "growth"]
  }
  ```
- **Internal Execution Flow**:
  1. Spawn agents for each track using `sessions_spawn`.
  2. Collect outputs with `sessions_history`.
  3. Synthesize a unified delivery plan and risks list.
- **Output Results**:
  ```json
  {
    "delivery_plan": "Plan with owners and milestones",
    "risk_register": ["risk 1", "risk 2"]
  }
  ```

---

## III. Implementation in OpenClaw

Use the following configuration and workflow to enable multi agent collaboration.

### 1. Agent Configuration

```json
{
  "agents": {
    "list": [
      { "id": "agent_milo", "name": "Milo", "identity": { "name": "Milo", "emoji": "🧭" } },
      { "id": "agent_josh", "name": "Josh", "identity": { "name": "Josh", "emoji": "📈" } },
      {
        "id": "agent_marketing",
        "name": "Marketing",
        "identity": { "name": "Marketing", "emoji": "🧪" }
      },
      { "id": "agent_dev", "name": "Dev", "identity": { "name": "Dev", "emoji": "🧱" } }
    ],
    "defaults": {
      "subagents": {
        "maxConcurrent": 8
      }
    }
  }
}
```

### 2. Agent to Agent Messaging

```json
{
  "tools": {
    "agentToAgent": {
      "enabled": true,
      "allow": ["agent_*"]
    }
  }
}
```

### 3. Team Workflow Example

```text
Lead agent: sessions_spawn task="Collect daily updates" agentId="agent_milo"
Lead agent: sessions_spawn task="Summarize growth metrics" agentId="agent_josh"
Lead agent: sessions_spawn task="Draft campaign ideas" agentId="agent_marketing"
Lead agent: sessions_spawn task="Review backlog and blockers" agentId="agent_dev"
Lead agent: sessions_send label="agent_milo" message="Summarize in three bullets"
```

## Related Links

- [Subagents](/tools/subagents)
- [Agents](/cli/agents)
- [Sessions](/cli/sessions)
