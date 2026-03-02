import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function findTokens() {
  try {
    console.log('🔍 正在查找现有的有效 Token...\n');
    
    const tokens = await prisma.apiToken.findMany({
      include: {
        client: {
          select: {
            id: true,
            name: true,
            toolAllowlist: true,
            permissionAllowlist: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    if (tokens.length === 0) {
      console.log('⚠️  未找到 Token\n');
    } else {
      console.log(`✅ 找到 ${tokens.length} 个 Token:\n`);
      tokens.forEach((t, i) => {
        console.log(`${i + 1}. Token: ${t.token}`);
        console.log(`   名称：${t.name}`);
        console.log(`   Client: ${t.client.name}`);
        console.log(`   工具权限：${JSON.stringify(t.client.toolAllowlist)}`);
        console.log(`   权限范围：${JSON.stringify(t.client.permissionAllowlist)}`);
        console.log('');
      });
      
      console.log('═══════════════════════════════════════════');
      console.log('💡 使用第一个 Token 运行测试:');
      console.log('');
      console.log(`  export UXIN_API_TOKEN="${tokens[0].token}"`);
      console.log('  cd /Users/acelin/Documents/Next/AIGC/openclaw/workspace-xulinyi');
      console.log('  node test-chat-lite-milestone-flow.js');
      console.log('═══════════════════════════════════════════\n');
    }
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

findTokens();
