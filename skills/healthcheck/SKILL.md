---
name: healthcheck
description: 面向 OpenClaw 部署的主机安全加固与风险容忍度配置。用户请求安全审计、防火墙/SSH/更新加固、风险姿态与暴露面评估、OpenClaw 定期检查的 cron 计划，或检查运行 OpenClaw 的设备（笔记本/工作站/Pi/VPS）版本状态时使用。
---

# OpenClaw 主机加固

## 概览

评估并加固运行 OpenClaw 的主机，在不影响访问的前提下对齐用户的风险容忍度。将 OpenClaw 安全工具作为重要信号，但 OS 加固必须作为独立且明确的一组步骤执行。

## 核心规则

- 建议使用最强模型运行此技能（如 Opus 4.5、GPT 5.2+）。需要自检当前模型，若低于该等级则建议切换，但不得阻断执行。
- 任何改变状态的操作必须显式批准。
- 未确认用户连接方式前，不要修改远程访问设置。
- 优先可回滚、分阶段变更，并给出回滚方案。
- 不要宣称 OpenClaw 会修改主机防火墙、SSH 或系统更新；它不会。
- 角色/身份不明时，只提供建议。
- 格式要求：所有可选项必须编号，方便用户用单个数字回复。
- 建议开启系统级备份，并尽量核实状态。

## 流程（按顺序执行）

### 0) 模型自检（不阻断）

开始前检查当前模型。若低于最强模型（如 Opus 4.5、GPT 5.2+），建议切换，但不要阻断执行。

### 1) 建立上下文（只读）

在提问前尽量从环境推断 1–5。需要确认时优先使用简单、非技术问题。

依次确认：

1. OS and version (Linux/macOS/Windows), container vs host.
2. Privilege level (root/admin vs user).
3. Access path (local console, SSH, RDP, tailnet).
4. Network exposure (public IP, reverse proxy, tunnel).
5. OpenClaw gateway status and bind address.
6. Backup system and status (e.g., Time Machine, system images, snapshots).
7. Deployment context (local mac app, headless gateway host, remote gateway, container/CI).
8. Disk encryption status (FileVault/LUKS/BitLocker).
9. OS automatic security updates status.
   Note: these are not blocking items, but are highly recommended, especially if OpenClaw can access sensitive data.
10. Usage mode for a personal assistant with full access (local workstation vs headless/remote vs other).

先询问一次是否允许进行只读检查。若获许可，默认执行检查，仅对无法推断或验证的项提问。不要询问已在运行时或命令输出中可见的信息。权限询问用一句话表达；后续所需信息用无序列表（非编号），除非是可选项。

确需提问时，使用非技术表达：

- “Are you using a Mac, Windows PC, or Linux?”
- “Are you logged in directly on the machine, or connecting from another computer?”
- “Is this machine reachable from the public internet, or only on your home/network?”
- “Do you have backups enabled (e.g., Time Machine), and are they current?”
- “Is disk encryption turned on (FileVault/BitLocker/LUKS)?”
- “Are automatic security updates enabled?”
- “How do you use this machine?”
  Examples:
  - Personal machine shared with the assistant
  - Dedicated local machine for the assistant
  - Dedicated remote machine/server accessed remotely (always on)
  - Something else?

仅在系统上下文明确后再询问风险画像。

若用户允许只读检查，默认执行适配 OS 的检查；否则提供可选项（编号）。示例：

1. OS: `uname -a`, `sw_vers`, `cat /etc/os-release`.
2. Listening ports:
   - Linux: `ss -ltnup` (or `ss -ltnp` if `-u` unsupported).
   - macOS: `lsof -nP -iTCP -sTCP:LISTEN`.
3. Firewall status:
   - Linux: `ufw status`, `firewall-cmd --state`, `nft list ruleset` (pick what is installed).
   - macOS: `/usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate` and `pfctl -s info`.
4. Backups (macOS): `tmutil status` (if Time Machine is used).

### 2) 运行 OpenClaw 安全审计（只读）

作为默认只读检查的一部分，运行 `openclaw security audit --deep`。仅在用户要求时提供替代方案：

1. `openclaw security audit` (faster, non-probing)
2. `openclaw security audit --json` (structured output)

提供是否应用 OpenClaw 安全默认值（编号）：

1. `openclaw security audit --fix`

明确说明 `--fix` 只会加强 OpenClaw 默认配置与文件权限，不会修改主机防火墙、SSH 或系统更新策略。

若启用了浏览器控制，建议所有重要账号启用 2FA，优先硬件密钥，短信不足够。

### 3) 检查 OpenClaw 版本/更新状态（只读）

作为默认只读检查的一部分运行 `openclaw update status`。

报告当前通道及是否有更新。

### 4) 确定风险容忍度（在系统上下文之后）

