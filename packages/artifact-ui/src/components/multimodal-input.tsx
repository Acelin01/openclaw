"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { Trigger } from "@radix-ui/react-select";
import { AgentCard } from "@uxin/agent-lib";
import {
  SelectItem,
  Button,
  Input,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@uxin/ui";
import { Bot } from "lucide-react";
import {
  type ChangeEvent,
  type Dispatch,
  memo,
  type SetStateAction,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { useLocalStorage, useWindowSize } from "usehooks-ts";
import type { Attachment, ChatMessage } from "../lib/types";
import type { AppUsage } from "../lib/usage";
import type { VisibilityType } from "./visibility-selector";
import { useArtifact } from "../hooks/use-artifact";
import { useProjectDetail, useChatDocuments } from "../hooks/use-artifact-api";
import { useChatResources } from "../hooks/use-chat-resources";
import { constructApiUrl, optimizePrompt } from "../lib/api";
import { chatModels } from "../lib/config/models";
import { cn, getAuthToken } from "../lib/utils";
import { AgentInfoBar } from "./agent-info-bar";
import { Context } from "./elements/context";
import {
  PromptInput,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "./elements/prompt-input";
import {
  ArrowUpIcon,
  AtIcon,
  ChevronDownIcon,
  HashIcon,
  PaperclipIcon,
  SparklesIcon,
  StopIcon,
  MicIcon,
} from "./icons";
import { PendingDocumentsList } from "./pending-documents-list";
import { PreviewAttachment } from "./preview-attachment";
import { SuggestedActions } from "./suggested-actions";

function PureMultimodalInput({
  chatId,
  input,
  setInput,
  status,
  stop,
  attachments,
  setAttachments,
  messages,
  setMessages,
  sendMessage,
  className,
  selectedVisibilityType,
  selectedModelId,
  onModelChange,
  usage,
  projects,
  token,
  selectedProjectId,
}: {
  chatId: string;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  status: UseChatHelpers<ChatMessage>["status"];
  stop: () => void;
  attachments: Attachment[];
  setAttachments: Dispatch<SetStateAction<Attachment[]>>;
  messages: UIMessage[];
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
  className?: string;
  selectedVisibilityType: VisibilityType;
  selectedModelId: string;
  onModelChange?: (modelId: string) => void;
  usage?: AppUsage;
  projects?: Array<{ id: string; name: string }>;
  token?: string;
  selectedProjectId?: string | null;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();
  const { chatMetadata, setChatMetadata, setArtifact, setMetadata } = useArtifact();
  const inputPrefix = chatMetadata?.inputPrefix;

  // Use prop token if available, otherwise fallback to localStorage
  const effectiveToken = token || getAuthToken();

  const prefixRef = useRef<HTMLDivElement>(null);
  const [prefixWidth, setPrefixWidth] = useState(0);

  useLayoutEffect(() => {
    if (prefixRef.current) {
      setPrefixWidth(prefixRef.current.offsetWidth + 12); // add some padding
    } else {
      setPrefixWidth(0);
    }
  }, [inputPrefix]);

  const {
    requirements,
    tasks,
    agents: allAgents,
    isLoading,
  } = useChatResources(effectiveToken || "");

  const effectiveSelectedProjectId = selectedProjectId || chatMetadata?.selectedProjectId;

  const {
    project: currentProject,
    isLoading: isProjectDetailLoading,
    updateProject: apiUpdateProject,
    createProject: apiCreateProject,
  } = useProjectDetail(effectiveToken || "", effectiveSelectedProjectId || null);

  useEffect(() => {
    if (currentProject) {
      // 自动触发项目关联的智能体逻辑
      setArtifact((current: any) => ({
        ...current,
        documentId: `agent-${currentProject.id}`,
        title: `${currentProject.name} 智能体配置`,
        kind: "agent",
        isVisible: true,
        status: "idle",
        content: JSON.stringify({
          name: currentProject.name,
          prompt: "",
          isCallableByOthers: false,
          selectedTools: [],
        }),
      }));

      // 设置相关的元数据
      if (typeof setMetadata === "function") {
        setMetadata({
          projectId: currentProject.id,
          projectName: currentProject.name,
        });
      }
    }
  }, [currentProject, setArtifact, setMetadata]);

  const { documents: chatDocuments, batchUpdateDocumentStatus: apiBatchUpdateStatus } =
    useChatDocuments(effectiveToken || "", chatId);

  const pendingDocuments = chatDocuments.filter((doc) => doc.status === "PENDING");
  const [isPendingListExpanded, setIsPendingListExpanded] = useState(false);

  const handleApproveAll = async () => {
    try {
      await apiBatchUpdateStatus({ status: "APPROVED" });

      // Auto-create data for approved documents
      for (const doc of pendingDocuments) {
        if (doc.kind === "project" && doc.content) {
          try {
            const content = JSON.parse(doc.content);
            // Check if we have a project ID from the document or selected context
            const projectId = doc.id.startsWith("project-")
              ? doc.id.replace("project-", "")
              : effectiveSelectedProjectId;

            if (projectId) {
              await apiUpdateProject(content);
            } else {
              await apiCreateProject({ content: doc.content });
            }
          } catch (e) {
            console.error("Failed to auto-create project data for doc", doc.id, e);
          }
        }
      }

      toast.success("审核通过", { description: "所有待审核文档已通过" });
    } catch (error) {
      toast.error("操作失败", { description: "批量审核失败" });
    }
  };

  const handleRejectAll = async () => {
    try {
      await apiBatchUpdateStatus({ status: "REJECTED" });
      toast.success("审核驳回", { description: "所有待审核文档已驳回" });
    } catch (error) {
      toast.error("操作失败", { description: "批量驳回失败" });
    }
  };

  const agents = useMemo(() => {
    if (!selectedProjectId) {
      // 如果没有关联项目，显示所有通讯录中的智能体
      return allAgents;
    }

    // 如果有关联项目，但项目详情还在加载中，先返回空列表避免显示错误
    if (isProjectDetailLoading) return [];

    if (!currentProject) return [];

    // 获取项目关联的智能体 ID 列表
    const projectAgentIds = currentProject.agents?.map((a: any) => a.id) || [];

    // 过滤逻辑：
    // 1. 智能体在项目关联列表中
    // 2. 注意：后端返回的 allAgents 通常已经根据当前用户的权限过滤过了（通讯录逻辑）
    // 这里我们进一步筛选出属于当前项目的智能体
    const filtered = allAgents.filter((agent: any) => projectAgentIds.includes(agent.id));

    return filtered;
  }, [allAgents, selectedProjectId, currentProject, isProjectDetailLoading]);

  /**
   * 计算当前显示的智能体名称
   * 默认为“项目负责人”
   */
  const agentName = useMemo(() => {
    return chatMetadata?.selectedAgent || "项目负责人";
  }, [chatMetadata?.selectedAgent]);

  const agentAvatar = useMemo(() => {
    if (!chatMetadata?.selectedAgent) return undefined;
    const agent = agents.find((a: any) => a.name === chatMetadata.selectedAgent);
    return agent?.avatar;
  }, [chatMetadata?.selectedAgent, agents]);

  const adjustHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "44px";
    }
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, [adjustHeight]);

  const resetHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "44px";
    }
  }, []);

  const [localStorageInput, setLocalStorageInput] = useLocalStorage("input", "");

  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;

    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      // Prefer DOM value over localStorage to handle hydration
      // But only if input is empty, to avoid overwriting during session
      if (!input && (domValue || localStorageInput)) {
        const finalValue = domValue || localStorageInput || "";
        setInput(finalValue);
        adjustHeight();
        isInitialized.current = true;
      }
    }
    // Only run once after hydration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adjustHeight, setInput, localStorageInput]);

  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  useEffect(() => {
    const selectedProject = projects?.find((p) => p.id === chatMetadata?.selectedProjectId);
    if (selectedProject) {
      // 自动触发项目关联的智能体逻辑
      setArtifact((current: any) => ({
        ...current,
        documentId: `agent-${selectedProject.id}`,
        title: `${selectedProject.name} 智能体配置`,
        kind: "agent",
        isVisible: true,
        status: "idle",
        content: JSON.stringify({
          name: selectedProject.name,
          prompt: "",
          isCallableByOthers: false,
          selectedTools: [],
        }),
      }));
    }
  }, [projects, chatMetadata?.selectedProjectId, setArtifact]);

  const [isAgentMenuOpen, setIsAgentMenuOpen] = useState(false);
  const [isHashMenuOpen, setIsHashMenuOpen] = useState(false);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    const lastChar = newValue.slice(-1);

    if (lastChar === "@") {
      setIsAgentMenuOpen(true);
      // 输入 @ 时，不将其加入输入框内容，行为与点击 icon 一致
      setInput(newValue.slice(0, -1));
      return;
    } else if (lastChar === "#") {
      setIsHashMenuOpen(true);
      // 输入 # 时，不将其加入输入框内容，行为与点击 icon 一致
      setInput(newValue.slice(0, -1));
      return;
    }

    setInput(newValue);
  };

  const [isOptimizing, setIsOptimizing] = useState(false);

  const isEmoji = (str: string | null | undefined) => {
    if (!str) return false;
    return /\p{Emoji}/u.test(str) && str.length <= 8;
  };

  const handleOptimizePrompt = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!input.trim()) {
      toast.error("请输入提示词后再进行优化");
      return;
    }

    if (!effectiveToken) {
      toast.error("未登录或 Token 已过期，请刷新页面");
      return;
    }

    try {
      setIsOptimizing(true);
      const res = await optimizePrompt(effectiveToken, {
        prompt: input,
        agents: chatMetadata?.selectedAgent ? [{ name: chatMetadata.selectedAgent }] : [],
        context: inputPrefix ? [{ title: inputPrefix }] : [],
      });

      if (res.success && res.data) {
        const { optimizedPrompt, suggestedAgents, suggestedContext } = res.data;

        if (optimizedPrompt) {
          setInput(optimizedPrompt);
          // 强制更新 localStorage，确保同步
          setLocalStorageInput(optimizedPrompt);

          // 强制同步 DOM 内容，确保文本框高度和光标位置更新
          if (textareaRef.current) {
            textareaRef.current.value = optimizedPrompt;
            // 触发一次高度自适应
            adjustHeight();
          }
        }

        // 自动更新建议的智能体和上下文
        setChatMetadata((prev: any) => {
          const updates: any = { ...prev, _ts: Date.now() };

          if (suggestedAgents && suggestedAgents.length > 0) {
            // 优先匹配现有的智能体
            const matchedAgent = agents?.find((a: any) =>
              suggestedAgents.some((name: string) => {
                if (!name || !a?.name) return false;
                const lowName = name.toLowerCase();
                const lowAgentName = a.name.toLowerCase();
                return lowName.includes(lowAgentName) || lowAgentName.includes(lowName);
              }),
            );
            updates.selectedAgent = matchedAgent ? matchedAgent.name : suggestedAgents[0];
          }

          if (suggestedContext && suggestedContext.length > 0) {
            // 优先匹配现有的需求或任务
            const allContexts = [...requirements, ...tasks];
            const matchedContext = allContexts.find((c: any) =>
              suggestedContext.some((title: string) => {
                if (!title || !c?.title) return false;
                const lowTitle = title.toLowerCase();
                const lowContextTitle = c.title.toLowerCase();
                return lowTitle.includes(lowContextTitle) || lowContextTitle.includes(lowTitle);
              }),
            );
            updates.inputPrefix = matchedContext
              ? `#${matchedContext.title}`
              : `#${suggestedContext[0]}`;
          }

          return updates;
        });

        toast.success("提示词已优化：已按结构化标准生成需求并匹配最佳智能体/上下文");
      } else {
        toast.error(res.message || "优化失败");
      }
    } catch (error) {
      console.error("优化提示词失败:", error);
      toast.error("网络错误，请稍后再试");
    } finally {
      setIsOptimizing(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<string[]>([]);

  const submitForm = useCallback(() => {
    if (!input.trim() && attachments.length === 0) {
      toast.error("请输入消息或上传文件");
      return;
    }

    window.history.pushState({}, "", `/chat/${chatId}`);

    sendMessage({
      role: "user",
      parts: [
        ...attachments.map((attachment) => ({
          type: "file" as const,
          url: attachment.url,
          name: attachment.name,
          mediaType: attachment.contentType,
        })),
        {
          type: "text",
          text: inputPrefix ? `${inputPrefix} ${input} ` : input,
        },
      ],
      metadata: {
        selectedAgent:
          agents.find((a: any) => a.name === chatMetadata?.selectedAgent) ||
          chatMetadata?.selectedAgent,
      },
    });

    setAttachments([]);
    setLocalStorageInput("");
    resetHeight();
    setInput("");

    // Clear prefix on submit
    if (inputPrefix) {
      setChatMetadata((prev: any) => ({ ...prev, inputPrefix: null }));
    }

    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [
    input,
    setInput,
    attachments,
    sendMessage,
    setAttachments,
    setLocalStorageInput,
    width,
    chatId,
    resetHeight,
    inputPrefix,
    setChatMetadata,
  ]);

  const uploadFile = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const url = constructApiUrl("/api/v1/files/upload");
      const response = await fetch(url.toString(), {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const { url, pathname, contentType } = data;

        return {
          url,
          name: pathname,
          contentType,
        };
      }
      const { error } = await response.json();
      toast.error(error);
    } catch (_error) {
      toast.error("上传文件失败，请重试！");
    }
  }, []);

  const contextProps = useMemo(
    () => ({
      usage,
    }),
    [usage],
  );

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      setUploadQueue(files.map((file) => file.name));

      try {
        const uploadPromises = files.map((file) => uploadFile(file));
        const uploadedAttachments = await Promise.all(uploadPromises);
        const successfullyUploadedAttachments = uploadedAttachments.filter(
          (attachment) => attachment !== undefined,
        );

        setAttachments((currentAttachments) => [
          ...currentAttachments,
          ...successfullyUploadedAttachments,
        ]);
      } catch (error) {
        console.error("Error uploading files!", error);
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments, uploadFile],
  );

  const handlePaste = useCallback(
    async (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) {
        return;
      }

      const imageItems = Array.from(items).filter((item: DataTransferItem) =>
        item.type.startsWith("image/"),
      );

      if (imageItems.length === 0) {
        return;
      }

      // Prevent default paste behavior for images
      event.preventDefault();

      setUploadQueue((prev) => [...prev, "Pasted image"]);

      try {
        const uploadPromises = imageItems
          .map((item) => item.getAsFile())
          .filter((file): file is File => file !== null)
          .map((file) => uploadFile(file));

        const uploadedAttachments = await Promise.all(uploadPromises);
        const successfullyUploadedAttachments = uploadedAttachments.filter(
          (attachment) =>
            attachment !== undefined &&
            attachment.url !== undefined &&
            attachment.contentType !== undefined,
        );

        setAttachments((curr) => [...curr, ...(successfullyUploadedAttachments as Attachment[])]);
      } catch (error) {
        console.error("Error uploading pasted images:", error);
        toast.error("上传粘贴的图片失败");
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments, uploadFile],
  );

  // Add paste event listener to textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.addEventListener("paste", handlePaste);
    return () => textarea.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  const selectedModel = useMemo(
    () => chatModels.find((m) => m.id === selectedModelId),
    [selectedModelId],
  );

  return (
    <div className={cn("relative flex w-full flex-col gap-4", className)}>
      {(messages?.length || 0) === 0 &&
        (attachments?.length || 0) === 0 &&
        (uploadQueue?.length || 0) === 0 && (
          <div className="flex flex-col gap-4 w-full px-4 sm:px-0">
            {chatMetadata?.discoverySource === "agent" && chatMetadata?.selectedAgentId ? (
              <div className="w-full max-w-2xl mx-auto">
                <div className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <SparklesIcon className="w-4 h-4 text-primary" />
                  已选择智能体
                </div>
                {allAgents
                  .filter((a: any) => a.id === chatMetadata.selectedAgentId)
                  .map((agent: any) => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      className="cursor-default border-primary/20 shadow-lg shadow-primary/5 bg-gradient-to-br from-background to-muted/30"
                    />
                  ))}
              </div>
            ) : (
              <SuggestedActions
                chatId={chatId}
                selectedVisibilityType={selectedVisibilityType}
                sendMessage={sendMessage}
              />
            )}
          </div>
        )}

      <Input
        className="-top-4 -left-4 pointer-events-none fixed size-0.5 opacity-0"
        multiple
        onChange={handleFileChange}
        ref={fileInputRef}
        tabIndex={-1}
        type="file"
      />

      <div className="flex flex-col gap-0 relative">
        <div className="absolute bottom-full left-0 right-0 z-20">
          <PendingDocumentsList
            documents={pendingDocuments}
            tasks={tasks}
            isExpanded={isPendingListExpanded}
            onToggleExpand={() => setIsPendingListExpanded(!isPendingListExpanded)}
            onApproveAll={handleApproveAll}
            onRejectAll={handleRejectAll}
            onSelectDocument={(doc) => {
              setArtifact((current: any) => ({
                ...current,
                documentId: doc.id,
                kind: doc.kind,
                title: doc.title,
                content: doc.content || "",
                isVisible: true,
                status: "idle",
                boundingBox: { top: 0, left: 0, width: 0, height: 0 },
              }));
            }}
          />
        </div>

        <AgentInfoBar
          name={agentName}
          avatar={agentAvatar}
          onClick={() => {
            const currentAgent = agents.find((a: any) => a.name === agentName);
            const agentToUse = currentAgent || {
              id: "pm",
              name: agentName || "项目经理",
              prompt: "",
              isCallableByOthers: false,
              selectedTools: [],
            };

            setArtifact((current: any) => ({
              ...current,
              documentId: `agent-${agentToUse.id}`,
              title: `${agentToUse.name} 智能体配置`,
              kind: "agent",
              isVisible: true,
              status: "idle",
              initialViewMode: "preview",
              content: JSON.stringify(agentToUse),
            }));
          }}
          onEditClick={() => {
            const currentAgent = agents.find((a: any) => a.name === agentName);
            const agentToUse = currentAgent || {
              id: "pm",
              name: agentName || "项目经理",
              prompt: "",
              isCallableByOthers: false,
              selectedTools: [],
            };

            setArtifact((current: any) => ({
              ...current,
              documentId: `agent-${agentToUse.id}`,
              title: `${agentToUse.name} 智能体配置`,
              kind: "agent",
              isVisible: true,
              status: "idle",
              initialViewMode: "edit",
              content: JSON.stringify(agentToUse),
            }));
          }}
        />

        <PromptInput
          className="rounded-b-xl border border-border bg-background p-3 shadow-xs transition-all duration-200 focus-within:border-border hover:border-muted-foreground/50"
          onSubmit={(event) => {
            event.preventDefault();
            if (status !== "ready") {
              toast.error("请等待模型完成响应！");
            } else {
              submitForm();
            }
          }}
        >
          {((attachments?.length || 0) > 0 || (uploadQueue?.length || 0) > 0) && (
            <div
              className="flex flex-row items-end gap-2 overflow-x-scroll"
              data-testid="attachments-preview"
            >
              {attachments?.map((attachment) => (
                <PreviewAttachment
                  attachment={attachment}
                  key={attachment.url}
                  onRemove={() => {
                    setAttachments((currentAttachments) =>
                      currentAttachments.filter((a: any) => a.url !== attachment.url),
                    );
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                />
              ))}

              {uploadQueue?.map((filename) => (
                <PreviewAttachment
                  attachment={{
                    url: "",
                    name: filename,
                    contentType: "",
                  }}
                  isUploading={true}
                  key={filename}
                />
              ))}
            </div>
          )}
          <div className="flex flex-row items-start gap-1 sm:gap-2 relative">
            {inputPrefix && (
              <div
                ref={prefixRef}
                className="absolute top-2 left-2 z-10 pointer-events-none flex items-center gap-1"
              >
                <span className={cn("text-sm font-bold whitespace-nowrap text-[#19be6b]")}>
                  {inputPrefix}
                </span>
              </div>
            )}
            <PromptInputTextarea
              autoFocus
              className={cn(
                "grow resize-none border-0! border-none! bg-transparent p-2 text-sm outline-none ring-0 [-ms-overflow-style:none] [scrollbar-width:none] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-scrollbar]:hidden",
              )}
              style={{ textIndent: prefixWidth > 0 ? `${prefixWidth}px` : undefined }}
              data-testid="multimodal-input"
              disableAutoResize={true}
              maxHeight={200}
              minHeight={44}
              onChange={(e) => {
                handleInput(e);
              }}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && input === "" && inputPrefix) {
                  const oldPrefix = inputPrefix;
                  setChatMetadata((prev: any) => ({ ...prev, inputPrefix: null }));

                  // 如果撤销的是创建智能体，切换回项目列表
                  if (oldPrefix === "# 创建智能体") {
                    setArtifact((prev: any) => ({
                      ...prev,
                      documentId: "project-list",
                      kind: "project",
                      title: "项目列表",
                    }));
                  }
                }
              }}
              placeholder={
                inputPrefix === "# 创建智能体"
                  ? "请描述执行规则机制及流程"
                  : inputPrefix
                    ? ""
                    : "发送消息..."
              }
              ref={textareaRef}
              rows={1}
              value={input}
            />{" "}
            <Context {...contextProps} />
          </div>
          <PromptInputToolbar className="!border-top-0 border-t-0! p-0 shadow-none dark:border-0 dark:border-transparent!">
            <PromptInputTools className="gap-0 sm:gap-0.5">
              <AttachmentsButton
                fileInputRef={fileInputRef}
                status={status}
                selectedModelId={selectedModelId}
              />

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg"
                      onClick={() => {
                        toast.info("语音输入功能即将上线");
                      }}
                    >
                      <MicIcon size={14} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">语音输入</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <DropdownMenu open={isAgentMenuOpen} onOpenChange={setIsAgentMenuOpen}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-slate-500 hover:text-[#19be6b] hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                        >
                          <AtIcon size={14} />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="top">输入 “@”选择智能体</TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent align="start" className="w-56 max-h-[300px] overflow-y-auto">
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      关联智能体
                    </div>
                    {isLoading && agents.length === 0 && (
                      <div className="px-2 py-4 text-xs text-center text-muted-foreground">
                        加载中...
                      </div>
                    )}
                    {agents.length > 0
                      ? agents.map((agent: any) => (
                          <DropdownMenuItem
                            key={agent.id}
                            onSelect={() => {
                              setChatMetadata((prev: any) => ({
                                ...prev,
                                selectedAgent: agent.name,
                                inputPrefix: null,
                                _ts: Date.now(),
                              }));
                              textareaRef.current?.focus();
                            }}
                            className="flex items-center gap-2 py-2"
                          >
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-sm overflow-hidden text-sm">
                              {agent.avatar ? (
                                isEmoji(agent.avatar) ? (
                                  <span>{agent.avatar}</span>
                                ) : (
                                  <img
                                    src={agent.avatar}
                                    alt={agent.name}
                                    className="h-full w-full object-cover"
                                  />
                                )
                              ) : (
                                <Bot size={14} />
                              )}
                            </div>
                            <span className="flex-1 truncate">{agent.name}</span>
                          </DropdownMenuItem>
                        ))
                      : !isLoading && (
                          <DropdownMenuItem
                            onSelect={() => {
                              setChatMetadata((prev: any) => ({
                                ...prev,
                                selectedAgent: "项目经理",
                                inputPrefix: null,
                                _ts: Date.now(),
                              }));
                              textareaRef.current?.focus();
                            }}
                          >
                            项目经理
                          </DropdownMenuItem>
                        )}

                    <div className="border-t mt-1 pt-1">
                      <DropdownMenuItem
                        className="text-white bg-primary hover:bg-primary/90 focus:bg-primary/90 focus:text-white mt-1 font-medium transition-colors cursor-pointer"
                        onSelect={() => {
                          setArtifact((prev: any) => ({
                            ...prev,
                            isVisible: true,
                            kind: "agent",
                            documentId: "new-agent",
                            title: "创建智能体",
                            content: JSON.stringify({
                              name: "",
                              prompt: "",
                              isCallableByOthers: false,
                              selectedTools: [],
                            }),
                          }));

                          // Use setTimeout to ensure artifact update is processed before metadata
                          setTimeout(() => {
                            setChatMetadata((prev: any) => ({
                              ...prev,
                              inputPrefix: "# 创建智能体",
                              isCreatingAgent: true,
                              _ts: Date.now(),
                            }));
                            textareaRef.current?.focus();
                          }, 0);
                        }}
                      >
                        + 创建新智能体
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu open={isHashMenuOpen} onOpenChange={setIsHashMenuOpen}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-slate-500 hover:text-[#19be6b] hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                        >
                          <HashIcon size={14} />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="top">输入 “#”选择上下文</TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent align="start" className="w-56 max-h-[300px] overflow-y-auto">
                    {isLoading && requirements.length === 0 && tasks.length === 0 && (
                      <div className="px-2 py-4 text-xs text-center text-muted-foreground">
                        加载中...
                      </div>
                    )}
                    {requirements.length > 0 && (
                      <>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          需求
                        </div>
                        {requirements.map((req: any) => (
                          <DropdownMenuItem
                            key={req.id}
                            onSelect={() => {
                              setChatMetadata((prev: any) => ({
                                ...prev,
                                inputPrefix: `#${req.title}`,
                                _ts: Date.now(),
                              }));
                              textareaRef.current?.focus();
                            }}
                          >
                            #{req.title}
                          </DropdownMenuItem>
                        ))}
                      </>
                    )}

                    {tasks.length > 0 && (
                      <>
                        <div
                          className={cn(
                            "px-2 py-1.5 text-xs font-semibold text-muted-foreground",
                            requirements.length > 0 && "border-t",
                          )}
                        >
                          任务
                        </div>
                        {tasks.map((task: any) => (
                          <DropdownMenuItem
                            key={task.id}
                            onSelect={() => {
                              setChatMetadata((prev: any) => ({
                                ...prev,
                                inputPrefix: `#${task.title}`,
                                _ts: Date.now(),
                              }));
                              textareaRef.current?.focus();
                            }}
                          >
                            #{task.title}
                          </DropdownMenuItem>
                        ))}
                      </>
                    )}

                    {!isLoading && requirements.length === 0 && tasks.length === 0 && (
                      <div className="px-2 py-4 text-xs text-center text-muted-foreground">
                        暂无可用上下文
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipProvider>

              <ModelSelectorCompact
                onModelChange={onModelChange}
                selectedModelId={selectedModelId}
              />
            </PromptInputTools>

            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-8 w-8 rounded-lg pointer-events-auto text-slate-500 hover:text-[#19be6b] hover:bg-emerald-50 dark:hover:bg-emerald-900/20",
                        isOptimizing && "animate-pulse text-[#19be6b]",
                      )}
                      onClick={handleOptimizePrompt}
                      disabled={isOptimizing}
                    >
                      <SparklesIcon size={14} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">优化提示词</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {status === "submitted" ? (
                <StopButton setMessages={setMessages} stop={stop} />
              ) : (
                <PromptInputSubmit
                  className="size-8 rounded-full bg-[#19be6b] text-white transition-colors duration-200 hover:bg-[#19be6b]/90 disabled:bg-muted disabled:text-muted-foreground"
                  data-testid="send-button"
                  disabled={!input.trim() || uploadQueue.length > 0}
                  status={status}
                >
                  <ArrowUpIcon size={14} />
                </PromptInputSubmit>
              )}
            </div>
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
}

