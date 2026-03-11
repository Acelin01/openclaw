import './mocks.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
dotenv.config();

import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import WebSocket, { WebSocketServer } from 'ws';
import { getDashscopeApiKeyForUser, getDashscopeRealtimeBaseURL, getDashscopeRealtimeModel } from './services/ai-manager.js';
import { logError } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import uploadsRoutes from './routes/uploads.js';
import quotationRoutes from './routes/quotations.js';
import inquiryRoutes from './routes/inquiries.js';
import transactionRoutes from './routes/transactions.js';
import aiRoutes from './routes/ai.js';
import adminRoutes from './routes/admin.js';
import marketplaceRoutes from './routes/marketplace.js';
import providerRoutes from './routes/provider.js';
import monitoringRoutes from './routes/monitoring.js';
import exportRoutes from './routes/export.js';
import templateRoutes from './routes/templates.js';
import chatRoutes from './routes/chat.js';
import shareRoutes from './routes/share.js';
import paymentRoutes from './routes/payment.js';
import searchRoutes from './routes/search.js';
import analyticsRoutes from './routes/analytics.js';
import notificationRoutes from './routes/notifications.js';
import devtoolsRoutes from './routes/devtools.js';
import publicRoutes from './routes/public.js';
import documentRoutes from './routes/document.js';
import messagesRoutes from './routes/messages.js';
import historyRoutes from './routes/history.js';
import suggestionsRoutes from './routes/suggestions.js';
import voteRoutes from './routes/vote.js';
import filesRoutes from './routes/files.js';
import tasksRoutes from './routes/tasks.js';
import projectsRoutes from './routes/projects.js';
import projectRequirementsRoutes from './routes/project-requirements.js';
import projectTaskRoutes from './routes/project-tasks.js';
import positionsRoutes from './routes/positions.js';
import ordersRoutes from './routes/orders.js';
import resumesRoutes from './routes/resumes.js';
import recruitmentRoutes from './routes/recruitment.js';
import servicesRoutes from './routes/services.js';
import workersRoutes from './routes/workers.js';
import requirementsRoutes from './routes/requirements.js';
import matchingsRoutes from './routes/matchings.js';
import schedulesRoutes from './routes/schedules.js';
import contactsRoutes from './routes/contacts.js';
import workbenchRoutes from './routes/workbench.js';
import financeRoutes from './routes/finance.js';
import sharedEmployeesRoutes from './routes/shared-employees.js';
import subscriptionRoutes from './routes/subscriptions.js';
import agentRoutes from './routes/agents.js';
import mcpToolRoutes from './routes/mcp-tools.js';
import skillsRoutes from './routes/skills.js';
import iterationsRoutes from './routes/iterations.js';
import aiAppRoutes from './routes/ai-apps.js';
import mcpRoutes from './routes/mcp.js';
import collaborationRoutes from './routes/collaboration.js';
import externalMcpRoutes from './routes/external-mcp.js';
import externalUsageRoutes from './routes/external-usage.js';
import externalAdminRoutes from './routes/external-admin.js';
import billingRoutes from './routes/billing.js';
import orderRoutes from './routes/orders.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { authenticateToken, authorizeRoles, optionalAuthenticateToken } from './middleware/auth.js';

// Import services
import { setupSocketHandlers } from './services/socket.js';
import { ChatService } from './services/chat.js';
import { connectDatabase } from './lib/db/index.js';
import { connectRedis } from './services/redis.js';


const app = express();
const server = createServer(app);

// 1. Helper function to check if request is for Socket.io
const isSocketIoRequest = (req: express.Request) => {
  return req.url.startsWith('/socket.io') || 
         req.path.startsWith('/socket.io') ||
         req.url.startsWith('/api/v1/socket.io') ||
         req.path.startsWith('/api/v1/socket.io');
};

// 2. Wrap all global middleware to skip Socket.io
const skipSocketIo = (middleware: any) => {
  return (req: any, res: any, next: any) => {
    if (isSocketIoRequest(req)) {
      return next();
    }
    return middleware(req, res, next);
  };
};

