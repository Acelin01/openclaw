/**
 * Test script for uxin-mcp tools
 * Tests the MCP tools endpoint directly via HTTP
 */

const API_BASE = 'http://127.0.0.1:8000';
const API_TOKEN = 'uxin-service-secret-123';

async function testMCPTools() {
  console.log('=== Testing Uxin MCP Tools ===\n');

  // Test 1: List available MCP tools
  console.log('1. Testing MCP tools list endpoint...');
  try {
    const response = await fetch(`${API_BASE}/api/v1/mcp-tools`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    console.log('   Status:', response.ok ? 'OK' : 'FAILED');
    console.log('   Response:', JSON.stringify(data, null, 2).slice(0, 500));
  } catch (error) {
    console.log('   Error:', error.message);
  }

  // Test 2: Test project_query tool
  console.log('\n2. Testing project_query tool...');
  try {
    const response = await fetch(`${API_BASE}/api/v1/mcp-tools/call`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tool: 'project_query',
        arguments: {}
      })
    });
    const data = await response.json();
    console.log('   Status:', response.ok ? 'OK' : 'FAILED');
    console.log('   Response:', JSON.stringify(data, null, 2).slice(0, 500));
  } catch (error) {
    console.log('   Error:', error.message);
  }

  // Test 3: Test task_list tool
  console.log('\n3. Testing task_list tool...');
  try {
    const response = await fetch(`${API_BASE}/api/v1/mcp-tools/call`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tool: 'task_list',
        arguments: { limit: 5 }
      })
    });
    const data = await response.json();
    console.log('   Status:', response.ok ? 'OK' : 'FAILED');
    console.log('   Response:', JSON.stringify(data, null, 2).slice(0, 500));
  } catch (error) {
    console.log('   Error:', error.message);
  }

  // Test 4: Test document_query tool
  console.log('\n4. Testing document_query tool...');
  try {
    const response = await fetch(`${API_BASE}/api/v1/mcp-tools/call`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tool: 'document_query',
        arguments: {}
      })
    });
    const data = await response.json();
    console.log('   Status:', response.ok ? 'OK' : 'FAILED');
    console.log('   Response:', JSON.stringify(data, null, 2).slice(0, 500));
  } catch (error) {
    console.log('   Error:', error.message);
  }

  // Test 5: Test talent_match tool
  console.log('\n5. Testing talent_match tool...');
  try {
    const response = await fetch(`${API_BASE}/api/v1/mcp-tools/call`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tool: 'talent_match',
        arguments: { skills: ['React', 'Node.js'] }
      })
    });
    const data = await response.json();
    console.log('   Status:', response.ok ? 'OK' : 'FAILED');
    console.log('   Response:', JSON.stringify(data, null, 2).slice(0, 500));
  } catch (error) {
    console.log('   Error:', error.message);
  }

  // Test 6: Test skill_analyzer tool
  console.log('\n6. Testing skill_analyzer tool...');
  try {
    const response = await fetch(`${API_BASE}/api/v1/mcp-tools/call`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tool: 'skill_analyzer',
        arguments: { project_description: 'Build a React-based e-commerce website with payment integration' }
      })
    });
    const data = await response.json();
    console.log('   Status:', response.ok ? 'OK' : 'FAILED');
    console.log('   Response:', JSON.stringify(data, null, 2).slice(0, 500));
  } catch (error) {
    console.log('   Error:', error.message);
  }

  console.log('\n=== Test Complete ===');
}

testMCPTools().catch(console.error);
