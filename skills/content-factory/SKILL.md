---
name: content-factory
description: 基于 Telegram 的多代理内容流水线与结构化协作。用于选题、写作与视觉内容并行产出时。
---

# 多代理内容工厂

当你同时要做选题、写作与视觉内容时，流程很容易被打断。本工作流用子代理并行协作，输出通过 Telegram 汇总投递，让你每天早上直接拿到成品。

---

## 一、原子技能库（基础能力）

这些是构建内容工厂的最小功能单元。

| 原子技能             | 描述                 | 输入示例                 | 输出示例        |
| -------------------- | -------------------- | ------------------------ | --------------- |
| `sessions_spawn`     | 为各工作流创建子代理 | Label, task description  | Subagent id     |
| `sessions_send`      | 下发任务与更新       | Label, message           | Delivery status |
| `trend_scan`         | 扫描热点与竞品趋势   | Topics, sources          | Trend list      |
| `outline_write`      | 生成脚本或大纲       | Topic, format            | Outline text    |
| `thumbnail_generate` | 生成封面或缩略图     | Topic, style             | Image asset     |
| `asset_package`      | 打包产出素材         | Files, metadata          | Bundle summary  |
| `message_send`       | 投递到 Telegram      | Channel, target, message | Delivery result |

---

## 二、组合技能（面向任务的高级工具）

原子技能组合成可一键调用的高级工作流。

### 1. 组合技能：`content_factory_bootstrap`

- **技能名称**：`content_factory_bootstrap`
- **描述**：初始化多代理内容流水线并分配工作流。
- **输入参数**：
  ```json
  {
    "topics": ["AI", "product growth", "founder stories"],
    "formats": ["thread", "newsletter"],
    "telegram_targets": ["@content_room"]
  }
  ```
- **内部执行流程**：
  1. 调用 `sessions_spawn` 创建研究、写作与视觉子代理。
  2. 给每个子代理发送范围明确的任务。
  3. 返回子代理列表与初始执行计划。
- **输出结果**：
  ```json
  {
    "subagents": ["research-agent", "writing-agent", "creative-agent"],
    "plan": "Research -> Writing -> Thumbnails -> Delivery"
  }
  ```

### 2. 组合技能：`content_factory_run`

- **技能名称**：`content_factory_run`
- **描述**：执行流水线并将结果投递到 Telegram。
- **输入参数**：
  ```json
  {
    "delivery_channel": "telegram",
    "delivery_target": "@content_room",
    "publish_window": "08:00-09:00",
    "timezone": "Asia/Shanghai"
  }
  ```
- **内部执行流程**：
  1. 调用 `trend_scan` 做晨间研究。
  2. 调用 `outline_write` 生成脚本和草稿。
  3. 调用 `thumbnail_generate` 生成封面图。
  4. 调用 `asset_package` 打包产出。
  5. 调用 `message_send` 投递到 Telegram。
- **输出结果**：
  ```json
  {
    "delivered": true,
    "assets": ["thread.md", "newsletter.md", "cover.png"]
  }
  ```

### 3. 组合技能：`content_factory_report`

- **技能名称**：`content_factory_report`
- **描述**：汇总产出与交付状态。
- **输入参数**：
  ```json
  {
    "date": "2026-02-24",
    "include_metrics": true
  }
  ```
- **内部执行流程**：
  1. 聚合产出文件与完成说明。
  2. 输出一屏可读的报告。
- **输出结果**：
  ```json
  {
    "summary": "2 drafts + 2 covers delivered",
    "notes": ["Draft #2 needs stronger CTA"]
  }
  ```

---

## 三、Telegram 配置

请先完成 Telegram 渠道配置并测试投递：

- [Telegram 渠道配置](/channels/telegram)
- [Message CLI](/cli/message)

```bash
openclaw message send --channel telegram \
  --target "@content_room" \
  --message "Test: content factory delivery"
```

---

## 四、如何运行（提示模板）

```text
Build me a Telegram-based content factory.

1) Research Agent: every morning at 8 AM, find top 5 ideas with sources.
2) Writing Agent: turn the best idea into a full thread + newsletter draft.
3) Creative Agent: generate a cover image and a thumbnail pack.

Deliver everything into Telegram @content_room.
```

---

## 五、自定义内容

```text
I focus on LinkedIn posts, not YouTube. Change outputs to a LinkedIn post
and a short blog outline. Keep it under 6 bullets.
```

---

## 六、关键要点

- 链式子代理减少手动交接与反复提示。
- Telegram 投递让内容集中、可回溯。
- 产出可快速切换到任何内容平台或格式。
