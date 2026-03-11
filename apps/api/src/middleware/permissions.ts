/**
 * 权限控制中间件
 * 基于角色的访问控制 (RBAC)
 */

import { Request, Response, NextFunction } from 'express';

export type UserRole = 'guest' | 'user' | 'freelancer' | 'enterprise' | 'admin';

export type BillingPermission = 
  | 'balance:view'
  | 'balance:recharge'
  | 'billing:view'
  | 'billing:export'
  | 'earnings:view'
  | 'earnings:withdraw'
  | 'coupon:view'
  | 'coupon:redeem'
  | 'invoice:create'
  | 'admin:all';

export interface PermissionConfig {
  [key: string]: BillingPermission[];
}

// 角色权限配置
export const ROLE_PERMISSIONS: PermissionConfig = {
  guest: [
    'balance:view'
  ],
  user: [
    'balance:view',
    'balance:recharge',
    'billing:view',
    'coupon:view',
    'coupon:redeem'
  ],
  freelancer: [
    'balance:view',
    'balance:recharge',
    'billing:view',
    'billing:export',
    'earnings:view',
    'earnings:withdraw',
    'coupon:view',
    'coupon:redeem',
    'invoice:create'
  ],
  enterprise: [
    'balance:view',
    'balance:recharge',
    'billing:view',
    'billing:export',
    'earnings:view',
    'coupon:view',
    'coupon:redeem',
    'invoice:create'
  ],
  admin: [
    'admin:all'
  ]
};

// 扩展 Request 类型
declare global {
  namespace Express {
    interface Request {
      permissions?: BillingPermission[];
      userRole?: UserRole;
    }
  }
}

/**
 * 获取用户角色
 */
export function getUserRole(user: any): UserRole {
  if (!user) return 'guest';
  return (user.role as UserRole) || 'user';
}

/**
 * 获取用户权限列表
 */
export function getUserPermissions(role: UserRole): BillingPermission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * 检查用户是否有指定权限
 */
export function hasPermission(user: any, permission: BillingPermission): boolean {
  const role = getUserRole(user);
  const permissions = getUserPermissions(role);
  
  // Admin has all permissions
  if (role === 'admin') return true;
  
  return permissions.includes(permission);
}

/**
 * 检查用户是否有任一权限
 */
export function hasAnyPermission(user: any, permissions: BillingPermission[]): boolean {
  return permissions.some(p => hasPermission(user, p));
}

/**
 * 检查用户是否有所有权限
 */
export function hasAllPermissions(user: any, permissions: BillingPermission[]): boolean {
  return permissions.every(p => hasPermission(user, p));
}

/**
 * 权限验证中间件
 */
export function requirePermission(permission: BillingPermission) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (!hasPermission(user, permission)) {
      return res.status(403).json({
        success: false,
        message: '权限不足',
        required: permission,
        currentRole: getUserRole(user)
      });
    }
    
    // 附加权限信息到 request
    req.permissions = getUserPermissions(getUserRole(user));
    req.userRole = getUserRole(user);
    
    next();
  };
}

/**
 * 多权限验证中间件 (满足任一即可)
 */
export function requireAnyPermission(permissions: BillingPermission[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (!hasAnyPermission(user, permissions)) {
      return res.status(403).json({
        success: false,
        message: '权限不足',
        required: permissions,
        currentRole: getUserRole(user)
      });
    }
    
    req.permissions = getUserPermissions(getUserRole(user));
    req.userRole = getUserRole(user);
    
    next();
  };
}

/**
 * 角色验证中间件
 */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    const userRole = getUserRole(user);
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: '角色权限不足',
        requiredRoles: roles,
        currentRole: userRole
      });
    }
    
    req.permissions = getUserPermissions(userRole);
    req.userRole = userRole;
    
    next();
  };
}

/**
 * 获取用户权限信息 (用于前端)
 */
export function getPermissionInfo(user: any) {
  const role = getUserRole(user);
  const permissions = getUserPermissions(role);
  
  return {
    role,
    permissions,
    canViewBalance: hasPermission(user, 'balance:view'),
    canRecharge: hasPermission(user, 'balance:recharge'),
    canViewBilling: hasPermission(user, 'billing:view'),
    canExportBilling: hasPermission(user, 'billing:export'),
    canViewEarnings: hasPermission(user, 'earnings:view'),
    canWithdraw: hasPermission(user, 'earnings:withdraw'),
    canViewCoupons: hasPermission(user, 'coupon:view'),
    canRedeemCoupons: hasPermission(user, 'coupon:redeem'),
    canCreateInvoice: hasPermission(user, 'invoice:create'),
    isAdmin: role === 'admin'
  };
}
