import { ExecutionSandbox } from "../collaboration/ExecutionEnvironment";
import { EvolutionEngine } from "../evolution/EvolutionEngine";
import { SkillFeedbackEngine } from "../evolution/FeedbackEngine";
import { PreCheckEngine } from "../evolution/PreCheckEngine";
import { SkillExecutor } from "../execution/SkillExecutor";
import { ExecutionContext } from "../models/ExecutionContext";
import { Skill } from "../models/Skill";
import { AgentRegistry } from "../services/AgentRegistry";
import { SkillEvaluator, EvaluationResult } from "../services/SkillEvaluator";
import { SkillLearningSystem } from "../services/SkillLearningSystem";
import { SkillMatcher } from "../services/SkillMatcher";
import { SkillRegistry } from "../services/SkillRegistry";
import { SkillBasedFeedback, AdjustmentPlan } from "../types/feedback";
import { SkillLevel, LearningMethod, SkillExecutionResult } from "../types/skill";
import {
  TaskAnalyzer,
  TaskDecomposer,
  TaskScheduler,
  TaskMonitor,
  TaskStatus,
} from "./TaskOrchestrator";

/**
 * 技能包 (Skill Package) - 对应序列图中的“附带:技能包”
 */
export interface SkillPackage {
  skill: Skill;
  context: Record<string, any>;
  metadata: {
    assignedAt: number;
    priority: string;
  };
}

/**
 * 项目处理结果
 */
export interface ProjectProcessResult {
  finalReport: string;
  steps: string[];
  projectId?: string;
  success: boolean;
  tasks?: any[];
}

/**
 * 任务流管理器 (TaskFlowManager)
 * 编排层的核心，集成编排器、调度器、监控器、分解器
 */
export class TaskFlowManager {
  private analyzer: TaskAnalyzer;
  private decomposer: TaskDecomposer;
  private scheduler: TaskScheduler;
  private monitor: TaskMonitor;
  private matcher: SkillMatcher;
  private agentRegistry: AgentRegistry;
  private executor: SkillExecutor;
  private evaluator: SkillEvaluator;
  private sandbox: ExecutionSandbox;
  private learningSystem: SkillLearningSystem;
  private evolutionEngine: EvolutionEngine;
  private feedbackEngine: SkillFeedbackEngine;
  private preCheckEngine: PreCheckEngine;

  constructor(agentRegistry: AgentRegistry) {
    const registry = SkillRegistry.getInstance();
    this.analyzer = new TaskAnalyzer();
    this.decomposer = new TaskDecomposer();
    this.scheduler = new TaskScheduler();
    this.monitor = new TaskMonitor();
    this.matcher = new SkillMatcher();
    this.agentRegistry = agentRegistry;
    this.executor = new SkillExecutor();
    this.evaluator = new SkillEvaluator();
    this.sandbox = new ExecutionSandbox();
    this.learningSystem = new SkillLearningSystem(registry);
    this.evolutionEngine = EvolutionEngine.getInstance();
    this.feedbackEngine = SkillFeedbackEngine.getInstance();
    this.preCheckEngine = PreCheckEngine.getInstance();
  }

