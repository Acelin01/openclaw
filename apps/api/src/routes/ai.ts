import express, { Router } from 'express';
import { Request, Response } from 'express';
import { z } from 'zod';
import { DatabaseService } from '../lib/db/service.js';
import { authenticateToken, rateLimit } from '../middleware/auth.js';
import { aiManager, createAICompletion, switchAIProvider, streamAICompletion } from '../services/ai-manager.js';

const router: Router = express.Router();

// Enhanced AI service with intelligent response generation
class AIService {
  private static db = DatabaseService.getInstance();

  // Enhanced prompt analysis using AI
  private static async analyzePromptWithAI(prompt: string) {
    try {
      const systemPrompt = `你是一个专业的服务需求分析专家。请分析用户的服务需求描述，提取以下信息：

1. 服务类别 (website, mobile, design, ecommerce, marketing, other)
2. 预算范围 (如果有具体金额，请提取)
3. 交付时间要求 (如果有具体时间，请提取)
4. 关键功能需求
5. 项目紧急程度 (urgent, normal, low)

请用JSON格式返回分析结果，格式如下：
{
  "category": "website|mobile|design|ecommerce|marketing|other",
  "budgetMin": 数字或null,
  "budgetMax": 数字或null,
  "timeline": "时间描述或null",
  "urgency": "urgent|normal|low",
  "keyFeatures": ["功能1", "功能2"],
  "confidence": 0.0-1.0
}

用户描述: ${prompt}`;

      const completion = await createAICompletion({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        maxTokens: 500,
        responseFormat: { type: "json_object" }
      });

      const content = completion.choices[0]?.message?.content || '{}';
      try {
        const analysis = JSON.parse(content);
        return analysis;
      } catch (parseError) {
        console.error('分析结果JSON解析失败:', parseError, '原始内容:', content);
        // 如果解析失败，尝试从字符串中提取JSON
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        throw parseError;
      }
    } catch (error) {
      console.error(`${aiManager.getProviderName()}分析失败，使用备用分析:`, error);
      return this.analyzePromptFallback(prompt);
    }
  }

  // Fallback analysis method when GPT fails
  private static analyzePromptFallback(prompt: string) {
    const keywords = {
      website: ['网站', '官网', '网页', '站点', 'Web', 'web'],
      mobile: ['APP', '移动', '手机', 'iOS', 'Android', '应用'],
      design: ['设计', 'LOGO', 'UI', 'UX', '界面', '图标'],
      ecommerce: ['电商', '商城', '购物', '在线商店', 'E-commerce'],
      marketing: ['营销', '推广', 'SEO', '广告', '宣传'],
      budget: ['预算', '价格', '费用', '成本', '多少钱'],
      timeline: ['时间', '周期', '多久', '交付', '完成'],
      features: ['功能', '特性', '模块', '组件'],
    };

    const analysis = {
      category: 'website',
      urgency: 'normal',
      budgetMin: 3000,
      budgetMax: 15000,
      timeline: '15-30天',
      keyFeatures: [],
      confidence: 0.5,
    };

    // Analyze category
    for (const [category, words] of Object.entries(keywords)) {
      for (const word of words) {
        if (prompt.includes(word)) {
          switch (category) {
            case 'website':
              analysis.category = 'website';
              analysis.budgetMin = 3000;
              analysis.budgetMax = 15000;
              analysis.timeline = '15-30天';
              break;
            case 'mobile':
              analysis.category = 'mobile';
              analysis.budgetMin = 15000;
              analysis.budgetMax = 50000;
              analysis.timeline = '30-60天';
              break;
            case 'design':
              analysis.category = 'design';
              analysis.budgetMin = 500;
              analysis.budgetMax = 5000;
              analysis.timeline = '3-7天';
              break;
            case 'ecommerce':
              analysis.category = 'ecommerce';
              analysis.budgetMin = 10000;
              analysis.budgetMax = 30000;
              analysis.timeline = '45-90天';
              break;
            case 'marketing':
              analysis.category = 'marketing';
              analysis.budgetMin = 2000;
              analysis.budgetMax = 10000;
              analysis.timeline = '7-30天';
              break;
          }
          analysis.confidence = Math.min(analysis.confidence + 0.2, 1.0);
          break;
        }
      }
    }

    // Analyze budget
    const budgetMatch = prompt.match(/(\d+)[万kK千]?元?/);
    if (budgetMatch && budgetMatch[1]) {
      const amount = parseInt(budgetMatch[1]) * (budgetMatch[0].includes('万') ? 10000 : 1000);
      analysis.budgetMin = amount * 0.8;
      analysis.budgetMax = amount * 1.2;
    }

    // Analyze timeline
    const timelineMatch = prompt.match(/(\d+)[天月周]/);
    if (timelineMatch && timelineMatch[1]) {
      const time = parseInt(timelineMatch[1]);
      const unit = timelineMatch[0].includes('月') ? '月' : timelineMatch[0].includes('周') ? '周' : '天';
      analysis.timeline = `${time}${unit}`;
    }

    return analysis;
  }



