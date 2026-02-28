/**
 * Test script for uxin-mcp tools via external-mcp/route endpoint
 * Uses ACP protocol to call MCP tools
 */

const API_BASE = 'http://127.0.0.1:8000';
const API_TOKEN = 'test-api-token-12345';

async function callMCPTool(toolName, args = {}, context = {}) {
  const message = {
    version: '1.0',
    body: {
      action: toolName,
      params: args,
      context: {
        project_id: context.projectId || 'test-project',
        team_id: context.teamId || 'test-team',
        ...context
      }
    }
  };

  const response = await fetch(`${API_BASE}/api/v1/external/mcp/route`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message })
  });

  return await response.json();
}

async function testMCPTools() {
  console.log('=== Testing Uxin MCP Tools via ACP Protocol ===\n');

  // Test 1: document_query (should work without existing data)
  console.log('1. Testing document_query...');
  try {
    const result = await callMCPTool('document_query', {});
    console.log('   Status:', result.success ? 'OK' : 'FAILED');
    if (result.success) {
      console.log('   Data:', JSON.stringify(result.data, null, 2).slice(0, 300));
    } else {
      console.log('   Error:', result.error || result.message);
    }
  } catch (error) {
    console.log('   Exception:', error.message);
  }

  // Test 2: task_list
  console.log('\n2. Testing task_list...');
  try {
    const result = await callMCPTool('task_list', { limit: 5 });
    console.log('   Status:', result.success ? 'OK' : 'FAILED');
    if (result.success) {
      console.log('   Data:', JSON.stringify(result.data, null, 2).slice(0, 300));
    } else {
      console.log('   Error:', result.error || result.message);
    }
  } catch (error) {
    console.log('   Exception:', error.message);
  }

  // Test 3: project_query
  console.log('\n3. Testing project_query...');
  try {
    const result = await callMCPTool('project_query', {});
    console.log('   Status:', result.success ? 'OK' : 'FAILED');
    if (result.success) {
      console.log('   Data:', JSON.stringify(result.data, null, 2).slice(0, 300));
    } else {
      console.log('   Error:', result.error || result.message);
    }
  } catch (error) {
    console.log('   Exception:', error.message);
  }

  // Test 4: skill_analyzer
  console.log('\n4. Testing skill_analyzer...');
  try {
    const result = await callMCPTool('skill_analyzer', {
      project_description: 'Build a React-based e-commerce website with payment integration'
    });
    console.log('   Status:', result.success ? 'OK' : 'FAILED');
    if (result.success) {
      console.log('   Data:', JSON.stringify(result.data, null, 2).slice(0, 500));
    } else {
      console.log('   Error:', result.error || result.message);
    }
  } catch (error) {
    console.log('   Exception:', error.message);
  }

  // Test 5: talent_match
  console.log('\n5. Testing talent_match...');
  try {
    const result = await callMCPTool('talent_match', {
      skills: ['React', 'Node.js', 'TypeScript'],
      budget: 5000
    });
    console.log('   Status:', result.success ? 'OK' : 'FAILED');
    if (result.success) {
      console.log('   Data:', JSON.stringify(result.data, null, 2).slice(0, 500));
    } else {
      console.log('   Error:', result.error || result.message);
    }
  } catch (error) {
    console.log('   Exception:', error.message);
  }

  // Test 6: freelancer_register
  console.log('\n6. Testing freelancer_register...');
  try {
    const result = await callMCPTool('freelancer_register', {
      name: 'Test Freelancer',
      email: 'test@example.com',
      country: 'CN',
      preferred_languages: ['zh-CN', 'en']
    });
    console.log('   Status:', result.success ? 'OK' : 'FAILED');
    if (result.success) {
      console.log('   Data:', JSON.stringify(result.data, null, 2).slice(0, 300));
    } else {
      console.log('   Error:', result.error || result.message);
    }
  } catch (error) {
    console.log('   Exception:', error.message);
  }

  console.log('\n=== Test Complete ===');
}

testMCPTools().catch(console.error);
