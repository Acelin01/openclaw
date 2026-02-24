---
title: "产品经理技能"
description: "符合 MCP 规范的产品经理技能定义"
---

为了将产品经理的核心能力适配为智能体（Agent）可调用的工具集，我们需要将分散的原子技能封装成结构化的组合技能，并按照 MCP（Model Context Protocol）的规范进行注册。这样，智能体可以通过自然语言触发工具，完成从需求挖掘到产品上线的完整工作流。

以下是一套面向产品经理智能体的组合技能设计，每个技能都包含明确的输入参数、执行步骤和输出结果，可直接注册为 MCP 工具。

---

## 一、原子技能库（底层能力）

智能体可灵活调用的最小功能单元，所有组合技能均由这些原子技能编排而成。

| 原子技能              | 描述                                | 输入示例                     | 输出示例               |
| --------------------- | ----------------------------------- | ---------------------------- | ---------------------- |
| `user_interview`      | 执行用户访谈，收集定性反馈          | 访谈提纲、目标用户画像       | 访谈记录、关键洞察列表 |
| `survey_design`       | 设计并分发问卷                      | 调研目的、目标人群、问题列表 | 问卷链接、回收数据     |
| `competitor_analysis` | 分析竞品功能与市场定位              | 竞品名单、分析维度           | 竞品对比矩阵、机会点   |
| `user_story_write`    | 编写用户故事                        | 用户角色、场景、需求         | 用户故事卡片           |
| `flowchart_draw`      | 绘制业务流程图或页面流转图          | 流程描述、起始点             | 流程图图像或结构化数据 |
| `prototype_create`    | 制作低保真或高保真原型              | 功能列表、页面布局要求       | 可交互原型链接或文件   |
| `usability_test`      | 组织可用性测试并收集反馈            | 测试任务、原型链接           | 测试报告、问题列表     |
| `prd_write`           | 撰写产品需求文档                    | 功能背景、详细需求、验收标准 | PRD 文档               |
| `priority_score`      | 对需求进行优先级排序（KANO/MoSCoW） | 需求列表、评估维度           | 排序后的需求列表       |
| `data_query`          | 执行 SQL 查询获取业务数据           | 数据表、查询条件             | 数据集                 |
| `ab_test_design`      | 设计 A/B 实验方案                   | 实验目标、变量、样本量       | 实验设计文档           |
| ……                    |                                     |                              |                        |

_实际应用中可根据需要扩展更多原子技能。_

---

## 二、组合技能（面向任务的高级工具）

将原子技能按业务流程组合，形成可直接由智能体调用的“一站式”能力。每个组合技能内部封装了多个步骤，智能体只需提供初始输入，即可自动执行并返回最终成果。

### 1. 组合技能：`需求调研与分析`

- **技能名称**：`market_requirement_analysis`
- **描述**：自动执行从用户调研到需求优先级排序的全过程，输出市场需求文档（MRD）或需求池。
- **输入参数**：
  ```json
  {
    "product_area": "短视频社区", // 产品领域
    "target_users": ["Z世代", "内容创作者"], // 目标用户群
    "research_methods": ["interview", "survey"], // 调研方法
    "existing_data": "可选，已有用户反馈数据"
  }
  ```
- **内部执行流程**：
  1. 调用 `competitor_analysis` 分析 3-5 个主要竞品，生成竞品矩阵。
  2. 调用 `user_interview` 访谈 5-8 名目标用户，提炼关键痛点。
  3. 调用 `survey_design` 设计并投放问卷，回收 200+ 样本，进行定量验证。
  4. 合并定性/定量结果，生成用户故事列表。
  5. 调用 `priority_score` 对需求排序，输出最终需求池。
- **输出结果**：
  ```json
  {
    "competitive_landscape": {...},
    "user_pain_points": [...],
    "demand_pool": [{"id":1,"desc":"...","priority":"P0"}, ...],
    "market_requirement_doc": "文档链接"
  }
  ```

### 2. 组合技能：`产品交互与原型设计`

- **技能名称**：`product_interactive_design`
- **描述**：基于需求池完成信息架构、流程图、原型及可用性测试，输出高保真原型和 PRD。
- **输入参数**：
  ```json
  {
    "demand_list": [{ "id": 1, "desc": "..." }], // 待设计的需求
    "design_fidelity": "high", // 低保真/高保真
    "platform": "iOS",
    "include_usability_test": true
  }
  ```
