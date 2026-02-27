"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@uxin/ui";
import equal from "fast-deep-equal";
import { MoreHorizontal, MessageSquarePlus, FileDiff } from "lucide-react";
import { type MouseEvent, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChatMessage } from "../lib/types";
import type { ArtifactDocument, ArtifactKind, UIArtifact } from "../lib/types";
import { ProjectRequirementEditor } from "../artifacts/project-requirement/client";
import { useArtifact } from "../hooks/use-artifact";
import { useDocument } from "../hooks/use-document";
import { cn } from "../lib/utils";
import { CodeEditor } from "./code-editor";
import { DiffView } from "./diffview";
import { DocumentToolCall, DocumentToolResult } from "./document";
import { DocumentEditor } from "./document-editor";
import { InlineDocumentSkeleton } from "./document-skeleton";
import { FileIcon, FullscreenIcon, ImageIcon, LoaderIcon } from "./icons";
import { ImageEditor } from "./image-editor";
import { MatchingEditor } from "./matching-editor";
import { PositionEditor } from "./position-editor";
import { ProjectEditor } from "./project-editor";
import { QuoteEditor } from "./quote-editor";
import { RequirementEditor } from "./requirement-editor";
import { ResumeEditor } from "./resume-editor";
import { ServiceEditor } from "./service-editor";
import { SpreadsheetEditor } from "./sheet-editor";
import { Editor } from "./text-editor";

type DocumentPreviewProps = {
  isReadonly: boolean;
  result?: any;
  args?: any;
  type?: "create" | "update" | "request-suggestions";
  sendMessage?: UseChatHelpers<ChatMessage>["append"];
};

export function DocumentPreview({
  isReadonly,
  result,
  args,
  token,
  type = "create",
  sendMessage,
}: DocumentPreviewProps & { token?: string }) {
  const { artifact, setArtifact, setMetadata } = useArtifact();
  const [viewMode, setViewMode] = useState<"preview" | "diff">("preview");

  const { data: documents, isLoading: isDocumentsFetching } = useDocument(result?.id, token);

  const previewDocument = useMemo(() => documents?.[0], [documents]);
  const previousDocument = useMemo(() => documents?.[1], [documents]);

  const hitboxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const boundingBox = hitboxRef.current?.getBoundingClientRect();

    if (artifact.documentId && boundingBox) {
      setArtifact((currentArtifact) => ({
        ...currentArtifact,
        boundingBox: {
          left: boundingBox.x,
          top: boundingBox.y,
          width: boundingBox.width,
          height: boundingBox.height,
        },
      }));
    }
  }, [artifact.documentId, setArtifact]);

  if (artifact.isVisible) {
    if (result) {
      return (
        <DocumentToolResult
          isReadonly={isReadonly}
          result={{ id: result.id, title: result.title, kind: result.kind }}
          type={type}
        />
      );
    }

    if (args) {
      return (
        <DocumentToolCall
          args={{ title: args.title, kind: args.kind }}
          isReadonly={isReadonly}
          type={type}
        />
      );
    }
  }

  if (isDocumentsFetching) {
    return <LoadingSkeleton artifactKind={result?.kind ?? args?.kind} />;
  }

  const document: ArtifactDocument | null = previewDocument
    ? previewDocument
    : artifact.status === "streaming"
      ? {
          title: artifact.title,
          kind: artifact.kind,
          content: artifact.content,
          id: artifact.documentId,
          createdAt: new Date(),
          userId: "noop",
        }
      : null;

  if (!document) {
    return <LoadingSkeleton artifactKind={artifact.kind} />;
  }

  return (
    <div className="relative w-full cursor-pointer group/preview">
      <HitboxLayer
        hitboxRef={hitboxRef}
        result={result}
        args={args}
        setArtifact={setArtifact}
        setMetadata={setMetadata}
        sendMessage={sendMessage}
        onToggleDiff={() => setViewMode((m) => (m === "preview" ? "diff" : "preview"))}
        viewMode={viewMode}
        hasHistory={!!previousDocument}
        documentTitle={document.title}
        documentKind={document.kind}
      />
      <DocumentHeader
        isStreaming={artifact.status === "streaming"}
        kind={document.kind}
        title={document.title}
      />
      {viewMode === "diff" && previousDocument && previewDocument ? (
        <div className="h-[257px] overflow-y-scroll rounded-b-2xl border border-t-0 bg-muted p-4 dark:border-zinc-700">
          <DiffView
            oldContent={previousDocument.content || ""}
            newContent={previewDocument.content || ""}
          />
        </div>
      ) : (
        <DocumentContent document={document} />
      )}
    </div>
  );
}

