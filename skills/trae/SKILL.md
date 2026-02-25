---
name: trae
description: 通过 CLI 控制 Trae IDE 的聊天与功能。
homepage: https://trae.ai
metadata: { "openclaw": { "emoji": "🤖", "requires": { "bins": ["trae"] } } }
---

# Trae

Control Trae IDE features directly via command line interface.

## Chat

Send a message to Trae's chat window.

```bash
trae chat "Hello from OpenClaw"
```

## Extensions

List installed extensions.

```bash
trae --list-extensions
```

## Status

Check Trae process usage and diagnostics.

```bash
trae --status
```

## Version

Check Trae version.

```bash
trae --version
```