const allowedOrigins = process.env['FRONTEND_URL'] ? process.env['FRONTEND_URL'].split(',') : ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow all origins in development or if origin is in allowed list
    const isDev = process.env.NODE_ENV === 'development' || 
                  process.env.NEXT_PUBLIC_NODE_ENV === 'development' ||
                  !origin;
    
    if (isDev || allowedOrigins.includes(origin!)) {
      callback(null, true);
    } else {
      console.warn('[WARN] CORS blocked origin:', origin);
      callback(null, true); // Temporarily allow all for debugging
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin", "x-service-secret", "x-no-compression"],
  optionsSuccessStatus: 200
};

const io = new Server(server, {
  cors: corsOptions,
  path: '/socket.io',
  httpCompression: false,
  perMessageDeflate: false,
  transports: ['polling', 'websocket'],
  allowUpgrades: true,
  allowEIO3: true
});

app.set('io', io);

const PORT = process.env['PORT'] || 8000;

// Initialize WebSocket servers
const wss = new WebSocketServer({ 
  noServer: true,
  perMessageDeflate: false,
  clientTracking: true
});

// Setup Socket.IO handlers
setupSocketHandlers(io);

// Handle upgrade requests manually for native WebSocket
// Socket.io automatically attaches its own upgrade listener when initialized with 'server'
server.on('upgrade', (request, socket, head) => {
  const url = new URL(request.url || '', `http://${request.headers.host}`);
  const pathname = url.pathname;

  if (pathname.startsWith('/api/v1/realtime')) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
});

// Connect to databases
await connectDatabase().catch(e => console.error('DB connect error:', e));
await connectRedis().catch(e => console.error('Redis connect error:', e));

// Initialize ChatService after DB connection
const chatService = new ChatService(io);

// Make chatService available to routes
app.set('chatService', chatService);

// Global middleware
app.use(skipSocketIo((req: any, res: any, next: any) => {
  // Security middleware
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  })(req, res, next);
}));

app.use(skipSocketIo((req: any, res: any, next: any) => {
  // CORS middleware
  cors(corsOptions)(req, res, next);
}));

app.use(skipSocketIo((req: any, res: any, next: any) => {
  // Logging middleware
  morgan('combined')(req, res, next);
}));

app.use(skipSocketIo((req: any, res: any, next: any) => {
  // Body parsing middleware
  express.json({ limit: '10mb' })(req, res, next);
}));

