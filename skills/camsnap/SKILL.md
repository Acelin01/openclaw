---
name: camsnap
description: 从 RTSP/ONVIF 摄像头抓取帧或片段。
homepage: https://camsnap.ai
metadata:
  {
    "openclaw":
      {
        "emoji": "📸",
        "requires": { "bins": ["camsnap"] },
        "install":
          [
            {
              "id": "brew",
              "kind": "brew",
              "formula": "steipete/tap/camsnap",
              "bins": ["camsnap"],
              "label": "Install camsnap (brew)",
            },
          ],
      },
  }
---

# camsnap

使用 `camsnap` 从已配置的摄像头抓取快照、片段或运动事件。

配置

- 配置文件：`~/.config/camsnap/config.yaml`
- 添加摄像头：`camsnap add --name kitchen --host 192.168.0.10 --user user --pass pass`

常用命令

- 发现设备：`camsnap discover --info`
- 快照：`camsnap snap kitchen --out shot.jpg`
- 片段：`camsnap clip kitchen --dur 5s --out clip.mp4`
- 运动监控：`camsnap watch kitchen --threshold 0.2 --action '...'`
- 诊断：`camsnap doctor --probe`

说明

- 需要 PATH 中有 `ffmpeg`。
- 建议先做短时测试再采集长片段。
