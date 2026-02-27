
import jwt from 'jsonwebtoken';

const secret = 'dev-secret';
const payload = {
  id: '00000000-0000-0000-0000-000000000000', // 假设的一个测试 ID
  email: 'test@example.com',
  role: 'ADMIN'
};

const token = jwt.sign(payload, secret, { expiresIn: '1h' });
console.log(token);
