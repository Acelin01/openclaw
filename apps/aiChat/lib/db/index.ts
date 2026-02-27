import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

const globalForDb = globalThis as unknown as {
  connection: mysql.Pool | undefined;
};

const databaseUrl = process.env.DATABASE_URL || 'mysql://root:XLY123@localhost:3306/uxin';
const url = new URL(databaseUrl.replace('mysql://', 'http://')); // URL parser needs a protocol it recognizes

export const connection =
  globalForDb.connection ??
  mysql.createPool({
    host: url.hostname || '127.0.0.1',
    port: parseInt(url.port) || 3306,
    user: url.username || 'root',
    password: decodeURIComponent(url.password) || 'XLY123',
    database: url.pathname.slice(1) || 'uxin',
    waitForConnections: true,
    connectionLimit: 20, // Increase connection limit
    maxIdle: 20,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000, // 10 seconds delay before starting keep-alive
    connectTimeout: 30000, // 30 seconds
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.connection = connection;
}

// Test connection
connection.getConnection().then((conn) => {
  console.log('Successfully connected to MySQL');
  conn.release();
}).catch((err) => {
  console.error('Failed to connect to MySQL on startup:', err);
});

export const db = drizzle(connection, { schema, mode: 'default' });
