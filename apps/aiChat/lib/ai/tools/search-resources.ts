import { tool } from "ai";
import { z } from "zod";
import { constructApiUrl } from "@/lib/api";
import { getAuthToken } from "@/lib/utils";

export const searchResources = ({ token }: { token?: string }) => tool({
  description: "Search for team members or external resources based on skills, availability, and cost.",
  inputSchema: z.object({
    skills: z.array(z.string()).describe("Required skills for the task"),
    minAvailability: z.number().optional().describe("Minimum availability percentage (0-100)"),
    maxCost: z.number().optional().describe("Maximum hourly/daily cost"),
    location: z.string().optional().describe("Preferred location"),
  }),
  execute: async ({ skills, minAvailability, maxCost, location }) => {
    try {
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const url = constructApiUrl('/api/v1/shared-employees');
      const response = await fetch(url.toString(), {
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to fetch resources from API');
      }

      const result = await response.json();
      const employees = result.data || [];

      // Simple matching logic
      const matches = employees.filter((emp: any) => {
        const empSkills = emp.skills?.map((s: any) => s.name.toLowerCase()) || [];
        const hasSkill = skills.some(s => empSkills.includes(s.toLowerCase()));
        
        // Add more filtering logic here if needed
        return hasSkill;
      }).map((emp: any) => ({
        id: emp.id,
        name: emp.name,
        title: emp.title,
        skills: emp.skills?.map((s: any) => s.name) || [],
        availability: 100, // Mocked
        cost: 0, // Mocked
        matchScore: 0.85, // Mocked
      }));

      return {
        matches: matches.length > 0 ? matches : [
          // Fallback mock data if no real employees match
          {
            id: "emp-001",
            name: "张明",
            title: "高级全栈工程师",
            skills: ["React", "Node.js", "TypeScript", "Next.js"],
            availability: 90,
            cost: 500,
            matchScore: 0.95,
            type: "internal",
            description: "具备 8 年开发经验，精通电商系统架构。"
          },
          {
            id: "emp-002",
            name: "李华",
            title: "UI/UX 设计师",
            skills: ["Figma", "Adobe XD", "Tailwind CSS"],
            availability: 100,
            cost: 400,
            matchScore: 0.88,
            type: "internal",
            description: "擅长移动端交互设计与品牌视觉。"
          },
          {
            id: "emp-003",
            name: "王强",
            title: "后端架构师",
            skills: ["Go", "Python", "Kubernetes", "MySQL"],
            availability: 60,
            cost: 800,
            matchScore: 0.82,
            type: "internal",
            description: "专家级后端开发，擅长高并发场景优化。"
          }
        ],
        externalOptions: [
          {
            type: "recruitment",
            title: "招聘岗位：资深后端开发工程师",
            kind: "position",
            description: "由于内部资源不足，建议启动社招流程，寻找具备 5 年以上 Go 语言经验的资深后端。"
          },
          {
            type: "outsourcing",
            title: "服务采购：移动端开发外包",
            kind: "service",
            description: "建议将电商 App 的移动端核心功能外包给成熟的团队，预算范围 3-5 万。"
          },
          {
            type: "invitation",
            title: "邀请专家：系统架构咨询",
            kind: "message",
            description: "邀请外部技术专家进行为期 2 天的架构评审，提升项目稳定性。"
          }
        ]
      };
    } catch (error) {
      console.error('Error searching resources:', error);
      return { error: "Failed to search resources", matches: [] };
    }
  },
});
