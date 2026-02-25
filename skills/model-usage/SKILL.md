---
name: model-usage
description: 使用 CodexBar CLI 的本地成本数据汇总 Codex 或 Claude 的按模型使用情况，包含当前（最近）模型或完整模型拆分。当被问及 codexbar 的模型级使用/成本数据，或需要基于 codexbar cost JSON 的可脚本化汇总时触发。
metadata:
  {
    "openclaw":
      {
        "emoji": "📊",
        "os": ["darwin"],
        "requires": { "bins": ["codexbar"] },
        "install":
          [
            {
              "id": "brew-cask",
              "kind": "brew",
              "cask": "steipete/tap/codexbar",
              "bins": ["codexbar"],
              "label": "Install CodexBar (brew cask)",
            },
          ],
      },
  }
---

# 模型用量

## 概览

从 CodexBar 本地成本日志中获取按模型的用量成本。支持“当前模型”（最近一天的条目）或“全部模型”汇总，适用于 Codex 或 Claude。

TODO：待 CodexBar CLI 的 Linux 安装路径文档完善后补充 Linux 支持说明。

## 快速开始

1. 通过 CodexBar CLI 获取 cost JSON 或传入 JSON 文件。
2. 使用随附脚本按模型汇总。

```bash
python {baseDir}/scripts/model_usage.py --provider codex --mode current
python {baseDir}/scripts/model_usage.py --provider codex --mode all
python {baseDir}/scripts/model_usage.py --provider claude --mode all --format json --pretty
```

## 当前模型逻辑

- 使用最近一日含 `modelBreakdowns` 的记录
- 在该记录中选成本最高的模型
- 若缺少 breakdowns，则回退到 `modelsUsed` 的最后一个条目
- 需要指定模型时使用 `--model <name>`

## 输入

- 默认：运行 `codexbar cost --format json --provider <codex|claude>`
- 文件或 stdin：

```bash
codexbar cost --provider codex --format json > /tmp/cost.json
python {baseDir}/scripts/model_usage.py --input /tmp/cost.json --mode all
cat /tmp/cost.json | python {baseDir}/scripts/model_usage.py --input - --mode current
```

## 输出

- 文本（默认）或 JSON（`--format json --pretty`）
- 仅按模型统计成本；CodexBar 输出不提供按模型拆分的 token

## 参考

- 查看 `references/codexbar-cli.md` 了解 CLI 参数与 cost JSON 字段
