---
name: event-guest-confirmation
description: 使用专用语音代理完成来宾确认与汇总。用于活动来宾逐一确认出席与备注时。
---

# 活动来宾确认

你需要确认来宾是否出席、是否有忌口或携带同伴。该技能通过专用语音代理逐一拨打来宾电话，记录结果并输出清晰汇总。

---

## 一、原子技能库（基础能力）

这些是构建来宾确认流程的最小功能单元。

| 原子技能             | 描述           | 输入示例             | 输出示例              |
| -------------------- | -------------- | -------------------- | --------------------- |
| `guest_list_parse`   | 标准化来宾清单 | Raw list text        | Structured guest list |
| `call_session_start` | 建立通话会话   | Guest, persona       | Session id            |
| `call_prompt`        | 提供人设与脚本 | Persona, script      | Prompt payload        |
| `call_result_store`  | 记录通话结果   | Guest, status, notes | Stored record         |
| `summary_generate`   | 汇总确认结果   | Records              | Summary report        |

---

## 二、组合技能（面向任务的高级工具）

原子技能组合成端到端的来宾确认工作流。

### 1. 组合技能：`event_guest_confirmation`

- **技能名称**：`event_guest_confirmation`
- **描述**：逐一确认出席并记录备注，输出汇总结果。
- **输入参数**：
  ```json
  {
    "event": {
      "name": "Summer BBQ",
      "date": "Saturday, June 14th",
      "time": "4 PM",
      "location": "23 Oak Street"
    },
    "guest_list": [{ "name": "Sarah Johnson", "phone": "+15551234567" }],
    "persona": "Jamie, event coordinator for Alex",
    "questions": ["Will you attend?", "Any dietary restrictions?", "Any plus-ones?"]
  }
  ```
- **内部执行流程**：
  1. 调用 `guest_list_parse` 规范来宾列表。
  2. 对每位来宾调用 `call_session_start`。
  3. 调用 `call_prompt` 注入人设与脚本。
  4. 调用 `call_result_store` 记录结果。
  5. 调用 `summary_generate` 输出汇总。
- **输出结果**：
  ```json
  {
    "confirmed": ["Sarah Johnson"],
    "declined": ["Mike Chen"],
    "no_answer": ["Rachel Torres"],
    "notes": [{ "guest": "Sarah Johnson", "note": "Vegetarian, plus-one" }]
  }
  ```

---

## 三、为何使用 SuperCall

该流程使用 [SuperCall](https://clawhub.ai/xonder/supercall) 插件而非内置 `voice_call`。SuperCall 是独立语音代理，只能访问你提供的上下文，降低提示注入风险，并保持每通电话聚焦于确认出席。

---

## 四、配置步骤

1. 安装 SuperCall：
   - `openclaw plugins install @xonder/supercall`
2. 完成配置并启用 hooks：
   - [SuperCall README](https://github.com/xonder/supercall#configuration)
3. 准备来宾清单：

```text
Guest List — Summer BBQ, Saturday June 14th, 4 PM, 23 Oak Street

- Sarah Johnson: +15551234567
- Mike Chen: +15559876543
- Rachel Torres: +15555551234
- David Kim: +15558887777
```

---

## 五、提示模板

```text
Confirm attendance for my event.

Event: Summer BBQ
Date: Saturday, June 14th at 4 PM
Location: 23 Oak Street

Guest list:
<paste guest list here>

Use SuperCall with persona "Jamie, event coordinator for Alex".
Ask attendance, dietary needs, and plus-ones.
Return a summary of confirmed/declined/no-answer + notes.
```

---

## 六、关键要点

- 先用 2-3 通电话校准人设与话术。
- 限制拨打时段以提高接听率。
- 首轮后复核通话记录，及时调整脚本。
- Twilio 会产生成本，需设置上限。

---

## 相关链接

- [SuperCall on ClawHub](https://clawhub.ai/xonder/supercall)
- [SuperCall on GitHub](https://github.com/xonder/supercall)
- [Twilio Console](https://console.twilio.com)
- [OpenAI Realtime API](https://platform.openai.com/docs/guides/realtime)
- [ngrok](https://ngrok.com)
