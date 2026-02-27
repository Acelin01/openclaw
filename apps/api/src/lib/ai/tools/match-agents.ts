import { tool, type UIMessageStreamWriter } from "ai";
import { z } from "zod";
import { AgentMatcher } from "@uxin/agent-lib";
import { UserRole } from "@uxin/mcp";

const requirementSchema = z.object({
  requirement: z.string().describe("详细的需求描述"),
  intent: z.enum(['develop', 'design', 'plan', 'product', 'market']).describe("主要意图分类"),
  requiredSkills: z.array(z.string()).describe("所需的专业技能列表"),
  domain: z.string().describe("业务领域"),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  complexity: z.number().min(1).max(10).default(5).describe("需求复杂度评分 (1-10)"),
});

type RequirementAnalysis = z.infer<typeof requirementSchema>;

export const matchAgentsTool = ({
  session,
  dataStream,
}: {
  session?: any;
  dataStream?: UIMessageStreamWriter;
} = {}) => tool({
  description: "根据用户输入的需求，自动匹配最合适的智能体专家进行协作。",
  inputSchema: requirementSchema,
  execute: async (analysis: RequirementAnalysis) => {
    try {
      if (dataStream) {
        dataStream.write({
          type: "data-step" as any,
          data: "正在分析需求并匹配最佳专家...",
          transient: true,
        });
      }

      // 1. 获取所有可用的智能体 (实际场景应从数据库获取)
      const { DatabaseService } = await import('../../db/service.js');
      const db = DatabaseService.getInstance();
      
      let availableAgents: any[] = [];
      if (db.isAvailable()) {
        // 这里假设有一个方法获取种子智能体或当前用户的智能体
        availableAgents = await db.getAgentsByUserId(session?.user?.id || 'system');
      }

      // 2. 执行匹配逻辑
      const matcher = new AgentMatcher();
      const userRole = (session?.user?.role as UserRole) || UserRole.GUEST;
      
      const matches = await matcher.matchAgents(
        analysis,
        availableAgents,
        userRole,
        3
      );

      if (dataStream) {
        dataStream.write({
          type: "data-kind" as any,
          data: "matching",
        });
        dataStream.write({
          type: "data-title" as any,
          data: `专家匹配建议: ${analysis.domain}`,
        });
        dataStream.write({
          type: "data-agent-matches" as any,
          data: matches,
        });
      }

      const results = matches.map(m => ({
        name: m.agent.name,
        score: Math.round(m.score),
        reasons: m.reasons,
        agentId: m.agent.id
      }));

      return {
        success: true,
        matches: results,
        recommendation: results[0]?.name ?? "未找到完全匹配的专家"
      };
    } catch (error: any) {
      console.error('[matchAgentsTool] Error:', error);
      return {
        success: false,
        error: error.message || String(error)
      };
    }
  },
});
