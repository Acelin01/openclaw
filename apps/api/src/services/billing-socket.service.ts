/**
 * 计费 WebSocket 服务
 * 支持实时扣费推送、余额更新通知、账单变更订阅
 */

import { Server, Socket } from 'socket.io';
import { billingService } from './billing.service.js';
import jwt from 'jsonwebtoken';

interface BillingSocketData {
  userId: string;
  email?: string;
}

export class BillingSocketService {
  private static instance: BillingSocketService;
  private io: Server | null = null;
  private userSockets: Map<string, Set<string>> = new Map();
  private orderTimers: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {}

  static getInstance(): BillingSocketService {
    if (!BillingSocketService.instance) {
      BillingSocketService.instance = new BillingSocketService();
    }
    return BillingSocketService.instance;
  }

  initialize(io: Server): void {
    this.io = io;
    this.setupBillingSocketHandlers();
    this.setupBillingServiceListeners();
    console.log('[BillingSocket] Service initialized');
  }

  private setupBillingSocketHandlers(): void {
    if (!this.io) return;

    // Billing namespace
    const billingNamespace = this.io.of('/billing');

    billingNamespace.use((socket: Socket, next) => {
      try {
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;
        
        if (!token) {
          return next(new Error('Authentication required'));
        }

        const secret = process.env.JWT_SECRET || 'dev-secret';
        jwt.verify(token, secret, (err: any, decoded: any) => {
          if (err) {
            return next(new Error('Invalid token'));
          }
          
          (socket.data as any).user = decoded;
          next();
        });
      } catch (err) {
        next(new Error('Auth error'));
      }
    });

    billingNamespace.on('connection', (socket: Socket) => {
      const user: BillingSocketData = (socket.data as any).user;
      console.log(`[BillingSocket] User connected: ${user.userId} (${socket.id})`);

      // Track user socket
      if (!this.userSockets.has(user.userId)) {
        this.userSockets.set(user.userId, new Set());
      }
      this.userSockets.get(user.userId)!.add(socket.id);

      // Auto-join user room
      socket.join(`user:${user.userId}`);

      // Subscribe to billing events
      socket.on('billing:subscribe', (data: { orderId?: string }) => {
        if (data.orderId) {
          socket.join(`order:${data.orderId}`);
          console.log(`[BillingSocket] User ${user.userId} subscribed to order ${data.orderId}`);
        }
        socket.join(`billing:${user.userId}`);
      });

      // Unsubscribe from billing events
      socket.on('billing:unsubscribe', (data: { orderId?: string }) => {
        if (data.orderId) {
          socket.leave(`order:${data.orderId}`);
        }
        socket.leave(`billing:${user.userId}`);
      });

      // Start billing request
      socket.on('billing:start', (data: { orderId: string; ratePerHour: number; intervalSeconds?: number }) => {
        billingService.startBillingTimer(
          data.orderId,
          user.userId,
          data.ratePerHour,
          data.intervalSeconds || 6
        );
      });

      // Stop billing request
      socket.on('billing:stop', (data: { orderId: string }) => {
        billingService.stopBillingTimer(data.orderId);
      });

      // Get billing status
      socket.on('billing:status', (data: { orderId: string }, callback?: (status: any) => void) => {
        const status = billingService.getBillingStatus(data.orderId);
        if (callback) callback(status);
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`[BillingSocket] User disconnected: ${user.userId} (${socket.id})`);
        
        const sockets = this.userSockets.get(user.userId);
        if (sockets) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            this.userSockets.delete(user.userId);
          }
        }
      });
    });
  }

  private setupBillingServiceListeners(): void {
    // Listen to billing service events
    billingService.on('billing:tick', (data) => {
      this.emitToUser(data.userId, 'billing:tick', {
        orderId: data.orderId,
        elapsedSeconds: data.elapsedSeconds,
        currentCost: data.currentCost,
        ratePerInterval: data.ratePerInterval,
        balance: data.balance
      });
      
      this.emitToOrder(data.orderId, 'billing:tick', data);
    });

    billingService.on('billing:started', (data) => {
      this.emitToUser(data.userId, 'billing:started', {
        orderId: data.orderId,
        ratePerHour: data.ratePerHour,
        intervalSeconds: data.intervalSeconds
      });
    });

    billingService.on('billing:stopped', (data) => {
      this.emitToOrder(data.orderId, 'billing:stopped', data);
    });

    billingService.on('billing:low_balance', (data) => {
      this.emitToUser(data.userId, 'billing:low_balance', {
        orderId: data.orderId,
        currentBalance: data.currentBalance,
        required: data.required
      });
    });

    billingService.on('billing:error', (data) => {
      this.emitToUser(data.userId, 'billing:error', {
        orderId: data.orderId,
        error: data.error?.message || 'Unknown error'
      });
    });

    billingService.on('balance:updated', (data) => {
      this.emitToUser(data.userId, 'balance:updated', {
        balance: data.balance,
        type: data.type
      });
    });

    billingService.on('earnings:added', (data) => {
      this.emitToUser(data.userId, 'earnings:updated', {
        orderId: data.orderId,
        serviceFee: data.serviceFee,
        actualAmount: data.actualAmount
      });
    });

    billingService.on('earnings:settled', (data) => {
      this.emitToUser(data.userId, 'earnings:settled', {
        earningsId: data.earningsId,
        amount: data.amount
      });
    });

    billingService.on('withdrawal:requested', (data) => {
      this.emitToUser(data.userId, 'withdrawal:requested', {
        amount: data.amount,
        bankName: data.bankName
      });
    });
  }

  private emitToUser(userId: string, event: string, data: any): void {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit(event, data);
    console.log(`[BillingSocket] Emit ${event} to user ${userId}`);
  }

  private emitToOrder(orderId: string, event: string, data: any): void {
    if (!this.io) return;
    this.io.to(`order:${orderId}`).emit(event, data);
    console.log(`[BillingSocket] Emit ${event} to order ${orderId}`);
  }

  // Public methods for external use
  notifyBalanceUpdate(userId: string, balance: number): void {
    this.emitToUser(userId, 'balance:updated', { balance });
  }

  notifyEarningsUpdate(userId: string, earnings: any): void {
    this.emitToUser(userId, 'earnings:updated', earnings);
  }

  notifyWithdrawalStatus(userId: string, status: string, withdrawalId: string): void {
    this.emitToUser(userId, 'withdrawal:status_updated', {
      withdrawalId,
      status
    });
  }

  // Get connected users count
  getConnectedUsersCount(): number {
    return this.userSockets.size;
  }

  // Get user socket count
  getUserSocketCount(userId: string): number {
    return this.userSockets.get(userId)?.size || 0;
  }
}

export const billingSocketService = BillingSocketService.getInstance();
