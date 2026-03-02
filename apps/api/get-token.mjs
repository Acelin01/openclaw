import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function getToken() {
  try {
    console.log('🔍 正在查询 API Token...\n');
    
    // 查询 api_tokens 表
    const tokens = await prisma.apiToken.findMany({
      where: {
        clientId: '8b77e57e-40b6-47b3-af25-dec755fa81ce'
      },
      select: {
        id: true,
        name: true,
        tokenHash: true,
        createdAt: true,
        client: {
          select: {
            name: true,
            toolAllowlist: true,
            permissionAllowlist: true
          }
        }
      }
    });
    
    if (tokens.length === 0) {
      console.log('⚠️  未找到 Token，正在创建...\n');
      
      // 创建新 Token
      const crypto = require('crypto');
      const newToken = 'milestone-test-' + crypto.randomBytes(16).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(newToken).digest('hex');
      
      const created = await prisma.apiToken.create({
        data: {
          clientId: '8b77e57e-40b6-47b3-af25-dec755fa81ce',
          name: 'Milestone Test Token',
          tokenHash: tokenHash
        }
      });
      
      console.log('✅ Token 创建成功！\n');
      console.log('📋 Token 信息:');
      console.log(`  Token: ${newToken}`);
      console.log(`  名称：${created.name}`);
      console.log(`  ID: ${created.id}`);
      console.log('\n═══════════════════════════════════════════');
      console.log('✅ 现在可以运行测试:');
      console.log('');
      console.log(`  export UXIN_API_TOKEN="${newToken}"`);
      console.log('  cd /Users/acelin/Documents/Next/AIGC/openclaw/workspace-xulinyi');
      console.log('  node test-chat-lite-milestone-flow.js');
      console.log('═══════════════════════════════════════════\n');
      
    } else {
      console.log(`✅ 找到 ${tokens.length} 个 Token:\n`);
      tokens.forEach((t, i) => {
        console.log(`${i + 1}. Token ID: ${t.id}`);
        console.log(`   名称：${t.name}`);
        console.log(`   Client: ${t.client.name}`);
        console.log(`   工具权限：${JSON.stringify(t.client.toolAllowlist)}`);
        console.log(`   权限范围：${JSON.stringify(t.client.permissionAllowlist)}`);
        console.log(`   创建时间：${t.createdAt}`);
        console.log(`   TokenHash: ${t.tokenHash.substring(0, 20)}...`);
        console.log('');
      });
      
      console.log('⚠️  注意：Token 值已哈希存储，无法直接查看\n');
      console.log('💡  建议：创建新 Token 以获取明文值\n');
    }
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

getToken();
