import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

export const setupSocketHandlers = (io: Server) => {
  // Middleware for authentication
  io.use((socket: Socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      
      if (!token) {
        console.log(`[SocketIO] No token provided for socket ${socket.id}, allowing connection for guest/debug`);
        return next();
      }

      const secret = process.env.JWT_SECRET || 'dev-secret';
      jwt.verify(token, secret, (err: any, decoded: any) => {
        if (err) {
          console.error(`[SocketIO] Auth error for socket ${socket.id}:`, err.message);
          return next(); // Still allow connection but without user info for debugging
        }
        
        (socket as any).user = decoded;
        console.log(`[SocketIO] Auth success for socket ${socket.id}, user:`, decoded.email || decoded.id);
        next();
      });
    } catch (err) {
      console.error(`[SocketIO] Internal auth error for socket ${socket.id}:`, err);
      next();
    }
  });

  io.on('connection', (socket) => {
    const user = (socket as any).user;
    console.log('用户连接:', socket.id, 'User:', user?.email);

    // Auto-join personal room
    if (user?.id) {
      const room = `user:${user.id}`;
      socket.join(room);
      console.log(`用户 ${socket.id} 自动加入用户房间 ${room}`);
    }

    socket.on('join', (data: any) => {
      const userId = typeof data === 'string' ? data : data?.userId;
      if (userId && userId === user?.id) {
        const room = `user:${userId}`;
        socket.join(room);
        console.log(`用户 ${socket.id} 加入用户房间 ${room}`);
      }
    });

    socket.on('join-conversation', (conversationId: string) => {
      socket.join(conversationId);
      console.log(`用户 ${socket.id} 加入对话 ${conversationId}`);
    });

    socket.on('leave-conversation', (conversationId: string) => {
      socket.leave(conversationId);
      console.log(`用户 ${socket.id} 离开对话 ${conversationId}`);
    });

    socket.on('send-message', (data) => {
      const { conversationId, message } = data;
      socket.to(conversationId).emit('new-message', message);
    });

    socket.on('typing', (data: { conversationId: string; isTyping: boolean; senderId?: string }) => {
      if (!data?.conversationId) return;
      socket.to(data.conversationId).emit('typing', data);
    });

    socket.on('disconnect', () => {
      console.log('用户断开连接:', socket.id);
    });
  });
};
