/**
 * Test script for uxin-mcp tools - Direct tool execution test
 * Tests tools via the AI SDK integration
 */

const API_BASE = 'http://127.0.0.1:8000';
const API_TOKEN = 'test-api-token-12345';

async function callMCPTool(toolName, args = {}) {
  const message = {
    version: '1.0',
    body: {
      action: toolName,
      params: args,
      context: {
        project_id: 'test-project',
        team_id: 'test-team'
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
  console.log('=== Testing Uxin MCP Tools ===\n');

  // Test tools that are in the default allowlist
  const allowlistTools = [
    { name: 'project_query', args: {}, desc: 'Query projects' },
    { name: 'task_list', args: { limit: 5 }, desc: 'List tasks' },
    { name: 'task_create', args: {
      project_id: 'test-project',
      title: 'Test Task',
      description: 'A test task'
    }, desc: 'Create a task' },
    { name: 'project_create', args: {
      name: 'Test Project',
      description: 'A test project',
      owner_id: 'system'
    }, desc: 'Create a project' },
    { name: 'milestone_monitor', args: {
      project_id: 'test-project'
    }, desc: 'Monitor milestone' },
    { name: 'requirement_create', args: {
      project_id: 'test-project',
      title: 'Test Requirement',
      description: 'A test requirement'
    }, desc: 'Create requirement' }
  ];

  for (const tool of allowlistTools) {
    console.log(`\n${allowlistTools.indexOf(tool) + 1}. Testing ${tool.name} - ${tool.desc}`);
    try {
      const result = await callMCPTool(tool.name, tool.args);
      console.log('   Status:', result.success ? 'OK' : 'FAILED');
      if (result.success) {
        const dataStr = JSON.stringify(result.data, null, 2);
        console.log('   Data:', dataStr.slice(0, 400));
      } else {
        console.log('   Error:', result.error || result.message);
      }
    } catch (error) {
      console.log('   Exception:', error.message);
    }
  }

  // Test some analysis tools (need to update allowlist)
  console.log('\n\n=== Additional Tools (need allowlist update) ===');

  const extraTools = [
    { name: 'skill_analyzer', args: {
      project_description: 'Build a React-based e-commerce website'
    }, desc: 'Analyze skills needed' },
    { name: 'talent_match', args: {
      skills: ['React', 'Node.js'],
      budget: 5000
    }, desc: 'Match talent' },
    { name: 'document_query', args: {}, desc: 'Query documents' }
  ];

  for (const tool of extraTools) {
    console.log(`\nTesting ${tool.name} - ${tool.desc}`);
    try {
      const result = await callMCPTool(tool.name, tool.args);
      console.log('   Status:', result.success ? 'OK' : 'FAILED');
      if (result.success) {
        const dataStr = JSON.stringify(result.data, null, 2);
        console.log('   Data:', dataStr.slice(0, 300));
      } else {
        console.log('   Error:', result.error || result.message);
      }
    } catch (error) {
      console.log('   Exception:', error.message);
    }
  }

  console.log('\n=== Test Complete ===');
  console.log('\nNote: Tools not in the default allowlist will return "Tool not allowed" error.');
  console.log('To enable more tools, update the resolveDefaultAllowlist() in src/lib/mcp/permissions.ts');
}

testMCPTools().catch(console.error);
