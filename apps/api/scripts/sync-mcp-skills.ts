
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const projectCollaborationTools = [
  {
    name: "project_create",
    description: "创建新项目。需要参数：name(项目名称), description(描述), owner_id(负责人ID), start_date(开始日期), end_date(结束日期), budget_min(最小预算), budget_max(最大预算)",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        description: { type: "string" },
        owner_id: { type: "string" },
        start_date: { type: "string", format: "date" },
        end_date: { type: "string", format: "date" },
        budget_min: { type: "number" },
        budget_max: { type: "number" },
        team_members: { type: "array", items: { type: "string" } }
      },
      required: ["name", "owner_id"]
    }
  },
  {
    name: "iteration_create",
    description: "创建项目迭代。参数：project_id(项目ID), title(迭代标题), description(描述), start_date(开始日期), end_date(结束日期), owner_id(负责人ID)",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "string" },
        title: { type: "string" },
        description: { type: "string" },
        start_date: { type: "string", format: "date" },
        end_date: { type: "string", format: "date" },
        owner_id: { type: "string" }
      },
      required: ["project_id", "title", "start_date", "end_date"]
    }
  },
  {
    name: "milestone_create",
    description: "创建项目里程碑。参数：project_id(项目ID), title(里程碑标题), due_date(截止日期), description(描述)",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "string" },
        title: { type: "string" },
        due_date: { type: "string", format: "date" },
        description: { type: "string" },
        dependencies: { type: "array", items: { type: "string" } }
      },
      required: ["project_id", "title", "due_date"]
    }
  },
  {
    name: "requirement_create",
    description: "创建项目需求。参数：project_id(项目ID), title(需求标题), description(详细描述), reviewer_id(审核人ID), priority(优先级), status(状态), assignee_id(负责人)",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "string" },
        title: { type: "string" },
        description: { type: "string" },
        reviewer_id: { type: "string" },
        priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
        status: { type: "string", enum: ["draft", "approved", "in_progress", "completed", "rejected"] },
        assignee_id: { type: "string" },
        estimated_hours: { type: "number" },
        acceptance_criteria: { type: "array", items: { type: "string" } }
      },
      required: ["project_id", "title"]
    }
  },
  {
    name: "task_create",
    description: "创建任务。参数：project_id(项目ID), requirement_id(可选:需求ID), title(任务标题), description(描述), assignee_id(负责人), estimated_hours(预计工时), priority(优先级)",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "string" },
        requirement_id: { type: "string" },
        title: { type: "string" },
        description: { type: "string" },
        assignee_id: { type: "string" },
        due_date: { type: "string", format: "date" },
        estimated_hours: { type: "number" },
        priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
        dependencies: { type: "array", items: { type: "string" } }
      },
      required: ["project_id", "title", "assignee_id"]
    }
  },
  {
    name: "task_update_status",
    description: "更新任务状态。参数：task_id(任务ID), status(新状态: pending, in_progress, completed, failed)",
    inputSchema: {
      type: "object",
      properties: {
        task_id: { type: "string" },
        status: { type: "string", enum: ["pending", "in_progress", "completed", "failed"] }
      },
      required: ["task_id", "status"]
    }
  },
  {
    name: "collaboration_dispatch",
    description: "智能体协作调度。将任务分配给特定角色的智能体，并建立依赖关系。参数：task_id(任务ID), agent_role(目标智能体角色), context(协作上下文)",
    inputSchema: {
      type: "object",
      properties: {
        task_id: { type: "string" },
        agent_role: { type: "string" },
        context: { type: "string" },
        dependencies: { type: "array", items: { type: "string" } }
      },
      required: ["task_id", "agent_role", "context"]
    }
  },
  {
    name: "collaboration_sync",
    description: "同步协作状态。在多个智能体间同步任务进展和中间产物。参数：project_id(项目ID), updates(更新内容列表)",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "string" },
        updates: {
          type: "array",
          items: {
            type: "object",
            properties: {
              task_id: { type: "string" },
              status: { type: "string" },
              output: { type: "object" }
            },
            required: ["task_id", "status"]
          }
        }
      },
      required: ["project_id", "updates"]
    }
  },
  {
    name: "defect_create",
    description: "创建缺陷报告。参数：project_id(项目ID), title(缺陷标题), description(详细描述), severity(严重程度), steps_to_reproduce(重现步骤), expected_result(期望结果), actual_result(实际结果)",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "string" },
        title: { type: "string" },
        description: { type: "string" },
        severity: { type: "string", enum: ["trivial", "minor", "major", "critical", "blocker"] },
        priority: { type: "string", enum: ["low", "medium", "high"] },
        reporter_id: { type: "string" },
        assignee_id: { type: "string" },
        steps_to_reproduce: { type: "array", items: { type: "string" } },
        expected_result: { type: "string" },
        actual_result: { type: "string" }
      },
      required: ["project_id", "title", "description", "severity"]
    }
  },
  {
    name: "risk_create",
    description: "创建项目风险。参数：project_id(项目ID), title(风险标题), description(描述), probability(发生概率), impact(影响程度), mitigation_plan(缓解计划), owner_id(负责人)",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "string" },
        title: { type: "string" },
        description: { type: "string" },
        probability: { type: "string", enum: ["low", "medium", "high"] },
        impact: { type: "string", enum: ["low", "medium", "high", "critical"] },
        risk_level: { type: "string", enum: ["green", "yellow", "red"] },
        mitigation_plan: { type: "string" },
        owner_id: { type: "string" },
        due_date: { type: "string", format: "date" }
      },
      required: ["project_id", "title", "probability", "impact"]
    }
  },
  {
    name: "team_add_member",
    description: "添加团队成员到项目。参数：project_id(项目ID), user_id(用户ID), role(角色), permissions(权限列表)",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "string" },
        user_id: { type: "string" },
        role: { type: "string", enum: ["member", "developer", "tester", "manager", "stakeholder"] },
        permissions: { type: "array", items: { type: "string" } },
        weekly_hours: { type: "number" },
        hourly_rate: { type: "number" }
      },
      required: ["project_id", "user_id", "role"]
    }
  },
  {
    name: "project_query",
    description: "查询项目信息。参数：project_id(项目ID) 或 filter(筛选条件)",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "string" },
        filter: { type: "object" },
        include: { type: "array", items: { type: "string" } }
      }
    }
  },
  {
    name: "task_list",
    description: "查看项目下的所有任务列表及当前进度。参数：project_id(项目ID)",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "string" }
      },
      required: ["project_id"]
    }
  },
  {
    name: "milestone_monitor",
    description: "监控项目里程碑状态。获取项目所有里程碑的当前进展、截止日期及风险状态。",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "string", description: "项目ID" }
      },
      required: ["project_id"]
    }
  },
  {
    name: "financial_record_create",
    description: "创建项目财务记录。参数：project_id(项目ID), type(类型: INCOME/EXPENSE), amount(金额), category(分类), description(描述), date(日期)",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "string" },
        type: { type: "string", enum: ["INCOME", "EXPENSE"] },
        amount: { type: "number" },
        category: { type: "string" },
        description: { type: "string" },
        date: { type: "string", format: "date-time" }
      },
      required: ["project_id", "type", "amount"]
    }
  },
  {
    name: "approval_create",
    description: "发起审批申请。参数：project_id(项目ID), title(审批标题), description(描述), requester_id(申请人ID)",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "string" },
        title: { type: "string" },
        description: { type: "string" },
        requester_id: { type: "string" }
      },
      required: ["project_id", "title"]
    }
  },
  {
    name: "qna_create",
    description: "提出项目问题。参数：project_id(项目ID), question(问题内容), asked_by_id(提问者ID)",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "string" },
        question: { type: "string" },
        asked_by_id: { type: "string" }
      },
      required: ["project_id", "question"]
    }
  },
  {
    name: "report_create",
    description: "创建项目报告。参数：project_id(项目ID), title(报告标题), content(报告内容), period(报告周期)",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "string" },
        title: { type: "string" },
        content: { type: "object" },
        period: { type: "string" }
      },
      required: ["project_id", "title"]
    }
  },
  {
    name: "document_query",
    description: "查询文档。参数可选项目ID，默认情况下，查询当前访问用户的所有文档",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "string" },
        kind: { type: "string" },
        chat_id: { type: "string" }
      }
    }
  },
  {
    name: "agent_collaboration_plan",
    description: "基于流程图的智能体协作编排：生成任务分解与依赖关系。参数：goal(协作目标), include_flowcharts(可选)返回流程图原文",
    inputSchema: {
      type: "object",
      properties: {
        goal: { type: "string" },
        include_flowcharts: { type: "boolean" },
      },
      required: ["goal"],
    }
  },
  {
    name: "agent_collaboration_start",
    description: "启动智能体协作编排：生成计划，并可选创建项目任务与执行协作调度。参数：project_id, goal, assignee_id(可选), create_tasks(默认true), dispatch(默认true), context(可选补充上下文)",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "string" },
        goal: { type: "string" },
        assignee_id: { type: "string" },
        create_tasks: { type: "boolean" },
        dispatch: { type: "boolean" },
        context: { type: "string" },
      },
      required: ["project_id", "goal"],
    }
  }
];

