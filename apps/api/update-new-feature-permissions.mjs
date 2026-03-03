import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function update() {
  try {
    console.log('🔧 正在更新新功能工具权限...\n');
    
    // 新增工具
    const newTools = [
      'project_metric_query',
      'workhour_query',
      'test_plan_list',
      'test_plan_overview',
      'test_plan_cases'
    ];
    
    const client = await prisma.apiClient.findFirst();
    if (!client) {
      console.log('❌ 未找到 API Client');
      return;
    }
    
    const currentTools = client.toolAllowlist || [];
    const allTools = [...new Set([...currentTools, ...newTools])];
    
    await prisma.apiClient.update({
      where: { id: client.id },
      data: {
        toolAllowlist: allTools,
        permissionAllowlist: ['*', 'tool.execute']
      }
    });
    
    console.log('✅ 权限已更新！\n');
    console.log(`📊 总工具数：${allTools.length}`);
    console.log('\n新增工具:');
    newTools.forEach((t, i) => {
      console.log(`  ${i + 1}. ${t}`);
    });
    console.log('\n✅ 现在可以运行测试了！\n');
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

update();
