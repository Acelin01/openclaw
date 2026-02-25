---
name: coding-agent
description: 通过后台进程运行 Codex CLI、Claude Code、OpenCode 或 Pi Coding Agent 进行程序化控制。
metadata:
  {
    "openclaw": { "emoji": "🧩", "requires": { "anyBins": ["claude", "codex", "opencode", "pi"] } },
  }
---

# Coding Agent（bash 优先）

所有 coding agent 相关工作统一使用 **bash**（可选后台模式）。简单高效。

## ⚠️ 必须使用 PTY 模式

Coding agents（Codex、Claude Code、Pi）是**交互式终端应用**，需要伪终端（PTY）才能正常工作。没有 PTY 会导致输出异常、颜色缺失或进程卡住。

运行 coding agent 时**始终使用 `pty:true`**：

```bash
# ✅ Correct - with PTY
bash pty:true command:"codex exec 'Your prompt'"

# ❌ Wrong - no PTY, agent may break
bash command:"codex exec 'Your prompt'"
```

### Bash 工具参数

| 参数         | 类型    | 说明                                            |
| ------------ | ------- | ----------------------------------------------- |
| `command`    | string  | 要执行的 shell 命令                             |
| `pty`        | boolean | **用于 coding agent！** 为交互式 CLI 分配伪终端 |
| `workdir`    | string  | 工作目录（agent 只看到该目录上下文）            |
| `background` | boolean | 后台运行，返回 sessionId 便于监控               |
| `timeout`    | number  | 超时时间（秒），超时会终止进程                  |
| `elevated`   | boolean | 在宿主机而非沙箱中运行（允许时）                |

### Process 工具动作（用于后台会话）

| 动作        | 说明                                 |
| ----------- | ------------------------------------ |
| `list`      | 列出所有运行/最近会话                |
| `poll`      | 检查会话是否仍在运行                 |
| `log`       | 获取会话输出（可指定 offset/limit）  |
| `write`     | 向 stdin 发送原始数据                |
| `submit`    | 发送数据并附带换行（等同输入并回车） |
| `send-keys` | 发送按键 token 或十六进制字节        |
| `paste`     | 粘贴文本（可启用 bracketed 模式）    |
| `kill`      | 终止会话                             |

---

## 快速开始：一次性任务

用于快速提问/对话，可创建临时 git 仓库并执行：

```bash
# 快速对话（Codex 需要 git 仓库！）
SCRATCH=$(mktemp -d) && cd $SCRATCH && git init && codex exec "Your prompt here"

# 或在真实项目中运行——注意 PTY！
bash pty:true workdir:~/Projects/myproject command:"codex exec 'Add error handling to the API calls'"
```

**为什么要 git init？** Codex 不会在非受信任的 git 目录中运行。创建临时仓库即可解决临时使用的需求。

---

## 推荐模式：workdir + background + pty

较长任务建议使用后台模式并开启 PTY：

```bash
# 在目标目录启动 agent（务必 PTY）
bash pty:true workdir:~/project background:true command:"codex exec --full-auto 'Build a snake game'"
# 返回 sessionId 便于跟踪

# 监控进度
process action:log sessionId:XXX

# 检查是否完成
process action:poll sessionId:XXX

# 发送输入（agent 提问时）
process action:write sessionId:XXX data:"y"

# 发送并回车（相当于输入 "yes" 后回车）
process action:submit sessionId:XXX data:"yes"

# 必要时终止
process action:kill sessionId:XXX
```

**为什么 workdir 重要：** Agent 会在指定目录内工作，避免到处读取无关文件（比如你的 soul.md 😅）。

---

## Codex CLI

**模型：** 默认 `gpt-5.2-codex`（在 ~/.codex/config.toml 中设置）

### 参数

| 参数            | 效果                             |
| --------------- | -------------------------------- |
| `exec "prompt"` | 一次性执行，完成后退出           |
| `--full-auto`   | 仍在沙箱内，但自动批准工作区变更 |
| `--yolo`        | 无沙箱、无审批（最快也最危险）   |

### 构建/创建

```bash
# 快速一次性任务（自动批准）——注意 PTY！
bash pty:true workdir:~/project command:"codex exec --full-auto 'Build a dark mode toggle'"

# 适用于较长任务的后台模式
bash pty:true workdir:~/project background:true command:"codex --yolo 'Refactor the auth module'"
```

### 评审 PR

**⚠️ 重要：不要在 OpenClaw 自身项目目录里评审 PR！**
请克隆到临时目录或使用 git worktree。

```bash
# 克隆到临时目录进行安全评审
REVIEW_DIR=$(mktemp -d)
git clone https://github.com/user/repo.git $REVIEW_DIR
cd $REVIEW_DIR && gh pr checkout 130
bash pty:true workdir:$REVIEW_DIR command:"codex review --base origin/main"
# 完成后清理：trash $REVIEW_DIR

# 或使用 git worktree（保持 main 不变）
git worktree add /tmp/pr-130-review pr-130-branch
bash pty:true workdir:/tmp/pr-130-review command:"codex review --base main"
```

### 批量 PR 评审（并行军团）

