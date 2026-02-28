/**
 * Test script for uxin-mcp tools via direct API endpoints
 * Tests the actual REST API instead of MCP tools
 */

const API_BASE = 'http://127.0.0.1:8000';
const API_TOKEN = 'test-api-token-12345';
const USER_TOKEN = null; // Will use API token auth

async function apiRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, options);
  return await response.json();
}

async function testAPIEndpoints() {
  console.log('=== Testing Uxin API Endpoints ===\n');

  // Test 1: Health check
  console.log('1. Testing /health endpoint...');
  try {
    const response = await fetch(`${API_BASE}/health`);
    const data = await response.json();
    console.log('   Status:', response.ok ? 'OK' : 'FAILED');
    console.log('   Response:', JSON.stringify(data));
  } catch (error) {
    console.log('   Exception:', error.message);
  }

  // Test 2: Get MCP Tools list
  console.log('\n2. Testing /api/v1/mcp-tools endpoint...');
  try {
    const data = await apiRequest('/api/v1/mcp-tools');
    console.log('   Status:', data.success ? 'OK' : 'FAILED');
    if (data.success) {
      console.log(`   Total tools: ${data.data.length}`);
      console.log(`   Tools: ${data.data.map(t => t.name).slice(0, 10).join(', ')}...`);
    }
  } catch (error) {
    console.log('   Exception:', error.message);
  }

  // Test 3: Get projects (via direct API)
  console.log('\n3. Testing /api/v1/projects endpoint...');
  try {
    const data = await apiRequest('/api/v1/projects?page=1&limit=5');
    console.log('   Status:', data.success ? 'OK' : 'FAILED');
    if (data.success) {
      console.log('   Response:', JSON.stringify(data, null, 2).slice(0, 300));
    } else {
      console.log('   Error:', data.message || data.error);
    }
  } catch (error) {
    console.log('   Exception:', error.message);
  }

  // Test 4: Get tasks (via direct API)
  console.log('\n4. Testing /api/v1/tasks endpoint...');
  try {
    const data = await apiRequest('/api/v1/tasks?page=1&limit=5');
    console.log('   Status:', data.success ? 'OK' : 'FAILED');
    if (data.success) {
      console.log('   Response:', JSON.stringify(data, null, 2).slice(0, 300));
    } else {
      console.log('   Error:', data.message || data.error);
    }
  } catch (error) {
    console.log('   Exception:', error.message);
  }

  // Test 5: Get documents (via direct API)
  console.log('\n5. Testing /api/v1/documents endpoint...');
  try {
    const data = await apiRequest('/api/v1/documents?page=1&limit=5');
    console.log('   Status:', data.success ? 'OK' : 'FAILED');
    if (data.success) {
      console.log('   Response:', JSON.stringify(data, null, 2).slice(0, 300));
    } else {
      console.log('   Error:', data.message || data.error);
    }
  } catch (error) {
    console.log('   Exception:', error.message);
  }

  // Test 6: Create a project (via direct API)
  console.log('\n6. Testing POST /api/v1/projects endpoint...');
  try {
    const data = await apiRequest('/api/v1/projects', 'POST', {
      name: 'Test Project ' + Date.now(),
      description: 'A test project created via API',
      status: 'active'
    });
    console.log('   Status:', data.success ? 'OK' : 'FAILED');
    if (data.success) {
      console.log('   Created project ID:', data.data?.id);
    } else {
      console.log('   Error:', data.message || data.error);
    }
  } catch (error) {
    console.log('   Exception:', error.message);
  }

  console.log('\n=== Test Complete ===');
  console.log('\nNote: API endpoints work independently of MCP tools.');
  console.log('MCP tools provide an additional abstraction layer on top of REST APIs.');
}

testAPIEndpoints().catch(console.error);
