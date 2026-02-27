import { prisma } from "../../../lib/db";

export default async function TenantsPage() {
  const tenants = await prisma.tenant.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <section>
      <h1>租户</h1>
      <form method="post" action="/api/admin/tenants" className="form-inline my-16">
        <input name="name" placeholder="租户名称" />
        <button type="submit" className="btn btn-primary">
          新建
        </button>
      </form>
      <table className="table-striped table-compact">
        <thead>
          <tr>
            <th>ID</th>
            <th>名称</th>
            <th>创建时间</th>
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
