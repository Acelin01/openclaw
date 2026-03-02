import { connectDatabase, prisma } from './src/lib/db/index.ts';

async function updateAllowlist() {
  await connectDatabase();

  if (!prisma) {
    console.log('❌ 数据库不可用');
    return;
  }

  const client = await prisma.apiClient.findFirst({
    where: { name: 'Test API Client' }
  });

  if (!client) {
    console.log('❌ 测试 API 客户端不存在');
    return;
  }

  // 迭代相关工具
  const iterationTools = [
    'iteration_create',
    'iteration_query',
    'iteration_get',
    'iteration_list',
    'iteration_overview',
    'iteration_stats',
    'iteration_workitems',
    'iteration_workitem_stats',
    'iteration_plan',
    'iteration_update',
    'iteration_delete'
  ];

  const currentAllowlist = Array.isArray(client.toolAllowlist) ? client.toolAllowlist : [];
  const newAllowlist = [...new Set([...currentAllowlist, ...iterationTools])];

  await prisma.apiClient.update({
    where: { id: client.id },
    data: { toolAllowlist: newAllowlist }
  });

  console.log('✅ 迭代工具白名单已更新');
  console.log('📋 新增工具:', iterationTools.length);
  console.log('📋 总工具数:', newAllowlist.length);
  console.log('\n新增的迭代工具:');
  iterationTools.forEach(tool => console.log(`  - ${tool}`));

  process.exit(0);
}

updateAllowlist().catch(console.error);