  // Generate intelligent quotation based on analysis
  static async generateQuotationFromPrompt(prompt: string, userId?: string) {
    const analysis = await this.analyzePromptWithAI(prompt);
    
    // Get market data for similar services
    let marketData = null;
    if (userId) {
      try {
        const similarServices = await this.db.getQuotations({
          where: { 
            category: analysis.category,
            status: 'ACTIVE'
          },
          take: 5
        });
        
        if (similarServices.length > 0) {
          const avgPrice = similarServices.reduce((sum: number, s: any) => {
            if ('priceAmount' in s && s.priceAmount) return sum + s.priceAmount;
            if ('priceRangeMin' in s && 'priceRangeMax' in s && s.priceRangeMin && s.priceRangeMax) return sum + (s.priceRangeMin + s.priceRangeMax) / 2;
            return sum;
          }, 0) / similarServices.length;
          
          marketData = {
            avgPrice,
            count: similarServices.length,
            priceRange: {
              min: Math.min(...similarServices.map((s: any) => ('priceAmount' in s && s.priceAmount) || ('priceRangeMin' in s && s.priceRangeMin) || 0)),
              max: Math.max(...similarServices.map((s: any) => ('priceAmount' in s && s.priceAmount) || ('priceRangeMax' in s && s.priceRangeMax) || 0))
            }
          };
        }
      } catch (error) {
        console.log('获取市场数据失败:', error);
      }
    }

    // Generate service-specific includes and requirements
    const serviceTemplates = {
      '网站开发': {
        includes: ['响应式设计', 'SEO优化', '后台管理系统', '一年售后服务'],
        excludes: ['域名注册', '服务器托管', '内容撰写'],
        requirements: ['提供公司资料', '提供产品信息', '确定设计风格'],
      },
      'APP开发': {
        includes: ['UI/UX设计', '双平台开发', '功能测试', '上线发布'],
        excludes: ['应用商店费用', '第三方服务费用'],
        requirements: ['提供功能需求', '提供品牌素材', '配合测试'],
      },
      '设计服务': {
        includes: ['原创设计', '多轮修改', '源文件提供', '应用示例'],
        excludes: ['商标注册', '版权登记'],
        requirements: ['提供品牌信息', '确定设计风格', '提供参考资料'],
      },
      '电商平台': {
        includes: ['商品管理系统', '订单系统', '支付集成', '用户管理'],
        excludes: ['支付通道费用', 'SSL证书费用'],
        requirements: ['提供商品信息', '提供支付接口', '确定功能需求'],
      },
      '营销推广': {
        includes: ['策略制定', '内容创作', '渠道投放', '效果分析'],
        excludes: ['广告投放费用', '第三方工具费用'],
        requirements: ['提供产品信息', '确定目标受众', '提供营销预算'],
      },
    };

    const template = (serviceTemplates as any)[analysis.category] || (serviceTemplates as any)['网站开发'];

    // Adjust pricing based on market data and confidence
    let finalPriceRange = {
      min: analysis.budgetMin || 3000,
      max: analysis.budgetMax || 15000,
    };
    if (marketData && marketData.avgPrice > 0) {
      finalPriceRange = {
        min: Math.max(finalPriceRange.min, marketData.avgPrice * 0.8),
        max: Math.max(finalPriceRange.max, marketData.avgPrice * 1.2)
      };
    }

    // Use AI to generate enhanced description and title
    let enhancedContent = null;
    try {
      const systemPrompt = `你是一个专业的服务方案撰写专家。请根据用户需求分析，生成一个专业的服务方案标题和描述。

用户需求: ${prompt}
分析结果: ${JSON.stringify(analysis)}
市场价格参考: ${marketData ? JSON.stringify(marketData) : '无'}

请生成一个专业的服务方案，要求：
1. 标题要简洁专业，突出服务类型
2. 描述要详细具体，体现专业性
3. 要体现对用户需求的理解
4. 语言要符合商务沟通标准

请用JSON格式返回：
{
  "title": "服务方案标题",
  "description": "详细的服务方案描述"
}`;

      const completion = await createAICompletion({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        maxTokens: 800,
        responseFormat: { type: "json_object" }
      });

      enhancedContent = JSON.parse(completion.choices[0]?.message?.content || '{}');
    } catch (error) {
      console.error(`${aiManager.getProviderName()}内容生成失败，使用默认内容:`, error);
    }

    return {
      title: enhancedContent?.title || `${this.getCategoryDisplayName(analysis.category)}服务方案`,
      description: enhancedContent?.description || `基于您的需求分析，我为您生成了专业的${this.getCategoryDisplayName(analysis.category)}服务方案。${prompt.length > 50 ? '您的需求描述很详细，这有助于我们为您提供更精准的服务。' : '建议您提供更详细的需求描述，以便我们为您制定更完善的服务方案。'}`,
      category: this.getCategoryDisplayName(analysis.category),
      priceType: 'RANGE',
      priceRangeMin: Math.round(finalPriceRange.min),
      priceRangeMax: Math.round(finalPriceRange.max),
      deliveryTime: analysis.timeline || '15-30天',
      includes: template.includes,
      excludes: template.excludes,
      requirements: template.requirements,
      aiGenerated: true,
      confidence: analysis.confidence || 0.5,
      marketData: marketData,
      aiProvider: aiManager.getProviderName(), // 记录使用的AI提供商
    };
  }

