import { createSkillService } from "../index";
import { AgentRole } from "../types/collaboration";
import { SkillLevel } from "../types/skill";

async function main() {
  console.log("=== 开始验证智能体反馈驱动的需求优化系统 ===\n");

  const service = createSkillService();

  // 1. 注册具有专业背景的智能体
  console.log("[Step 1] 注册专业智能体 (TM, ARCH, PD)...");
  const agents = [
    { id: "tm_1", name: "技术经理老张", role: AgentRole.TECH_MANAGER, cat: "technical" },
    { id: "arch_1", name: "架构师老李", role: AgentRole.ARCHITECT, cat: "architecture" },
    { id: "pd_1", name: "产品经理小苏", role: AgentRole.PRODUCT_MANAGER, cat: "product" },
  ];

  agents.forEach((a) => {
    service.agentRegistry.register({
      id: a.id,
      name: a.name,
      role: a.role,
      capabilities: [
        {
          name: a.cat,
          description: `Professional ${a.cat} analysis`,
          metrics: ["accuracy"],
          thresholds: { accuracy: 0.8 },
        },
      ],
      status: "idle",
      lastSeen: new Date().toISOString(),
    });
  });

  // 2. 模拟一个存在问题的原始需求
  // 故意包含 "高并发" 但不包含 "缓存" (触发 TM 反馈)
  // 故意包含 "分布式" 但不包含 "监控" (触发 PD 反馈)
  // 增加一个会导致高风险的内容 (触发冲突会议)
  const goal = "开发一个极高并发的分布式核心交易系统，要求零延迟且绝对安全，不计一切代价实现。";
  console.log(`\n[Step 2] 原始需求: "${goal}"`);

  // 3. 执行项目流程，观察反馈机制介入
  try {
    console.log("\n[Step 3] 启动项目处理流程 (触发反馈循环)...");
    const report = await service.flowManager.processProject(goal);

    console.log("\n[Step 4] 最终处理报告:");
    console.log(report);

    console.log("\n=== 反馈机制验证完成 ===");
  } catch (error) {
    console.error("\n验证过程中出现错误:", error);
    process.exit(1);
  }
}

main();
