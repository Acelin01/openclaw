import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fix() {
  try {
    console.log('🔧 正在更新工具白名单...\n');
    
    // 完整的里程碑工具列表
    const milestoneTools = [
      'milestone_create',
      'milestone_review',
      'milestone_list',
      'milestone_get',
      'milestone_update',
      'milestone_update_review',
      'milestone_delete',
      'milestone_pending_review',
      'milestone_update_pending_review',
      'milestone_monitor',
      'document_create',
      'document_query',
      'document_get',
      'document_review'
    ];
    
    await prisma.apiClient.updateMany({
      where: { id: '8b77e57e-40b6-47b3-af25-dec755fa81ce' },
      data: { toolAllowlist: milestoneTools }
    });
    
    console.log('✅ 工具白名单已更新！\n');
    console.log('📋 已添加的工具 (14 个):');
    milestoneTools.forEach((t, i) => {
      console.log(`  ${i + 1}. ${t}`);
    });
    console.log('\n═══════════════════════════════════════════');
    console.log('✅ 现在可以运行测试:');
    console.log('');
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
