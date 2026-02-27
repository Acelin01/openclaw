import * as IORedis from 'ioredis';

let redis: IORedis.Redis | null = null;

export const connectRedis = async () => {
  try {
    redis = new IORedis.Redis({
      host: process.env['REDIS_HOST'] || 'localhost',
      port: parseInt(process.env['REDIS_PORT'] || '6379'),
      password: process.env['REDIS_PASSWORD'] || '',
      maxRetriesPerRequest: 3,
      connectTimeout: 10000
    });

    redis.on('connect', () => {
      console.log('Redis connected successfully');
    });

    redis.on('error', (err) => {
      console.error('Redis connection error:', err);
    });

  } catch (error) {
    console.error('Failed to connect to Redis:', error);
  }
};

export const getRedis = () => redis;
