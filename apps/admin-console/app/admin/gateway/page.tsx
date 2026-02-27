import { prisma } from "../../../lib/db";
import { resolveDefaultTenantId } from "../../../lib/auth";
import GatewayCallForm from "./GatewayCallForm";
import GatewayRequestTable from "./GatewayRequestTable";

export default async function GatewayPage() {
  const [logs, tenants, roles, projects] = await Promise.all([
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.tenant.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.role.findMany({ orderBy: { createdAt: "desc" }, include: { tenant: true } }),
    prisma.project.findMany({ orderBy: { createdAt: "desc" }, include: { tenant: true } }),
  ]);
  const fallbackTenantId = resolveDefaultTenantId() ?? tenants[0]?.id ?? "";
  const requests = await prisma.gatewayCallRequest.findMany({
    orderBy: { requestedAt: "desc" },
    take: 20,
    where: fallbackTenantId ? { tenantId: fallbackTenantId } : undefined,
  });
  return (
    <section>
      <h1>网关调用</h1>
      <GatewayCallForm
        tenants={tenants.map((tenant) => ({ id: tenant.id, name: tenant.name }))}
        roles={roles.map((role) => ({
          id: role.id,
          name: role.name,
          tenantId: role.tenantId,
          tenantName: role.tenant?.name ?? role.tenantId,
        }))}
        projects={projects.map((project) => ({
          id: project.id,
          name: project.name,
          tenantId: project.tenantId,
          tenantName: project.tenant?.name ?? project.tenantId,
        }))}
        defaultTenantId={fallbackTenantId}
      />
      <GatewayRequestTable
        tenants={tenants.map((tenant) => ({ id: tenant.id, name: tenant.name }))}
        defaultTenantId={fallbackTenantId}
        initial={requests.map((req) => ({
          id: req.id,
          method: req.method,
          status: req.status,
          tenantId: req.tenantId,
          projectId: req.projectId ?? null,
          channel: req.channel ?? null,
          approvalLevelRequired: req.approvalLevelRequired,
          approvalLevelCurrent: req.approvalLevelCurrent,
          requestedAt: req.requestedAt.toISOString(),
          approvedAt: req.approvedAt ? req.approvedAt.toISOString() : null,
          executedAt: req.executedAt ? req.executedAt.toISOString() : null,
        }))}
      />
      <div className="mt-24">
        <h2>最近审计记录</h2>
        <table className="table-striped table-compact">
          <thead>
            <tr>
              <th>时间</th>
              <th>动作</th>
              <th>资源</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{log.createdAt.toISOString()}</td>
                <td>{log.action}</td>
                <td>{log.resource}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
