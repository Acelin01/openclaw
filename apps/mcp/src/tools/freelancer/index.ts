import { CollaborationContext } from "@uxin/agent-lib/collaboration/index";

export const getFreelancerServiceTools = (freelancerSkills: any, baseContext?: Partial<CollaborationContext>) => {
  const context: CollaborationContext = {
    userId: baseContext?.userId || "mcp-system",
    token: baseContext?.token,
    isService: baseContext?.isService,
    onEvent: baseContext?.onEvent,
  };

  return [
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
      },
      handler: async (args: any) => freelancerSkills.resumeManagement.createResume(args, context)
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
      },
      handler: async (args: any) => freelancerSkills.resumeManagement.createPortfolio(args, context)
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
      },
      handler: async (args: any) => freelancerSkills.freelancerManagement.register(args, context)
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
      },
      handler: async (args: any) => freelancerSkills.serviceManagement.createService(args, context)
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
      },
      handler: async (args: any) => freelancerSkills.transactionManagement.createTransaction(args, context)
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
      },
      handler: async (args: any) => freelancerSkills.transactionManagement.createContract(args, context)
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
      },
      handler: async (args: any) => freelancerSkills.transactionManagement.createQuotation(args, context)
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
      },
      handler: async (args: any) => freelancerSkills.transactionManagement.createInquiry(args, context)
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
      },
      handler: async (args: any) => freelancerSkills.performanceManagement.createReview(args, context)
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
      },
      handler: async (args: any) => freelancerSkills.talentMatching.matchTalent(args)
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
      },
      handler: async (args: any) => {
        // 模拟技能分析逻辑，实际应调用更复杂的分析引擎
        const mockSkills = ["React", "TypeScript", "Node.js", "UI/UX", "Project Management"];
        const extracted = mockSkills.filter(s => 
          args.project_description.toLowerCase().includes(s.toLowerCase())
        );
        return {
          success: true,
          skills: extracted.length > 0 ? extracted : ["General Software Engineering"],
          confidence: 0.85,
          domain: args.industry || "Technology"
        };
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
      },
      handler: async (args: any) => {
        return {
          success: true,
          results: [
            { id: "ext-001", name: "Marketplace Talent A", platform: args.platforms?.[0] || "Upwork", match: 0.92 },
            { id: "ext-002", name: "Marketplace Talent B", platform: args.platforms?.[1] || "LinkedIn", match: 0.88 }
          ],
          sync_status: "completed"
        };
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
      },
      handler: async (args: any) => {
        return {
          success: true,
          status: "compliant",
          score: 0.98,
          findings: [],
          recommendations: ["Ensure dispute resolution clause matches regional standards."]
        };
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
      },
      handler: async (args: any) => {
        return {
          success: true,
          strategy: "Data-Driven Growth Optimization",
          recommendations: [
            "Implement multi-stage conversion funnel tracking.",
            "Run A/B test on landing page value proposition.",
            "Analyze churn reasons using cohort analysis."
          ],
          expected_impact: "Medium-High"
        };
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
      },
      handler: async (args: any) => {
        return {
          success: true,
          status: "reviewed",
          score: 0.88,
          findings: [
            "Navigation depth exceeds 3 clicks for core tasks.",
            "Consistency issues in primary action button styling."
          ],
          suggestions: ["Simplify user journey for checkout flow.", "Update design system tokens for better accessibility."]
        };
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
      },
      handler: async (args: any) => {
        return {
          success: true,
          optimizations: [
            "Introduce automated smoke tests in CI stage.",
            "Migrate manual config to Terraform/IaC.",
            "Implement blue-green deployment for zero downtime."
          ],
          estimated_efficiency_gain: "25-35%"
        };
      }
    }
  ];
};