- **内部执行流程**：
  1. 调用 `flowchart_draw` 绘制业务流程图和页面流转图。
  2. 调用 `prototype_create` 制作高保真可交互原型（Figma 链接）。
  3. 若 `include_usability_test` 为 true，则调用 `usability_test` 对原型进行测试，收集反馈并迭代修改原型。
  4. 调用 `prd_write` 自动生成包含功能详情的 PRD 文档。
- **输出结果**：
  ```json
  {
    "flowchart_url": "https://...",
    "prototype_url": "https://...",
    "usability_report": "可选，测试报告",
    "prd_url": "https://..."
  }
  ```

### 3. 组合技能：`数据驱动迭代优化`

- **技能名称**：`data_driven_optimization`
- **描述**：根据产品上线后的数据，分析问题并提出优化建议，设计 A/B 实验。
- **输入参数**：
  ```json
  {
    "feature_name": "视频推荐算法",
    "metric_to_improve": "观看时长",
    "data_source": "clickhouse.logs",
    "hypothesis": "增加社交关系权重可提升时长"
  }
  ```
- **内部执行流程**：
  1. 调用 `data_query` 提取相关业务数据，生成漏斗或留存报表。
  2. 调用 `ab_test_design` 设计实验方案，包括变量、对照组、样本量计算。
  3. 结合数据与实验设计，输出优化建议报告。
- **输出结果**：
  ```json
  {
    "data_analysis": {"funnel": [...], "retention": [...]},
    "ab_test_plan": {"variants": ["A","B"], "duration": "7天", "success_metric": "观看时长"},
    "optimization_suggestions": ["提高社交权重", "优化标题展示"]
  }
  ```

### 4. 组合技能：`敏捷迭代管理`

- **技能名称**：`agile_sprint_management`
- **描述**：协助创建 Sprint、拆解任务、跟踪进度，并生成迭代报告。
- **输入参数**：
  ```json
  {
    "sprint_goal": "优化注册转化率",
    "backlog_items": [{"id":1,"points":3}, ...],
    "team_members": ["前端A","后端B","测试C"],
    "duration_days": 14
  }
  ```
- **内部执行流程**：
  1. 根据 Backlog 和团队成员，调用任务拆分规则生成子任务。
  2. 创建 Jira/Trello 看板卡片（需集成对应 API）。
  3. 每日站会提醒（可选，需与日历集成）。
  4. 迭代结束时生成燃尽图和迭代总结。
- **输出结果**：
  ```json
  {
    "board_url": "https://...",
    "task_breakdown": [{ "task": "...", "assignee": "..." }],
    "burndown_chart": "image_url",
    "sprint_report": "报告内容"
  }
  ```

---

## 三、注册到 MCP 的示例

MCP 通常通过 JSON 描述工具接口，以下是一个简化的注册格式示例（以需求调研与分析技能为例）：

```json
{
  "tools": [
    {
      "name": "market_requirement_analysis",
      "description": "执行从用户调研到需求优先级排序的全过程，输出市场需求文档",
      "input_schema": {
        "type": "object",
        "properties": {
          "product_area": {
            "type": "string",
            "description": "产品领域，如短视频社区"
          },
          "target_users": {
            "type": "array",
            "items": { "type": "string" },
            "description": "目标用户群，如Z世代"
          },
          "research_methods": {
            "type": "array",
            "items": { "type": "string", "enum": ["interview", "survey"] },
            "description": "调研方法"
          },
          "existing_data": {
            "type": "string",
            "description": "已有用户反馈数据或报告链接"
          }
        },
        "required": ["product_area", "target_users"]
      },
      "output_schema": {
        "type": "object",
        "properties": {
          "competitive_landscape": { "type": "object" },
          "user_pain_points": { "type": "array" },
          "demand_pool": { "type": "array" },
          "market_requirement_doc": { "type": "string" }
        }
      }
    }
    // 其他技能类似...
  ]
}
```

智能体收到用户需求后，会根据描述选择合适的工具，填充参数并发起调用。组合技能内部可进一步调用其他原子技能或外部 API，最终返回结构化结果，供智能体组织成自然语言回复。

---

## 四、技能组合的可扩展性

- **按需组合**：智能体可根据任务复杂程度，灵活调用单一原子技能或完整组合技能。
- **上下文感知**：组合技能可共享上下文（如产品领域、目标用户），避免重复输入。
- **持续学习**：通过用户反馈，智能体可优化内部调用顺序或增加新的原子技能。

以上设计使产品经理智能体能够系统化地完成需求分析与产品设计工作，同时保持与 MCP 生态的无缝集成。
