import { createSkillService, Skill, SkillLevel, ExecutionStatus } from "../index";

/**
 * 验证技能执行全生命周期
 * 涵盖：加载、验证、初始化、执行监控、资源管理、异常恢复
 */
async function verifyExecutorLifecycle() {
  console.log("=== 开始技能执行全生命周期验证 ===\n");

  const service = createSkillService();

  // 1. 定义一个模拟技能，带有耗时操作和潜在错误
  class LifecycleTestSkill extends Skill {
    protected async runImplementation(inputs: Record<string, any>) {
      console.log(`[LifecycleTestSkill] Running with input: ${inputs.data}`);

      // 模拟耗时操作
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (inputs.shouldFail) {
        throw new Error("Simulated execution error");
      }

      return { result: `Processed ${inputs.data}` };
    }
  }

  const skill = new LifecycleTestSkill({
    id: "skill-lifecycle",
    name: "Lifecycle Test",
    category: "test",
    level: SkillLevel.NOVICE,
    version: "1.0",
    description: "Verifies the executor lifecycle",
    inputs: [
      { name: "data", type: "string", required: true },
      { name: "shouldFail", type: "boolean", required: false },
    ],
    outputs: [{ name: "result", type: "string" }],
  });

  // 2. 正常执行流验证
  console.log("--- 1. 正常执行流验证 ---");
  const { result: result1, context: ctx1 } = await service.executor.execute(skill, {
    data: "Valid Data",
  });
  console.log(`执行成功: ${result1.success}`);
  console.log("执行日志:");
  ctx1.logs.forEach((log) => console.log(`  ${log}`));

  // 3. 验证失败与恢复流
  console.log("\n--- 2. 验证失败与恢复流 ---");
  const { result: result2, context: ctx2 } = await service.executor.execute(skill, {
    data: "Error Data",
    shouldFail: true,
  });
  console.log(`执行成功: ${result2.success}`);
  console.log(`错误信息: ${result2.error}`);
  console.log("执行日志:");
  ctx2.logs.forEach((log) => console.log(`  ${log}`));

  // 4. 验证输入校验拦截
  console.log("\n--- 3. 验证输入校验拦截 ---");
  const { result: result3, context: ctx3 } = await service.executor.execute(skill, { data: 123 }); // 类型错误，应为 string
  console.log(`执行成功: ${result3.success}`);
  console.log("执行日志:");
  ctx3.logs.forEach((log) => console.log(`  ${log}`));

  console.log("\n=== 技能执行全生命周期验证完成 ===");
}

verifyExecutorLifecycle().catch(console.error);
