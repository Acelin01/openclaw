
import jwt from 'jsonwebtoken';

const secret = 'dev-secret';
const payload = {
  id: '4d1c8166-d884-4367-814e-5f6801ac7b66',
  email: 'linyi@renrenvc.com',
  role: 'ADMIN'
};

const token = jwt.sign(payload, secret, { expiresIn: '1h' });
console.log('TOKEN:', token);

async function testChat() {
  try {
    const response = await fetch('http://0.0.0.0:8000/api/v1/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
                id: 'ba9deefe-cfe2-4cc8-bff5-7a0de0467674',
                messages: [
                    {
                        role: 'user',
                        content: '帮我创建一个名为 "Test Project 2" 的项目，描述是 "这是一个测试项目"，负责人ID是 "4d1c8166-d884-4367-814e-5f6801ac7b66"'
                    }
                ]
            })
    });

    console.log('Response status:', response.status);
    const reader = response.body?.getReader();
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = new TextDecoder().decode(value);
        console.log('Chunk:', text);
      }
    }
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

testChat();
