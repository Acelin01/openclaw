
import { DatabaseService } from './lib/db/service';
import { connectDatabase } from './lib/db';

async function main() {
  await connectDatabase();
  const db = DatabaseService.getInstance();
  try {
    const projects = await db.getProjects({});
    if (projects.length === 0) {
      console.log('没有找到任何项目。');
      return;
    }

    console.log(`共找到 ${projects.length} 个项目。\n`);

    for (const project of projects) {
      console.log(`--------------------------------------------------`);
      console.log(`项目: ${project.name} (ID: ${project.id})`);
      
      const tasks = await db.getProjectTasks({ projectId: project.id });
      if (tasks.length === 0) {
        console.log('该项目下没有待办任务。');
      } else {
        console.log(`待办任务 (${tasks.length} 个):`);
        tasks.forEach((task: any, index: number) => {
          console.log(`${index + 1}. [${task.status}] ${task.title} - ${task.description || '无描述'}`);
          console.log(`   负责人: ${task.assignee?.name || '未分配'}, 优先级: ${task.priority}, 预计工时: ${task.estimatedHours || 0}h`);
        });
      }
      console.log(`--------------------------------------------------\n`);
    }
  } catch (error) {
    console.error('查询失败:', error);
  }
}

main();
