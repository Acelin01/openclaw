import { ProjectData, TaskStatus } from "./types";

const toProjectData = (value: unknown): ProjectData => {
  if (!value || typeof value !== "object") {
    return { requirements: [], tasks: [] };
  }

  const data = value as {
    requirements?: Array<{ id?: string; content?: string }>;
    tasks?: Array<{ id?: string; description?: string; status?: string }>;
  };

  const requirements = (data.requirements ?? []).map((item) => ({
    id: item.id ?? "unknown",
    content: item.content ?? "",
  }));

  const tasks = (data.tasks ?? []).map((item) => {
    const statusValue =
      item.status === "IN_PROGRESS" || item.status === "COMPLETED" || item.status === "PENDING"
        ? item.status
        : "PENDING";
    return {
      id: item.id ?? "unknown",
      description: item.description ?? "",
      status: statusValue as TaskStatus,
    };
  });

  return { requirements, tasks };
};

export const fetchProjectData = async (): Promise<ProjectData> => {
  const baseUrl = process.env.ARTIFACT_DATA_URL ?? "http://localhost:3000/api/artifact";
  const response = await fetch(baseUrl, { cache: "no-store" });
  if (!response.ok) {
    return { requirements: [], tasks: [] };
  }
  const json = (await response.json()) as unknown;
  return toProjectData(json);
};
