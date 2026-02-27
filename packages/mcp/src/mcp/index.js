/**
 * MCP (Model Context Protocol) Infrastructure
 * Based on design document: 互联网项目负责人智能体系统融合设计方案
 */
export var UserRole;
(function (UserRole) {
  UserRole["ADMIN"] = "admin";
  UserRole["PROJECT_MANAGER"] = "project_manager";
  UserRole["TEAM_LEAD"] = "team_lead";
  UserRole["DEVELOPER"] = "developer";
  UserRole["GUEST"] = "guest";
})(UserRole || (UserRole = {}));
export class SecurityGateway {
  /**
   * Check if the user has permission to execute the tool
   */
  canExecute(tool, context) {
    if (!tool.requiredRole) return true;
    const roleHierarchy = [
      UserRole.GUEST,
      UserRole.DEVELOPER,
      UserRole.TEAM_LEAD,
      UserRole.PROJECT_MANAGER,
      UserRole.ADMIN,
    ];
    const userRoleIndex = roleHierarchy.indexOf(context.role);
    const requiredRoleIndex = roleHierarchy.indexOf(tool.requiredRole);
    return userRoleIndex >= requiredRoleIndex;
  }
}
export class DataTransformationEngine {
  mappers = new Map();
  constructor() {
    this.registerMappers();
  }
  registerMappers() {
    // Jira to Internal Task
    this.mappers.set("jira_to_task", (data) => ({
      id: data.key,
      title: data.fields.summary,
      status: data.fields.status.name,
      priority: data.fields.priority.name,
      assignee: data.fields.assignee?.displayName,
      updatedAt: data.fields.updated,
    }));
    // GitHub to Internal Repo Activity
    this.mappers.set("github_to_activity", (data) => ({
      id: data.id,
      type: data.type,
      actor: data.actor.login,
      repo: data.repo.name,
      createdAt: data.created_at,
    }));
    // Figma to Internal Design Asset
    this.mappers.set("figma_to_asset", (data) => ({
      key: data.key,
      name: data.name,
      lastModified: data.last_modified,
      thumbnailUrl: data.thumbnail_url,
    }));
    // Slack to Internal Message
    this.mappers.set("slack_to_message", (data) => ({
      id: data.ts,
      channel: data.channel,
      user: data.user,
      text: data.text,
      timestamp: new Date(parseFloat(data.ts) * 1000).toISOString(),
    }));
    // AWS to Internal Resource
    this.mappers.set("aws_to_resource", (data) => ({
      id: data.InstanceId || data.ResourceId,
      type: data.ResourceType || "EC2",
      status: data.State?.Name || "active",
      region: data.Placement?.AvailabilityZone || "unknown",
      tags: data.Tags || [],
    }));
  }
  /**
   * Transform data between different formats
   */
  transform(data, mapperName) {
    const mapper = this.mappers.get(mapperName);
    if (!mapper) {
      console.warn(`No mapper found for ${mapperName}, returning raw data`);
      return data;
    }
    return mapper(data);
  }
}
/**
 * Capability Registry for tools
 */
