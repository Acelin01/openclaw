import { Badge, Separator } from "@uxin/ui";
import { MapPin, DollarSign, Briefcase, Building2 } from "lucide-react";

interface PositionData {
  title: string;
  company: string;
  location?: string;
  salary?: string;
  type?: string;
  description: string;
  requirements?: string[];
  responsibilities?: string[];
}

interface PositionTemplateProps {
  content: string;
}

export function PositionTemplateAlt({ content }: PositionTemplateProps) {
  let data: PositionData = { title: "", company: "", description: "" };
  try {
    data = JSON.parse(content);
  } catch (e) {
    return <div className="p-4 text-red-500">Error parsing position data.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto bg-white min-h-[600px] border-l-4 border-indigo-600 shadow-md p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
          <Building2 className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{data.title}</h1>
          <div className="text-lg text-indigo-600">{data.company}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8 bg-gray-50 p-4 rounded-lg border border-gray-100">
        <div className="flex flex-col items-center text-center p-2">
          <MapPin className="w-5 h-5 text-gray-400 mb-1" />
          <span className="text-sm font-medium text-gray-700">{data.location || "Remote"}</span>
        </div>
        <div className="flex flex-col items-center text-center p-2 border-l border-gray-200">
          <DollarSign className="w-5 h-5 text-gray-400 mb-1" />
          <span className="text-sm font-medium text-gray-700">{data.salary || "Competitive"}</span>
        </div>
        <div className="flex flex-col items-center text-center p-2 border-l border-gray-200">
          <Briefcase className="w-5 h-5 text-gray-400 mb-1" />
          <span className="text-sm font-medium text-gray-700">{data.type || "Full-time"}</span>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
            About the Role
          </h3>
          <p className="text-gray-600 leading-relaxed pl-4 border-l-2 border-gray-100 ml-1">
            {data.description}
          </p>
        </div>

        {data.responsibilities && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
              Key Responsibilities
            </h3>
            <ul className="grid grid-cols-1 gap-2 pl-4">
              {data.responsibilities?.map((item, i) => (
                <li key={i} className="flex gap-2 text-gray-600">
                  <span className="text-indigo-400">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.requirements && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
              Requirements
            </h3>
            <ul className="grid grid-cols-1 gap-2 pl-4">
              {data.requirements?.map((item, i) => (
                <li key={i} className="flex gap-2 text-gray-600">
                  <span className="text-indigo-400">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