const LoadingSkeleton = ({ artifactKind }: { artifactKind: ArtifactKind }) => (
  <div className="w-full">
    <div className="flex h-[57px] flex-row items-center justify-between gap-2 rounded-t-2xl border border-b-0 p-4 dark:border-zinc-700 dark:bg-muted">
      <div className="flex flex-row items-center gap-3">
        <div className="text-muted-foreground">
          <div className="size-4 animate-pulse rounded-md bg-muted-foreground/20" />
        </div>
        <div className="h-4 w-24 animate-pulse rounded-lg bg-muted-foreground/20" />
      </div>
      <div>
        <FullscreenIcon />
      </div>
    </div>
    {artifactKind === "image" ? (
      <div className="overflow-y-scroll rounded-b-2xl border border-t-0 bg-muted dark:border-zinc-700">
        <div className="h-[257px] w-full animate-pulse bg-muted-foreground/20" />
      </div>
    ) : (
      <div className="overflow-y-scroll rounded-b-2xl border border-t-0 bg-muted p-8 pt-4 dark:border-zinc-700">
        <InlineDocumentSkeleton />
      </div>
    )}
  </div>
);

const PureHitboxLayer = ({
  hitboxRef,
  result,
  args,
  setArtifact,
  setMetadata,
  sendMessage,
  onToggleDiff,
  viewMode,
  hasHistory,
  documentTitle,
  documentKind,
}: {
  hitboxRef: React.RefObject<HTMLDivElement | null>;
  result: any;
  args: any;
  setArtifact: (updaterFn: UIArtifact | ((currentArtifact: UIArtifact) => UIArtifact)) => void;
  setMetadata: (metadata: any) => void;
  sendMessage?: UseChatHelpers<ChatMessage>["sendMessage"];
  onToggleDiff?: () => void;
  viewMode?: "preview" | "diff";
  hasHistory?: boolean;
  documentTitle?: string;
  documentKind?: ArtifactKind;
}) => {
  const { artifact } = useArtifact();
  const handleClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      const boundingBox = event.currentTarget.getBoundingClientRect();

      const title = result?.title ?? args?.title;
      const id = result?.id ?? artifact.documentId;
      const kind = result?.kind ?? args?.kind;

      setArtifact((artifact) => {
        const baseUpdate = {
          ...artifact,
          title: title,
          documentId: id,
          kind: kind,
          isVisible: true,
          boundingBox: {
            left: boundingBox.x,
            top: boundingBox.y,
            width: boundingBox.width,
            height: boundingBox.height,
          },
        };

        if (artifact.status === "streaming") {
          return { ...baseUpdate, status: "streaming" };
        }

        return { ...baseUpdate, status: "idle", content: "" };
      });

      // Special handling for iteration artifacts to set view mode in metadata
      if (kind === "iteration") {
        setMetadata((metadata: any) => ({
          ...metadata,
          viewMode: "workItems",
        }));
      }
    },
    [setArtifact, setMetadata, result, args],
  );

  const handleAddToChat = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      if (sendMessage && documentTitle) {
        sendMessage({
          role: "user",
          content: `请帮我修改 "${documentTitle}"`,
        });
      }
    },
    [sendMessage, documentTitle],
  );

  const handleToggleDiff = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      onToggleDiff?.();
    },
    [onToggleDiff],
  );

  return (
    <div
      aria-hidden="true"
      className="absolute top-0 left-0 z-10 size-full rounded-xl"
      onClick={handleClick}
      ref={hitboxRef}
      role="presentation"
    >
      <div className="flex w-full items-center justify-end p-4">
        <div className="absolute top-[13px] right-[9px] flex items-center gap-1">
          {/* Action Menu - Visible on hover or when open */}
          <div
            className="opacity-0 group-hover/preview:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="rounded-md p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer">
                  <MoreHorizontal size={16} />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => handleAddToChat(e as any)}>
                  <MessageSquarePlus className="mr-2 size-4" />
                  <span>添加到对话</span>
                </DropdownMenuItem>
                {hasHistory && (
                  <DropdownMenuItem onClick={(e) => handleToggleDiff(e as any)}>
                    <FileDiff className="mr-2 size-4" />
                    <span>{viewMode === "diff" ? "退出对比" : "对比差异"}</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="rounded-md p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700">
            <FullscreenIcon />
          </div>
        </div>
      </div>
    </div>
  );
};

const HitboxLayer = memo(PureHitboxLayer);

