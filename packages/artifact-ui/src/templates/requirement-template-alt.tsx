import { Badge } from "@uxin/ui";
import { AlertCircle, Target, Clock, Users } from "lucide-react";

interface RequirementData {
  title: string;
  description: string;
  requirements: string[];
  priority?: string;
  deadline?: string;
  stakeholders?: string[];
  background?: string;
}

interface RequirementTemplateProps {
  content: string;
}

export function RequirementTemplateAlt({ content }: RequirementTemplateProps) {
  let data: RequirementData = { title: "", description: "", requirements: [] };
  try {
    data = JSON.parse(content);
  } catch (e) {
    return <div className="p-4 text-red-500">Error parsing requirement data.</div>;
  }

  const getPriorityColor = (p?: string) => {
    if (!p) return "secondary";
    const s = p.toLowerCase();
    if (s.includes("high") || s.includes("critical")) return "destructive";
    if (s.includes("medium")) return "default";
    return "secondary";
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 bg-slate-50 min-h-[600px]">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{data.title}</h1>
            <p className="text-slate-500 mt-2 max-w-2xl">{data.description}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {data.priority && (
              <Badge variant={getPriorityColor(data.priority) as any} className="px-4 py-1">
                {data.priority} Priority
              </Badge>
            )}
            {data.deadline && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Clock className="w-4 h-4" />
                {data.deadline}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="p-6 pb-2">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <Target className="w-5 h-5 text-blue-500" />
                Functional Requirements
              </h3>
            </div>
            <div className="p-6 pt-2">
              <div className="space-y-3">
                {data.requirements?.map((req, i) => (
                  <div
                    key={i}
                    className="flex gap-3 p-3 bg-slate-50 rounded-md border border-slate-100 hover:border-blue-200 transition-colors"
                  >
                    <span className="font-mono text-blue-500 font-bold">R{i + 1}</span>
                    <span className="text-slate-700">{req}</span>
                  </div>
                ))}
                {(!data.requirements || data.requirements.length === 0) && (
                  <div className="text-sm text-slate-400 italic p-3">No requirements listed.</div>
                )}
              </div>
            </div>
          </div>

          {data.background && (
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-6 pb-2">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  Context & Background
                </h3>
              </div>
              <div className="p-6 pt-2">
                <p className="text-slate-600 leading-relaxed">{data.background}</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="p-6 pb-2">
              <h3 className="flex items-center gap-2 text-base font-semibold">
                <Users className="w-4 h-4 text-slate-500" />
                Stakeholders
              </h3>
            </div>
            <div className="p-6 pt-2">
              <div className="flex flex-wrap gap-2">
                {data.stakeholders?.map((s, i) => (
                  <Badge key={i} variant="outline" className="bg-slate-50">
                    {s}
                  </Badge>
                ))}
                {!data.stakeholders?.length && (
                  <span className="text-sm text-slate-400">Not specified</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
