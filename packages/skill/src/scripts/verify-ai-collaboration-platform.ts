import { Skill } from "../models/Skill";
import { TaskFlowManager } from "../orchestration/TaskFlowManager";
import { AgentRegistry } from "../services/AgentRegistry";
import { SkillRegistry } from "../services/SkillRegistry";
import { ArchitectureDesignSkill } from "../skills/ArchitectureDesignSkill";
import { MarketAnalysisSkill } from "../skills/MarketAnalysisSkill";
import { RequirementManagementSkill } from "../skills/RequirementManagementSkill";
import { AgentRole } from "../types/collaboration";
import { SkillLevel } from "../types/skill";

/**
 * 模拟高级需求管理技能
 */
class RequirementManagementSkillV2 extends Skill {
  constructor() {
    super({
      id: "skill-requirement-management-v2", // 修改 ID 避免冲突
      name: "高级需求管理技能",
      description: "处理极其复杂的业务需求，包含遗留系统逻辑拆解",
      category: "analysis",
      level: SkillLevel.EXPERT, // 专家级
      version: "1.1.0",
      inputs: [
        { name: "goal", type: "string", required: true, description: "原始需求描述" },
        { name: "raw_requirements", type: "string", required: false, description: "原始需求描述" },
      ],
      outputs: [
        { name: "user_stories", type: "list", qualityMetrics: ["clarity", "completeness"] },
        { name: "prd_document", type: "string", qualityMetrics: ["structure", "detail"] },
      ],
    });
  }

  protected async runImplementation(inputs: Record<string, any>): Promise<Record<string, any>> {
    console.log(`[RequirementManagementSkillV2] 正在分析复杂需求...`);
    return {
      user_stories: [{ id: "US-ADV", story: "Complex story" }],
      prd_document: "Detailed PRD for legacy integration",
    };
  }

  protected assessQuality(value: any, metrics: string[]): Record<string, number> {
    const scores: Record<string, number> = {};
    for (const metric of metrics) {
      scores[metric] = 0.95;
    }
    return scores;
  }
}

/**
 * 模拟一个极其复杂的任务，AI 可能无法完全处理
 */
class ComplexLegacySystemIntegrationSkill extends Skill {
  constructor() {
    super({
      id: "complex-legacy-integration",
      name: "复杂遗留系统集成技能",
      description: "处理 20 年前的老旧系统集成，涉及非标准协议和物理隔离环境",
      level: SkillLevel.PROFICIENT,
      category: "development",
      version: "1.0.0",
      inputs: [
        { name: "goal", type: "string", required: true, description: "目标需求" },
        { name: "integration_plan", type: "object", required: false, description: "集成方案" },
      ],
      outputs: [{ name: "integration_result", type: "object", qualityMetrics: ["reliability"] }],
    });
  }

  protected async runImplementation(inputs: Record<string, any>): Promise<Record<string, any>> {
    console.log(`[Node: 自动化执行] 正在尝试集成遗留系统... (检测到环境为非标准串行协议)`);
    // 模拟由于环境极其复杂导致执行失败或质量极低
    return {
      integration_result: { status: "incomplete", error: "Physical access required" },
    };
  }

  // 重写质量评估，返回极低分数以触发“人工接管”流程
  protected assessQuality(value: any, metrics: string[]): Record<string, number> {
    const scores: Record<string, number> = {};
    for (const metric of metrics) {
      scores[metric] = -5.0; // 极低分，确保 (score + success_weight*1.0 + efficiency_weight*1.0)/total_weight < 0.7
    }
    return scores;
  }
}

async function runAICollaborationScenario() {
  console.log("================================================================");
  console.log("🚀 欢迎使用 AI 项目协同平台 - 任务自动化与协同验证");
  console.log("================================================================\n");

  // 1. 系统初始化节点
  console.log("[Node 1: 系统初始化] 正在加载智能体注册表与技能库...");
  const skillRegistry = SkillRegistry.getInstance();
  const agentRegistry = new AgentRegistry();
  const taskFlowManager = new TaskFlowManager(agentRegistry);

  // 2. 技能注册节点
  console.log("[Node 2: 技能注入] 正在向平台注入核心自动化技能...");
  const skills: any[] = [
    new MarketAnalysisSkill(),
    new RequirementManagementSkill(),
    new RequirementManagementSkillV2(), // 注入专家级技能供优化选择
    new ArchitectureDesignSkill(),
    new ComplexLegacySystemIntegrationSkill(),
  ];
  for (const skill of skills) {
    skillRegistry.register(skill);
    console.log(`   - 注入技能: ${skill.definition.name} (Level: ${skill.definition.level})`);
  }

  // 3. 团队组建节点
  console.log("\n[Node 3: 团队组建] 正在指派 AI 专家进入协作空间...");
  const agents: any[] = [
    {
      id: "ai-pd",
      name: "AI产品经理",
      role: AgentRole.PRODUCT_MANAGER,
      status: "idle",
      capabilities: [{ name: "analysis", metrics: ["accuracy"], thresholds: { accuracy: 0.8 } }],
    },
    {
      id: "ai-arch",
      name: "AI架构师",
      role: AgentRole.ARCHITECT,
      status: "idle",
      capabilities: [
        { name: "design", metrics: ["scalability"], thresholds: { scalability: 0.8 } },
      ],
    },
    {
      id: "ai-dev",
      name: "AI开发工程师",
      role: AgentRole.DEVELOPER,
      status: "idle",
      capabilities: [
        { name: "development", metrics: ["efficiency"], thresholds: { efficiency: 0.7 } },
      ],
    },
  ];
  for (const agent of agents) {
    agentRegistry.register(agent);
    console.log(`   - 已就绪: ${agent.name} [${agent.role}]`);
  }

  // 4. 任务接收与处理节点
  const projectGoal = "开发一个包含遗留系统集成的 AI 驱动业务分析平台";
  console.log(`\n[Node 4: 任务接收] 目标: ${projectGoal}`);

  try {
    console.log("[Node 5: 流程编排] 启动 TaskFlowManager 进行任务拆解与调度...");
    const report = await taskFlowManager.processProject(projectGoal);

    // 检查是否有失败的任务
    console.log("\n[Node 6: 结果审计] 正在检查 AI 处理链路完整性...");

    // 我们手动模拟从 TaskFlowManager 获取状态（在实际系统中可以通过 monitor 获取）
    // 为了演示，我们检查输出中是否包含 "failed" 状态
    const stats = (taskFlowManager as any).monitor.getReport();

    if (stats.failed > 0) {
      console.log("\n⚠️  检测到 AI 无法处理的复杂任务节点!");
      console.log("----------------------------------------------------------------");
      console.log("🔴 状态: AI 自动化执行遇到阻碍 (环境复杂度超过当前模型阈值)");
      console.log("📢 决策: 自动触发“人工接管”流程");
      console.log("📍 指向: 项目团队 LY (Team LY)");
      console.log("📝 备注: 请 LY 团队介入处理遗留系统集成的物理调试部分");
      console.log("----------------------------------------------------------------");
    } else {
      console.log("✅ 所有任务节点已由 AI 自动化完成。");
    }
  } catch (error) {
    console.log("\n❌ 系统级异常，紧急转人工：项目团队 LY");
  }

  console.log("\n================================================================");
  console.log("🏁 协作流程演示结束");
  console.log("================================================================");
}

runAICollaborationScenario();
