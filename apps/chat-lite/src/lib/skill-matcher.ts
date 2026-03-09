/**
 * 技能调用匹配器
 * 用于识别用户输入中的技能调用意图
 * 
 * 支持的调用格式：
 * 1. @skill-name action params - @提及格式
 * 2. /skill-name action params - 命令格式
 * 3. 自然语言匹配（如"创建一个需求"）
 */

export interface ParamDesc {
  name: string;           // 参数名
  type: string;           // 参数类型
  required: boolean;      // 是否必填
  description: string;    // 参数描述
  example?: string;       // 示例值
}

export interface SkillPattern {
  pattern: RegExp;
  skill: string;
  artifact?: string;
  description?: string;   // 技能描述
  params?: ParamDesc[];   // 参数描述
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
    artifact: null,
    description: '创建新项目',
    params: [
      { name: 'name', type: 'string', required: true, description: '项目名称', example: '电商平台' },
      { name: 'description', type: 'string', required: false, description: '项目描述', example: 'B2C 电商平台开发' },
      { name: 'start_date', type: 'date', required: false, description: '开始日期', example: '2026-03-01' },
      { name: 'end_date', type: 'date', required: false, description: '结束日期', example: '2026-06-30' }
    ]
  },
  {
    pattern: /查询项目 | 项目详情 | 查看项目/,
    skill: 'project_query',
    artifact: null,
    description: '查询项目详情',
    params: [
      { name: 'project_id', type: 'string', required: true, description: '项目 ID', example: 'PROJ-001' }
    ]
  },
  {
    pattern: /项目列表 | 所有项目 | 项目清单/,
    skill: 'project_list',
    artifact: null,
    description: '查看项目列表',
    params: [
      { name: 'status', type: 'string', required: false, description: '项目状态', example: 'active' },
      { name: 'limit', type: 'number', required: false, description: '返回数量', example: '10' }
    ]
  },

  // 任务管理
  {
    pattern: /创建任务 | 新建任务 | 任务创建/,
    skill: 'task_create',
    artifact: null,
    description: '创建新任务',
    params: [
      { name: 'title', type: 'string', required: true, description: '任务标题', example: '实现登录功能' },
      { name: 'description', type: 'string', required: false, description: '任务描述', example: '实现用户登录功能' },
      { name: 'assignee_id', type: 'string', required: false, description: '负责人 ID', example: 'user-001' },
      { name: 'priority', type: 'string', required: false, description: '优先级', example: 'high' }
    ]
  },
  {
    pattern: /查询任务 | 任务详情 | 查看任务/,
    skill: 'task_query',
    artifact: 'TaskDetail',
    description: '查询任务详情',
    params: [
      { name: 'task_id', type: 'string', required: true, description: '任务 ID', example: 'TASK-001' }
    ]
  },
  {
    pattern: /任务列表 | 所有任务 | 任务清单/,
    skill: 'task_list',
    artifact: 'TaskList',
    description: '查看任务列表',
    params: [
      { name: 'project_id', type: 'string', required: false, description: '项目 ID', example: 'PROJ-001' },
      { name: 'status', type: 'string', required: false, description: '任务状态', example: 'in_progress' }
    ]
  },
  {
    pattern: /更新任务 | 修改任务 | 编辑任务/,
    skill: 'task_update',
    artifact: 'TaskForm',
    description: '更新任务信息',
    params: [
      { name: 'task_id', type: 'string', required: true, description: '任务 ID', example: 'TASK-001' },
      { name: 'title', type: 'string', required: false, description: '新标题', example: '新标题' },
      { name: 'status', type: 'string', required: false, description: '新状态', example: 'completed' }
    ]
  },

  // 需求管理
  {
    pattern: /创建需求 | 新建需求 | 需求创建/,
    skill: 'requirement_create',
    artifact: null,
    description: '创建新需求',
    params: [
      { name: 'project_id', type: 'string', required: true, description: '项目 ID', example: 'PROJ-001' },
      { name: 'title', type: 'string', required: true, description: '需求标题', example: '用户管理模块' }
    ]
  },
  {
    pattern: /查询需求 | 需求详情 | 查看需求/,
    skill: 'requirement_query',
    artifact: 'RequirementDetail',
    description: '查询需求详情',
    params: [
      { name: 'requirement_id', type: 'string', required: true, description: '需求 ID', example: 'REQ-001' }
    ]
  },
  {
    pattern: /需求列表 | 所有需求 | 需求清单/,
    skill: 'requirement_list',
    artifact: 'RequirementList',
    description: '查看需求列表',
    params: [
      { name: 'project_id', type: 'string', required: false, description: '项目 ID', example: 'PROJ-001' }
    ]
  },

  // 里程碑管理
  {
    pattern: /创建里程碑 | 新建里程碑 | 里程碑创建/,
    skill: 'milestone_create',
    artifact: null,
    description: '创建里程碑',
    params: [
      { name: 'project_id', type: 'string', required: true, description: '项目 ID', example: 'PROJ-001' },
      { name: 'title', type: 'string', required: true, description: '里程碑标题', example: '需求评审完成' },
      { name: 'due_date', type: 'date', required: true, description: '截止日期', example: '2026-03-15' }
    ]
  },
  {
    pattern: /查询里程碑 | 里程碑详情 | 查看里程碑/,
    skill: 'milestone_query',
    artifact: 'MilestoneDetail',
    description: '查询里程碑详情',
    params: [
      { name: 'milestone_id', type: 'string', required: true, description: '里程碑 ID', example: 'MS-001' }
    ]
  },
  {
    pattern: /里程碑列表 | 所有里程碑 | 里程碑清单/,
    skill: 'milestone_list',
    artifact: 'MilestoneList',
    description: '查看里程碑列表',
    params: [
      { name: 'project_id', type: 'string', required: false, description: '项目 ID', example: 'PROJ-001' }
    ]
  },

  // 缺陷管理
  {
    pattern: /创建缺陷 | 新建缺陷 | 缺陷创建 | 创建 Bug|Bug 创建/,
    skill: 'defect_create',
    artifact: null,
    description: '创建缺陷报告',
    params: [
      { name: 'project_id', type: 'string', required: true, description: '项目 ID', example: 'PROJ-001' },
      { name: 'title', type: 'string', required: true, description: '缺陷标题', example: '登录页面样式错误' },
      { name: 'severity', type: 'string', required: false, description: '严重程度', example: 'high' }
    ]
  },
  {
    pattern: /查询缺陷 | 缺陷详情 | 查看缺陷/,
    skill: 'defect_query',
    artifact: 'DefectDetail',
    description: '查询缺陷详情',
    params: [
      { name: 'defect_id', type: 'string', required: true, description: '缺陷 ID', example: 'DEF-001' }
    ]
  },
  {
    pattern: /缺陷列表 | 所有缺陷 | 缺陷清单/,
    skill: 'defect_list',
    artifact: 'DefectList',
    description: '查看缺陷列表',
    params: [
      { name: 'project_id', type: 'string', required: false, description: '项目 ID', example: 'PROJ-001' },
      { name: 'status', type: 'string', required: false, description: '缺陷状态', example: 'open' }
    ]
  },
  {
    pattern: /更新缺陷 | 修改缺陷 | 编辑缺陷/,
    skill: 'defect_update',
    artifact: 'DefectForm',
    description: '更新缺陷信息',
    params: [
      { name: 'defect_id', type: 'string', required: true, description: '缺陷 ID', example: 'DEF-001' },
      { name: 'status', type: 'string', required: false, description: '新状态', example: 'resolved' }
    ]
  },

  // 风险管理
  {
    pattern: /创建风险 | 新建风险 | 风险创建/,
    skill: 'risk_create',
    artifact: null,
    description: '创建风险记录',
    params: [
      { name: 'project_id', type: 'string', required: true, description: '项目 ID', example: 'PROJ-001' },
      { name: 'title', type: 'string', required: true, description: '风险标题', example: '人员流动风险' }
    ]
  },
  {
    pattern: /查询风险 | 风险详情 | 查看风险/,
    skill: 'risk_query',
    artifact: 'RiskDetail',
    description: '查询风险详情',
    params: [
      { name: 'risk_id', type: 'string', required: true, description: '风险 ID', example: 'RISK-001' }
    ]
  },
  {
    pattern: /风险列表 | 所有风险 | 风险清单/,
    skill: 'risk_list',
    artifact: 'RiskList',
    description: '查看风险列表',
    params: [
      { name: 'project_id', type: 'string', required: false, description: '项目 ID', example: 'PROJ-001' }
    ]
  },

  // 测试管理
  {
    pattern: /创建测试计划 | 新建测试计划 | 测试计划创建/,
    skill: 'test_plan_create',
    artifact: null,
    description: '创建测试计划',
    params: [
      { name: 'project_id', type: 'string', required: true, description: '项目 ID', example: 'PROJ-001' },
      { name: 'title', type: 'string', required: true, description: '测试计划标题', example: '系统测试计划' }
    ]
  },
  {
    pattern: /测试计划列表 | 所有测试计划 | 测试计划清单/,
    skill: 'test_plan_list',
    artifact: 'TestPlanList',
    description: '查看测试计划列表',
    params: [
      { name: 'project_id', type: 'string', required: false, description: '项目 ID', example: 'PROJ-001' }
    ]
  },
  {
    pattern: /查询测试计划 | 测试计划详情 | 查看测试计划/,
    skill: 'test_plan_query',
    artifact: 'TestPlanDetail',
    description: '查询测试计划详情',
    params: [
      { name: 'test_plan_id', type: 'string', required: true, description: '测试计划 ID', example: 'TP-001' }
    ]
  },
  {
    pattern: /创建测试用例 | 新建测试用例 | 测试用例创建/,
    skill: 'test_case_create',
    artifact: null,
    description: '创建测试用例',
    params: [
      { name: 'project_id', type: 'string', required: true, description: '项目 ID', example: 'PROJ-001' },
      { name: 'title', type: 'string', required: true, description: '测试用例标题', example: '登录功能测试' }
    ]
  },
  {
    pattern: /测试用例列表 | 所有测试用例 | 测试用例清单/,
    skill: 'test_case_list',
    artifact: 'TestCaseList',
    description: '查看测试用例列表',
    params: [
      { name: 'project_id', type: 'string', required: false, description: '项目 ID', example: 'PROJ-001' }
    ]
  },
  {
    pattern: /查询测试用例 | 测试用例详情 | 查看测试用例/,
    skill: 'test_case_query',
    artifact: 'TestCaseDetail',
    description: '查询测试用例详情',
    params: [
      { name: 'test_case_id', type: 'string', required: true, description: '测试用例 ID', example: 'TC-001' }
    ]
  },

  // 迭代管理
  {
    pattern: /创建迭代 | 新建迭代 | 迭代创建/,
    skill: 'iteration_create',
    artifact: null,
    description: '创建迭代',
    params: [
      { name: 'project_id', type: 'string', required: true, description: '项目 ID', example: 'PROJ-001' },
      { name: 'title', type: 'string', required: true, description: '迭代标题', example: 'Sprint 1' },
      { name: 'start_date', type: 'date', required: false, description: '开始日期', example: '2026-03-01' },
      { name: 'end_date', type: 'date', required: false, description: '结束日期', example: '2026-03-15' }
    ]
  },
  {
    pattern: /查询迭代 | 迭代详情 | 查看迭代/,
    skill: 'iteration_query',
    artifact: 'IterationDetail',
    description: '查询迭代详情',
    params: [
      { name: 'iteration_id', type: 'string', required: true, description: '迭代 ID', example: 'ITER-001' }
    ]
  },
  {
    pattern: /迭代列表 | 所有迭代 | 迭代清单/,
    skill: 'iteration_list',
    artifact: 'IterationList',
    description: '查看迭代列表',
    params: [
      { name: 'project_id', type: 'string', required: false, description: '项目 ID', example: 'PROJ-001' }
    ]
  },
  {
    pattern: /迭代规划 | 规划迭代/,
    skill: 'iteration_planning',
    artifact: 'IterationPlanning',
    description: '规划迭代工作项',
    params: [
      { name: 'iteration_id', type: 'string', required: true, description: '迭代 ID', example: 'ITER-001' },
      { name: 'work_items', type: 'array', required: false, description: '工作项列表', example: 'TASK-001,TASK-002' }
    ]
  },

  // 文档管理
  {
    pattern: /查询文档 | 文档详情 | 查看文档/,
    skill: 'document_query',
    artifact: 'DocumentDetail',
    description: '查询文档详情',
    params: [
      { name: 'document_id', type: 'string', required: true, description: '文档 ID', example: 'DOC-001' }
    ]
  },
  {
    pattern: /文档列表 | 所有文档 | 文档清单/,
    skill: 'document_list',
    artifact: 'DocumentList',
    description: '查看文档列表',
    params: [
      { name: 'project_id', type: 'string', required: false, description: '项目 ID', example: 'PROJ-001' }
    ]
  },

  // 工时管理
  {
    pattern: /工时统计 | 工时报表/,
    skill: 'work_statistics',
    artifact: 'WorkStatistics',
    description: '查看工时统计',
    params: [
      { name: 'project_id', type: 'string', required: false, description: '项目 ID', example: 'PROJ-001' },
      { name: 'start_date', type: 'date', required: false, description: '开始日期', example: '2026-03-01' },
      { name: 'end_date', type: 'date', required: false, description: '结束日期', example: '2026-03-31' }
    ]
  },

  // 报告管理
  {
    pattern: /查询报告 | 报告详情 | 查看报告/,
    skill: 'report_query',
    artifact: 'ReportDetail',
    description: '查询报告详情',
    params: [
      { name: 'report_id', type: 'string', required: true, description: '报告 ID', example: 'RPT-001' }
    ]
  },

  // 自由职业者服务
  {
    pattern: /查询服务 | 服务详情 | 查看服务/,
    skill: 'service_query',
    artifact: 'ServiceDetail',
    description: '查询服务详情',
    params: [
      { name: 'service_id', type: 'string', required: true, description: '服务 ID', example: 'SVC-001' }
    ]
  },
  {
    pattern: /查询交易 | 交易详情 | 查看交易/,
    skill: 'transaction_query',
    artifact: 'TransactionDetail',
    description: '查询交易详情',
    params: [
      { name: 'transaction_id', type: 'string', required: true, description: '交易 ID', example: 'TXN-001' }
    ]
  },

  // 发布管理
  {
    pattern: /查询发布 | 发布详情 | 查看发布 | 创建发布 | 发布创建/,
    skill: 'release_create',
    artifact: 'ReleaseDetail',
    description: '创建/查询发布',
    params: [
      { name: 'title', type: 'string', required: false, description: '发布标题', example: 'v1.0.0' },
      { name: 'version', type: 'string', required: false, description: '版本号', example: '1.0.0' }
    ]
  },

  // 协作管理
  {
    pattern: /创建工作流 | 工作流创建 | 查询工作流 | 工作流详情 | 查看工作流/,
    skill: 'workflow_create',
    artifact: 'WorkflowDetail',
    description: '创建/查询工作流',
    params: [
      { name: 'title', type: 'string', required: false, description: '工作流标题', example: '审批流程' }
    ]
  },
];

/**
 * 解析用户输入，匹配技能调用
 * @param input 用户输入文本
 * @returns 匹配到的技能信息，未匹配到返回 null
 */
export function parseSkillCall(input: string): { 
  skill: string; 
  artifact?: string;
  description?: string;
  params?: ParamDesc[];
} | null {
  for (const { pattern, skill, artifact, description, params } of skillPatterns) {
    if (pattern.test(input)) {
      return { skill, artifact, description, params };
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

/**
 * 获取技能的参数模板
 * @param skillName 技能名称
 * @returns 参数字符串模板
 */
export function getSkillParamTemplate(skillName: string): string {
  const skill = skillPatterns.find(p => p.skill === skillName);
  if (!skill || !skill.params) return '';
  
  return skill.params
    .filter(p => p.required)
    .map(p => `${p.name}=`)
    .join(' ');
}
