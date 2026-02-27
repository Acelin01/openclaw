import { Badge, Progress } from "@uxin/ui";
import { ThumbsUp, ThumbsDown, CheckCircle, XCircle, ArrowRight } from "lucide-react";

interface MatchingData {
  source: string;
  target: string;
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
}

interface MatchingTemplateProps {
  content: string;
}

export function MatchingTemplateAlt({ content }: MatchingTemplateProps) {
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
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-amber-500";
    return "text-rose-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div className="max-w-3xl mx-auto bg-slate-900 text-slate-100 min-h-[600px] p-8 rounded-xl shadow-2xl">
      <div className="flex items-center justify-between mb-10">
        <div className="flex-1 text-center">
          <div className="text-sm text-slate-400 mb-1">Source</div>
          <div className="font-bold text-lg">{data.source}</div>
        </div>
        <div className="px-4">
          <ArrowRight className="w-6 h-6 text-slate-600" />
        </div>
        <div className="flex-1 text-center">
          <div className="text-sm text-slate-400 mb-1">Target</div>
          <div className="font-bold text-lg">{data.target}</div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center mb-12">
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              className="text-slate-800"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              className={getScoreColor(data.score)}
              strokeDasharray={440}
              strokeDashoffset={440 - (440 * data.score) / 100}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold ${getScoreColor(data.score)}`}>{data.score}</span>
            <span className="text-xs uppercase tracking-wider text-slate-500">Match</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 p-6 rounded-lg mb-8 border border-slate-700/50">
        <p className="text-slate-300 text-center leading-relaxed italic">"{data.summary}"</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="flex items-center gap-2 font-bold text-emerald-400 mb-4 border-b border-emerald-500/20 pb-2">
            <ThumbsUp className="w-4 h-4" />
            Strengths
          </h3>
          <ul className="space-y-3">
            {data.strengths?.map((item, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-300">
                <CheckCircle className="w-4 h-4 text-emerald-500/50 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="flex items-center gap-2 font-bold text-rose-400 mb-4 border-b border-rose-500/20 pb-2">
            <ThumbsDown className="w-4 h-4" />
            Weaknesses
          </h3>
          <ul className="space-y-3">
            {data.weaknesses?.map((item, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-300">
                <XCircle className="w-4 h-4 text-rose-500/50 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 p-6 rounded-lg border border-blue-500/20">
        <h2 className="text-sm font-bold uppercase tracking-widest text-blue-300 mb-2">
          Recommendation
        </h2>
        <p className="text-blue-100">{data.recommendation}</p>
      </div>
    </div>
  );
}
