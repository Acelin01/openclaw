---
title: "Resume Job Application"
description: "Semi-automated workflow for job applications on platforms like LinkedIn, Boss Zhipin"
---

# Resume Job Application Workflow

This guide outlines a **Human-in-the-Loop** workflow for applying to jobs using OpenClaw. Due to anti-bot measures (CAPTCHA, QR login) on many job platforms, a fully automated unattended process is often unreliable. The workflow below adds explicit composite skills and trigger phrases so the agent can use resume parsing to autonomously search and apply after you complete login.

---

## I. Atomic Skill Library (Underlying Capabilities)

| Atomic Skill        | Description                   | Input Example      | Output Example  |
| ------------------- | ----------------------------- | ------------------ | --------------- |
| `resume_parse`      | Extract skills and experience | Resume file        | Skill profile   |
| `greeting_generate` | Draft recruiter message       | Skill profile      | Greeting text   |
| `browser_start`     | Start controlled browser      | Target profile     | Browser session |
| `browser_open`      | Open job platform             | URL                | Page loaded     |
| `job_search`        | Search by role/location       | Role, city         | Search results  |
| `job_filter`        | Filter by keywords            | Filters            | Filtered list   |
| `job_apply`         | Apply or chat                 | Job card, greeting | Action result   |

---

## II. Composite Skills (Task-Oriented Advanced Tools)

### 1. Composite Skill: `resume_based_job_apply`

- **Skill Name**: `resume_based_job_apply`
- **Description**: Parse resume, search jobs, and apply after login.
- **Input Parameters**:
  ```json
  {
    "resume_path": "/path/to/resume.pdf",
    "role": "Senior Frontend Engineer",
    "city": "Shanghai",
    "filters": ["AI", "SaaS", "React"]
  }
  ```
- **Internal Execution Flow**:
  1. Call `resume_parse` to extract top skills and experience.
  2. Call `greeting_generate` to produce recruiter message.
  3. Call `browser_start` + `browser_open` to open the platform.
  4. Wait for manual login confirmation.
  5. Call `job_search` and `job_filter`.
  6. Call `job_apply` to click “Communicate Immediately” or “Apply”.
- **Output Results**:
  ```json
  {
    "applied": 8,
    "skipped": 4,
    "notes": "Applied where React required"
  }
  ```

---

## III. Trigger Prompts (Telegram)

Send any of the following to trigger the composite flow:

- “按 resume-job-application 流程投递简历：/path/to/resume.pdf，岗位 Senior Frontend Engineer，城市上海，筛选 AI/SaaS/React。”
- “我已登录 Boss 直聘。请开始自动筛选岗位并投递，优先点击投递简历，没有就立即沟通并发问候语。”
- “根据我的简历自动找工作并投递，筛选包含 React 的岗位。”

---

## IV. Execution Guardrails

- The agent must open the job platform and perform in-browser actions after login.
- Do not stop at planning or generating files; continue to search and apply.
- If a CAPTCHA appears, pause and wait for manual resolution, then resume.
- If “Apply” is unavailable, click “Communicate Immediately” and send the greeting.

---

## V. Step-by-Step Guide

### 1. Resume Analysis

```bash
# Example: Read resume and extract keywords
openclaw file read --path "/Users/me/Documents/resume.pdf"
```

_Prompt the agent:_

> "Read my resume at /path/to/resume.pdf. Extract my top 5 technical skills, years of experience, and generate a polite greeting message for recruiters."

### 2. Launch Browser & Login

```bash
openclaw browser start
openclaw browser open "https://www.zhipin.com"
```

**Action Required**:
Manually scan the QR code or enter credentials to log in. Keep the browser window open.

### 3. Automated Search & Application

_Prompt the agent:_

> "I have logged in. Now, search for 'Senior Frontend Engineer' jobs in 'Shanghai'. Filter for companies with 'AI' or 'SaaS' in the description. For each match, click the job card, check if it requires 'React', and if so, click 'Apply' or 'Communicate Immediately' and send my greeting. Do not stop after preparing documents; continue to apply in the browser."

---

## VI. Tips for Success

- **Session Persistence**: OpenClaw's browser profile persists cookies. You typically only need to log in once every few days.
- **Rate Limiting**: Instruct the agent to pause 3–5 seconds between actions.
- **Visual Verification**: Watch the agent’s actions in real time, intervene on CAPTCHA.
