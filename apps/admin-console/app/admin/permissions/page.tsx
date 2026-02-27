import { prisma } from "../../../lib/db";

export default async function PermissionsPage() {
  const tenants = await prisma.tenant.findMany({ orderBy: { createdAt: "desc" } });
  const roles = await prisma.role.findMany({
    include: { grants: { include: { permission: true } }, tenant: true },
    orderBy: { createdAt: "desc" },
  });
  const permissions = await prisma.permission.findMany({
    orderBy: [{ group: "asc" }, { key: "asc" }],
  });
  return (
    <section>
      <h1>权限管理</h1>
      <div className="stack-lg">
        <div>
          <h2>新增权限</h2>
          <form method="post" action="/api/admin/permissions" className="form-inline">
            <input name="group" placeholder="分组 (如 gateway)" />
            <input name="key" placeholder="权限 key" />
            <input name="level" placeholder="审批级别" />
            <button type="submit" className="btn btn-primary">
              新建
            </button>
          </form>
        </div>
        <div>
          <h2>新增角色</h2>
          <form method="post" action="/api/admin/roles" className="form-inline">
            <select name="tenantId">
              <option value="">选择租户</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </option>
              ))}
            </select>
            <input name="name" placeholder="角色名称" />
            <button type="submit" className="btn btn-primary">
              新建
            </button>
          </form>
        </div>
        <div>
          <h2>角色授权</h2>
          <form method="post" action="/api/admin/role-permissions" className="form-inline">
            <select name="roleId">
              <option value="">选择角色</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name} / {role.tenant?.name ?? role.tenantId}
                </option>
              ))}
            </select>
            <select name="permissionId">
              <option value="">选择权限</option>
              {permissions.map((permission) => (
                <option key={permission.id} value={permission.id}>
                  {permission.group}:{permission.key} (L{permission.level})
                </option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary">
              授权
            </button>
          </form>
        </div>
      </div>
      <div className="mt-24">
        <h2>角色列表</h2>
        <table className="table-striped table-compact">
          <thead>
            <tr>
              <th>角色</th>
              <th>租户</th>
              <th>权限</th>
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
