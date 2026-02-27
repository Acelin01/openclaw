import { prisma } from "../../../lib/db";

export default async function TasksPage() {
  const tasks = await prisma.task.findMany({
    include: { project: true },
    orderBy: { createdAt: "desc" },
  });
  const projects = await prisma.project.findMany({ orderBy: { createdAt: "desc" } });
  const statusBadge = (status: string) => {
    const value = status.toLowerCase();
    if (value === "completed") return "badge badge-success";
    if (value === "in_progress") return "badge badge-warning";
    if (value === "blocked") return "badge badge-danger";
    return "badge";
  };
  return (
    <section>
      <h1>任务</h1>
      <form method="post" action="/api/admin/tasks" className="form-inline my-16">
        <select name="projectId">
          <option value="">选择项目</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        <input name="title" placeholder="任务标题" />
        <input name="status" placeholder="状态" />
        <button type="submit" className="btn btn-primary">
          新建
        </button>
      </form>
      <table className="table-striped table-compact">
        <thead>
          <tr>
            <th>ID</th>
            <th>标题</th>
            <th>项目</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td>{task.id}</td>
              <td>{task.title}</td>
              <td>{task.project?.name ?? task.projectId}</td>
              <td>
                <span className={statusBadge(task.status)}>{task.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
