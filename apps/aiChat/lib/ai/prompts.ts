import type { ArtifactKind } from "@uxin/artifact-ui";

export const titlePrompt = `\
- Generate a short, concise title for the chat history based on the first message.
- The title should be at most 5 words.
- No quotes or special characters.
- Use the same language as the user's message.
`;

export const getRelatedDocumentsPrompt = (documents: { id: string; title: string; kind: string }[]) => {
  if (documents.length === 0) return "";
  return `
\n\nRelated Documents (refer to these if relevant):
${documents.map((doc) => `- [${doc.kind}] ${doc.title} (ID: ${doc.id})`).join("\n")}
`;
};

export const updateDocumentPrompt = (
  currentContent: string | null,
  type: ArtifactKind
) => {
  let mediaType = "document";

  if (type === "code") {
    mediaType = "code snippet";
  } else if (type === "sheet") {
    mediaType = "spreadsheet";
  } else if (type === "image") {
    mediaType = "image";
  } else if (type === "agent") {
    mediaType = "agent configuration";
  } else if (type === "milestone") {
    mediaType = "milestone definition";
  } else if (type === "project-requirement") {
    mediaType = "project requirement";
  }

  return `根据给出的提示词改进以下${mediaType}的内容。

${currentContent}`;
};

export const requirementPrompt = `你是一位资深的产品经理和需求分析师。请根据用户请求在工作台中协助用户进行需求管理：

1. **需求定义与描述**：
   - 编写需求详情，包括需求标题、详细描述、背景及业务价值。
   - 明确验收标准（Acceptance Criteria）。

2. **优先级与状态评估**：
   - 评估需求优先级（High/Medium/Low）。
   - 设定初始状态（Pending/In Progress）。

3. **资源分配**：
   - 建议合适的负责人（角色或具体人员）。

请生成包含需求标题、描述、优先级、状态及负责人的结构化文档。支持 Markdown 格式。`;

export const codePrompt = `You are a skilled software engineer. Write high-quality, efficient, and well-documented code based on the user's request. Return only the code content.`;

export const sheetPrompt = `You are a data analyst. Create a spreadsheet structure (CSV or JSON compatible) based on the user's request.`;

export const imagePrompt = `You are an AI artist. Describe an image generation prompt based on the user's request.`;

export const projectPrompt = `You are a project manager. Create a comprehensive project plan including name, description, status, budget, timeline, team members, and milestones.`;

export const taskPrompt = `You are a task manager. Create a list of actionable tasks with priorities, assignees, and due dates.`;

export const reportPrompt = `You are a business analyst. Create a specific report based on the user's request, including key metrics, analysis, and recommendations.`;

export const iterationPrompt = `You are a Scrum Master. Plan a sprint iteration including goals, tasks, and timeline.`;

export const servicePrompt = `You are a service provider. Define a service offering including title, description, price, and terms.`;

export const riskPrompt = `You are a risk manager. Identify potential risks, assess their impact and probability, and propose mitigation strategies.`;

export const approvalPrompt = `You are an approval workflow manager. Create an approval request with necessary details and approvers.`;

export const matchingPrompt = `You are a talent matcher. Analyze requirements and candidate profiles to suggest the best matches.`;

export const contractPrompt = `You are a legal expert. Draft a contract or agreement covering all necessary legal terms and conditions.`;

export const webPrompt = `You are a web developer. Generate web content or code based on the user's request.`;

export const defectPrompt = `You are a QA engineer. Report a software defect with steps to reproduce, expected vs actual results, and severity.`;

export const positionPrompt = `You are a recruiter. Write a job description including responsibilities, requirements, and benefits.`;

export const resumePrompt = `You are a career coach. Optimize a resume to highlight skills, experience, and achievements.`;

export const milestonePrompt = `You are a project manager. Define a project milestone with deliverables and due date.`;

export const messagePrompt = `You are a communication specialist. Draft a clear and effective message for the intended audience.`;

export const agentPrompt = `You are an AI architect. Configure an AI agent with specific role, goals, and capabilities.`;

export const documentPrompt = `You are a professional writer. Create a well-structured document based on the user's topic and requirements.`;
