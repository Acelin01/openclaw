---
name: video-frames
description: 使用 ffmpeg 从视频提取帧或短片段。
homepage: https://ffmpeg.org
metadata:
  {
    "openclaw":
      {
        "emoji": "🎞️",
        "requires": { "bins": ["ffmpeg"] },
        "install":
          [
            {
              "id": "brew",
              "kind": "brew",
              "formula": "ffmpeg",
              "bins": ["ffmpeg"],
              "label": "Install ffmpeg (brew)",
            },
          ],
      },
  }
---

# Video Frames（ffmpeg）

从视频中提取单帧，或快速生成用于查看的缩略图。

## 快速开始

首帧：

```bash
{baseDir}/scripts/frame.sh /path/to/video.mp4 --out /tmp/frame.jpg
```

指定时间点：

```bash
{baseDir}/scripts/frame.sh /path/to/video.mp4 --time 00:00:10 --out /tmp/frame-10s.jpg
```

## 说明

- 想看“这里发生了什么”时优先用 `--time`。
- 快速分享用 `.jpg`；需要清晰 UI 帧用 `.png`。
