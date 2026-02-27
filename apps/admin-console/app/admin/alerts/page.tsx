import { prisma } from "../../../lib/db";

export default async function AlertsPage() {
  const [tenants, channels] = await Promise.all([
    prisma.tenant.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.alertChannel.findMany({ orderBy: { createdAt: "desc" } }),
  ]);
  return (
    <section>
      <h1>告警渠道</h1>
      <form method="post" action="/api/admin/alerts" style={{ margin: "16px 0" }}>
        <select name="tenantId">
          <option value="">全局</option>
          {tenants.map((tenant) => (
            <option key={tenant.id} value={tenant.id}>
              {tenant.name}
            </option>
          ))}
        </select>
        <input name="name" placeholder="名称" style={{ marginLeft: 8 }} />
        <select name="type" style={{ marginLeft: 8 }}>
          <option value="slack">Slack</option>
          <option value="feishu">飞书</option>
          <option value="email">Email</option>
          <option value="webhook">Webhook</option>
        </select>
        <input name="target" placeholder="Webhook URL" style={{ marginLeft: 8, width: 260 }} />
        <button type="submit" style={{ marginLeft: 8 }}>
          新建
        </button>
      </form>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>名称</th>
            <th style={{ textAlign: "left" }}>类型</th>
            <th style={{ textAlign: "left" }}>租户</th>
            <th style={{ textAlign: "left" }}>状态</th>
          </tr>
        </thead>
        <tbody>
          {channels.map((channel) => (
            <tr key={channel.id}>
              <td>{channel.name}</td>
              <td>{channel.type}</td>
              <td>{channel.tenantId ?? "全局"}</td>
              <td>{channel.enabled ? "启用" : "禁用"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
