---
title: "Resume Job Application"
description: "Semi-automated workflow for job applications on platforms like LinkedIn, Boss Zhipin"
---

# Resume Job Application Workflow

This guide outlines a **Human-in-the-Loop** workflow for applying to jobs using OpenClaw. Due to anti-bot measures (CAPTCHA, QR login) on many job platforms, a fully automated "unattended" process is often unreliable. Instead, we recommend a collaborative approach where the agent handles repetitive tasks (parsing, searching, filtering) and you handle the critical authentication step.

## Prerequisites

1.  **Resume File**: Have your resume ready in a readable format (PDF, Markdown, or Text) accessible to OpenClaw.
2.  **Browser Skill**: Ensure the `browser` skill is enabled in `openclaw.json`.

## Workflow Overview

1.  **Resume Analysis (Agent)**: The agent reads your resume to extract key skills, experience, and generates a personalized introduction.
2.  **Browser Setup (Agent)**: The agent launches a controlled browser instance.
3.  **Authentication (User)**: You manually log in to the job platform (e.g., scan QR code) in the agent's browser window.
4.  **Job Hunting (Agent)**: The agent takes over to search, filter, and initiate conversations or applications based on your criteria.

## Step-by-Step Guide

### 1. Resume Analysis

First, let the agent understand your profile.

```bash
# Example: Read resume and extract keywords
openclaw file read --path "/Users/me/Documents/resume.pdf"
```

_Prompt the agent:_

> "Read my resume at /path/to/resume.pdf. Extract my top 5 technical skills, years of experience, and generate a polite greeting message for recruiters."

### 2. Launch Browser & Login

Start the OpenClaw browser session.

```bash
# Start the browser service
openclaw browser start

# Navigate to the job platform (e.g., Boss Zhipin)
openclaw browser open "https://www.zhipin.com"
```

**Action Required**:
At this point, a browser window will open. **Manually scan the QR code** or enter your credentials to log in. Once logged in, you can close the login popup, but keep the browser window open.

### 3. Automated Search & Application

Once logged in, instruct the agent to search and process jobs.

_Prompt the agent:_

> "I have logged in. Now, search for 'Senior Frontend Engineer' jobs in 'Shanghai'. Filter for companies with 'AI' or 'SaaS' in the description. For each match, click the job card, check if it requires 'React', and if so, click 'Communicate Immediately' and send my greeting."

The agent will use browser automation tools (click, type, scroll, read) to navigate the site.

### Tips for Success

- **Session Persistence**: OpenClaw's browser profile persists cookies. You typically only need to log in once every few days.
- **Rate Limiting**: Job platforms may block aggressive scraping. Instruct the agent to "pause for 3-5 seconds between actions" to mimic human behavior.
- **Visual Verification**: You can watch the agent's actions in real-time in the browser window. If it gets stuck (e.g., a CAPTCHA appears), you can intervene immediately.
