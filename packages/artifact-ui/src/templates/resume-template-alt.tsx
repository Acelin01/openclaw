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

export function ResumeTemplateAlt({ content }: ResumeTemplateProps) {
  let data: ResumeData = { name: "" };
  try {
    data = JSON.parse(content);
  } catch (e) {
    return <div className="p-4 text-red-500">Error parsing resume data.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white min-h-[800px] flex shadow-lg">
      {/* Sidebar */}
      <div className="w-1/3 bg-slate-900 text-white p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">{data.name}</h1>
          <p className="text-slate-400">{data.title}</p>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 border-b border-slate-700 pb-2">
              Contact
            </h2>
            <div className="space-y-2 text-sm text-slate-300">
              {data.location && <div>{data.location}</div>}
              {data.contact && <div>{data.contact}</div>}
            </div>
          </div>

          {data.education && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 border-b border-slate-700 pb-2">
                Education
              </h2>
              <div className="space-y-4">
                {data.education?.map((edu, i) => (
                  <div key={i}>
                    <div className="font-bold text-slate-200">{edu.school}</div>
                    <div className="text-sm text-slate-400">{edu.degree}</div>
                    <div className="text-xs text-slate-500 mt-1">{edu.year}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.skills && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 border-b border-slate-700 pb-2">
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {data.skills?.map((skill, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="bg-slate-800 text-slate-300 hover:bg-slate-700"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="w-2/3 p-8">
        {data.summary && (
          <div className="mb-10">
            <h2 className="text-lg font-bold uppercase tracking-widest text-slate-900 mb-4">
              Profile
            </h2>
            <p className="text-slate-600 leading-relaxed">{data.summary}</p>
          </div>
        )}

        {data.experiences && (
          <div>
            <h2 className="text-lg font-bold uppercase tracking-widest text-slate-900 mb-6">
              Experience
            </h2>
            <div className="space-y-8">
              {data.experiences?.map((exp, i) => (
                <div key={i} className="relative pl-8 border-l border-slate-200">
                  <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-slate-300 border-2 border-white"></div>
                  <div className="mb-1">
                    <h3 className="text-xl font-bold text-slate-800">{exp.role}</h3>
                    <div className="text-slate-500 font-medium">
                      {exp.company} | {exp.duration}
                    </div>
                  </div>
                  <p className="text-slate-600 mt-2 whitespace-pre-line">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
