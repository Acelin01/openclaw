import { prisma } from "../../../lib/db";

export default async function TenantsPage() {
  const tenants = await prisma.tenant.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <section>
      <h1>租户</h1>
      <form method="post" action="/api/admin/tenants" style={{ margin: "16px 0" }}>
        <input name="name" placeholder="租户名称" />
        <button type="submit" style={{ marginLeft: 8 }}>
          新建
        </button>
      </form>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>ID</th>
            <th style={{ textAlign: "left" }}>名称</th>
            <th style={{ textAlign: "left" }}>创建时间</th>
          </tr>
        </thead>
        <tbody>
          {tenants.map((tenant) => (
            <tr key={tenant.id}>
              <td>{tenant.id}</td>
              <td>{tenant.name}</td>
              <td>{tenant.createdAt.toISOString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
