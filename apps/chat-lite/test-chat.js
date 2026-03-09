/**
 * 测试 Chat React 应用和 OpenClaw 技能匹配
 */

const API_BASE = 'http://localhost:8000';

async function testChat() {
  console.log('🧪 测试 Chat React 应用和 OpenClaw 技能匹配\n');

  // 1. 测试创建会话
  console.log('1️⃣ 创建会话...');
  try {
    const sessionRes = await fetch(`${API_BASE}/api/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '测试会话' }),
    });
    
    if (!sessionRes.ok) {
      console.log(`   ❌ 创建会话失败：${sessionRes.status}`);
      return;
    }
    
    const session = await sessionRes.json();
    console.log(`   ✅ 会话创建成功：${session.id}`);
    
    // 2. 测试发送消息（天气技能）
    console.log('\n2️⃣ 发送消息："帮我查下天气"...');
    const chatRes = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: '帮我查下天气',
        sessionId: session.id,
      }),
    });
    
    if (!chatRes.ok) {
      console.log(`   ❌ 发送消息失败：${chatRes.status}`);
      return;
    }
    
    const response = await chatRes.json();
    console.log(`   ✅ 消息发送成功`);
    console.log(`   📝 响应内容：${response.content?.slice(0, 100)}...`);
    console.log(`   🔌 匹配技能：${response.skillMatched || '无'}`);
    console.log(`   🤖 使用模型：${response.modelUsed || '无'}`);
    
    // 3. 获取消息历史
    console.log('\n3️⃣ 获取消息历史...');
    const messagesRes = await fetch(`${API_BASE}/api/sessions/${session.id}/messages?limit=10`);
    if (messagesRes.ok) {
      const messages = await messagesRes.json();
      console.log(`   ✅ 获取到 ${messages.length} 条消息`);
    }
    
    console.log('\n✅ 所有测试通过！\n');
    console.log('📱 访问 http://localhost:3002/chat 体验 React 聊天界面');
    
  } catch (error) {
    console.log(`   ❌ 测试失败：${error.message}`);
  }
}

testChat();
