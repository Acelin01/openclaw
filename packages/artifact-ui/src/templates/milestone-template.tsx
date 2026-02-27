import { Badge, Separator } from "@uxin/ui";
import { Flag, Calendar, ListChecks, ArrowRight } from "lucide-react";

interface MilestoneData {
  title: string;
  description: string;
  dueDate: string;
  status: string;
  dependencies?: string[];
}

interface MilestoneTemplateProps {
  content: string;
}

export function MilestoneTemplate({ content }: MilestoneTemplateProps) {
  let data: MilestoneData = {
    title: "",
    description: "",
    dueDate: "",
    status: "PENDING",
  };

  try {
    data = JSON.parse(content);
  } catch (e) {
    return <div className="p-4 text-red-500">Error parsing milestone data.</div>;
  }

  const getStatusColor = (status: string) => {
    const s = status?.toUpperCase();
    if (s === "COMPLETED") return "bg-green-100 text-green-800";
    if (s === "IN_PROGRESS") return "bg-blue-100 text-blue-800";
    if (s === "PENDING") return "bg-gray-100 text-gray-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white min-h-[400px] border rounded-xl shadow-sm">
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
          <Flag className="w-8 h-8 text-indigo-600" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h1 className="text-2xl font-bold text-gray-900">
              {data.title || "Untitled Milestone"}
            </h1>
            <Badge className={getStatusColor(data.status)}>{data.status}</Badge>
          </div>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>
              Due Date:{" "}
              <span className="font-medium text-gray-900">{data.dueDate || "Not set"}</span>
            </span>
          </div>
        </div>
      </div>

      <Separator className="mb-6" />

      <div className="space-y-6">
        <section>
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">
            Description
          </h2>
          <p className="text-gray-700 leading-relaxed text-sm">
            {data.description || "No description provided."}
          </p>
        </section>

        {data.dependencies && data.dependencies.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <ListChecks className="w-4 h-4" /> Dependencies
            </h2>
            <div className="bg-gray-50 rounded-lg p-1">
              {data.dependencies.map((dep, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-3 bg-white border rounded-md shadow-sm mb-2 last:mb-0"
                >
                  <ArrowRight className="w-3 h-3 text-gray-400" />
                  <span className="text-sm text-gray-700">{dep}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
