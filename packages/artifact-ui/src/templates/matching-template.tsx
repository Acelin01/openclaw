import { Badge, Separator, Progress } from "@uxin/ui";
import { ThumbsUp, ThumbsDown, AlertTriangle, CheckCircle } from "lucide-react";

interface MatchingData {
  source: string; // e.g. Candidate Name
  target: string; // e.g. Job Title
  score: number; // 0-100
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
}

interface MatchingTemplateProps {
  content: string;
}

export function MatchingTemplate({ content }: MatchingTemplateProps) {
  let data: MatchingData = {
    source: "",
    target: "",
    score: 0,
    summary: "",
    strengths: [],
    weaknesses: [],
    recommendation: "",
  };
  try {
    data = JSON.parse(content);
  } catch (e) {
    return <div className="p-4 text-red-500">Error parsing matching data.</div>;
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 80) return "bg-green-600";
    if (score >= 60) return "bg-yellow-600";
    return "bg-red-600";
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white min-h-[600px] text-gray-800">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Matching Analysis</h1>
        <div className="text-gray-500 flex items-center justify-center gap-2">
          <span className="font-medium text-gray-900">{data.source}</span>
          <span className="text-gray-400">vs</span>
          <span className="font-medium text-gray-900">{data.target}</span>
        </div>
      </div>

      {/* Score Card */}
      <div className="bg-gray-50 rounded-xl p-8 mb-8 text-center border border-gray-100">
        <div className={`text-6xl font-bold mb-2 ${getScoreColor(data.score)}`}>{data.score}%</div>
        <div className="text-gray-500 font-medium uppercase tracking-widest text-sm mb-6">
          Match Score
        </div>
        <Progress value={data.score} className="h-3 w-full max-w-xs mx-auto" />
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-bold uppercase tracking-wider mb-3 text-gray-700">Summary</h2>
        <p className="text-gray-600 leading-relaxed">{data.summary}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-green-50 p-6 rounded-lg border border-green-100">
          <h3 className="flex items-center gap-2 font-bold text-green-800 mb-4">
            <ThumbsUp className="w-5 h-5" />
            Strengths
          </h3>
          <ul className="space-y-2">
            {data.strengths?.map((item, i) => (
              <li key={i} className="flex gap-2 text-green-700 text-sm">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 opacity-60" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-red-50 p-6 rounded-lg border border-red-100">
          <h3 className="flex items-center gap-2 font-bold text-red-800 mb-4">
            <ThumbsDown className="w-5 h-5" />
            Gaps
          </h3>
          <ul className="space-y-2">
            {data.weaknesses?.map((item, i) => (
              <li key={i} className="flex gap-2 text-red-700 text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 opacity-60" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
        <h2 className="text-lg font-bold text-blue-900 mb-2">Recommendation</h2>
        <p className="text-blue-800">{data.recommendation}</p>
      </div>
    </div>
  );
}
