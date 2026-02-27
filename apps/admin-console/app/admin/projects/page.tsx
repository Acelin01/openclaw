import { prisma } from "../../../lib/db";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    include: { tasks: true, tenant: true },
    orderBy: { createdAt: "desc" },
  });
  const tenants = await prisma.tenant.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <section>
      <h1>项目</h1>
      <form method="post" action="/api/admin/projects" style={{ margin: "16px 0" }}>
        <select name="tenantId">
          <option value="">选择租户</option>
          {tenants.map((tenant) => (
            <option key={tenant.id} value={tenant.id}>
              {tenant.name}
            </option>
          ))}
        </select>
        <input name="name" placeholder="项目名称" style={{ marginLeft: 8 }} />
        <input name="status" placeholder="状态" style={{ marginLeft: 8 }} />
        <button type="submit" style={{ marginLeft: 8 }}>
          新建
        </button>
      </form>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>ID</th>
            <th style={{ textAlign: "left" }}>名称</th>
            <th style={{ textAlign: "left" }}>租户</th>
            <th style={{ textAlign: "left" }}>状态</th>
            <th style={{ textAlign: "left" }}>任务数</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id}>
              <td>{project.id}</td>
              <td>{project.name}</td>
              <td>{project.tenant?.name ?? project.tenantId}</td>
              <td>{project.status}</td>
              <td>{project.tasks.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