  // Optimize prompt based on selected agents and context
  static async optimizePrompt(prompt: string, agents: any[], context: any) {
    try {
      const systemPrompt = `你是一个专业的提示词优化专家和需求分析专家。你的目标是将用户简单的描述转化为高质量、专业、结构化的提示词。

优化原则：
1. **结构化思维**：将提示词按照逻辑分块（如：角色设定、任务描述、具体要求、约束条件、输出格式等）。
2. **专业性**：使用行业术语，使内容更加正式和严谨。
3. **上下文融合**：深度结合选中的智能体能力和上下文背景信息。
4. **意图保留**：确保优化后的内容完全覆盖并强化用户的原始意图。
5. **示例引导**：如果适用，可以包含输出示例或模板（如：软件需求文档模板）。

优化要求：
        - 如果用户提到“创建需求”、“开发软件”、“软件开发”等，必须按照以下 7 大核心要素生成详细的 Markdown 结构：
          1. **项目概述**：目标用户、核心业务场景、解决的主要问题、预期价值。
          2. **功能需求**：详细功能模块，包含功能描述、输入/输出要求、业务规则逻辑、用户交互流程。
          3. **非功能需求**：性能指标、安全性要求、兼容性要求、可扩展性设计。
          4. **技术规范**：开发语言/框架/工具链、数据库设计、API 接口规范、部署架构。
          5. **交付物要求**：代码质量标准、文档清单、测试用例覆盖率。
          6. **验收标准**：判定标准、测试场景、性能基准指标。
          7. **项目约束**：开发周期/里程碑、预算限制、第三方依赖。
        - 分析用户输入，建议最匹配的智能体（从现有列表或建议新名称）和上下文背景（从现有列表或建议新标题）。
        - 确保优化后的内容完整、无歧义且可验证。

请分析：
- 用户输入: ${prompt}
- 当前选中智能体: ${JSON.stringify(agents)}
- 当前上下文背景: ${JSON.stringify(context)}

请返回一个JSON对象，包含：
{
  "optimizedPrompt": "优化后的详细提示词内容（使用Markdown格式）",
  "reason": "优化的简要说明",
  "suggestedAgents": ["建议选择的智能体名称列表"],
  "suggestedContext": ["建议关联的上下文标题列表"]
}

注意：optimizedPrompt 必须是高质量的、可直接使用的提示词。`;

      const completion = await createAICompletion({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        maxTokens: 1000,
        responseFormat: { type: "json_object" }
      });

      return JSON.parse(completion.choices[0]?.message?.content || '{}');
    } catch (error) {
      console.error('优化提示词失败:', error);
      return {
        optimizedPrompt: prompt,
        reason: '优化失败，返回原内容',
        suggestedAgents: agents.map((a: any) => a.id),
        suggestedContext: context.map((c: any) => c.id)
      };
    }
  }

