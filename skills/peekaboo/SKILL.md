---
name: peekaboo
description: 使用 Peekaboo CLI 捕获并自动化 macOS UI。
homepage: https://peekaboo.boo
metadata:
  {
    "openclaw":
      {
        "emoji": "👀",
        "os": ["darwin"],
        "requires": { "bins": ["peekaboo"] },
        "install":
          [
            {
              "id": "brew",
              "kind": "brew",
              "formula": "steipete/tap/peekaboo",
              "bins": ["peekaboo"],
              "label": "Install Peekaboo (brew)",
            },
          ],
      },
  }
---

# Peekaboo

Peekaboo 是完整的 macOS UI 自动化 CLI：捕获/检查屏幕、定位 UI 元素、驱动输入，并管理应用/窗口/菜单。命令共享快照缓存，并支持 `--json`/`-j` 便于脚本化。运行 `peekaboo` 或 `peekaboo <cmd> --help` 查看参数；`peekaboo --version` 输出构建信息。提示：可通过 `polter peekaboo` 运行以确保使用最新构建。

## 功能（CLI 能力，不含 agent/MCP）

核心

- `bridge`：检查 Peekaboo Bridge 主机连通性
- `capture`：实时捕获或导入视频并提取帧
- `clean`：清理快照缓存与临时文件
- `config`：初始化/查看/编辑/校验配置，管理 provider、模型、凭据
- `image`：截图（屏幕/窗口/菜单栏区域）
- `learn`：输出完整 agent 指南与工具目录
- `list`：列出应用、窗口、屏幕、菜单栏、权限
- `permissions`：检查屏幕录制/辅助功能权限状态
- `run`：执行 `.peekaboo.json` 脚本
- `sleep`：暂停指定时长
- `tools`：列出可用工具并支持过滤/展示选项

交互

- `click`：按 ID/查询/坐标定位并智能等待
- `drag`：在元素/坐标/Dock 间拖拽
- `hotkey`：组合键，如 `cmd,shift,t`
- `move`：移动光标，可平滑
- `paste`：设置剪贴板 → 粘贴 → 还原
- `press`：特殊按键序列，可重复
- `scroll`：定向滚动（定点 + 平滑）
- `swipe`：手势式滑动
- `type`：输入文本与控制键（`--clear`、延迟）

系统

- `app`：启动/退出/重启/隐藏/显示/切换/列出应用
- `clipboard`：读写剪贴板（文本/图片/文件）
- `dialog`：点击/输入/文件/关闭/列出系统对话框
- `dock`：启动/右键/隐藏/显示/列出 Dock 项
- `menu`：点击/列出应用菜单与菜单附加项
- `menubar`：列出/点击菜单栏状态项
- `open`：增强版 `open`，支持指定应用与 JSON 载荷
- `space`：列出/切换/移动窗口（Spaces）
- `visualizer`：演示 Peekaboo 视觉反馈动画
- `window`：关闭/最小化/最大化/移动/调整尺寸/聚焦/列表

视觉

- `see`：标注 UI 地图、快照 ID，可选分析

全局运行参数

- `--json`/`-j`、`--verbose`/`-v`、`--log-level <level>`
- `--no-remote`、`--bridge-socket <path>`

## 快速开始（常用流程）

```bash
peekaboo permissions
peekaboo list apps --json
peekaboo see --annotate --path /tmp/peekaboo-see.png
peekaboo click --on B1
peekaboo type "Hello" --return
```

## 常见定位参数（多数交互命令）

- 应用/窗口：`--app`、`--pid`、`--window-title`、`--window-id`、`--window-index`
- 快照定位：`--snapshot`（来自 `see` 的 ID，默认最新）
- 元素/坐标：`--on`/`--id`（元素 ID）、`--coords x,y`
- 焦点控制：`--no-auto-focus`、`--space-switch`、`--bring-to-current-space`、
  `--focus-timeout-seconds`、`--focus-retry-count`

## 常见捕获参数

- 输出：`--path`、`--format png|jpg`、`--retina`
- 目标：`--mode screen|window|frontmost`、`--screen-index`、
  `--window-title`、`--window-id`
- 分析：`--analyze "prompt"`、`--annotate`
- 捕获引擎：`--capture-engine auto|classic|cg|modern|sckit`

## 常见移动/输入参数

- 时间：`--duration`（拖拽/滑动）、`--steps`、`--delay`（输入/滚动/按键）
- 拟人移动：`--profile human|linear`、`--wpm`（输入速度）
- 滚动：`--direction up|down|left|right`、`--amount <ticks>`、`--smooth`

## 示例

### 观察 → 点击 → 输入（最稳流程）

```bash
peekaboo see --app Safari --window-title "Login" --annotate --path /tmp/see.png
peekaboo click --on B3 --app Safari
peekaboo type "user@example.com" --app Safari
peekaboo press tab --count 1 --app Safari
peekaboo type "supersecret" --app Safari --return
```

### 按窗口 ID 定位

```bash
peekaboo list windows --app "Visual Studio Code" --json
peekaboo click --window-id 12345 --coords 120,160
peekaboo type "Hello from Peekaboo" --window-id 12345
```

### 截图并分析

```bash
peekaboo image --mode screen --screen-index 0 --retina --path /tmp/screen.png
peekaboo image --app Safari --window-title "Dashboard" --analyze "Summarize KPIs"
peekaboo see --mode screen --screen-index 0 --analyze "Summarize the dashboard"
```

### 实时捕获（感知动作）

```bash
peekaboo capture live --mode region --region 100,100,800,600 --duration 30 \
  --active-fps 8 --idle-fps 2 --highlight-changes --path /tmp/capture
```

### 应用与窗口管理

```bash
peekaboo app launch "Safari" --open https://example.com
peekaboo window focus --app Safari --window-title "Example"
peekaboo window set-bounds --app Safari --x 50 --y 50 --width 1200 --height 800
peekaboo app quit --app Safari
```

### 菜单、菜单栏与 Dock

```bash
peekaboo menu click --app Safari --item "New Window"
peekaboo menu click --app TextEdit --path "Format > Font > Show Fonts"
peekaboo menu click-extra --title "WiFi"
peekaboo dock launch Safari
peekaboo menubar list --json
```

### 鼠标与手势输入

```bash
peekaboo move 500,300 --smooth
peekaboo drag --from B1 --to T2
peekaboo swipe --from-coords 100,500 --to-coords 100,200 --duration 800
peekaboo scroll --direction down --amount 6 --smooth
```

### 键盘输入

```bash
peekaboo hotkey --keys "cmd,shift,t"
peekaboo press escape
peekaboo type "Line 1\nLine 2" --delay 10
```

说明

- 需要屏幕录制与辅助功能权限。
- 点击前建议用 `peekaboo see --annotate` 标注目标。
