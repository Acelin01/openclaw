---
name: openhue
description: 通过 OpenHue CLI 控制 Philips Hue 灯光与场景。
homepage: https://www.openhue.io/cli
metadata:
  {
    "openclaw":
      {
        "emoji": "💡",
        "ui": { "package": "openclaw-openhue-client", "version": "latest" },
        "requires": { "bins": ["openhue"] },
        "install":
          [
            {
              "id": "brew",
              "kind": "brew",
              "formula": "openhue/cli/openhue-cli",
              "bins": ["openhue"],
              "label": "Install OpenHue CLI (brew)",
            },
          ],
      },
  }
---

# OpenHue CLI

使用 `openhue` 通过 Hue Bridge 控制灯光与场景。

配置

- 发现网桥：`openhue discover`
- 引导式配置：`openhue setup`

查询

- `openhue get light --json`
- `openhue get room --json`
- `openhue get scene --json`

控制

- 开灯：`openhue set light <id-or-name> --on`
- 关灯：`openhue set light <id-or-name> --off`
- 亮度：`openhue set light <id> --on --brightness 50`
- 颜色：`openhue set light <id> --on --rgb #3399FF`
- 场景：`openhue set scene <scene-id>`

注意事项

- 配置时可能需要按下 Hue Bridge 的按钮。
- 灯名存在歧义时使用 `--room "Room Name"` 进行限定。
