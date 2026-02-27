"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { Button } from "@uxin/ui";
import { formatDistanceToNowStrict } from "date-fns";
import { zhCN } from "date-fns/locale";
import { AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { memo, type Dispatch, type SetStateAction } from "react";
import type { ChatMessage, ArtifactDocument } from "../lib/types";
import { constructApiUrl } from "../lib/api";
import { ArtifactActions } from "./artifact-actions";
import { ProjectDetailView } from "./project-detail-view-wrapper";
import { ProjectListPreview } from "./project-list-preview";
import { Toolbar } from "./toolbar";
import { VersionFooter } from "./version-footer";

const TemplateThumbnail = memo(
  ({
    Component,
    content,
    selected,
    label,
    onClick,
    scale = 0.12,
  }: {
    Component: any;
    content: string;
    selected: boolean;
    label: string;
    onClick?: () => void;
    scale?: number;
  }) => {
    if (!Component) return null;

    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick?.();
          }
        }}
        className={`group relative flex flex-col items-center gap-2 p-2 rounded-lg border-2 transition-all cursor-pointer hover:bg-muted/50 ${
          selected
            ? "border-primary bg-primary/5"
            : "border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
        }`}
      >
        <div
          className={`w-24 h-16 rounded overflow-hidden relative border shadow-sm bg-background ${selected ? "border-primary" : "border-zinc-200 dark:border-zinc-700"}`}
        >
          <div
            className="absolute top-0 left-0 origin-top-left pointer-events-none select-none"
            style={{
              width: "800px", // Fixed virtual width
              transform: `scale(${scale})`,
            }}
          >
            {content ? (
              <Component content={content} />
            ) : (
              <div className="p-4 text-muted-foreground text-lg">暂无内容</div>
            )}
          </div>
        </div>
        <span
          className={`text-[10px] font-medium ${selected ? "text-primary" : "text-muted-foreground"}`}
        >
          {label}
        </span>
        {selected && (
          <div className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center shadow-sm z-10">
            <Check size={10} className="text-primary-foreground" />
          </div>
        )}
      </div>
    );
  },
);

TemplateThumbnail.displayName = "TemplateThumbnail";

interface ArtifactPanelProps {
  artifact: any;
  currentVersionIndex: number;
  handleVersionChange: (type: "next" | "prev" | "toggle" | "latest") => void;
  isCurrentVersion: boolean;
  metadata: any;
  mode: "edit" | "diff";
  setMetadata: Dispatch<SetStateAction<any>>;
  viewMode: "edit" | "preview";
  setViewMode: Dispatch<SetStateAction<"edit" | "preview">>;
  token?: string;
  onApprove: () => Promise<void>;
  onReject: () => Promise<void>;
  isUpdatingStatus: boolean;
  isContentDirty: boolean;
  currentDocument: ArtifactDocument | null;
  selectedProjectId: string | null;
  setSelectedProjectId: Dispatch<SetStateAction<string | null>>;
  selectedProject: any;
  isProjectLoading: boolean;
  templates: any[];
  selectedTemplateId: string | null;
  setSelectedTemplateId: Dispatch<SetStateAction<string | null>>;
  projects?: Array<{ id: string; name: string }>;
  isProjectsLoading?: boolean;
  onAddToProject?: (projectId: string) => Promise<void>;
  setChatMetadata: Dispatch<SetStateAction<any>>;
  setArtifact: Dispatch<SetStateAction<any>>;
  getDocumentContentById: (index: number) => string;
  saveContent: (updatedContent: string, debounce: boolean) => void;
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
  isDocumentsFetching: boolean;
  onUpdateProject?: (projectId: string, updates: any) => Promise<void>;
  handleProjectUpdate: (updates: Record<string, any>) => Promise<void>;
  handleAdminTableClick: (config: any) => void;
  handleGenerateSchema: (configId: string) => Promise<void>;
  onClose?: () => void;
  isToolbarVisible: boolean;
  setIsToolbarVisible: Dispatch<SetStateAction<boolean>>;
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  status: UseChatHelpers<ChatMessage>["status"];
  stop: UseChatHelpers<ChatMessage>["stop"];
  documents: ArtifactDocument[] | undefined;
  SelectedTemplate: any;
  ArtifactContentComponent: any;
  userId?: string;
}

