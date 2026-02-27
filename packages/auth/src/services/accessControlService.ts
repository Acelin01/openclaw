import {
  User,
  UserRole,
  Permission,
  AccessControlRule,
  ResourceAccess,
  AuthError,
  AuthErrorCode,
} from "../types/auth.types";

export class AccessControlService {
  private rules: Map<string, AccessControlRule> = new Map();
  private defaultPermissions: Map<UserRole, Permission[]> = new Map();

  constructor() {
    this.initializeDefaultPermissions();
    this.initializeDefaultRules();
  }

  /**
   * Check if user has permission to perform action on resource
   */
  canAccess(user: User, action: string, resource: string, resourceId?: string): boolean {
    // Super admin can access everything
    if (user.role === UserRole.SUPER_ADMIN) {
      return true;
    }

    // Check if user is active
    if (!user.isActive) {
      return false;
    }

    // Find applicable rules for this resource and action
    const applicableRules = this.getApplicableRules(user.role, action, resource);

    if (applicableRules.length === 0) {
      // No rules found, check if user has the permission directly
      return this.hasDirectPermission(user, action, resource);
    }

    // Check rules in order of priority
    applicableRules.sort((a, b) => b.priority - a.priority);

    for (const rule of applicableRules) {
      if (this.evaluateRule(rule, user, action, resource, resourceId)) {
        return rule.isActive;
      }
    }

    // No matching rule found, deny access by default
    return false;
  }

  /**
   * Get user's permissions for a specific resource
   */
  getPermissions(user: User, resource: string, resourceId?: string): Permission[] {
    if (user.role === UserRole.SUPER_ADMIN) {
      return this.getAllPermissions();
    }

    const permissions: Permission[] = [];

    // Add default role permissions
    const defaultPerms = this.defaultPermissions.get(user.role) || [];
    permissions.push(...defaultPerms.filter((p) => p.resource === resource));

    // Add user-specific permissions
    permissions.push(...user.permissions.filter((p) => p.resource === resource));

    // Filter permissions based on access control rules
    return permissions.filter((permission) =>
      this.canAccess(user, permission.action, permission.resource, resourceId),
    );
  }

  /**
   * Add a new access control rule
   */
  addRule(rule: AccessControlRule): void {
    this.rules.set(rule.id, rule);
  }

  /**
   * Remove an access control rule
   */
  removeRule(ruleId: string): void {
    this.rules.delete(ruleId);
  }