  // Helper method to get category display name
  private static getCategoryDisplayName(category: string): string {
    const categoryMap: Record<string, string> = {
      website: '网站开发',
      mobile: 'APP开发',
      design: '设计服务',
      ecommerce: '电商平台',
      marketing: '营销推广',
      other: '定制服务'
    };
    return categoryMap[category] || '定制服务';
  }

  // Generate intelligent inquiry based on analysis
  static async generateInquiryFromPrompt(prompt: string) {
    const analysis = await this.analyzePromptWithAI(prompt);
    
    // Get market data for budget reference
    let marketData = null;
    try {
      const similarInquiries = await this.db.getInquiries({
        where: { 
          category: analysis.category,
          status: 'ACTIVE'
        },
        take: 5
      });
      
      if (similarInquiries.length > 0) {
        const avgBudget = similarInquiries.reduce((sum: number, i: any) => {
          if (i.budgetMin && i.budgetMax) return sum + (i.budgetMin + i.budgetMax) / 2;
          if (i.budgetMin) return sum + i.budgetMin;
          if (i.budgetMax) return sum + i.budgetMax;
          return sum;
        }, 0) / similarInquiries.length;
        
        marketData = {
          avgBudget,
          count: similarInquiries.length,
          budgetRange: {
            min: Math.min(...similarInquiries.map((i: any) => i.budgetMin || 0)),
            max: Math.max(...similarInquiries.map((i: any) => i.budgetMax || 0))
          }
        };
      }
    } catch (error) {
      console.log('获取市场数据失败:', error);
    }

    // Generate inquiry-specific requirements and deliverables
    const inquiryTemplates = {
      '网站开发': {
        requirements: ['响应式设计', 'SEO优化', '快速加载', '易于维护'],
        deliverables: ['完整网站', '源代码', '部署文档', '维护指南'],
      },
      'APP开发': {
        requirements: ['用户注册登录', '数据同步', '推送通知', '离线功能'],
        deliverables: ['双平台APP', '后台管理', 'API接口', '技术文档'],
      },
      '设计服务': {
        requirements: ['现代简洁', '易于识别', '多场景适用', '版权清晰'],
        deliverables: ['设计稿', '源文件', '应用示例', '版权说明'],
      },
      '电商平台': {
        requirements: ['商品管理', '订单处理', '支付集成', '用户系统'],
        deliverables: ['完整平台', '管理后台', '操作手册', '售后服务'],
      },
      '营销推广': {
        requirements: ['目标明确', '渠道多样', '效果可测', '成本可控'],
        deliverables: ['推广方案', '执行报告', '效果分析', '优化建议'],
      },
    };

    const template = (inquiryTemplates as any)[this.getCategoryDisplayName(analysis.category)] || (inquiryTemplates as any)['网站开发'];

    // Adjust budget based on market data and confidence
    let finalBudgetRange = {
      min: analysis.budgetMin || 3000,
      max: analysis.budgetMax || 15000
    };
    if (marketData && marketData.avgBudget > 0) {
      finalBudgetRange = {
        min: Math.max(analysis.budgetMin || 3000, marketData.avgBudget * 0.8),
        max: Math.max(analysis.budgetMax || 15000, marketData.avgBudget * 1.2)
      };
    }

    // Use AI to generate enhanced inquiry content
    let enhancedContent = null;
    try {
      const systemPrompt = `你是一个专业的需求文档撰写专家。请根据用户需求分析，生成一个专业的询价需求文档。

用户需求: ${prompt}
分析结果: ${JSON.stringify(analysis)}
市场价格参考: ${marketData ? JSON.stringify(marketData) : '无'}

请生成一个专业的需求文档，要求：
1. 标题要清晰明确，体现需求类型
2. 描述要具体详细，便于服务商理解
3. 要体现对项目的专业理解
4. 语言要符合商务沟通标准

请用JSON格式返回：
{
  "title": "需求文档标题",
  "description": "详细的需求描述"
}`;

      const completion = await createAICompletion({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        maxTokens: 800,
        responseFormat: { type: "json_object" }
      });

      enhancedContent = JSON.parse(completion.choices[0]?.message?.content || '{}');
    } catch (error) {
      console.error(`${aiManager.getProviderName()}询价内容生成失败，使用默认内容:`, error);
    }

    return {
      title: enhancedContent?.title || `${this.getCategoryDisplayName(analysis.category)}需求`,
      description: enhancedContent?.description || `基于您的需求分析，我为您生成了专业的${this.getCategoryDisplayName(analysis.category)}需求文档。${prompt.length > 50 ? '您的需求描述很详细，这有助于服务商更好地理解您的需求。' : '建议您提供更详细的需求描述，以便服务商为您制定更完善的服务方案。'}`,
      category: this.getCategoryDisplayName(analysis.category),
      budgetMin: Math.round(finalBudgetRange.min),
      budgetMax: Math.round(finalBudgetRange.max),
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后
      requirements: template.requirements,
      deliverables: template.deliverables,
      location: '全国',
      aiGenerated: true,
      confidence: analysis.confidence || 0.5,
      marketData: marketData,
      aiProvider: aiManager.getProviderName(), // 记录使用的AI提供商
    };
  }

