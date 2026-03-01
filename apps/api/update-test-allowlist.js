/**
 * 更新测试 API 客户端的工具白名单
 */

import { connectDatabase, prisma } from './src/lib/db/index.ts';

async function updateAllowlist() {
  await connectDatabase();

  if (!prisma) {
    console.log('❌ 数据库不可用');
    return;
  }

  console.log('✅ 数据库连接成功');

  // 获取测试 API 客户端
  const client = await prisma.apiClient.findFirst({
    where: { name: 'Test API Client' }
  });

  if (!client) {
    console.log('❌ 测试 API 客户端不存在');
    return;
  }

  console.log('📋 Client ID:', client.id);
  console.log('📋 当前白名单:', client.toolAllowlist);

  // 测试用例工具列表
  const testTools = [
    'test_case_create', 'test_case_query', 'test_case_get',
    'test_case_update', 'test_case_delete', 'test_case_submit_review',
    'test_case_review', 'test_case_execute', 'test_case_get_executions',
    'test_case_stats', 'test_case_batch_create'
  ];

  const currentAllowlist = Array.isArray(client.toolAllowlist) ? client.toolAllowlist : [];
  const newAllowlist = [...new Set([...currentAllowlist, ...testTools])];

  await prisma.apiClient.update({
    where: { id: client.id },
    data: { toolAllowlist: newAllowlist }
  });

  console.log('✅ 白名单已更新');
  console.log('📋 新白名单工具数:', newAllowlist.length);
  console.log('📋 新增测试工具:', testTools.length);

  process.exit(0);
}

updateAllowlist().catch(console.error);
