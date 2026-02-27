import { toolRegistry, getRegisteredTools, getToolsByCapability } from "./registry";

/**
 * 验证工具注册表功能
 */
async function verifyRegistry() {
  console.log('=== 开始验证工具注册表 ===\n');

  // 1. 检查所有工具是否已注册
  const allTools = toolRegistry.getAllTools();
  console.log(`已注册工具总数: ${allTools.length}`);
  
  const expectedTools = [
    'project_create', 'milestone_create', 'requirement_create', 'task_create',
    'resume_create', 'freelancer_register', 'service_create', 'transaction_create'
  ];

  expectedTools.forEach(name => {
    const tool = toolRegistry.getTool(name);
    if (tool) {
      console.log(`✅ 工具 ${name} 已成功注册`);
    } else {
      console.log(`❌ 工具 ${name} 未找到`);
    }
  });

  // 2. 检查能力标签过滤
  console.log('\n--- 验证能力标签过滤 ---');
  const projectTools = getToolsByCapability('project-collaboration');
  console.log(`项目协作工具数量: ${Object.keys(projectTools).length}`);
  
  const freelancerTools = getToolsByCapability('freelancer');
  console.log(`自由职业者工具数量: ${Object.keys(freelancerTools).length}`);

  // 3. 检查 AI SDK 兼容格式
  console.log('\n--- 验证 AI SDK 兼容格式 ---');
  const sdkTools = getRegisteredTools();
  if (sdkTools['project_create'] && typeof sdkTools['project_create'].execute === 'function') {
    console.log('✅ AI SDK 格式转换正确 (包含 execute 方法)');
  } else {
    console.log('❌ AI SDK 格式转换失败');
  }

  console.log('\n=== 验证完成 ===');
}

verifyRegistry().catch(console.error);
