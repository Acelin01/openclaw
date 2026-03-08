/**
 * 技能调用匹配器
 * 用于识别用户输入中的技能调用意图
 * 
 * 支持的调用格式：
 * 1. @skill-name action params - @提及格式
 * 2. /skill-name action params - 命令格式
 * 3. 自然语言匹配（如"创建一个需求"）
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
    pattern: /创建项目 | 新建项目 | 项目创建/,
    skill: 'project_create',
    artifact: null
  },
  {
    pattern: /查询项目 | 项目详情 | 查看项目/,
    skill: 'project_query',
    artifact: null
  },
  {
    pattern: /项目列表 | 所有项目 | 项目清单/,
    skill: 'project_list',
    artifact: null
  },
  {
    pattern: /更新项目 | 修改项目 | 编辑项目/,
    skill: 'project_update',
    artifact: null
  },

  // 任务管理
  {
    pattern: /创建任务 | 新建任务 | 任务创建/,
    skill: 'task_create',
    artifact: null
  },
  {
    pattern: /查询任务 | 任务详情 | 查看任务/,
    skill: 'task_query',
    artifact: 'TaskDetail'
  },
  {
    pattern: /任务列表 | 所有任务 | 任务清单/,
    skill: 'task_list',
    artifact: 'TaskList'
  },
  {
    pattern: /更新任务 | 修改任务 | 编辑任务/,
    skill: 'task_update',
    artifact: 'TaskForm'
  },
  {
    pattern: /更新任务状态 | 任务状态 | 完成任务/,
    skill: 'task_update_status',
    artifact: null
  },

  // 需求管理
  {
    pattern: /创建需求 | 新建需求 | 需求创建/,
    skill: 'requirement_create',
    artifact: null
  },
  {
    pattern: /查询需求 | 需求详情 | 查看需求/,
    skill: 'requirement_query',
    artifact: 'RequirementDetail'
  },
  {
    pattern: /需求列表 | 所有需求 | 需求清单/,
    skill: 'requirement_list',
    artifact: 'RequirementList'
  },
  {
    pattern: /更新需求 | 修改需求 | 编辑需求/,
    skill: 'requirement_update',
    artifact: null
  },

  // 里程碑管理
  {
    pattern: /创建里程碑 | 新建里程碑 | 里程碑创建/,
    skill: 'milestone_create',
    artifact: null
  },
  {
    pattern: /查询里程碑 | 里程碑详情 | 查看里程碑/,
    skill: 'milestone_query',
    artifact: 'MilestoneDetail'
  },
  {
    pattern: /里程碑列表 | 所有里程碑 | 里程碑清单/,
    skill: 'milestone_list',
    artifact: 'MilestoneList'
  },
  {
    pattern: /更新里程碑 | 修改里程碑 | 编辑里程碑/,
    skill: 'milestone_update',
    artifact: null
  },
  {
    pattern: /监控里程碑 | 里程碑监控 | 里程碑状态/,
    skill: 'milestone_monitor',
    artifact: null
  },

  // 缺陷管理
  {
    pattern: /创建缺陷 | 新建缺陷 | 缺陷创建 | 创建 Bug|Bug 创建/,
    skill: 'defect_create',
    artifact: null
  },
  {
    pattern: /查询缺陷 | 缺陷详情 | 查看缺陷/,
    skill: 'defect_query',
    artifact: 'DefectDetail'
  },
  {
    pattern: /缺陷列表 | 所有缺陷 | 缺陷清单/,
    skill: 'defect_list',
    artifact: 'DefectList'
  },
  {
    pattern: /更新缺陷 | 修改缺陷 | 编辑缺陷/,
    skill: 'defect_update',
    artifact: 'DefectForm'
  },

  // 风险管理
  {
    pattern: /创建风险 | 新建风险 | 风险创建/,
    skill: 'risk_create',
    artifact: null
  },
  {
    pattern: /查询风险 | 风险详情 | 查看风险/,
    skill: 'risk_query',
    artifact: 'RiskDetail'
  },
  {
    pattern: /风险列表 | 所有风险 | 风险清单/,
    skill: 'risk_list',
    artifact: 'RiskList'
  },
  {
    pattern: /更新风险 | 修改风险 | 编辑风险/,
    skill: 'risk_update',
    artifact: null
  },

  // 文档管理
  {
    pattern: /查询文档 | 文档详情 | 查看文档/,
    skill: 'document_query',
    artifact: 'DocumentDetail'
  },
  {
    pattern: /文档列表 | 所有文档 | 文档清单/,
    skill: 'document_list',
    artifact: 'DocumentList'
  },

  // 迭代管理
  {
    pattern: /创建迭代 | 新建迭代 | 迭代创建/,
    skill: 'iteration_create',
    artifact: null
  },
  {
    pattern: /查询迭代 | 迭代详情 | 查看迭代/,
    skill: 'iteration_query',
    artifact: 'IterationDetail'
  },
  {
    pattern: /迭代列表 | 所有迭代 | 迭代清单/,
    skill: 'iteration_list',
    artifact: 'IterationList'
  },
  {
    pattern: /迭代规划 | 规划迭代/,
    skill: 'iteration_planning',
    artifact: 'IterationPlanning'
  },

  // 冲刺管理
  {
    pattern: /创建冲刺 | 新建冲刺 | 冲刺创建/,
    skill: 'sprint_create',
    artifact: null
  },

  // 测试管理
  {
    pattern: /创建测试计划 | 新建测试计划 | 测试计划创建/,
    skill: 'test_plan_create',
    artifact: null
  },
  {
    pattern: /测试计划列表 | 所有测试计划 | 测试计划清单/,
    skill: 'test_plan_list',
    artifact: 'TestPlanList'
  },
  {
    pattern: /查询测试计划 | 测试计划详情 | 查看测试计划/,
    skill: 'test_plan_query',
    artifact: 'TestPlanDetail'
  },
  {
    pattern: /创建测试用例 | 新建测试用例 | 测试用例创建/,
    skill: 'test_case_create',
    artifact: null
  },
  {
    pattern: /测试用例列表 | 所有测试用例 | 测试用例清单/,
    skill: 'test_case_list',
    artifact: 'TestCaseList'
  },
  {
    pattern: /查询测试用例 | 测试用例详情 | 查看测试用例/,
    skill: 'test_case_query',
    artifact: 'TestCaseDetail'
  },
  {
    pattern: /执行测试 | 测试执行 | 运行测试/,
    skill: 'test_execution_create',
    artifact: null
  },

  // ========== 第二阶段技能 ==========
  
  // 工时管理
  {
    pattern: /记录工时 | 工时记录/,
    skill: 'time_tracking_create',
    artifact: null
  },
  {
    pattern: /查询工时 | 工时查询/,
    skill: 'time_tracking_query',
    artifact: null
  },
  {
    pattern: /创建时间表 | 时间表创建/,
    skill: 'timesheet_create',
    artifact: null
  },
  {
    pattern: /工时统计 | 工时报表/,
    skill: 'work_statistics',
    artifact: 'WorkStatistics'
  },

  // 发布管理
  {
    pattern: /查询发布 | 发布详情 | 查看发布/,
    skill: 'release_create',
    artifact: 'ReleaseDetail'
  },
  {
    pattern: /发布计划 | 规划发布/,
    skill: 'release_plan',
    artifact: null
  },
  {
    pattern: /创建部署 | 部署创建/,
    skill: 'deploy_create',
    artifact: null
  },

  // 代码审查
  {
    pattern: /创建代码审查 | 代码审查创建 | 创建审查/,
    skill: 'code_review_create',
    artifact: null
  },
  {
    pattern: /查询代码审查 | 代码审查详情 | 查看审查/,
    skill: 'code_review_query',
    artifact: null
  },

  // 自由职业者服务
  {
    pattern: /更新自由职业者 | 修改自由职业者/,
    skill: 'freelancer_update',
    artifact: null
  },
  {
    pattern: /查询服务 | 服务详情 | 查看服务/,
    skill: 'service_query',
    artifact: 'ServiceDetail'
  },
  {
    pattern: /查询交易 | 交易详情 | 查看交易/,
    skill: 'transaction_query',
    artifact: 'TransactionDetail'
  },
  {
    pattern: /查询合同 | 合同详情 | 查看合同/,
    skill: 'contract_query',
    artifact: null
  },
  {
    pattern: /人才匹配 | 人才推荐/,
    skill: 'talent_match_enhanced',
    artifact: null
  },

  // 协作管理
  {
    pattern: /更新团队 | 修改团队/,
    skill: 'team_update',
    artifact: null
  },
  {
    pattern: /查询协作 | 协作详情/,
    skill: 'collaboration_query',
    artifact: null
  },
  {
    pattern: /执行智能体协作 | 智能体协作/,
    skill: 'agent_collaboration_execute',
    artifact: null
  },
  {
    pattern: /创建工作流 | 工作流创建/,
    skill: 'workflow_create',
    artifact: null
  },
  {
    pattern: /查询工作流 | 工作流详情 | 查看工作流/,
    skill: 'workflow_create',
    artifact: 'WorkflowDetail'
  },
  {
    pattern: /执行工作流 | 工作流执行/,
    skill: 'workflow_execute',
    artifact: null
  },

  // 报告与分析
  {
    pattern: /创建报告 | 报告创建/,
    skill: 'report_create',
    artifact: null
  },
  {
    pattern: /查询报告 | 报告详情 | 查看报告/,
    skill: 'report_query',
    artifact: 'ReportDetail'
  },
  {
    pattern: /分析仪表板 | 仪表板/,
    skill: 'analytics_dashboard',
    artifact: null
  },
  {
    pattern: /性能指标 | 性能查询/,
    skill: 'performance_metrics',
    artifact: null
  },
  {
    pattern: /导出数据 | 数据导出/,
    skill: 'export_data',
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
