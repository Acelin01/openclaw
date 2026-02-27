
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'apps/api/.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'uxin-jwt-secret-2025';
const SERVICE_SECRET = process.env.SERVICE_SECRET || 'uxin-service-secret-123';

async function testSkills() {
  const payload = {
    id: '4d1c8166-d884-4367-814e-5f6801ac7b66', // Valid admin user ID from previous steps
    email: 'linyi@renrenvc.com',
    role: 'ADMIN'
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  console.log('Generated Token:', token);

  const baseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:8000';

  // Test skill_analyzer
  console.log('\nTesting skill_analyzer...');
  const response1 = await fetch(`${baseUrl}/api/v1/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      id: 'ba9deefe-cfe2-4cc8-bff5-7a0de0467675', // New ID for testing
      messages: [
        {
          role: 'user',
          content: '请调用 skill_analyzer 工具分析：我们需要一个使用 React 和 TypeScript 开发的前端，后端使用 Node.js，还需要一些 UI/UX 设计。'
        }
      ]
    })
  });

  if (response1.ok) {
    const reader = response1.body?.getReader();
    const decoder = new TextDecoder();
    console.log('Response stream:');
    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;
      const chunk = decoder.decode(value);
      process.stdout.write(chunk);
    }
  } else {
    console.error('Skill analyzer test failed:', response1.status, await response1.text());
  }

  // Test milestone_monitor
  console.log('\n\nTesting milestone_monitor...');
  const response2 = await fetch(`${baseUrl}/api/v1/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      id: 'ba9deefe-cfe2-4cc8-bff5-7a0de0467676', // New ID for testing
      messages: [
        {
          role: 'user',
          content: '请调用 milestone_monitor 工具查看项目 "ba9deefe-cfe2-4cc8-bff5-7a0de0467674" 的里程碑状态。'
        }
      ]
    })
  });

  if (response2.ok) {
    const reader = response2.body?.getReader();
    const decoder = new TextDecoder();
    console.log('Response stream:');
    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;
      const chunk = decoder.decode(value);
      process.stdout.write(chunk);
    }
  } else {
    console.error('Milestone monitor test failed:', response2.status, await response2.text());
  }
}

testSkills().catch(console.error);
