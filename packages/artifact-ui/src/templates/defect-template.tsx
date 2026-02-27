import { Badge, Separator } from "@uxin/ui";
import { AlertCircle, User, Bug, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { cn } from "../lib/utils";

interface DefectData {
  title: string;
  description: string;
  severity: string;
  priority: string;
  status: string;
  reporterId?: string;
  assigneeId?: string;
  stepsToReproduce?: string[];
  expectedResult?: string;
  actualResult?: string;
}

interface DefectTemplateProps {
  content: string;
}

export function DefectTemplate({ content }: DefectTemplateProps) {
  let data: DefectData = {
    title: "",
    description: "",
    severity: "MEDIUM",
    priority: "MEDIUM",
    status: "OPEN",
  };

  try {
    data = JSON.parse(content);
  } catch (e) {
    return <div className="p-4 text-red-500">Error parsing defect data.</div>;
  }

  const getSeverityColor = (severity: string) => {
    const s = severity?.toUpperCase();
    if (s === "CRITICAL" || s === "BLOCKER") return "bg-red-100 text-red-800 border-red-200";
    if (s === "MAJOR") return "bg-orange-100 text-orange-800 border-orange-200";
    if (s === "MINOR") return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getPriorityColor = (priority: string) => {
    const p = priority?.toUpperCase();
    if (p === "HIGH" || p === "CRITICAL") return "bg-red-50 text-red-700 border-red-100";
    if (p === "MEDIUM") return "bg-blue-50 text-blue-700 border-blue-100";
    return "bg-gray-50 text-gray-700 border-gray-100";
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white min-h-[500px] border rounded-xl shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-50 rounded-lg border border-red-100">
            <Bug className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {data.title || "Untitled Defect"}
            </h1>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-xs font-bold px-2 py-0.5 rounded-full border uppercase",
                  getSeverityColor(data.severity),
                )}
              >
                {data.severity} Severity
              </span>
              <span
                className={cn(
                  "text-xs font-bold px-2 py-0.5 rounded-full border uppercase",
                  getPriorityColor(data.priority),
                )}
              >
                {data.priority} Priority
              </span>
              <Badge variant="outline" className="text-xs uppercase">
                {data.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium">Assignee</p>
            <p className="text-sm font-medium text-gray-900">{data.assigneeId || "Unassigned"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium">Reporter</p>
            <p className="text-sm font-medium text-gray-900">{data.reporterId || "Unknown"}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> Description
          </h2>
          <div className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed bg-white border rounded-lg p-4">
            {data.description || "No description provided."}
          </div>
        </section>

        {data.stepsToReproduce && data.stepsToReproduce.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Steps to Reproduce
            </h2>
            <div className="bg-white border rounded-lg p-4">
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                {data.stepsToReproduce.map((step, i) => (
                  <li key={i} className="pl-1">
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.expectedResult && (
            <section>
              <h2 className="text-sm font-bold text-green-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Expected Result
              </h2>
              <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-sm text-green-800">
                {data.expectedResult}
              </div>
            </section>
          )}

          {data.actualResult && (
            <section>
              <h2 className="text-sm font-bold text-red-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Actual Result
              </h2>
              <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-sm text-red-800">
                {data.actualResult}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
