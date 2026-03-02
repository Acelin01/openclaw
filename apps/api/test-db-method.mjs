import { PrismaClient } from '@prisma/client';

// 模拟 DatabaseService
class DatabaseService {
  constructor() {
    console.log('DatabaseService 初始化');
  }
  
  async createMilestone(data) {
    console.log('createMilestone 被调用，data:', data);
    return { id: 'test-id', ...data };
  }
}

async function test() {
  const db = new DatabaseService();
  console.log('\n检查方法是否存在:');
  console.log('db.createMilestone:', typeof db.createMilestone);
  console.log('db.getMilestones:', typeof db.getMilestones);
  
  console.log('\n调用方法:');
  const result = await db.createMilestone({ title: 'test' });
  console.log('结果:', result);
}

test();
