import { prisma } from "../../../lib/db";
import GatewayCallForm from "./GatewayCallForm";
import GatewayRequestTable from "./GatewayRequestTable";

export default async function GatewayPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const requests = await prisma.gatewayCallRequest.findMany({
    orderBy: { requestedAt: "desc" },
    take: 20,
  });
  return (
    <section>
      <h1>网关调用</h1>
      <GatewayCallForm />
      <GatewayRequestTable
        initial={requests.map((req) => ({
          id: req.id,
          method: req.method,
          status: req.status,
          requestedAt: req.requestedAt.toISOString(),
          approvedAt: req.approvedAt ? req.approvedAt.toISOString() : null,
          executedAt: req.executedAt ? req.executedAt.toISOString() : null,
        }))}
      />
      <div style={{ marginTop: 24 }}>
        <h2>最近审计记录</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>时间</th>
              <th style={{ textAlign: "left" }}>动作</th>
              <th style={{ textAlign: "left" }}>资源</th>
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
