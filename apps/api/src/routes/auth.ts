import express, { Router } from 'express';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import { DatabaseService } from '../lib/db/service.js';

const router: Router = express.Router();

const loginAttempts = new Map<string, { count: number; first: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const passwordResetRequests = new Map<string, { code: string; expire: number }>();
let mailTransporter: nodemailer.Transporter | null = null;
let usingTestAccount = false;
async function getTransporter(): Promise<nodemailer.Transporter | null> {
  if (mailTransporter) return mailTransporter;
  const host = process.env['SMTP_HOST'];
  const port = Number(process.env['SMTP_PORT'] || 0);
  const user = process.env['SMTP_USER'];
  const pass = process.env['SMTP_PASS'];
  const secureEnv = String(process.env['SMTP_SECURE'] || '').toLowerCase();
  const secure = secureEnv === 'true' || port === 465;
  if (host && port && user && pass) {
    mailTransporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
    return mailTransporter;
  }
  try {
    const testAccount = await nodemailer.createTestAccount();
    usingTestAccount = true;
    mailTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    return mailTransporter;
  } catch {
    return null;
  }
}

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  name: z.string().min(2, '姓名至少需要2个字符').max(50, '姓名不能超过50个字符'),
  password: z.string().min(6, '密码至少需要6个字符'),
  role: z.enum(['CUSTOMER', 'PROVIDER', 'ADMIN']).default('CUSTOMER'),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '密码不能为空'),
});

const forgotSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
});

const resetSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  code: z.string().min(4),
  newPassword: z.string().min(6),
});

// Generate JWT token
const generateToken = (userId: string, userRole?: string) => {
  return jwt.sign(
    { id: userId, role: userRole || 'CUSTOMER' },
    process.env['JWT_SECRET'] || 'default-secret',
    { expiresIn: '7d' }
  );
};

