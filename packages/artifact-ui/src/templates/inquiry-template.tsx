import { Badge } from "@uxin/ui";
import { Calendar, DollarSign, Clock, MapPin, Briefcase } from "lucide-react";

interface InquiryData {
  title: string;
  description: string;
  budget?: string | number;
  deadline?: string;
  location?: string;
  skills?: string[];
  type?: string; // e.g., "FIXED_PRICE" | "HOURLY"
}

interface InquiryTemplateProps {
  content: string;
}

export function InquiryTemplate({ content }: InquiryTemplateProps) {
  let data: InquiryData = { title: "", description: "" };
  try {
    data = JSON.parse(content);
  } catch (e) {
    return <div className="p-4 text-red-500">解析需求/询价数据出错。</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white border rounded-xl shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{data.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {data.type && (
              <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100 font-medium text-xs">
                {data.type}
              </span>
            )}
            {data.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {data.location}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-emerald-600">
            {typeof data.budget === "number"
              ? `¥${data.budget.toLocaleString()}`
              : data.budget || "面议"}
          </div>
          <div className="text-xs text-gray-400 mt-1">预算金额</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg border shadow-sm">
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium uppercase">截止日期</div>
            <div className="text-sm font-semibold text-gray-900">
              {data.deadline ? new Date(data.deadline).toLocaleDateString() : "尽快"}
            </div>
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg border shadow-sm">
            <Briefcase className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium uppercase">项目类型</div>
            <div className="text-sm font-semibold text-gray-900">{data.type || "项目外包"}</div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">详细描述</h3>
        <div className="prose prose-sm max-w-none text-gray-600 bg-white">{data.description}</div>
      </div>

      {data.skills && data.skills.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
            所需技能
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, i) => (
              <Badge
                key={i}
                variant="outline"
                className="bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
