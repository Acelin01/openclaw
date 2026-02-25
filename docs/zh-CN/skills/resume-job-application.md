---
title: "简历求职工作流"
description: "LinkedIn、Boss直聘等平台的半自动化求职流程"
---

# 简历求职工作流

本指南介绍一种使用 OpenClaw 的人机协作流程。由于招聘平台普遍存在验证码、扫码登录等反自动化机制，完全无人值守的流程往往不可靠。以下内容补充了组合技能与触发语句，确保在你完成登录后，智能体能基于简历解析自动搜索并投递。

---

## 一、原子技能库（基础能力）

| 原子技能            | 描述            | 输入示例           | 输出示例        |
| ------------------- | --------------- | ------------------ | --------------- |
| `resume_parse`      | 解析技能与经验  | Resume file        | Skill profile   |
| `greeting_generate` | 生成招呼话术    | Skill profile      | Greeting text   |
| `browser_start`     | 启动受控浏览器  | Target profile     | Browser session |
| `browser_open`      | 打开招聘平台    | URL                | Page loaded     |
| `job_search`        | 按岗位/城市搜索 | Role, city         | Search results  |
| `job_filter`        | 按关键词筛选    | Filters            | Filtered list   |
| `job_apply`         | 申请或发起沟通  | Job card, greeting | Action result   |

---

## 二、组合技能（面向任务的高级工具）

### 1. 组合技能：`resume_based_job_apply`

- **技能名称**：`resume_based_job_apply`
- **描述**：解析简历后自动搜索并投递，登录由用户完成。
- **输入参数**：
  ```json
  {
    "resume_path": "/path/to/resume.pdf",
    "role": "Senior Frontend Engineer",
    "city": "Shanghai",
    "filters": ["AI", "SaaS", "React"]
  }
  ```
- **内部执行流程**：
  1. 调用 `resume_parse` 提取技能与经验。
  2. 调用 `greeting_generate` 生成招呼语。
  3. 调用 `browser_start` 与 `browser_open` 打开平台。
  4. 等待你确认已完成登录。
  5. 调用 `job_search` 与 `job_filter` 过滤岗位。
  6. 调用 `job_apply` 执行“立即沟通”或“投递简历”。
- **输出结果**：
  ```json
  {
    "applied": 8,
    "skipped": 4,
    "notes": "Applied where React required"
  }
  ```

---

## 三、触发语句（Telegram）

任意发送以下内容即可触发组合流程：

- “按 resume-job-application 流程投递简历：/path/to/resume.pdf，岗位 Senior Frontend Engineer，城市上海，筛选 AI/SaaS/React。”
- “我已登录 Boss 直聘。请开始自动筛选岗位并投递，优先点击投递简历，没有就立即沟通并发问候语。”
- “根据我的简历自动找工作并投递，筛选包含 React 的岗位。”

---

## 四、执行约束

- 登录后必须在浏览器内执行搜索与投递动作。
- 不要停留在计划或生成文档阶段，应继续实际投递。
- 出现验证码时暂停，等待人工处理后继续。
- 没有“投递简历”按钮时，改用“立即沟通”发送话术。

---

## 五、分步指南

### 1. 简历分析

```bash
openclaw file read --path "/Users/me/Documents/resume.pdf"
```

_给智能体的提示词：_

> “读取位于 /path/to/resume.pdf 的简历。提取我的前 5 项技术技能、工作年限，并为招聘人员生成一段礼貌的打招呼消息。”

### 2. 启动浏览器并登录

```bash
openclaw browser start
openclaw browser open "https://www.zhipin.com"
```

**需人工操作**：
手动扫码或输入账号密码完成登录，保持浏览器窗口开启。

### 3. 自动化搜索与投递

_给智能体的提示词：_

> “我已经登录了。现在搜索‘上海’的‘资深前端工程师’职位。筛选描述中包含‘AI’或‘SaaS’的公司。对于每个匹配项，点击职位卡片，检查是否要求‘React’，如果是，点击‘投递简历’或‘立即沟通’并发送我的打招呼消息。不要只生成文档，要继续完成浏览器内投递。”

---

## 六、成功贴士

- **会话持久化**：OpenClaw 的浏览器配置文件会保存 Cookies，通常无需频繁登录。
- **频率限制**：请指示智能体每次操作间隔 3–5 秒。
- **可视化验证**：实时观察浏览器操作，遇到验证码及时介入。
