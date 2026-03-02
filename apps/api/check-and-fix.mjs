import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  try {
    console.log('🔍 检查 Token 和 Client 配置...\n');
    
    // 查找刚创建的 Token
    const token = await prisma.apiToken.findFirst({
      where: { name: 'Milestone Test Token' },
      include: {
        client: true
      }
    });
    
    if (!token) {
      console.log('❌ 未找到 Token');
      return;
    }
    
    console.log('✅ Token 信息:');
    console.log(`  Token ID: ${token.id}`);
    console.log(`  Client ID: ${token.clientId}`);
    console.log(`  Client Name: ${token.client.name}`);
    console.log(`  Client toolAllowlist: ${JSON.stringify(token.client.toolAllowlist)}`);
    console.log(`  Client permissionAllowlist: ${JSON.stringify(token.client.permissionAllowlist)}`);
    console.log('');
    
    // 确认权限
    if (token.client.toolAllowlist && token.client.toolAllowlist.includes('milestone_*')) {
      console.log('✅ 权限配置正确！');
    } else {
      console.log('⚠️  权限可能未生效，正在更新...\n');
      
      await prisma.apiClient.update({
        where: { id: token.clientId },
        data: {
          toolAllowlist: ['milestone_*', 'document_*'],
          permissionAllowlist: ['*']
        }
      });
      
      console.log('✅ 权限已更新！\n');
    }
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
