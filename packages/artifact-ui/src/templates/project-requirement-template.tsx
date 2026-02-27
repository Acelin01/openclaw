import {
  ProjectRequirement,
  PriorityBadge,
  StatusBadge,
  RequirementSubItemTable,
  RequirementStatsView,
  RequirementStats,
} from "@uxin/requirement-lib";
import { ScrollArea, Card, CardContent, CardHeader, CardTitle, Separator } from "@uxin/ui";
import React from "react";

interface ProjectRequirementTemplateProps {
  content: string;
  token?: string;
}

export const ProjectRequirementTemplate = ({ content, token }: ProjectRequirementTemplateProps) => {
  const requirement = React.useMemo(() => {
    try {
      return JSON.parse(content) as Partial<ProjectRequirement>;
    } catch (e) {
      return {} as Partial<ProjectRequirement>;
    }
  }, [content]);

  // We might not have stats in the template view if it's just based on content string
  const stats = undefined;
  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950">
      <div className="p-8 space-y-8 max-w-4xl mx-auto w-full">
        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {requirement.title || "未命名需求"}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {requirement.priority && <PriorityBadge priority={requirement.priority} />}
            {requirement.status && <StatusBadge status={requirement.status} />}
            <Separator orientation="vertical" className="h-4" />
            <span className="text-zinc-500">类型: {requirement.type || "未分类"}</span>
            {requirement.createdAt && (
              <>
                <Separator orientation="vertical" className="h-4" />
                <span className="text-zinc-500">
                  创建于: {new Date(requirement.createdAt).toLocaleDateString()}
                </span>
              </>
            )}
          </div>
        </div>

        {stats && <RequirementStatsView stats={stats} />}

        {/* Description Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 border-b pb-2">
            需求描述
          </h2>
          <div className="prose prose-zinc dark:prose-invert max-w-none">
            {requirement.description || "无详细描述"}
          </div>
        </div>

        {/* Sub-items Section */}
        {requirement.subItems && requirement.subItems.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 border-b pb-2">
              需求子项
            </h2>
            <div className="rounded-lg border border-zinc-100 dark:border-zinc-800 overflow-hidden">
              <RequirementSubItemTable subItems={requirement.subItems} />
            </div>
          </div>
        )}

        {/* Links Section */}
        {requirement.links && requirement.links.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 border-b pb-2">
              关联资源
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requirement.links.map((link) => (
                <div
                  key={link.id}
                  className="p-4 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      {link.targetType}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                    {link.description}
                  </p>
                  {link.url && (
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline truncate block"
                    >
                      {link.url}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
