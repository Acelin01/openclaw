"use client";

import { Badge } from "@uxin/ui";
import { UserIcon, BriefcaseIcon, StarIcon, MapPinIcon } from "lucide-react";
import { cn } from "../../lib/utils";

interface ResourceSearchToolProps {
  part: any;
}

export function ResourceSearchTool({ part }: ResourceSearchToolProps) {
  const { toolCallId, state, output } = part;

  if (state !== "output-available" || !output) return null;

  const matches = output.matches || [];
  const externalOptions = output.externalOptions || [];

  return (
    <div className="not-prose mb-6 w-full space-y-4" key={toolCallId}>
      {matches.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm font-semibold text-zinc-800">匹配团队成员</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {matches.map((item: any, index: number) => (
              <div
                key={`${toolCallId}-match-${index}`}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:border-emerald-200 hover:shadow-md"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      <UserIcon size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-zinc-900">{item.name}</div>
                      <div className="text-xs text-zinc-500">{item.title}</div>
                    </div>
                  </div>
                  {item.matchScore && (
                    <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      <StarIcon size={10} fill="currentColor" />
                      {Math.round(item.matchScore * 100)}% 匹配
                    </div>
                  )}
                </div>

                <div className="mb-3 flex flex-wrap gap-1">
                  {item.skills?.slice(0, 4).map((skill: string) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="bg-zinc-100 text-[10px] font-normal text-zinc-600 hover:bg-zinc-100"
                    >
                      {skill}
                    </Badge>
                  ))}
                  {item.skills?.length > 4 && (
                    <span className="text-[10px] text-zinc-400">+{item.skills.length - 4}</span>
                  )}
                </div>

                {item.description && (
                  <p className="mb-3 line-clamp-2 text-xs text-zinc-500">{item.description}</p>
                )}

                <div className="mt-auto flex items-center justify-between border-t border-zinc-50 pt-2 text-[10px] text-zinc-400">
                  <div className="flex items-center gap-1">
                    <BriefcaseIcon size={12} />
                    <span>可用性: {item.availability}%</span>
                  </div>
                  {item.cost > 0 && (
                    <div className="font-medium text-zinc-600">¥{item.cost}/时</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {externalOptions.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm font-semibold text-zinc-800">外部资源建议</div>
          <div className="space-y-2">
            {externalOptions.map((option: any, index: number) => (
              <div
                key={`${toolCallId}-external-${index}`}
                className="flex items-start gap-3 rounded-lg border border-zinc-100 bg-zinc-50/50 p-3 transition-colors hover:bg-zinc-50"
              >
                <div
                  className={cn(
                    "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg text-white",
                    option.type === "recruitment" ? "bg-blue-500" : "bg-purple-500",
                  )}
                >
                  <BriefcaseIcon size={16} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-zinc-900">{option.title}</div>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-500">{option.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
