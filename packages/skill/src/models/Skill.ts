import {
  SkillDefinition,
  SkillLevel,
  SkillInput,
  SkillOutput,
  SkillExecutionResult,
  ExecutionRecord,
} from "../types/skill";

export abstract class Skill {
  public definition: SkillDefinition;
  public executionHistory: ExecutionRecord[] = [];
  public successRate: number = 0;
  public averageQuality: number = 0;
  public learningCurve: number[] = [];

  constructor(definition: SkillDefinition) {
    this.definition = definition;
  }

  public validateInputs(inputValues: Record<string, any>): Record<string, string> {
    const errors: Record<string, string> = {};

    // 检查前置技能是否已执行且成功 (如果 context 中有记录)
    if (this.definition.prerequisites && this.definition.prerequisites.length > 0) {
      const executedSkills = inputValues._executedSkills || [];
      for (const pre of this.definition.prerequisites) {
        if (!executedSkills.includes(pre)) {
          errors["_prerequisite"] = `Prerequisite skill not met: ${pre}`;
        }
      }
    }

    for (const inputDef of this.definition.inputs) {
      const value = inputValues[inputDef.name];

      if (inputDef.required && (value === undefined || value === null)) {
        errors[inputDef.name] = `Required input missing: ${inputDef.name}`;
        continue;
      }

      if (value !== undefined && value !== null) {
        if (!this.validateType(value, inputDef.type)) {
          errors[inputDef.name] = `Invalid type for ${inputDef.name}. Expected ${inputDef.type}`;
        }
        // Additional constraints check could go here
      }
    }

    return errors;
  }

  private validateType(value: any, type: string): boolean {
    switch (type) {
      case "string":
        return typeof value === "string";
      case "number":
        return typeof value === "number";
      case "boolean":
        return typeof value === "boolean";
      case "list":
        return Array.isArray(value);
      case "object":
        return typeof value === "object" && !Array.isArray(value);
      default:
        return false;
    }
  }

  public async execute(
    inputs: Record<string, any>,
    context: Record<string, any> = {},
  ): Promise<SkillExecutionResult> {
    const startTime = Date.now();

    try {
      const validationErrors = this.validateInputs(inputs);
      if (Object.keys(validationErrors).length > 0) {
        throw new Error(`Input validation failed: ${JSON.stringify(validationErrors)}`);
      }

      const results = await this.runImplementation(inputs, context);

      const outputs: Record<string, any> = {};
      const qualityScores: Record<string, Record<string, number>> = {};
      const success = results.success !== undefined ? results.success : true;
      const error = results.error;

      for (const outputDef of this.definition.outputs) {
        if (results[outputDef.name] !== undefined) {
          outputs[outputDef.name] = results[outputDef.name];
          if (outputDef.qualityMetrics) {
            const scores = this.assessQuality(
              results[outputDef.name],
              outputDef.qualityMetrics,
              results,
            );
            console.log(`[Skill] Quality scores for ${outputDef.name}:`, scores);
            qualityScores[outputDef.name] = scores;
          }
        }
      }

      const executionTime = (Date.now() - startTime) / 1000;

      const record: ExecutionRecord = {
        timestamp: new Date().toISOString(),
        inputs,
        outputs,
        executionTime,
        success,
        error,
        context,
      };

      this.updateStats(record, qualityScores);

      return {
        success,
        skillId: this.definition.id,
        skillName: this.definition.name,
        executionTime,
        outputs,
        qualityScores,
        error,
        metadata: {
          skillLevel: this.definition.level,
          version: this.definition.version,
        },
      };
    } catch (error: any) {
      const executionTime = (Date.now() - startTime) / 1000;
      const record: ExecutionRecord = {
        timestamp: new Date().toISOString(),
        inputs,
        outputs: {},
        executionTime,
        success: false,
        context,
        error: error.message,
      };

      this.executionHistory.push(record);

      return {
        success: false,
        skillId: this.definition.id,
        skillName: this.definition.name,
        executionTime,
        error: error.message,
      };
    }
  }

  protected abstract runImplementation(
    inputs: Record<string, any>,
    context: Record<string, any>,
  ): Promise<Record<string, any>>;

  protected assessQuality(
    value: any,
    metrics: string[],
    results: Record<string, any> = {},
  ): Record<string, number> {
    const scores: Record<string, number> = {};
    for (const metric of metrics) {
      // Default mock assessment, can be overridden
      scores[metric] = 0.8;
    }
    return scores;
  }

  private updateStats(
    record: ExecutionRecord,
    qualityScores: Record<string, Record<string, number>>,
  ) {
    this.executionHistory.push(record);

    const successful = this.executionHistory.filter((r) => r.success);
    this.successRate = successful.length / this.executionHistory.length;

    // Calculate average quality
    let totalScore = 0;
    let scoreCount = 0;

    // Simple quality calculation for stats
    Object.values(qualityScores).forEach((metrics) => {
      Object.values(metrics).forEach((score) => {
        totalScore += score;
        scoreCount++;
      });
    });

    if (scoreCount > 0) {
      const currentAvg = totalScore / scoreCount;
      this.averageQuality =
        (this.averageQuality * (successful.length - 1) + currentAvg) / successful.length;
    }

    // Update learning curve (last 10 success rate)
    const recent = this.executionHistory.slice(-10);
    const recentSuccessRate = recent.filter((r) => r.success).length / recent.length;
    this.learningCurve.push(recentSuccessRate);
  }
}