  // Enhanced chat response with context awareness using GPT-4
  static async generateChatResponse(message: string, context: any, userId?: string, chatService?: any) {
    // Analyze current conversation context
    const analysis = await this.analyzePromptWithAI(message);
    
    // Get user history if available
    let userHistory = null;
    if (userId) {
      try {
        const recentConversations = await this.db.getAIConversations({
          where: { userId },
          take: 5,
          orderBy: { createdAt: 'desc' }
        });
        
        if (recentConversations.length > 0) {
          userHistory = {
            recentServices: recentConversations.filter((c: any) => c.type === 'QUOTATION').length,
            recentInquiries: recentConversations.filter((c: any) => c.type === 'INQUIRY').length,
            totalConversations: recentConversations.length
          };
        }
      } catch (error) {
        console.log('获取用户历史失败:', error);
      }
    }

    // Use GPT-4 to generate dynamic, contextual responses
    let gptResponse = null;
    try {
      const agentPrompt = context?.agentPrompt || '你是一个专业的AI助手，专门帮助用户创建报价单和询价单。';
      let senderInfo = '';
      
      if (context?.senderAgentId) {
        try {
          const senderAgent = await this.db.getAgentById(context.senderAgentId);
          if (senderAgent) {
            senderInfo = `这条消息是由另一位智能体（${senderAgent.name}，角色为：${senderAgent.role || '未设置'}）分析后发送给你的。
发送者背景/分析逻辑: ${senderAgent.prompt || '未提供'}
发送者回复的内容即为本次输入描述，请你基于此信息进行进一步的专业处理或回复。`;
          }
        } catch (err) {
          console.log('获取发送者智能体信息失败:', err);
        }
      }

      const systemPrompt = `${agentPrompt}
${senderInfo}
请根据用户的输入和历史信息，生成一个自然、专业、有帮助的回复。

用户历史信息: ${userHistory ? JSON.stringify(userHistory) : '无历史记录'}
需求分析结果: ${JSON.stringify(analysis)}
当前对话上下文: ${JSON.stringify(context)}

请生成一个自然的回复，要求：
1. 语气要专业友好
2. 内容要有针对性，体现对用户需求的理解
3. 提供3个相关的建议或问题
4. 如果用户有历史记录，要体现个性化的关怀
5. 如果回复中包含复杂流程或操作，请按步骤说明

请用JSON格式返回：
{
  "response": "主要的回复内容",
  "suggestions": ["建议1", "建议2", "建议3"],
  "actions": ["可选的操作指令，如 create_document, create_inquiry"]
}`;

      const completion = await createAICompletion({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        maxTokens: 800,
        responseFormat: { type: "json_object" },
        enableThinking: context?.enableThinking === true
      });

      const content = completion.choices[0]?.message?.content || '{}';
      try {
        gptResponse = JSON.parse(content);
      } catch (parseError) {
        console.warn('GPT回复JSON解析失败，尝试提取内容:', parseError);
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          gptResponse = JSON.parse(jsonMatch[0]);
        }
      }

      // 如果解析后的对象不包含 response 字段，则尝试直接使用 content 作为 response
      if (gptResponse && !gptResponse.response && content.length > 20) {
        gptResponse.response = content;
      }

      // 如果有发送者智能体，说明是协作流程，需要发送通知
      if (context?.senderAgentId && userId && gptResponse?.response) {
        try {
          const receiverAgentId = context.agentId;
          const receiverAgent = receiverAgentId ? await this.db.getAgentById(receiverAgentId) : null;
          const senderAgent = await this.db.getAgentById(context.senderAgentId);
          
          const notification = await this.db.createNotification({
            userId,
            title: `智能体协作完成: ${receiverAgent?.name || 'AI助手'}`,
            content: `${senderAgent?.name || '上游智能体'} 委派的任务已处理完成。回复内容: ${gptResponse.response.substring(0, 50)}${gptResponse.response.length > 50 ? '...' : ''}`,
            type: 'SYSTEM',
            metadata: {
              conversationId: context.conversationId,
              agentId: receiverAgentId,
              senderAgentId: context.senderAgentId,
              type: 'AGENT_COLLABORATION_COMPLETE',
              actionUrl: `/chat/${context.conversationId}`
            }
          });

          if (chatService) {
            chatService.emitNotification(userId, notification);
          }
        } catch (notifyErr) {
          console.error('发送协作完成通知失败:', notifyErr);
        }
      }
    } catch (error) {
      console.error('GPT对话生成失败，使用默认回复:', error);
    }

