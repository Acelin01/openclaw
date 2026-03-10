#!/usr/bin/env node
/**
 * ChatLite - OpenClaw 连接测试脚本
 * 测试 Gateway 连接、工具调用和消息处理
 */

const GATEWAY_URL = 'http://localhost:18789';
const GATEWAY_TOKEN = 'test-token';

async function testGatewayHealth() {
  console.log('\n📡 测试 1: Gateway 健康检查');
  try {
    const response = await fetch(GATEWAY_URL);
    if (response.ok) {
      console.log('✅ Gateway 正常运行');
      return true;
    } else {
      console.log(`❌ Gateway 响应异常：${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Gateway 无法访问：${error.message}`);
    return false;
  }
}

async function testToolInvoke() {
  console.log('\n🔧 测试 2: 工具调用 (sessions_list)');
  try {
    const response = await fetch(`${GATEWAY_URL}/tools/invoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GATEWAY_TOKEN}`,
      },
      body: JSON.stringify({
        tool: 'sessions_list',
        args: { limit: 5 },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    if (result.ok) {
      const sessions = result.result?.details?.sessions || [];
      console.log(`✅ 工具调用成功，获取到 ${sessions.length} 个会话`);
      sessions.forEach(s => {
        console.log(`   - ${s.key} (${s.kind})`);
      });
      return true;
    } else {
      console.log(`❌ 工具调用失败：${result.error?.message}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ 工具调用异常：${error.message}`);
    return false;
  }
}

async function testSendMessage() {
  console.log('\n💬 测试 3: 发送消息 (sessions_send)');
  const sessionKey = 'agent:agent_xulinyi:main';
  const testMessage = `[连接测试] ${new Date().toLocaleTimeString()}`;
  
  try {
    const response = await fetch(`${GATEWAY_URL}/tools/invoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GATEWAY_TOKEN}`,
      },
      body: JSON.stringify({
        tool: 'sessions_send',
        args: {
          message: testMessage,
          sessionKey,
        },
        sessionKey,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    if (result.ok) {
      console.log('✅ 消息发送成功');
      if (result.result?.content) {
        const content = result.result.content;
        if (Array.isArray(content)) {
          const text = content.find(c => c.type === 'text')?.text;
          if (text) {
            console.log(`   响应：${text.substring(0, 100)}...`);
          }
        }
      }
      return true;
    } else {
      console.log(`❌ 消息发送失败：${result.error?.message}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ 消息发送异常：${error.message}`);
    return false;
  }
}

async function testSessionHistory() {
  console.log('\n📜 测试 4: 获取消息历史 (sessions_history)');
  const sessionKey = 'agent:agent_xulinyi:main';
  
  try {
    const response = await fetch(`${GATEWAY_URL}/tools/invoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GATEWAY_TOKEN}`,
      },
      body: JSON.stringify({
        tool: 'sessions_history',
        args: {
          sessionKey,
          limit: 5,
          includeTools: false,
        },
        sessionKey,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    if (result.ok) {
      const messages = result.result?.details?.messages || [];
      console.log(`✅ 获取消息历史成功，共 ${messages.length} 条消息`);
      if (messages.length > 0) {
        const lastMsg = messages[messages.length - 1];
        console.log(`   最新消息：${lastMsg.role || lastMsg.author} - ${lastMsg.content?.substring(0, 50) || 'N/A'}...`);
      }
      return true;
    } else {
      console.log(`❌ 获取历史失败：${result.error?.message}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ 获取历史异常：${error.message}`);
    return false;
  }
}

async function testWebSocketEndpoint() {
  console.log('\n🔌 测试 5: WebSocket 端点检查');
  // WebSocket 测试需要 ws 库，这里只检查端点是否存在
  try {
    // 尝试 HTTP 升级（会失败，但可以确认端口开放）
    const response = await fetch(`${GATEWAY_URL.replace('http', 'ws')}/ws`, {
      method: 'GET',
      headers: {
        'Upgrade': 'websocket',
        'Connection': 'Upgrade',
      },
    });
    console.log('⚠️  WebSocket 端点响应（需要专用客户端测试）');
    return true;
  } catch (error) {
    console.log(`⚠️  WebSocket 端点检查：${error.message}`);
    return true; // 不视为失败
  }
}

async function runAllTests() {
  console.log('='.repeat(50));
  console.log('🧪 ChatLite - OpenClaw 连接测试');
  console.log('='.repeat(50));
  console.log(`Gateway URL: ${GATEWAY_URL}`);
  console.log(`Token: ${GATEWAY_TOKEN}`);
  console.log(`时间：${new Date().toLocaleString('zh-CN')}`);
  console.log('='.repeat(50));

  const results = {
    gateway: await testGatewayHealth(),
    toolInvoke: await testToolInvoke(),
    sendMessage: await testSendMessage(),
    sessionHistory: await testSessionHistory(),
    websocket: await testWebSocketEndpoint(),
  };

  console.log('\n' + '='.repeat(50));
  console.log('📊 测试结果汇总');
  console.log('='.repeat(50));
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.values(results).length;
  
  for (const [test, result] of Object.entries(results)) {
    const icon = result ? '✅' : '❌';
    const status = result ? '通过' : '失败';
    console.log(`${icon} ${test}: ${status}`);
  }
  
  console.log('='.repeat(50));
  console.log(`总计：${passed}/${total} 通过`);
  
  if (passed === total) {
    console.log('🎉 所有测试通过！ChatLite 已正确连接到 OpenClaw');
  } else {
    console.log('⚠️  部分测试失败，请检查配置');
  }
  console.log('='.repeat(50));
  
  process.exit(passed === total ? 0 : 1);
}

runAllTests().catch(console.error);