  /**
   * 处理项目 (P1-P8) 增加反馈循环 (2.1 流程图)
   */
  public async processProject(goal: string): Promise<ProjectProcessResult> {
    const steps: string[] = [];
    const addStep = (msg: string) => {
      console.log(`[TaskFlowManager] ${msg}`);
      steps.push(msg);
    };

    addStep(`开始处理项目目标: ${goal}`);

    // 1. 需求预检查 (PreCheck Phase)
    // 根据文档 2.1 节，在进入需求分析前，必须通过预检查
    const preCheckResult = await this.preCheckEngine.executePreCheck([{ text: goal }], addStep);

    if (!preCheckResult.success) {
      addStep(`项目预检查失败: ${preCheckResult.messages.join("; ")}`);
      return {
        success: false,
        finalReport: `项目预检查失败: ${preCheckResult.messages.join("; ")}`,
        steps,
        projectId: preCheckResult.projectId,
      };
    }
    addStep(`预检查通过，项目ID: ${preCheckResult.projectId}`);

    let currentGoal = goal;
    let feedbackLoopCount = 0;
    const maxFeedbackLoops = 2; // 模拟递归评估限制

    // 2. 启动智能体反馈评审循环 (Feedback Loop) - 递归评估
    while (feedbackLoopCount < maxFeedbackLoops) {
      addStep(`启动第 ${feedbackLoopCount + 1} 轮需求反馈评审...`);
      const feedbacks = await this.runFeedbackCycle(currentGoal, addStep);

      if (feedbacks.length === 0) {
        addStep(`未发现显著需求问题，通过评审。`);
        break;
      }

      addStep(`识别到 ${feedbacks.length} 条专业反馈，启动需求优化流程...`);
      feedbacks.forEach((f) => {
        addStep(`- [${f.agentRole}] 反馈 (${f.type}): ${f.problemDescription}`);
      });

      const plan = this.feedbackEngine.generateAdjustmentPlan("proj_1", feedbacks, addStep);
      addStep(`调整建议: ${plan.suggestedChanges}`);

      // 模拟项目经理决策 (2.1 ProjectManagerDecision)
      // 如果风险过高且没有足够收益，PM 可能拒绝或要求进一步讨论
      if (plan.status === "pending") {
        plan.status = "accepted";
      }

      if (plan.status === "discussed") {
        addStep(`⚠️ 触发冲突会议: 方案风险过高，正在邀请团队专家进行二次评估...`);
        // 模拟二次评估 (Secondary Assessment)
        plan.status = "accepted";
        plan.rationale += " (经专家会议二次评估后采纳)";
      }

      addStep(`项目经理决策: ${plan.status}`);

      if (plan.status === "accepted") {
        // 验证调整方案 (VAL)
        if (this.feedbackEngine.validateAdjustment(plan, addStep)) {
          addStep(`需求已根据反馈进行优化，启动下一轮验证...`);
          // 模拟需求更新逻辑 (2.1 需求优化)
          currentGoal = `${currentGoal} (已集成: ${feedbacks.map((f) => f.type).join(", ")})`;
          feedbackLoopCount++;
        } else {
          addStep(`调整方案验证未通过，停止优化。`);
          break;
        }
      } else {
        addStep(`项目经理未接受调整方案，按原始需求执行。`);
        break;
      }
    }

    // 3. 任务分解
    addStep(`正在进行任务分解...`);
    const subTasks = this.decomposer.decompose(currentGoal, {
      analysis: this.analyzer.analyze(currentGoal),
    });
    addStep(`分解出 ${subTasks.length} 个子任务`);

    // 2. 任务调度 (TaskScheduler: TS)
    this.scheduler.schedule(subTasks);

    let finalReport = "";
    let projectSuccess = true;
    let cumulativeOutputs: Record<string, any> = {};

    let currentTask = this.scheduler.getNextTask();
    while (currentTask) {
      addStep(`正在处理任务: ${currentTask.name}`);
      this.monitor.watch(currentTask);
      this.monitor.updateStatus(currentTask.id, TaskStatus.IN_PROGRESS);

      // 3. 任务解析与需求分析 (TaskAnalyzer: T2)
      const analysis = this.analyzer.analyze(currentTask.description);
      let skillRequirements = this.analyzer.extractSkillRequirements(analysis);

      // 4. 技能组合优化 (SkillMatcher: SM)
      const allAgents = this.agentRegistry.listAllAgents();
      let selectedSkills = this.matcher.optimizeComposition(skillRequirements, allAgents);

      for (let i = 0; i < selectedSkills.length; i++) {
        let skill = selectedSkills[i];

        // 5. 智能体选择 (AgentRegistry: A3)
        const agent = this.agentRegistry.selectBestAgent([skill.definition.category]);
        if (!agent) throw new Error(`未找到适合执行 ${skill.definition.name} 的智能体`);

        addStep(`分配任务给智能体: ${agent.name} (${agent.role})`);

        // 6. 准备技能包 (Skill Package)
        const skillPackage: SkillPackage = {
          skill: skill,
          context: { ...cumulativeOutputs },
          metadata: {
            assignedAt: Date.now(),
            priority: "high",
          },
        };

        let retryCount = 0;
        const maxRetries = 2;
        let skillPassed = false;

        while (!skillPassed && retryCount <= maxRetries) {
          addStep(
            `${agent.name} 正在加载技能包: ${skill.definition.name} (尝试次数: ${retryCount + 1})`,
          );

          const context = new ExecutionContext(currentTask.id, agent.id);
          const result = await this.executor.execute(
            skillPackage.skill,
            { goal: currentTask.description, agent: agent.name, ...skillPackage.context },
            context,
          );

          // 将执行过程中的详细日志也加入到步骤中，确保 UI 与工作台一致
          context.logs.forEach((log) => {
            // 移除时间戳前缀以便 UI 显示更简洁
            const cleanLog = log.replace(/^\[.*?\]\s*/, "");
            addStep(`[Execution] ${cleanLog}`);
          });

          // 7. 监控与质量检查 (SkillEvaluator: SA)
          const evaluation = this.evaluator.evaluate(result);
          addStep(`质量检查得分: ${(evaluation.overallScore * 100).toFixed(1)}`);

          // 演进反馈 (自演化文档: 2.1 Evaluate -> GenerateInsight)
          this.evolutionEngine.processFeedback(currentTask.id, result, evaluation.overallScore);

          if (evaluation.overallScore >= 0.7) {
            skillPassed = true;
            cumulativeOutputs = { ...cumulativeOutputs, ...(result.outputs || {}) };
            finalReport += this.evaluator.generateReport(result, evaluation) + "\n";
            addStep(`质量达标，更新技能熟练度`);

            // 执行后学习闭环 (2.1 UpdateKB -> MetaLearning)
            this.updateKnowledgeAfterSuccess(skillPackage.skill, result, addStep);
          } else if (evaluation.overallScore < 0.5) {
            addStep(`⚠️ 质量极低 (${evaluation.overallScore})，识别为系统演化鸿沟`);
            addStep(`正在将任务 "${currentTask.name}" 重定向至项目团队 LY...`);
            finalReport += `\n[HANDOVER] 任务 ${currentTask.name} 质量过低，已移交至项目团队 LY 处理。\n`;
            projectSuccess = false; // 触发人工干预
            break;
          } else {
            addStep(`质量不达标，进入优化流程`);
            if (retryCount < maxRetries) {
              retryCount++;
            } else {
              const alternative = this.findBetterSkill(skill, addStep);
              if (alternative) {
                skill = alternative;
                retryCount = 0;
              } else {
                projectSuccess = false;
                break;
              }
            }
          }
        }

        if (!projectSuccess) break;
      }

      if (projectSuccess) {
        this.monitor.updateStatus(currentTask.id, TaskStatus.COMPLETED);
      } else {
        this.monitor.updateStatus(currentTask.id, TaskStatus.FAILED);
        break;
      }

      currentTask = this.scheduler.getNextTask();
    }

    // 8. 评估协作效果与学习循环 (SkillLearningSystem: SL)
    if (projectSuccess) {
      addStep(`正在运行学习闭环...`);
      const allExecutedSkills = Array.from(SkillRegistry.getInstance().listAllSkills())
        .map((def) => SkillRegistry.getInstance().getSkill(def.id))
        .filter((s): s is Skill => !!s);
      await this.runLearningLoop(allExecutedSkills, addStep);
    }

    addStep(`项目处理完成`);
    return {
      success: projectSuccess,
      finalReport,
      steps,
      projectId: preCheckResult.projectId,
      tasks: subTasks,
    };
  }

