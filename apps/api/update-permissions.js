const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function update() {
  try {
    console.log('🔧 正在配置 API Token 权限...\n');
    const result = await prisma.apiClient.updateMany({
      where: { token: 'test-api-token-12345' },
      data: {
        toolAllowlist: ['milestone_*', 'document_*'],
        permissionAllowlist: ['*']
      }
    });
    console.log('✅ 权限更新成功！\n');
    console.log('📊 更新记录数:', result.count);
    console.log('\n📋 已添加的工具权限:');
    console.log('  ✓ milestone_* - 所有里程碑工具 (10 个)');
    console.log('  ✓ document_* - 所有文档工具 (4 个)');
    console.log('\n📋 权限范围: * (所有权限)');
    console.log('\n═══════════════════════════════════════════');
    console.log('✅ 配置完成！现在可以运行测试:');
    console.log('');
    console.log('  cd /Users/acelin/Documents/Next/AIGC/openclaw/workspace-xulinyi');
    console.log('  export UXIN_API_TOKEN="test-api-token-12345"');
    console.log('  node test-chat-lite-milestone-flow.js');
    console.log('═══════════════════════════════════════════\n');
  } catch (error) {
    console.error('❌ 更新失败:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

update();
