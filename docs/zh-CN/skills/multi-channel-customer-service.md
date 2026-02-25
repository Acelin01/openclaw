---
title: "多渠道人工智能客户服务"
description: "统一收件箱、自动回复与人工升级"
---

小型企业需要同时处理 WhatsApp、Instagram 私信、邮件与评价。该技能将客户触点集中到一个 AI 服务台，实现自动回复、人工升级与服务报表。

---

## 一、原子技能库（基础能力）

这些是构建客户服务流程的最小功能单元。

| 原子技能            | 描述         | 输入示例                 | 输出示例           |
| ------------------- | ------------ | ------------------------ | ------------------ |
| `channel_connect`   | 连接渠道     | Channel config           | Connection status  |
| `message_ingest`    | 接收消息     | Channel, payload         | Normalized message |
| `intent_classify`   | 识别意图     | Message                  | Intent label       |
| `kb_lookup`         | 查询业务知识 | Query                    | Answer draft       |
| `response_generate` | 生成回复     | Intent, context          | Reply text         |
| `handoff_route`     | 人工升级     | Reason, assignee         | Ticket created     |
| `message_send`      | 发送回复     | Channel, target, message | Delivery result    |
| `metrics_report`    | 生成报表     | Time range               | Report             |

---

## 二、组合技能（面向任务的高级工具）

原子技能组合成端到端的客服工作流。

### 1. 组合技能：`multi_channel_auto_reply`

- **技能名称**：`multi_channel_auto_reply`
- **描述**：跨渠道自动回复常见问题。
- **输入参数**：
  ```json
  {
    "channels": ["whatsapp", "instagram", "email", "reviews"],
    "business_profile": "pricing, hours, policies",
    "languages": ["en", "es"]
  }
  ```
- **内部执行流程**：
  1. 调用 `message_ingest` 接收新消息。
  2. 调用 `intent_classify` 识别意图。
  3. 调用 `kb_lookup` 与 `response_generate` 生成回复。
  4. 调用 `message_send` 发送。
- **输出结果**：
  ```json
  {
    "replied": 28,
    "handoff": 3
  }
  ```

### 2. 组合技能：`human_handoff_flow`

- **技能名称**：`human_handoff_flow`
- **描述**：敏感问题人工升级。
- **输入参数**：
  ```json
  {
    "escalation_rules": ["refund", "legal", "angry"],
    "assignee": "@support-lead"
  }
  ```
- **内部执行流程**：
  1. 调用 `intent_classify` 检测触发条件。
  2. 调用 `handoff_route` 创建工单。
  3. 调用 `message_send` 发送确认。
- **输出结果**：
  ```json
  {
    "tickets_created": 4
  }
  ```

### 3. 组合技能：`customer_service_reporting`

- **技能名称**：`customer_service_reporting`
- **描述**：输出客服 SLA 与响应指标。
- **输入参数**：
  ```json
  {
    "range": "last_7_days",
    "channels": ["whatsapp", "email"]
  }
  ```
- **内部执行流程**：
  1. 调用 `metrics_report` 汇总数据。
  2. 调用 `message_send` 发布报表。
- **输出结果**：
  ```json
  {
    "avg_first_response_minutes": 6,
    "resolved_rate": 0.84
  }
  ```

---

## 三、配置步骤

1. 在 OpenClaw 配置中连接渠道（WhatsApp、Instagram、Email、Reviews）。
2. 建立业务知识库（营业时间、价格、政策、升级规则）。
3. 在 AGENTS.md 中配置路由：

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

## 四、关键要点

- 统一路由减少消息遗漏。
- 清晰的升级规则避免 AI 过度处理。
- 定期报表保证服务质量可视化。

---

## 相关链接

- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [Instagram Messaging API](https://developers.facebook.com/docs/instagram-api/guides/messaging)
- [Google Business Profile API](https://developers.google.com/my-business)
