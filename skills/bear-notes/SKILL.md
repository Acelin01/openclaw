---
name: bear-notes
description: 通过 grizzly CLI 创建、搜索与管理 Bear 笔记。
homepage: https://bear.app
metadata:
  {
    "openclaw":
      {
        "emoji": "🐻",
        "os": ["darwin"],
        "requires": { "bins": ["grizzly"] },
        "install":
          [
            {
              "id": "go",
              "kind": "go",
              "module": "github.com/tylerwince/grizzly/cmd/grizzly@latest",
              "bins": ["grizzly"],
              "label": "Install grizzly (go)",
            },
          ],
      },
  }
---

# Bear 笔记

使用 `grizzly` 在 macOS 上创建、读取与管理 Bear 笔记。

前置条件

- 已安装并运行 Bear
- 部分操作（add-text、tags、open-note --selected）需要 Bear 应用令牌（保存在 `~/.config/grizzly/token`）

## 获取 Bear 令牌

需要令牌的操作（add-text、tags、open-note --selected）必须先配置认证令牌：

1. 打开 Bear → Help → API Token → Copy Token
2. 保存令牌：`echo "YOUR_TOKEN" > ~/.config/grizzly/token`

## 常用命令

创建笔记

```bash
echo "Note content here" | grizzly create --title "My Note" --tag work
grizzly create --title "Quick Note" --tag inbox < /dev/null
```

按 ID 打开/读取笔记

```bash
grizzly open-note --id "NOTE_ID" --enable-callback --json
```

向笔记追加文本

```bash
echo "Additional content" | grizzly add-text --id "NOTE_ID" --mode append --token-file ~/.config/grizzly/token
```

列出所有标签

```bash
grizzly tags --enable-callback --json --token-file ~/.config/grizzly/token
```

搜索笔记（通过 open-tag）

```bash
grizzly open-tag --name "work" --enable-callback --json
```

## 选项

常用参数：

- `--dry-run` — Preview the URL without executing
- `--print-url` — Show the x-callback-url
- `--enable-callback` — Wait for Bear's response (needed for reading data)
- `--json` — Output as JSON (when using callbacks)
- `--token-file PATH` — Path to Bear API token file

## 配置

Grizzly 按优先级读取配置：

1. CLI flags
2. Environment variables (`GRIZZLY_TOKEN_FILE`, `GRIZZLY_CALLBACK_URL`, `GRIZZLY_TIMEOUT`)
3. `.grizzly.toml` in current directory
4. `~/.config/grizzly/config.toml`

示例 `~/.config/grizzly/config.toml`：

```toml
token_file = "~/.config/grizzly/token"
callback_url = "http://127.0.0.1:42123/success"
timeout = "5s"
```

## 说明

- Bear 必须处于运行状态，否则命令无法生效
- 笔记 ID 为 Bear 内部标识（可在笔记信息或回调中查看）
- 需要从 Bear 读取数据时使用 `--enable-callback`
- 部分操作需要有效令牌（add-text、tags、open-note --selected）
