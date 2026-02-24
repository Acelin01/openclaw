import React, { useState } from "react";

interface Task {
  id: string;
  description: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
}

interface Requirement {
  id: string;
  content: string;
}

interface ProjectData {
  requirements: Requirement[];
  tasks: Task[];
}

export const ProjectManagerCard = ({ data }: { data: ProjectData }) => {
  const [activeTab, setActiveTab] = useState<"kanban" | "docs">("kanban");

  // Group tasks by status
  const pendingTasks = data.tasks.filter((t) => t.status === "PENDING");
  const inProgressTasks = data.tasks.filter((t) => t.status === "IN_PROGRESS");
  const completedTasks = data.tasks.filter((t) => t.status === "COMPLETED");

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm max-w-4xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">🏗️ 项目概览</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("kanban")}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === "kanban"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            任务看板
          </button>
          <button
            onClick={() => setActiveTab("docs")}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === "docs"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            需求文档
          </button>
        </div>
      </div>

      {activeTab === "kanban" ? (
        <div className="grid grid-cols-3 gap-4 h-[500px]">
          <KanbanColumn title="待处理" status="PENDING" tasks={pendingTasks} color="bg-gray-100" />
          <KanbanColumn
            title="进行中"
            status="IN_PROGRESS"
            tasks={inProgressTasks}
            color="bg-blue-50"
          />
          <KanbanColumn
            title="已完成"
            status="COMPLETED"
            tasks={completedTasks}
            color="bg-green-50"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {data.requirements.length === 0 ? (
            <div className="text-center text-gray-400 py-10">暂无需求文档</div>
          ) : (
            data.requirements.map((req) => (
              <div
                key={req.id}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
              >
                <h3 className="font-bold text-lg mb-2 text-gray-800">{req.id}</h3>
                <pre className="whitespace-pre-wrap text-sm text-gray-600 bg-gray-50 p-4 rounded overflow-x-auto">
                  {req.content}
                </pre>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const KanbanColumn = ({
  title,
  status,
  tasks,
  color,
}: {
  title: string;
  status: string;
  tasks: Task[];
  color: string;
}) => (
  <div className={`flex flex-col h-full rounded-lg ${color} p-4`}>
    <h3 className="font-semibold mb-4 flex justify-between items-center text-gray-700">
      {title}
      <span className="bg-white px-2 py-0.5 rounded-full text-xs border border-gray-200">
        {tasks.length}
      </span>
    </h3>
    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
      {tasks.length === 0 ? (
        <div className="text-center text-gray-400 text-sm mt-10 italic">空空如也</div>
      ) : (
        tasks.map((task) => (
          <div
            key={task.id}
            className="bg-white p-3 rounded shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="text-sm text-gray-800 font-medium mb-1 line-clamp-2">
              {task.description}
            </div>
            <div className="text-xs text-gray-400 flex justify-between items-center mt-2">
              <span>ID: {task.id.substring(task.id.length - 4)}</span>
              {status === "PENDING" && (
                <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  开始 →
                </span>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);
