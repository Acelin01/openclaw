import { Badge, Separator } from "@uxin/ui";

interface Experience {
  company: string;
  role: string;
  duration: string;
  description: string;
}

interface Education {
  school: string;
  degree: string;
  year: string;
}

interface ResumeData {
  name: string;
  title?: string;
  summary?: string;
  skills?: string[];
  experiences?: Experience[];
  education?: Education[];
  location?: string;
  contact?: string;
}

interface ResumeTemplateProps {
  content: string;
}

export function ResumeTemplate({ content }: ResumeTemplateProps) {
  let data: ResumeData = { name: "" };
  try {
    data = JSON.parse(content);
  } catch (e) {
    return <div className="p-4 text-red-500">Error parsing resume data.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white shadow-sm min-h-[800px] text-gray-800">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{data.name}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {data.title && <span>{data.title}</span>}
          {data.location && (
            <>
              <span className="hidden sm:inline">•</span>
              <span>{data.location}</span>
            </>
          )}
          {data.contact && (
            <>
              <span className="hidden sm:inline">•</span>
              <span>{data.contact}</span>
            </>
          )}
        </div>
      </div>

      <Separator className="my-6" />

      {/* Summary */}
      {data.summary && (
        <div className="mb-8">
          <h2 className="text-lg font-bold uppercase tracking-wider mb-3 text-gray-700">Summary</h2>
          <p className="text-gray-600 leading-relaxed">{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experiences && data.experiences.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold uppercase tracking-wider mb-4 text-gray-700">
            Experience
          </h2>
          <div className="space-y-6">
            {data.experiences?.map((exp, i) => (
              <div key={i}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-gray-800">{exp.role}</h3>
                  <span className="text-sm text-gray-500">{exp.duration}</span>
                </div>
                <div className="text-sm font-medium text-gray-700 mb-2">{exp.company}</div>
                <p className="text-sm text-gray-600 whitespace-pre-line">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold uppercase tracking-wider mb-4 text-gray-700">
            Education
          </h2>
          <div className="space-y-4">
            {data.education?.map((edu, i) => (
              <div key={i}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-gray-800">{edu.school}</h3>
                  <span className="text-sm text-gray-500">{edu.year}</span>
                </div>
                <div className="text-sm text-gray-600">{edu.degree}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <div>
          <h2 className="text-lg font-bold uppercase tracking-wider mb-4 text-gray-700">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {data.skills?.map((skill, i) => (
              <Badge key={i} variant="secondary" className="px-3 py-1">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
