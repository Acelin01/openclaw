---
name: skill-creator
description: 创建或更新 AgentSkills，用于设计、组织或打包技能脚本、参考与资源。
---

# Skill Creator

本技能用于指导创建高质量的技能。

## 关于技能

技能是模块化、自包含的包，用于通过专业知识、工作流和工具扩展 Codex 能力。可以把它理解为特定领域/任务的“上手指南”，将 Codex 从通用智能体变为具备流程化知识的专用智能体。

### 技能提供的内容

1. 专业工作流 - 面向特定领域的多步骤流程
2. 工具集成 - 使用特定文件格式或 API 的说明
3. 领域知识 - 公司专有知识、架构、业务规则
4. 资源打包 - 复杂或重复任务的脚本、参考与素材

## 核心原则

### 简洁是关键

上下文窗口是公共资源。技能会与系统提示、对话历史、其他技能元数据和用户请求共享上下文。

**默认假设：Codex 已经很聪明。** 只添加 Codex 不具备的上下文。对每一段内容进行质疑：“Codex 真的需要这段解释吗？”、“这段文字的 token 成本是否合理？”

优先简洁示例，避免冗长解释。

### 设定合适的自由度

按任务脆弱性与可变性调整具体程度：

**高自由度（文本指导）**：可行路径多、依赖上下文决策、需要启发式判断时使用。

**中等自由度（伪代码或带参数脚本）**：存在推荐模式、允许一定变化、配置影响行为时使用。

**低自由度（特定脚本、少量参数）**：操作脆弱且易出错、需要强一致性、必须遵循特定顺序时使用。

把 Codex 想象成走路：悬崖上的窄桥需要护栏（低自由度），开阔草原可自由探索（高自由度）。

### 技能结构

每个技能包含必需的 SKILL.md 和可选资源：

```
skill-name/
├── SKILL.md (required)
│   ├── YAML frontmatter metadata (required)
│   │   ├── name: (required)
│   │   └── description: (required)
│   └── Markdown instructions (required)
└── Bundled Resources (optional)
    ├── scripts/          - Executable code (Python/Bash/etc.)
    ├── references/       - Documentation intended to be loaded into context as needed
    └── assets/           - Files used in output (templates, icons, fonts, etc.)
```

#### SKILL.md（必需）

每个 SKILL.md 包含：

- **Frontmatter**（YAML）：包含 `name` 与 `description`。这是 Codex 判定是否触发技能的唯一信息，因此必须清晰完整地说明技能用途与触发场景。
- **正文**（Markdown）：技能使用指引，仅在技能触发后加载（若需要）。

#### 资源包（可选）

##### 脚本（`scripts/`）

用于需要确定性或重复编写的可执行代码（Python/Bash 等）。

- **适用场景**：同一段代码频繁重写，或需要确定性可靠性
- **示例**：用于旋转 PDF 的 `scripts/rotate_pdf.py`
- **收益**：节省 token、可确定性执行，可能无需加载到上下文
- **说明**：必要时 Codex 仍需读取脚本以便修补或适配环境

##### 参考资料（`references/`）

用于按需加载到上下文的文档与参考材料，帮助 Codex 决策与流程执行。

- **适用场景**：需要在工作中引用的文档
- **示例**：财务架构 `references/finance.md`、公司 NDA 模板 `references/mnda.md`、公司政策 `references/policies.md`、API 规格 `references/api_docs.md`
- **用例**：数据库结构、API 文档、领域知识、公司政策、详细流程指南
- **收益**：保持 SKILL.md 精简，仅在需要时加载
- **最佳实践**：若文件较大（>10k 字），在 SKILL.md 内提供 grep 搜索模式
- **避免重复**：信息要么在 SKILL.md，要么在 references，不要两边重复。只有真正核心内容才保留在 SKILL.md，其他细节、示例与架构放入 references。

##### 资源素材（`assets/`）

不用于上下文加载，而是在输出中直接使用的文件。

- **适用场景**：技能需要输出中使用的文件
- **示例**：品牌素材 `assets/logo.png`、PPT 模板 `assets/slides.pptx`、前端模板 `assets/frontend-template/`、字体 `assets/font.ttf`
- **用例**：模板、图片、图标、样板代码、字体、示例文档
- **收益**：输出素材与文档分离，可直接使用而无需加载上下文

#### 不应包含的内容

技能只应包含直接支持功能的必要文件。不要创建多余文档或辅助文件，包括：

- README.md
- INSTALLATION_GUIDE.md
- QUICK_REFERENCE.md
- CHANGELOG.md
- 等

技能只应包含 AI 执行任务所需信息，不应包含创建过程背景、搭建/测试流程、面向用户的文档等。额外文档只会造成混乱。

