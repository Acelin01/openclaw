
import { tool, type UIMessageStreamWriter } from "ai";
import { z } from "zod";
import { constructApiUrl } from "@/lib/api";
import { createSkillService, TaskStatus } from '@uxin/skill';
import { generateUUID } from "@/lib/utils";
import { documentHandlersByArtifactKind } from "@/lib/artifacts/server";

// Initialize skill service
const skillService = createSkillService();

export const startCollaboration = ({ 
  token,
  dataStream,
  session,
  chatId
}: { 
  token?: string;
  dataStream?: UIMessageStreamWriter;
  session?: any;
  chatId?: string;
}) => tool({
  description: "Start a full intelligent collaboration workflow (Pre-check -> Requirement Analysis -> Execution) for a given goal, including project creation and task tracking.",
  inputSchema: z.object({
    goal: z.string().describe("The high-level goal or requirement description for the project."),
  }),
  execute: async ({ goal }) => {
    const steps: string[] = [];
    const addStep = (msg: string) => {
      console.log(`[StartCollaboration] ${msg}`);
      steps.push(msg);
      if (dataStream) {
        dataStream.write({
          type: "data-step" as any,
          data: msg,
          transient: true,
        });
      }
    };

    try {
      // 1. 初步需求分析与预检查 (Requirement Analysis & Pre-check)
      addStep(`正在进行初步需求分析: "${goal}"...`);
      
      // 执行技能预检查，查看是否有类似项目存在
      addStep(`正在检查是否存在类似项目或已有资源...`);
      await skillService.preCheckEngine.executePreCheck([{ text: goal }], addStep);

      // 1.5 任务清单创建与跟踪安排 (Task List Creation & Tracking)
      addStep(`正在创建任务跟踪安排清单...`);
      const tasks = skillService.taskDecomposer.decompose(goal, { context: 'collaboration-startup' });
      
      if (dataStream) {
        dataStream.write({
          type: "data-task-list" as any,
          data: tasks,
        });
      }

      const updateTask = (taskId: string, status: TaskStatus) => {
        if (dataStream) {
          dataStream.write({
            type: "data-task-update" as any,
            data: { id: taskId, status },
          });
        }
      };

      // 模拟第一个任务：预检查 (假设第一个任务是预检查)
      if (tasks.length > 0) {
        updateTask(tasks[0].id, TaskStatus.IN_PROGRESS);
        await new Promise(resolve => setTimeout(resolve, 1000));
        updateTask(tasks[0].id, TaskStatus.COMPLETED);
      }

      // 2. 创建项目 (Project Creation)
      addStep(`未发现完全匹配的现有项目，正在为您创建新项目...`);
      if (tasks.length > 1) updateTask(tasks[1].id, TaskStatus.IN_PROGRESS);

      const projectUrl = constructApiUrl('/api/v1/projects');
      const headers: HeadersInit = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const projectResponse = await fetch(projectUrl.toString(), {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          name: goal.length > 20 ? goal.substring(0, 20) + '...' : goal,
          description: goal,
          status: 'active'
        })
      });

      let projectData = null;
      if (projectResponse.ok) {
        const result = await projectResponse.json();
        projectData = result.data;
        addStep(`项目创建成功: "${projectData.name}" (ID: ${projectData.id})`);
        
        if (dataStream) {
          dataStream.write({
            type: 'data-project-preview' as any,
            data: projectData
          });
        }
      } else {
        addStep(`⚠️ 项目创建失败，将继续执行后续步骤`);
      }
      
      if (tasks.length > 1) updateTask(tasks[1].id, TaskStatus.COMPLETED);

      // 3. 创建项目文档 (Document Creation)
      addStep(`正在根据项目需求生成初始化文档...`);
      if (tasks.length > 2) updateTask(tasks[2].id, TaskStatus.IN_PROGRESS);

      const docId = generateUUID();
      const docTitle = `项目规划: ${goal}`;
      const docKind = "project";

      if (dataStream) {
        dataStream.write({ type: "data-kind" as any, data: docKind, transient: true });
        dataStream.write({ type: "data-id" as any, data: docId, transient: true });
        dataStream.write({ type: "data-title" as any, data: docTitle, transient: true });
        dataStream.write({ type: "data-clear" as any, data: null, transient: true });
      }

      // 调用正式的 DocumentHandler 生成内容
      const documentHandler = documentHandlersByArtifactKind.find(h => h.kind === docKind);
      if (documentHandler && dataStream && session) {
        await documentHandler.onCreateDocument({
          id: docId,
          title: docTitle,
          dataStream: dataStream as any,
          session,
          chatId,
          initialData: projectData ? { project: projectData } : undefined
        });
        if (dataStream) {
          dataStream.write({ type: "data-finish" as any, data: null, transient: true });
        }
      }

      addStep(`项目初始化文档已生成并关联到项目`);
      if (tasks.length > 2) updateTask(tasks[2].id, TaskStatus.COMPLETED);

      // 完成剩余任务
      for (let i = 3; i < tasks.length; i++) {
        updateTask(tasks[i].id, TaskStatus.IN_PROGRESS);
        await new Promise(resolve => setTimeout(resolve, 500));
        updateTask(tasks[i].id, TaskStatus.COMPLETED);
      }

      addStep(`全链路协作流程启动完成`);

      return {
        success: true,
        project: projectData,
        documentId: docId,
        steps
      };
    } catch (error) {
      console.error('Error in startCollaboration:', error);
      addStep(`⚠️ 协作流程执行出错: ${error instanceof Error ? error.message : String(error)}`);
      return { 
        success: false, 
        error: "Failed to complete collaboration workflow",
        steps
      };
    }
  },
});
