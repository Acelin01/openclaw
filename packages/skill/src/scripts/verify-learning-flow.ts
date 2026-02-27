import { createSkillService, SkillLevel, LearningMethod, LearningStatus, Skill } from "../index";

/**
 * 验证技能学习全流程
 * 涵盖：需求识别 -> 差距评估 -> 计划制定 -> 实施学习 -> 评估晋升
 */
async function verifyLearningFlow() {
  console.log("=== 开始技能学习全流程验证 ===\n");

  const service = createSkillService();

  // 1. 初始状态：定义一个新手级别的技能
  class CodingSkill extends Skill {
    protected async runImplementation(inputs: Record<string, any>) {
      return { code: 'print("hello")' };
    }
  }

  const skillId = "skill-python";
  const pythonSkill = new CodingSkill({
    id: skillId,
    name: "Python Coding",
    category: "dev",
    level: SkillLevel.NOVICE, // 新手
    version: "1.0",
    description: "Basic Python skill",
    inputs: [],
    outputs: [],
  });

  service.registry.register(pythonSkill);
  console.log(
    `[Start] 初始技能: ${pythonSkill.definition.name}, 当前等级: ${pythonSkill.definition.level}`,
  );

  // 2. 评估技能差距 (AssessGap)
  console.log("\n--- 1. 评估技能差距 ---");
  const requiredLevel = SkillLevel.PROFICIENT; // 需要达到“熟练”
  const hasGap = service.learningSystem.assessGap(skillId, requiredLevel);
  console.log(`目标等级: ${requiredLevel}, 是否存在差距: ${hasGap}`);

  if (hasGap) {
    // 3. 制定学习计划 (PlanLearning)
    console.log("\n--- 2. 制定学习计划 ---");
    const plan = service.learningSystem.planLearning(skillId, LearningMethod.PRACTICE);
    console.log(
      `计划已生成: ${plan.id}, 方法: ${plan.method}, 初始资源: ${plan.resources.join(", ")}`,
    );

    // 4. 实施学习 (ImplementLearning)
    console.log("\n--- 3. 实施学习 ---");
    await service.learningSystem.implementLearning(plan.id);
    const updatedPlan = service.learningSystem.getPlan(plan.id);
    console.log(`学习完成，当前进度: ${updatedPlan?.progress}%, 状态: ${updatedPlan?.status}`);

    // 5. 评估掌握程度 - 第一次尝试 (EvaluateProgress - Failed)
    console.log("\n--- 4. 评估掌握程度 (第一次失败) ---");
    const firstAttempt = service.learningSystem.checkMastery(plan.id, 0.7); // 70分
    console.log(`掌握程度评估: ${firstAttempt ? "已掌握" : "未掌握"}`);
    console.log(
      `计划状态回退: ${service.learningSystem.getPlan(plan.id)?.status}, 新资源: ${service.learningSystem.getPlan(plan.id)?.resources.join(", ")}`,
    );

    // 6. 重新实施学习并再次评估 (EvaluateProgress - Success)
    console.log("\n--- 5. 重新学习并评估 (第二次成功) ---");
    await service.learningSystem.implementLearning(plan.id);
    const secondAttempt = service.learningSystem.checkMastery(plan.id, 0.9); // 90分
    console.log(`掌握程度评估: ${secondAttempt ? "已掌握" : "未掌握"}`);

    // 7. 技能认证与档案更新 (CertifySkill & UpdateProfile)
    console.log("\n--- 6. 最终技能档案 ---");
    const finalSkill = service.registry.getSkill(skillId);
    console.log(`更新后技能等级: ${finalSkill?.definition.level}`);
  }

  console.log("\n=== 技能学习全流程验证完成 ===");
}

verifyLearningFlow().catch(console.error);
