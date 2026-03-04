import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function update() {
  try {
    console.log('🔧 正在更新项目工具权限...\n');
    
    // 项目工具列表
    const projectTools = [
      'project_list',
      'project_get',
      'project_create',
      'project_update',
      'project_delete',
      'project_overview'
    ];
    
    // 获取当前权限
    const client = await prisma.apiClient.findFirst({
      where: { id: '8b77e57e-40b6-47b3-af25-dec755fa81ce' }
    });
    
    if (!client) {
      console.log('❌ 未找到 API Client');
      return;
    }
    
    // 合并现有权限和新权限
    const currentTools = client.toolAllowlist || [];
    const newTools = [...new Set([...currentTools, ...projectTools])];
    
    await prisma.apiClient.update({
      where: { id: client.id },
      data: { toolAllowlist: newTools }
    });
    
    console.log('✅ 权限已更新！\n');
    console.log('📋 已添加的项目工具:');
    projectTools.forEach((t, i) => {
      console.log(`  ${i + 1}. ${t}`);
    });
    console.log(`\n📊 总工具数：${newTools.length}`);
    console.log('\n═══════════════════════════════════════════');
    console.log('✅ 现在可以运行测试:\n');
    console.log('  cd /Users/acelin/Documents/Next/AIGC/openclaw/workspace-xulinyi');
    console.log('  export UXIN_API_TOKEN="milestone-test-cd7818cd63acc044e5da5d76c8544d01"');
    console.log('  node test-project-flow.js');
    console.log('═══════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

update();
