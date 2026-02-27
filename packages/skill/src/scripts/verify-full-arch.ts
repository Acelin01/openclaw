import { createSkillService, TaskStatus, KnowledgeType, SkillLevel, Skill } from "../index";

/**
 * 验证全架构组件协同
 * 涵盖：技能管理、任务编排、知识管理、执行环境
 */
async function verifyFullArchitecture() {
  console.log("=== 开始全架构组件协同验证 ===\n");

  const service = createSkillService();

  // 1. 验证知识管理层 (Knowledge Management Layer)
  console.log("--- 1. 验证知识管理层 ---");
  service.knowledgeManager.addKnowledge({
    id: "k-001",
    type: KnowledgeType.RULE,
    content: "Coding standard: Use TypeScript",
    tags: ["standard", "ts"],
  });
  const results = service.knowledgeManager.query(KnowledgeType.RULE, "TypeScript");
  console.log(`查询到知识条数: ${results.length}`);
  console.log(`知识内容: ${results[0]?.content}`);

  // 2. 验证任务编排层 (Task Orchestration Layer)
  console.log("\n--- 2. 验证任务编排层 ---");
  const goal = "Develop a Todo Web App";
  const tasks = service.taskDecomposer.decompose(goal, { platform: "web" });
  console.log(`任务分解完成，共 ${tasks.length} 个子任务`);

  service.taskScheduler.schedule(tasks);
  const nextTask = service.taskScheduler.getNextTask();
  if (nextTask) {
    console.log(`待执行任务: ${nextTask.name}`);
    service.taskMonitor.watch(nextTask);
    service.taskMonitor.updateStatus(nextTask.id, TaskStatus.IN_PROGRESS);
  }

  // 3. 验证技能管理与执行环境 (Skill Management & Execution Environment)
  console.log("\n--- 3. 验证技能管理与执行环境 ---");

  class CodingSkill extends Skill {
    protected async runImplementation(inputs: Record<string, any>) {
      return { code: 'console.log("Hello");' };
    }
  }

  const skill = new CodingSkill({
    id: "skill-dev",
    name: "Coding",
    category: "dev",
    level: SkillLevel.PROFICIENT,
    version: "1.0",
    description: "Development skill",
    inputs: [],
    outputs: [{ name: "code", type: "string" }],
  });

  service.registry.register(skill);
  console.log(`技能已注册: ${skill.definition.id}`);

  // 在沙盒中模拟执行
  const executionResult = await service.sandbox.executeInSandbox(skill.definition.id, async () => {
    return await skill.execute({});
  });

  console.log(`沙盒执行结果: ${executionResult.success ? "成功" : "失败"}`);
  if (executionResult.success) {
    service.taskMonitor.updateStatus(nextTask!.id, TaskStatus.COMPLETED);
  }

  // 4. 验证任务监控报告
  console.log("\n--- 4. 验证任务监控报告 ---");
  const report = service.taskMonitor.getReport();
  console.log("任务状态统计:", JSON.stringify(report, null, 2));

  console.log("\n=== 全架构组件协同验证完成 ===");
}

verifyFullArchitecture().catch(console.error);
