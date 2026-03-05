/**
 * 技能调用匹配器
 * 用于识别用户输入中的技能调用意图
 */

export interface SkillPattern {
  pattern: RegExp;
  skill: string;
  artifact?: string;
}

/**
 * 技能模式列表
 * 按优先级排序，越靠前优先级越高
 */
export const skillPatterns: SkillPattern[] = [
  // ========== 第一阶段技能 ==========
  
  // 项目管理
  {
    pattern: /创建项目|新建项目|项目创建/,
    skill: 'project_create',
    artifact: null
  },
  {
    pattern: /查询项目|项目详情|查看项目/,
    skill: 'project_query',
    artifact: null
  },

  // 任务管理
  {
    pattern: /创建任务|新建任务|任务创建/,
    skill: 'task_create',
    artifact: null
  },
  {
    pattern: /更新任务状态|任务状态|完成任务/,
    skill: 'task_update_status',
    artifact: null
  },
  {
    pattern: /任务列表|所有任务|任务清单/,
    skill: 'task_list',
    artifact: null
  },

  // 需求管理
  {
    pattern: /创建需求|新建需求|需求创建/,
    skill: 'requirement_create',
    artifact: null
  },

  // 里程碑管理
  {
    pattern: /创建里程碑|新建里程碑|里程碑创建/,
    skill: 'milestone_create',
    artifact: null
  },
  {
    pattern: /监控里程碑|里程碑监控|里程碑状态/,
    skill: 'milestone_monitor',
    artifact: null
  },

  // 缺陷管理
  {
    pattern: /创建缺陷|新建缺陷|缺陷创建|创建 Bug|Bug 创建/,
    skill: 'defect_create',
    artifact: null
  },

  // 风险管理
  {
    pattern: /创建风险|新建风险|风险创建/,
    skill: 'risk_create',
    artifact: null
  },

  // 文档管理
  {
    pattern: /查询文档|文档查询|查看文档/,
    skill: 'document_query',
    artifact: null
  },

  // 迭代管理
  {
    pattern: /创建迭代|新建迭代|迭代创建/,
    skill: 'iteration_create',
    artifact: null
  },

  // 冲刺管理
  {
    pattern: /创建冲刺|新建冲刺|冲刺创建/,
    skill: 'sprint_create',
    artifact: null
  },

  // 测试管理
  {
    pattern: /创建测试计划|新建测试计划|测试计划创建/,
    skill: 'test_plan_create',
    artifact: null
  },
  {
    pattern: /测试计划列表|所有测试计划|测试计划清单/,
    skill: 'test_plan_list',
    artifact: 'TestPlanList'
  },
  {
    pattern: /查询测试计划|测试计划详情|查看测试计划/,
    skill: 'test_plan_query',
    artifact: 'TestPlanDetail'
  },
  {
    pattern: /创建测试用例|新建测试用例|测试用例创建/,
    skill: 'test_case_create',
    artifact: null
  },
  {
    pattern: /测试用例列表|所有测试用例|测试用例清单/,
    skill: 'test_case_list',
    artifact: 'TestCaseList'
  },
  {
    pattern: /查询测试用例|测试用例详情|查看测试用例/,
    skill: 'test_case_query',
    artifact: 'TestCaseDetail'
  },
  {
    pattern: /执行测试|测试执行|运行测试/,
    skill: 'test_execution_create',
    artifact: null
  },

  // ========== 第二阶段技能 ==========
  
  // 缺陷管理
  {
    pattern: /查询缺陷|缺陷详情|查看缺陷/,
    skill: 'defect_query',
    artifact: 'DefectDetail'
  },
  {
    pattern: /缺陷列表|所有缺陷|缺陷清单/,
    skill: 'defect_list',
    artifact: 'DefectList'
  },
  {
    pattern: /更新缺陷|修改缺陷|编辑缺陷/,
    skill: 'defect_update',
    artifact: 'DefectForm'
  },

  // 需求管理
  {
    pattern: /查询需求|需求详情|查看需求/,
    skill: 'requirement_query',
    artifact: 'RequirementDetail'
  },
  {
    pattern: /需求列表|所有需求|需求清单/,
    skill: 'requirement_list',
    artifact: 'RequirementList'
  },
  {
    pattern: /更新需求|修改需求|编辑需求/,
    skill: 'requirement_update',
    artifact: null
  },

  // 任务管理
  {
    pattern: /查询任务|任务详情|查看任务/,
    skill: 'task_query',
    artifact: 'TaskDetail'
  },
  {
    pattern: /更新任务|修改任务|编辑任务/,
    skill: 'task_update',
    artifact: null
  },

  // 里程碑管理
  {
    pattern: /查询里程碑|里程碑详情|查看里程碑/,
    skill: 'milestone_query',
    artifact: 'MilestoneDetail'
  },
  {
    pattern: /里程碑列表|所有里程碑|里程碑清单/,
    skill: 'milestone_list',
    artifact: 'MilestoneList'
  },
  {
    pattern: /更新里程碑|修改里程碑|编辑里程碑/,
    skill: 'milestone_update',
    artifact: null
  },

  // 风险管理
  {
    pattern: /查询风险|风险详情|查看风险/,
    skill: 'risk_query',
    artifact: 'RiskDetail'
  },
  {
    pattern: /风险列表|所有风险|风险清单/,
    skill: 'risk_list',
    artifact: 'RiskList'
  },
  {
    pattern: /更新风险|修改风险|编辑风险/,
    skill: 'risk_update',
    artifact: null
  },
];

/**
 * 解析用户输入，匹配技能调用
 * @param input 用户输入文本
 * @returns 匹配到的技能信息，未匹配到返回 null
 */
export function parseSkillCall(input: string): { skill: string; artifact?: string } | null {
  for (const { pattern, skill, artifact } of skillPatterns) {
    if (pattern.test(input)) {
      return { skill, artifact };
    }
  }
  return null;
}

/**
 * 获取所有已配置的技能列表
 * @returns 技能名称数组
 */
export function getAvailableSkills(): string[] {
  return skillPatterns.map(p => p.skill);
}

/**
 * 获取所有已配置的 Artifact 列表
 * @returns Artifact 名称数组
 */
export function getAvailableArtifacts(): string[] {
  return skillPatterns
    .map(p => p.artifact)
    .filter((a): a is string => a !== null && a !== undefined);
}
