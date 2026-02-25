function buildProjectArtifact(params) {
  const { project, milestones = [], tasks = [], risks = [] } = params;
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((task) => task.status === "completed").length;
  const inProgressTasks = tasks.filter((task) => task.status === "in_progress").length;
  const pendingTasks = tasks.filter((task) => task.status === "pending").length;
  const overdueMilestones = milestones.filter((milestone) => milestone.status === "overdue").length;
  const riskCount = risks.length;

  const metrics = [
    {
      label: "任务完成",
      value: `${doneTasks}/${totalTasks}`,
      status: totalTasks > 0 && doneTasks === totalTasks ? "ok" : "warning",
    },
    {
      label: "进行中",
      value: String(inProgressTasks),
      status: inProgressTasks > 0 ? "warning" : "ok",
    },
    {
      label: "待处理",
      value: String(pendingTasks),
      status: pendingTasks > 0 ? "warning" : "ok",
    },
    {
      label: "里程碑风险",
      value: String(overdueMilestones),
      status: overdueMilestones > 0 ? "risk" : "ok",
    },
    {
      label: "风险项",
      value: String(riskCount),
      status: riskCount > 0 ? "risk" : "ok",
    },
  ];

  const sections = [
    {
      title: "里程碑",
      items: milestones.map((milestone) => `${milestone.title} · ${milestone.status}`),
    },
    {
      title: "关键任务",
      items: tasks.slice(0, 5).map((task) => `${task.title} · ${task.status}`),
    },
  ].filter((section) => section.items.length > 0);

  return {
    kind: "project-collab",
    title: project?.name || "项目协同",
    subtitle: project?.owner_id ? `负责人：${project.owner_id}` : undefined,
    summary: project?.description || "",
    metrics,
    sections,
  };
}

function createArtifactPayload(params) {
  const artifact = buildProjectArtifact(params);
  const data = {
    project: params.project ?? null,
    milestones: params.milestones ?? [],
    tasks: params.tasks ?? [],
    risks: params.risks ?? [],
  };
  return { artifact, data };
}

function createArtifactText(params) {
  return JSON.stringify(createArtifactPayload(params), null, 2);
}

function createMcpToolResult(params) {
  return {
    content: [
      {
        type: "text",
        text: createArtifactText(params),
      },
    ],
  };
}

export { buildProjectArtifact, createArtifactPayload, createArtifactText, createMcpToolResult };