  private findBetterSkill(currentSkill: Skill, addStep: (msg: string) => void): Skill | undefined {
    const registry = SkillRegistry.getInstance();
    const candidates = registry.findSkillsByCategory(currentSkill.definition.category);
    addStep(
      `[Optimize] 正在为类别 ${currentSkill.definition.category} 寻找优于 Level ${currentSkill.definition.level} 的技能...`,
    );

    const betterSkills = candidates
      .filter((s) => s.definition.level > currentSkill.definition.level)
      .sort((a, b) => a.definition.level - b.definition.level); // 选一个稍微好一点的，而不是直接跳到最高

    if (betterSkills.length > 0) {
      addStep(
        `[Optimize] 找到替代技能: ${betterSkills[0].definition.name} (Level ${betterSkills[0].definition.level})`,
      );
      return betterSkills[0];
    }
    return undefined;
  }

  private async runLearningLoop(
    executedSkills: Skill[],
    addStep: (msg: string) => void,
  ): Promise<void> {
    addStep(`[LearningLoop] 分析执行记录，生成改进建议...`);

    for (const skill of executedSkills) {
      // 模拟分析执行记录并生成建议
      const performance = Math.random(); // 模拟性能评分
      if (performance < 0.8) {
        addStep(
          `[LearningLoop] 建议: 技能 ${skill.definition.name} 在当前场景下表现一般，建议加强领域知识学习。`,
        );
      }

      // 模拟识别到技能提升需求 (例如：专家级以下都建议提升)
      if (skill.definition.level < SkillLevel.EXPERT) {
        addStep(`[LearningLoop] 识别到技能提升需求: ${skill.definition.name}`);
        const plan = this.learningSystem.planLearning(skill.definition.id, LearningMethod.PRACTICE);
        await this.learningSystem.implementLearning(plan.id);
        const success = this.learningSystem.checkMastery(plan.id, 0.9);
        if (success) {
          addStep(
            `[LearningLoop] 技能培训完成，技能库已更新: ${skill.definition.name} -> Level ${skill.definition.level}`,
          );
        }
      }
    }
  }

  /**
   * 执行后更新知识库 (2.1 UpdateKB)
   */
  private updateKnowledgeAfterSuccess(
    skill: Skill,
    result: any,
    addStep: (msg: string) => void,
  ): void {
    addStep(`正在将执行成功经验更新至知识库: ${skill.definition.name}`);

    // 模拟元学习更新 (MetaLearning)
    if (result && result.outputs) {
      const keys = Object.keys(result.outputs);
      if (keys.length > 0) {
        addStep(`提取到 ${keys.length} 条新模式，已更新至元认知模块。`);
      }
    }
  }

  private async runFeedbackCycle(
    goal: string,
    addStep: (msg: string) => void,
  ): Promise<SkillBasedFeedback[]> {
    addStep(`正在向相关领域专家智能体征集反馈: ${goal}`);

    const agents = this.agentRegistry.listAllAgents();
    const allFeedbacks: SkillBasedFeedback[] = [];

    for (const agent of agents) {
      const feedbacks = await this.feedbackEngine.collectAndAnalyze({ goal }, agent, addStep);
      allFeedbacks.push(...feedbacks);
    }

    return allFeedbacks;
  }

  // 保留旧的 processTask 以兼容旧代码
  public async processTask(request: string): Promise<string> {
    const result = await this.processProject(request);
    return result.finalReport;
  }
}
