import { prisma } from "../../../lib/db";

export default async function TasksPage() {
  const tasks = await prisma.task.findMany({
    include: { project: true },
    orderBy: { createdAt: "desc" },
  });
  const projects = await prisma.project.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <section>
      <h1>任务</h1>
      <form method="post" action="/api/admin/tasks" style={{ margin: "16px 0" }}>
        <select name="projectId">
          <option value="">选择项目</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        <input name="title" placeholder="任务标题" style={{ marginLeft: 8 }} />
        <input name="status" placeholder="状态" style={{ marginLeft: 8 }} />
        <button type="submit" style={{ marginLeft: 8 }}>
          新建
        </button>
      </form>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>ID</th>
            <th style={{ textAlign: "left" }}>标题</th>
            <th style={{ textAlign: "left" }}>项目</th>
            <th style={{ textAlign: "left" }}>状态</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td>{task.id}</td>
              <td>{task.title}</td>
              <td>{task.project?.name ?? task.projectId}</td>
              <td>{task.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
