import { cn, parseStructuredContent } from "../lib/utils";

interface DocumentData {
  title: string;
  content: string;
  lastUpdated?: string;
  collaborators?: string[];
}

interface DocumentTemplateProps {
  content: string;
}

export function DocumentTemplate({ content }: DocumentTemplateProps) {
  let data: DocumentData = { title: "", content: "" };

  try {
    data = parseStructuredContent<DocumentData>(content);
  } catch (e) {
    data = { title: "解析错误", content: content };
  }

  return (
    <div className="max-w-4xl mx-auto p-8 md:p-16 bg-white min-h-screen text-gray-800 shadow-sm border rounded-lg my-8">
      {data.title && (
        <h1 className="text-4xl font-bold mb-8 border-b pb-4 text-gray-900">{data.title}</h1>
      )}
      <div className="prose prose-slate max-w-none dark:prose-invert">
        <div className="whitespace-pre-wrap leading-relaxed">{data.content}</div>
      </div>

      {data.lastUpdated && (
        <div className="mt-12 pt-8 border-t text-sm text-gray-400 italic">
          最后更新于: {data.lastUpdated}
        </div>
      )}
    </div>
  );
}