export class ToolRegistry {
  tools = new Map();
  healthMetrics = new Map();
  register(tool) {
    this.tools.set(tool.name, tool);
    this.healthMetrics.set(tool.name, { successRate: 1.0, avgLatency: 100 });
    console.log(`Tool registered: ${tool.name}`);
  }
  getTool(name) {
    return this.tools.get(name);
  }
  getAllTools() {
    return Array.from(this.tools.values());
  }
  updateMetrics(name, success, latency) {
    const metrics = this.healthMetrics.get(name) || { successRate: 1.0, avgLatency: 100 };
    metrics.successRate = metrics.successRate * 0.9 + (success ? 0.1 : 0);
    metrics.avgLatency = metrics.avgLatency * 0.9 + latency * 0.1;
    this.healthMetrics.set(name, metrics);
  }
  getMetrics(name) {
    return this.healthMetrics.get(name);
  }
}
export class MCPRouter {
  registry;
  securityGateway;
  constructor(registry, securityGateway = new SecurityGateway()) {
    this.registry = registry;
    this.securityGateway = securityGateway;
  }
  /**
   * Capability-based Routing
   */
  findToolByCapability(capability) {
    return this.registry.getAllTools().find((t) => t.capabilities?.includes(capability));
  }
  /**
   * Performance-aware & Cost-optimized Routing
   */
  findOptimalTool(capability) {
    const candidates = this.registry
      .getAllTools()
      .filter((t) => t.capabilities?.includes(capability));
    if (candidates.length === 0) return undefined;
    return candidates.sort((a, b) => {
      const metricsA = this.registry.getMetrics(a.name);
      const metricsB = this.registry.getMetrics(b.name);
      // Score = (SuccessRate * 0.5) - (Latency / 1000 * 0.3) - (Cost / 100 * 0.2)
      const scoreA =
        metricsA.successRate * 0.5 -
        (metricsA.avgLatency / 1000) * 0.3 -
        ((a.cost || 50) / 100) * 0.2;
      const scoreB =
        metricsB.successRate * 0.5 -
        (metricsB.avgLatency / 1000) * 0.3 -
        ((b.cost || 50) / 100) * 0.2;
      return scoreB - scoreA;
    })[0];
  }
  async route(request, securityContext) {
    const actionParts = request.body.action.split(".");
    const toolNameOrCapability = actionParts[0];
    // Try tool name first
    let tool = this.registry.getTool(toolNameOrCapability);
    // If not found, try capability-based routing
    if (!tool) {
      tool = this.findOptimalTool(toolNameOrCapability);
    }
    if (!tool) {
      throw new Error(`Tool or capability not found: ${toolNameOrCapability}`);
    }
    // RBAC Check
    if (securityContext && !this.securityGateway.canExecute(tool, securityContext)) {
      throw new Error(
        `Permission denied: User role ${securityContext.role} cannot execute tool ${tool.name}`,
      );
    }
    const startTime = Date.now();
    try {
      const result = await tool.handler(request.body.parameters, securityContext);
      this.registry.updateMetrics(tool.name, true, Date.now() - startTime);
      return result;
    } catch (error) {
      this.registry.updateMetrics(tool.name, false, Date.now() - startTime);
      throw error;
    }
  }
}
export class PredictiveEngine {
  /**
   * Predict project risks and delays based on current metrics
   */
  analyzeProjectRisks(tasks, agents = []) {
    const risks = [];
    // 1. 进度风险 (Schedule Risks)
    const delayedTasks = tasks.filter((t) => t.status === "delayed" && t.priority === "high");
    delayedTasks.forEach((t) => {
      risks.push({
        type: "SCHEDULE_RISK",
        severity: "high",
        target: t.id,
        message: `关键路径任务 ${t.id} 出现延迟`,
        recommendation: "建议协调技术专家介入或调整资源分配",
      });
    });
    // 2. 资源瓶颈风险 (Resource Bottlenecks)
    const overloadedAgents = agents.filter((a) => a.load > 80);
    overloadedAgents.forEach((a) => {
      risks.push({
        type: "RESOURCE_BOTTLENECK",
        severity: "medium",
        target: a.name,
        message: `${a.name} 当前负荷过高 (${a.load}%)`,
        recommendation: "考虑将非核心任务分配给其他成员或引入外部资源",
      });
    });
    // 3. 协作质量风险 (Quality Risks)
    const failedCollaborations = tasks.filter(
      (t) => t.status === "failed" && t.type === "coordination",
    );
    if (failedCollaborations.length > 2) {
      risks.push({
        type: "QUALITY_RISK",
        severity: "medium",
        target: "System",
        message: "近期跨智能体协作失败率上升",
        recommendation: "建议检查 ACP 2.0 协议一致性或重置相关智能体上下文",
      });
    }
    return risks;
  }
}
/**
 * Unified MCP Server Implementation
 */
export class UnifiedMCPServer {
  registry;
  router;
  securityGateway;
  transformationEngine;
  predictiveEngine;
  constructor() {
    this.registry = new ToolRegistry();
    this.securityGateway = new SecurityGateway();
    this.transformationEngine = new DataTransformationEngine();
    this.predictiveEngine = new PredictiveEngine();
    this.router = new MCPRouter(this.registry, this.securityGateway);
  }
  getRegistry() {
    return this.registry;
  }
  getRouter() {
    return this.router;
  }
  getSecurityGateway() {
    return this.securityGateway;
  }
  getTransformationEngine() {
    return this.transformationEngine;
  }
  getPredictiveEngine() {
    return this.predictiveEngine;
  }
  async handleMessage(message, securityContext) {
    return this.router.route(message, securityContext);
  }
  async getHealthStatus() {
    return this.registry.getAllTools().map((tool) => ({
      name: tool.name,
      metrics: this.registry.getMetrics(tool.name),
    }));
  }
  async getDashboardData(projectId) {
    const tools = this.registry.getAllTools();
    const metrics = tools.map((t) => ({ name: t.name, ...this.registry.getMetrics(t.name) }));
    const risks = this.predictiveEngine.analyzeProjectRisks([], []);
    return {
      metrics,
      risks,
      projectId,
    };
  }
}
//# sourceMappingURL=index.js.map
