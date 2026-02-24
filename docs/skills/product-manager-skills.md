---
title: "Product Manager Skills"
description: "MCP-compliant product manager skill definitions"
---

To adapt the core capabilities of a product manager into a toolset that can be invoked by an agent, we need to encapsulate the scattered atomic skills into structured composite skills and register them according to the MCP (Model Context Protocol) specification. This way, the agent can trigger tools through natural language to complete the entire workflow from requirement mining to product launch.

Below is a set of composite skills designed for a product manager agent. Each skill includes clear input parameters, execution steps, and output results, and can be directly registered as an MCP tool.

---

## I. Atomic Skill Library (Underlying Capabilities)

These are the smallest functional units that the agent can flexibly invoke. All composite skills are orchestrated from these atomic skills.

| Atomic Skill          | Description                                            | Input Example                                                  | Output Example                                   |
| --------------------- | ------------------------------------------------------ | -------------------------------------------------------------- | ------------------------------------------------ |
| `user_interview`      | Conduct user interviews to gather qualitative feedback | Interview guide, target user persona                           | Interview transcripts, key insights list         |
| `survey_design`       | Design and distribute questionnaires                   | Survey objective, target audience, question list               | Survey link, collected data                      |
| `competitor_analysis` | Analyze competitor features and market positioning     | Competitor list, analysis dimensions                           | Competitor comparison matrix, opportunity points |
| `user_story_write`    | Write user stories                                     | User role, scenario, need                                      | User story card                                  |
| `flowchart_draw`      | Draw business process or page flow diagrams            | Process description, starting point                            | Flowchart image or structured data               |
| `prototype_create`    | Create low-fidelity or high-fidelity prototypes        | Feature list, page layout requirements                         | Interactive prototype link or file               |
| `usability_test`      | Organize usability tests and collect feedback          | Test tasks, prototype link                                     | Test report, issue list                          |
| `prd_write`           | Write product requirement documents                    | Feature background, detailed requirements, acceptance criteria | PRD document                                     |
| `priority_score`      | Prioritize requirements (KANO/MoSCoW)                  | Requirement list, evaluation dimensions                        | Sorted requirement list                          |
| `data_query`          | Execute SQL queries to retrieve business data          | Data table, query conditions                                   | Dataset                                          |
| `ab_test_design`      | Design A/B experiment plans                            | Experiment goal, variables, sample size                        | Experiment design document                       |
| …                     |                                                        |                                                                |                                                  |

_More atomic skills can be added as needed in practical applications._

---

## II. Composite Skills (Task-Oriented Advanced Tools)

Atomic skills are combined according to business processes to form "one-stop" capabilities that can be directly invoked by the agent. Each composite skill encapsulates multiple steps internally; the agent only needs to provide initial inputs to automatically execute and return the final results.

### 1. Composite Skill: `Requirement Research & Analysis`

- **Skill Name**: `market_requirement_analysis`
- **Description**: Automatically execute the entire process from user research to requirement prioritization, outputting a Market Requirement Document (MRD) or requirement pool.
- **Input Parameters**:
  ```json
  {
    "product_area": "Short video community", // Product domain
    "target_users": ["Gen Z", "Content creators"], // Target user groups
    "research_methods": ["interview", "survey"], // Research methods
    "existing_data": "optional, existing user feedback data"
  }
  ```
- **Internal Execution Flow**:
  1. Call `competitor_analysis` to analyze 3-5 major competitors and generate a competitor matrix.
  2. Call `user_interview` to interview 5-8 target users and extract key pain points.
  3. Call `survey_design` to design and distribute a questionnaire, collect 200+ samples, and perform quantitative validation.
  4. Merge qualitative/quantitative results to generate a user story list.
  5. Call `priority_score` to sort requirements and output the final requirement pool.
- **Output Results**:
  ```json
  {
    "competitive_landscape": {...},
    "user_pain_points": [...],
    "demand_pool": [{"id":1,"desc":"...","priority":"P0"}, ...],
    "market_requirement_doc": "document link"
  }
  ```

### 2. Composite Skill: `Product Interaction & Prototyping Design`

- **Skill Name**: `product_interactive_design`
- **Description**: Based on the requirement pool, complete information architecture, flowcharts, prototypes, and usability testing, outputting high-fidelity prototypes and a PRD.
- **Input Parameters**:
  ```json
  {
    "demand_list": [{ "id": 1, "desc": "..." }], // Requirements to be designed
    "design_fidelity": "high", // Low-fidelity / high-fidelity
    "platform": "iOS",
    "include_usability_test": true
  }
  ```
