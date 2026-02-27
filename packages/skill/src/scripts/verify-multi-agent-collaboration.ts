import { TaskFlowManager } from "../orchestration/TaskFlowManager";
import { AgentRegistry } from "../services/AgentRegistry";
import { SkillRegistry } from "../services/SkillRegistry";
import { ArchitectureDesignSkill } from "../skills/ArchitectureDesignSkill";
import { CommunicationSkill } from "../skills/CommunicationSkill";
import { MarketAnalysisSkill } from "../skills/MarketAnalysisSkill";
import { MeetingCoordinationSkill } from "../skills/MeetingCoordinationSkill";
import { PerformanceOptimizationSkill } from "../skills/PerformanceOptimizationSkill";
import { ProductPlanningSkill } from "../skills/ProductPlanningSkill";
import { RequirementManagementSkill } from "../skills/RequirementManagementSkill";
import { SecurityAuditSkill } from "../skills/SecurityAuditSkill";
import { TestDesignSkill } from "../skills/TestDesignSkill";
import { AgentRole } from "../types/collaboration";

async function verifyMultiAgentCollaboration() {
  console.log("=== 开始验证多智能体协同系统 ===\n");

  // 1. 初始化各系统
  const skillRegistry = SkillRegistry.getInstance();
  const agentRegistry = new AgentRegistry();
  const taskFlowManager = new TaskFlowManager(agentRegistry);

  // 2. 注册所有核心技能
  console.log("--- 注册智能体技能 ---");
  const skills: any[] = [
    new MarketAnalysisSkill(),
    new RequirementManagementSkill(),
    new ProductPlanningSkill(),
    new ArchitectureDesignSkill(),
    new TestDesignSkill(),
    new SecurityAuditSkill(),
    new PerformanceOptimizationSkill(),
    new CommunicationSkill(),
    new MeetingCoordinationSkill(),
  ];

  for (const skill of skills) {
    skillRegistry.register(skill);
    console.log(`已注册技能: ${skill.definition.name} (${skill.definition.id})`);
  }

  // 3. 注册各角色智能体
  console.log("\n--- 注册团队智能体 ---");
  const agents: any[] = [
    {
      id: "agent-pm",
      name: "项目经理小张",
      role: AgentRole.PROJECT_MANAGER,
      status: "idle",
      lastSeen: new Date().toISOString(),
      capabilities: [
        {
          name: "沟通",
          description: "跨团队沟通",
          metrics: ["clarity"],
          thresholds: { clarity: 0.8 },
        },
        {
          name: "会议",
          description: "会议管理",
          metrics: ["efficiency"],
          thresholds: { efficiency: 0.7 },
        },
      ],
    },
    {
      id: "agent-pd",
      name: "产品经理小王",
      role: AgentRole.PRODUCT_MANAGER,
      status: "idle",
      lastSeen: new Date().toISOString(),
      capabilities: [
        {
          name: "市场分析",
          description: "市场调研",
          metrics: ["depth"],
          thresholds: { depth: 0.8 },
        },
        {
          name: "需求管理",
          description: "需求分析",
          metrics: ["precision"],
          thresholds: { precision: 0.8 },
        },
      ],
    },
    {
      id: "agent-arch",
      name: "架构师阿强",
      role: AgentRole.ARCHITECT,
      status: "idle",
      lastSeen: new Date().toISOString(),
      capabilities: [
        {
          name: "架构设计",
          description: "系统架构",
          metrics: ["scalability"],
          thresholds: { scalability: 0.9 },
        },
      ],
    },
    {
      id: "agent-qa",
      name: "测试专家小赵",
      role: AgentRole.QA_EXPERT,
      status: "idle",
      lastSeen: new Date().toISOString(),
      capabilities: [
        {
          name: "测试设计",
          description: "测试方案",
          metrics: ["coverage"],
          thresholds: { coverage: 0.8 },
        },
      ],
    },
    {
      id: "agent-se",
      name: "安全专家阿力",
      role: AgentRole.SECURITY_EXPERT,
      status: "idle",
      lastSeen: new Date().toISOString(),
      capabilities: [
        {
          name: "安全审计",
          description: "安全评估",
          metrics: ["vulnerabilities"],
          thresholds: { vulnerabilities: 0.9 },
        },
      ],
    },
    {
      id: "agent-pe",
      name: "性能专家阿明",
      role: AgentRole.PERFORMANCE_EXPERT,
      status: "idle",
      lastSeen: new Date().toISOString(),
      capabilities: [
        {
          name: "性能优化",
          description: "性能调优",
          metrics: ["throughput"],
          thresholds: { throughput: 0.9 },
        },
      ],
    },
  ];

  for (const agent of agents) {
    agentRegistry.register(agent);
    console.log(`已注册智能体: ${agent.name} [${agent.role}]`);
  }

  // 4. 定义一个复杂的项目任务
  const projectRequest = `开发一个“企业级AI安全协作平台”。`;

  console.log("\n--- 启动项目生命周期流程 ---");
  try {
    const report = await taskFlowManager.processProject(projectRequest);

    console.log("\n--- 项目执行报告 ---");
    console.log(report);

    console.log("\n--- 技能成长记录 ---");
    const allSkills = skillRegistry.listAllSkills();
    allSkills.forEach((skillDef) => {
      if (skillDef.level >= 3) {
        console.log(`技能状态: ${skillDef.name} (Level ${skillDef.level})`);
      }
    });
  } catch (error) {
    console.error("项目执行过程中发生错误:", error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
  }
}

// 运行验证
verifyMultiAgentCollaboration();
