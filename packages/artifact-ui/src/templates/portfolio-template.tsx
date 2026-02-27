import { Badge } from "@uxin/ui";
import { ExternalLink, Image as ImageIcon, Briefcase, Tag } from "lucide-react";

interface PortfolioData {
  title: string;
  description: string;
  coverUrl?: string;
  projectUrl?: string;
  tags?: string[];
  role?: string;
  date?: string;
}

interface PortfolioTemplateProps {
  content: string;
}

export function PortfolioTemplate({ content }: PortfolioTemplateProps) {
  let data: PortfolioData = { title: "", description: "" };
  try {
    data = JSON.parse(content);
  } catch (e) {
    return <div className="p-4 text-red-500">解析作品集数据出错。</div>;
  }

  return (
    <div className="max-w-3xl mx-auto bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {data.coverUrl ? (
        <div className="w-full h-64 bg-gray-100 relative group">
          <img src={data.coverUrl} alt={data.title} className="w-full h-full object-cover" />
          {data.projectUrl && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <a
                href={data.projectUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-white text-gray-900 px-4 py-2 rounded-full font-medium flex items-center gap-2 hover:bg-gray-100 transition-colors"
              >
                查看项目 <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-32 bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-gray-400" />
        </div>
      )}

      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{data.title}</h2>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {data.role && (
                <span className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" /> {data.role}
                </span>
              )}
              {data.date && <span>{data.date}</span>}
            </div>
          </div>
          {data.projectUrl && !data.coverUrl && (
            <a
              href={data.projectUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 text-sm"
            >
              访问链接 <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        <p className="text-gray-600 leading-relaxed mb-6">{data.description}</p>

        {data.tags && data.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.tags.map((tag, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-600 border-gray-200"
              >
                <Tag className="w-3 h-3" /> {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
