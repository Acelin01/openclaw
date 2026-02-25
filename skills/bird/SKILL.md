---
name: bird
description: 通过 Cookie 进行读取、搜索、发帖与互动的 X/Twitter CLI。
homepage: https://bird.fast
metadata:
  {
    "openclaw":
      {
        "emoji": "🐦",
        "requires": { "bins": ["bird"] },
        "install":
          [
            {
              "id": "brew",
              "kind": "brew",
              "formula": "steipete/tap/bird",
              "bins": ["bird"],
              "label": "Install bird (brew)",
              "os": ["darwin"],
            },
            {
              "id": "npm",
              "kind": "node",
              "package": "@steipete/bird",
              "bins": ["bird"],
              "label": "Install bird (npm)",
            },
          ],
      },
  }
---

# bird 🐦

基于 GraphQL + Cookie 认证的快速 X/Twitter CLI。

## 安装

```bash
# npm/pnpm/bun
npm install -g @steipete/bird

# Homebrew (macOS, prebuilt binary)
brew install steipete/tap/bird

# One-shot (no install)
bunx @steipete/bird whoami
```

## 认证

`bird` 使用基于 Cookie 的认证。

可用 `--auth-token` / `--ct0` 直接传入 Cookie，或用 `--cookie-source` 读取浏览器 Cookie。

运行 `bird check` 查看当前启用的来源。Arc/Brave 建议使用 `--chrome-profile-dir <path>`。

## 命令

### 账号与认证

```bash
bird whoami                    # Show logged-in account
bird check                     # Show credential sources
bird query-ids --fresh         # Refresh GraphQL query ID cache
```

### 读取推文

```bash
bird read <url-or-id>          # Read a single tweet
bird <url-or-id>               # Shorthand for read
bird thread <url-or-id>        # Full conversation thread
bird replies <url-or-id>       # List replies to a tweet
```

### 时间线

```bash
bird home                      # Home timeline (For You)
bird home --following          # Following timeline
bird user-tweets @handle -n 20 # User's profile timeline
bird mentions                  # Tweets mentioning you
bird mentions --user @handle   # Mentions of another user
```

### 搜索

```bash
bird search "query" -n 10
bird search "from:steipete" --all --max-pages 3
```

### 新闻与趋势

```bash
bird news -n 10                # AI-curated from Explore tabs
bird news --ai-only            # Filter to AI-curated only
bird news --sports             # Sports tab
bird news --with-tweets        # Include related tweets
bird trending                  # Alias for news
```

### 列表

```bash
bird lists                     # Your lists
bird lists --member-of         # Lists you're a member of
bird list-timeline <id> -n 20  # Tweets from a list
```

### 书签与点赞

```bash
bird bookmarks -n 10
bird bookmarks --folder-id <id>           # Specific folder
bird bookmarks --include-parent           # Include parent tweet
bird bookmarks --author-chain             # Author's self-reply chain
bird bookmarks --full-chain-only          # Full reply chain
bird unbookmark <url-or-id>
bird likes -n 10
```

### 社交关系

```bash
bird following -n 20           # Users you follow
bird followers -n 20           # Users following you
bird following --user <id>     # Another user's following
bird about @handle             # Account origin/location info
```

### 互动操作

```bash
bird follow @handle            # Follow a user
bird unfollow @handle          # Unfollow a user
```

### 发布

```bash
bird tweet "hello world"
bird reply <url-or-id> "nice thread!"
bird tweet "check this out" --media image.png --alt "description"
```

**⚠️ 发布风险**：发布更容易触发限流；如果受阻，请改用浏览器工具。

## 媒体上传

```bash
bird tweet "hi" --media img.png --alt "description"
bird tweet "pics" --media a.jpg --media b.jpg  # Up to 4 images
bird tweet "video" --media clip.mp4            # Or 1 video
```

## 分页

支持分页的命令：`replies`、`thread`、`search`、`bookmarks`、`likes`、`list-timeline`、`following`、`followers`、`user-tweets`

```bash
bird bookmarks --all                    # Fetch all pages
bird bookmarks --max-pages 3            # Limit pages
bird bookmarks --cursor <cursor>        # Resume from cursor
bird replies <id> --all --delay 1000    # Delay between pages (ms)
```

## 输出选项

```bash
--json          # JSON output
--json-full     # JSON with raw API response
--plain         # No emoji, no color (script-friendly)
--no-emoji      # Disable emoji
--no-color      # Disable ANSI colors (or set NO_COLOR=1)
--quote-depth n # Max quoted tweet depth in JSON (default: 1)
```

## 全局选项

```bash
--auth-token <token>       # Set auth_token cookie
--ct0 <token>              # Set ct0 cookie
--cookie-source <source>   # Cookie source for browser cookies (repeatable)
--chrome-profile <name>    # Chrome profile name
--chrome-profile-dir <path> # Chrome/Chromium profile dir or cookie DB path
--firefox-profile <name>   # Firefox profile
--timeout <ms>             # Request timeout
--cookie-timeout <ms>      # Cookie extraction timeout
```

## 配置文件

`~/.config/bird/config.json5`（全局）或 `./.birdrc.json5`（项目）：

```json5
{
  cookieSource: ["chrome"],
  chromeProfileDir: "/path/to/Arc/Profile",
  timeoutMs: 20000,
  quoteDepth: 1,
}
```

环境变量：`BIRD_TIMEOUT_MS`、`BIRD_COOKIE_TIMEOUT_MS`、`BIRD_QUOTE_DEPTH`

## 故障排查

### Query ID 过期（404）

```bash
bird query-ids --fresh
```

### Cookie 提取失败

- 确认浏览器已登录 X
- 尝试不同的 `--cookie-source`
- Arc/Brave 使用 `--chrome-profile-dir`

---

**TL;DR**：用 CLI 读取/搜索/互动；发布需谨慎，必要时改用浏览器。🐦
