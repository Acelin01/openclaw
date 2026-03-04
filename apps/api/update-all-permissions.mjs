import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function update() {
  try {
    console.log('🔧 正在更新所有工具权限...\n');
    
    // 所有需要授权的工具
    const allTools = [
      // 项目管理
      'project_list', 'project_get', 'project_create', 'project_update', 'project_delete', 'project_overview',
      // 需求管理
      'requirement_list', 'requirement_get', 'requirement_create', 'requirement_update', 'requirement_delete',
      // 任务管理
      'task_list', 'task_get', 'task_create', 'task_update', 'task_delete', 'task_update_status',
      // 缺陷管理
      'defect_list', 'defect_get', 'defect_create', 'defect_update', 'defect_delete',
      // 里程碑管理
      'milestone_list', 'milestone_get', 'milestone_create', 'milestone_update', 'milestone_delete', 'milestone_monitor',
      // 文档管理
      'document_create', 'document_query', 'document_get', 'document_update', 'document_delete', 'document_review',
      // 迭代管理
      'iteration_create', 'iteration_query', 'iteration_get', 'iteration_list', 'iteration_overview',
      'iteration_stats', 'iteration_workitems', 'iteration_workitem_stats', 'iteration_plan',
      'iteration_update', 'iteration_delete',
      // 测试用例
      'test_case_create', 'test_case_query', 'test_case_get', 'test_case_update', 'test_case_delete',
      // 自由职业者
      'resume_create', 'freelancer_register', 'service_create'
    ];
    
    // 获取第一个 API Client
    const client = await prisma.apiClient.findFirst();
    
    if (!client) {
      console.log('❌ 未找到 API Client');
      return;
    }
    
    console.log(`📋 当前 API Client: ${client.name}`);
    console.log(`   当前工具数：${(client.toolAllowlist || []).length}`);
    
    // 更新权限
    await prisma.apiClient.update({
      where: { id: client.id },
      data: {
        toolAllowlist: allTools,
        permissionAllowlist: ['*', 'tool.execute']
      }
    });
    
    console.log('\n✅ 权限已更新！\n');
    console.log(`📊 总工具数：${allTools.length}`);
    console.log('\n工具分类:');
    console.log('  - 项目管理：6 个');
    console.log('  - 需求管理：5 个');
    console.log('  - 任务管理：6 个');
    console.log('  - 缺陷管理：5 个');
    console.log('  - 里程碑管理：6 个');
    console.log('  - 文档管理：6 个');
    console.log('  - 迭代管理：10 个');
    console.log('  - 测试用例：5 个');
    console.log('  - 自由职业者：3 个');
    console.log('\n✅ 现在可以运行测试了！\n');
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

update();
