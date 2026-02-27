"use client";

import { Button, Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@uxin/ui";
import { Eye, Pencil, Send, CheckCircle2, XCircle, ChevronLeft } from "lucide-react";
import { type Dispatch, memo, type SetStateAction, useState } from "react";
import { toast } from "sonner";
import { useWindowSize } from "usehooks-ts";
import type { ArtifactActionContext } from "./create-artifact";
import { artifactDefinitions } from "../artifacts/index";
import { useArtifact } from "../hooks/use-artifact";
import { useArtifactActions } from "../hooks/use-artifact-actions";
import { type UIArtifact } from "../lib/types";
import { cn } from "../lib/utils";
import { ArtifactCloseButton } from "./artifact-close-button";

type ArtifactActionsProps = {
  artifact: UIArtifact;
  handleVersionChange: (type: "next" | "prev" | "toggle" | "latest") => void;
  currentVersionIndex: number;
  isCurrentVersion: boolean;
  mode: "edit" | "diff";
  metadata: any;
  setMetadata: Dispatch<SetStateAction<any>>;
  viewMode: "edit" | "preview";
  setViewMode: Dispatch<SetStateAction<"edit" | "preview">>;
  token?: string;
  onApprove?: () => Promise<void>;
  onReject?: () => Promise<void>;
  isUpdatingStatus?: boolean;

  // Header props
  title?: string;
  isContentDirty?: boolean;
  updatedAtString?: string;
  selectedProjectId?: string | null;
  setSelectedProjectId?: (id: string | null) => void;
  selectedProject?: any;
  onClose?: () => void;
};

export const ArtifactActions = memo(
  ({
    artifact,
    handleVersionChange,
    currentVersionIndex,
    isCurrentVersion,
    mode,
    metadata,
    setMetadata,
    viewMode,
    setViewMode,
    token,
    onApprove,
    onReject,
    isUpdatingStatus,

    title,
    isContentDirty,
    updatedAtString,
    selectedProjectId,
    setSelectedProjectId,
    selectedProject,
    onClose,
  }: ArtifactActionsProps) => {
    const { setArtifact } = useArtifact();
    const { handlePublish, isLoading, showSuccess, showError } = useArtifactActions(
      artifact,
      token,
      metadata,
    );
    const [isActionLoading, setIsActionLoading] = useState(false);

    const artifactDefinition = artifactDefinitions.find(
      (definition) => definition.kind === artifact.kind,
    );

    const { width: windowWidth } = useWindowSize();
    const isMobile = windowWidth ? windowWidth < 768 : false;

    if (!artifactDefinition) {
      return null;
    }

    const hasTemplate = !!artifactDefinition.template || !!artifactDefinition.templates?.length;
    const canPublish = [
      "project",
      "position",
      "resume",
      "service",
      "requirement",
      "matching",
      "quote",
      "agent",
    ].includes(artifact.kind);

    const actionContext: ArtifactActionContext = {
      content: artifact.content,
      handleVersionChange,
      currentVersionIndex,
      isCurrentVersion,
      mode,
      metadata,
      setMetadata,
    };

    // Determine if we are in Project Hall or Project Detail view
    const isProjectArtifact = artifact.kind === "project";
    const isProjectHall =
      isProjectArtifact && (!artifact.documentId || artifact.documentId === "project-list");
    const isProjectDetail = isProjectArtifact && artifact.documentId?.startsWith("project-");

    if (isMobile && viewMode === "preview" && artifact.kind === "service") {
      return (
        <div className="fixed top-4 left-4 z-[60] pointer-events-auto">
          <ArtifactCloseButton onClick={onClose} />
        </div>
      );
    }

    return (
      <TooltipProvider>
        <div
          className={cn(
            "flex flex-row items-start justify-between p-2 w-full",
            isMobile && "bg-background border-b",
          )}
        >
          {/* Left Side & Title */}
          <div className="flex flex-row items-start gap-4">
            {isProjectHall ? (
              // Project Hall: Close Button (Previously hidden)
              <ArtifactCloseButton onClick={onClose} />
            ) : isProjectDetail ? (
              // Project Detail: Back Icon + Close Button
              <div className="flex flex-row gap-2">
                <Button
                  variant="ghost"
                  className="h-fit p-2 dark:hover:bg-zinc-700"
                  onClick={() => {
                    setSelectedProjectId?.(null);
                    setArtifact((prev) => ({
                      ...prev,
                      documentId: "project-list",
                      title: "项目列表",
                    }));
                  }}
                >
                  <ChevronLeft size={18} />
                </Button>
                <ArtifactCloseButton onClick={onClose} />
              </div>
            ) : (
              // Default: Close Button
              <ArtifactCloseButton onClick={onClose} />
            )}

            <div className="flex flex-col">
              <div className="font-medium">
                {isProjectHall
                  ? "项目大厅"
                  : isProjectDetail && selectedProject
                    ? selectedProject.name
                    : title}
              </div>

              {/* Timestamp (Keep for default and maybe Project Hall if desired, but user didn't specify) */}
              {/* Only show timestamp if NOT in Project Detail (or if user wants it, assuming keep for now unless it looks bad) */}
              {!isProjectDetail &&
                (isContentDirty ? (
                  <div className="text-muted-foreground text-sm">正在保存更改...</div>
                ) : updatedAtString ? (
                  <div className="text-muted-foreground text-sm">{updatedAtString}</div>
                ) : (
                  <div className="mt-2 h-3 w-32 animate-pulse rounded-md bg-muted-foreground/20" />
                ))}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex flex-row gap-1 items-center">
            {artifact.approvalStatus === "PENDING" && (
              <div className="flex items-center gap-1 mr-2 px-2 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200/50 dark:border-amber-800/30">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                      onClick={onApprove}
                      disabled={isUpdatingStatus}
                    >
                      <CheckCircle2 size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>通过审核</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
                      onClick={onReject}
                      disabled={isUpdatingStatus}
                    >
                      <XCircle size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>驳回审核</TooltipContent>
                </Tooltip>
              </div>
            )}

            {!isProjectHall && !isProjectDetail && (
              // Default Actions (Original Logic)
              <>
                {hasTemplate && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "h-8 w-8 p-2 rounded-lg hover:bg-slate-100 transition-colors",
                          artifact.kind === "project" &&
                            viewMode === "edit" &&
                            "h-10 w-10 rounded-xl",
                          artifact.kind === "agent" && "border-none hover:bg-slate-100 shadow-none",
                          artifact.kind === "agent" &&
                            viewMode === "preview" &&
                            "h-10 w-10 bg-slate-100",
                        )}
                        onClick={() => setViewMode(viewMode === "edit" ? "preview" : "edit")}
                      >
                        {viewMode === "edit" ? (
                          <Eye size={artifact.kind === "project" ? 20 : 18} />
                        ) : (
                          <Pencil size={artifact.kind === "project" ? 20 : 18} />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{viewMode === "edit" ? "预览" : "编辑"}</TooltipContent>
                  </Tooltip>
                )}

                {viewMode === "edit" && (
                  <>
                    {canPublish &&
                      !artifactDefinition.actions.some((a) => a.label === "发布") &&
                      (["position", "agent"].includes(artifact.kind) ? (
                        <Button
                          onClick={() => handlePublish()}
                          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1dbf73] text-white font-bold hover:bg-[#19a463] transition-all shadow-lg shadow-[#1dbf73]/20 h-auto"
                          disabled={isLoading}
                        >
                          <Send className="w-4 h-4" />
                          发布
                        </Button>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              className={cn(
                                "h-8 w-8 p-2",
                                artifact.kind === "project" &&
                                  "h-10 w-10 rounded-xl bg-white hover:bg-slate-50",
                              )}
                              onClick={() => handlePublish()}
                              disabled={isLoading}
                            >
                              <Send size={artifact.kind === "project" ? 20 : 18} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>发布</TooltipContent>
                        </Tooltip>
                      ))}

                    {artifactDefinition.actions.map((action) => {
                      const isPublishAction = action.label === "发布";

                      return (
                        <Tooltip key={action.description}>
                          <TooltipTrigger asChild>
                            <Button
                              variant={isPublishAction ? "default" : "ghost"}
                              className={cn("h-8", {
                                "w-8 p-2": !action.label,
                                "px-3 py-1.5 h-auto text-xs font-bold gap-1.5 rounded-full transition-all":
                                  action.label,
                                "bg-[#1dbf73] hover:bg-[#19a463] text-white border-none shadow-md shadow-[#1dbf73]/20":
                                  isPublishAction,
                              })}
                              disabled={
                                isLoading || isActionLoading || artifact.status === "streaming"
                                  ? true
                                  : action.isDisabled
                                    ? (action.isDisabled as any)(actionContext)
                                    : false
                              }
                              onClick={async () => {
                                setIsActionLoading(true);

                                try {
                                  await Promise.resolve((action.onClick as any)(actionContext));
                                } catch (_error) {
                                  toast.error("执行操作失败");
                                } finally {
                                  setIsActionLoading(false);
                                }
                              }}
                            >
                              {action.icon}
                              {action.label}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{action.description}</TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </>
                )}
              </>
            )}
          </div>

          {/* 成功提示 Toast */}
          {showSuccess && (
            <div className="fixed top-10 right-10 z-[100] animate-in slide-in-from-right-10">
              <div className="bg-[#1dbf73] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold">操作成功</div>
                  <div className="text-sm text-white/80">
                    {artifact.kind === "position" ? "岗位信息已同步更新" : "内容已发布"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 失败提示 Toast */}
          {showError && (
            <div className="fixed top-10 right-10 z-[100] animate-in slide-in-from-right-10">
              <div className="bg-[#ef4444] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold">操作失败</div>
                  <div className="text-sm text-white/80">发布失败，请稍后重试</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </TooltipProvider>
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.viewMode !== nextProps.viewMode) return false;
    if (prevProps.artifact.status !== nextProps.artifact.status) return false;
    if (prevProps.artifact.approvalStatus !== nextProps.artifact.approvalStatus) return false;
    if (prevProps.currentVersionIndex !== nextProps.currentVersionIndex) return false;
    if (prevProps.isCurrentVersion !== nextProps.isCurrentVersion) return false;
    if (prevProps.artifact.kind !== nextProps.artifact.kind) return false;
    if (prevProps.isUpdatingStatus !== nextProps.isUpdatingStatus) return false;
    return true;
  },
);

ArtifactActions.displayName = "ArtifactActions";
