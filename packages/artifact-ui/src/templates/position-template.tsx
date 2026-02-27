import { Badge, Separator } from "@uxin/ui";
import { MapPin, DollarSign, Briefcase } from "lucide-react";

interface PositionData {
  title: string;
  company: string;
  location?: string;
  salary?: string;
  type?: string; // Full-time, Part-time
  description: string;
  requirements?: string[];
  responsibilities?: string[];
}

interface PositionTemplateProps {
  content: string;
}

export function PositionTemplate({ content }: PositionTemplateProps) {
  let data: PositionData = { title: "", company: "", description: "" };
  try {
    data = JSON.parse(content);
  } catch (e) {
    return <div className="p-4 text-red-500">Error parsing position data.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white min-h-[600px] text-gray-800">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900">{data.title}</h1>
          <div className="text-xl text-gray-600 font-medium mb-4">{data.company}</div>
          <div className="flex flex-wrap gap-6 text-sm text-gray-500">
            {data.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{data.location}</span>
              </div>
            )}
            {data.salary && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                <span>{data.salary}</span>
              </div>
            )}
            {data.type && (
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                <span>{data.type}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-bold uppercase tracking-wider mb-4 text-gray-700">
            Job Description
          </h2>
          <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{data.description}</p>
        </section>

        {data.responsibilities && data.responsibilities.length > 0 && (
          <section>
            <h2 className="text-lg font-bold uppercase tracking-wider mb-4 text-gray-700">
              Responsibilities
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              {data.responsibilities?.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {data.requirements && data.requirements.length > 0 && (
          <section>
            <h2 className="text-lg font-bold uppercase tracking-wider mb-4 text-gray-700">
              Requirements
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              {data.requirements?.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
