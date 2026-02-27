"use client";

import { useChat, type UseChatHelpers } from "@ai-sdk/react";
import { useQueryClient } from "@tanstack/react-query";
import { DefaultChatTransport } from "ai";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import type {
  Attachment,
  ChatMessage,
  VisibilityType,
  Project,
  ArtifactDocument,
} from "../lib/types";
import type { AppUsage } from "../lib/usage";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../ui/src/components/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../../../ui/src/components/sheet";
import { useSidebar } from "../../../ui/src/components/sidebar";
import { useArtifact, useArtifactSelector, initialArtifactData } from "../hooks/use-artifact";
import { useChatByDocumentId } from "../hooks/use-artifact-api";
import { useAutoResume } from "../hooks/use-auto-resume";
import { useChatResources } from "../hooks/use-chat-resources";
import { useChatVisibility } from "../hooks/use-chat-visibility";
import { useDataStream } from "../hooks/use-data-stream";
import { useDocument } from "../hooks/use-document";
import { useProjects } from "../hooks/use-projects";
import { useSubscriptionUsage } from "../hooks/use-subscription-usage";
import { useVotes } from "../hooks/use-votes";
import { fetchWithErrorHandlers, generateUUID, getAuthToken, cn } from "../lib/utils";
import { ArtifactUI as Artifact } from "./artifact";
import { ChatHeader } from "./chat-header";
import { DataStreamHandler } from "./data-stream-handler";
import { DiscoveryView } from "./discovery-view";
import { Messages } from "./messages";
import { MultimodalInput } from "./multimodal-input";
import { SkillsSidebar } from "./skills-sidebar";

export interface ChatProps {
  id: string;
  initialMessages: ChatMessage[];
  initialChatModel: string;
  initialVisibilityType: VisibilityType;
  initialTitle?: string;
  initialIsPinned?: boolean;
  initialProjectId?: string;
  isReadonly: boolean;
  autoResume: boolean;
  initialLastContext?: AppUsage;
  initialInput?: string;
  initialToken?: string;
  userId?: string;
  isMultiAgent?: boolean;
  status?: UseChatHelpers<ChatMessage>["status"];
  onSendMessage?: (message: any) => void;
  // Actions
  onUpdateChatTitle?: (params: { chatId: string; title: string }) => Promise<void>;
  onDeleteChat?: (params: { id: string }) => Promise<void>;
  onToggleChatPin?: (params: { chatId: string }) => Promise<void>;
  onUpdateChatProject?: (params: { chatId: string; projectId: string }) => Promise<void>;
  onUpdateProject?: (params: { id: string; updates: Partial<Project> }) => Promise<void>;
}