app.use(skipSocketIo((req: any, res: any, next: any) => {
  express.urlencoded({ extended: true, limit: '10mb' })(req, res, next);
}));
try {
  const path = await import('path');
  const fs = await import('fs');
  const servicesDir = path.join(process.cwd(), 'public', 'services');
  if (fs.existsSync(servicesDir)) {
    app.use('/services', (await import('express')).default.static(servicesDir));
  }
} catch {}

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', authenticateToken, userRoutes);
app.use('/api/v1/uploads', uploadsRoutes);
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/quotations', quotationRoutes);
app.use('/api/v1/inquiries', inquiryRoutes);
app.use('/api/v1/transactions', authenticateToken, transactionRoutes);
app.use('/api/v1/chat', optionalAuthenticateToken, chatRoutes);
app.use('/api/v1/document', optionalAuthenticateToken, documentRoutes);
app.use('/api/v1/documents', optionalAuthenticateToken, documentRoutes);
app.use('/api/v1/messages', authenticateToken, messagesRoutes);
app.use('/api/v1/history', optionalAuthenticateToken, historyRoutes);
app.use('/api/v1/suggestions', optionalAuthenticateToken, suggestionsRoutes);
app.use('/api/v1/vote', optionalAuthenticateToken, voteRoutes);
app.use('/api/v1/files', authenticateToken, filesRoutes);
app.use('/api/v1/tasks', authenticateToken, tasksRoutes);
app.use('/api/v1/projects', projectsRoutes);
app.use('/api/v1/project-requirements', authenticateToken, projectRequirementsRoutes);
app.use('/api/v1/project-tasks', authenticateToken, projectTaskRoutes);
app.use('/api/v1/orders', ordersRoutes); // Order service routes (M03 服务市场全流程)
app.use('/api/v1/positions', positionsRoutes);
app.use('/api/v1/resumes', resumesRoutes);
app.use('/api/v1/recruitment', recruitmentRoutes);
app.use('/api/v1/services', servicesRoutes);
app.use('/api/v1/workers', workersRoutes);
app.use('/api/v1/requirements', requirementsRoutes);
app.use('/api/v1/matchings', matchingsRoutes);
app.use('/api/v1/schedules', authenticateToken, schedulesRoutes);
app.use('/api/v1/ai', authenticateToken, aiRoutes);
app.use('/api/v1/admin', authenticateToken, authorizeRoles('ADMIN'), adminRoutes);
app.use('/api/v1/monitoring', monitoringRoutes); // All monitoring endpoints (health is public, others need auth)
app.use('/api/v1/export', authenticateToken, authorizeRoles('ADMIN'), exportRoutes); // Export and reporting endpoints
app.get('/api/v1/templates', async (req, res) => {
  try {
    const { DatabaseService } = await import('./lib/db/service.js');
    const db = DatabaseService.getInstance();
    const page = parseInt(String((req.query as any)['page'])) || 1;
    const limit = parseInt(String((req.query as any)['limit'])) || 10;
    const skip = (page - 1) * limit;
    const type = String((req.query as any)['type'] || '') || undefined;
    const status = String((req.query as any)['status'] || '') || undefined;
    const where: any = {};
    if (type) where['type'] = type;
    if (status) where['status'] = status;
    const [list, total] = await Promise.all([
      db.getTemplates(where, { skip, take: limit, orderBy: { updatedAt: 'desc' } }),
      db.getTemplatesCount(where)
    ]);
    res.json({ success: true, data: { templates: list, pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 } } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: '获取模版列表失败', error: error?.message || 'Unknown error' });
  }
});
app.use('/api/v1/templates', templateRoutes);
app.use('/api/v1/share', shareRoutes);
app.use('/api/v1/payments', authenticateToken, paymentRoutes); // Payment routes
app.use('/api/v1/search', searchRoutes); // Search routes (public)
app.use('/api/v1/analytics', analyticsRoutes); // Analytics routes
app.use('/api/v1/shared-employees', optionalAuthenticateToken, sharedEmployeesRoutes);
app.use('/api/v1/marketplace', marketplaceRoutes);
app.use('/api/v1', marketplaceRoutes);
app.use('/api/v1', providerRoutes);
app.use('/api/v1/notifications', authenticateToken, notificationRoutes);
app.use('/api/v1/contacts', authenticateToken, contactsRoutes);
app.use('/api/v1/workbench', authenticateToken, workbenchRoutes);
app.use('/api/v1/finance', authenticateToken, financeRoutes);
app.use('/api/v1/subscriptions', authenticateToken, subscriptionRoutes);
app.use('/api/v1/agents', optionalAuthenticateToken, agentRoutes);
app.use('/api/v1/mcp-tools', optionalAuthenticateToken, mcpToolRoutes);
app.use('/api/v1/skills', optionalAuthenticateToken, skillsRoutes);
app.use('/api/v1/mcp', optionalAuthenticateToken, mcpRoutes);
app.use('/api/v1/external/mcp', externalMcpRoutes);
app.use('/api/v1/external', externalUsageRoutes);
app.use('/api/v1/admin/external', authenticateToken, authorizeRoles('ADMIN'), externalAdminRoutes);
app.use('/api/v1/iterations', authenticateToken, iterationsRoutes);
app.use('/api/v1/ai-apps', optionalAuthenticateToken, aiAppRoutes);
app.use('/api/v1/devtools', authenticateToken, devtoolsRoutes);
app.use('/api/v1/collaboration', authenticateToken, collaborationRoutes);
app.use('/api/v1/billing', optionalAuthenticateToken, billingRoutes);
app.use('/api/v1/orders', optionalAuthenticateToken, orderRoutes);

// Serve static admin files
const adminPath = path.join(process.cwd(), 'public', 'admin');
if (fs.existsSync(adminPath)) {
  console.log(`Serving admin UI from ${adminPath}`);
  app.use(express.static(adminPath));
  
  // SPA fallback for non-API routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(adminPath, 'index.html'));
  });
}

// Error handling
app.use(notFound);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

server.listen(Number(PORT), '0.0.0.0', () => {
  console.log('================================================');
  console.log(`🚀 API Server is now listening on 0.0.0.0:${PORT}`);
  console.log(`📡 Socket.io path: /socket.io`);
  console.log(`📡 WebSocket path: /api/v1/realtime`);
  console.log(`🌍 Allowed Origins: ${allowedOrigins.join(', ')}`);
  console.log('================================================');
});