### 渐进式披露原则

技能使用三层加载机制以高效管理上下文：

1. **元数据（name + description）** - 始终在上下文中（约 100 字）
2. **SKILL.md 正文** - 技能触发时加载（<5k 字）
3. **资源包** - Codex 按需加载（脚本可执行，无需进上下文）

#### 渐进式披露模式

SKILL.md 只保留必要内容，尽量控制在 500 行以内。接近上限时拆分为独立文件，并在 SKILL.md 中清晰引用，说明何时读取。

**关键原则：** 当技能支持多种变体、框架或选项时，只在 SKILL.md 保留核心流程和选择指引，将变体细节（模式、示例、配置）放入参考文件。

**模式 1：带参考的高层指引**

```markdown
# PDF 处理

## 快速开始

使用 pdfplumber 提取文本：
[代码示例]

## 高级功能

- **表单填充**：完整指南见 [FORMS.md](FORMS.md)
- **API 参考**：所有方法见 [REFERENCE.md](REFERENCE.md)
- **示例**：常见模式见 [EXAMPLES.md](EXAMPLES.md)
```

Codex 仅在需要时加载 FORMS.md、REFERENCE.md 或 EXAMPLES.md。

**模式 2：按领域组织**

当技能覆盖多个领域时，按领域组织内容，避免加载无关上下文：

```
bigquery-skill/
├── SKILL.md（概览与导航）
└── reference/
    ├── finance.md（营收、账单指标）
    ├── sales.md（机会、管道）
    ├── product.md（API 用法、功能）
    └── marketing.md（活动、归因）
```

当用户询问销售指标时，Codex 只读取 sales.md。

同理，若技能支持多个框架或变体，可按变体组织：

```
cloud-deploy/
├── SKILL.md (workflow + provider selection)
└── references/
    ├── aws.md (AWS deployment patterns)
    ├── gcp.md (GCP deployment patterns)
    └── azure.md (Azure deployment patterns)
```

当用户选择 AWS 时，Codex 只读取 aws.md。

**模式 3：条件化细节**

提供基础内容，并链接到进阶内容：

```markdown
# DOCX Processing

## Creating documents

Use docx-js for new documents. See [DOCX-JS.md](DOCX-JS.md).

## Editing documents

For simple edits, modify the XML directly.

**For tracked changes**: See [REDLINING.md](REDLINING.md)
**For OOXML details**: See [OOXML.md](OOXML.md)
```

Codex 仅在用户需要时读取 REDLINING.md 或 OOXML.md。

**重要准则：**

- **避免深层嵌套引用** - 参考文件与 SKILL.md 保持一层关系，所有参考文件应直接从 SKILL.md 链接。
- **结构化长参考文件** - 超过 100 行的文件在顶部提供目录，便于 Codex 预览整体范围。

## 技能创建流程

创建技能包含以下步骤：

1. Understand the skill with concrete examples
2. Plan reusable skill contents (scripts, references, assets)
3. Initialize the skill (run init_skill.py)
4. Edit the skill (implement resources and write SKILL.md)
5. Package the skill (run package_skill.py)
6. Iterate based on real usage

按顺序执行这些步骤，除非明确不适用才可跳过。

### 技能命名

- 仅使用小写字母、数字和连字符；将用户标题规范为短横线格式（如 "Plan Mode" -> `plan-mode`）。
- 名称长度不超过 64 个字符（字母、数字、连字符）。
- 优先简短、动词开头、描述动作的短语。
- 在提升清晰度或触发性时按工具命名空间（如 `gh-address-comments`、`linear-address-issue`）。
- 技能文件夹名称必须与技能名一致。

### 步骤 1：用具体例子理解技能

仅当技能使用模式已非常明确时才跳过。本步骤对现有技能同样有价值。

为创建有效技能，需清晰理解技能的具体使用方式。可来自用户提供的示例或经用户反馈验证的生成示例。

例如，构建图像编辑技能时，可问：

- "What functionality should the image-editor skill support? Editing, rotating, anything else?"
- "Can you give some examples of how this skill would be used?"
- "I can imagine users asking for things like 'Remove the red-eye from this image' or 'Rotate this image'. Are there other ways you imagine this skill being used?"
- "What would a user say that should trigger this skill?"

为避免用户负担，一次不要提太多问题。先问最重要的问题，必要时再追问。

当对技能应支持的功能已有清晰认识时结束此步骤。

### 步骤 2：规划可复用内容

将具体示例转化为有效技能时，需要逐条分析：

1. 从零实现该示例的执行路径
2. 识别重复执行时有价值的脚本、参考资料与素材

示例：构建 `pdf-editor` 处理“帮我旋转 PDF”，分析结果：

