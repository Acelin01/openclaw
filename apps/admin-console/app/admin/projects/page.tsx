import { prisma } from "../../../lib/db";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    include: { tasks: true, tenant: true },
    orderBy: { createdAt: "desc" },
  });
  const tenants = await prisma.tenant.findMany({ orderBy: { createdAt: "desc" } });
  const statusBadge = (status: string) => {
    const value = status.toLowerCase();
    if (value === "active" || value === "in_progress") return "badge badge-success";
    if (value === "paused" || value === "on_hold") return "badge badge-warning";
    if (value === "completed") return "badge badge-success";
    if (value === "cancelled" || value === "canceled") return "badge badge-danger";
    return "badge";
  };
  return (
    <section>
      <h1>项目</h1>
      <form method="post" action="/api/admin/projects" className="form-inline my-16">
        <select name="tenantId">
          <option value="">选择租户</option>
          {tenants.map((tenant) => (
            <option key={tenant.id} value={tenant.id}>
              {tenant.name}
            </option>
          ))}
        </select>
        <input name="name" placeholder="项目名称" />
        <input name="status" placeholder="状态" />
        <button type="submit" className="btn btn-primary">
          新建
        </button>
      </form>
      <table className="table-striped table-compact">
        <thead>
          <tr>
            <th>ID</th>
            <th>名称</th>
            <th>租户</th>
            <th>状态</th>
            <th>任务数</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id}>
              <td>{project.id}</td>
              <td>{project.name}</td>
              <td>{project.tenant?.name ?? project.tenantId}</td>
              <td>
                <span className={statusBadge(project.status)}>{project.status}</span>
              </td>
              <td>{project.tasks.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