const freelancerTools = [
  {
    name: "resume_create",
    description: "创建或更新自由职业者简历。参数：freelancer_id(自由职业者ID), title(简历标题), summary(个人简介), skills(技能列表), experience(工作经验), education(教育背景), hourly_rate(时薪), availability(可工作时间)",
    inputSchema: {
      type: "object",
      properties: {
        freelancer_id: { type: "string" },
        title: { type: "string" },
        summary: { type: "string" },
        skills: { type: "array", items: { type: "string" } },
        experience: { type: "array", items: { type: "object" } },
        education: { type: "array", items: { type: "object" } },
        hourly_rate: { type: "number" },
        availability: { type: "string", enum: ["full_time", "part_time", "project_basis"] },
        portfolio_links: { type: "array", items: { type: "string" } },
        certifications: { type: "array", items: { type: "string" } }
      },
      required: ["freelancer_id", "title", "skills"]
    }
  },
  {
    name: "portfolio_create",
    description: "创建或更新自由职业者作品集。参数：freelancer_id(自由职业者ID), title(作品标题), description(作品描述), project_url(项目链接), images(图片链接列表)",
    inputSchema: {
      type: "object",
      properties: {
        freelancer_id: { type: "string" },
        title: { type: "string" },
        description: { type: "string" },
        project_url: { type: "string" },
        images: { type: "array", items: { type: "string" } },
        tags: { type: "array", items: { type: "string" } }
      },
      required: ["freelancer_id", "title"]
    }
  },
  {
    name: "freelancer_register",
    description: "注册自由职业者。参数：name(姓名), email(邮箱), phone(电话), country(国家), timezone(时区), preferred_languages(首选语言), payment_methods(支付方式)",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        email: { type: "string", format: "email" },
        phone: { type: "string" },
        country: { type: "string" },
        timezone: { type: "string" },
        preferred_languages: { type: "array", items: { type: "string" } },
        payment_methods: { type: "array", items: { type: "string" } },
        tax_id: { type: "string" },
        verification_documents: { type: "array", items: { type: "string" } }
      },
      required: ["name", "email", "country"]
    }
  },
  {
    name: "service_create",
    description: "创建自由职业者服务。参数：freelancer_id(自由职业者ID), title(服务标题), description(服务描述), category(服务类别), price_type(计价方式), price(价格), delivery_time(交付时间), revisions(修改次数)",
    inputSchema: {
      type: "object",
      properties: {
        freelancer_id: { type: "string" },
        title: { type: "string" },
        description: { type: "string" },
        category: { type: "string", enum: ["web_development", "mobile_app", "design", "writing", "marketing", "consulting"] },
        price_type: { type: "string", enum: ["hourly", "fixed", "milestone"] },
        price: { type: "number" },
        delivery_time: { type: "string" },
        revisions: { type: "integer" },
        requirements: { type: "array", items: { type: "string" } },
        tags: { type: "array", items: { type: "string" } }
      },
      required: ["freelancer_id", "title", "description", "price_type"]
    }
  },
  {
    name: "transaction_create",
    description: "创建服务交易。参数：client_id(客户ID), freelancer_id(自由职业者ID), service_id(服务ID), amount(金额), currency(货币), description(交易描述), terms(条款)",
    inputSchema: {
      type: "object",
      properties: {
        client_id: { type: "string" },
        freelancer_id: { type: "string" },
        service_id: { type: "string" },
        amount: { type: "number" },
        currency: { type: "string", default: "USD" },
        description: { type: "string" },
        terms: { type: "string" },
        milestones: { type: "array", items: { type: "object" } },
        start_date: { type: "string", format: "date" },
        end_date: { type: "string", format: "date" }
      },
      required: ["client_id", "freelancer_id", "service_id", "amount"]
    }
  },
  {
    name: "contract_create",
    description: "创建或更新合同。参数：transaction_id(交易ID), terms(详细条款), signatures(签名状态), attachments(附件列表)",
    inputSchema: {
      type: "object",
      properties: {
        transaction_id: { type: "string" },
        terms: { type: "string" },
        signatures: { type: "array", items: { type: "string" } },
        attachments: { type: "array", items: { type: "string" } }
      },
      required: ["transaction_id", "terms"]
    }
  },
  {
    name: "quotation_create",
    description: "创建报价单。参数：freelancer_id(自由职业者ID), client_id(客户ID), service_id(服务ID), title(报价标题), description(描述), price(价格), delivery_time(交付时间)",
    inputSchema: {
      type: "object",
      properties: {
        freelancer_id: { type: "string" },
        client_id: { type: "string" },
        service_id: { type: "string" },
        title: { type: "string" },
        description: { type: "string" },
        price: { type: "number" },
        delivery_time: { type: "string" },
        items: { type: "array", items: { type: "object" } }
      },
      required: ["freelancer_id", "title", "price"]
    }
  },
  {
    name: "inquiry_create",
    description: "创建询价需求。参数：client_id(客户ID), title(需求标题), description(需求描述), budget_min(最小预算), budget_max(最大预算), deadline(截止日期)",
    inputSchema: {
      type: "object",
      properties: {
        client_id: { type: "string" },
        title: { type: "string" },
        description: { type: "string" },
        budget_min: { type: "number" },
        budget_max: { type: "number" },
        deadline: { type: "string", format: "date" },
        category: { type: "string" }
      },
      required: ["client_id", "title", "description"]
    }
  },
  {
    name: "review_create",
    description: "提交评价。参数：transaction_id(交易ID), rating(评分1-5), content(评价内容), reviewer_id(评价人ID), reviewee_id(被评价人ID)",
    inputSchema: {
      type: "object",
      properties: {
        transaction_id: { type: "string" },
        rating: { type: "integer", minimum: 1, maximum: 5 },
        content: { type: "string" },
        reviewer_id: { type: "string" },
        reviewee_id: { type: "string" }
      },
      required: ["transaction_id", "rating", "content"]
    }
  },
  {
    name: "talent_match",
    description: "智能人才匹配。参数：skills(所需技能), budget(预算), duration(工期)",
    inputSchema: {
      type: "object",
      properties: {
        skills: { type: "array", items: { type: "string" } },
        budget: { type: "number" },
        duration: { type: "string" }
      },
      required: ["skills"]
    }
  },
  {
    name: "skill_analyzer",
    description: "技能需求分析工具。分析项目描述以提取所需的关键技能、经验要求和专业领域。",
    inputSchema: {
      type: "object",
      properties: {
        project_description: { type: "string", description: "项目或任务的详细描述" },
        industry: { type: "string", description: "所属行业（可选）" }
      },
      required: ["project_description"]
    }
  },
  {
    name: "marketplace_integrator",
    description: "人才市场集成工具。跨平台同步人才数据，搜索第三方平台（如 Upwork, LinkedIn）的人才信息。",
    inputSchema: {
      type: "object",
      properties: {
        platforms: { type: "array", items: { type: "string" }, description: "目标平台列表" },
        query: { type: "string", description: "搜索关键词" },
        filters: { type: "object", description: "过滤条件" }
      },
      required: ["query"]
    }
  },
  {
    name: "compliance_checker",
    description: "合同合规性检查工具。验证合同条款是否符合法律法规、公司政策及特定项目要求。",
    inputSchema: {
      type: "object",
      properties: {
        contract_terms: { type: "string", description: "合同详细条款" },
        region: { type: "string", description: "适用法律区域" },
        compliance_type: { type: "array", items: { type: "string" }, description: "检查类型：legal, tax, policy" }
      },
      required: ["contract_terms"]
    }
  },
  {
    name: "growth_strategy_analyzer",
    description: "增长策略分析工具。提供 A/B 测试设计、用户转化漏斗优化及留存率分析建议。",
    inputSchema: {
      type: "object",
      properties: {
        metrics: { type: "object", description: "当前业务指标 (如转化率、留存率)" },
        goal: { type: "string", description: "增长目标" },
        platform: { type: "string", description: "目标平台" }
      },
      required: ["goal"]
    }
  },
  {
    name: "ux_design_reviewer",
    description: "UX 设计评审工具。评审交互原型、用户旅程及设计系统一致性。",
    inputSchema: {
      type: "object",
      properties: {
        prototype_link: { type: "string", description: "原型链接" },
        user_persona: { type: "string", description: "目标用户画像" },
        focus_areas: { type: "array", items: { type: "string" }, description: "重点评审领域" }
      },
      required: ["prototype_link"]
    }
  },
  {
    name: "devops_pipeline_optimizer",
    description: "DevOps 流水线优化工具。评估 CI/CD 流程、IaC 管理及自动化测试集成。",
    inputSchema: {
      type: "object",
      properties: {
        current_stack: { type: "array", items: { type: "string" }, description: "当前技术栈" },
        deployment_frequency: { type: "string", description: "发布频率" },
        automation_level: { type: "number", description: "自动化程度 (0-1)" }
      }
    }
  }
];