让用户选择或确认风险姿态及必要开放服务/端口（编号选项）。
不要强行套用固定模板；若用户偏好，改为收集具体要求。
可提供建议画像作为可选默认值（编号）。注意多数用户会选择家庭/工作站均衡：

1. Home/Workstation Balanced (most common): firewall on with reasonable defaults, remote access restricted to LAN or tailnet.
2. VPS Hardened: deny-by-default inbound firewall, minimal open ports, key-only SSH, no root login, automatic security updates.
3. Developer Convenience: more local services allowed, explicit exposure warnings, still audited.
4. Custom: user-defined constraints (services, exposure, update cadence, access methods).

### 5) 输出整改计划

计划需包含：

- Target profile
- Current posture summary
- Gaps vs target
- Step-by-step remediation with exact commands
- Access-preservation strategy and rollback
- Risks and potential lockout scenarios
- Least-privilege notes (e.g., avoid admin usage, tighten ownership/permissions where safe)
- Credential hygiene notes (location of OpenClaw creds, prefer disk encryption)

任何变更前必须先展示计划。

### 6) 提供执行选项

提供以下选择（编号，便于单数字回复）：

1. Do it for me (guided, step-by-step approvals)
2. Show plan only
3. Fix only critical issues
4. Export commands for later

### 7) 确认后执行

每一步：

- Show the exact command
- Explain impact and rollback
- Confirm access will remain available
- Stop on unexpected output and ask for guidance

### 8) 验证与报告

复检：

- Firewall status
- Listening ports
- Remote access still works
- OpenClaw security audit (re-run)

输出最终姿态报告并注明延期项。

## 必须确认项（始终）

以下必须显式批准：

- Firewall rule changes
- Opening/closing ports
- SSH/RDP configuration changes
- Installing/removing packages
- Enabling/disabling services
- User/group modifications
- Scheduling tasks or startup persistence
- Update policy changes
- Access to sensitive files or credentials

不确定时先问。

## 定期检查

OpenClaw 安装后或首次加固后，至少做一次基线审计与版本检查：

- `openclaw security audit`
- `openclaw security audit --deep`
- `openclaw update status`

建议持续监控。使用 OpenClaw 的 cron 工具/CLI 安排定期审计（Gateway 调度）。未经明确批准不得创建定时任务。输出保存在用户认可的位置，日志中避免包含敏感信息。
安排无头 cron 任务时，在输出中提示用户调用 `healthcheck` 以便修复问题。

### 调度必需提示（始终）

每次审计或加固后，必须明确提供调度选项并要求用户直接回复。用简短提示（编号）：

1. “Do you want me to schedule periodic audits (e.g., daily/weekly) via `openclaw cron add`?”

用户同意后，询问：

- cadence (daily/weekly), preferred time window, and output location
- whether to also schedule `openclaw update status`

使用稳定的 cron 任务名以保证可复现。建议固定名称：

- `healthcheck:security-audit`
- `healthcheck:update-status`

创建前先 `openclaw cron list` 并按 `name` 精确匹配。若存在则 `openclaw cron edit <id> ...`。
若不存在则 `openclaw cron add --name <name> ...`。

也需提供定期版本检查，以便用户决定何时更新（编号）：

1. `openclaw update status` (preferred for source checkouts and channels)
2. `npm view openclaw version` (published npm version)

## OpenClaw 命令准确性

仅使用支持的命令与参数：

- `openclaw security audit [--deep] [--fix] [--json]`
- `openclaw status` / `openclaw status --deep`
- `openclaw health --json`
- `openclaw update status`
- `openclaw cron add|list|runs|run`

不要杜撰 CLI 参数，也不要暗示 OpenClaw 会强制主机防火墙/SSH 策略。

## 日志与审计记录

记录：

- Gateway identity and role
- Plan ID and timestamp
- Approved steps and exact commands
- Exit codes and files modified (best effort)

脱敏敏感信息，禁止记录 token 或完整凭据内容。

## 写入记忆（有条件）

仅在用户明确同意且会话是私有/本地工作区时写入记忆文件（见 `docs/reference/templates/AGENTS.md`）。否则提供已脱敏、可粘贴的摘要供用户自行保存。

遵循 OpenClaw 压缩所用的持久记忆格式：

- 持久记录写入 `memory/YYYY-MM-DD.md`

每次审计/加固后，若用户同意，将简短带日期的摘要追加到 `memory/YYYY-MM-DD.md`
（检查内容、关键发现、已执行动作、已安排的 cron 任务、关键决策与所有执行命令）。仅追加，不得覆盖。
对主机细节脱敏（用户名、主机名、IP、序列号、服务名、token）。
如有长期偏好或决策（风险画像、允许端口、更新策略），同步更新 `MEMORY.md`（仅在私有会话中可选）。

如果无法写入工作区，请请求权限或提供可直接粘贴的条目。