export function Chat({
  id,
  initialMessages,
  initialChatModel,
  initialVisibilityType,
  initialTitle,
  initialIsPinned,
  initialProjectId,
  isReadonly,
  autoResume,
  initialLastContext,
  initialToken,
  userId,
  isMultiAgent,
  status: externalStatus,
  onSendMessage,
  onUpdateChatTitle,
  onDeleteChat,
  onToggleChatPin,
  onUpdateChatProject,
  onUpdateProject,
}: ChatProps) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { visibilityType } = useChatVisibility({
    chatId: id,
    initialVisibilityType,
  });

  const searchParams = useSearchParams();
  const query = searchParams?.get("query");
  const documentId = searchParams?.get("documentId");
  const kind = searchParams?.get("kind");
  const agentName = searchParams?.get("agentName");
  const messageIdFromUrl = searchParams?.get("messageId");
  const agentIdFromUrl = searchParams?.get("agentId");

  const queryClient = useQueryClient();

  // Handle browser back/forward navigation
  useEffect(() => {
    if (!isMounted) return;

    const handlePopState = () => {
      // When user navigates back/forward, refresh to sync with URL
      router.refresh();
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isMounted, router]);

  const { artifact, setArtifact, chatMetadata, setChatMetadata, setMetadata } = useArtifact();
  const { setDataStream } = useDataStream();

  const [input, setInput] = useState<string>("");
  const [usage, setUsage] = useState<AppUsage | undefined>(initialLastContext);
  const [showCreditCardAlert, setShowCreditCardAlert] = useState(false);
  const [currentModelId, setCurrentModelId] = useState(initialChatModel);
  const [isSkillsVisible, setIsSkillsVisible] = useState(false);

  // Use the provided token or try to get it from storage
  const token = initialToken || getAuthToken() || undefined;
  const [selectedDocumentForHook, setSelectedDocumentForHook] = useState<ArtifactDocument | null>(
    null,
  );

  const { chat: documentChat, isLoading: isChatLoading } = useChatByDocumentId(
    token,
    selectedDocumentForHook?.id || null,
  );

  const { agents: allAgents, apps: allApps } = useChatResources(token);

  const { data: projectsData, isLoading: isProjectsLoading } = useProjects(token);
  const projects = projectsData || [];

  const handleModelChange = useCallback(
    (modelId: string, showDetail = false, source: "agent" | "discovery" = "discovery") => {
      setCurrentModelId(modelId);
      if (showDetail) {
        setIsTransitioning(true);
      }
      const agent = allAgents.find((a: any) => a.id === modelId);
      if (agent) {
        toast.success(`已切换至智能体: ${agent.name}`, { id: "agent-change" });
        setChatMetadata((prev: any) => ({
          ...prev,
          selectedAgent: agent.name,
          selectedAgentId: modelId,
          discoverySource: source === "agent" || showDetail ? "agent" : prev.discoverySource,
          inputPrefix: null,
          _ts: Date.now(),
        }));

        if (showDetail) {
          setArtifact({
            documentId: `agent-${modelId}`,
            title: agent.name,
            kind: "agent",
            content: JSON.stringify(agent),
            isVisible: true,
            status: "idle",
            initialViewMode: "preview",
            boundingBox: { top: 0, left: 0, width: 0, height: 0 },
          });
        }
      }
    },
    [allAgents, setChatMetadata, setArtifact],
  );

  const handleToolClick = useCallback(
    (app: any) => {
      setIsTransitioning(true);

      // 设置元数据
      setChatMetadata((prev: any) => ({
        ...prev,
        discoverySource: "app",
        selectedApp: app,
        _ts: Date.now(),
      }));

      // 设置右侧分屏显示应用详情
      if (app.id === "high-efficiency-project-management" || app.name?.includes("项目管理")) {
        setArtifact({
          documentId: "project-list",
          title: "项目列表",
          kind: "project",
          content: JSON.stringify({ isProjectList: true, projects, title: "项目列表" }),
          isVisible: true,
          status: "idle",
          boundingBox: { top: 0, left: 0, width: 0, height: 0 },
        });
      } else {
        setArtifact({
          documentId: `app-${app.id}`,
          title: app.name,
          kind: "app",
          content: JSON.stringify(app),
          isVisible: true,
          status: "idle",
          initialViewMode: "preview",
          boundingBox: { top: 0, left: 0, width: 0, height: 0 },
        });
      }

      // 如果有默认智能体，则切换
      if (app.agents && app.agents.length > 0) {
        const defaultAgent = app.agents[0];
        handleModelChange(defaultAgent.id, false, "discovery");
      }
    },
    [setChatMetadata, setArtifact, projects, handleModelChange],
  );

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (selectedDocumentForHook && !isChatLoading) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (documentChat) {
        toast.dismiss("view-document");
        const chatId = documentChat.id;
        const messageId = (documentChat as any).messageId;
        const agentId = (documentChat as any).agentId;

        // 逻辑同 handleViewDocument
        if (chatId === id) {
          // 当前对话：直接显示
          setArtifact({
            documentId: selectedDocumentForHook.id,
            title: selectedDocumentForHook.title,
            kind: selectedDocumentForHook.kind ?? "text",
            content: selectedDocumentForHook.content || "",
            messageId,
            agentId,
            isVisible: true,
            status: "idle",
            initialViewMode:
              selectedDocumentForHook.kind === "resume" || selectedDocumentForHook.kind === "task"
                ? "preview"
                : undefined,
            boundingBox: { top: 0, left: 0, width: 0, height: 0 },
          });

          // 切换智能体
          if (agentId) {
            handleModelChange(agentId, false, "discovery");
          }
        } else {
          // 其他对话：跳转
          router.push(
            `/chat/${chatId}?documentId=${selectedDocumentForHook.id}&kind=${selectedDocumentForHook.kind ?? "text"}${messageId ? `&messageId=${messageId}` : ""}${agentId ? `&agentId=${agentId}` : ""}`,
          );
        }
      } else {
        // 未能找到关联的对话，尝试直接打开文档（无左侧上下文）
        toast.dismiss("view-document");
        setArtifact({
          documentId: selectedDocumentForHook.id,
          title: selectedDocumentForHook.title,
          kind: selectedDocumentForHook.kind ?? "text",
          content: selectedDocumentForHook.content || "",
          isVisible: true,
          status: "idle",
          initialViewMode:
            selectedDocumentForHook.kind === "resume" || selectedDocumentForHook.kind === "task"
              ? "preview"
              : undefined,
          boundingBox: { top: 0, left: 0, width: 0, height: 0 },
        });
      }
      setSelectedDocumentForHook(null);
    }
  }, [
    documentChat,
    isChatLoading,
    selectedDocumentForHook,
    id,
    router,
    setArtifact,
    handleModelChange,
    token,
  ]);

  // 文档加载超时处理
  useEffect(() => {
    if (selectedDocumentForHook) {
      timeoutRef.current = setTimeout(() => {
        if (selectedDocumentForHook) {
          toast.dismiss("view-document");
          setArtifact({
            documentId: selectedDocumentForHook.id,
            title: selectedDocumentForHook.title,
            kind: selectedDocumentForHook.kind ?? "text",
            content: selectedDocumentForHook.content || "",
            isVisible: true,
            status: "idle",
            initialViewMode:
              selectedDocumentForHook.kind === "resume" || selectedDocumentForHook.kind === "task"
                ? "preview"
                : undefined,
            boundingBox: { top: 0, left: 0, width: 0, height: 0 },
          });
          setSelectedDocumentForHook(null);
        }
      }, 5000);
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [selectedDocumentForHook, setArtifact]);

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    initialProjectId || null,
  );
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);
  const currentModelIdRef = useRef(currentModelId);

  const tokenRef = useRef(token);
  const visibilityTypeRef = useRef(visibilityType);

  const isVirtualId =
    documentId?.startsWith("app-") ||
    documentId?.startsWith("agent-") ||
    documentId === "project-list";
  const { data: documentVersions } = useDocument(
    !isVirtualId ? documentId || undefined : undefined,
    token,
  );
  const currentDocument = useMemo(() => {
    if (!documentVersions || documentVersions.length === 0) return undefined;
    return documentVersions[documentVersions.length - 1];
  }, [documentVersions]);

  // Handle URL documentId param
  useEffect(() => {
    if (currentDocument && currentDocument.id === documentId) {
      if (artifact.documentId !== currentDocument.id) {
        setArtifact({
          documentId: currentDocument.id,
          title: currentDocument.title,
          kind: currentDocument.kind,
          content: currentDocument.content || "",
          isVisible: true,
          status: "idle",
          initialViewMode:
            currentDocument.kind === "resume" || currentDocument.kind === "task"
              ? "preview"
              : undefined,
          boundingBox: { top: 0, left: 0, width: 0, height: 0 },
        });
      }
    }
  }, [currentDocument, documentId, artifact.documentId, setArtifact]);

  const appId = searchParams?.get("appId");
  const currentApp = useMemo(
    () => (appId ? allApps?.find((a: any) => a.id === appId) : null),
    [appId, allApps],
  );

  // 自动选择单个推荐的智能体
  useEffect(() => {
    if (currentApp && currentApp.agents && currentApp.agents.length === 1) {
      const agent = currentApp.agents[0];
      setChatMetadata((prev: any) => ({
        ...prev,
        selectedAgent: agent.name,
        inputPrefix: null,
        _ts: Date.now(),
      }));
      setCurrentModelId(agent.id);
    }
  }, [currentApp, setChatMetadata]);

  useEffect(() => {
    currentModelIdRef.current = currentModelId;

    // 同步智能体名称到元数据
    if (allAgents && allAgents.length > 0) {
      const agent = allAgents.find((a: any) => a.id === currentModelId);
      if (agent) {
        setChatMetadata((prev: any) => {
          if (prev.selectedAgent === agent.name && prev.inputPrefix === null) return prev;
          return {
            ...prev,
            selectedAgent: agent.name,
            inputPrefix: null, // 同步时也保持一致
            _ts: Date.now(),
          };
        });
      }
    }
  }, [currentModelId, allAgents, setChatMetadata]);

  const { subscription } = useSubscriptionUsage(token);

  useEffect(() => {
    if (subscription) {
      setUsage(
        (prev) =>
          ({
            ...prev,
            subscription: {
              used: (subscription as any).aiChatUsed || 0,
              total: (subscription as any).package?.aiChatQuota || 0,
              unit: "次",
              label: (subscription as any).package?.name || "AI 聊天额度",
            },
          }) as AppUsage,
      );
    }
  }, [subscription]);

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  useEffect(() => {
    visibilityTypeRef.current = visibilityType;
  }, [visibilityType]);

  const chatApi = "/api/chat";

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: chatApi,
        fetch: async (input, init) => {
          const headers = new Headers(init?.headers);
          const currentToken = tokenRef.current || getAuthToken();
          if (currentToken) {
            headers.set("Authorization", `Bearer ${currentToken}`);
          }
          return fetchWithErrorHandlers(input, { ...init, headers });
        },
        prepareSendMessagesRequest(request) {
          return {
            body: {
              id: request.id,
              message: request.messages.at(-1),
              selectedChatModel: currentModelIdRef.current,
              selectedVisibilityType: visibilityTypeRef.current,
              isMultiAgent,
              ...request.body,
            },
          };
        },
      }),
    [chatApi],
  );

  const {
    messages,
    setMessages,
    append: sendMessage,
    status,
    stop,
    regenerate,
    resumeStream,
  } = useChat<ChatMessage>({
    id,
    messages: initialMessages,
    maxSteps: 5, // Enable multi-step tool calls
    experimental_throttle: 100,
    generateId: generateUUID,
    transport,
    onData: (dataPart) => {
      setDataStream((ds) => (ds ? [...ds, dataPart as any] : []));
      if (dataPart.type === "data-usage") {
        setUsage(dataPart.data);
      }
    },
    onFinish: () => {
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
    onError: (error: any) => {
      const message = error?.message || "";
      if (message.includes("Type validation failed")) {
        return;
      }
      if (message.includes("AI Gateway requires a valid credit card")) {
        setShowCreditCardAlert(true);
      } else {
        toast.error(message || "发生错误");
      }
    },
  });

  useEffect(() => {
    if ((messages?.length || 0) === 0 && artifact.documentId === "init" && !documentId && !query) {
      if (initialProjectId) {
        handleProjectChange(initialProjectId);
      }
    }
  }, [messages.length, setArtifact, artifact.documentId, documentId, query, initialProjectId]);

  useEffect(() => {
    if (messages.length === 0 && !isArtifactVisible) {
      // setIsSkillsVisible(true);
    } else if (isArtifactVisible) {
      setIsSkillsVisible(false);
    }
  }, [messages.length, isArtifactVisible]);

  const [hasAppendedQuery, setHasAppendedQuery] = useState(false);

  useEffect(() => {
    if (agentName) {
      const agent = allAgents?.find((a: any) => a.name === agentName);
      if (agent) {
        setCurrentModelId(agent.id);
      }
      setChatMetadata((prev: any) => ({
        ...prev,
        selectedAgent: agentName,
        inputPrefix: null,
        _ts: Date.now(),
      }));
    }
  }, [agentName, allAgents, setChatMetadata]);

  useEffect(() => {
    if (query && !hasAppendedQuery) {
      sendMessage({
        role: "user" as const,
        parts: [{ type: "text", text: query }],
      });

      setHasAppendedQuery(true);

      if (isMounted) {
        window.history.replaceState({}, "", `/chat/${id}`);
      }
    }
  }, [query, sendMessage, hasAppendedQuery, id, isMounted]);

  useEffect(() => {
    const validKinds = [
      "text",
      "code",
      "image",
      "sheet",
      "quote",
      "project",
      "position",
      "requirement",
      "resume",
      "service",
      "matching",
      "report",
      "task",
      "approval",
      "contract",
      "message",
      "agent",
      "web",
      "admin",
      "document",
    ];

    if (documentId && kind) {
      const artifactKind = validKinds.includes(kind) ? kind : "text";

      if (currentDocument) {
        const docAgent = (currentDocument as any).agentDocuments?.[0]?.agent;
        const finalAgentId = agentIdFromUrl || docAgent?.id;
        const finalMessageId = messageIdFromUrl || (currentDocument as any).messageId;

        if (finalAgentId) {
          const agent = allAgents?.find((a: any) => a.id === finalAgentId) || docAgent;
          if (agent) {
            setCurrentModelId(agent.id);
            setChatMetadata((prev: any) => ({
              ...prev,
              selectedAgent: agent.name,
              inputPrefix: null,
              _ts: Date.now(),
            }));
          }
        }

        setArtifact({
          documentId,
          kind: (currentDocument.kind || artifactKind) as any,
          title: currentDocument.title || agentName || "",
          isVisible: true,
          status: "idle",
          content: currentDocument.content || "",
          messageId: finalMessageId,
          agentId: finalAgentId,
          initialViewMode:
            currentDocument.kind === "resume" ||
            artifactKind === "resume" ||
            currentDocument.kind === "task" ||
            artifactKind === "task"
              ? "preview"
              : undefined,
          boundingBox: { top: 0, left: 0, width: 0, height: 0 },
        });

        if (currentDocument.metadata) {
          setMetadata(currentDocument.metadata);
        }

        if (isMounted) {
          window.history.replaceState({}, "", `/chat/${id}`);
        }
      } else {
        // 如果没有 currentDocument 且状态是 idle，尝试手动加载
        setArtifact({
          documentId,
          kind: artifactKind as any,
          title: agentName || "",
          isVisible: true,
          status: "idle",
          content: "",
          messageId: messageIdFromUrl || undefined,
          agentId: agentIdFromUrl || undefined,
          boundingBox: { top: 0, left: 0, width: 0, height: 0 },
        });
      }
    }
  }, [
    documentId,
    kind,
    currentDocument,
    agentName,
    setArtifact,
    id,
    setChatMetadata,
    setCurrentModelId,
    isMounted,
    messageIdFromUrl,
    agentIdFromUrl,
    allAgents,
  ]);

  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  const { open: isSidebarOpen, isMobile } = useSidebar();

  const handleAnalyzeProject = (project: any) => {
    sendMessage({
      role: "user" as const,
      parts: [
        {
          type: "text",
          text: `我选择分析项目 "${project.name}" (ID: ${project.id})。请先查询该项目的现有需求，然后根据项目目标进行深度的需求拆分，并生成相应的任务清单和文档。`,
        },
      ],
    });
    setIsSkillsVisible(false);
  };

  const handleViewDocument = async (doc: ArtifactDocument) => {
    let chatId = doc.chatId;
    let messageId = (doc as any).messageId;
    let agentId = (doc as any).agentId;

    // 1. 如果文档对象中没有 chatId，则通过 Hook 获取
    // 这对应用户要求：点击文档列表项，传参数文档ID，并根据文档ID获取对话ID、对话消息ID和智能体ID
    if (!chatId) {
      toast.loading("正在打开文档...", { id: "view-document" });
      setSelectedDocumentForHook(doc);
      return;
    }

    // 2. 参照 sidebar-history-item.tsx 的逻辑处理导航和 artifact 显示
    if (chatId === id) {
      // 如果是当前对话，直接设置 artifact
      setArtifact({
        documentId: doc.id,
        title: doc.title,
        kind: doc.kind ?? "text",
        content: doc.content || "",
        isVisible: true,
        status: "idle",
        messageId,
        agentId,
        initialViewMode: doc.kind === "resume" || doc.kind === "task" ? "preview" : undefined,
        boundingBox: { top: 0, left: 0, width: 0, height: 0 },
      });

      // 左侧显示预选智能体
      if (agentId) {
        handleModelChange(agentId, false, "discovery");
      }
    } else {
      // 如果是其他对话，跳转过去
      // 携带 messageId 和 agentId 以便在目标页面正确显示左侧内容
      router.push(
        `/chat/${chatId}?documentId=${doc.id}&kind=${doc.kind ?? "text"}${messageId ? `&messageId=${messageId}` : ""}${agentId ? `&agentId=${agentId}` : ""}`,
      );
    }

    if (doc.metadata) {
      setMetadata(doc.metadata);
    }
    setIsSkillsVisible(false);
  };

  const { data: votes } = useVotes(id, token, messages.length >= 2);

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [hasInitializedProject, setHasInitializedProject] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(430); // 初始左侧面板像素宽度 430px
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (initialProjectId && projects.length > 0 && !hasInitializedProject) {
      const project = projects.find((p) => p.id === initialProjectId);
      if (project) {
        setArtifact({
          documentId: project.id,
          kind: "project",
          content: JSON.stringify(project),
          title: project.name,
          isVisible: true,
          status: "idle",
          boundingBox: {
            top: 0,
            left: 0,
            width: 0,
            height: 0,
          },
        });
        setHasInitializedProject(true);
      }
    }
  }, [initialProjectId, projects, setArtifact, hasInitializedProject]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };

  useEffect(() => {
    if (!isMounted) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      // 限制最小宽度为 430px，最大宽度为窗口宽度的 80%
      const newWidth = Math.max(430, Math.min(e.clientX, window.innerWidth * 0.8));
      setLeftPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging, isMounted]);

  useAutoResume({
    autoResume,
    initialMessages,
    resumeStream,
    setMessages,
  });

  const handleProjectChange = (projectId: string | null) => {
    setSelectedProjectId(projectId);
    if (projectId) {
      setArtifact({
        documentId: `project-${projectId}`,
        title: "项目详情",
        kind: "project",
        content: `正在查看项目 ${projectId} 的详情...`,
        isVisible: true,
        status: "idle",
        boundingBox: { top: 0, left: 0, width: 0, height: 0 },
      });
    }
  };

  const handleCloseArtifact = useCallback(() => {
    if (artifact.documentId?.startsWith("project-") || artifact.documentId === "project-list") {
      setHasInitializedProject(true);
    }
    setArtifact((currentArtifact) =>
      currentArtifact.status === "streaming"
        ? {
            ...currentArtifact,
            isVisible: false,
          }
        : { ...initialArtifactData, status: "idle" },
    );

    // 清除 URL 中的 documentId 等参数
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.has("documentId")) {
        params.delete("documentId");
        params.delete("kind");
        params.delete("messageId");
        params.delete("agentId");
        const newRelativePathQuery =
          window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
        router.replace(newRelativePathQuery);
      }
    }
  }, [artifact.documentId, artifact.status, setArtifact, setHasInitializedProject, router]);

  const handleSheetOpenChange = (open: boolean) => {
    if (!open) {
      handleCloseArtifact();
    }
  };

  const prevArtifactRef = useRef(artifact);
  useEffect(() => {
    prevArtifactRef.current = artifact;
  }, [artifact]);

  const isInitialView = messages.length === 0 && !documentId && !query && !isTransitioning;

  const isShowMessages =
    !((isInitialView || isTransitioning) && !chatMetadata?.discoverySource) || isArtifactVisible;

  const displayTitle = useMemo(() => {
    if (typeof chatMetadata === "undefined" || !chatMetadata) return initialTitle;
    if (messages.length === 0) {
      if (chatMetadata.selectedAgent) return chatMetadata.selectedAgent;
      if (chatMetadata.selectedApp?.name) return chatMetadata.selectedApp.name;
    }
    return initialTitle;
  }, [chatMetadata, initialTitle, messages.length]);

  const renderHeader = () => {
    if (typeof chatMetadata === "undefined") {
      return null;
    }

    return (
      <ChatHeader
        chatId={id}
        isReadonly={isReadonly}
        selectedVisibilityType={visibilityType as VisibilityType}
        title={displayTitle}
        isPinned={initialIsPinned ?? false}
        initialProjectId={selectedProjectId || undefined}
        projects={projects}
        isProjectsLoading={isProjectsLoading}
        onProjectChange={handleProjectChange}
        isSkillsVisible={isSkillsVisible}
        setIsSkillsVisible={setIsSkillsVisible}
        onTitleUpdate={async (title) => {
          if (onUpdateChatTitle) await onUpdateChatTitle({ chatId: id, title });
        }}
        onDelete={async () => {
          if (onDeleteChat) {
            await onDeleteChat({ id });
            router.push("/");
          }
        }}
        onTogglePin={async () => {
          if (onToggleChatPin) await onToggleChatPin({ chatId: id });
        }}
        onAddToProject={async (projectId) => {
          if (onUpdateChatProject) {
            await onUpdateChatProject({ chatId: id, projectId });
            setSelectedProjectId(projectId);
            queryClient.invalidateQueries({ queryKey: ["projects"] });
          }
        }}
        onNewChat={() => {
          router.push("/");
          router.refresh();
        }}
        isArtifactVisible={isArtifactVisible}
        className={cn(
          "relative z-20 bg-white/40 backdrop-blur-3xl border-b border-black/5 shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-all duration-700 ease-in-out",
          !isInitialView && "sticky top-0",
        )}
      />
    );
  };

  const effectiveStatus = (externalStatus ?? status) as UseChatHelpers<ChatMessage>["status"];

  return (
    <>
      <DataStreamHandler chatId={id} />
      <div className="overscroll-behavior-contain flex h-dvh min-w-0 touch-pan-y flex-row relative bg-white overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-indigo-200/20 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-100/20 blur-[120px] rounded-full animate-pulse delay-700" />
          <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-blue-50/20 blur-[100px] rounded-full animate-pulse delay-1000" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay" />
        </div>

        {/* 左侧对话区域 */}
        <div
          className={cn(
            "flex flex-col min-w-0 relative transition-all duration-500 ease-in-out",
            isArtifactVisible && !isMobile ? "" : "w-full",
          )}
          style={{ width: isArtifactVisible && !isMobile ? `${leftPanelWidth}px` : "100%" }}
        >
          {isShowMessages && !isTransitioning && renderHeader()}

          <div className="flex-1 relative z-10 min-h-0 flex flex-col">
            {!isShowMessages ? (
              <div className="flex-1 overflow-y-auto scrollbar-none">
                {renderHeader()}
                <DiscoveryView
                  token={token}
                  isInitial={!isTransitioning}
                  hideInput={messages.length > 0}
                  onDocumentClick={handleViewDocument}
                  onAgentClick={(agent) => handleModelChange(agent.id, true, "agent")}
                  onToolClick={handleToolClick}
                  onNewChat={() => {
                    router.push("/");
                  }}
                  onGenerationSubmit={(text) => {
                    setIsTransitioning(true);
                    window.history.pushState({}, "", `/chat/${id}`);
                    sendMessage({
                      role: "user",
                      parts: [{ type: "text", text }],
                    });
                  }}
                />
              </div>
            ) : (
              <>
                {!isInitialView && isArtifactVisible && false /* Header already rendered above */}
                <Messages
                  chatId={id}
                  isArtifactVisible={isArtifactVisible}
                  isReadonly={isReadonly}
                  messages={messages}
                  regenerate={regenerate}
                  selectedModelId={currentModelId}
                  setMessages={setMessages}
                  status={effectiveStatus}
                  votes={votes}
                  onModelChange={handleModelChange}
                  token={token}
                  userId={userId}
                  sendMessage={sendMessage}
                />
              </>
            )}
          </div>

          <div
            className={cn(
              "relative z-20 w-full transition-all duration-1000 ease-in-out",
              !isShowMessages && !isArtifactVisible
                ? "absolute bottom-1/2 translate-y-1/2 opacity-0 pointer-events-none"
                : "bg-gradient-to-t from-white via-white/80 to-transparent pb-4 pt-10 opacity-100",
            )}
          >
            <div className="mx-auto flex w-full max-w-4xl px-4">
              {!isReadonly && (
                <MultimodalInput
                  attachments={attachments}
                  chatId={id}
                  input={input}
                  messages={messages}
                  onModelChange={handleModelChange}
                  selectedModelId={currentModelId}
                  selectedVisibilityType={(visibilityType as VisibilityType) || "private"}
                  sendMessage={async (message) => {
                    // 处理 Slash Commands (参照 OpenClaw 的 isChatResetCommand)
                    const content = typeof message === "string" ? message : message.content;
                    if (typeof content === "string") {
                      const trimmed = content.trim().toLowerCase();
                      if (trimmed === "/reset" || trimmed === "/new" || trimmed === "/clear") {
                        setMessages([]);
                        router.refresh();
                        toast.success("对话已重置");
                        return;
                      }
                      if (trimmed === "/stop") {
                        stop();
                        return;
                      }
                    }

                    if (!isShowMessages) {
                      setIsTransitioning(true);
                    }
                    if (onSendMessage) {
                      onSendMessage(message);
                      return; // 如果提供了外部处理逻辑，跳过默认的网络请求
                    }
                    await sendMessage(message);
                  }}
                  setAttachments={setAttachments}
                  setInput={setInput}
                  setMessages={setMessages}
                  status={status}
                  stop={stop}
                  usage={usage}
                  selectedProjectId={selectedProjectId}
                  token={token}
                />
              )}
            </div>
          </div>
        </div>

        {/* 右侧 Artifact 区域 */}
        {isArtifactVisible &&
          (isMobile ? (
            <Sheet open={isArtifactVisible} onOpenChange={handleSheetOpenChange}>
              <SheetContent side="bottom" className="h-[90dvh] p-0 flex flex-col sm:max-w-full">
                <SheetHeader className="sr-only">
                  <SheetTitle>Artifact 详情</SheetTitle>
                  <SheetDescription>查看和编辑文档详情</SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-hidden">
                  <Artifact
                    key={id}
                    attachments={attachments}
                    chatId={id}
                    input={input}
                    isReadonly={isReadonly}
                    isSidebarOpen={isSidebarOpen}
                    messages={messages}
                    regenerate={regenerate}
                    selectedModelId={currentModelId}
                    selectedVisibilityType={(visibilityType as VisibilityType) || "private"}
                    sendMessage={sendMessage as any}
                    setAttachments={setAttachments}
                    setInput={setInput}
                    setMessages={setMessages}
                    status={status}
                    stop={stop}
                    votes={votes}
                    token={token}
                    userId={userId}
                    title={initialTitle}
                    isPinned={initialIsPinned}
                    initialProjectId={selectedProjectId || undefined}
                    projects={projects}
                    isProjectsLoading={isProjectsLoading || !token}
                    onTitleUpdate={async (title) => {
                      if (onUpdateChatTitle) await onUpdateChatTitle({ chatId: id, title });
                    }}
                    onDelete={async () => {
                      if (onDeleteChat) {
                        await onDeleteChat({ id });
                        router.push("/");
                      }
                    }}
                    onTogglePin={async () => {
                      if (onToggleChatPin) await onToggleChatPin({ chatId: id });
                    }}
                    onAddToProject={async (projectId) => {
                      if (onUpdateChatProject) {
                        await onUpdateChatProject({ chatId: id, projectId });
                        setSelectedProjectId(projectId);
                        queryClient.invalidateQueries({ queryKey: ["projects"] });
                      }
                    }}
                    onUpdateProject={async (projectId, updates) => {
                      if (onUpdateProject) {
                        await onUpdateProject({ id: projectId, updates });
                        queryClient.invalidateQueries({ queryKey: ["projects"] });
                      }
                    }}
                    onClose={handleCloseArtifact}
                    isEmbedded={true}
                  />
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <>
              {/* 分隔条 */}
              <div
                className={cn(
                  "group relative z-50 w-[3px] cursor-col-resize bg-black/5 transition-colors hover:bg-primary",
                  isDragging ? "bg-primary" : "",
                )}
                onMouseDown={handleMouseDown}
              >
                <div className="absolute left-1/2 top-1/2 h-8 w-[2px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-400 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>

              <div className="h-full flex-1 border-l border-black/5 relative z-30 bg-white">
                <Artifact
                  key={id}
                  attachments={attachments}
                  chatId={id}
                  input={input}
                  isReadonly={isReadonly}
                  isSidebarOpen={isSidebarOpen}
                  messages={messages}
                  regenerate={regenerate}
                  selectedModelId={currentModelId}
                  selectedVisibilityType={(visibilityType as VisibilityType) || "private"}
                  sendMessage={sendMessage as any}
                  setAttachments={setAttachments}
                  setInput={setInput}
                  setMessages={setMessages}
                  status={status}
                  stop={stop}
                  votes={votes}
                  token={token}
                  userId={userId}
                  title={initialTitle}
                  isPinned={initialIsPinned}
                  initialProjectId={selectedProjectId || undefined}
                  projects={projects}
                  isProjectsLoading={isProjectsLoading || !token}
                  onTitleUpdate={async (title) => {
                    if (onUpdateChatTitle) await onUpdateChatTitle({ chatId: id, title });
                  }}
                  onDelete={async () => {
                    if (onDeleteChat) {
                      await onDeleteChat({ id });
                      router.push("/");
                    }
                  }}
                  onTogglePin={async () => {
                    if (onToggleChatPin) await onToggleChatPin({ chatId: id });
                  }}
                  onAddToProject={async (projectId) => {
                    if (onUpdateChatProject) {
                      await onUpdateChatProject({ chatId: id, projectId });
                      setSelectedProjectId(projectId);
                      queryClient.invalidateQueries({ queryKey: ["projects"] });
                    }
                  }}
                  onUpdateProject={async (projectId, updates) => {
                    if (onUpdateProject) {
                      await onUpdateProject({ id: projectId, updates });
                      queryClient.invalidateQueries({ queryKey: ["projects"] });
                    }
                  }}
                  onClose={handleCloseArtifact}
                  isEmbedded={true}
                />
              </div>
            </>
          ))}
      </div>

      <SkillsSidebar
        isVisible={isSkillsVisible}
        onClose={() => setIsSkillsVisible(false)}
        onAnalyzeProject={handleAnalyzeProject}
        onViewDocument={handleViewDocument}
        token={token}
        projects={projectsData}
        isProjectsLoading={isProjectsLoading}
      />

      <AlertDialog onOpenChange={setShowCreditCardAlert} open={showCreditCardAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate AI Gateway</AlertDialogTitle>
            <AlertDialogDescription>
              This application requires{" "}
              {process.env.NODE_ENV === "production" ? "the owner" : "you"} to activate Vercel AI
              Gateway.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (isMounted) {
                  window.open(
                    "https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%3Fmodal%3Dadd-credit-card",
                    "_blank",
                  );
                  window.location.href = "/";
                }
              }}
            >
              Activate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
