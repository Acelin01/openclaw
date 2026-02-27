import { prisma } from "../../../lib/db";

export default async function PermissionsPage() {
  const tenants = await prisma.tenant.findMany({ orderBy: { createdAt: "desc" } });
  const roles = await prisma.role.findMany({
    include: { grants: { include: { permission: true } }, tenant: true },
    orderBy: { createdAt: "desc" },
  });
  const permissions = await prisma.permission.findMany({ orderBy: [{ group: "asc" }, { key: "asc" }] });
  return (
    <section>
      <h1>权限管理</h1>
      <div style={{ display: "grid", gap: 20 }}>
        <div>
          <h2>新增权限</h2>
          <form method="post" action="/api/admin/permissions">
            <input name="group" placeholder="分组 (如 gateway)" />
            <input name="key" placeholder="权限 key" style={{ marginLeft: 8 }} />
            <button type="submit" style={{ marginLeft: 8 }}>
              新建
            </button>
          </form>
        </div>
        <div>
          <h2>新增角色</h2>
          <form method="post" action="/api/admin/roles">
            <select name="tenantId">
              <option value="">选择租户</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </option>
              ))}
            </select>
            <input name="name" placeholder="角色名称" style={{ marginLeft: 8 }} />
            <button type="submit" style={{ marginLeft: 8 }}>
              新建
            </button>
          </form>
        </div>
        <div>
          <h2>角色授权</h2>
          <form method="post" action="/api/admin/role-permissions">
            <select name="roleId">
              <option value="">选择角色</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name} / {role.tenant?.name ?? role.tenantId}
                </option>
              ))}
            </select>
            <select name="permissionId" style={{ marginLeft: 8 }}>
              <option value="">选择权限</option>
              {permissions.map((permission) => (
                <option key={permission.id} value={permission.id}>
                  {permission.group}:{permission.key}
                </option>
              ))}
            </select>
            <button type="submit" style={{ marginLeft: 8 }}>
              授权
            </button>
          </form>
        </div>
      </div>
      <div style={{ marginTop: 24 }}>
        <h2>角色列表</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>角色</th>
              <th style={{ textAlign: "left" }}>租户</th>
              <th style={{ textAlign: "left" }}>权限</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id}>
                <td>{role.name}</td>
                <td>{role.tenant?.name ?? role.tenantId}</td>
                <td>
                  {role.grants
                    .map((grant) => `${grant.permission.group}:${grant.permission.key}`)
                    .join(", ") || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
