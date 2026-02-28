/**
 * Create API Client and Token for testing
 */
import { connectDatabase, prisma } from './src/lib/db/index.js';
import crypto from 'node:crypto';

const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

async function createTestApiClient() {
  await connectDatabase();

  if (!prisma) {
    console.error('Prisma not available');
    return;
  }

  const token = 'test-api-token-12345';
  const tokenHash = hashToken(token);

  // Check if client already exists
  const existingClient = await prisma.apiClient.findFirst({
    where: { name: 'Test API Client' }
  });

  if (existingClient) {
    console.log('Test API Client already exists:', existingClient.id);

    const existingToken = await prisma.apiToken.findFirst({
      where: { clientId: existingClient.id }
    });

    if (existingToken) {
      console.log('Token already exists. Token:', token);
      console.log('Use this token in your tests');
    }
  } else {
    // Create API Client
    const client = await prisma.apiClient.create({
      data: {
        name: 'Test API Client',
        description: 'Test client for MCP tools testing',
        status: 'ACTIVE',
        rateLimitPerMin: 100
      }
    });

    console.log('Created API Client:', client.id);

    // Create API Token
    const apiToken = await prisma.apiToken.create({
      data: {
        clientId: client.id,
        name: 'Test Token',
        tokenHash,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    });

    console.log('Created API Token:', apiToken.id);
    console.log('');
    console.log('=== IMPORTANT ===');
    console.log('API Token (save this):', token);
    console.log('===================');
  }

  process.exit(0);
}

createTestApiClient().catch(console.error);
