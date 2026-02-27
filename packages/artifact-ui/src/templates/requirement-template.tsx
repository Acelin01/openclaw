import { Badge, Separator } from "@uxin/ui";
import { Calendar, Target, AlertCircle } from "lucide-react";

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

export function RequirementTemplate({ content }: RequirementTemplateProps) {
  let data: RequirementData = { title: "", description: "", requirements: [] };
  try {
    data = JSON.parse(content);
  } catch (e) {
    return <div className="p-4 text-red-500">Error parsing requirement data.</div>;
  }

  const getPriorityColor = (p?: string) => {
    if (!p) return "default";
    const s = p.toLowerCase();
    if (s.includes("high") || s.includes("critical")) return "destructive";
    if (s.includes("medium")) return "secondary";
    return "default";
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white min-h-[600px] text-gray-800">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900">{data.title}</h1>
          <div className="flex gap-4 text-sm text-gray-500 mt-4">
            {data.deadline && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Due: {data.deadline}</span>
              </div>
            )}
            {data.stakeholders && data.stakeholders.length > 0 && (
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span>{data.stakeholders.join(", ")}</span>
              </div>
            )}
          </div>
        </div>
        {data.priority && (
          <Badge
            variant={getPriorityColor(data.priority) as any}
            className="text-sm px-3 py-1 uppercase"
          >
            {data.priority} Priority
          </Badge>
        )}
      </div>

      <Separator className="my-6" />

      <div className="space-y-8">
        {data.background && (
          <section>
            <h2 className="text-lg font-bold uppercase tracking-wider mb-4 text-gray-700">
              Background
            </h2>
            <p className="text-gray-600 leading-relaxed">{data.background}</p>
          </section>
        )}

        <section>
          <h2 className="text-lg font-bold uppercase tracking-wider mb-4 text-gray-700">
            Overview
          </h2>
          <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{data.description}</p>
        </section>

        <section>
          <h2 className="text-lg font-bold uppercase tracking-wider mb-4 text-gray-700">
            Detailed Requirements
          </h2>
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
            <ul className="space-y-4">
              {data.requirements?.map((req, i) => (
                <li key={i} className="flex gap-3 text-gray-700">
                  <div className="min-w-6 mt-1 text-gray-400 font-mono text-sm">
                    {(i + 1).toString().padStart(2, "0")}
                  </div>
                  <div>{req}</div>
                </li>
              ))}
              {(!data.requirements || data.requirements.length === 0) && (
                <li className="text-gray-400 italic text-sm">No specific requirements listed.</li>
              )}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