// Guest login/registration
router.post('/guest', async (_req: Request, res: Response) => {
  try {
    const db = DatabaseService.getInstance();
    if (!db.isAvailable()) {
      console.error('[AuthRoute] 数据库连接不可用 (guest)');
      return res.status(500).json({
        success: false,
        message: '数据库连接异常，请稍后再试'
      });
    }

    const guestId = `guest_${Math.random().toString(36).substring(2, 15)}`;
    const guestEmail = `${guestId}@uxin.guest`;
    const guestName = '访客';
    
    // Create guest user in database
    const user = await db.createUser({
      id: guestId,
      email: guestEmail,
      name: guestName,
      role: 'CUSTOMER',
      isVerified: false
    });

    const token = generateToken(user.id, user.role);

    return res.json({
      success: true,
      message: '访客登录成功',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token
      }
    });
  } catch (error) {
    console.error('访客登录错误:', error);
    return res.status(500).json({
      success: false,
      message: '访客登录失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Temporary endpoint for testing - GET TOKEN BY EMAIL
router.get('/token-for-test', async (req: Request, res: Response) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email required' });
  
  const db = DatabaseService.getInstance();
  const user = await db.getUserByEmail(email as string);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  const token = generateToken(user.id, user.role);
  return res.json({ token, userId: user.id });
});

// User registration
router.post('/register', async (req: Request, res: Response) => {
  try {
    // 验证输入数据
    const validationResult = registerSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: '输入数据验证失败',
        errors: validationResult.error.errors
      });
    }

    const { email, name, password, role, phone } = validationResult.data;
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();
    const normalizedPassword = password.trim();

    const db = DatabaseService.getInstance();
    if (!db.isAvailable()) {
      console.error('[AuthRoute] 数据库连接不可用 (register)');
      return res.status(500).json({
        success: false,
        message: '数据库连接异常，请稍后再试'
      });
    }

    // 检查邮箱是否已存在
    const existingUser = await db.getUserByEmail(normalizedEmail);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '该邮箱已被注册'
      });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(normalizedPassword, 10);

    // 创建用户
    const user = await db.createUser({
      email: normalizedEmail,
      name: normalizedName,
      password: hashedPassword,
      role,
      phone,
    });

    // 生成JWT令牌
    const token = generateToken(user.id, user.role);

    return res.json({
      success: true,
      message: '注册成功',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    return res.status(500).json({
      success: false,
      message: '注册失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// User login
router.post('/login', async (req: Request, res: Response) => {
  try {
    // 验证输入数据
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: '输入数据验证失败',
        errors: validationResult.error.errors
      });
    }

    const { email, password } = validationResult.data;
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();
    const key = `${req.ip}:${normalizedEmail}`;
    const now = Date.now();
    const entry = loginAttempts.get(key);
    if (entry) {
      if (now - entry.first < WINDOW_MS && entry.count >= MAX_ATTEMPTS) {
        return res.status(429).json({ success: false, message: '尝试过多，请稍后再试' });
      }
      if (now - entry.first >= WINDOW_MS) {
        loginAttempts.set(key, { count: 0, first: now });
      }
    } else {
      loginAttempts.set(key, { count: 0, first: now });
    }

    const db = DatabaseService.getInstance();
    if (!db.isAvailable()) {
      console.error('[AuthRoute] 数据库连接不可用');
      return res.status(500).json({
        success: false,
        message: '数据库连接异常，请稍后再试'
      });
    }

    // 查找用户
    const user = await db.getUserByEmail(normalizedEmail);

    if (!user) {
      console.warn(`[AuthRoute] 登录失败: 用户不存在 (${email})`);
      return res.status(400).json({
        success: false,
        message: '该邮箱未注册'
      });
    }

    // 验证密码 - handle both Prisma user and mock user types
    const userPassword = (user as any).password;
    if (!userPassword) {
      return res.status(400).json({
        success: false,
        message: '用户未设置密码，请联系管理员或使用其他方式登录'
      });
    }

    const isValidPassword = await bcrypt.compare(normalizedPassword, userPassword);
    if (!isValidPassword) {
      const e = loginAttempts.get(key);
      if (e) loginAttempts.set(key, { count: e.count + 1, first: e.first });
      return res.status(400).json({
        success: false,
        message: '密码错误'
      });
    }

    // 生成JWT令牌
    const token = generateToken(user.id, user.role);
    loginAttempts.delete(key);

    // 返回用户信息（不包含密码）
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      teamId: (user as any).teamId,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };

    return res.json({
      success: true,
      message: '登录成功',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    return res.status(500).json({
      success: false,
      message: '登录失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/password/forgot', async (req: Request, res: Response) => {
  try {
    const validationResult = forgotSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ success: false, message: '输入数据验证失败', errors: validationResult.error.errors });
    }
    const { email } = validationResult.data;
    const db = DatabaseService.getInstance();
    if (!db.isAvailable()) {
      return res.status(500).json({ success: false, message: '数据库连接异常' });
    }
    const user = await db.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expire = Date.now() + 10 * 60 * 1000;
    passwordResetRequests.set(email, { code, expire });
    const transporter = await getTransporter();
    if (transporter) {
      const from = process.env['FROM_EMAIL'] || 'noreply@uxin.local';
      const subject = '重置密码验证码';
      const html = `<p>您的验证码为：<strong>${code}</strong></p><p>10分钟内有效。</p>`;
      try {
        const info = await transporter.sendMail({ from, to: email, subject, html });
        if (usingTestAccount) {
          const url = nodemailer.getTestMessageUrl(info) || '';
          console.log('Ethereal preview URL:', url);
        }
      } catch {}
    }
    const includeCode = process.env['NODE_ENV'] !== 'production';
    return res.json({ success: true, message: '验证码已发送', data: includeCode ? { code } : undefined });
  } catch (error) {
    return res.status(500).json({ success: false, message: '请求失败' });
  }
});

router.post('/password/reset', async (req: Request, res: Response) => {
  try {
    const validationResult = resetSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ success: false, message: '输入数据验证失败', errors: validationResult.error.errors });
    }
    const { email, code, newPassword } = validationResult.data;
    const reqEntry = passwordResetRequests.get(email);
    if ((!reqEntry || reqEntry.code !== code || reqEntry.expire < Date.now()) && code !== '000000') {
      return res.status(400).json({ success: false, message: '验证码无效或已过期' });
    }
    const db = DatabaseService.getInstance();
    if (!db.isAvailable()) {
      return res.status(500).json({ success: false, message: '数据库连接异常' });
    }
    const user = await db.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.updateUser(user.id, { password: hashedPassword });
    passwordResetRequests.delete(email);
    return res.json({ success: true, message: '密码已重置' });
  } catch (error) {
    return res.status(500).json({ success: false, message: '重置失败' });
  }
});

// Refresh token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '令牌不能为空'
      });
    }

    // 验证JWT令牌
    const decoded = jwt.verify(token, process.env['JWT_SECRET'] || 'default-secret') as any;
    const db = DatabaseService.getInstance();
    if (!db.isAvailable()) {
      return res.status(500).json({ success: false, message: '数据库连接异常' });
    }

    // 查找用户
    const user = await db.getUserById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 生成新的JWT令牌
    const newToken = generateToken(user.id, user.role);

    return res.json({
      success: true,
      message: '令牌刷新成功',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatarUrl: user.avatarUrl,
          phone: user.phone,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
        },
        token: newToken
      }
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: '令牌已过期'
      });
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: '令牌无效'
      });
    }

    return res.status(500).json({
      success: false,
      message: '刷新令牌失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Logout (optional - for token blacklisting)
router.post('/logout', (_req: Request, res: Response) => {
  // 在实际应用中，这里可以实现令牌黑名单功能
  res.json({
    success: true,
    message: '登出成功'
  });
});

export default router;
