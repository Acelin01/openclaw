import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function create() {
  try {
    const clients = await prisma.apiClient.findMany();
    if (clients.length === 0) return;
    
    const clientId = clients[0].id;
    
    // 创建 token
    const token = await prisma.apiToken.create({
      data: {
        clientId: clientId,
        token: 'test-api-token-12345',
        name: 'Test Token',
        enabled: true
      }
    });
    
    console.log('✅ Token 创建成功！\n');
    console.log('📋 Token 信息:');
    console.log(`  Token: ${token.token}`);
    console.log(`  Client: ${clientId}`);
    console.log('\n📋 权限:');
    console.log('  ✓ milestone_* (10 个工具)');
    console.log('  ✓ document_* (4 个工具)');
    console.log('  ✓ * (所有权限)');
    console.log('\n═══════════════════════════════════════');
    console.log('✅ 现在可以运行测试:');
    console.log('');
    console.log('  cd /Users/acelin/Documents/Next/AIGC/openclaw/workspace-xulinyi');
    console.log('  export UXIN_API_TOKEN="test-api-token-12345"');
    console.log('  node test-chat-lite-milestone-flow.js');
    console.log('═══════════════════════════════════════\n');
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

create();