export const MultimodalInput = PureMultimodalInput;

function PureAttachmentsButton({
  fileInputRef,
  status,
  selectedModelId,
}: {
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
  status: UseChatHelpers<ChatMessage>["status"];
  selectedModelId: string;
}) {
  const selectedModel = useMemo(
    () => chatModels.find((m) => m.id === selectedModelId),
    [selectedModelId],
  );
  const isReasoningModel = selectedModelId.includes("reasoning");

  // 允许在就绪状态下上传。如果以后需要根据特定模型限制，可以在这里扩展。
  // 目前确保在思考模式下也能看到并使用附件按钮
  const canUpload = status === "ready";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className={cn(
              "aspect-square h-8 rounded-lg p-1 transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-500 hover:text-[#19be6b]",
              isReasoningModel &&
                "text-purple-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20",
            )}
            data-testid="attachments-button"
            disabled={!canUpload}
            onClick={(event) => {
              event.preventDefault();
              fileInputRef.current?.click();
            }}
            variant="ghost"
          >
            <PaperclipIcon size={14} style={{ width: 14, height: 14 }} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          {isReasoningModel ? "上传附件 (思考模式)" : "上传附件"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

const AttachmentsButton = memo(PureAttachmentsButton);

function PureModelSelectorCompact({
  selectedModelId,
  onModelChange,
}: {
  selectedModelId: string;
  onModelChange?: (modelId: string) => void;
}) {
  const [optimisticModelId, setOptimisticModelId] = useState(selectedModelId);

  useEffect(() => {
    setOptimisticModelId(selectedModelId);
  }, [selectedModelId]);

  const selectedModel = chatModels.find((model) => model.id === optimisticModelId);

  return (
    <PromptInputModelSelect
      onValueChange={(modelName) => {
        const model = chatModels.find((m) => m.name === modelName);
        if (model) {
          setOptimisticModelId(model.id);
          onModelChange?.(model.id);
        }
      }}
      value={selectedModel?.name}
    >
      <Trigger asChild>
        <Button
          className="h-8 px-2 text-slate-500 hover:text-[#19be6b] hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
          variant="ghost"
        >
          <span className="hidden font-medium text-xs sm:block">{selectedModel?.name}</span>
          <ChevronDownIcon size={16} />
        </Button>
      </Trigger>
      <PromptInputModelSelectContent className="min-w-[260px] p-0">
        <div className="flex flex-col gap-px">
          {chatModels.map((model) => (
            <SelectItem key={model.id} value={model.name}>
              <div className="truncate font-medium text-xs">{model.name}</div>
              <div className="mt-px truncate text-[10px] text-muted-foreground leading-tight">
                {model.description}
              </div>
            </SelectItem>
          ))}
        </div>
      </PromptInputModelSelectContent>
    </PromptInputModelSelect>
  );
}

const ModelSelectorCompact = memo(PureModelSelectorCompact);

function PureStopButton({
  stop,
  setMessages,
}: {
  stop: () => void;
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
}) {
  return (
    <Button
      className="size-7 rounded-full bg-foreground p-1 text-background transition-colors duration-200 hover:bg-foreground/90 disabled:bg-muted disabled:text-muted-foreground"
      data-testid="stop-button"
      onClick={(event) => {
        event.preventDefault();
        stop();
        setMessages((messages) => messages);
      }}
    >
      <StopIcon size={14} />
    </Button>
  );
}

const StopButton = memo(PureStopButton);