async function main() {
  console.log('Syncing MCP Tools and Skills...');

  // 1. Sync Project Collaboration Platform
  let projectMcpRecord = await prisma.mCPTool.findFirst({
    where: { name: 'Project Collaboration Platform' }
  });

  if (!projectMcpRecord) {
    projectMcpRecord = await prisma.mCPTool.create({
      data: {
        name: 'Project Collaboration Platform',
        description: 'Comprehensive project management and agent collaboration tools',
        isBuiltIn: true,
        type: 'REST',
        publisher: 'Uxin',
        rating: 5.0,
        avatar: 'https://cdn-icons-png.flaticon.com/512/1087/1087927.png'
      }
    });
    console.log('Created Project Collaboration Platform MCP');
  } else {
    // Optional: Update if exists
    await prisma.mCPTool.update({
        where: { id: projectMcpRecord.id },
        data: {
            description: 'Comprehensive project management and agent collaboration tools',
            isBuiltIn: true,
            publisher: 'Uxin',
        }
    });
    console.log('Project Collaboration Platform MCP updated');
  }

  // Sync Project Tools as Skills
  for (const tool of projectCollaborationTools) {
    const existingSkill = await prisma.skill.findFirst({
      where: {
        mcpToolId: projectMcpRecord.id,
        name: tool.name
      }
    });

    if (existingSkill) {
      await prisma.skill.update({
        where: { id: existingSkill.id },
        data: {
          description: tool.description,
          parameters: tool.inputSchema as any
        }
      });
      console.log(`Updated skill: ${tool.name}`);
    } else {
      await prisma.skill.create({
        data: {
          mcpToolId: projectMcpRecord.id,
          name: tool.name,
          description: tool.description,
          parameters: tool.inputSchema as any
        }
      });
      console.log(`Created skill: ${tool.name}`);
    }
  }

  // 2. Sync Freelancer Network
  let freelancerMcpRecord = await prisma.mCPTool.findFirst({
    where: { name: 'Freelancer Network' }
  });

  if (!freelancerMcpRecord) {
    freelancerMcpRecord = await prisma.mCPTool.create({
      data: {
        name: 'Freelancer Network',
        description: 'Freelancer services, matching, and transaction management',
        isBuiltIn: true,
        type: 'REST',
        publisher: 'Uxin',
        rating: 5.0,
        avatar: 'https://cdn-icons-png.flaticon.com/512/3059/3059956.png' // Placeholder
      }
    });
    console.log('Created Freelancer Network MCP');
  } else {
    console.log('Freelancer Network MCP exists');
  }

  // Sync Freelancer Tools as Skills
  for (const tool of freelancerTools) {
    const existingSkill = await prisma.skill.findFirst({
      where: {
        mcpToolId: freelancerMcpRecord.id,
        name: tool.name
      }
    });

    if (existingSkill) {
      await prisma.skill.update({
        where: { id: existingSkill.id },
        data: {
          description: tool.description,
          parameters: tool.inputSchema as any
        }
      });
      console.log(`Updated skill: ${tool.name}`);
    } else {
      await prisma.skill.create({
        data: {
          mcpToolId: freelancerMcpRecord.id,
          name: tool.name,
          description: tool.description,
          parameters: tool.inputSchema as any
        }
      });
      console.log(`Created skill: ${tool.name}`);
    }
  }

  console.log('Sync completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