wss.on('connection', async (client: WebSocket, req) => {
  try {
    const origin = `http://${req.headers.host}`;
    const full = new URL(req.url || '/', origin);
    const tokenParam = full.searchParams.get('token');
    const authHeader = req.headers['authorization'];
    const tokenHeader = authHeader && typeof authHeader === 'string' ? authHeader.split(' ')[1] : undefined;
    const token = tokenParam || tokenHeader;
    if (!token) {
      client.close(4401, 'Unauthorized');
      return;
    }
    const decoded = jwt.verify(token, process.env['JWT_SECRET'] || 'default-secret') as any;
    const userId = decoded?.id || decoded?.userId || '';
    const userRole = String(decoded?.role || '').toUpperCase();
    const allowedRoles = (process.env['DASHSCOPE_ALLOWED_ROLES'] || 'CUSTOMER,PROVIDER,ADMIN').split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
    const allowedUsers = (process.env['DASHSCOPE_ALLOWED_USERS'] || '').split(',').map(s => s.trim()).filter(Boolean);
    if (allowedUsers.length > 0 && !allowedUsers.includes(userId)) {
      client.close(4403, 'Forbidden');
      return;
    }
    if (allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
      client.close(4403, 'Forbidden');
      return;
    }
    let apiKey = '';
    try {
      const { getPrisma } = await import('./lib/db/index.js');
      const prisma = getPrisma && getPrisma();
      if (prisma) {
        const regionPref = process.env['DASHSCOPE_REGION'] || undefined;
        const found = await prisma.aIProviderKey.findFirst({ where: { userId, provider: 'deepseek', active: true, ...(regionPref ? { region: regionPref } : {}) }, orderBy: { updatedAt: 'desc' } });
        apiKey = found?.apiKey || '';
      }
    } catch {}
    if (!apiKey) apiKey = getDashscopeApiKeyForUser(userId);
    const base = getDashscopeRealtimeBaseURL();
    const model = getDashscopeRealtimeModel();
    const target = `${base}?model=${encodeURIComponent(model)}`;
    const remote = new WebSocket(target, { headers: { Authorization: `Bearer ${apiKey}` } });
    let opened = false;
    remote.on('open', () => {
      opened = true;
      logError({ level: 'INFO', message: 'Realtime remote connected', endpoint: '/api/v1/realtime', method: 'WS', userId });
      try {
        const voice = full.searchParams.get('voice') || undefined;
        const transcription = full.searchParams.get('transcription') || undefined;
        const vad = full.searchParams.get('vad') || undefined;
        const modalities = (full.searchParams.get('modalities') || '').split(',').filter(Boolean);
        const sessionUpdate: any = { type: 'session.update', session: {} };
        if (voice) sessionUpdate.session.voice = voice;
        if (transcription) sessionUpdate.session.input_audio_transcription = { model: transcription };
        if (vad) sessionUpdate.session.turn_detection = { type: vad };
        if (modalities.length > 0) sessionUpdate.session.modalities = modalities;
        if (Object.keys(sessionUpdate.session).length > 0) remote.send(JSON.stringify(sessionUpdate));
      } catch {}
    });
    remote.on('message', (data: any) => { try { client.send(data); } catch {} });
    remote.on('close', (code, reason) => {
      logError({ level: 'WARN', message: `Realtime remote closed: ${code} ${reason || ''}`, endpoint: '/api/v1/realtime', method: 'WS', userId });
      try { client.close(); } catch {}
    });
    remote.on('error', (err: any) => {
      logError({ level: 'ERROR', message: `Realtime remote error: ${err?.message || 'unknown'}`, endpoint: '/api/v1/realtime', method: 'WS', userId, stack: err?.stack });
      try { client.send(JSON.stringify({ type: 'error', error: 'remote_error' })); } catch {}
    });
    client.on('message', (data: any) => { if (opened) { try { remote.send(data); } catch {} } });
    client.on('close', (code, reason) => {
      logError({ level: 'INFO', message: `Client closed: ${code} ${reason || ''}`, endpoint: '/api/v1/realtime', method: 'WS', userId });
      try { remote.close(); } catch {}
    });
    client.on('error', (err: any) => {
      logError({ level: 'ERROR', message: `Client error: ${err?.message || 'unknown'}`, endpoint: '/api/v1/realtime', method: 'WS', userId, stack: err?.stack });
    });
  } catch {
    try { client.close(); } catch {}
  }
});
