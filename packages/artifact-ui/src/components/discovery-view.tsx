"use client";

import { AgentCard, AIAppCard } from "@uxin/agent-lib";
import { MCPToolCard } from "@uxin/mcp";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Input,
  Button,
  Avatar,
  AvatarFallback,
  AvatarImage,
  cn,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  useSidebar,
} from "@uxin/ui";
import { ResumePreview } from "@uxin/worker-service";
import {
  Search,
  Plus,
  Paperclip,
  History,
  Wand2,
  Mic,
  ArrowUp,
  Loader2,
  CheckCircle,
  Star,
} from "lucide-react";
import { useState, useMemo, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useChatResources } from "../hooks/use-chat-resources";
import { ArtifactDocument } from "../lib/types";
import { parseStructuredContent } from "../lib/utils";
import { SidebarLeftIcon } from "./icons";
import { Mermaid } from "./mermaid";
import { TaskList } from "./task-list";
import { Weather } from "./weather";

interface DiscoveryViewProps {
  token?: string;
  onDocumentClick: (doc: ArtifactDocument) => void | Promise<void>;
  onAgentClick: (agent: any) => void;
  onToolClick: (tool: any) => void;
  onGenerationSubmit: (input: string) => void;
  onNewChat?: () => void;
  isInitial?: boolean;
  hideInput?: boolean;
}

