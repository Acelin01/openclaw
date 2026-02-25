---
name: market-research-product-factory
description: 发现真实痛点并转化为 MVP 机会。用于社媒调研与产品机会评估时。
---

# 市场调研与产品工厂

你想做产品但缺少真实需求证据。该技能通过社媒调研挖掘痛点，并转化为可落地的 MVP 思路与研究简报。

---

## 一、原子技能库（基础能力）

这些是构建市场调研流程的最小功能单元。

| 原子技能           | 描述           | 输入示例                 | 输出示例        |
| ------------------ | -------------- | ------------------------ | --------------- |
| `trend_mine`       | 挖掘近期讨论   | Topic, window            | Raw posts       |
| `signal_extract`   | 提取投诉与需求 | Posts                    | Pain point list |
| `opportunity_rank` | 机会优先级排序 | Pain points              | Ranked list     |
| `brief_write`      | 生成研究简报   | Findings                 | Research brief  |
| `mvp_outline`      | 输出 MVP 范围  | Pain point               | MVP outline     |
| `message_send`     | 发送结果       | Channel, target, message | Delivery result |

---

## 二、组合技能（面向任务的高级工具）

原子技能组合成端到端的调研与产品流程。

### 1. 组合技能：`market_research_discovery`

- **技能名称**：`market_research_discovery`
- **描述**：识别并排序市场痛点。
- **输入参数**：
  ```json
  {
    "topic": "developer productivity",
    "sources": ["reddit", "x"],
    "window_days": 30
  }
  ```
- **内部执行流程**：
  1. 调用 `trend_mine` 收集讨论。
  2. 调用 `signal_extract` 提取痛点与请求。
  3. 调用 `opportunity_rank` 进行排序。
  4. 调用 `brief_write` 生成简报。
- **输出结果**：
  ```json
  {
    "top_pain_points": ["Slow CI feedback", "Poor test flakiness tooling"],
    "opportunities": ["Fast feedback dashboard"],
    "brief": "https://example.com/brief"
  }
  ```

### 2. 组合技能：`market_research_to_mvp`

- **技能名称**：`market_research_to_mvp`
- **描述**：将痛点转化为 MVP 方案。
- **输入参数**：
  ```json
  {
    "pain_point": "Developers wait 20+ minutes for CI feedback",
    "constraints": "Ship in 2 weeks"
  }
  ```
- **内部执行流程**：
  1. 调用 `mvp_outline` 定义核心范围。
  2. 调用 `brief_write` 记录假设与风险。
  3. 调用 `message_send` 输出 MVP 方案。
- **输出结果**：
  ```json
  {
    "mvp": "CI notifier + build queue view",
    "risks": ["Access to CI APIs"]
  }
  ```

### 3. 组合技能：`market_research_schedule`

- **技能名称**：`market_research_schedule`
- **描述**：定期产出市场调研周报。
- **输入参数**：
  ```json
  {
    "topic": "creator tools",
    "cadence": "weekly",
    "delivery_target": "@research-updates"
  }
  ```
- **内部执行流程**：
  1. 调用 `trend_mine` 按周期采集。
  2. 调用 `signal_extract` 与 `opportunity_rank` 输出结果。
  3. 调用 `message_send` 发送报告。
- **输出结果**：
  ```json
  {
    "scheduled": true,
    "next_run": "Monday 09:00"
  }
  ```

---

## 三、配置步骤

1. 安装 Last 30 Days 技能：
   - https://github.com/matvanhorde/last-30-days
2. 选择投递渠道（Telegram 或 Discord）。
3. 提示 OpenClaw：

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

## 四、关键要点

- 周期化调研可保持市场信号新鲜度。
- 排序后的痛点更便于选题决策。
- MVP 方案加速验证与交付。

---

## 相关链接

- [Skills](/tools/skills)
- [Telegram](/channels/telegram)
