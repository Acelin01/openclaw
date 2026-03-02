/**
 * 直接测试迭代工具（不通过 MCP 路由）
 */

import { DatabaseService } from './src/lib/db/service.js';

async function testIterationTools() {
  console.log('=== 测试迭代工具 ===\n');
  
  const db = DatabaseService.getInstance();
  
  if (!db.isAvailable()) {
    console.log('❌ 数据库不可用');
    return;
  }
  
  console.log('✅ 数据库可用\n');
  
  // 测试 1: 查询迭代列表
  console.log('1️⃣ 查询迭代列表...');
  try {
    const iterations = await db.iterationService.getIterations({ projectId: 'proj-uxin' }, { limit: 5 });
    console.log('✅ 成功');
    console.log('   迭代数量:', iterations.length);
    if (iterations.length > 0) {
      console.log('   第一个迭代:', iterations[0].name);
    }
  } catch (error) {
    console.log('❌ 失败:', error.message);
  }
  
  // 测试 2: 创建迭代
  console.log('\n2️⃣ 创建测试迭代...');
  try {
    const iteration = await db.iterationService.createIteration({
      title: '测试迭代 Sprint Test',
      projectId: 'proj-uxin',
      startDate: '2026-03-01',
      endDate: '2026-03-15',
      description: '测试用途',
      ownerId: 'seed-user-linyi'
    });
    console.log('✅ 成功');
    console.log('   迭代 ID:', iteration.id);
    console.log('   迭代名称:', iteration.name);
  } catch (error) {
    console.log('❌ 失败:', error.message);
  }
  
  console.log('\n=== 测试完成 ===');
  process.exit(0);
}

testIterationTools().catch(console.error);
