import { prisma } from "../../../lib/db";

export default async function AlertsPage() {
  const [tenants, channels] = await Promise.all([
    prisma.tenant.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.alertChannel.findMany({ orderBy: { createdAt: "desc" } }),
  ]);
  const statusBadge = (enabled: boolean) => (enabled ? "badge badge-success" : "badge badge-danger");
  return (
    <section>
      <h1>告警渠道</h1>
      <form method="post" action="/api/admin/alerts" className="form-inline my-16">
        <select name="tenantId">
          <option value="">全局</option>
          {tenants.map((tenant: (typeof tenants)[number]) => (
            <option key={tenant.id} value={tenant.id}>
              {tenant.name}
            </option>
          ))}
        </select>
        <input name="name" placeholder="名称" />
        <select name="type">
          <option value="slack">Slack</option>
          <option value="feishu">飞书</option>
          <option value="email">Email</option>
          <option value="webhook">Webhook</option>
        </select>
        <input name="target" placeholder="Webhook URL" className="input-wide" />
        <button type="submit" className="btn btn-primary">
          新建
        </button>
      </form>
      <table className="table-striped table-compact">
        <thead>
          <tr>
            <th>名称</th>
            <th>类型</th>
            <th>租户</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          {channels.map((channel: (typeof channels)[number]) => (
            <tr key={channel.id}>
              <td>{channel.name}</td>
              <td>{channel.type}</td>
              <td>{channel.tenantId ?? "全局"}</td>
              <td>
                <span className={statusBadge(channel.enabled)}>
                  {channel.enabled ? "启用" : "禁用"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
