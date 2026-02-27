import { Star, ThumbsUp, Quote } from "lucide-react";
import { cn } from "../lib/utils";

interface ReviewData {
  rating: number;
  content: string;
  aspects?: Record<string, number>; // e.g., { "Communication": 5, "Quality": 4 }
  reviewerName?: string;
  reviewerRole?: string;
  date?: string;
}

interface ReviewTemplateProps {
  content: string;
}

export function ReviewTemplate({ content }: ReviewTemplateProps) {
  let data: ReviewData = { rating: 5, content: "" };
  try {
    data = JSON.parse(content);
  } catch (e) {
    return <div className="p-4 text-red-500">解析评价数据出错。</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white border rounded-2xl shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center border border-amber-200">
            <span className="text-xl font-bold text-amber-600">{data.rating.toFixed(1)}</span>
          </div>
          <div>
            <div className="flex gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "w-5 h-5",
                    star <= data.rating ? "fill-amber-400 text-amber-400" : "text-gray-200",
                  )}
                />
              ))}
            </div>
            <p className="text-sm text-gray-500 font-medium">综合评分</p>
          </div>
        </div>
        {data.date && <div className="text-sm text-gray-400">{data.date}</div>}
      </div>

      <div className="relative mb-8">
        <Quote className="absolute -top-3 -left-2 w-8 h-8 text-gray-100 rotate-180" />
        <div className="relative z-10 p-6 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-gray-700 leading-relaxed italic text-lg">"{data.content}"</p>
        </div>
      </div>

      {data.aspects && Object.keys(data.aspects).length > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-8">
          {Object.entries(data.aspects).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm text-gray-600 font-medium">{key}</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div
                    key={star}
                    className={cn(
                      "w-1.5 h-4 rounded-sm",
                      star <= value ? "bg-amber-400" : "bg-gray-200",
                    )}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {(data.reviewerName || data.reviewerRole) && (
        <div className="flex items-center gap-3 border-t pt-6">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
            {data.reviewerName ? data.reviewerName[0] : "?"}
          </div>
          <div>
            <div className="font-bold text-gray-900">{data.reviewerName || "匿名用户"}</div>
            {data.reviewerRole && <div className="text-sm text-gray-500">{data.reviewerRole}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