1. 旋转 PDF 每次都要重写相同代码
2. 适合在技能里保存 `scripts/rotate_pdf.py`

示例：构建 `frontend-webapp-builder` 用于“做一个 todo 应用/步数仪表盘”，分析结果：

1. 前端应用需要重复的 HTML/React 样板
2. 适合在技能里保存 `assets/hello-world/` 模板

示例：构建 `big-query` 处理“今天有多少用户登录”，分析结果：

1. 查询 BigQuery 每次都要重新摸清表结构与关系
2. 适合保存 `references/schema.md` 作为表结构文档

为确定技能内容，对每个示例进行分析并产出要纳入的可复用资源清单：脚本、参考与素材。

### 步骤 3：初始化技能

此时开始实际创建技能。

仅当技能已存在且只需迭代或打包时跳过，然后进入下一步。

从零创建新技能时，务必运行 `init_skill.py`。该脚本会生成包含完整模板的新技能目录，使创建过程更高效、更可靠。

用法：

```bash
scripts/init_skill.py <skill-name> --path <output-directory> [--resources scripts,references,assets] [--examples]
```

示例：

```bash
scripts/init_skill.py my-skill --path skills/public
scripts/init_skill.py my-skill --path skills/public --resources scripts,references
scripts/init_skill.py my-skill --path skills/public --resources scripts --examples
```

该脚本会：

- Creates the skill directory at the specified path
- Generates a SKILL.md template with proper frontmatter and TODO placeholders
- Optionally creates resource directories based on `--resources`
- Optionally adds example files when `--examples` is set

初始化后，按需调整 SKILL.md 并添加资源。如果使用了 `--examples`，要替换或删除占位文件。

### 步骤 4：编辑技能

编辑（新建或既有）技能时，牢记这是给另一个 Codex 实例使用的。仅保留对其有帮助且非显而易见的信息。思考哪些流程性知识、领域细节或可复用素材能提升执行效果。

#### 学习成熟设计模式

按技能需求参考以下指南：

- **多步骤流程**：参考 references/workflows.md 的顺序流程与条件逻辑
- **特定输出格式或质量标准**：参考 references/output-patterns.md 的模板与示例

这些文件包含有效技能设计的最佳实践。

#### 从可复用资源开始

开始实现时，优先创建前面识别出的 `scripts/`、`references/`、`assets/` 资源。该步骤可能需要用户输入。例如在实现 `brand-guidelines` 技能时，用户可能需要提供品牌素材/模板存入 `assets/`，或将文档存入 `references/`。

新增脚本必须通过实际运行验证无错误且输出符合预期。若脚本很多，抽样测试即可在保证信心的同时控制时间。

若使用了 `--examples`，删除不需要的占位文件。只创建确实需要的资源目录。

#### 更新 SKILL.md

**写作规范：** 使用祈使/不定式表达。

##### Frontmatter

用 `name` 与 `description` 编写 YAML frontmatter：

- `name`：技能名称
- `description`：技能的主要触发机制，帮助 Codex 理解何时使用该技能。
  - 同时描述技能能力与触发场景。
  - 所有“何时使用”信息必须放在这里，不要放在正文。正文仅在触发后加载，单独的“何时使用”段对 Codex 不友好。
  - `docx` 示例描述："Comprehensive document creation, editing, and analysis with support for tracked changes, comments, formatting preservation, and text extraction. Use when Codex needs to work with professional documents (.docx files) for: (1) Creating new documents, (2) Modifying or editing content, (3) Working with tracked changes, (4) Adding comments, or any other document tasks"

不要在 YAML frontmatter 中加入其他字段。

##### 正文

编写技能与资源使用说明。

### 步骤 5：打包技能

技能开发完成后必须打包成可分发的 .skill 文件。打包流程会先自动校验技能是否符合要求：

```bash
scripts/package_skill.py <path/to/skill-folder>
```

可选输出目录：

```bash
scripts/package_skill.py <path/to/skill-folder> ./dist
```

打包脚本会：

1. **校验** 技能，检查：
   - YAML frontmatter 格式与必需字段
   - 技能命名规范与目录结构
   - 描述完整性与质量
   - 文件组织与资源引用

2. **打包**：校验通过后生成以技能名命名的 .skill 文件（如 `my-skill.skill`），包含所有文件并保持正确目录结构。.skill 实为 zip 包。

若校验失败，脚本会报错并退出，不会创建包。修复后再运行打包命令。

### 步骤 6：迭代

测试后用户可能提出改进建议，通常发生在刚使用过技能、上下文最鲜活时。

**迭代流程：**

1. 用技能处理真实任务
2. 识别卡点或低效环节
3. 判断需要如何更新 SKILL.md 或资源包
4. 实施改动并再次测试
