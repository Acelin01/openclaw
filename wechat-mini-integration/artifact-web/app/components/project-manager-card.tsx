import { ProjectData } from "../lib/types";

const groupTasks = (data: ProjectData) => {
  const pending = data.tasks.filter((task) => task.status === "PENDING");
  const inProgress = data.tasks.filter((task) => task.status === "IN_PROGRESS");
  const completed = data.tasks.filter((task) => task.status === "COMPLETED");
  return { pending, inProgress, completed };
};

export const ProjectManagerCard = ({ data }: { data: ProjectData }) => {
  const { pending, inProgress, completed } = groupTasks(data);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-5">
        <div className="text-xl font-semibold text-slate-900">🏗️ 项目概览</div>
        <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Artifact Client</div>
      </div>
      <div className="border-b border-slate-100 px-6 py-5">
        <div className="mb-4 text-base font-semibold text-slate-900">任务看板</div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="mb-3 text-sm font-semibold text-slate-600">待处理</div>
            {pending.length === 0 ? (
              <div className="text-xs text-slate-400">暂无任务</div>
            ) : (
              pending.map((task) => (
                <div
                  key={task.id}
                  className="mb-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                >
                  <div className="text-sm font-medium text-slate-900">{task.description}</div>
                  <div className="mt-1 text-xs text-slate-500">{task.id}</div>
                </div>
              ))
            )}
          </div>
          <div className="rounded-2xl bg-blue-50/40 p-4">
            <div className="mb-3 text-sm font-semibold text-slate-600">进行中</div>
            {inProgress.length === 0 ? (
              <div className="text-xs text-slate-400">暂无任务</div>
            ) : (
              inProgress.map((task) => (
                <div
                  key={task.id}
                  className="mb-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                >
                  <div className="text-sm font-medium text-slate-900">{task.description}</div>
                  <div className="mt-1 text-xs text-slate-500">{task.id}</div>
                </div>
              ))
            )}
          </div>
          <div className="rounded-2xl bg-emerald-50/50 p-4">
            <div className="mb-3 text-sm font-semibold text-slate-600">已完成</div>
            {completed.length === 0 ? (
              <div className="text-xs text-slate-400">暂无任务</div>
            ) : (
              completed.map((task) => (
                <div
                  key={task.id}
                  className="mb-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                >
                  <div className="text-sm font-medium text-slate-900">{task.description}</div>
                  <div className="mt-1 text-xs text-slate-500">{task.id}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <div className="px-6 py-5">
        <div className="mb-4 text-base font-semibold text-slate-900">需求文档</div>
        {data.requirements.length === 0 ? (
          <div className="text-sm text-slate-400">暂无需求文档</div>
        ) : (
          data.requirements.map((req) => (
            <div key={req.id} className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-900">{req.id}</div>
              <pre className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{req.content}</pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
