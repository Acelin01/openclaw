---
title: "Multi-Channel AI Customer Service"
description: "Unified inbox with automated responses and human handoff"
---

Small businesses juggle WhatsApp, Instagram DMs, email, and reviews across many apps. This skill consolidates customer touchpoints into a single AI-powered service desk with automation, escalation, and reporting.

---

## I. Atomic Skill Library (Underlying Capabilities)

These are the smallest functional units used to build the customer service workflow.

| Atomic Skill        | Description                 | Input Example            | Output Example     |
| ------------------- | --------------------------- | ------------------------ | ------------------ |
| `channel_connect`   | Connect messaging channels  | Channel config           | Connection status  |
| `message_ingest`    | Ingest inbound messages     | Channel, payload         | Normalized message |
| `intent_classify`   | Classify intent             | Message                  | Intent label       |
| `kb_lookup`         | Retrieve business knowledge | Query                    | Answer draft       |
| `response_generate` | Draft a reply               | Intent, context          | Reply text         |
| `handoff_route`     | Escalate to human           | Reason, assignee         | Ticket created     |
| `message_send`      | Send outbound response      | Channel, target, message | Delivery result    |
| `metrics_report`    | Summarize service metrics   | Time range               | Report             |

---

## II. Composite Skills (Task-Oriented Advanced Tools)

Atomic skills are combined into end-to-end service workflows.

### 1. Composite Skill: `multi_channel_auto_reply`

- **Skill Name**: `multi_channel_auto_reply`
- **Description**: Auto-respond to common inquiries across channels.
- **Input Parameters**:
  ```json
  {
    "channels": ["whatsapp", "instagram", "email", "reviews"],
    "business_profile": "pricing, hours, policies",
    "languages": ["en", "es"]
  }
  ```
- **Internal Execution Flow**:
  1. Call `message_ingest` for new inbound items.
  2. Call `intent_classify` to map to FAQ, booking, or complaint.
  3. Call `kb_lookup` and `response_generate` for a reply.
  4. Call `message_send` to deliver.
- **Output Results**:
  ```json
  {
    "replied": 28,
    "handoff": 3
  }
  ```

### 2. Composite Skill: `human_handoff_flow`

- **Skill Name**: `human_handoff_flow`
- **Description**: Escalate sensitive issues with clear context.
- **Input Parameters**:
  ```json
  {
    "escalation_rules": ["refund", "legal", "angry"],
    "assignee": "@support-lead"
  }
  ```
- **Internal Execution Flow**:
  1. Call `intent_classify` to detect escalation triggers.
  2. Call `handoff_route` to open a ticket.
  3. Call `message_send` to acknowledge.
- **Output Results**:
  ```json
  {
    "tickets_created": 4
  }
  ```

### 3. Composite Skill: `customer_service_reporting`

- **Skill Name**: `customer_service_reporting`
- **Description**: Summarize SLA and response health.
- **Input Parameters**:
  ```json
  {
    "range": "last_7_days",
    "channels": ["whatsapp", "email"]
  }
  ```
- **Internal Execution Flow**:
  1. Call `metrics_report` to gather response stats.
  2. Call `message_send` to post the report.
- **Output Results**:
  ```json
  {
    "avg_first_response_minutes": 6,
    "resolved_rate": 0.84
  }
  ```

---

## III. Setup

1. Connect channels in OpenClaw config (WhatsApp, Instagram, Email, Reviews).
2. Build a business knowledge base (hours, pricing, policies, escalation rules).
3. Configure routing in AGENTS.md:

```text
When receiving customer messages:
1. Identify channel
2. Classify intent and language
3. If sensitive, escalate to human
4. Otherwise respond from knowledge base

Response style:
- Friendly, professional, concise
- Match the customer's language
- Never invent information

Test mode:
- Prefix responses with [TEST]
- Log but don't send to real channels
```

---

## IV. Key Insights

- Unified routing reduces missed messages.
- Clear escalation rules prevent AI overreach.
- Regular reports keep service quality visible.

---

## Related Links

- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [Instagram Messaging API](https://developers.facebook.com/docs/instagram-api/guides/messaging)
- [Google Business Profile API](https://developers.google.com/my-business)
