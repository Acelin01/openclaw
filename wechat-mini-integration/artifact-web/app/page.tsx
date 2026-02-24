import { ArtifactDashboard } from "./components/artifact-dashboard";
import { fetchProjectData } from "./lib/fetch-project-data";

export default async function Home() {
  const data = await fetchProjectData();

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10 font-sans text-slate-900">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 text-sm uppercase tracking-[0.4em] text-slate-400">
          OpenClaw Artifact Client
        </div>
        <h1 className="mb-6 text-3xl font-semibold text-slate-900">项目需求与任务看板</h1>
        <ArtifactDashboard initialData={data} />
      </div>
    </div>
  );
}
