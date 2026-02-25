---
name: nano-pdf
description: 使用 nano-pdf CLI 通过自然语言指令编辑 PDF。
homepage: https://pypi.org/project/nano-pdf/
metadata:
  {
    "openclaw":
      {
        "emoji": "📄",
        "requires": { "bins": ["nano-pdf"] },
        "install":
          [
            {
              "id": "uv",
              "kind": "uv",
              "package": "nano-pdf",
              "bins": ["nano-pdf"],
              "label": "Install nano-pdf (uv)",
            },
          ],
      },
  }
---

# nano-pdf

使用 `nano-pdf` 通过自然语言指令编辑 PDF 的指定页面。

## 快速开始

```bash
nano-pdf edit deck.pdf 1 "Change the title to 'Q3 Results' and fix the typo in the subtitle"
```

说明：

- 页码是从 0 还是 1 开始取决于版本/配置；若结果偏差一页，请切换另一种再试。
- 发送前务必检查输出 PDF 是否正确。
