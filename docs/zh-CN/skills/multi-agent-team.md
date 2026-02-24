---
title: "多智能体团队"
description: "符合 MCP 的多智能体团队配置与协作流程"
---

此用例将 OpenClaw 变成一支协同工作的专业智能体团队。每个智能体有明确角色、私有上下文和共享记忆，由统一控制面协调请求与结果。

---

## 一、原子技能库（底层能力）

这些是多智能体团队使用的最小能力单元。

| 原子技能           | 描述                     | 输入示例               | 输出示例               |
| ------------------ | ------------------------ | ---------------------- | ---------------------- |
| `agents_list`      | 列出可用智能体与角色     | 无                     | 智能体列表（id、名称） |
| `sessions_spawn`   | 启动后台子智能体运行     | 任务描述、agent id     | 运行 id、会话 key      |
| `sessions_send`    | 向其他智能体会话发送消息 | 会话标签或 key、消息   | 发送结果               |
| `sessions_list`    | 列出活跃会话             | 按 agent 或 label 过滤 | 会话列表               |
| `sessions_history` | 获取会话最近消息         | 会话 key、limit        | 消息记录               |
| `memory_search`    | 查询共享记忆             | Query、limit           | 相关记忆片段           |

---

## 二、组合技能（面向团队的工作流）

将原子技能组合为一键式流程，让主控智能体编排完整管线。

### 1. 组合技能：`team_bootstrap`

- **技能名称**：`team_bootstrap`
- **描述**：初始化多智能体团队、创建共享记忆结构并注册角色。
- **输入参数**：
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
- **内部执行流程**：
  1. 调用 `agents_list` 确认可用智能体。
  2. 初始化共享记忆与角色元数据。
  3. 在控制通道发布团队就绪信息。
- **输出结果**：
  ```json
  {
    "team_id": "team_founders_pod",
    "registered_agents": ["agent_milo", "agent_josh", "agent_marketing", "agent_dev"],
    "shared_memory_paths": ["GOALS.md", "DECISIONS.md", "PROJECT_STATUS.md"]
  }
  ```

### 2. 组合技能：`daily_standup_cycle`

- **技能名称**：`daily_standup_cycle`
- **描述**：收集各智能体更新并汇总每日站会报告。
- **输入参数**：
  ```json
  {
    "date": "2026-02-23",
    "focus": "metrics, milestones, blockers"
  }
  ```
- **内部执行流程**：
  1. 对每个智能体调用 `sessions_spawn` 收集更新。
  2. 如需澄清，使用 `sessions_send` 追问。
  3. 汇总站会报告并发布到控制通道。
- **输出结果**：
  ```json
  {
    "standup_report": "Summary with wins, blockers, next steps",
    "agent_updates": [
      { "agent": "agent_milo", "status": "ok" },
      { "agent": "agent_josh", "status": "ok" }
    ]
  }
  ```

### 3. 组合技能：`cross_agent_delivery`

- **技能名称**：`cross_agent_delivery`
- **描述**：将目标拆分给多智能体执行并合并为交付计划。
- **输入参数**：
  ```json
  {
    "objective": "Improve activation rate",
    "tracks": ["research", "design", "implementation", "growth"]
  }
  ```
- **内部执行流程**：
  1. 按 track 使用 `sessions_spawn` 启动任务。
  2. 通过 `sessions_history` 汇总输出。
  3. 形成统一交付计划与风险清单。
- **输出结果**：
  ```json
  {
    "delivery_plan": "Plan with owners and milestones",
    "risk_register": ["risk 1", "risk 2"]
  }
  ```

---

## 三、OpenClaw 中的实现

使用以下配置与流程启用多智能体协作。

### 1. 智能体配置

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

### 2. 智能体互联消息

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

### 3. 团队协作示例

```text
Lead agent: sessions_spawn task="Collect daily updates" agentId="agent_milo"
Lead agent: sessions_spawn task="Summarize growth metrics" agentId="agent_josh"
Lead agent: sessions_spawn task="Draft campaign ideas" agentId="agent_marketing"
Lead agent: sessions_spawn task="Review backlog and blockers" agentId="agent_dev"
Lead agent: sessions_send label="agent_milo" message="Summarize in three bullets"
```

## 相关链接

- [Subagents](/tools/subagents)
- [Agents](/cli/agents)
- [Sessions](/cli/sessions)
