"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { useSidebar } from "@uxin/ui";
import { useToast } from "@uxin/ui";
import { formatDistanceToNowStrict } from "date-fns";
import { zhCN } from "date-fns/locale";
import equal from "fast-deep-equal";
import { AnimatePresence, motion } from "framer-motion";
import { type Dispatch, memo, type SetStateAction, useCallback, useEffect, useState } from "react";
import { useDebounceCallback, useWindowSize } from "usehooks-ts";
import type { ArtifactDocument, Vote } from "../lib/types";
import type { Attachment, ChatMessage } from "../lib/types";
import type { VisibilityType } from "./visibility-selector";
import { artifactDefinitions } from "../artifacts/index";
import { useArtifact } from "../hooks/use-artifact";
import {
  useProjectDetail,
  useArtifactDocuments,
  useChatDocuments,
} from "../hooks/use-artifact-api";
import { toRelativeApiUrl, ensureAbsoluteApiUrl } from "../lib/api";
import { cn } from "../lib/utils";
import { ArtifactPanel } from "./artifact-panel";
import { ChatPanel } from "./chat-panel";

function PureArtifact({
  chatId,
  input,
  setInput,
  status,
  stop,
  attachments,
  setAttachments,
  sendMessage,
  messages,
  setMessages,
  regenerate,
  votes,
  isReadonly,
  selectedVisibilityType,
  selectedModelId,
  isSidebarOpen: externalIsSidebarOpen,
  token,
  title,
  isPinned,
  initialProjectId,
  onTitleUpdate,
  onDelete,
  onTogglePin,
  onAddToProject,
  onUpdateProject,
  projects,
  isProjectsLoading,
  userId,
  userAvatar,
  userName,
  onClose,
  isEmbedded = false,
}: {
  chatId: string;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  status: UseChatHelpers<ChatMessage>["status"];
  stop: UseChatHelpers<ChatMessage>["stop"];
  attachments: Attachment[];
  setAttachments: Dispatch<SetStateAction<Attachment[]>>;
  messages: ChatMessage[];
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  votes: Vote[] | undefined;
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
  isReadonly: boolean;
  selectedVisibilityType: VisibilityType;
  selectedModelId: string;
  isSidebarOpen?: boolean;
  token?: string;
  title?: string;
  isPinned?: boolean;
  initialProjectId?: string;
  projects?: Array<{ id: string; name: string }>;
  isProjectsLoading?: boolean;
  userId?: string;
  userAvatar?: string;
  userName?: string;
  onTitleUpdate?: (title: string) => Promise<void>;
  onDelete?: () => Promise<void>;
  onTogglePin?: () => Promise<void>;
  onAddToProject?: (projectId: string) => Promise<void>;
  onUpdateProject?: (projectId: string, updates: any) => Promise<void>;
  onClose?: () => void;
  isEmbedded?: boolean;
}) {
  const { artifact, setArtifact, metadata, setMetadata, setChatMetadata } = useArtifact();

  const [mode, setMode] = useState<"edit" | "diff">("edit");
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    initialProjectId || null,
  );

  const documentId =
    artifact.documentId !== "init" &&
    artifact.documentId !== "new-agent" &&
    artifact.documentId !== "project-list" &&
    !artifact.documentId?.startsWith("app-") &&
    !artifact.documentId?.startsWith("agent-") &&
    artifact.status !== "streaming"
      ? artifact.documentId
      : null;

  const {
    documents,
    isLoading: isDocumentsFetching,
    updateDocument: apiUpdateDocument,
  } = useArtifactDocuments(token, documentId);

  const { updateDocumentStatus: apiUpdateDocumentStatus, isUpdatingStatus } = useChatDocuments(
    token,
    chatId,
  );

  const { toast } = useToast();
  const selectedProjectIdToUse =
    selectedProjectId ||
    (artifact.documentId?.startsWith("project-") && artifact.documentId !== "project-list"
      ? artifact.documentId.replace("project-", "")
      : null);

  const {
    project: selectedProject,
    isLoading: isProjectLoading,
    updateProject: apiUpdateProject,
    createProject: apiCreateProject,
  } = useProjectDetail(token, selectedProjectIdToUse);

  useEffect(() => {
    if (artifact.isVisible) {
      if (artifact.initialViewMode) {
        setViewMode(artifact.initialViewMode);
        return;
      }

      const artifactDefinition = artifactDefinitions.find(
        (definition) => definition.kind === artifact.kind,
      );
      if (
        artifactDefinition?.template ||
        (artifactDefinition?.templates && artifactDefinition.templates.length > 0)
      ) {
        setViewMode("preview");
      } else {
        setViewMode("edit");
      }
    }
  }, [artifact.isVisible, artifact.kind]);

  const [currentDocument, setCurrentDocument] = useState<ArtifactDocument | null>(null);
  const [currentVersionIndex, setCurrentVersionIndex] = useState(-1);

  useEffect(() => {
    if (documents && documents.length > 0) {
      const mostRecentDocument = documents[documents.length - 1];

      if (mostRecentDocument) {
        // Only update if content is missing or it's a new document/version
        // This handles cases where content was cleared by document tool but documents are cached
        const shouldUpdate =
          artifact.documentId !== mostRecentDocument.id ||
          artifact.content === "" ||
          (artifact.content !== mostRecentDocument.content && artifact.content !== ""); // Avoid overwriting unsaved changes if IDs match?
        // Actually, if IDs match and content is different, it might be unsaved changes.
        // But here we want to fix the "loading" state where content is empty.

        // Simplified check: if content is empty and we have a document, fill it.
        // Also update if the document ID has changed (though useArtifactDocuments should handle that)

        if (artifact.content === "" || artifact.documentId !== mostRecentDocument.id) {
          setCurrentDocument(mostRecentDocument);
          setCurrentVersionIndex(documents.length - 1);
          setArtifact((currentArtifact) => ({
            ...currentArtifact,
            content: mostRecentDocument.content ?? "",
            approvalStatus: mostRecentDocument.status,
            kind: mostRecentDocument.kind || currentArtifact.kind,
            documentId: mostRecentDocument.id, // Ensure ID is synced
          }));

          if (mostRecentDocument.metadata) {
            setMetadata(mostRecentDocument.metadata);
          }
        } else if (documents.length - 1 !== currentVersionIndex) {
          // Update version index if documents list grew
          setCurrentVersionIndex(documents.length - 1);
          setCurrentDocument(mostRecentDocument);
        }
      }
    }
  }, [documents, setArtifact, artifact.content, artifact.documentId]);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [isContentDirty, setIsContentDirty] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(33); // 初始左侧面板百分比，即最低宽度
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newWidth = (e.clientX / window.innerWidth) * 100;
      // 限制最小宽度为 33%，最大宽度为 80%
      if (newWidth >= 33 && newWidth < 80) {
        setLeftPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isMounted]);

  const handleApproveDocument = useCallback(async () => {
    if (!artifact.documentId || artifact.documentId === "init") return;

    try {
      await apiUpdateDocumentStatus({ id: artifact.documentId, status: "APPROVED" });

      // Update local state
      setArtifact((prev) => ({ ...prev, approvalStatus: "APPROVED" }));

      // Auto-create data based on artifact kind
      if (artifact.kind === "project") {
        try {
          const content = JSON.parse(artifact.content);
          if (selectedProjectIdToUse) {
            await apiUpdateProject(content);
            toast({
              title: "审核通过",
              description: "项目已更新",
            });
          } else {
            // No project ID, create a new project
            await apiCreateProject({ content: artifact.content });
            toast({
              title: "审核通过",
              description: "新项目已创建",
            });
          }
        } catch (e) {
          console.error("Failed to auto-create project data", e);
          toast({
            title: "审核通过",
            description: "文档已通过，但业务数据同步失败",
          });
        }
      } else {
        toast({
          title: "审核通过",
          description: "文档已通过审核",
        });
      }
    } catch (error) {
      toast({
        title: "操作失败",
        description: "审核操作执行失败",
      });
    }
  }, [
    artifact.documentId,
    artifact.kind,
    artifact.content,
    apiUpdateDocumentStatus,
    apiUpdateProject,
    setArtifact,
    toast,
  ]);

  const handleRejectDocument = useCallback(async () => {
    if (!artifact.documentId || artifact.documentId === "init") return;

    try {
      await apiUpdateDocumentStatus({ id: artifact.documentId, status: "REJECTED" });

      // Update local state
      setArtifact((prev) => ({ ...prev, approvalStatus: "REJECTED" }));
      toast({
        title: "审核驳回",
        description: "文档已被驳回",
      });
    } catch (error) {
      toast({
        title: "操作失败",
        description: "驳回操作执行失败",
      });
    }
  }, [artifact.documentId, apiUpdateDocumentStatus, setArtifact, toast]);

  const handleProjectUpdate = useCallback(
    async (updates: Record<string, any>) => {
      if (!selectedProjectIdToUse) return;

      try {
        await apiUpdateProject(updates);
      } catch (error) {
        console.error("Failed to update project", error);
      }
    },
    [selectedProjectIdToUse, apiUpdateProject],
  );

  // Sync project/admin artifact content back to project database when streaming finishes
  useEffect(() => {
    const artifactDefinition = artifactDefinitions.find(
      (definition) => definition.kind === artifact.kind,
    );

    if (artifactDefinition?.onStatusChange) {
      artifactDefinition.onStatusChange({
        status: artifact.status,
        artifact,
        setMetadata,
        setArtifact,
        sendMessage,
      });
    }

    if (artifact.status === "idle" && artifact.content && selectedProjectIdToUse) {
      if (artifact.kind === "project") {
        try {
          const parsedContent = JSON.parse(artifact.content);
          // Only update if it looks like a valid project JSON
          if (parsedContent.adminConfigs || parsedContent.adminConfig) {
            handleProjectUpdate(parsedContent);
          }
        } catch (e) {
          // Not JSON or invalid
        }
      } else if (artifact.kind === "admin") {
        try {
          const parsedContent = JSON.parse(artifact.content);
          const { configId, ...updates } = parsedContent;

          if (configId) {
            const currentConfigs = selectedProject?.adminConfigs || [];
            const targetConfig = currentConfigs.find((c: any) => c.id === configId);

            if (targetConfig) {
              // Check if there are actual changes to avoid redundant updates
              const hasChanges = Object.keys(updates).some(
                (key) =>
                  // Skip transient fields like 'token' if needed, but for now check everything
                  JSON.stringify(updates[key]) !== JSON.stringify(targetConfig[key]),
              );

              if (hasChanges) {
                const updatedConfigs = currentConfigs.map((c: any) =>
                  c.id === configId ? { ...c, ...updates } : c,
                );

                if (onUpdateProject) {
                  onUpdateProject(selectedProjectIdToUse, { adminConfigs: updatedConfigs });
                } else {
                  handleProjectUpdate({ adminConfigs: updatedConfigs });
                }
              }
            }
          }
        } catch (e) {
          // Not JSON or invalid
        }
      }
    }
  }, [
    artifact.status,
    artifact.kind,
    artifact.content,
    selectedProjectIdToUse,
    selectedProject?.adminConfigs,
    onUpdateProject,
    handleProjectUpdate,
  ]);

  const handleContentChange = useCallback(
    (updatedContent: string) => {
      if (!artifact.documentId || artifact.documentId === "init") return;

      if (artifact.kind === "project" && artifact.documentId.startsWith("project-")) {
        // For project artifacts, content change means project update (description/metadata)
        try {
          const contentData = JSON.parse(updatedContent);
          handleProjectUpdate(contentData);
        } catch (e) {
          // If not JSON, it might just be the description
          handleProjectUpdate({ description: updatedContent });
        }
      } else {
        // Standard document update
        apiUpdateDocument({
          title: artifact.title,
          content: updatedContent,
          kind: artifact.kind,
        });
      }
      setIsContentDirty(false);
    },
    [artifact, handleProjectUpdate, apiUpdateDocument],
  );

  const debouncedHandleContentChange = useDebounceCallback(handleContentChange, 2000);

  // Auto-save project artifact content when it changes via streaming or other means
  useEffect(() => {
    if (artifact.kind === "project" && artifact.documentId.startsWith("project-")) {
      if (artifact.status === "streaming") {
        setIsContentDirty(true);
      } else if (artifact.status === "idle" && isContentDirty) {
        handleContentChange(artifact.content);
        setIsContentDirty(false);
      }
    }
  }, [
    artifact.status,
    artifact.content,
    artifact.kind,
    artifact.documentId,
    isContentDirty,
    handleContentChange,
  ]);

  const [saveTimer, setSaveTimer] = useState<any>(null);
  useEffect(() => {
    if (
      artifact.kind === "project" &&
      artifact.documentId.startsWith("project-") &&
      isContentDirty &&
      artifact.status === "streaming"
    ) {
      if (saveTimer) clearTimeout(saveTimer);
      const t = setTimeout(() => {
        handleContentChange(artifact.content);
        setIsContentDirty(false);
      }, 3000);
      setSaveTimer(t);
      return () => {
        if (t) clearTimeout(t);
      };
    }
  }, [
    artifact.kind,
    artifact.documentId,
    isContentDirty,
    artifact.status,
    artifact.content,
    handleContentChange,
  ]);

  const saveContent = useCallback(
    (updatedContent: string, debounce: boolean) => {
      const currentContent = currentDocument?.content ?? artifact.content;
      if (updatedContent !== currentContent) {
        setIsContentDirty(true);

        if (debounce) {
          debouncedHandleContentChange(updatedContent);
        } else {
          handleContentChange(updatedContent);
        }
      }
    },
    [currentDocument, artifact.content, debouncedHandleContentChange, handleContentChange],
  );

  function getDocumentContentById(index: number) {
    if (!documents) {
      return "";
    }
    if (!documents[index]) {
      return "";
    }
    return documents[index].content ?? "";
  }

  const handleVersionChange = (type: "next" | "prev" | "toggle" | "latest") => {
    if (!documents) {
      return;
    }

    if (type === "latest") {
      setCurrentVersionIndex(documents.length - 1);
      setMode("edit");
    }

    if (type === "toggle") {
      setMode((currentMode) => (currentMode === "edit" ? "diff" : "edit"));
    }

    if (type === "prev") {
      if (currentVersionIndex > 0) {
        setCurrentVersionIndex((index) => index - 1);
      }
    } else if (type === "next" && currentVersionIndex < documents.length - 1) {
      setCurrentVersionIndex((index) => index + 1);
    }
  };

  const [isToolbarVisible, setIsToolbarVisible] = useState(false);

  /*
   * NOTE: if there are no documents, or if
   * the documents are being fetched, then
   * we mark it as the current version.
   */

  const isCurrentVersion =
    documents && documents.length > 0 ? currentVersionIndex === documents.length - 1 : true;

  const { width: windowWidth, height: windowHeight } = useWindowSize();

  const isMobile = isMounted && windowWidth ? windowWidth < 768 : false;

  const { state: sidebarState } = useSidebar();
  const isSidebarOpen =
    externalIsSidebarOpen !== undefined ? externalIsSidebarOpen : sidebarState === "expanded";
  const sidebarWidth = isMobile ? 0 : isSidebarOpen ? 256 : 48;

  // Mobile full screen overlay check
  const isMobileFullScreen = isMobile && !isEmbedded;

  const artifactDefinition = artifactDefinitions.find(
    (definition) => definition.kind === artifact.kind,
  );

  const templates = artifactDefinition?.templates || [];
  const defaultTemplate = artifactDefinition?.template;

  // Determine which template component to use
  let SelectedTemplate = defaultTemplate;
  if (selectedTemplateId) {
    const t = templates.find((t) => t.id === selectedTemplateId);
    if (t) SelectedTemplate = t.component;
  } else if (templates.length > 0 && !defaultTemplate) {
    // If no default template but templates array exists, pick the first one
    SelectedTemplate = templates[0].component;
  }

  useEffect(() => {
    if (
      artifact.documentId !== "init" &&
      artifact.documentId !== "project-list" &&
      artifactDefinition?.initialize
    ) {
      artifactDefinition.initialize({
        documentId: artifact.documentId,
        setMetadata,
      });
    }
  }, [artifact.documentId, artifactDefinition, setMetadata]);

  // 当 AI 生成 Schema 完成时，自动保存到项目中
  useEffect(() => {
    if (
      artifact.kind === "admin" &&
      artifact.status === "idle" &&
      selectedProjectId &&
      selectedProject
    ) {
      try {
        const content = JSON.parse(artifact.content);
        // 检查 content 内部的 status 是否为 ready，这是在 adminArtifact.onStreamPart 中设置的
        if (content.status === "ready" && content.schema && content.configId) {
          const currentConfigs = selectedProject.adminConfigs || [];
          const configIndex = currentConfigs.findIndex((c: any) => c.id === content.configId);

          if (configIndex !== -1) {
            const config = currentConfigs[configIndex];
            // 只有当项目的 schema 还不存在或者不匹配时才更新，且确保 status 从 pending 转为 idle
            const schemaChanged =
              !config.schema || JSON.stringify(config.schema) !== JSON.stringify(content.schema);
            const statusChanged = config.status === "pending";

            if (schemaChanged || statusChanged) {
              console.log("[Artifact] Auto-saving generated schema to project:", content.configId);
              const updatedConfigs = [...currentConfigs];
              updatedConfigs[configIndex] = {
                ...config,
                schema: content.schema,
                status: "idle" as const,
              };

              if (onUpdateProject) {
                onUpdateProject(selectedProjectId, { adminConfigs: updatedConfigs });
              } else {
                handleProjectUpdate({ adminConfigs: updatedConfigs });
              }
            }
          }
        }
      } catch (e) {
        console.error("Failed to auto-save generated schema", e);
      }
    }
  }, [
    artifact.status,
    artifact.content,
    artifact.kind,
    selectedProjectId,
    selectedProject,
    onUpdateProject,
    handleProjectUpdate,
  ]);

  const handleAdminTableClick = useCallback(
    (config: any) => {
      setArtifact((current: any) => ({
        ...current,
        documentId: `admin-${config.id}`,
        title: config.name,
        kind: "admin",
        isVisible: true,
        status: "idle",
        content: JSON.stringify(
          {
            ...config,
            status: "ready" as const,
          },
          null,
          2,
        ),
        boundingBox: { top: 0, left: 0, width: 0, height: 0 },
      }));
    },
    [setArtifact],
  );

  const handleGenerateSchema = useCallback(
    async (configId: string) => {
      if (!selectedProject || !selectedProjectId) return;

      const configs = selectedProject.adminConfigs || (selectedProject as any).adminConfig || [];
      const config = configs.find((c: any) => c.id === configId);
      if (!config || !config.url) return;

      try {
        const pendingConfigs = configs.map((c: any) =>
          c.id === configId ? { ...c, status: "pending" as const } : c,
        );
        await handleProjectUpdate({ adminConfigs: pendingConfigs });

        let fetchUrl = toRelativeApiUrl(config.url);
        fetchUrl = ensureAbsoluteApiUrl(fetchUrl);

        // Use config-specific token if available, project-level adminToken, or fallback to global token
        const requestToken = config.token || selectedProject.adminToken || token;

        const response = await fetch(fetchUrl, {
          headers: requestToken
            ? {
                Authorization: `Bearer ${requestToken}`,
              }
            : {},
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            `Failed to fetch sample data from ${fetchUrl}: ${response.status} ${response.statusText}`,
            errorText,
          );
          throw new Error(
            `Failed to fetch sample data: ${response.status} ${response.statusText} - ${errorText.substring(0, 100)}`,
          );
        }
        const sampleData = await response.json();

        // 智能提取数组数据的辅助函数 - 增强版 (Generic Extraction)
        const extractArray = (obj: any): any[] | null => {
          if (!obj) return null;
          if (Array.isArray(obj)) return obj;
          if (typeof obj !== "object") return null;

          // 1. 优先检查常见的包装键 (Standard Envelopes)
          const envelopeKeys = [
            "data",
            "items",
            "list",
            "results",
            "records",
            "rows",
            "content",
            "payload",
            "response",
            "body",
            "result",
            "page",
            "users",
            "projects",
            "tasks",
            "templates",
            "products",
            "orders",
          ];

          for (const key of envelopeKeys) {
            if (obj[key]) {
              if (Array.isArray(obj[key])) return obj[key];
              if (typeof obj[key] === "object") {
                const nested = extractArray(obj[key]);
                if (nested) return nested;
              }
            }
          }

          // 2. 如果包装键中没有找到，检查当前对象的所有属性
          const keys = Object.keys(obj);
          const arrayKey =
            keys.find((key) => Array.isArray(obj[key]) && obj[key].length > 0) ||
            keys.find((key) => Array.isArray(obj[key]));

          if (arrayKey) return obj[arrayKey];

          return null;
        };

        const actualData = extractArray(sampleData);

        // 处理空数据的情况：如果数据为空，提供一个明确的指示给 AI
        const isEmpty = !actualData || (Array.isArray(actualData) && actualData.length === 0);
        const dataToAnalyze = isEmpty
          ? Array.isArray(actualData)
            ? actualData
            : [sampleData]
          : actualData;

        if (sendMessage) {
          (sendMessage as any)({
            role: "user",
            content: `请为项目 ID "${selectedProjectId}" 中的后台配置 "${config.name}" (ID: "${configId}") 生成管理后台架构 (Schema)。
${isEmpty ? `\n注意：当前接口返回的数据样本为空。请根据功能名称 "${config.name}" 和 URL "${config.url}" 推断其可能包含的字段（例如如果是项目管理，通常包含名称、状态、创建时间等）。\n` : ""}
接口返回的数据样本如下：
\`\`\`json
${JSON.stringify(dataToAnalyze && dataToAnalyze.slice ? dataToAnalyze.slice(0, 3) : dataToAnalyze, null, 2)}
\`\`\`

请执行以下操作：
1. 调用 \`createDocument\` 工具，设置 \`kind: "admin"\`。
2. 在 \`initialData\` 中包含：
   - \`projectId\`: "${selectedProjectId}"
   - \`configId\`: "${configId}"
   - \`dataSample\`: (上述数据样本)
3. 生成的 Schema 应包含字段名(name)、标签(label)、类型(type)、是否在列表显示(showInList)等。
   - 类型支持: string, number, boolean, date, image, status, email, phone, select, textarea。
   - 字段名(name) 必须与接口返回数据中的键名严格一致（如果是空数据，请使用标准的驼峰命名）。
   - 标签(label) 请使用友好的中文。

请立即开始生成。`,
          });
        }
      } catch (error) {
        console.error("Failed to generate schema", error);
        toast({
          title: "生成 Schema 失败",
          description: `无法从 ${config.url} 获取样本数据 (${error instanceof Error ? error.message : "未知错误"})，请检查接口是否可用及权限设置。`,
        });

        // Reset status back to idle if failed
        const configs = selectedProject.adminConfigs || [];
        const resetConfigs = configs.map((c: any) =>
          c.id === configId ? { ...c, status: "idle" as const } : c,
        );
        handleProjectUpdate({ adminConfigs: resetConfigs });
      }
    },
    [selectedProject, sendMessage, handleProjectUpdate, toast, token, selectedProjectId],
  );

  const ArtifactContentComponent = artifactDefinition?.content;

  return (
    <AnimatePresence>
      {artifact.isVisible && (
        <motion.div
          animate={isMobileFullScreen ? { y: 0, opacity: 1 } : { opacity: 1 }}
          className={cn(
            "z-50 flex flex-row bg-background pointer-events-none",
            isEmbedded ? "relative w-full h-full" : "fixed top-0 left-0 h-dvh w-dvw",
          )}
          data-testid="artifact"
          exit={
            isMobileFullScreen
              ? { y: "100%", opacity: 0 }
              : { opacity: 0, transition: { delay: 0.4 } }
          }
          initial={isMobileFullScreen ? { y: "100%", opacity: 0 } : { opacity: 1 }}
          transition={
            isMobileFullScreen ? { type: "spring", damping: 25, stiffness: 200 } : undefined
          }
        >
          {!isMobileFullScreen && !isEmbedded && (
            <motion.div
              animate={{
                width: windowWidth - sidebarWidth,
                right: 0,
              }}
              className="fixed h-dvh bg-background"
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              exit={{
                width: windowWidth - sidebarWidth,
                right: 0,
              }}
              initial={{
                width: windowWidth - sidebarWidth,
                right: 0,
              }}
            />
          )}

          <div
            className="relative flex h-full w-full flex-row overflow-hidden pointer-events-auto"
            style={{ marginLeft: isMobileFullScreen || isEmbedded ? 0 : sidebarWidth }}
          >
            {/* 左侧对话组件 - 在嵌入模式或移动端全屏下不显示 */}
            {!isMobileFullScreen && !isEmbedded && (
              <motion.div
                className="relative flex h-full flex-col bg-muted dark:bg-background dark:border-zinc-700"
                style={{ width: `${leftPanelWidth}%` }}
              >
                <ChatPanel
                  chatId={chatId}
                  isReadonly={isReadonly}
                  messages={messages}
                  setMessages={setMessages}
                  status={status}
                  stop={stop}
                  sendMessage={sendMessage}
                  regenerate={regenerate}
                  votes={votes}
                  input={input}
                  setInput={setInput}
                  attachments={attachments}
                  setAttachments={setAttachments}
                  title={title}
                  isPinned={isPinned}
                  initialProjectId={initialProjectId}
                  projects={projects}
                  isProjectsLoading={isProjectsLoading}
                  onTitleUpdate={onTitleUpdate}
                  onDelete={onDelete}
                  onTogglePin={onTogglePin}
                  onAddToProject={onAddToProject}
                  onProjectClick={(projectId) => {
                    setArtifact({
                      documentId: `project-${projectId}`,
                      title: "项目详情",
                      kind: "project",
                      content: "",
                      isVisible: true,
                      status: "idle",
                      boundingBox: { top: 0, left: 0, width: 0, height: 0 },
                    });
                  }}
                  selectedModelId={selectedModelId}
                  selectedVisibilityType={selectedVisibilityType}
                  token={token}
                  userId={userId}
                  userAvatar={userAvatar}
                  userName={userName}
                  artifactStatus={artifact.status as any}
                />
              </motion.div>
            )}

            {/* 分隔条 - 在嵌入模式下不显示 */}
            {!isMobile && !isEmbedded && (
              <div
                className={`group relative z-50 w-px cursor-col-resize bg-zinc-200 transition-colors hover:bg-primary dark:bg-zinc-800 ${
                  isDragging ? "bg-primary" : ""
                }`}
                onMouseDown={handleMouseDown}
              >
                <div className="absolute left-1/2 top-1/2 h-8 w-px -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-400 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            )}

            {/* 右侧内容组件 */}
            <motion.div className="relative flex h-full flex-1 flex-col bg-background dark:bg-muted">
              <ArtifactPanel
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
                onApprove={handleApproveDocument}
                onReject={handleRejectDocument}
                isUpdatingStatus={isUpdatingStatus}
                isContentDirty={isContentDirty}
                currentDocument={currentDocument}
                selectedProjectId={selectedProjectId}
                setSelectedProjectId={setSelectedProjectId}
                selectedProject={selectedProject}
                isProjectLoading={isProjectLoading}
                templates={templates}
                selectedTemplateId={selectedTemplateId}
                setSelectedTemplateId={setSelectedTemplateId}
                projects={projects}
                isProjectsLoading={isProjectsLoading}
                onAddToProject={onAddToProject}
                setChatMetadata={setChatMetadata}
                setArtifact={setArtifact}
                getDocumentContentById={getDocumentContentById}
                saveContent={saveContent}
                sendMessage={sendMessage}
                isDocumentsFetching={isDocumentsFetching}
                onUpdateProject={onUpdateProject}
                handleProjectUpdate={handleProjectUpdate}
                handleAdminTableClick={handleAdminTableClick}
                handleGenerateSchema={handleGenerateSchema}
                onClose={onClose}
                isToolbarVisible={isToolbarVisible}
                setIsToolbarVisible={setIsToolbarVisible}
                setMessages={setMessages}
                status={status}
                stop={stop}
                documents={documents}
                SelectedTemplate={SelectedTemplate}
                ArtifactContentComponent={ArtifactContentComponent}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const ArtifactUI = memo(PureArtifact, (prevProps, nextProps) => {
  if (prevProps.chatId !== nextProps.chatId) return false;
  if (prevProps.input !== nextProps.input) return false;
  if (prevProps.status !== nextProps.status) return false;
  if (!equal(prevProps.messages, nextProps.messages)) return false;
  if (!equal(prevProps.attachments, nextProps.attachments)) return false;
  if (!equal(prevProps.votes, nextProps.votes)) return false;
  if (prevProps.isReadonly !== nextProps.isReadonly) return false;
  if (prevProps.selectedModelId !== nextProps.selectedModelId) return false;
  if (prevProps.isSidebarOpen !== nextProps.isSidebarOpen) return false;
  if (prevProps.token !== nextProps.token) return false;
  if (prevProps.title !== nextProps.title) return false;
  if (prevProps.isPinned !== nextProps.isPinned) return false;
  if (prevProps.initialProjectId !== nextProps.initialProjectId) return false;
  if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType) return false;
  if (!equal(prevProps.projects, nextProps.projects)) return false;
  if (prevProps.isProjectsLoading !== nextProps.isProjectsLoading) return false;
  if (prevProps.isEmbedded !== nextProps.isEmbedded) return false;
  if (prevProps.onClose !== nextProps.onClose) return false;

  return true;
});
