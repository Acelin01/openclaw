import { Skill } from "../models/Skill";
import { SkillRegistry } from "../services/SkillRegistry";
import { SkillLevel } from "../types/skill";

/**
 * 验证技能注册功能
 */
async function verifyRegistration() {
  console.log("=== 开始验证技能注册功能 ===\n");

  const registry = SkillRegistry.getInstance();

  // 1. 定义测试技能
  class TestSkill extends Skill {
    protected async runImplementation(inputs: Record<string, any>) {
      return { result: "test" };
    }
  }

  const skill1 = new TestSkill({
    id: "test-skill-1",
    name: "Test Skill 1",
    category: "test",
    level: SkillLevel.NOVICE,
    version: "1.0",
    description: "First test skill",
    inputs: [],
    outputs: [{ name: "result", type: "string" }],
  });

  const skill2 = new TestSkill({
    id: "test-skill-2",
    name: "Test Skill 2",
    category: "dev",
    level: SkillLevel.EXPERT,
    version: "1.1",
    description: "Second test skill",
    inputs: [],
    outputs: [{ name: "result", type: "string" }],
  });

  // 2. 测试注册
  console.log("--- 测试技能注册 ---");
  registry.register(skill1);
  registry.register(skill2);
  console.log("已注册技能: test-skill-1, test-skill-2");

  // 3. 测试获取技能
  console.log("\n--- 测试获取技能 ---");
  const retrievedSkill = registry.getSkill("test-skill-1");
  if (retrievedSkill && retrievedSkill.definition.id === "test-skill-1") {
    console.log("成功获取技能: test-skill-1");
  } else {
    console.error("获取技能失败: test-skill-1");
  }

  // 4. 测试按分类查找
  console.log("\n--- 测试按分类查找 ---");
  const devSkills = registry.findSkillsByCategory("dev");
  if (devSkills.length === 1 && devSkills[0].definition.id === "test-skill-2") {
    console.log("成功查找到 dev 分类的技能: test-skill-2");
  } else {
    console.error("按分类查找失败");
  }

  // 5. 测试列出所有技能
  console.log("\n--- 测试列出所有技能 ---");
  const allSkills = registry.listAllSkills();
  console.log(`当前共有 ${allSkills.length} 个技能`);
  allSkills.forEach((s) => console.log(`- [${s.category}] ${s.name} (${s.id})`));

  // 6. 测试注销技能
  console.log("\n--- 测试注销技能 ---");
  const deleted = registry.unregister("test-skill-1");
  if (deleted && !registry.getSkill("test-skill-1")) {
    console.log("成功注销技能: test-skill-1");
  } else {
    console.error("注销技能失败: test-skill-1");
  }

  const finalCount = registry.listAllSkills().length;
  console.log(`\n验证结束，最终剩余技能数: ${finalCount}`);
  console.log("\n=== 技能注册功能验证完成 ===");
}

verifyRegistration().catch(console.error);
