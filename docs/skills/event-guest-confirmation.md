---
title: "Event Guest Confirmation"
description: "Voice-based confirmation workflow using dedicated call agents"
---

You're hosting an event and need to confirm attendance across a guest list. This skill uses dedicated call agents to reach each guest, collect responses, and return a clean summary you can act on.

---

## I. Atomic Skill Library (Underlying Capabilities)

These are the smallest functional units used to build the confirmation workflow.

| Atomic Skill         | Description                       | Input Example        | Output Example        |
| -------------------- | --------------------------------- | -------------------- | --------------------- |
| `guest_list_parse`   | Normalize guest list entries      | Raw list text        | Structured guest list |
| `call_session_start` | Initiate a call session           | Guest, persona       | Session id            |
| `call_prompt`        | Provide persona + goal for a call | Persona, script      | Prompt payload        |
| `call_result_store`  | Store per-guest outcome           | Guest, status, notes | Stored record         |
| `summary_generate`   | Summarize confirmations           | Records              | Summary report        |

---

## II. Composite Skills (Task-Oriented Advanced Tools)

Atomic skills are combined into end-to-end confirmation workflows.

### 1. Composite Skill: `event_guest_confirmation`

- **Skill Name**: `event_guest_confirmation`
- **Description**: Call each guest, confirm attendance, capture notes, and summarize results.
- **Input Parameters**:
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
- **Internal Execution Flow**:
  1. Call `guest_list_parse` to normalize guest entries.
  2. For each guest, call `call_session_start`.
  3. Call `call_prompt` to deliver persona and event script.
  4. Call `call_result_store` to record attendance and notes.
  5. Call `summary_generate` for the final report.
- **Output Results**:
  ```json
  {
    "confirmed": ["Sarah Johnson"],
    "declined": ["Mike Chen"],
    "no_answer": ["Rachel Torres"],
    "notes": [{ "guest": "Sarah Johnson", "note": "Vegetarian, plus-one" }]
  }
  ```

---

## III. Why SuperCall

This workflow uses the [SuperCall](https://clawhub.ai/xonder/supercall) plugin rather than the built-in `voice_call`. SuperCall runs a standalone voice agent that only sees the context you provide, which reduces prompt injection risk and keeps each call focused.

---

## IV. Setup

1. Install SuperCall:
   - `openclaw plugins install @xonder/supercall`
2. Configure SuperCall and hooks:
   - [SuperCall README](https://github.com/xonder/supercall#configuration)
3. Prepare a guest list:

```text
Guest List — Summer BBQ, Saturday June 14th, 4 PM, 23 Oak Street

- Sarah Johnson: +15551234567
- Mike Chen: +15559876543
- Rachel Torres: +15555551234
- David Kim: +15558887777
```

---

## V. Prompt Template

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

## VI. Key Insights

- Start with 2-3 calls to tune persona and script.
- Restrict calling hours to avoid poor response rates.
- Review call transcripts after the first batch.
- Call volume costs money in Twilio; set usage limits.

---

## Related Links

- [SuperCall on ClawHub](https://clawhub.ai/xonder/supercall)
- [SuperCall on GitHub](https://github.com/xonder/supercall)
- [Twilio Console](https://console.twilio.com)
- [OpenAI Realtime API](https://platform.openai.com/docs/guides/realtime)
- [ngrok](https://ngrok.com)
