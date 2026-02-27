
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

const JWT_SECRET = 'uxin-jwt-secret-key-2025'; // From environment or default
const API_URL = 'http://127.0.0.1:8000';

async function test() {
  const email = 'linyi@renrenvc.com';
  const userId = 'seed-user-linyi';
  const role = 'ADMIN';

  const token = jwt.sign(
    { id: userId, email, role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  console.log('Testing with token for:', email);
  console.log('Token:', token);

  const res = await fetch(`${API_URL}/api/projects`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await res.json();
  console.log('API Response:', JSON.stringify(data, null, 2));
}

test().catch(console.error);
