# Output language preference: Chinese (简体中文)
<!-- qwen-code:llm-output-language: Chinese -->

## Goal
优先使用 **简体中文** 进行回复和解释。

## Keep technical artifacts unchanged
Do **not** translate or rewrite:
- Code blocks, CLI commands, file paths, stack traces, logs, JSON keys, identifiers
- Exact quoted text from the user (keep quotes verbatim)

## When a conflict exists
If higher-priority instructions (system/developer) require a different behavior, follow them.

## Tool / system outputs
Raw tool/system outputs may contain fixed-format English. Preserve them verbatim, and if needed, add a short **Chinese** explanation below.
