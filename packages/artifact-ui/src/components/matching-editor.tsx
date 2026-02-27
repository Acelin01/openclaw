"use client";

import { Input, Textarea, Label } from "@uxin/ui";
import { Badge } from "@uxin/ui";
import {
  Plus,
  Trash2,
  Target,
  Zap,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  CheckCircle2,
  UserCheck,
  Star,
  Award,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { parseStructuredContent } from "../lib/utils";
import { Editor } from "./text-editor";

interface AgentMatch {
  agent: {
    id: string;
    name: string;
    identifier?: string;
  };
  score: number;
  reasons: string[];
}

interface MatchingData {
  analysis?: string;
  score?: number;
  recommendation?: string;
  type?: string;
  matches?: AgentMatch[];
}

export function MatchingEditor(props: React.ComponentProps<typeof Editor>) {
  const { content, onSaveContent, status } = props;
  const [data, setData] = useState<MatchingData>({
    analysis: "",
    score: 0,
  });
  const [parseError, setParseError] = useState(false);

  useEffect(() => {
    if (!content) return;
    try {
      const parsed = parseStructuredContent<MatchingData>(content);
      setData(parsed);
      setParseError(false);
    } catch (e) {
      if (status !== "streaming") {
        setParseError(true);
      }
    }
  }, [content, status]);

  const updateData = (updates: Partial<MatchingData>) => {
    const newData = { ...data, ...updates };
    setData(newData);
    onSaveContent(JSON.stringify(newData, null, 2), false);
  };

  if (data.type === "agent-matches" && data.matches) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2">
            <Target className="text-emerald-500" size={20} />
            <h2 className="text-lg font-bold">智能专家匹配报告</h2>
          </div>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            匹配度优先
          </Badge>
        </div>

        <div className="space-y-4">
          {data.matches.map((match, idx) => (
            <div
              key={match.agent.id || idx}
              className={`p-4 rounded-xl border-2 transition-all ${
                idx === 0
                  ? "border-emerald-500 bg-emerald-50/30 shadow-sm"
                  : "border-border bg-card"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`size-12 rounded-full flex items-center justify-center text-lg font-bold ${
                      idx === 0 ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {match.agent.name?.slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-bold text-base flex items-center gap-2">
                      {match.agent.name}
                      {idx === 0 && <Award size={16} className="text-amber-500" />}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">
                      {match.agent.identifier || "智能体专家"}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div
                    className={`text-xl font-black ${
                      match.score >= 90 ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    {Math.round(match.score)}%
                  </div>
                  <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                    匹配指数
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 mt-4">
                {match.reasons.map((reason, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm text-zinc-600 bg-white/50 p-2 rounded border border-border/50"
                  >
                    <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>

              {idx === 0 && (
                <div className="mt-4 pt-4 border-t border-emerald-100 flex justify-end">
                  <button className="text-xs font-bold bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2">
                    <Plus size={14} />
                    立即邀请协作
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {data.recommendation && (
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3">
            <Lightbulb className="text-blue-500 shrink-0 mt-0.5" size={18} />
            <div>
              <div className="font-bold text-blue-900 text-sm mb-1">系统建议</div>
              <p className="text-blue-800 text-xs leading-relaxed">{data.recommendation}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (parseError) {
    return (
      <div className="p-4">
        <div className="text-red-500 mb-2">
          Error parsing matching data. Switching to raw text editor.
        </div>
        <Editor {...props} />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="grid gap-2">
        <Label className="text-sm font-medium">Match Score (0-100)</Label>
        <div className="flex items-center gap-4">
          <Input
            type="number"
            min={0}
            max={100}
            value={data.score || 0}
            onChange={(e) => updateData({ score: parseInt(e.target.value) || 0 })}
            className="w-24"
            disabled={status === "streaming"}
          />
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${data.score >= 80 ? "bg-green-500" : data.score >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
              style={{ width: `${Math.min(100, Math.max(0, data.score || 0))}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-2">
        <Label className="text-sm font-medium">Analysis</Label>
        <Textarea
          value={data.analysis || ""}
          onChange={(e) => updateData({ analysis: e.target.value })}
          placeholder="Detailed analysis..."
          rows={8}
          disabled={status === "streaming"}
        />
      </div>

      <div className="grid gap-2">
        <Label className="text-sm font-medium">Recommendation</Label>
        <Textarea
          value={data.recommendation || ""}
          onChange={(e) => updateData({ recommendation: e.target.value })}
          placeholder="Recommendation or next steps..."
          rows={4}
          disabled={status === "streaming"}
        />
      </div>
    </div>
  );
}
