import { TimeHorizon, EvolutionGoal } from "../types/evolution";

export class PlanningSystem {
  /**
   * 三层规划循环 (2.1 三层规划循环)
   */
  public generatePlans(goals: EvolutionGoal[]): Record<TimeHorizon, string[]> {
    console.log(`[PlanningSystem] 启动三层规划循环 (LTP/MTP/STP)...`);

    const plans: Record<TimeHorizon, string[]> = {
      [TimeHorizon.LONG_TERM]: [],
      [TimeHorizon.MID_TERM]: [],
      [TimeHorizon.SHORT_TERM]: [],
      [TimeHorizon.IMMEDIATE]: [],
    };

    goals.forEach((goal) => {
      switch (goal.timeHorizon) {
        case TimeHorizon.LONG_TERM:
          plans[TimeHorizon.LONG_TERM].push(
            `战略目标: ${goal.description} (预期达成指标: ${JSON.stringify(goal.metrics)})`,
          );
          break;
        case TimeHorizon.MID_TERM:
          plans[TimeHorizon.MID_TERM].push(`里程碑: ${goal.description}`);
          break;
        case TimeHorizon.SHORT_TERM:
          plans[TimeHorizon.SHORT_TERM].push(`行动计划: ${goal.description}`);
          break;
      }
    });

    return plans;
  }

  public printPlans(plans: Record<TimeHorizon, string[]>) {
    console.log("\n--- 系统演进规划蓝图 ---");
    console.log(`[LTP] 长期规划 (1-5年):`);
    plans[TimeHorizon.LONG_TERM].forEach((p) => console.log(`  - ${p}`));
    console.log(`[MTP] 中期规划 (3-12月):`);
    plans[TimeHorizon.MID_TERM].forEach((p) => console.log(`  - ${p}`));
    console.log(`[STP] 短期规划 (1-4周):`);
    plans[TimeHorizon.SHORT_TERM].forEach((p) => console.log(`  - ${p}`));
    console.log("------------------------\n");
  }
}
