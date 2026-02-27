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
      <form method="post" action="/api/admin/memberships" style={{ margin: "16px 0" }}>
        <select name="tenantId">
          <option value="">选择租户</option>
          {tenants.map((tenant) => (
            <option key={tenant.id} value={tenant.id}>
              {tenant.name}
            </option>
          ))}
        </select>
        <select name="userId" style={{ marginLeft: 8 }}>
          <option value="">选择用户</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.email}
            </option>
          ))}
        </select>
        <select name="roleId" style={{ marginLeft: 8 }}>
          <option value="">选择角色</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name} / {role.tenant?.name ?? role.tenantId}
            </option>
          ))}
        </select>
        <button type="submit" style={{ marginLeft: 8 }}>
          绑定
        </button>
      </form>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>租户</th>
            <th style={{ textAlign: "left" }}>用户</th>
            <th style={{ textAlign: "left" }}>角色</th>
            <th style={{ textAlign: "left" }}>绑定时间</th>
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
