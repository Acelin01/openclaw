import { ExecutionSandbox } from "../collaboration/ExecutionEnvironment";
import { ExecutionContext, ExecutionStatus } from "../models/ExecutionContext";
import { Skill } from "../models/Skill";
import { KnowledgeBase } from "../services/KnowledgeBase";
import { SkillExecutionResult } from "../types/skill";

/**
 * 技能执行引擎 (SkillExecutor - EXE)
 */
export class SkillExecutor {
  // 资源管理
  private memoryUsage: number = 0;
  private cache: Map<string, any> = new Map();
  private knowledgeBase: KnowledgeBase;
  private sandbox: ExecutionSandbox;

  constructor() {
    this.knowledgeBase = KnowledgeBase.getInstance();
    this.sandbox = new ExecutionSandbox();
  }

  /**
   * 执行技能
   * 包含：加载 -> 验证 -> 初始化 -> 执行 (TEST/EXE) -> 评估 (EVAL) -> 恢复
   */
  public async execute(
    skill: Skill,
    inputs: Record<string, any>,
    env: Record<string, any> = {},
  ): Promise<{ result: SkillExecutionResult; context: ExecutionContext }> {
    const ctx = new ExecutionContext(skill.definition.id + "-" + Date.now());
    ctx.inputs = inputs;
    ctx.env = env;
    ctx.status = ExecutionStatus.INITIALIZING;

    try {
      // 1. 技能加载与初始化
      ctx.addLog(`Loading skill: ${skill.definition.name}`);
      await this.initializeResource(skill, ctx);

      // 2. 输入验证
      ctx.addLog("Validating inputs...");
      const errors = skill.validateInputs(inputs);
      if (Object.keys(errors).length > 0) {
        ctx.status = ExecutionStatus.FAILED;
        ctx.addLog(`Validation error: ${JSON.stringify(errors)}`);
        return {
          result: {
            success: false,
            skillId: skill.definition.id,
            skillName: skill.definition.name,
            executionTime: 0,
            error: `Validation failed: ${JSON.stringify(errors)}`,
          },
          context: ctx,
        };
      }

      // 3. 执行控制
      ctx.status = ExecutionStatus.RUNNING;
      ctx.addLog("Executing skill implementation in sandbox (TEST/EXE)...");

      const startTime = Date.now();
      try {
        // 使用沙盒环境执行
        const result = await this.sandbox.runInTestSandbox(skill.definition.id, () =>
          skill.execute(inputs, ctx.env),
        );

        // 4. 执行评估 (EVAL)
        await this.sandbox.auditExecution(skill.definition.id, result);

        if (!result.success) {
          ctx.addLog(`Skill execution returned failure: ${result.error}`);
          const recoveryResult = await this.handleRecovery(skill, new Error(result.error), ctx);
          return { result: recoveryResult, context: ctx };
        }

        ctx.updateProgress(100);
        ctx.status = ExecutionStatus.COMPLETED;
        ctx.results = result.outputs || {};
        ctx.addLog("Skill execution completed successfully.");

        return { result, context: ctx };
      } catch (execError: any) {
        const recoveryResult = await this.handleRecovery(skill, execError, ctx);
        return { result: recoveryResult, context: ctx };
      }
    } catch (error: any) {
      ctx.status = ExecutionStatus.FAILED;
      ctx.addLog(`Critical Error: ${error.message}`);
      return {
        result: {
          success: false,
          skillId: skill.definition.id,
          skillName: skill.definition.name,
          executionTime: 0,
          error: error.message,
        },
        context: ctx,
      };
    } finally {
      this.releaseResource(skill, ctx);
    }
  }

  private async initializeResource(skill: Skill, ctx: ExecutionContext) {
    ctx.addLog("Initializing resources...");

    // 3. 获取相关领域知识 (EXE -> KS)
    const category = skill.definition.category;
    ctx.addLog(`Fetching domain knowledge for category: ${category}...`);
    const knowledge = this.knowledgeBase.getKnowledgeByCategory(category);
    if (knowledge.length > 0) {
      ctx.addLog(`Found ${knowledge.length} knowledge entries. Applying to context.`);
      ctx.env.domainKnowledge = knowledge.map((k) => k.content).join("\n");
    }

    // 模拟资源分配
    this.memoryUsage += 10;
    ctx.setMetric("memory_allocated", "10MB");
  }

  private releaseResource(skill: Skill, ctx: ExecutionContext) {
    ctx.addLog("Releasing resources...");
    this.memoryUsage = Math.max(0, this.memoryUsage - 10);
  }

  private async handleRecovery(
    skill: Skill,
    error: any,
    ctx: ExecutionContext,
  ): Promise<SkillExecutionResult> {
    ctx.status = ExecutionStatus.RECOVERING;
    ctx.addLog(`Attempting recovery from error: ${error.message}`);

    // 简单恢复策略：重试或返回默认值
    ctx.addLog("Recovery strategy: returning failure with context");
    return {
      success: false,
      skillId: skill.definition.id,
      skillName: skill.definition.name,
      executionTime: 0,
      error: `Execution failed and recovery not possible: ${error.message}`,
    };
  }

  // 缓存管理
  public setCache(key: string, value: any) {
    this.cache.set(key, value);
  }

  public getCache(key: string) {
    return this.cache.get(key);
  }
}
