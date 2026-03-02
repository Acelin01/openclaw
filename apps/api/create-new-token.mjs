import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function createToken() {
  try {
    console.log('🔧 正在创建新的 API Token...\n');
    
    // 生成新 Token
    const newToken = 'milestone-test-' + crypto.randomBytes(16).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(newToken).digest('hex');
    
    // 创建 Token
    const created = await prisma.apiToken.create({
      data: {
        clientId: '8b77e57e-40b6-47b3-af25-dec755fa81ce',
        name: 'Milestone Test Token',
        tokenHash: tokenHash
      }
    });
    
    console.log('✅ API Token 创建成功！\n');
    console.log('📋 Token 信息:');
    console.log(`  Token: ${newToken}`);
    console.log(`  名称：${created.name}`);
    console.log(`  ID: ${created.id}`);
    console.log(`  Client: Test API Client`);
    console.log(`  工具权限：["milestone_*", "document_*"]`);
    console.log(`  权限范围：["*"]`);
    console.log('\n═══════════════════════════════════════════');
    console.log('✅ 现在可以运行测试:');
    console.log('');
    console.log(`  export UXIN_API_TOKEN="${newToken}"`);
    console.log('  cd /Users/acelin/Documents/Next/AIGC/openclaw/workspace-xulinyi');
    console.log('  node test-chat-lite-milestone-flow.js');
    console.log('═══════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error('\n💡 请检查:');
    console.error('  1. 数据库连接是否正常');
    console.error('  2. API Client 是否存在');
  } finally {
    await prisma.$disconnect();
  }
}

createToken();
