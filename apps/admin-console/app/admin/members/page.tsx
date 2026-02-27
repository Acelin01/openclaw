import { prisma } from "../../../lib/db";

export default async function MembersPage() {
  const [tenants, users, roles, memberships] = await Promise.all([
    prisma.tenant.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.role.findMany({ orderBy: { createdAt: "desc" }, include: { tenant: true } }),
    prisma.membership.findMany({
      orderBy: { createdAt: "desc" },
      include: { tenant: true, user: true, role: true },
    }),
  ]);
  return (
    <section>
      <h1>成员绑定</h1>
      <form method="post" action="/api/admin/memberships" className="form-inline my-16">
        <select name="tenantId">
          <option value="">选择租户</option>
          {tenants.map((tenant) => (
            <option key={tenant.id} value={tenant.id}>
              {tenant.name}
            </option>
          ))}
        </select>
        <select name="userId">
          <option value="">选择用户</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.email}
            </option>
          ))}
        </select>
        <select name="roleId">
          <option value="">选择角色</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name} / {role.tenant?.name ?? role.tenantId}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn-primary">
          绑定
        </button>
      </form>
      <table className="table-striped table-compact">
        <thead>
          <tr>
            <th>租户</th>
            <th>用户</th>
            <th>角色</th>
            <th>绑定时间</th>
          </tr>
        </thead>
        <tbody>
          {memberships.map((membership) => (
            <tr key={membership.id}>
              <td>{membership.tenant?.name ?? membership.tenantId}</td>
              <td>{membership.user?.email ?? membership.userId}</td>
              <td>{membership.role?.name ?? membership.roleId ?? "-"}</td>
              <td>{membership.createdAt.toISOString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