    // Fallback to static responses if GPT fails
    if (!gptResponse?.response) {
      // Generate contextual responses
      const contextualResponses = {
        greeting: [
          '您好！我是AI助手，专门帮助您创建专业的报价单和询价单。我可以根据您的需求生成标准化的服务文档。',
          '欢迎回来！我看到您之前使用过我们的服务。我可以继续帮助您创建新的报价单或询价单。',
        ],
        quotation: [
          '我可以帮您创建专业的服务报价单。请告诉我您需要的服务类型、预算范围和交付时间要求。',
          '根据市场数据分析，我可以为您推荐合适的服务方案和定价策略。',
        ],
        inquiry: [
          '我可以帮您创建标准化的询价单。请告诉我您需要的产品或服务类型，以及您的具体要求和预算范围。',
          '我会根据市场情况为您推荐合适的预算范围和需求描述。',
        ],
        guidance: [
          '我可以为您提供专业的建议：1) 明确需求描述 2) 设定合理预算 3) 制定交付时间 4) 确定验收标准',
          '建议您提供更详细的需求信息，这样我可以为您生成更精准的文档。',
        ],
      };

      const type = analysis.category === 'other' ? 'greeting' : 'quotation';
      const responses = contextualResponses[type as keyof typeof contextualResponses] || contextualResponses.greeting;
      
      return {
        response: responses[Math.floor(Math.random() * responses.length)],
        suggestions: [
          '如何创建一个专业的报价单？',
          '帮我分析一下目前的市场行情',
          '我想发布一个新的服务需求'
        ],
        actions: [],
        context: {
          lastMessage: message,
          messageCount: (context?.messageCount || 0) + 1,
          category: analysis.category,
          confidence: analysis.confidence
        }
      };
    }

    return {
      response: gptResponse.response,
      suggestions: gptResponse.suggestions || [],
      actions: gptResponse.actions || [],
      context: {
        lastMessage: message,
        messageCount: (context?.messageCount || 0) + 1,
        category: analysis.category,
        confidence: analysis.confidence
      }
    };
  }
}

// Validation schemas
const generateQuotationSchema = z.object({
  prompt: z.string().min(10, '需求描述至少需要10个字符').max(1000, '需求描述不能超过1000个字符'),
  context: z.object({}).optional(),
});

const generateInquirySchema = z.object({
  prompt: z.string().min(10, '需求描述至少需要10个字符').max(1000, '需求描述不能超过1000个字符'),
  context: z.object({}).optional(),
});

const chatSchema = z.object({
  message: z.string().min(1, '消息不能为空').max(1000, '消息不能超过1000个字符'),
  context: z.record(z.any()).optional(),
  agentId: z.string().optional(),
  senderAgentId: z.string().optional(),
  enableThinking: z.boolean().optional(),
  conversationId: z.string().optional(),
});

