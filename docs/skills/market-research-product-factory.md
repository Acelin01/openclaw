---
title: "Market Research & Product Factory"
description: "Discover user pain points and turn them into MVP ideas"
---

You want to build a product but need evidence of real user demand. This skill uses social research to surface pain points and translates them into actionable MVP ideas and research briefs.

---

## I. Atomic Skill Library (Underlying Capabilities)

These are the smallest functional units used to build the market research workflow.

| Atomic Skill       | Description                      | Input Example            | Output Example  |
| ------------------ | -------------------------------- | ------------------------ | --------------- |
| `trend_mine`       | Mine recent posts across sources | Topic, window            | Raw posts       |
| `signal_extract`   | Extract complaints and requests  | Posts                    | Pain point list |
| `opportunity_rank` | Rank opportunities by impact     | Pain points              | Ranked list     |
| `brief_write`      | Write a research brief           | Findings                 | Research brief  |
| `mvp_outline`      | Draft MVP scope                  | Pain point               | MVP outline     |
| `message_send`     | Deliver results                  | Channel, target, message | Delivery result |

---

## II. Composite Skills (Task-Oriented Advanced Tools)

Atomic skills are combined into end-to-end research workflows.

### 1. Composite Skill: `market_research_discovery`

- **Skill Name**: `market_research_discovery`
- **Description**: Identify and rank market pain points for a topic.
- **Input Parameters**:
  ```json
  {
    "topic": "developer productivity",
    "sources": ["reddit", "x"],
    "window_days": 30
  }
  ```
- **Internal Execution Flow**:
  1. Call `trend_mine` to collect posts.
  2. Call `signal_extract` to surface complaints and requests.
  3. Call `opportunity_rank` to score opportunities.
  4. Call `brief_write` to produce a summary.
- **Output Results**:
  ```json
  {
    "top_pain_points": ["Slow CI feedback", "Poor test flakiness tooling"],
    "opportunities": ["Fast feedback dashboard"],
    "brief": "https://example.com/brief"
  }
  ```

### 2. Composite Skill: `market_research_to_mvp`

- **Skill Name**: `market_research_to_mvp`
- **Description**: Turn a pain point into an MVP outline.
- **Input Parameters**:
  ```json
  {
    "pain_point": "Developers wait 20+ minutes for CI feedback",
    "constraints": "Ship in 2 weeks"
  }
  ```
- **Internal Execution Flow**:
  1. Call `mvp_outline` to define core scope.
  2. Call `brief_write` to capture assumptions and risks.
  3. Call `message_send` with the MVP plan.
- **Output Results**:
  ```json
  {
    "mvp": "CI notifier + build queue view",
    "risks": ["Access to CI APIs"]
  }
  ```

### 3. Composite Skill: `market_research_schedule`

- **Skill Name**: `market_research_schedule`
- **Description**: Schedule recurring market research updates.
- **Input Parameters**:
  ```json
  {
    "topic": "creator tools",
    "cadence": "weekly",
    "delivery_target": "@research-updates"
  }
  ```
- **Internal Execution Flow**:
  1. Call `trend_mine` on schedule.
  2. Call `signal_extract` and `opportunity_rank`.
  3. Call `message_send` with a weekly report.
- **Output Results**:
  ```json
  {
    "scheduled": true,
    "next_run": "Monday 09:00"
  }
  ```

---

## III. Setup

1. Install the Last 30 Days skill:
   - https://github.com/matvanhorde/last-30-days
2. Pick a delivery channel (Telegram or Discord).
3. Prompt OpenClaw:

```text
Use the Last 30 Days skill to research challenges people are having with [topic].

Summarize:
- Top pain points (ranked by frequency)
- Specific complaints and feature requests
- Gaps in existing solutions
- Opportunities for a new product

Send the report to @research-updates.
```

---

## IV. Key Insights

- Weekly cadence keeps market signals fresh.
- Ranked pain points help prioritize what to build.
- MVP outlines speed up validation and delivery.

---

## Related Links

- [Skills](/tools/skills)
- [Telegram](/channels/telegram)