export const ArtifactPanel = memo(
  ({
    artifact,
    currentVersionIndex,
    handleVersionChange,
    isCurrentVersion,
    metadata,
    mode,
    setMetadata,
    viewMode,
    setViewMode,
    token,
    onApprove,
    onReject,
    isUpdatingStatus,
    isContentDirty,
    currentDocument,
    selectedProjectId,
    setSelectedProjectId,
    selectedProject,
    isProjectLoading,
    templates,
    selectedTemplateId,
    setSelectedTemplateId,
    projects,
    isProjectsLoading,
    onAddToProject,
    setChatMetadata,
    setArtifact,
    getDocumentContentById,
    saveContent,
    sendMessage,
    isDocumentsFetching,
    onUpdateProject,
    handleProjectUpdate,
    handleAdminTableClick,
    handleGenerateSchema,
    onClose,
    isToolbarVisible,
    setIsToolbarVisible,
    setMessages,
    status,
    stop,
    documents,
    SelectedTemplate,
    ArtifactContentComponent,
    userId,
  }: ArtifactPanelProps) => {
    return (
      <>
        <div className="flex flex-col border-b border-zinc-200 dark:border-zinc-700">
          <ArtifactActions
            artifact={artifact}
            currentVersionIndex={currentVersionIndex}
            handleVersionChange={handleVersionChange}
            isCurrentVersion={isCurrentVersion}
            metadata={metadata}
            mode={mode}
            setMetadata={setMetadata}
            viewMode={viewMode}
            setViewMode={setViewMode}
            token={token}
            onApprove={onApprove}
            onReject={onReject}
            isUpdatingStatus={isUpdatingStatus}
            title={artifact.title}
            isContentDirty={isContentDirty}
            updatedAtString={
              currentDocument
                ? `${formatDistanceToNowStrict(new Date(currentDocument.createdAt), {
                    addSuffix: true,
                    locale: zhCN,
                  })}已更新`
                : undefined
            }
            selectedProjectId={selectedProjectId}
            setSelectedProjectId={setSelectedProjectId}
            selectedProject={selectedProject}
            onClose={onClose}
          />

          {/* {viewMode === "preview" && templates.length > 0 && artifact.kind !== 'project' && artifact.kind !== 'admin' && artifact.documentId !== 'project-list' && (
          <div className="flex gap-2 p-2 overflow-x-auto bg-muted/20 border-b border-zinc-200 dark:border-zinc-700">
            {templates.map(t => (
              <TemplateThumbnail
                key={t.id}
                Component={t.component}
                content={artifact.content}
                selected={selectedTemplateId === t.id || (selectedTemplateId === null && t.id === 'default')}
                label={t.label}
                onClick={() => setSelectedTemplateId(t.id)}
              />
            ))}
          </div>
        )} */}
        </div>

        <div className="h-full max-w-full! items-center overflow-y-scroll bg-background dark:bg-muted">
          {(artifact.documentId === "project-list" ||
            (typeof artifact.documentId === "string" &&
              artifact.documentId.startsWith("project-"))) &&
          artifact.status !== "streaming" ? (
            selectedProjectId ? (
              isProjectLoading ? (
                <div key="project-loading" className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : selectedProject ? (
                <ProjectDetailView
                  key={`project-detail-${selectedProjectId}`}
                  project={selectedProject}
                  onAdminTableClick={handleAdminTableClick}
                  onGenerateSchema={handleGenerateSchema}
                  onUpdate={handleProjectUpdate}
                  onBack={() => setSelectedProjectId(null)}
                  userId={userId}
                />
              ) : (
                <div
                  key="project-not-found"
                  className="flex flex-col items-center justify-center h-full gap-4"
                >
                  <p className="text-muted-foreground">未找到项目详情</p>
                  <Button
                    variant="link"
                    onClick={() => setSelectedProjectId(null)}
                    className="text-primary hover:underline h-auto p-0 font-normal"
                  >
                    返回列表
                  </Button>
                </div>
              )
            ) : (
              <ProjectListPreview
                key="project-list"
                projects={projects as any}
                isLoading={isProjectsLoading}
                onSelectProject={(projectId) => {
                  setSelectedProjectId(projectId);
                  onAddToProject?.(projectId);
                }}
                onCreateProject={() => {
                  setChatMetadata((prev: any) => ({
                    ...prev,
                    selectedAgent: "项目经理",
                    inputPrefix: "# 创建项目",
                    _ts: Date.now(),
                  }));
                  setArtifact((prev: any) => ({
                    ...prev,
                    documentId: "new-project",
                    kind: "project",
                    title: "新项目编辑",
                    isVisible: true,
                    status: "idle",
                    content: JSON.stringify(
                      {
                        title: "",
                        description: "",
                        status: "planning",
                      },
                      null,
                      2,
                    ),
                  }));
                  setViewMode("edit");
                }}
                token={token}
                userId={userId}
                apiBaseUrl={constructApiUrl("").toString().replace(/\/$/, "")}
              />
            )
          ) : viewMode === "preview" && SelectedTemplate ? (
            <SelectedTemplate
              {...({
                content: isCurrentVersion
                  ? artifact.content
                  : getDocumentContentById(currentVersionIndex),
                token: token,
                userId: userId,
                onSaveContent: saveContent,
                sendMessage: sendMessage,
              } as any)}
            />
          ) : ArtifactContentComponent ? (
            <ArtifactContentComponent
              {...({
                content: isCurrentVersion
                  ? artifact.content
                  : getDocumentContentById(currentVersionIndex),
                currentVersionIndex: currentVersionIndex,
                getDocumentContentById: getDocumentContentById,
                isCurrentVersion: isCurrentVersion,
                isInline: false,
                isLoading: isDocumentsFetching && !artifact.content,
                metadata: metadata,
                mode: mode,
                onSaveContent: saveContent,
                token: token,
                userId: userId,
                onUpdateConfig:
                  artifact.kind === "admin"
                    ? (configId: string, updates: any) => {
                        if (selectedProjectId && selectedProject) {
                          const currentConfigs = selectedProject.adminConfigs || [];
                          const updatedConfigs = currentConfigs.map((c: any) =>
                            c.id === configId ? { ...c, ...updates } : c,
                          );

                          if (onUpdateProject) {
                            onUpdateProject(selectedProjectId, { adminConfigs: updatedConfigs });
                          } else {
                            handleProjectUpdate({ adminConfigs: updatedConfigs });
                          }

                          try {
                            const currentContent = JSON.parse(artifact.content);
                            if (currentContent.configId === configId) {
                              setArtifact((prev: any) => ({
                                ...prev,
                                content: JSON.stringify({ ...currentContent, ...updates }),
                              }));
                            }
                          } catch (e) {
                            console.error("Failed to update artifact content", e);
                          }
                        } else if (selectedProjectId) {
                          try {
                            const currentContent = JSON.parse(artifact.content);
                            if (currentContent.configId === configId) {
                              setArtifact((prev: any) => ({
                                ...prev,
                                content: JSON.stringify({ ...currentContent, ...updates }),
                              }));
                            }
                          } catch (e) {
                            console.error("Failed to update artifact content", e);
                          }
                        }
                      }
                    : undefined,
                setMetadata: setMetadata,
                sendMessage: sendMessage,
                status: artifact.status,
                suggestions: [],
                title: artifact.title,
              } as any)}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              未找到 Artifact 定义 (Kind: {artifact.kind})
            </div>
          )}

          <AnimatePresence>
            {isCurrentVersion && viewMode === "edit" && (
              <Toolbar
                artifactKind={artifact.kind}
                isToolbarVisible={isToolbarVisible}
                sendMessage={sendMessage}
                setIsToolbarVisible={setIsToolbarVisible}
                setMessages={setMessages}
                status={status}
                stop={stop}
              />
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {!isCurrentVersion && (
            <VersionFooter
              currentVersionIndex={currentVersionIndex}
              documents={documents}
              handleVersionChange={handleVersionChange}
              token={token}
            />
          )}
        </AnimatePresence>
      </>
    );
  },
);

ArtifactPanel.displayName = "ArtifactPanel";
