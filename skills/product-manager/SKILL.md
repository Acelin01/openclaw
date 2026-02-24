---
name: product-manager
description: 产品经理组合技能：执行市场需求分析、竞品调研与用户画像生成。
metadata:
  {
    "openclaw": { "emoji": "🎯", "requires": { "bins": ["mkdir", "touch", "cat", "echo", "sed"] } },
  }
---

# 产品经理 (Product Manager)

基于 MCP 理念设计的组合技能库，支持从需求挖掘到产品定义的完整工作流。

## 1. 市场需求分析 (Market Analysis)

执行竞品分析与用户调研，输出结构化报告。

### 1.1 竞品分析 (Competitor Analysis)

分析指定领域的竞品优劣势。

```bash
# 用法: analyze-competitors <领域> <竞品列表> <分析内容>
# 示例: analyze-competitors "短视频" "抖音,快手" "抖音算法强..."
mkdir -p .project/market_analysis
FILE=".project/market_analysis/competitors.md"
echo "# 竞品分析: $1" > "$FILE"
echo "\n## 竞品列表: $2" >> "$FILE"
echo "\n## 详细分析\n$3" >> "$FILE"
```

### 1.2 用户画像 (User Personas)

定义目标用户群体与痛点。

```bash
# 用法: define-personas <目标用户> <痛点列表>
# 示例: define-personas "Z世代" "追求个性,时间碎片化"
FILE=".project/market_analysis/personas.md"
echo "# 用户画像" > "$FILE"
echo "\n## 目标群体: $1" >> "$FILE"
echo "\n## 关键痛点\n$2" >> "$FILE"
```

### 1.3 生成需求池 (Generate Demand Pool)

基于分析结果生成需求列表。

```bash
# 用法: create-demand-pool <需求列表JSON>
# 示例: create-demand-pool '[{"id":1,"desc":"...","priority":"P0"}]'
FILE=".project/market_analysis/demand_pool.json"
echo "$1" > "$FILE"
```

## 2. 组合技能：全流程市场分析 (Run Full Market Analysis)

**智能体指令**：请按以下顺序执行组合技能：

1.  **竞品调研**：分析 3-5 个主要竞品，调用 `analyze-competitors` 记录结果。
2.  **用户洞察**：基于竞品分析，推导目标用户画像与痛点，调用 `define-personas`。
3.  **需求转化**：将痛点转化为具体功能需求，按优先级排序，调用 `create-demand-pool`。
4.  **报告生成**：最后汇总所有信息，生成 `.project/market_analysis/report.md`。

```bash
# 这是一个占位符命令，实际执行由 Agent 编排上述原子技能
echo "Market Analysis Workflow Initiated."
echo "Check .project/market_analysis/ for generated artifacts."
```

## 3. 产品原型设计 (Prototype Design)

(待实现) 基于需求池生成原型描述与流程图。

## 4. 数据驱动优化 (Data Optimization)

(待实现) 设计 A/B 测试方案与数据埋点。