- **Internal Execution Flow**:
  1. Call `flowchart_draw` to draw business process and page flow diagrams.
  2. Call `prototype_create` to create a high-fidelity interactive prototype (Figma link).
  3. If `include_usability_test` is true, call `usability_test` to test the prototype, collect feedback, and iterate on the prototype.
  4. Call `prd_write` to automatically generate a PRD document containing detailed feature descriptions.
- **Output Results**:
  ```json
  {
    "flowchart_url": "https://...",
    "prototype_url": "https://...",
    "usability_report": "Optional, test report",
    "prd_url": "https://..."
  }
  ```

### 3. Composite Skill: `Data-Driven Iterative Optimization`

- **Skill Name**: `data_driven_optimization`
- **Description**: Analyze issues and propose optimization suggestions based on post-launch product data, and design A/B experiments.
- **Input Parameters**:
  ```json
  {
    "feature_name": "Video recommendation algorithm",
    "metric_to_improve": "Watch time",
    "data_source": "clickhouse.logs",
    "hypothesis": "Increasing social relationship weight can improve watch time"
  }
  ```
- **Internal Execution Flow**:
  1. Call `data_query` to extract relevant business data and generate funnel or retention reports.
  2. Call `ab_test_design` to design an experiment plan, including variables, control groups, and sample size calculation.
  3. Combine data and experiment design to output an optimization suggestion report.
- **Output Results**:
  ```json
  {
    "data_analysis": {"funnel": [...], "retention": [...]},
    "ab_test_plan": {"variants": ["A","B"], "duration": "7 days", "success_metric": "Watch time"},
    "optimization_suggestions": ["Increase social weight", "Optimize title display"]
  }
  ```

### 4. Composite Skill: `Agile Iteration Management`

- **Skill Name**: `agile_sprint_management`
- **Description**: Assist in creating Sprints, breaking down tasks, tracking progress, and generating iteration reports.
- **Input Parameters**:
  ```json
  {
    "sprint_goal": "Optimize registration conversion rate",
    "backlog_items": [{"id":1,"points":3}, ...],
    "team_members": ["Frontend A", "Backend B", "Tester C"],
    "duration_days": 14
  }
  ```
- **Internal Execution Flow**:
  1. Generate subtasks based on Backlog and team members using task breakdown rules.
  2. Create Jira/Trello board cards (requires corresponding API integration).
  3. Daily stand-up reminders (optional, requires calendar integration).
  4. Generate burndown charts and iteration summaries at the end of the sprint.
- **Output Results**:
  ```json
  {
    "board_url": "https://...",
    "task_breakdown": [{ "task": "...", "assignee": "..." }],
    "burndown_chart": "image_url",
    "sprint_report": "Report content"
  }
  ```

---

## III. Example of Registration to MCP

MCP typically describes tool interfaces via JSON. Below is a simplified registration format example (using the Requirement Research & Analysis skill as an example):

```json
{
  "tools": [
    {
      "name": "market_requirement_analysis",
      "description": "Execute the entire process from user research to requirement prioritization, outputting a Market Requirement Document",
      "input_schema": {
        "type": "object",
        "properties": {
          "product_area": {
            "type": "string",
            "description": "Product domain, e.g., short video community"
          },
          "target_users": {
            "type": "array",
            "items": { "type": "string" },
            "description": "Target user groups, e.g., Gen Z"
          },
          "research_methods": {
            "type": "array",
            "items": { "type": "string", "enum": ["interview", "survey"] },
            "description": "Research methods"
          },
          "existing_data": {
            "type": "string",
            "description": "Existing user feedback data or report link"
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
    // Other skills are similar...
  ]
}
```

After the agent receives a user request, it will select the appropriate tool based on the description, fill in the parameters, and initiate the call. The composite skill can internally invoke other atomic skills or external APIs, and finally return structured results for the agent to organize into a natural language response.

---

## IV. Extensibility of Skill Combinations

- **On-Demand Combination**: The agent can flexibly invoke a single atomic skill or a complete composite skill based on task complexity.
- **Context Awareness**: Composite skills can share context (e.g., product domain, target users) to avoid repetitive input.
- **Continuous Learning**: Through user feedback, the agent can optimize the internal call sequence or add new atomic skills.

The above design allows the product manager agent to systematically complete requirement analysis and product design work while maintaining seamless integration with the MCP ecosystem.
