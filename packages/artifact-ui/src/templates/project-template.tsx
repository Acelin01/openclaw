import { Badge, Separator } from "@uxin/ui";
import { Calendar, MapPin, DollarSign, Tag } from "lucide-react";

interface ProjectData {
  title: string;
  name?: string;
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

export function ProjectTemplate({ content }: ProjectTemplateProps) {
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

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("active") || s.includes("open")) return "default";
    if (s.includes("completed") || s.includes("closed")) return "secondary";
    if (s.includes("draft") || s.includes("pending")) return "outline";
    return "default";
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 bg-white min-h-[600px]">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {data.title || data.name || "Untitled Project"}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {data.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{data.location}</span>
              </div>
            )}
            {(data.startDate || data.endDate) && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>
                  {data.startDate || "TBD"} - {data.endDate || "TBD"}
                </span>
              </div>
            )}
          </div>
        </div>
        <Badge variant={getStatusColor(data.status) as any} className="text-sm px-3 py-1 uppercase">
          {data.status}
        </Badge>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-800">Project Description</h2>
            <div className="prose prose-gray max-w-none text-gray-600 whitespace-pre-wrap">
              {data.description}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6 pb-3">
              <h3 className="text-sm font-medium text-gray-500 uppercase">Budget</h3>
            </div>
            <div className="p-6 pt-0">
              <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span>
                  {data.budgetMin && data.budgetMax
                    ? `${formatCurrency(data.budgetMin)} - ${formatCurrency(data.budgetMax)}`
                    : data.budgetMin
                      ? `From ${formatCurrency(data.budgetMin)}`
                      : "Negotiable"}
                </span>
              </div>
            </div>
          </div>

          {data.tags && data.tags.length > 0 && (
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="flex flex-col space-y-1.5 p-6 pb-3">
                <h3 className="text-sm font-medium text-gray-500 uppercase">Tags</h3>
              </div>
              <div className="p-6 pt-0">
                <div className="flex flex-wrap gap-2">
                  {data.tags?.map((tag, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-sm text-gray-700"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
