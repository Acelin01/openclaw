import { KnowledgeBase } from "../services/KnowledgeBase";

export interface PreCheckResult {
  success: boolean;
  projectId?: string;
  messages: string[];
}

export class PreCheckEngine {
  private static instance: PreCheckEngine;
  private knowledgeBase: KnowledgeBase;

  private constructor() {
    this.knowledgeBase = KnowledgeBase.getInstance();
  }

  public static getInstance(): PreCheckEngine {
    if (!PreCheckEngine.instance) {
      PreCheckEngine.instance = new PreCheckEngine();
    }
    return PreCheckEngine.instance;
  }

  /**
   * 执行需求预检查全流程 (2.1 PreCheck)
   */
  public async executePreCheck(
    requirements: any[],
    addStep?: (msg: string) => void,
  ): Promise<PreCheckResult> {
    const messages: string[] = [];
    const log = (msg: string) => {
      console.log(`[PreCheckEngine] ${msg}`);
      if (addStep) addStep(`[PreCheck] ${msg}`);
      messages.push(msg);
    };

    log("开始需求预检查流程...");

    try {
      // 1. 检查项目是否存在
      let projectId = await this.checkProject(requirements);
      if (!projectId) {
        log("项目不存在，自动创建项目...");
        projectId = await this.autoCreateProject(requirements);
        log(`项目创建完成，ID: ${projectId}`);
      } else {
        log(`项目已存在，ID: ${projectId}`);
      }

      // 2. 检查调研是否完成
      const isSurveyDone = await this.checkSurvey(projectId);
      if (!isSurveyDone) {
        log("调研未完成，自动执行调研...");
        await this.autoConductSurvey(projectId);
        log("调研完成");
      } else {
        log("调研已完成");
      }

      // 3. 检查里程碑是否存在
      const isMilestonePlanned = await this.checkMilestone(projectId);
      if (!isMilestonePlanned) {
        log("里程碑未规划，自动规划里程碑...");
        await this.autoPlanMilestone(projectId);
        log("里程碑规划完成");
      } else {
        log("里程碑已规划");
      }

      // 4. 检查迭代计划是否存在
      const isIterationPlanned = await this.checkIteration(projectId);
      if (!isIterationPlanned) {
        log("迭代计划未制定，自动规划迭代...");
        await this.autoPlanIteration(projectId);
        log("迭代计划制定完成");
      } else {
        log("迭代计划已制定");
      }

      log("所有预检查条件满足，进入需求分析阶段。");

      return {
        success: true,
        projectId,
        messages,
      };
    } catch (error) {
      const errorMsg = `预检查流程失败: ${error instanceof Error ? error.message : String(error)}`;
      console.error(`[PreCheckEngine] ${errorMsg}`);
      if (addStep) addStep(`[PreCheck] ⚠️ ${errorMsg}`);
      messages.push(errorMsg);
      return {
        success: false,
        messages,
      };
    }
  }

  private async checkProject(requirements: any[]): Promise<string | null> {
    // 模拟检查项目是否存在
    // 在实际应用中，这里会查询数据库
    // 简单起见，如果 requirements 中包含 projectId 则认为存在
    const reqWithId = requirements.find((r) => r.projectId);
    return reqWithId ? reqWithId.projectId : null;
  }

  private async autoCreateProject(requirements: any[]): Promise<string> {
    // 模拟创建项目
    await new Promise((resolve) => setTimeout(resolve, 500));
    return `proj-${Date.now()}`;
  }

  private async checkSurvey(projectId: string): Promise<boolean> {
    // 模拟检查调研状态
    // 随机返回 true/false，或者基于 projectId 决定
    return false; // 默认需要调研
  }

  private async autoConductSurvey(projectId: string): Promise<void> {
    // 模拟执行调研
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  private async checkMilestone(projectId: string): Promise<boolean> {
    // 模拟检查里程碑
    return false;
  }

  private async autoPlanMilestone(projectId: string): Promise<void> {
    // 模拟规划里程碑
    await new Promise((resolve) => setTimeout(resolve, 800));
  }

  private async checkIteration(projectId: string): Promise<boolean> {
    // 模拟检查迭代
    return false;
  }

  private async autoPlanIteration(projectId: string): Promise<void> {
    // 模拟规划迭代
    await new Promise((resolve) => setTimeout(resolve, 800));
  }
}
