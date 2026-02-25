---
name: clawhub
description: 使用 ClawHub CLI 从 clawhub.com 搜索、安装、更新与发布技能。需要拉取新技能、将已安装技能同步到最新或指定版本，或发布新/更新技能目录时使用。
metadata:
  {
    "openclaw":
      {
        "requires": { "bins": ["clawhub"] },
        "install":
          [
            {
              "id": "node",
              "kind": "node",
              "package": "clawhub",
              "bins": ["clawhub"],
              "label": "Install ClawHub CLI (npm)",
            },
          ],
      },
  }
---

# ClawHub CLI

安装

```bash
npm i -g clawhub
```

登录（发布）

```bash
clawhub login
clawhub whoami
```

搜索

```bash
clawhub search "postgres backups"
```

安装

```bash
clawhub install my-skill
clawhub install my-skill --version 1.2.3
```

更新（基于哈希匹配并升级）

```bash
clawhub update my-skill
clawhub update my-skill --version 1.2.3
clawhub update --all
clawhub update my-skill --force
clawhub update --all --no-input --force
```

列表

```bash
clawhub list
```

发布

```bash
clawhub publish ./my-skill --slug my-skill --name "My Skill" --version 1.2.0 --changelog "Fixes + docs"
```

说明

- 默认 registry：https://clawhub.com（可用 CLAWHUB_REGISTRY 或 --registry 覆盖）
- 默认 workdir：当前目录（回退到 OpenClaw workspace）；安装目录：./skills（可用 --workdir / --dir / CLAWHUB_WORKDIR 覆盖）
- update 会对本地文件做哈希匹配，解析对应版本，并在未指定 --version 时升级到最新
