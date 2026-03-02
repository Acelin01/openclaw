import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fix() {
  try {
    console.log('🔧 正在添加 tool.execute 权限...\n');
    
    await prisma.apiClient.updateMany({
      where: { id: '8b77e57e-40b6-47b3-af25-dec755fa81ce' },
      data: { permissionAllowlist: ['*', 'tool.execute'] }
    });
    
    console.log('✅ 权限已更新！\n');
    console.log('📋 权限列表: ["*", "tool.execute"]');
    console.log('\n═══════════════════════════════════════════');
    console.log('✅ 现在可以运行测试:\n');
    console.log('  cd /Users/acelin/Documents/Next/AIGC/openclaw/workspace-xulinyi');
    console.log('  export UXIN_API_TOKEN="milestone-test-cd7818cd63acc044e5da5d76c8544d01"');
    console.log('  node test-chat-lite-milestone-flow.js');
    console.log('═══════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fix();
