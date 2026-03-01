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

  const docTools = [
    'document_create', 'document_query', 'document_get',
    'document_update', 'document_delete', 'document_review', 'document_stats'
  ];

  const currentAllowlist = Array.isArray(client.toolAllowlist) ? client.toolAllowlist : [];
  const newAllowlist = [...new Set([...currentAllowlist, ...docTools])];

  await prisma.apiClient.update({
    where: { id: client.id },
    data: { toolAllowlist: newAllowlist }
  });

  console.log('✅ 白名单已更新');
  console.log('📋 新增文档工具:', docTools.length);
  console.log('📋 总工具数:', newAllowlist.length);

  process.exit(0);
}

updateAllowlist().catch(console.error);