const PureDocumentHeader = ({
  title,
  kind,
  isStreaming,
}: {
  title: string;
  kind: ArtifactKind;
  isStreaming: boolean;
}) => (
  <div className="flex flex-row items-start justify-between gap-2 rounded-t-2xl border border-b-0 p-4 sm:items-center dark:border-zinc-700 dark:bg-muted">
    <div className="flex flex-row items-start gap-3 sm:items-center">
      <div className="text-muted-foreground">
        {isStreaming ? (
          <div className="animate-spin">
            <LoaderIcon />
          </div>
        ) : kind === "image" ? (
          <ImageIcon />
        ) : (
          <FileIcon />
        )}
      </div>
      <div className="-translate-y-1 font-medium sm:translate-y-0">{title}</div>
    </div>
    <div className="w-8" />
  </div>
);

const DocumentHeader = memo(PureDocumentHeader, (prevProps, nextProps) => {
  if (prevProps.title !== nextProps.title) {
    return false;
  }
  if (prevProps.isStreaming !== nextProps.isStreaming) {
    return false;
  }

  return true;
});

const DocumentContent = ({ document }: { document: ArtifactDocument }) => {
  const { artifact } = useArtifact();

  const containerClassName = cn(
    "h-[257px] overflow-y-scroll rounded-b-2xl border border-t-0 dark:border-zinc-700 dark:bg-muted",
    {
      "p-4 sm:px-14 sm:py-16": document.kind === "text" || document.kind === "document",
      "p-0": document.kind === "code" || document.kind === "quote",
    },
  );

  const commonProps = {
    content: document.content ?? "",
    isCurrentVersion: true,
    currentVersionIndex: 0,
    status: artifact.status,
    saveContent: () => null,
    suggestions: [],
  };

  const handleSaveContent = () => null;

  return (
    <div className={containerClassName}>
      {document.kind === "text" || document.kind === "document" ? (
        <DocumentEditor key="document-editor" {...commonProps} onSaveContent={handleSaveContent} />
      ) : document.kind === "code" ? (
        <div key="code-preview" className="relative flex w-full flex-1">
          <div className="absolute inset-0">
            <CodeEditor {...commonProps} onSaveContent={handleSaveContent} />
          </div>
        </div>
      ) : document.kind === "sheet" ? (
        <div key="sheet-preview" className="relative flex size-full flex-1 p-4">
          <div className="absolute inset-0">
            <SpreadsheetEditor
              content={document.content ?? ""}
              currentVersionIndex={0}
              isCurrentVersion={true}
              saveContent={() => null}
              status={artifact.status}
            />
          </div>
        </div>
      ) : document.kind === "image" ? (
        <ImageEditor
          key="image-editor"
          content={document.content ?? ""}
          currentVersionIndex={0}
          isCurrentVersion={true}
          isInline={true}
          status={artifact.status}
          title={document.title}
        />
      ) : document.kind === "quote" ? (
        <QuoteEditor
          key="quote-editor"
          title={document.title}
          content={document.content ?? ""}
          currentVersionIndex={0}
          isCurrentVersion={true}
          isInline={true}
          mode="edit"
          onSaveContent={() => null}
          status={artifact.status}
          suggestions={[]}
          getDocumentContentById={() => document.content ?? ""}
          isLoading={false}
        />
      ) : document.kind === "project" ? (
        <ProjectEditor
          key="project-editor-comp"
          {...commonProps}
          onSaveContent={handleSaveContent}
        />
      ) : document.kind === "position" ? (
        <PositionEditor
          key="position-editor-comp"
          {...commonProps}
          onSaveContent={handleSaveContent}
        />
      ) : document.kind === "resume" ? (
        <ResumeEditor key="resume-editor-comp" {...commonProps} onSaveContent={handleSaveContent} />
      ) : document.kind === "service" ? (
        <ServiceEditor
          key="service-editor-comp"
          {...commonProps}
          onSaveContent={handleSaveContent}
        />
      ) : document.kind === "requirement" ? (
        <RequirementEditor
          key="requirement-editor-comp"
          {...commonProps}
          onSaveContent={handleSaveContent}
        />
      ) : document.kind === "project-requirement" ? (
        <ProjectRequirementEditor
          key="project-requirement-editor-comp"
          {...commonProps}
          onSaveContent={handleSaveContent}
        />
      ) : document.kind === "matching" ? (
        <MatchingEditor
          key="matching-editor-comp"
          {...commonProps}
          onSaveContent={handleSaveContent}
        />
      ) : null}
    </div>
  );
};
