---
name: himalaya
description: "通过 IMAP/SMTP 管理邮件的 CLI。使用 `himalaya` 在终端中列出、阅读、撰写、回复、转发、搜索与整理邮件，支持多账号与 MML（MIME Meta Language）撰写。"
homepage: https://github.com/pimalaya/himalaya
metadata:
  {
    "openclaw":
      {
        "emoji": "📧",
        "requires": { "bins": ["himalaya"] },
        "install":
          [
            {
              "id": "brew",
              "kind": "brew",
              "formula": "himalaya",
              "bins": ["himalaya"],
              "label": "Install Himalaya (brew)",
            },
          ],
      },
  }
---

# Himalaya 邮件 CLI

Himalaya 是一款 CLI 邮件客户端，可通过 IMAP、SMTP、Notmuch 或 Sendmail 后端在终端管理邮件。

## 参考资料

- `references/configuration.md`（配置文件与 IMAP/SMTP 认证）
- `references/message-composition.md`（编写邮件的 MML 语法）

## 前置条件

1. 已安装 Himalaya CLI（`himalaya --version` 可验证）
2. 配置文件位于 `~/.config/himalaya/config.toml`
3. 已配置 IMAP/SMTP 凭据（密码需安全保存）

## 配置

运行交互式向导配置账号：

```bash
himalaya account configure
```

或手动创建 `~/.config/himalaya/config.toml`：

```toml
[accounts.personal]
email = "you@example.com"
display-name = "Your Name"
default = true

backend.type = "imap"
backend.host = "imap.example.com"
backend.port = 993
backend.encryption.type = "tls"
backend.login = "you@example.com"
backend.auth.type = "password"
backend.auth.cmd = "pass show email/imap"  # or use keyring

message.send.backend.type = "smtp"
message.send.backend.host = "smtp.example.com"
message.send.backend.port = 587
message.send.backend.encryption.type = "start-tls"
message.send.backend.login = "you@example.com"
message.send.backend.auth.type = "password"
message.send.backend.auth.cmd = "pass show email/smtp"
```

## 常见操作

### 列出文件夹

```bash
himalaya folder list
```

### 列出邮件

列出 INBOX（默认）邮件：

```bash
himalaya envelope list
```

列出指定文件夹邮件：

```bash
himalaya envelope list --folder "Sent"
```

分页列出：

```bash
himalaya envelope list --page 1 --page-size 20
```

### 搜索邮件

```bash
himalaya envelope list from john@example.com subject meeting
```

### 阅读邮件

按 ID 阅读（显示纯文本）：

```bash
himalaya message read 42
```

导出原始 MIME：

```bash
himalaya message export 42 --full
```

### 回复邮件

交互式回复（打开 $EDITOR）：

```bash
himalaya message reply 42
```

回复全部：

```bash
himalaya message reply 42 --all
```

### 转发邮件

```bash
himalaya message forward 42
```

### 新建邮件

交互式撰写（打开 $EDITOR）：

```bash
himalaya message write
```

使用模板直接发送：

```bash
cat << 'EOF' | himalaya template send
From: you@example.com
To: recipient@example.com
Subject: Test Message

Hello from Himalaya!
EOF
```

或使用 headers 参数：

```bash
himalaya message write -H "To:recipient@example.com" -H "Subject:Test" "Message body here"
```

### 移动/复制邮件

移动到文件夹：

```bash
himalaya message move 42 "Archive"
```

复制到文件夹：

```bash
himalaya message copy 42 "Important"
```

### 删除邮件

```bash
himalaya message delete 42
```

### 管理标记

添加标记：

```bash
himalaya flag add 42 --flag seen
```

移除标记：

```bash
himalaya flag remove 42 --flag seen
```

## 多账号

列出账号：

```bash
himalaya account list
```

使用指定账号：

```bash
himalaya --account work envelope list
```

## 附件

保存消息附件：

```bash
himalaya attachment download 42
```

保存到指定目录：

```bash
himalaya attachment download 42 --dir ~/Downloads
```

## 输出格式

多数命令支持 `--output` 输出结构化内容：

```bash
himalaya envelope list --output json
himalaya envelope list --output plain
```

## 调试

启用调试日志：

```bash
RUST_LOG=debug himalaya envelope list
```

带回溯的完整 trace：

```bash
RUST_LOG=trace RUST_BACKTRACE=1 himalaya envelope list
```

## 提示

- 用 `himalaya --help` 或 `himalaya <command> --help` 查看详细用法。
- 消息 ID 相对当前文件夹；切换文件夹后需重新列出。
- 撰写含附件的富文本邮件可使用 MML 语法（见 `references/message-composition.md`）。
- 使用 `pass`、系统钥匙串或输出密码的命令安全保存密码。
