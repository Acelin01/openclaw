/**
 * Direct test for uxin-mcp tools - Tests the tool handlers directly
 * No MCP client/server connection needed
 */

// First, let's just check what tools are available via the HTTP endpoint
const API_BASE = 'http://127.0.0.1:8000';
const API_TOKEN = 'test-api-token-12345';

async function listTools() {
  console.log('=== Listing Available MCP Tools ===\n');

  try {
    const response = await fetch(`${API_BASE}/api/v1/mcp-tools`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (data.success) {
      console.log(`Total tools: ${data.data.length}\n`);

      // Group by type
      const types = {};
      data.data.forEach(tool => {
        const type = tool.type || 'unknown';
        if (!types[type]) types[type] = [];
        types[type].push(tool);
      });

      Object.entries(types).forEach(([type, tools]) => {
        console.log(`\n${type.toUpperCase()} (${tools.length}):`);
        tools.forEach(t => {
          console.log(`  - ${t.name}: ${t.description?.slice(0, 60) || 'No description'}`);
        });
      });
    } else {
      console.log('Failed to fetch tools:', data.message);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function testDirectToolCall() {
  console.log('\n\n=== Testing Direct Tool Calls ===\n');

  // Test task_list (in default allowlist)
  console.log('1. Testing task_list (in allowlist):');
  try {
    const message = {
      version: '1.0',
      body: {
        action: 'task_list',
        params: { limit: 5 },
        context: { project_id: 'test', team_id: 'test' }
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

    const result = await response.json();
    console.log('   Status:', result.success ? 'SUCCESS' : 'FAILED');
    if (!result.success) {
      console.log('   Error:', result.error || result.message);
    } else {
      console.log('   Result:', JSON.stringify(result.data, null, 2).slice(0, 300));
    }
  } catch (error) {
    console.log('   Exception:', error.message);
  }

  // Test skill_analyzer (NOT in default allowlist)
  console.log('\n2. Testing skill_analyzer (NOT in allowlist):');
  try {
    const message = {
      version: '1.0',
      body: {
        action: 'skill_analyzer',
        params: { project_description: 'Build a React app' },
        context: { project_id: 'test', team_id: 'test' }
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

    const result = await response.json();
    console.log('   Status:', result.success ? 'SUCCESS' : 'FAILED');
    if (!result.success) {
      console.log('   Error:', result.error || result.message);
      console.log('   (This is expected - tool not in allowlist)');
    } else {
      console.log('   Result:', JSON.stringify(result.data, null, 2).slice(0, 300));
    }
  } catch (error) {
    console.log('   Exception:', error.message);
  }
}

async function main() {
  await listTools();
  await testDirectToolCall();
  console.log('\n=== Test Complete ===');
}

main().catch(console.error);
