"use client";

import { Badge } from "@uxin/ui";
import { CheckCircle2, UserCheck, Loader2, Star, Target, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "../../lib/utils";
import { useDataStream } from "../data-stream-provider";
import { Tool, ToolHeader, ToolContent, ToolInput, ToolOutput } from "../elements/tool";

interface MatchAgentsToolProps {
  part: any;
}

export function MatchAgentsTool({ part }: MatchAgentsToolProps) {
  const { toolCallId, state, output, input } = part;
  const { dataStream } = useDataStream();
  const [matches, setMatches] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // 监听流式数据中的匹配结果
  useEffect(() => {
    if (!dataStream) return;

    const matchPart = dataStream.find((d) => d.type === "data-agent-matches");
    if (matchPart && matchPart.data) {
      setMatches(matchPart.data as any[]);
      setIsSearching(false);
    }

    const stepPart = dataStream.find((d) => d.type === "data-step" && d.data?.includes("分析需求"));
    if (stepPart) {
      setIsSearching(true);
    }
  }, [dataStream]);

  const renderMatches = (matchesToRender: any[]) => {
    if (!matchesToRender || matchesToRender.length === 0) {
      return (
        <div className="text-sm text-muted-foreground flex items-center gap-2 p-2">
          <Info size={14} />
          未找到完全匹配的专家，正在扩大搜索范围...
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {matchesToRender.map((match: any, idx: number) => (
          <div
            key={match.agent?.id || idx}
            className="flex flex-col gap-2 p-3 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                  {match.agent?.name?.slice(0, 2) || "NA"}
                </div>
                <div>
                  <div className="text-sm font-semibold flex items-center gap-2">
                    {match.agent?.name || "未知专家"}
                    {idx === 0 && (
                      <Badge
                        variant="secondary"
                        className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] py-0 h-4"
                      >
                        最佳匹配
                      </Badge>
                    )}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {match.agent?.identifier || "领域专家"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-amber-500">
                <Star size={12} fill="currentColor" />
                <span className="text-xs font-bold">{Math.round(match.score || 0)}%</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mt-1">
              {match.reasons?.slice(0, 3).map((reason: string, i: number) => (
                <span
                  key={i}
                  className="text-[10px] bg-muted px-1.5 py-0.5 rounded-sm text-muted-foreground flex items-center gap-1"
                >
                  <Target size={8} />
                  {reason}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Tool key={toolCallId} open>
      <ToolHeader state={state} type="tool-matchAgents" />
      <ToolContent>
        <ToolInput input={input} />
        <ToolOutput>
          <div className="flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                {state === "output-available" ? (
                  <CheckCircle2 size={16} className="text-emerald-500" />
                ) : (
                  <Loader2 size={16} className="text-blue-500 animate-spin" />
                )}
                <span>{isSearching ? "正在分析并匹配专家..." : "专家匹配建议"}</span>
              </div>
              <Badge variant="outline" className="text-[10px]">
                {input.intent || "需求匹配"}
              </Badge>
            </div>

            {renderMatches(matches.length > 0 ? matches : output?.matches || [])}

            {state === "output-available" && output?.recommendation && (
              <div className="mt-2 p-2 rounded bg-emerald-50 border border-emerald-100 text-[11px] text-emerald-800 flex items-start gap-2">
                <UserCheck size={14} className="shrink-0 mt-0.5" />
                <p>
                  建议由 <strong>{output.recommendation}</strong>{" "}
                  负责此项任务，他拥有最契合的技能储备和领域经验。
                </p>
              </div>
            )}
          </div>
        </ToolOutput>
      </ToolContent>
    </Tool>
  );
}