// Generate quotation via AI (with authentication)
router.post('/generate-quotation', authenticateToken, rateLimit({ windowMs: 15 * 60 * 1000, max: 30, keyGenerator: (r: any) => r.user?.id || r.ip }), async (req: Request, res: Response) => {
  try {
    // 验证输入数据
    const validationResult = generateQuotationSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: '输入数据验证失败',
        errors: validationResult.error.errors
      });
    }

    const { prompt, context } = validationResult.data;
    const userId = (req as any).user.id;

    // 生成AI报价单（使用增强版AI服务）
    const aiQuotation = await AIService.generateQuotationFromPrompt(prompt, userId);

    // 保存AI对话记录
    try {
      const db = DatabaseService.getInstance();
      const conversation = await db.createAIConversation({
        userId,
        type: 'QUOTATION',
        context: { prompt, originalContext: context },
        generatedData: aiQuotation,
        status: 'ACTIVE',
      });

      // 保存用户消息
      await db.createMessage({
        conversationId: conversation.id,
        senderType: 'USER',
        content: prompt,
        messageType: 'TEXT',
      });

      // 保存AI回复
      await db.createMessage({
        conversationId: conversation.id,
        senderType: 'AI',
        content: `已为您生成报价单：${aiQuotation.title}`,
        messageType: 'TEXT',
      });
    } catch (saveError) {
      console.log('保存对话记录失败（非关键错误）:', saveError);
    }

    return res.json({
      success: true,
      data: {
        prompt,
        quotation: aiQuotation,
      },
      message: 'AI报价单生成成功'
    });
  } catch (error) {
    console.error('AI报价单生成错误:', error);
    return res.status(500).json({
      success: false,
      message: 'AI报价单生成失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Generate inquiry via AI (with authentication)
router.post('/generate-inquiry', authenticateToken, rateLimit({ windowMs: 15 * 60 * 1000, max: 30, keyGenerator: (r: any) => r.user?.id || r.ip }), async (req: Request, res: Response) => {
  try {
    // 验证输入数据
    const validationResult = generateInquirySchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: '输入数据验证失败',
        errors: validationResult.error.errors
      });
    }

    const { prompt, context } = validationResult.data;
    const userId = (req as any).user.id;

    // 生成AI询价单（使用增强版AI服务）
    const aiInquiry = await AIService.generateInquiryFromPrompt(prompt);

    // 保存AI对话记录
    try {
      const db = DatabaseService.getInstance();
      const conversation = await db.createAIConversation({
        userId,
        type: 'INQUIRY',
        context: { prompt, originalContext: context },
        generatedData: aiInquiry,
        status: 'ACTIVE',
      });

      // 保存用户消息
      await db.createMessage({
        conversationId: conversation.id,
        senderType: 'USER',
        content: prompt,
        messageType: 'TEXT',
      });

      // 保存AI回复
      await db.createMessage({
        conversationId: conversation.id,
        senderType: 'AI',
        content: `已为您生成询价单：${aiInquiry.title}`,
        messageType: 'TEXT',
      });
    } catch (saveError) {
      console.log('保存对话记录失败（非关键错误）:', saveError);
    }

    return res.json({
      success: true,
      data: {
        prompt,
        inquiry: aiInquiry,
      },
      message: 'AI询价单生成成功'
    });
  } catch (error) {
    console.error('AI询价单生成错误:', error);
    return res.status(500).json({
      success: false,
      message: 'AI询价单生成失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Chat with AI assistant (with authentication)
router.post('/chat', authenticateToken, rateLimit({ windowMs: 15 * 60 * 1000, max: 60, keyGenerator: (r: any) => r.user?.id || r.ip }), async (req: Request, res: Response) => {
  try {
    // 验证输入数据
    const validationResult = chatSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: '输入数据验证失败',
        errors: validationResult.error.errors
      });
    }

    const { message, context, agentId, senderAgentId, enableThinking, conversationId } = validationResult.data;
    const body: any = req.body || {};
    const provider: any = body.provider;
    const stream: any = body.stream;
    if (provider && ['openai','deepseek','alibaba'].includes(provider)) {
      switchAIProvider(provider);
    }
    const userId = (req as any).user.id;
    const db = DatabaseService.getInstance();

    // 如果提供了 conversationId，则将其注入到 context 中，以便 generateChatResponse 使用
    const finalContext = { ...context, conversationId: conversationId || context?.conversationId, agentId };

    let agent = null;
    if (agentId) {
      agent = await db.getAgentById(agentId);
    }

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      const messages = [];
      if (agent?.prompt) {
        messages.push({ role: 'system', content: agent.prompt });
      }
      messages.push({ role: 'user', content: message });

      const s = await streamAICompletion({
        messages,
        enableThinking: !!enableThinking
      });
      for await (const chunk of s as any) {
        const delta = chunk?.choices?.[0]?.delta;
        if (delta && delta.reasoning_content !== undefined && delta.reasoning_content !== null) {
          res.write(`event: reasoning\ndata: ${JSON.stringify({ content: delta.reasoning_content })}\n\n`);
        }
        if (delta && delta.content) {
          res.write(`event: content\ndata: ${JSON.stringify({ content: delta.content })}\n\n`);
        }
      }
      res.write(`event: done\ndata: {}\n\n`);
      res.end();
      return;
    }

    const chatService = req.app.get('chatService');
    const aiResponse = await AIService.generateChatResponse(message, { ...finalContext, enableThinking: !!enableThinking, agentPrompt: agent?.prompt, senderAgentId }, userId, chatService);

    // 如果 AI 返回了 actions，可以在这里执行相应的工具调用
    const actions = (aiResponse as any).actions;
    if (actions && Array.isArray(actions) && actions.length > 0) {
      console.log('AI 请求执行操作:', actions);
      // TODO: 实现具体的工具调用逻辑，例如：
      if (actions.includes('create_document')) {
        // 调用创建文档的逻辑
        const aiQuotation = await AIService.generateQuotationFromPrompt(message, userId);
        (aiResponse as any).generatedData = aiQuotation;
        (aiResponse as any).response += `\n\n已为您生成了相关的服务方案：${aiQuotation.title}`;
      }
    }

    // 保存AI对话记录
    try {
      let conversation;
      if (conversationId) {
        conversation = await db.getAIConversationById(conversationId);
        if (conversation && conversation.userId !== userId) {
          conversation = null; // 越权访问保护
        }
      }

      if (!conversation) {
        // 如果没有提供 conversationId 或找不到，尝试查找该用户的最后一个 GENERAL 对话
        const conversations = await db.getAIConversations({
          where: {
            userId,
            type: 'GENERAL',
            status: 'ACTIVE',
          },
          orderBy: { updatedAt: 'desc' },
          take: 1
        });
        conversation = conversations[0];
      }

      if (!conversation) {
        conversation = await db.createAIConversation({
          userId,
          type: 'GENERAL',
          context: { initialContext: context },
          status: 'ACTIVE',
        });
      }

      const finalConversationId = conversation.id;
      (req as any).finalConversationId = finalConversationId;
      if (!finalConversationId) {
        throw new Error('Failed to get conversation ID');
      }

      // 保存用户消息
      await db.createMessage({
        conversationId: finalConversationId,
        senderType: 'USER',
        content: message,
        messageType: 'TEXT',
      });

      // 保存AI回复
      await db.createMessage({
        conversationId: finalConversationId,
        senderType: 'AI',
        content: aiResponse.response,
        messageType: 'TEXT',
      });

      // 如果是跨智能体协作（有 senderAgentId），发送通知给用户
      if (senderAgentId) {
        await db.createNotification({
          userId,
          title: agent ? `${agent.name} 已完成处理` : '智能体任务处理完成',
          content: aiResponse.response.length > 50 
            ? aiResponse.response.substring(0, 50) + '...' 
            : aiResponse.response,
          type: 'MESSAGE',
          metadata: {
            conversationId: finalConversationId,
            agentId,
            senderAgentId,
            jumpTo: 'ai-chat',
            actionUrl: `/ai-assistant?conversationId=${finalConversationId}`
          }
        });
        console.log(`已为用户 ${userId} 创建智能体协作通知: ${finalConversationId}`);
      }
    } catch (saveError) {
      console.log('保存对话记录失败（非关键错误）:', saveError);
    }

    return res.json({
      success: true,
      data: {
        message,
        response: aiResponse.response,
        suggestions: aiResponse.suggestions,
        actions: (aiResponse as any).actions,
        generatedData: (aiResponse as any).generatedData,
        context: aiResponse.context,
        conversationId: (req as any).finalConversationId,
      },
      message: 'AI对话成功'
    });
  } catch (error) {
    console.error('AI对话错误:', error);
      return res.status(500).json({
        success: false,
        message: 'AI对话失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

/**
 * @route POST /api/v1/ai/optimize-prompt
 * @desc Optimize user prompt based on agents and context
 */
router.post('/optimize-prompt', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { prompt, agents, context } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: '提示词内容不能为空'
      });
    }

    const result = await AIService.optimizePrompt(prompt, agents || [], context || []);

    return res.json({
      success: true,
      data: result,
      message: '提示词优化成功'
    });
  } catch (error) {
    console.error('优化提示词错误:', error);
    return res.status(500).json({
      success: false,
      message: '优化提示词失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
