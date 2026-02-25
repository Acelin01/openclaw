---
name: sherpa-onnx-tts
description: 使用 sherpa-onnx 进行本地文本转语音（离线、无云端）。
metadata:
  {
    "openclaw":
      {
        "emoji": "🗣️",
        "os": ["darwin", "linux", "win32"],
        "requires": { "env": ["SHERPA_ONNX_RUNTIME_DIR", "SHERPA_ONNX_MODEL_DIR"] },
        "install":
          [
            {
              "id": "download-runtime-macos",
              "kind": "download",
              "os": ["darwin"],
              "url": "https://github.com/k2-fsa/sherpa-onnx/releases/download/v1.12.23/sherpa-onnx-v1.12.23-osx-universal2-shared.tar.bz2",
              "archive": "tar.bz2",
              "extract": true,
              "stripComponents": 1,
              "targetDir": "~/.openclaw/tools/sherpa-onnx-tts/runtime",
              "label": "Download sherpa-onnx runtime (macOS)",
            },
            {
              "id": "download-runtime-linux-x64",
              "kind": "download",
              "os": ["linux"],
              "url": "https://github.com/k2-fsa/sherpa-onnx/releases/download/v1.12.23/sherpa-onnx-v1.12.23-linux-x64-shared.tar.bz2",
              "archive": "tar.bz2",
              "extract": true,
              "stripComponents": 1,
              "targetDir": "~/.openclaw/tools/sherpa-onnx-tts/runtime",
              "label": "Download sherpa-onnx runtime (Linux x64)",
            },
            {
              "id": "download-runtime-win-x64",
              "kind": "download",
              "os": ["win32"],
              "url": "https://github.com/k2-fsa/sherpa-onnx/releases/download/v1.12.23/sherpa-onnx-v1.12.23-win-x64-shared.tar.bz2",
              "archive": "tar.bz2",
              "extract": true,
              "stripComponents": 1,
              "targetDir": "~/.openclaw/tools/sherpa-onnx-tts/runtime",
              "label": "Download sherpa-onnx runtime (Windows x64)",
            },
            {
              "id": "download-model-lessac",
              "kind": "download",
              "url": "https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-en_US-lessac-high.tar.bz2",
              "archive": "tar.bz2",
              "extract": true,
              "targetDir": "~/.openclaw/tools/sherpa-onnx-tts/models",
              "label": "Download Piper en_US lessac (high)",
            },
          ],
      },
  }
---

# sherpa-onnx-tts

使用 sherpa-onnx 离线 CLI 进行本地 TTS。

## 安装

1. 下载对应系统的 runtime（解压到 `~/.openclaw/tools/sherpa-onnx-tts/runtime`）
2. 下载语音模型（解压到 `~/.openclaw/tools/sherpa-onnx-tts/models`）

更新 `~/.openclaw/openclaw.json`：

```json5
{
  skills: {
    entries: {
      "sherpa-onnx-tts": {
        env: {
          SHERPA_ONNX_RUNTIME_DIR: "~/.openclaw/tools/sherpa-onnx-tts/runtime",
          SHERPA_ONNX_MODEL_DIR: "~/.openclaw/tools/sherpa-onnx-tts/models/vits-piper-en_US-lessac-high",
        },
      },
    },
  },
}
```

包装脚本位于本技能目录，可直接运行或加入 PATH：

```bash
export PATH="{baseDir}/bin:$PATH"
```

## 用法

```bash
{baseDir}/bin/sherpa-onnx-tts -o ./tts.wav "Hello from local TTS."
```

说明：

- 如需其他声音，可从 sherpa-onnx 的 `tts-models` release 选择不同模型。
- 若模型目录里有多个 `.onnx` 文件，请设置 `SHERPA_ONNX_MODEL_FILE` 或传入 `--model-file`。
- 也可通过 `--tokens-file` 或 `--data-dir` 覆盖默认值。
- Windows：运行 `node {baseDir}\\bin\\sherpa-onnx-tts -o tts.wav "Hello from local TTS."`
