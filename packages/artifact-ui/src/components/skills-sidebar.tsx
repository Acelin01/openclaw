"use client";

import { useQuery } from "@tanstack/react-query";
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from "@uxin/ui";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Brain,
  ChevronRight,
  Circle,
  Database,
  Layout,
  LineChart,
  ListChecks,
  Play,
  Sparkles,
  Workflow,
  X,
  Briefcase,
  ExternalLink,
  ChevronDown,
  FileText,
  Search,
  Globe,
  Tag,
  CalendarDays,
  ListTodo,
  Rocket,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useArtifact } from "../hooks/use-artifact";
import { constructApiUrl } from "../lib/api";
import { ArtifactKind } from "../lib/types";
import { cn } from "../lib/utils";
import { fetcher } from "../lib/utils";

// Define internal types to avoid external dependencies where possible
interface Project {
  id: string;
  name: string;
  description?: string;
  [key: string]: any;
}

interface SkillsSidebarProps {
  isVisible: boolean;
  onClose: () => void;
  token?: string;
  projects?: Project[];
  isProjectsLoading?: boolean;
  onAnalyzeProject?: (project: Project) => void;
  onViewDocument?: (doc: any) => void;
  artifactKinds?: string[];
}

export function SkillsSidebar({
  isVisible,
  onClose,
  token,
  projects = [],
  isProjectsLoading = false,
  onAnalyzeProject,
  onViewDocument,
  artifactKinds = [],
}: SkillsSidebarProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"projects" | "documents" | "tools">("projects");
  const [selectedKind, setSelectedKind] = useState<ArtifactKind | "all">("all");
  const [previewDoc, setPreviewDoc] = useState<any>(null);
  const [projectSearch, setProjectSearch] = useState("");
  const [toolSearch, setToolSearch] = useState("");
  const { setArtifact } = useArtifact();

  const { data: mcpTools, isLoading: isToolsLoading } = useQuery({
    queryKey: ["mcp-tools", token],
    queryFn: async () => {
      const url = constructApiUrl("/api/v1/mcp-tools", { limit: "100" });
      const res: any = await fetcher([url.toString(), token ?? ""]);
      return res.data as any[];
    },
    enabled: isVisible && activeTab === "tools",
  });

  const { data: documents, isLoading: isDocsLoading } = useQuery({
    queryKey: ["documents", selectedKind, token],
    queryFn: async () => {
      const url = constructApiUrl("/api/v1/documents", {
        ...(selectedKind !== "all" ? { kind: selectedKind } : {}),
      });
      const res: any = await fetcher([url.toString(), token ?? ""]);
      return res.data as any[];
    },
    enabled: isVisible && activeTab === "documents" && !!token,
  });

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    if (!projectSearch) return projects;
    const lowerSearch = projectSearch.toLowerCase();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerSearch) ||
        (p.description && p.description.toLowerCase().includes(lowerSearch)),
    );
  }, [projects, projectSearch]);

  const filteredTools = useMemo(() => {
    if (!mcpTools || !Array.isArray(mcpTools)) return [];

    // 只保留顶层工具 (不是任何其他工具的子工具)
    const topLevelTools = mcpTools.filter(
      (t) => !t.mcp_tools_B || (Array.isArray(t.mcp_tools_B) && t.mcp_tools_B.length === 0),
    );

    if (!toolSearch) return topLevelTools;
    const lowerSearch = toolSearch.toLowerCase();
    return topLevelTools.filter(
      (t) =>
        t.name.toLowerCase().includes(lowerSearch) ||
        (t.description && t.description.toLowerCase().includes(lowerSearch)),
    );
  }, [mcpTools, toolSearch]);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/20 md:hidden"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-50 flex h-dvh w-full flex-col border-l bg-background shadow-xl md:w-[380px]"
          >
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-lg font-bold text-foreground">AI 技能与资源</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-full"
              >
                <X size={18} />
              </Button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b px-6">
              <Button
                variant="ghost"
                onClick={() => setActiveTab("projects")}
                className={cn(
                  "flex-1 py-3 h-auto text-sm font-medium transition-colors border-b-2 rounded-none",
                  activeTab === "projects"
                    ? "border-[#19be6b] text-[#19be6b] hover:bg-transparent"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-transparent",
                )}
              >
                项目管理
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveTab("documents")}
                className={cn(
                  "flex-1 py-3 h-auto text-sm font-medium transition-colors border-b-2 rounded-none",
                  activeTab === "documents"
                    ? "border-[#19be6b] text-[#19be6b] hover:bg-transparent"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-transparent",
                )}
              >
                文档查询
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveTab("tools")}
                className={cn(
                  "flex-1 py-3 h-auto text-sm font-medium transition-colors border-b-2 rounded-none",
                  activeTab === "tools"
                    ? "border-[#19be6b] text-[#19be6b] hover:bg-transparent"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-transparent",
                )}
              >
                MCP 工具
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              {activeTab === "projects" ? (
                /* 项目列表 */
                <section className="mb-8">
                  <div className="mb-4 space-y-3">
                    <h3 className="text-base font-bold text-foreground flex items-center justify-between">
                      <span>我的项目</span>
                      {isProjectsLoading && (
                        <span className="text-xs font-normal text-slate-400">加载中...</span>
                      )}
                    </h3>

                    {/* Project Search */}
                    <div className="relative">
                      <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="text"
                        placeholder="搜索项目..."
                        value={projectSearch}
                        onChange={(e) => setProjectSearch(e.target.value)}
                        className="w-full rounded-lg border bg-slate-50/50 py-2 pl-9 pr-4 text-xs focus:border-[#19be6b] focus:bg-white focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {filteredProjects.length > 0 ? (
                      filteredProjects.map((project) => (
                        <div
                          key={project.id}
                          className={cn(
                            "group relative overflow-hidden rounded-xl border p-4 transition-all hover:border-[#19be6b] hover:bg-[#f0fff4]/50 cursor-pointer",
                            selectedProjectId === project.id
                              ? "border-[#19be6b] bg-[#f0fff4]"
                              : "bg-white",
                          )}
                          onClick={() => {
                            setSelectedProjectId(project.id);
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
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  "flex h-8 w-8 items-center justify-center rounded-lg",
                                  selectedProjectId === project.id
                                    ? "bg-[#19be6b] text-white"
                                    : "bg-slate-100 text-slate-500",
                                )}
                              >
                                <Briefcase size={16} />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-slate-700">{project.name}</h4>
                                <p className="text-[10px] text-slate-400 line-clamp-1">
                                  {project.description}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-300 hover:text-[#19be6b]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAnalyzeProject?.(project);
                                }}
                              >
                                <Sparkles size={14} />
                              </Button>
                              <ChevronRight
                                size={16}
                                className={cn(
                                  "text-slate-300 transition-transform",
                                  selectedProjectId === project.id && "text-[#19be6b]",
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-center rounded-xl border border-dashed">
                        <Database size={32} className="text-slate-200 mb-2" />
                        <p className="text-sm text-slate-400">暂无项目信息</p>
                      </div>
                    )}
                  </div>
                </section>
              ) : activeTab === "tools" ? (
                /* MCP 工具列表 */
                <section className="mb-8">
                  <div className="mb-4 space-y-3">
                    <h3 className="text-base font-bold text-foreground flex items-center justify-between">
                      <span>可用工具</span>
                      {isToolsLoading && (
                        <span className="text-xs font-normal text-slate-400">加载中...</span>
                      )}
                    </h3>

                    {/* Tool Search */}
                    <div className="relative">
                      <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="text"
                        placeholder="搜索工具..."
                        value={toolSearch}
                        onChange={(e) => setToolSearch(e.target.value)}
                        className="w-full rounded-lg border bg-slate-50/50 py-2 pl-9 pr-4 text-xs focus:border-[#19be6b] focus:bg-white focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {filteredTools.length > 0 ? (
                      filteredTools.map((tool) => (
                        <div
                          key={tool.id}
                          className="group relative overflow-hidden rounded-xl border p-4 transition-all hover:border-[#19be6b] hover:bg-[#f0fff4]/50 bg-white"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[#19be6b]">
                              {tool.avatar ? (
                                <span className="text-xl">{tool.avatar}</span>
                              ) : (
                                <Zap size={20} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="text-sm font-bold text-slate-700 truncate">
                                  {tool.name}
                                </h4>
                                {tool.isBuiltIn && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">
                                    内置
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 line-clamp-2 mb-2 leading-relaxed">
                                {tool.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-center rounded-xl border border-dashed">
                        <Zap size={32} className="text-slate-200 mb-2" />
                        <p className="text-sm text-slate-400">暂无工具信息</p>
                      </div>
                    )}
                  </div>
                </section>
              ) : (
                /* 文档查询 */
                <section className="mb-8">
                  <div className="mb-4 space-y-3">
                    <h3 className="text-base font-bold text-foreground flex items-center justify-between">
                      <span>文档库</span>
                      {isDocsLoading && (
                        <span className="text-xs font-normal text-slate-400">加载中...</span>
                      )}
                    </h3>

                    {/* Filter Kind */}
                    <div className="flex flex-wrap gap-1.5">
                      <Button
                        variant="ghost"
                        onClick={() => setSelectedKind("all")}
                        className={cn(
                          "rounded-full px-2.5 py-1 h-auto text-[10px] font-medium transition-colors",
                          selectedKind === "all"
                            ? "bg-[#19be6b] text-white hover:bg-[#18b566]"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                        )}
                      >
                        全部
                      </Button>
                      {artifactKinds.map((kind) => (
                        <Button
                          key={kind}
                          variant="ghost"
                          onClick={() => setSelectedKind(kind as ArtifactKind)}
                          className={cn(
                            "rounded-full px-2.5 py-1 h-auto text-[10px] font-medium transition-colors capitalize",
                            selectedKind === kind
                              ? "bg-[#19be6b] text-white hover:bg-[#18b566]"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                          )}
                        >
                          {kind}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {documents && Array.isArray(documents) && documents.length > 0 ? (
                      documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="group flex items-center justify-between rounded-xl border bg-white p-3 transition-all hover:border-[#19be6b] hover:bg-[#f0fff4]/30 cursor-pointer"
                          onClick={() => setPreviewDoc(doc)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-400 group-hover:bg-[#f0fff4] group-hover:text-[#19be6b]">
                              <FileText size={18} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-700 line-clamp-1">
                                {doc.title}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-medium text-slate-400 uppercase">
                                  {doc.kind}
                                </span>
                                <span className="text-[10px] text-slate-300">•</span>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(doc.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-300 hover:text-[#19be6b]"
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewDocument?.(doc);
                            }}
                          >
                            <ExternalLink size={14} />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-center rounded-xl border border-dashed">
                        <Search size={32} className="text-slate-200 mb-2" />
                        <p className="text-sm text-slate-400">未找到相关文档</p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* 文档详情预览弹窗 */}
              <Dialog
                open={!!previewDoc}
                onOpenChange={(open: boolean) => !open && setPreviewDoc(null)}
              >
                <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0">
                  <DialogHeader className="px-6 py-4 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0fff4] text-[#19be6b]">
                          <FileText size={18} />
                        </div>
                        <DialogTitle className="text-lg font-bold">{previewDoc?.title}</DialogTitle>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase text-slate-500">
                        {previewDoc?.kind}
                      </span>
                    </div>
                  </DialogHeader>
                  <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                    <div className="prose prose-sm max-w-none">
                      {previewDoc?.content ? (
                        <div className="whitespace-pre-wrap text-sm text-slate-600 leading-relaxed">
                          {previewDoc.content}
                        </div>
                      ) : (
                        <p className="text-slate-400 italic">暂无内容</p>
                      )}
                    </div>
                  </div>
                  <div className="px-6 py-4 border-t bg-white flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setPreviewDoc(null)}>
                      关闭
                    </Button>
                    <Button
                      className="bg-[#19be6b] hover:bg-[#18b566]"
                      onClick={() => {
                        onViewDocument?.(previewDoc);
                        setPreviewDoc(null);
                      }}
                    >
                      在编辑器中打开
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* AI技能介绍 */}
              <section className="mb-8">
                <h3 className="mb-4 border-b pb-2 text-base font-bold text-foreground">
                  AI 技能介绍
                </h3>

                <div className="space-y-5">
                  <div className="skill-category">
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Brain size={16} className="text-[#19be6b]" />
                      推理与规划
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="flex items-center gap-1.5 rounded-full bg-[#f0fff4] px-3 py-1.5 text-xs font-medium text-[#19be6b]">
                        逻辑推理
                      </span>
                      <span className="flex items-center gap-1.5 rounded-full bg-[#f0fff4] px-3 py-1.5 text-xs font-medium text-[#19be6b]">
                        多步规划
                      </span>
                      <span className="flex items-center gap-1.5 rounded-full bg-[#f0fff4] px-3 py-1.5 text-xs font-medium text-[#19be6b]">
                        自适应策略
                      </span>
                    </div>
                  </div>

                  <div className="skill-category">
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Layout size={16} className="text-[#2d8cf0]" />
                      界面与开发
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="flex items-center gap-1.5 rounded-full bg-[#f0f9ff] px-3 py-1.5 text-xs font-medium text-[#2d8cf0]">
                        React 组件
                      </span>
                      <span className="flex items-center gap-1.5 rounded-full bg-[#f0f9ff] px-3 py-1.5 text-xs font-medium text-[#2d8cf0]">
                        Tailwind CSS
                      </span>
                      <span className="flex items-center gap-1.5 rounded-full bg-[#f0f9ff] px-3 py-1.5 text-xs font-medium text-[#2d8cf0]">
                        TypeScript
                      </span>
                    </div>
                  </div>

                  <div className="skill-category">
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Database size={16} className="text-[#13c2c2]" />
                      数据处理
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="flex items-center gap-1.5 rounded-full bg-[#e6f7ff] px-3 py-1.5 text-xs font-medium text-[#13c2c2]">
                        Prisma ORM
                      </span>
                      <span className="flex items-center gap-1.5 rounded-full bg-[#e6f7ff] px-3 py-1.5 text-xs font-medium text-[#13c2c2]">
                        SQL 查询
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* 操作流程 */}
              <section className="mb-8">
                <h3 className="mb-4 border-b pb-2 text-base font-bold text-foreground">操作流程</h3>
                <div className="space-y-4">
                  {[
                    { title: "理解需求", desc: "深度分析用户指令，识别核心业务逻辑" },
                    { title: "架构设计", desc: "设计组件结构、数据流及API接口规范" },
                    { title: "代码实现", desc: "编写高质量、可维护的代码实现功能" },
                    { title: "验证与优化", desc: "进行功能测试，并针对性能与交互进行调优" },
                  ].map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">
                        {i + 1}
                      </div>
                      <div className="space-y-1">
                        <h5 className="text-xs font-bold text-slate-700">{step.title}</h5>
                        <p className="text-[10px] leading-relaxed text-slate-400">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
