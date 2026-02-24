---
title: "Multi-Agent Content Factory"
description: "Telegram-based multi-agent content pipeline with structured skills"
---

You're a content creator juggling research, writing, and design across multiple platforms. Each step eats hours of your day. This workflow uses subagents that coordinate through a shared plan, then deliver outputs into Telegram so you wake up to finished content.

---

## I. Atomic Skill Library (Underlying Capabilities)

These are the smallest functional units used to build the content factory.

| Atomic Skill         | Description                          | Input Example            | Output Example  |
| -------------------- | ------------------------------------ | ------------------------ | --------------- |
| `sessions_spawn`     | Create subagents for each workstream | Label, task description  | Subagent id     |
| `sessions_send`      | Send tasks and updates to subagents  | Label, message           | Delivery status |
| `trend_scan`         | Scan social trends and competitors   | Topics, sources          | Trend list      |
| `outline_write`      | Draft content outlines or scripts    | Topic, format            | Outline text    |
| `thumbnail_generate` | Generate thumbnails or cover images  | Topic, style             | Image asset     |
| `asset_package`      | Package assets for delivery          | Files, metadata          | Bundle summary  |
| `message_send`       | Send content to Telegram             | Channel, target, message | Delivery result |

---

## II. Composite Skills (Task-Oriented Advanced Tools)

Atomic skills are combined into higher-level workflows that the agent can run end to end.

### 1. Composite Skill: `content_factory_bootstrap`

- **Skill Name**: `content_factory_bootstrap`
- **Description**: Initialize the multi-agent pipeline and assign workstreams.
- **Input Parameters**:
  ```json
  {
    "topics": ["AI", "product growth", "founder stories"],
    "formats": ["thread", "newsletter"],
    "telegram_targets": ["@content_room"]
  }
  ```
- **Internal Execution Flow**:
  1. Call `sessions_spawn` for research, writing, and creative subagents.
  2. Send each subagent a scoped task definition.
  3. Return the subagent registry and initial plan.
- **Output Results**:
  ```json
  {
    "subagents": ["research-agent", "writing-agent", "creative-agent"],
    "plan": "Research -> Writing -> Thumbnails -> Delivery"
  }
  ```

### 2. Composite Skill: `content_factory_run`

- **Skill Name**: `content_factory_run`
- **Description**: Execute the pipeline and deliver outputs to Telegram.
- **Input Parameters**:
  ```json
  {
    "delivery_channel": "telegram",
    "delivery_target": "@content_room",
    "publish_window": "08:00-09:00",
    "timezone": "Asia/Shanghai"
  }
  ```
- **Internal Execution Flow**:
  1. Call `trend_scan` for morning research.
  2. Call `outline_write` for scripts and drafts.
  3. Call `thumbnail_generate` for cover images.
  4. Call `asset_package` to bundle outputs.
  5. Call `message_send` to deliver into Telegram.
- **Output Results**:
  ```json
  {
    "delivered": true,
    "assets": ["thread.md", "newsletter.md", "cover.png"]
  }
  ```

### 3. Composite Skill: `content_factory_report`

- **Skill Name**: `content_factory_report`
- **Description**: Summarize output quality and handoff status.
- **Input Parameters**:
  ```json
  {
    "date": "2026-02-24",
    "include_metrics": true
  }
  ```
- **Internal Execution Flow**:
  1. Aggregate outputs and completion notes.
  2. Summarize to a one-screen report.
- **Output Results**:
  ```json
  {
    "summary": "2 drafts + 2 covers delivered",
    "notes": ["Draft #2 needs stronger CTA"]
  }
  ```

---

## III. Telegram Setup

Follow the Telegram channel setup, then verify delivery:

- [Telegram channel setup](/channels/telegram)
- [Message CLI](/cli/message)

```bash
openclaw message send --channel telegram \
  --target "@content_room" \
  --message "Test: content factory delivery"
```

---

## IV. How to Run (Prompt Template)

```text
Build me a Telegram-based content factory.

1) Research Agent: every morning at 8 AM, find top 5 ideas with sources.
2) Writing Agent: turn the best idea into a full thread + newsletter draft.
3) Creative Agent: generate a cover image and a thumbnail pack.

Deliver everything into Telegram @content_room.
```

---

## V. Customization

```text
I focus on LinkedIn posts, not YouTube. Change outputs to a LinkedIn post
and a short blog outline. Keep it under 6 bullets.
```

---

## VI. Key Insights

- Chained agents avoid manual handoffs and preserve context.
- Telegram delivery keeps content in one readable place.
- Outputs can be retargeted for any platform or format.
