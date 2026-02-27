import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient | null = null;

export const connectDatabase = async () => {
  try {
    if (!prisma) {
      prisma = new PrismaClient({
        log: process.env['NODE_ENV'] === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });
    }
    
    await prisma.$connect();
    console.log('✅ 数据库连接成功');
  } catch (error) {
    console.log('⚠️  数据库连接失败:', error);
    console.log('💡 提示：请确保MySQL数据库已启动并正确配置了 DATABASE_URL');
    // Keep prisma instance so that subsequent calls can attempt reconnection
    // or at least provide better error messages from Prisma itself
  }
};

export const disconnectDatabase = async () => {
  if (prisma) {
    try {
      await prisma.$disconnect();
      console.log('✅ 数据库断开连接');
    } catch (error) {
      console.error('❌ 数据库断开连接失败:', error);
    }
  }
};

export { prisma };
export const getPrisma = () => {
  if (!prisma) {
    throw new Error('Prisma client is not initialized. Database connection might have failed.');
  }
  return prisma;
};
