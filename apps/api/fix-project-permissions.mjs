import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fix() {
  try {
    console.log('🔧 正在修复项目权限配置...\n');
    
    // 获取客户端
    const client = await prisma.apiClient.findFirst({
      where: { id: '8b77e57e-40b6-47b3-af25-dec755fa81ce' }
    });
    
    if (!client) {
      console.log('❌ 未找到 API Client');
      return;
    }
    
    console.log('📋 当前配置:');
    console.log(`  toolAllowlist: ${JSON.stringify(client.toolAllowlist)}`);
    console.log(`  permissionAllowlist: ${JSON.stringify(client.permissionAllowlist)}`);
    console.log('');
    
    // 添加 project.write 权限
    const currentPermissions = client.permissionAllowlist || [];
    if (!currentPermissions.includes('project.write')) {
      currentPermissions.push('project.write');
    }
    if (!currentPermissions.includes('project.read')) {
      currentPermissions.push('project.read');
    }
    
    await prisma.apiClient.update({
      where: { id: client.id },
      data: { permissionAllowlist: currentPermissions }
    });
    
    console.log('✅ 权限已更新！\n');
    console.log('📋 新权限列表:');
    currentPermissions.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p}`);
    });
    console.log('\n═══════════════════════════════════════════');
    console.log('✅ 现在可以运行测试:\n');
    console.log('  cd /Users/acelin/Documents/Next/AIGC/openclaw/workspace-xulinyi');
    console.log('  node test-project-flow.js');
    console.log('═══════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fix();
