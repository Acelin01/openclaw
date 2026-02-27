import { Separator } from "@uxin/ui";
import { HelpCircle, MessageCircle, User, MessageSquare } from "lucide-react";

interface QnAData {
  question: string;
  answer?: string;
  askedBy?: string;
  answeredBy?: string;
  tags?: string[];
}

interface QnATemplateProps {
  content: string;
}

export function QnATemplate({ content }: QnATemplateProps) {
  let data: QnAData = { question: "" };
  try {
    data = JSON.parse(content);
  } catch (e) {
    return <div className="p-4 text-red-500">解析问答数据出错。</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white space-y-6">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200">
            <HelpCircle className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">问题</h3>
            {data.askedBy && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <User className="w-3 h-3" /> {data.askedBy}
              </span>
            )}
          </div>
          <p className="text-gray-800 font-medium text-lg leading-relaxed bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            {data.question}
          </p>
        </div>
      </div>

      {data.answer && (
        <>
          <div className="flex justify-center">
            <div className="w-0.5 h-8 bg-gray-100"></div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200">
                <MessageCircle className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">回答</h3>
                {data.answeredBy && (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <User className="w-3 h-3" /> {data.answeredBy}
                  </span>
                )}
              </div>
              <div className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 markdown-body">
                {data.answer}
              </div>
            </div>
          </div>
        </>
      )}

      {data.tags && data.tags.length > 0 && (
        <div className="flex gap-2 pt-4">
          {data.tags.map((tag, i) => (
            <span
              key={i}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md border border-gray-200"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