  /**
   * Update an existing access control rule
   */
  updateRule(ruleId: string, updates: Partial<AccessControlRule>): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      const updatedRule = { ...rule, ...updates, updatedAt: new Date() };
      this.rules.set(ruleId, updatedRule);
    }
  }

  /**
   * Get all rules for a specific role
   */
  getRulesByRole(role: UserRole): AccessControlRule[] {
    return Array.from(this.rules.values()).filter((rule) => rule.roles.includes(role));
  }

  /**
   * Check resource ownership
   */
  isResourceOwner(user: User, resource: string, resourceId: string): boolean {
    // This is a simplified implementation
    // In a real system, this would check the database for ownership
    const ownershipRules: Record<string, string> = {
      project: "ownerId",
      task: "assignedToId",
      profile: "userId",
      subscription: "userId",
    };

    const ownerField = ownershipRules[resource];
    if (!ownerField) {
      return false;
    }

    // For now, we'll assume the resourceId contains the owner information
    // In a real implementation, this would query the database
    return resourceId === user.id;
  }

  /**
   * Create resource access context
   */
  createResourceAccess(user: User, resource: string, resourceId?: string): ResourceAccess {
    return {
      resource,
      resourceId,
      userId: user.id,
      role: user.role,
      permissions: this.getPermissions(user, resource, resourceId),
      isOwner: resourceId ? this.isResourceOwner(user, resource, resourceId) : false,
    };
  }

  /**
   * Check if user can perform bulk operations
   */
  canPerformBulkOperation(
    user: User,
    action: string,
    resource: string,
    resourceIds: string[],
  ): {
    allowed: boolean;
    allowedIds: string[];
    deniedIds: string[];
  } {
    const allowedIds: string[] = [];
    const deniedIds: string[] = [];

    for (const resourceId of resourceIds) {
      if (this.canAccess(user, action, resource, resourceId)) {
        allowedIds.push(resourceId);
      } else {
        deniedIds.push(resourceId);
      }
    }

    return {
      allowed: deniedIds.length === 0,
      allowedIds,
      deniedIds,
    };
  }

  private initializeDefaultPermissions(): void {
    // GUEST permissions
    this.defaultPermissions.set(UserRole.GUEST, [
      { id: "guest-read-profile", name: "Read own profile", resource: "profile", action: "read" },
      {
        id: "guest-update-own-profile",
        name: "Update own profile",
        resource: "profile",
        action: "update",
      },
    ]);

    // CLIENT permissions
    this.defaultPermissions.set(UserRole.CLIENT, [
      { id: "client-read-profile", name: "Read own profile", resource: "profile", action: "read" },
      {
        id: "client-update-own-profile",
        name: "Update own profile",
        resource: "profile",
        action: "update",
      },
      {
        id: "client-create-project",
        name: "Create projects",
        resource: "project",
        action: "create",
      },
      {
        id: "client-read-own-projects",
        name: "Read own projects",
        resource: "project",
        action: "read",
      },
      {
        id: "client-update-own-projects",
        name: "Update own projects",
        resource: "project",
        action: "update",
      },
      { id: "client-create-task", name: "Create tasks", resource: "task", action: "create" },
      { id: "client-read-own-tasks", name: "Read own tasks", resource: "task", action: "read" },
      {
        id: "client-create-subscription",
        name: "Create subscriptions",
        resource: "subscription",
        action: "create",
      },
      {
        id: "client-read-own-subscriptions",
        name: "Read own subscriptions",
        resource: "subscription",
        action: "read",
      },
    ]);

    // FREELANCER permissions
    this.defaultPermissions.set(UserRole.FREELANCER, [
      {
        id: "freelancer-read-profile",
        name: "Read own profile",
        resource: "profile",
        action: "read",
      },
      {
        id: "freelancer-update-own-profile",
        name: "Update own profile",
        resource: "profile",
        action: "update",
      },
      {
        id: "freelancer-read-projects",
        name: "Read projects",
        resource: "project",
        action: "read",
      },
      {
        id: "freelancer-submit-proposal",
        name: "Submit proposals",
        resource: "proposal",
        action: "create",
      },
      {
        id: "freelancer-read-own-proposals",
        name: "Read own proposals",
        resource: "proposal",
        action: "read",
      },
      {
        id: "freelancer-update-own-proposals",
        name: "Update own proposals",
        resource: "proposal",
        action: "update",
      },
      {
        id: "freelancer-complete-task",
        name: "Complete tasks",
        resource: "task",
        action: "complete",
      },
      {
        id: "freelancer-read-assigned-tasks",
        name: "Read assigned tasks",
        resource: "task",
        action: "read",
      },
    ]);

    // ENTERPRISE permissions
    this.defaultPermissions.set(UserRole.ENTERPRISE, [
      {
        id: "enterprise-read-profile",
        name: "Read own profile",
        resource: "profile",
        action: "read",
      },
      {
        id: "enterprise-update-own-profile",
        name: "Update own profile",
        resource: "profile",
        action: "update",
      },
      {
        id: "enterprise-create-project",
        name: "Create projects",
        resource: "project",
        action: "create",
      },
      {
        id: "enterprise-read-all-projects",
        name: "Read all company projects",
        resource: "project",
        action: "read",
      },
      {
        id: "enterprise-update-company-projects",
        name: "Update company projects",
        resource: "project",
        action: "update",
      },
      {
        id: "enterprise-delete-company-projects",
        name: "Delete company projects",
        resource: "project",
        action: "delete",
      },
      {
        id: "enterprise-manage-employees",
        name: "Manage employees",
        resource: "employee",
        action: "manage",
      },
      {
        id: "enterprise-view-analytics",
        name: "View analytics",
        resource: "analytics",
        action: "read",
      },
    ]);

    // ADMIN permissions
    this.defaultPermissions.set(UserRole.ADMIN, [
      {
        id: "admin-read-all-profiles",
        name: "Read all profiles",
        resource: "profile",
        action: "read",
      },
      {
        id: "admin-update-any-profile",
        name: "Update any profile",
        resource: "profile",
        action: "update",
      },
      {
        id: "admin-delete-any-profile",
        name: "Delete any profile",
        resource: "profile",
        action: "delete",
      },
      {
        id: "admin-read-all-projects",
        name: "Read all projects",
        resource: "project",
        action: "read",
      },
      {
        id: "admin-update-any-project",
        name: "Update any project",
        resource: "project",
        action: "update",
      },
      {
        id: "admin-delete-any-project",
        name: "Delete any project",
        resource: "project",
        action: "delete",
      },
      {
        id: "admin-manage-subscriptions",
        name: "Manage subscriptions",
        resource: "subscription",
        action: "manage",
      },
      {
        id: "admin-view-all-analytics",
        name: "View all analytics",
        resource: "analytics",
        action: "read",
      },
      { id: "admin-manage-users", name: "Manage users", resource: "user", action: "manage" },
      { id: "admin-manage-roles", name: "Manage roles", resource: "role", action: "manage" },
    ]);
  }

  private initializeDefaultRules(): void {
    // Owner-based rules
    this.addRule({
      id: "owner-full-access",
      name: "Owner has full access to their resources",
      resource: "*",
      action: "*",
      roles: [UserRole.CLIENT, UserRole.FREELANCER, UserRole.ENTERPRISE],
      conditions: { isOwner: true },
      isActive: true,
      priority: 1000,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Subscription-based rules
    this.addRule({
      id: "subscription-required-premium",
      name: "Premium features require active subscription",
      resource: "premium-feature",
      action: "access",
      roles: [UserRole.CLIENT, UserRole.FREELANCER],
      conditions: { hasActiveSubscription: true },
      isActive: true,
      priority: 900,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Enterprise-specific rules
    this.addRule({
      id: "enterprise-employee-limit",
      name: "Enterprise can only manage their own employees",
      resource: "employee",
      action: "manage",
      roles: [UserRole.ENTERPRISE],
      conditions: { sameCompany: true },
      isActive: true,
      priority: 800,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  private getApplicableRules(
    role: UserRole,
    action: string,
    resource: string,
  ): AccessControlRule[] {
    return Array.from(this.rules.values()).filter(
      (rule) =>
        rule.isActive &&
        rule.roles.includes(role) &&
        (rule.action === "*" || rule.action === action) &&
        (rule.resource === "*" || rule.resource === resource),
    );
  }

  private evaluateRule(
    rule: AccessControlRule,
    user: User,
    action: string,
    resource: string,
    resourceId?: string,
  ): boolean {
    if (!rule.conditions) {
      return true;
    }

    for (const [condition, value] of Object.entries(rule.conditions)) {
      switch (condition) {
        case "isOwner":
          if (value === true && resourceId && !this.isResourceOwner(user, resource, resourceId)) {
            return false;
          }
          break;
        case "hasActiveSubscription":
          // This would check user's subscription status in a real implementation
          break;
        case "sameCompany":
          // This would check if user and resource belong to same company
          break;
      }
    }

    return true;
  }

  private hasDirectPermission(user: User, action: string, resource: string): boolean {
    const userPermissions = user.permissions || [];
    const defaultRolePermissions = this.defaultPermissions.get(user.role) || [];

    const allPermissions = [...defaultRolePermissions, ...userPermissions];

    return allPermissions.some(
      (permission) => permission.action === action && permission.resource === resource,
    );
  }

  private getAllPermissions(): Permission[] {
    // Return all possible permissions for super admin
    return [{ id: "super-admin-all", name: "All permissions", resource: "*", action: "*" }];
  }
}