export function DiscoveryView({
  token,
  onDocumentClick,
  onAgentClick,
  onToolClick,
  onGenerationSubmit,
  onNewChat,
  isInitial = true,
  hideInput = false,
}: DiscoveryViewProps) {
  const isEmoji = (str: string | null | undefined) => {
    if (!str) return false;
    return /\p{Emoji}/u.test(str) && str.length <= 8;
  };

  const [activeTab, setActiveTab] = useState("discovery");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [generationInput, setGenerationInput] = useState("");
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);
  const { toggleSidebar } = useSidebar();

  // 监听滚动逻辑，处理吸顶合并
  useEffect(() => {
    const handleScroll = () => {
      if (!tabsRef.current) return;
      const rect = tabsRef.current.getBoundingClientRect();
      // 当 Tabs 容器到达顶部（或 Header 下方）时开启吸顶
      // 使用 5px 的缓冲区，只有当 rect.top 小于 0 时才认为是 sticky
      // 并且只有当 rect.top 明显大于 5 时才取消 sticky，防止在 0 附近抖动
      setIsSticky((prev) => {
        if (!prev && rect.top <= 0) return true;
        if (prev && rect.top > 5) return false;
        return prev;
      });
    };

    // 监听捕获阶段的滚动事件，以捕捉嵌套滚动容器的滚动
    // 同时监听 window 和可能存在父容器的滚动
    window.addEventListener("scroll", handleScroll, true);

    // 检查是否有父滚动容器
    const scrollParent = tabsRef.current?.parentElement;
    if (scrollParent) {
      scrollParent.addEventListener("scroll", handleScroll, true);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      if (scrollParent) {
        scrollParent.removeEventListener("scroll", handleScroll, true);
      }
    };
  }, []);

  const CombinedToggleNewButton = () => {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 px-2 flex items-center gap-1 hover:bg-black/5 rounded-xl border border-slate-200/50 shadow-sm bg-white/50"
            onClick={() => {
              toggleSidebar();
            }}
          >
            <div className="flex items-center gap-1">
              <SidebarLeftIcon size={14} className="text-slate-500" />
            </div>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="start">
          <p>展开侧边栏</p>
        </TooltipContent>
      </Tooltip>
    );
  };

  const {
    agentsData,
    appsData,
    toolsData,
    publicDocsData,
    isLoading,
    fetchNextAgents,
    hasNextAgents,
    isFetchingNextAgents,
    fetchNextApps,
    hasNextApps,
    isFetchingNextApps,
    fetchNextTools,
    hasNextTools,
    isFetchingNextTools,
    fetchNextPublic,
    hasNextPublic,
    isFetchingNextPublic,
  } = useChatResources(token);

  // Flatten pagination data
  const agents = useMemo(() => agentsData?.pages.flat() || [], [agentsData]);
  const tools = useMemo(() => toolsData?.pages.flat() || [], [toolsData]);
  const apps = useMemo(() => appsData?.pages.flat() || [], [appsData]);
  const publicDocuments = useMemo(() => publicDocsData?.pages.flat() || [], [publicDocsData]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if (activeTab === "discovery" && hasNextPublic && !isFetchingNextPublic) {
            fetchNextPublic();
          } else if (activeTab === "agents" && hasNextAgents && !isFetchingNextAgents) {
            fetchNextAgents();
          } else if (
            activeTab === "tools" &&
            (hasNextTools || hasNextApps) &&
            !isFetchingNextTools &&
            !isFetchingNextApps
          ) {
            if (hasNextApps) fetchNextApps();
            if (hasNextTools) fetchNextTools();
          }
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [
    activeTab,
    hasNextPublic,
    isFetchingNextPublic,
    fetchNextPublic,
    hasNextAgents,
    isFetchingNextAgents,
    fetchNextAgents,
    hasNextTools,
    isFetchingNextTools,
    fetchNextTools,
    hasNextApps,
    isFetchingNextApps,
    fetchNextApps,
  ]);

  const filteredDiscovery = useMemo(() => {
    let filtered = publicDocuments || [];
    if (searchQuery) {
      filtered = filtered.filter(
        (doc) =>
          doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.content?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    if (filterType !== "all") {
      filtered = filtered.filter((doc) => doc.kind === filterType);
    }
    return filtered;
  }, [publicDocuments, searchQuery, filterType]);

  const filteredAgents = useMemo(() => {
    let filtered = agents || [];
    if (searchQuery) {
      filtered = filtered.filter(
        (agent) =>
          agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          agent.prompt?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    return filtered;
  }, [agents, searchQuery]);

  const filteredTools = useMemo(() => {
    const combined = [
      ...(apps?.map((app) => ({ ...app, type: "app" })) || []),
      ...(tools?.map((tool) => ({ ...tool, type: "tool" })) || []),
    ];
    let filtered = combined;
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item as any).description?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    if (filterType !== "all") {
      filtered = filtered.filter((item) => (item as any).type === filterType);
    }
    return filtered;
  }, [apps, tools, searchQuery, filterType]);

  const handleGenerationSubmit = () => {
    if (!generationInput.trim()) return;
    onGenerationSubmit(generationInput.trim());
  };

  const isTransitioning = !isInitial;

  return (
    <div
      className={cn(
        "container mx-auto px-5 max-w-7xl transition-all duration-1000 ease-in-out",
        isTransitioning ? "translate-y-[20vh] opacity-0 pointer-events-none" : "py-10",
      )}
    >
      {/* 预留高度的占位符，防止 sticky 切换时页面抖动 */}
      {isSticky && <div className="h-[60px] invisible pointer-events-none" aria-hidden="true" />}

      {!isTransitioning && (
        <div className="text-center mb-12 transition-all duration-500">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-emerald-500 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-500/20">
              UX
            </div>
            <h1 className="text-[42px] font-bold tracking-tight bg-gradient-to-r from-[#667eea] via-[#764ba2] to-[#f093fb] bg-clip-text text-transparent leading-tight">
              uxin.top
            </h1>
          </div>
          <p className="text-[#64748b] text-[18px]">发布需求，AI让服务触手可及</p>
        </div>
      )}

      {!isTransitioning && !hideInput && (
        <div className="max-w-3xl mx-auto mb-16 transition-all duration-500">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 rounded-[24px] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-white rounded-2xl border border-[#e5e5e5] shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-4 px-5 pb-3 transition-all duration-300 group-focus-within:shadow-[0_8px_24px_rgba(0,0,0,0.08)] group-focus-within:border-indigo-500/20">
              <textarea
                rows={1}
                value={generationInput}
                onChange={(e) => setGenerationInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleGenerationSubmit();
                  }
                }}
                placeholder="发布需求，AI让服务触手可及"
                className="w-full resize-none border-0 bg-transparent p-1 text-[16px] font-medium leading-relaxed outline-none ring-0 placeholder:text-slate-300 min-h-[44px]"
              />

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#f0f0f0]">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 rounded-full bg-[#f8f8f8] border border-[#e5e5e5] text-[#555] hover:bg-[#f0f0f0] transition-all font-medium px-3 text-[13px]"
                    onClick={() => toast.info("附件功能请在对话页使用")}
                  >
                    <Paperclip size={14} strokeWidth={2} />
                    <span>附件</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 rounded-full bg-[#f8f8f8] border border-[#e5e5e5] text-[#555] hover:bg-[#f0f0f0] transition-all font-medium px-3 text-[13px]"
                    onClick={() => toast.info("上下文功能请在对话页使用")}
                  >
                    <History size={14} strokeWidth={2} />
                    <span>上下文</span>
                  </Button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
                      onClick={() => toast.info("提示词优化功能开发中")}
                    >
                      <Paperclip size={16} strokeWidth={2} />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
                    >
                      <Mic size={16} strokeWidth={2} />
                    </Button>
                  </div>

                  <Button
                    size="icon"
                    className={cn(
                      "h-9 w-9 rounded-full transition-all duration-300",
                      generationInput.trim()
                        ? "bg-[#667eea] text-white shadow-[0_4px_12px_rgba(102,126,234,0.3)] hover:bg-[#5a6fd8] hover:scale-105"
                        : "bg-slate-200 text-slate-400 shadow-none cursor-not-allowed",
                    )}
                    onClick={handleGenerationSubmit}
                    disabled={!generationInput.trim()}
                  >
                    <ArrowUp size={18} strokeWidth={3} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v);
          setFilterType("all");
        }}
        className="w-full"
      >
        <div
          ref={tabsRef}
          style={{ top: "-1px" }}
          className={cn(
            "sticky z-30 bg-white/95 backdrop-blur-md -mx-5 px-5 border-b border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-300",
            isSticky ? "py-2 shadow-md" : "pt-6 pb-2",
          )}
        >
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              {/* 吸顶合并时显示的 Logo 和复合按钮 */}
              {isSticky && (
                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-300">
                  <CombinedToggleNewButton />
                </div>
              )}

              <TabsList className="flex items-center gap-10 bg-transparent border-none justify-start h-auto p-0 rounded-none">
                <TabsTrigger
                  value="discovery"
                  className={cn(
                    "px-1 py-3 text-[16px] font-bold text-slate-400 data-[state=active]:text-slate-900 data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 transition-all rounded-none bg-transparent shadow-none",
                    isSticky && "py-2",
                  )}
                >
                  发现
                  {filteredDiscovery.length > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 bg-indigo-500 text-white text-[10px] font-black rounded-full">
                      {filteredDiscovery.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="agents"
                  className={cn(
                    "px-1 py-3 text-[16px] font-bold text-slate-400 data-[state=active]:text-slate-900 data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 transition-all rounded-none bg-transparent shadow-none",
                    isSticky && "py-2",
                  )}
                >
                  智能体
                </TabsTrigger>
                <TabsTrigger
                  value="tools"
                  className={cn(
                    "px-1 py-3 text-[16px] font-bold text-slate-400 data-[state=active]:text-slate-900 data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 transition-all rounded-none bg-transparent shadow-none",
                    isSticky && "py-2",
                  )}
                >
                  工具
                  <span className="ml-1.5 px-1.5 py-0.5 bg-amber-500 text-white text-[10px] font-black rounded-full">
                    NEW
                  </span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex items-center gap-4 flex-1 justify-end">
              <div className="relative w-full max-w-sm group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <Input
                  placeholder="搜索应用、智能体或作品..."
                  className="pl-11 h-10 bg-white/70 border-slate-200/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/40 transition-all text-[14px] font-medium shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button className="h-10 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg transition-all active:scale-95 gap-2 flex-shrink-0">
                <span>服务认证</span>
              </Button>
            </div>
          </div>

          {/* 类型筛选按钮组 - 吸顶时不显示 */}
          {!isSticky && (
            <div className="flex items-center gap-2 pb-4 pt-4 overflow-x-auto scrollbar-none animate-in fade-in slide-in-from-top-2 duration-300">
              <Button
                variant={filterType === "all" ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilterType("all")}
                className={cn(
                  "rounded-full px-4 font-bold h-8 transition-all",
                  filterType === "all"
                    ? "bg-indigo-600 hover:bg-indigo-700 shadow-md"
                    : "text-slate-500 hover:bg-slate-100",
                )}
              >
                所有类别
              </Button>
              {activeTab === "discovery" && (
                <>
                  {[
                    { id: "text", label: "文档作品" },
                    { id: "resume", label: "个人简历" },
                    { id: "weather", label: "天气查询" },
                    { id: "task", label: "任务计划" },
                    { id: "service", label: "服务技能" },
                    { id: "code", label: "代码/图表" },
                    { id: "image", label: "创意画作" },
                  ].map((item) => (
                    <Button
                      key={item.id}
                      variant={filterType === item.id ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setFilterType(item.id)}
                      className={cn(
                        "rounded-full px-4 font-bold h-8 transition-all whitespace-nowrap",
                        filterType === item.id
                          ? "bg-indigo-600 hover:bg-indigo-700 shadow-md"
                          : "text-slate-500 hover:bg-slate-100",
                      )}
                    >
                      {item.label}
                    </Button>
                  ))}
                </>
              )}
              {activeTab === "tools" && (
                <>
                  {[
                    { id: "app", label: "AI 应用" },
                    { id: "tool", label: "MCP 工具" },
                  ].map((item) => (
                    <Button
                      key={item.id}
                      variant={filterType === item.id ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setFilterType(item.id)}
                      className={cn(
                        "rounded-full px-4 font-bold h-8 transition-all whitespace-nowrap",
                        filterType === item.id
                          ? "bg-indigo-600 hover:bg-indigo-700 shadow-md"
                          : "text-slate-500 hover:bg-slate-100",
                      )}
                    >
                      {item.label}
                    </Button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        <TabsContent value="discovery" className="mt-0">
          {isLoading && !publicDocuments.length ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-[3/4] rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : filteredDiscovery && filteredDiscovery.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDiscovery.map((doc: any) => {
                const previewContent = (() => {
                  try {
                    if (
                      doc.kind === "resume" ||
                      doc.kind === "weather" ||
                      doc.kind === "task" ||
                      doc.kind === "service"
                    ) {
                      return parseStructuredContent(doc.content || "{}");
                    }
                    return null;
                  } catch (e) {
                    return null;
                  }
                })();

                const isMermaid =
                  doc.kind === "code" &&
                  (doc.content?.trim().startsWith("graph") ||
                    doc.content?.trim().startsWith("sequenceDiagram") ||
                    doc.content?.trim().startsWith("pie") ||
                    doc.content?.trim().startsWith("gantt") ||
                    doc.content?.trim().startsWith("classDiagram") ||
                    doc.content?.trim().startsWith("stateDiagram") ||
                    doc.content?.trim().startsWith("erDiagram"));

                return doc.kind === "service" ? (
                  <div
                    key={doc.id}
                    className={cn(
                      "group relative bg-white rounded-[20px] overflow-hidden transition-all duration-300",
                      "border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1",
                      "flex flex-col h-full cursor-pointer",
                    )}
                    onClick={() => onDocumentClick(doc)}
                  >
                    {/* Gradient header strip for services */}
                    <div className="h-2 w-full bg-gradient-to-r from-emerald-300 via-emerald-500 to-emerald-700" />

                    <div className="relative h-48 overflow-hidden bg-slate-50">
                      <div className="absolute top-4 right-4 bg-emerald-500 text-white px-2 py-1 rounded text-xs font-bold z-10 shadow-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span> 在线
                      </div>
                      {previewContent?.coverImageUrl ? (
                        <img
                          src={previewContent.coverImageUrl}
                          alt={previewContent.title || doc.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-emerald-50/30">
                          <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600 mb-3 transition-transform duration-500 group-hover:scale-110">
                            <Wand2 size={32} />
                          </div>
                          <span className="text-xs font-bold text-emerald-700/50 uppercase tracking-widest">
                            Service Artifact
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-5 flex-grow flex flex-col">
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-slate-800 line-clamp-2 leading-tight group-hover:text-emerald-600 transition-colors">
                          {previewContent?.title || doc.title}
                        </h3>

                        <div className="flex items-center gap-3 mt-3">
                          <div className="relative shrink-0">
                            <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                              {doc.user?.avatarUrl ? (
                                isEmoji(doc.user.avatarUrl) ? (
                                  <div className="flex items-center justify-center w-full h-full text-xs">
                                    {doc.user.avatarUrl}
                                  </div>
                                ) : (
                                  <AvatarImage src={doc.user.avatarUrl} />
                                )
                              ) : null}
                              <AvatarFallback className="text-xs bg-emerald-50 text-emerald-500 font-bold">
                                {doc.user?.name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                              <CheckCircle className="w-2 h-2 text-white" />
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                              {doc.user?.name || "未知服务商"}
                            </div>
                          </div>
                        </div>

                        <p className="mt-3 text-sm text-slate-500 font-light leading-relaxed line-clamp-2">
                          {previewContent?.description || doc.content?.substring(0, 100)}
                        </p>
                      </div>

                      <div className="mt-auto">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span className="font-bold text-slate-700">
                              {(previewContent?.rating || 5.0).toFixed(1)}
                            </span>
                            <span className="text-slate-400 text-sm">
                              ({previewContent?.reviewCount || 0})
                            </span>
                          </div>
                          {previewContent?.priceAmount && (
                            <div className="text-xl font-bold text-emerald-600">
                              {previewContent.priceCurrency === "USD"
                                ? "$"
                                : previewContent.priceCurrency || "$"}
                              {previewContent.priceAmount.toLocaleString()}
                              {previewContent.unit && (
                                <span className="text-xs font-normal text-slate-400 ml-1">
                                  / {previewContent.unit}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {previewContent?.deliveryTime && (
                            <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-[11px] font-medium">
                              {previewContent.deliveryTime}交付
                            </span>
                          )}
                          {previewContent?.features &&
                            previewContent.features.length > 0 &&
                            previewContent.features.slice(0, 2).map((feature: string) => (
                              <span
                                key={feature}
                                className="text-[11px] bg-slate-50 text-slate-500 px-2.5 py-1 rounded-md"
                              >
                                {feature}
                              </span>
                            ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#f0fdf4] px-5 py-3 border-t border-slate-50 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">立即预约专业服务</span>
                      <button className="px-4 py-1.5 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white text-xs font-medium shadow-sm hover:opacity-90">
                        查看详情
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    key={doc.id}
                    className={cn(
                      "group relative bg-white rounded-[20px] overflow-hidden transition-all duration-300",
                      "border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1",
                      "flex flex-col h-full cursor-pointer",
                    )}
                    onClick={(e) => {
                      onDocumentClick(doc);
                    }}
                  >
                    {/* Gradient header strip */}
                    <div
                      className={cn(
                        "h-2 w-full",
                        doc.kind === "resume"
                          ? "bg-gradient-to-r from-blue-300 via-blue-500 to-blue-700"
                          : doc.kind === "weather"
                            ? "bg-gradient-to-r from-amber-300 via-amber-500 to-amber-700"
                            : doc.kind === "task"
                              ? "bg-gradient-to-r from-purple-300 via-purple-500 to-purple-700"
                              : "bg-gradient-to-r from-indigo-300 via-indigo-500 to-indigo-700",
                      )}
                    />

                    <div className="relative aspect-[16/10] w-full bg-slate-50/50 border-b border-slate-50 overflow-hidden group-hover:bg-white transition-colors">
                      <div className="absolute inset-0 flex items-center justify-center p-4">
                        {doc.kind === "resume" && previewContent ? (
                          <div className="w-[180%] h-[180%] origin-top-left scale-[0.55] pointer-events-none transform-gpu transition-transform duration-500 group-hover:scale-[0.58]">
                            <ResumePreview
                              worker={previewContent}
                              className="shadow-none border-0"
                            />
                          </div>
                        ) : doc.kind === "weather" && previewContent ? (
                          <div className="w-full h-full flex items-center justify-center scale-95 pointer-events-none transition-transform duration-500 group-hover:scale-105">
                            <Weather weatherAtLocation={previewContent} />
                          </div>
                        ) : doc.kind === "task" && previewContent ? (
                          <div className="w-[140%] h-[140%] origin-center scale-[0.7] pointer-events-none transition-transform duration-500 group-hover:scale-[0.75]">
                            <TaskList tasks={previewContent.tasks || []} />
                          </div>
                        ) : isMermaid ? (
                          <div className="w-full h-full flex items-center justify-center p-2 overflow-hidden scale-90 origin-center pointer-events-none transition-transform duration-500 group-hover:scale-100">
                            <Mermaid code={doc.content || ""} />
                          </div>
                        ) : (
                          <div className="text-slate-200 group-hover:text-indigo-100 transition-colors">
                            <Plus size={48} strokeWidth={1} />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className={cn(
                            "px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider",
                            doc.kind === "resume"
                              ? "bg-blue-50 text-blue-600"
                              : doc.kind === "weather"
                                ? "bg-amber-50 text-amber-600"
                                : doc.kind === "task"
                                  ? "bg-purple-50 text-purple-600"
                                  : "bg-slate-100 text-slate-500",
                          )}
                        >
                          {doc.kind}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-1 transition-colors group-hover:text-indigo-600">
                        {doc.title}
                      </h3>
                      <p className="text-slate-500 text-sm font-light leading-relaxed line-clamp-2 mb-4">
                        {doc.content?.substring(0, 100)}
                      </p>
                      <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-6 w-6 border-2 border-white shadow-sm">
                            {doc.user?.avatarUrl ? (
                              isEmoji(doc.user.avatarUrl) ? (
                                <div className="flex items-center justify-center w-full h-full text-[10px]">
                                  {doc.user.avatarUrl}
                                </div>
                              ) : (
                                <AvatarImage src={doc.user.avatarUrl} />
                              )
                            ) : null}
                            <AvatarFallback className="text-[10px] font-bold bg-slate-50 text-slate-400">
                              {doc.user?.name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-[13px] font-medium text-slate-600">
                            {doc.user?.name || "匿名"}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-300">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
              <p className="text-slate-400 font-medium">未找到匹配的内容</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="agents" className="mt-0">
          {isLoading && !agents.length ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-[200px] rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : filteredAgents && filteredAgents.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAgents.map((agent: any) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onSelect={(agent) => {
                    console.log("Agent selected:", agent.id);
                    onAgentClick(agent);
                  }}
                  onClick={(agent) => {
                    console.log("Agent clicked:", agent.id);
                    onAgentClick(agent);
                  }}
                  className="hover:-translate-y-1 transition-transform duration-300"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
              <p className="text-slate-400 font-medium">未找到匹配的智能体</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="tools" className="mt-0">
          {isLoading && !tools.length && !apps.length ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-[150px] rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : filteredTools && filteredTools.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTools.map((item: any) =>
                item.type === "app" ? (
                  <AIAppCard
                    key={item.id}
                    app={item}
                    onClick={(app) => {
                      console.log("App clicked:", app.id);
                      onToolClick(app);
                    }}
                    onAdd={() => toast.success(`已添加 ${item.name}`)}
                  />
                ) : (
                  <MCPToolCard
                    key={item.id}
                    tool={item}
                    onSelect={(tool) => {
                      console.log("Tool selected:", tool.id);
                      onToolClick(tool);
                    }}
                    onClick={(tool) => {
                      console.log("Tool clicked:", tool.id);
                      onToolClick(tool);
                    }}
                  />
                ),
              )}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
              <p className="text-slate-400 font-medium">未找到匹配的工具或应用</p>
            </div>
          )}
        </TabsContent>

        <div ref={loadMoreRef} className="h-20 flex items-center justify-center mt-10">
          {(isFetchingNextPublic ||
            isFetchingNextAgents ||
            isFetchingNextTools ||
            isFetchingNextApps) && (
            <div className="flex items-center gap-2 text-slate-400 font-medium">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
              <span>正在加载更多...</span>
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}
