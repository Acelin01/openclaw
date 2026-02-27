import { Badge, Separator } from "@uxin/ui";
import { TaskData } from "./task-editor";

interface TaskTemplateProps {
  content: string;
}

export function TaskTemplate({ content }: TaskTemplateProps) {
  let data: TaskData = {
    title: "",
    description: "",
    assignee: "",
    dueDate: "",
    priority: "Medium",
    status: "To Do",
  };

  try {
    data = JSON.parse(content);
  } catch (e) {
    return <div className="p-4 text-red-500">Error parsing task data.</div>;
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "Low":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Done":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "In Progress":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white shadow-sm border rounded-lg min-h-[400px]">
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{data.title || "Untitled Task"}</h1>
        <Badge className={getStatusColor(data.status)}>{data.status}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
        <div>
          <span className="block text-gray-500 mb-1">Assignee</span>
          <span className="font-medium text-gray-900">{data.assignee || "Unassigned"}</span>
        </div>
        <div>
          <span className="block text-gray-500 mb-1">Due Date</span>
          <span className="font-medium text-gray-900">{data.dueDate || "No due date"}</span>
        </div>
        <div>
          <span className="block text-gray-500 mb-1">Priority</span>
          <Badge className={getPriorityColor(data.priority)}>{data.priority}</Badge>
        </div>
      </div>

      <Separator className="my-6" />

      <div>
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
          Description
        </h2>
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
          {data.description || "No description provided."}
        </p>
      </div>
    </div>
  );
}
