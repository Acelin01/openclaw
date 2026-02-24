import { ProjectData, ProjectTask } from "./types.js";

const groupTasks = (tasks: ProjectTask[]) => {
  const pending = tasks.filter((task) => task.status === "PENDING");
  const inProgress = tasks.filter((task) => task.status === "IN_PROGRESS");
  const completed = tasks.filter((task) => task.status === "COMPLETED");
  return { pending, inProgress, completed };
};

export const ProjectManagerCard = ({ data }: { data: ProjectData }) => {
  const { pending, inProgress, completed } = groupTasks(data.tasks);

  return (
    <div className="artifact-card">
      <header className="artifact-header">
        <div className="artifact-title">🏗️ 项目概览</div>
        <div className="artifact-subtitle">Artifact Client (React)</div>
      </header>
      <section className="artifact-section">
        <h2>任务看板</h2>
        <div className="kanban-grid">
          <div className="kanban-column">
            <div className="kanban-title">待处理</div>
            {pending.length === 0 ? (
              <div className="kanban-empty">暂无任务</div>
            ) : (
              pending.map((task) => (
                <div className="kanban-card" key={task.id}>
                  <div className="kanban-desc">{task.description}</div>
                  <div className="kanban-meta">{task.id}</div>
                </div>
              ))
            )}
          </div>
          <div className="kanban-column">
            <div className="kanban-title">进行中</div>
            {inProgress.length === 0 ? (
              <div className="kanban-empty">暂无任务</div>
            ) : (
              inProgress.map((task) => (
                <div className="kanban-card" key={task.id}>
                  <div className="kanban-desc">{task.description}</div>
                  <div className="kanban-meta">{task.id}</div>
                </div>
              ))
            )}
          </div>
          <div className="kanban-column">
            <div className="kanban-title">已完成</div>
            {completed.length === 0 ? (
              <div className="kanban-empty">暂无任务</div>
            ) : (
              completed.map((task) => (
                <div className="kanban-card" key={task.id}>
                  <div className="kanban-desc">{task.description}</div>
                  <div className="kanban-meta">{task.id}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
      <section className="artifact-section">
        <h2>需求文档</h2>
        {data.requirements.length === 0 ? (
          <div className="doc-empty">暂无需求文档</div>
        ) : (
          data.requirements.map((req) => (
            <article className="doc-card" key={req.id}>
              <div className="doc-title">{req.id}</div>
              <pre className="doc-content">{req.content}</pre>
            </article>
          ))
        )}
      </section>
    </div>
  );
};