```bash
# 先抓取所有 PR 引用
git fetch origin '+refs/pull/*/head:refs/remotes/origin/pr/*'

# 部署评审军团——每个 PR 一个 Codex（都要 PTY）
bash pty:true workdir:~/project background:true command:"codex exec 'Review PR #86. git diff origin/main...origin/pr/86'"
bash pty:true workdir:~/project background:true command:"codex exec 'Review PR #87. git diff origin/main...origin/pr/87'"

# 统一监控
process action:list

# 把结果发到 GitHub
gh pr comment <PR#> --body "<review content>"
```

---

## Claude Code

```bash
# 使用 PTY 保证终端输出正常
bash pty:true workdir:~/project command:"claude 'Your task'"

# 后台运行
bash pty:true workdir:~/project background:true command:"claude 'Your task'"
```

---

## OpenCode

```bash
bash pty:true workdir:~/project command:"opencode run 'Your task'"
```

---

## Pi Coding Agent

```bash
# 安装：npm install -g @mariozechner/pi-coding-agent
bash pty:true workdir:~/project command:"pi 'Your task'"

# 非交互模式（仍建议 PTY）
bash pty:true command:"pi -p 'Summarize src/'"

# 不同 provider/model
bash pty:true command:"pi --provider openai --model gpt-4o-mini -p 'Your task'"
```

**注意：** Pi 已启用 Anthropic 提示词缓存（PR #584，2026 年 1 月合并）。

---

## 使用 git worktree 并行修复问题

并行处理多个问题时，使用 git worktree：

```bash
# 1. 为每个问题创建 worktree
git worktree add -b fix/issue-78 /tmp/issue-78 main
git worktree add -b fix/issue-99 /tmp/issue-99 main

# 2. 在各自目录启动 Codex（后台 + PTY）
bash pty:true workdir:/tmp/issue-78 background:true command:"pnpm install && codex --yolo 'Fix issue #78: <description>. Commit and push.'"
bash pty:true workdir:/tmp/issue-99 background:true command:"pnpm install && codex --yolo 'Fix issue #99: <description>. Commit and push.'"

# 3. 监控进度
process action:list
process action:log sessionId:XXX

# 4. 修复后创建 PR
cd /tmp/issue-78 && git push -u origin fix/issue-78
gh pr create --repo user/repo --head fix/issue-78 --title "fix: ..." --body "..."

# 5. 清理
git worktree remove /tmp/issue-78
git worktree remove /tmp/issue-99
```

---

## ⚠️ 规则

1. **始终使用 pty:true** —— coding agent 必须有终端环境
2. **尊重工具选择** —— 用户要 Codex 就用 Codex
   - 编排模式下不要自己手写补丁
   - Agent 失败/卡住时要重启或询问用户，不要静默接管
3. **耐心等待** —— 不要因为“慢”就杀掉会话
4. **用 process:log 观察** —— 监控进度但不干扰
5. **构建用 --full-auto** —— 自动批准更改
6. **评审用 vanilla** —— 不需要特殊参数
7. **可以并行** —— 批量任务可同时启动多个 Codex
8. **切勿在 ~/clawd/ 启动 Codex** —— 它会读你的灵魂文档并产生奇怪的组织结构想法
9. **不要在 ~/Projects/openclaw/ 切换分支** —— 那是运行中的 OpenClaw 实例

---

## 进度更新（重要）

后台启动 coding agent 时，需及时同步进度。

- 启动时发一条简短消息（运行了什么、在哪里跑）
- 仅在状态变化时更新：
  - 里程碑完成（构建结束、测试通过）
  - agent 提问/需要输入
  - 出现错误或需要用户操作
  - 完成（说明改动内容与位置）
- 如果终止会话，立刻说明终止原因

这样能避免用户只看到“Agent failed before reply”而不清楚发生了什么。

---

## 完成自动通知

长时间后台任务建议在提示词末尾追加唤醒命令，agent 完成后可立刻通知 OpenClaw（无需等待下一次心跳）：

```
... your task here.

When completely finished, run this command to notify me:
openclaw gateway wake --text "Done: [brief summary of what was built]" --mode now
```

**示例：**

```bash
bash pty:true workdir:~/project background:true command:"codex --yolo exec 'Build a REST API for todos.

When completely finished, run: openclaw gateway wake --text \"Done: Built todos REST API with CRUD endpoints\" --mode now'"
```

这会触发即时唤醒事件——Skippy 会在几秒内收到通知，而不是等 10 分钟。

---

## 经验总结（2026 年 1 月）

- **PTY 必须开启：** coding agent 是交互式终端应用，没有 `pty:true` 会输出异常或卡住
- **需要 git 仓库：** Codex 不会在非 git 目录运行，可用 `mktemp -d && git init` 临时创建
- **exec 很好用：** `codex exec "prompt"` 执行后自动退出，适合一次性任务
- **submit 与 write 区别：** `submit` 发送内容并回车，`write` 仅发送原始数据
- **Sass 也有效：** Codex 对俏皮提示词反应很好，例如让它写“当太空龙虾的第二乐手”的俳句，会产出有趣结果 🦞
