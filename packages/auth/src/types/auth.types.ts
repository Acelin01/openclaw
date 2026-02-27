export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  ENTERPRISE = "ENTERPRISE",
  FREELANCER = "FREELANCER",
  CLIENT = "CLIENT",
  GUEST = "GUEST",
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  twoFactorCode?: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  role: UserRole;
  verificationCode?: string;
  referralCode?: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  iat: number;
  exp: number;
}

export interface SecurityConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  refreshTokenExpiresIn: string;
  bcryptRounds: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
  twoFactorWindow: number;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  token?: AuthToken;
  error?: AuthError;
}

export interface AuthError {
  code: string;
  message: string;
  details?: any;
}

export enum AuthErrorCode {
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  USER_DISABLED = "USER_DISABLED",
  EMAIL_NOT_VERIFIED = "EMAIL_NOT_VERIFIED",
  INVALID_TOKEN = "INVALID_TOKEN",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  TWO_FACTOR_REQUIRED = "TWO_FACTOR_REQUIRED",
  INVALID_TWO_FACTOR_CODE = "INVALID_TWO_FACTOR_CODE",
}

export interface ResourceAccess {
  resource: string;
  resourceId?: string;
  userId: string;
  role: UserRole;
  permissions: Permission[];
  isOwner: boolean;
}

export interface AccessControlRule {
  id: string;
  name: string;
  resource: string;
  action: string;
  roles: UserRole[];
  conditions?: Record<string, any>;
  isActive: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  result: "SUCCESS" | "FAILURE";
  details?: Record<string, any>;
}
