import { SkillRegistry } from "../services/SkillRegistry";
import { SkillExecutionMode, SkillExecutionResult } from "../types/skill";

export interface SkillComposition {
  id: string;
  name: string;
  description: string;
  skillIds: string[];
  mode: SkillExecutionMode;
  inputMapping: Record<string, Record<string, any>>; // targetSkillId -> { inputName -> source }
}

export class SkillOrchestrator {
  private registry: SkillRegistry;

  constructor() {
    this.registry = SkillRegistry.getInstance();
  }

  public async executeComposition(
    composition: SkillComposition,
    globalInputs: Record<string, any>,
  ): Promise<Record<string, SkillExecutionResult>> {
    const results: Record<string, SkillExecutionResult> = {};

    switch (composition.mode) {
      case SkillExecutionMode.SEQUENTIAL:
        return await this.executeSequential(composition, globalInputs);
      case SkillExecutionMode.PARALLEL:
        return await this.executeParallel(composition, globalInputs);
      case SkillExecutionMode.PIPELINE:
        return await this.executePipeline(composition, globalInputs);
      default:
        throw new Error(`Execution mode ${composition.mode} not implemented yet`);
    }
  }

  private async executePipeline(
    composition: SkillComposition,
    globalInputs: Record<string, any>,
  ): Promise<Record<string, SkillExecutionResult>> {
    const results: Record<string, SkillExecutionResult> = {};
    let currentContext = { ...globalInputs, _executedSkills: [] as string[] };

    for (const skillId of composition.skillIds) {
      const skill = this.registry.getSkill(skillId);
      if (!skill) {
        results[skillId] = {
          success: false,
          skillId,
          skillName: "Unknown",
          executionTime: 0,
          error: `Skill ${skillId} not found in registry`,
        };
        continue;
      }

      const skillInputs = this.mapInputs(
        skillId,
        composition.inputMapping,
        currentContext,
        results,
      );
      // 将已执行的技能列表传递给输入，用于前置条件校验
      const inputsWithContext = { ...skillInputs, _executedSkills: currentContext._executedSkills };

      const result = await skill.execute(inputsWithContext, currentContext);
      results[skillId] = result;

      if (result.success) {
        currentContext._executedSkills.push(skillId);
        if (result.outputs) {
          currentContext = { ...currentContext, ...result.outputs };
        }
      } else {
        // Pipeline 模式下，如果一个环节失败，后续可能无法继续（取决于具体逻辑，这里选择停止）
        break;
      }
    }

    return results;
  }

  private async executeSequential(
    composition: SkillComposition,
    globalInputs: Record<string, any>,
  ): Promise<Record<string, SkillExecutionResult>> {
    const results: Record<string, SkillExecutionResult> = {};
    let currentContext = { ...globalInputs };

    for (const skillId of composition.skillIds) {
      const skill = this.registry.getSkill(skillId);
      if (!skill) {
        results[skillId] = {
          success: false,
          skillId,
          skillName: "Unknown",
          executionTime: 0,
          error: `Skill ${skillId} not found in registry`,
        };
        continue;
      }

      // Map inputs for this skill
      const skillInputs = this.mapInputs(
        skillId,
        composition.inputMapping,
        currentContext,
        results,
      );

      const result = await skill.execute(skillInputs, currentContext);
      results[skillId] = result;

      if (!result.success) {
        break; // Stop sequential execution on failure
      }

      // Merge outputs into context for next skills
      if (result.outputs) {
        currentContext = { ...currentContext, ...result.outputs };
      }
    }

    return results;
  }

  private async executeParallel(
    composition: SkillComposition,
    globalInputs: Record<string, any>,
  ): Promise<Record<string, SkillExecutionResult>> {
    const promises = composition.skillIds.map(async (skillId) => {
      const skill = this.registry.getSkill(skillId);
      if (!skill) {
        return [
          skillId,
          {
            success: false,
            skillId,
            skillName: "Unknown",
            executionTime: 0,
            error: `Skill ${skillId} not found in registry`,
          },
        ] as [string, SkillExecutionResult];
      }

      const skillInputs = this.mapInputs(skillId, composition.inputMapping, globalInputs, {});
      const result = await skill.execute(skillInputs, globalInputs);
      return [skillId, result] as [string, SkillExecutionResult];
    });

    const resultsArray = await Promise.all(promises);
    return Object.fromEntries(resultsArray);
  }

  private mapInputs(
    skillId: string,
    mapping: Record<string, Record<string, any>>,
    context: Record<string, any>,
    previousResults: Record<string, SkillExecutionResult>,
  ): Record<string, any> {
    const skillMapping = mapping[skillId] || {};
    const inputs: Record<string, any> = {};

    // By default, try to find inputs in context if not mapped
    // This is a simple implementation
    Object.keys(skillMapping).forEach((inputName) => {
      const source = skillMapping[inputName];
      if (typeof source === "string" && source.startsWith("global.")) {
        inputs[inputName] = context[source.replace("global.", "")];
      } else if (typeof source === "string" && source.includes(".")) {
        const [sourceSkillId, sourceOutputName] = source.split(".");
        inputs[inputName] = previousResults[sourceSkillId]?.outputs?.[sourceOutputName];
      } else {
        inputs[inputName] = source;
      }
    });

    return inputs;
  }
}
