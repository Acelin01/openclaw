"use client";

import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@uxin/ui";
import { ChevronRightIcon } from "lucide-react";
import { useArtifact } from "../../hooks/use-artifact";
import { formatDate } from "../../lib/utils";

interface ResourceListToolProps {
  part: any;
  type: "projects" | "documents";
}

export function ResourceListTool({ part, type }: ResourceListToolProps) {
  const { toolCallId, state } = part;
  const { setArtifact } = useArtifact();

  if (state !== "output-available") return null;

  const count =
    type === "projects" ? part.output.projects?.length || 0 : part.output.documents?.length || 0;

  const title = type === "projects" ? `找到 ${count} 个项目` : `找到 ${count} 个相关文档`;

  return (
    <div className="not-prose mb-4 w-full" key={toolCallId}>
      <Collapsible defaultOpen={true}>
        <CollapsibleTrigger className="group mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
          <ChevronRightIcon className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-90" />
          {title}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-1 pl-1">
            {count > 0 ? (
              type === "projects" ? (
                part.output.projects.map((project: any, index: number) => (
                  <div
                    className="group/item flex cursor-pointer items-center gap-3 rounded-md p-2 transition-colors hover:bg-muted"
                    key={`${toolCallId}-${project.id}-${index}`}
                    onClick={() => {
                      setArtifact((current: any) => ({
                        ...current,
                        documentId: project.id,
                        title: project.name,
                        kind: "project",
                        isVisible: true,
                        status: "idle",
                        content: JSON.stringify(project),
                      }));
                    }}
                  >
                    <div className="h-4 w-[2px] bg-primary/20 transition-colors group-hover/item:bg-primary" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{project.name}</span>
                      {project.status && (
                        <span className="mt-0.5 text-[10px] leading-none text-muted-foreground">
                          {project.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                part.output.documents.map((doc: any, index: number) => (
                  <div
                    className="group/item flex cursor-pointer items-center gap-3 rounded-md p-2 transition-colors hover:bg-muted"
                    key={`${toolCallId}-${doc.id}-${index}`}
                    onClick={() => {
                      setArtifact((current: any) => ({
                        ...current,
                        documentId: doc.id,
                        title: doc.title,
                        kind: doc.kind as any,
                        isVisible: true,
                        status: "idle",
                        content: "",
                      }));
                    }}
                  >
                    <div className="h-4 w-[2px] bg-primary/20 transition-colors group-hover/item:bg-primary" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{doc.title}</span>
                      <div className="mt-0.5 flex items-center gap-2">
                        <span className="text-[10px] capitalize leading-none text-muted-foreground">
                          {doc.kind}
                        </span>
                        <span className="text-[10px] leading-none text-muted-foreground/50">•</span>
                        <span className="text-[10px] leading-none text-muted-foreground">
                          {formatDate(doc.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )
            ) : (
              <div className="pl-4 text-sm text-muted-foreground">
                未找到{type === "projects" ? "项目" : "文档"}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
