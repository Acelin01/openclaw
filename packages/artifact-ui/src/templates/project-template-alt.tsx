import { Badge, Separator } from "@uxin/ui";
import { Calendar, MapPin, DollarSign } from "lucide-react";

interface ProjectData {
  title: string;
  description: string;
  status: string;
  budgetMin?: number;
  budgetMax?: number;
  location?: string;
  tags?: string[];
  startDate?: string;
  endDate?: string;
}

interface ProjectTemplateProps {
  content: string;
}

export function ProjectTemplateAlt({ content }: ProjectTemplateProps) {
  let data: ProjectData = { title: "", description: "", status: "" };
  try {
    data = JSON.parse(content);
  } catch (e) {
    return <div className="p-4 text-red-500">Error parsing project data.</div>;
  }

  const formatCurrency = (val?: number) => {
    if (val === undefined) return "";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);
  };

  return (
    <div className="max-w-4xl mx-auto bg-slate-50 min-h-[600px] border rounded-xl overflow-hidden shadow-lg">
      <div className="bg-slate-900 text-white p-8">
        <div className="flex justify-between items-start">
          <div>
            <Badge variant="outline" className="text-white border-white/20 mb-4">
              {data.status}
            </Badge>
            <h1 className="text-4xl font-bold mb-4">{data.title}</h1>
            <div className="flex gap-6 text-slate-300">
              {data.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{data.location}</span>
                </div>
              )}
              {(data.startDate || data.endDate) && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {data.startDate || "TBD"} - {data.endDate || "TBD"}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400 mb-1">Estimated Budget</div>
            <div className="text-2xl font-mono text-green-400">
              {data.budgetMin && data.budgetMax
                ? `${formatCurrency(data.budgetMin)} - ${formatCurrency(data.budgetMax)}`
                : data.budgetMin
                  ? `> ${formatCurrency(data.budgetMin)}`
                  : "Negotiable"}
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">Overview</h3>
          <div className="prose prose-slate max-w-none text-slate-600">{data.description}</div>
        </div>
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {data.tags?.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
              {!data.tags?.length && <span className="text-slate-400 text-sm">No tags</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
