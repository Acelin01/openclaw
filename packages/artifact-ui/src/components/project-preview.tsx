"use client";

import { ProjectSettings } from "@uxin/projects";
import { Button } from "@uxin/ui";
import {
  Briefcase,
  CalendarDays,
  Globe,
  ListTodo,
  MessageSquare,
  Rocket,
  Sparkles,
  Tag,
  Target,
  Users,
  Zap,
  Workflow,
  Clock,
  ExternalLink,
  User,
  Play,
  Bot,
  Settings,
  Plus,
  Shield,
  Mail,
  Phone,
  MoreHorizontal,
  LineChart,
  Activity,
  Loader2,
  X,
  Check,
  ArrowLeft,
} from "lucide-react";
import { useEffect, useState, useMemo, useRef } from "react";
import { useArtifact, useArtifactSelector } from "../hooks/use-artifact";
import { useChatResources } from "../hooks/use-chat-resources";
import { constructApiUrl, toRelativeApiUrl, ensureAbsoluteApiUrl } from "../lib/api";
import { cn, parseStructuredContent } from "../lib/utils";

const isEmoji = (str: string | null | undefined) => {
  if (!str) return false;
  return /\p{Emoji}/u.test(str) && str.length <= 8;
};

interface ProjectData {
  id?: string;
  name?: string;
  title?: string;
  description?: string;
  status?: string;
  progress?: number;
  memberCount?: number;
  budget?: string;
  budgetMin?: number;
  dueDate?: string;
  isAgentActive?: boolean;
  role?: string;
  team?: Array<{
    id: string;
    name: string;
    avatar?: string;
    role?: string;
    type?: "freelancer" | "employee";
    email?: string;
    phone?: string;
  }>;
  requirements?: Array<{
    id: string;
    title: string;
    description: string;
    priority: string;
  }>;
  feedbacks?: Array<{
    id: string;
    content: string;
    authorName: string;
    createdAt: string;
  }>;
  tasks?: Array<{
    id: string;
    title: string;
    status: string;
    priority?: string;
    assigneeName?: string;
    isSplit?: boolean;
  }>;
  history?: Array<{
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    creatorName?: string;
    agentName?: string;
  }>;
  relatedDocuments?: Array<{
    id: string;
    title: string;
    kind: string;
    status?: "creating" | "pending_review" | "ready";
    messageId?: string;
  }>;
  isAdminEnabled?: boolean;
  adminConfigs?: Array<{
    id: string;
    name: string;
    url: string;
    schema?: any;
    status?: "pending" | "ready" | "error";
    token?: string;
  }>;
  agents?: Array<{
    id: string;
    name: string;
    avatar?: string;
    description?: string;
    model?: string;
  }>;
}

// Simple Switch component
const Switch = ({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) => (
  <Button
    variant="ghost"
    onClick={(e) => {
      e.stopPropagation();
      onCheckedChange(!checked);
    }}
    className={cn(
      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#19be6b] focus-visible:ring-offset-2 p-0 border-none",
      checked ? "bg-[#19be6b] hover:bg-[#19be6b]/90" : "bg-slate-200 hover:bg-slate-300",
    )}
  >
    <span
      className={cn(
        "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform",
        checked ? "translate-x-4" : "translate-x-1",
      )}
    />
  </Button>
);

/**
 * 成员卡片组件
 */
const MemberCard = ({
  member,
  onMessage,
  onDetails,
}: {
  member: any;
  onMessage?: (m: any) => void;
  onDetails?: (m: any) => void;
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 hover:shadow-md transition-all group">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-bold border-2 border-white shadow-sm overflow-hidden">
          {member.avatar ? (
            isEmoji(member.avatar) ? (
              <span className="text-xl">{member.avatar}</span>
            ) : (
              <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
            )
          ) : member.name ? (
            member.name[0]
          ) : (
            "?"
          )}
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-800">{member.name || "未命名"}</h4>
          <div className="flex items-center gap-1 mt-0.5">
            <Shield className="w-3 h-3 text-[#19be6b]" />
            <span className="text-[10px] text-[#19be6b] font-medium">
              {member.role || (member.type === "freelancer" ? "外部专家" : "成员")}
            </span>
          </div>
        </div>
      </div>
      <Button
        variant="ghost"
        className="h-8 w-8 p-0 text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-lg transition-all"
      >
        <MoreHorizontal className="w-4 h-4" />
      </Button>
    </div>

    <div className="space-y-1.5 mb-4 h-10">
      {member.email && (
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <Mail className="w-3 h-3" />
          <span className="truncate">{member.email}</span>
        </div>
      )}
      {member.phone && (
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <Phone className="w-3 h-3" />
          <span>{member.phone}</span>
        </div>
      )}
      {!member.email && !member.phone && (
        <div className="text-[10px] text-slate-300 italic">暂无联系方式</div>
      )}
    </div>

    <div className="flex items-center gap-2 pt-3 border-t border-slate-50">
      <Button
        variant="ghost"
        onClick={() => onMessage?.(member)}
        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold hover:bg-emerald-100 transition-all active:scale-95 border-none h-auto"
      >
        <MessageSquare className="w-3 h-3" />
        <span>消息</span>
      </Button>
      <Button
        variant="ghost"
        onClick={() => onDetails?.(member)}
        className="px-3 py-1.5 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-bold hover:bg-slate-100 transition-all active:scale-95 border-none h-auto"
      >
        详情
      </Button>
    </div>
  </div>
);

/**
 * 工作流步骤组件
 */
const WorkflowStep = ({ label, role }: { label: string; role: string }) => (
  <div className="flex flex-col items-center gap-1.5 shrink-0">
    <div className="px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700 text-[10px] font-medium text-white">
      {label}
    </div>
    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">{role}</span>
  </div>
);

/**
 * 工作流箭头组件
 */
const WorkflowArrow = () => <div className="h-px w-6 bg-slate-700 shrink-0" />;

/**
 * 智能体配置弹窗
 */
const AgentConfigModal = ({
  isOpen,
  onClose,
  availableAgents,
  selectedAgentIds: initialSelectedIds,
  onSave,
  isUpdating,
}: {
  isOpen: boolean;
  onClose: () => void;
  availableAgents: any[];
  selectedAgentIds: string[];
  onSave: (ids: string[]) => void;
  isUpdating?: boolean;
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);

  useEffect(() => {
    if (isOpen) {
      setSelectedIds(initialSelectedIds);
    }
  }, [isOpen, initialSelectedIds]);

  if (!isOpen) return null;

  const toggleAgent = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
        <div className="px-6 py-4 border-b flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Bot className="text-[#19be6b]" size={20} />
              配置项目智能体
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">选择要关联到此项目的智能体角色</p>
          </div>
          <Button
            variant="ghost"
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 h-9 w-9 border-none"
          >
            <X size={20} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {availableAgents.length > 0 ? (
            availableAgents.map((agent) => (
              <div
                key={agent.id}
                onClick={() => toggleAgent(agent.id)}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer group",
                  selectedIds.includes(agent.id)
                    ? "border-[#19be6b] bg-[#f0fff4]"
                    : "border-slate-100 hover:border-slate-200 bg-white",
                )}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center shadow-sm overflow-hidden",
                      selectedIds.includes(agent.id) ? "bg-white" : "bg-slate-50",
                    )}
                  >
                    {agent.avatar ? (
                      isEmoji(agent.avatar) ? (
                        <span className="text-2xl">{agent.avatar}</span>
                      ) : (
                        <img
                          src={agent.avatar}
                          alt={agent.name}
                          className="h-full w-full object-cover"
                        />
                      )
                    ) : (
                      <Bot
                        size={24}
                        className={
                          selectedIds.includes(agent.id) ? "text-[#19be6b]" : "text-slate-300"
                        }
                      />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{agent.name}</h4>
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                      {agent.description || "无描述"}
                    </p>
                  </div>
                </div>
                <div
                  className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                    selectedIds.includes(agent.id)
                      ? "bg-[#19be6b] border-[#19be6b] text-white"
                      : "border-slate-200 group-hover:border-slate-300",
                  )}
                >
                  {selectedIds.includes(agent.id) && <Check size={14} strokeWidth={3} />}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
              <Bot size={40} className="mx-auto text-slate-200 mb-3" />
              <p className="text-sm text-slate-400">暂无可用智能体</p>
              <Button
                variant="link"
                className="text-xs text-[#19be6b] font-bold mt-2 hover:underline p-0 h-auto"
              >
                去创建智能体
              </Button>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">
            已选择 <span className="text-[#19be6b]">{selectedIds.length}</span> 个智能体
          </span>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors border-none h-auto"
            >
              取消
            </Button>
            <Button
              onClick={() => onSave(selectedIds)}
              disabled={isUpdating}
              className={cn(
                "px-6 py-2 bg-[#19be6b] text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 flex items-center gap-2 border-none h-auto",
                isUpdating ? "opacity-70 cursor-not-allowed" : "hover:bg-[#15a35c]",
              )}
            >
              {isUpdating && <Loader2 size={14} className="animate-spin" />}
              {isUpdating ? "保存中..." : "保存配置"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ProjectPreviewProps {
  content: string;
  token?: string;
  onSaveContent?: (content: string, debounce: boolean) => void;
  sendMessage?: (message: any) => void;
}

export function ProjectPreview({
  content,
  token,
  onSaveContent,
  sendMessage,
}: ProjectPreviewProps) {
  const [data, setData] = useState<ProjectData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const { setArtifact } = useArtifact();
  const artifact = useArtifactSelector((s) => s);
  const lastFetchedId = useRef<string | null>(null);
  const lastParsedContent = useRef<string | null>(null);

  // 获取项目关联的智能体
  const projectAgentsData = data?.agents || [];

  // 重新获取通讯录智能体
  const chatResources = useChatResources(token || "");
  const myAgents = (chatResources as any).agents || [];

  // 最终显示的智能体：项目关联的智能体 且 当前用户有权使用的（在 myAgents 中）
  const projectAgents = useMemo(() => {
    if (projectAgentsData.length === 0) return [];
    if (myAgents.length === 0) return [];

    return projectAgentsData.filter((pa: any) => myAgents.some((ma: any) => ma.id === pa.id));
  }, [projectAgentsData, myAgents]);

  const handleToggleAgent = (active: boolean) => {
    if (!data) return;
    const newData = { ...data, isAgentActive: active };
    setData(newData);
    if (onSaveContent) {
      onSaveContent(JSON.stringify(newData, null, 2), false);
    }

    // Trigger auto-execution logic if enabled
    if (active && sendMessage) {
      sendMessage({
        role: "user",
        content: `请根据项目“${data.name || data.title}”的智能体规则，开始执行自动化任务。`,
      });
    }
  };

  const handleUpdateProjectAgents = async (selectedAgentIds: string[]) => {
    // 过滤掉无效的 ID
    const validIds = selectedAgentIds.filter((id) => id && typeof id === "string");

    if (!data || !data.id) {
      const errorMsg =
        "保存失败：当前项目尚未在系统中完全注册（缺失 ID）。请尝试点击页面上的其他链接或刷新页面后再试。";
      console.error("Update failed: Missing project ID", {
        data,
        documentId: artifact.documentId,
      });
      alert(errorMsg);
      return;
    }

    setIsUpdating(true);
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const url = constructApiUrl(`/api/v1/projects/${data.id}`);
      console.log("Updating project agents:", {
        url: url.toString(),
        agentIds: validIds,
      });

      const response = await fetch(url.toString(), {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          agents: validIds,
        }),
      });

      if (response.ok) {
        // 部分后端可能不返回 JSON，先检查 content-type
        let result = {};
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          result = await response.json();
        }

        console.log("Update success:", result);

        // 更新本地数据：从 myAgents 中找到匹配的对象，确保 UI 显示完整信息
        const updatedAgents = myAgents.filter((a: any) => validIds.includes(a.id));
        const newData = {
          ...data,
          agents: updatedAgents,
        };

        setData(newData);

        // 关键：同步到父组件/持久化，确保切页回来数据还在
        if (onSaveContent) {
          console.log("Syncing updated project agents to parent content...");
          onSaveContent(JSON.stringify(newData, null, 2), false);
        }

        setIsConfigModalOpen(false);
        // 增加保存成功的反馈
        alert("项目智能体配置已保存成功！");
      } else {
        const errorText = await response.text();
        console.error(
          "Failed to update project agents:",
          response.status,
          response.statusText,
          errorText,
        );
        alert(`保存失败 (${response.status}): ${response.statusText || "服务器响应异常"}`);
      }
    } catch (error) {
      console.error("Error updating project agents:", error);
      alert("保存失败，请检查网络连接或控制台报错。");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfigureAgent = () => {
    if (!data) return;

    // 始终弹出选择智能体配置弹窗，而不是进入智能体详情预览页
    setIsConfigModalOpen(true);
  };

  useEffect(() => {
    // During streaming, content might be empty initially, but we should still
    // allow the component to render instead of showing a loader forever
    if (!content && artifact.status !== "streaming") return;

    // If content is empty but we are streaming, we can initialize with empty data
    if (!content && artifact.status === "streaming") {
      setData((prev) => prev || ({ title: "正在生成项目..." } as ProjectData));
      return;
    }

    // 如果 content 没变，直接返回
    if (content === lastParsedContent.current) return;
    lastParsedContent.current = content;

    try {
      const parsed = parseStructuredContent<ProjectData>(content);

      // 尝试从 artifact.documentId 补全缺失的 ID
      if (!parsed.id && artifact.documentId && artifact.documentId !== "init") {
        const extractedId = artifact.documentId.replace(/^project-/, "");
        if (extractedId && extractedId !== "init") {
          parsed.id = extractedId;
        }
      }

      // 仅在内容确实变化时才更新 state，避免不必要的重新渲染和数据回滚
      setData((prev) => {
        if (!prev) return parsed;

        // 比较排除 history 后的数据，避免覆盖异步获取的历史记录
        const { history: prevHistory, ...prevRest } = prev;
        const { history: parsedHistory, ...parsedRest } = parsed;

        if (JSON.stringify(prevRest) === JSON.stringify(parsedRest)) {
          return prev;
        }

        return {
          ...prev,
          ...parsed,
          history: prev.history || parsed.history,
        };
      });

      // 只有在项目 ID 变化时才重新从接口获取数据，避免重复请求
      // 且仅在非流式传输状态下获取完整数据，避免干扰流式更新
      if (parsed.id && parsed.id !== lastFetchedId.current && artifact.status !== "streaming") {
        lastFetchedId.current = parsed.id;
        fetchFullProjectData(parsed.id);

        // 如果有 token，获取历史记录
        if (token) {
          fetchProjectHistory(parsed.id);
        }
      }
    } catch (e) {
      console.error("Failed to parse project content", e);
    }
  }, [content, token, artifact.documentId]);

  const handleDocumentClick = (doc: any) => {
    if (!doc.id) return;

    // 1. Switch right side artifact
    setArtifact((prev) => ({
      ...prev,
      documentId: doc.id,
      kind: "document",
      title: doc.title,
      isVisible: true,
      status: "idle",
      initialViewMode: "edit",
    }));

    // 2. Jump to message on the left side
    if (doc.messageId) {
      // Use both id-based lookup and custom event for maximum reliability
      const element = document.getElementById(`message-${doc.messageId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.classList.add(
          "ring-2",
          "ring-[#19be6b]",
          "ring-offset-2",
          "transition-all",
          "duration-500",
        );
        setTimeout(() => {
          element.classList.remove("ring-2", "ring-[#19be6b]", "ring-offset-2");
        }, 3000);
      }

      // Always dispatch event in case message is not in DOM (e.g. virtualized)
      window.dispatchEvent(
        new CustomEvent("jump-to-message", {
          detail: { messageId: doc.messageId },
        }),
      );
    }
  };

  const fetchProjectHistory = async (projectId: string) => {
    if (!projectId || projectId === "init" || projectId === "undefined") return;

    // 校验 UUID 格式
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(projectId)) return;

    try {
      const headers: HeadersInit = {
        Accept: "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const url = constructApiUrl("/api/v1/history", { project_id: projectId, limit: "5" });
      const response = await fetch(url.toString(), {
        headers,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.chats) {
          setData((prev) =>
            prev
              ? {
                  ...prev,
                  history: result.chats,
                }
              : null,
          );
        }
      }
    } catch (error) {
      console.error("Failed to fetch project history", error);
    }
  };

  const fetchFullProjectData = async (id: string) => {
    if (!id || id === "init" || id === "undefined" || isLoading) return;

    // 校验 ID 格式，支持 UUID 或种子数据 ID (如 proj-uxin, proj-2)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const seedIdRegex = /^proj-[a-zA-Z0-9_-]+$/;
    if (!uuidRegex.test(id) && !seedIdRegex.test(id)) {
      console.warn(`Invalid project ID format: ${id}, skipping fetch.`);
      return;
    }

    setIsLoading(true);
    try {
      const headers: HeadersInit = {
        Accept: "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const url = constructApiUrl(`/api/v1/projects/${id}`);
      const response = await fetch(url.toString(), {
        headers,
      });

      if (response.status === 404) {
        console.log(`Project ${id} not found yet, it might be a new project being created.`);
        return;
      }

      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          // 如果后端返回的是智能体 ID 列表，我们需要将其映射为完整的智能体对象
          let agents = result.data.agents || [];
          if (agents.length > 0 && typeof agents[0] === "string") {
            agents = myAgents.filter((a: any) => agents.includes(a.id));
          }

          // 计算更新后的数据
          const updatedData = {
            ...data,
            ...result.data,
            agents, // 使用处理后的智能体列表
          };

          // 1. 更新本地状态 - 使用函数式更新以避免覆盖 history 等其他并行获取的数据
          setData((prev) => {
            if (!prev) return updatedData;
            return {
              ...prev,
              ...result.data,
              agents,
              // 保留 history，因为它是由 fetchProjectHistory 独立更新的
              history: prev.history || updatedData.history,
            };
          });

          // 2. 仅在数据确实发生变化时才同步回 content，避免无限循环
          // 将 onSaveContent 移出 setData 的 updater 回调，避免 React "Cannot update a component while rendering" 警告
          if (
            onSaveContent &&
            JSON.stringify(updatedData.agents) !== JSON.stringify(data?.agents)
          ) {
            console.log("Syncing fetched project agents to content...");
            onSaveContent(JSON.stringify(updatedData, null, 2), false);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch full project data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSchema = async (configId: string) => {
    const configs = data?.adminConfigs || [];
    if (!data || configs.length === 0) return;

    const config = configs.find((c: any) => c.id === configId) as any;
    if (!config || !config.url) return;

    try {
      // 1. Mark as pending first
      const pendingConfigs = configs.map((c: any) =>
        c.id === configId ? { ...c, status: "pending" as const } : c,
      );
      const pendingData = { ...data, adminConfigs: pendingConfigs };
      setData(pendingData);
      if (onSaveContent) onSaveContent(JSON.stringify(pendingData, null, 2), false);

      // 2. Fetch sample data with token
      let fetchUrl = toRelativeApiUrl(config.url);
      fetchUrl = ensureAbsoluteApiUrl(fetchUrl);

      const requestToken = config.token || token;

      const response = await fetch(fetchUrl, {
        headers: requestToken
          ? {
              Authorization: `Bearer ${requestToken}`,
            }
          : {},
      });

      if (!response.ok)
        throw new Error(`Failed to fetch sample data: ${response.status} ${response.statusText}`);
      const sampleData = await response.json();

      // 智能提取数组数据的辅助函数
      const extractArray = (obj: any): any[] | null => {
        if (!obj) return null;
        if (Array.isArray(obj)) return obj;
        if (typeof obj !== "object") return null;

        // 常见包装键
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

        // 如果包装键中没有找到，检查当前对象的所有属性
        const keys = Object.keys(obj);
        const arrayKey =
          keys.find((key) => Array.isArray(obj[key]) && obj[key].length > 0) ||
          keys.find((key) => Array.isArray(obj[key]));

        if (arrayKey) return obj[arrayKey];

        return null;
      };

      const actualData = extractArray(sampleData);
      const dataToAnalyze =
        actualData && actualData.length > 0
          ? actualData
          : Array.isArray(actualData)
            ? actualData
            : [sampleData];

      // 3. Ask AI to generate schema
      if (sendMessage) {
        sendMessage({
          role: "user",
          content: `请分析以下数据结构并为功能“${config.name}”生成一个 JSON Schema。数据示例：\n${JSON.stringify(dataToAnalyze.slice ? dataToAnalyze.slice(0, 3) : dataToAnalyze, null, 2)}\n\n请严格按照以下 JSON 格式返回，并使用 data-adminSchema 数据流部分进行保存，包含 configId: "${configId}"：\n\n\`\`\`json\n{\n  "fields": [\n    { "name": "id", "label": "ID", "type": "text", "showInList": true },\n    { "name": "name", "label": "名称", "type": "text", "showInList": true },\n    ...\n  ]\n}\n\`\`\`\n\n请确保包含字段名(name)、标签(label)、类型(type: text|number|select|textarea|email|status)和是否在列表显示(showInList: boolean)等信息。`,
        });
      }
    } catch (error) {
      console.error("Failed to generate schema", error);
      // Reset status on error
      const resetConfigs = configs.map((c: any) =>
        c.id === configId ? { ...c, status: undefined } : c,
      );
      const resetData = { ...data, adminConfigs: resetConfigs };
      setData(resetData);
      if (onSaveContent) onSaveContent(JSON.stringify(resetData, null, 2), false);
    }
  };

  const handleAdminTableClick = (config: any) => {
    setArtifact((current: any) => ({
      ...current,
      documentId: `admin-${config.id}`,
      title: config.name,
      kind: "admin",
      isVisible: true,
      status: "idle",
      content: JSON.stringify({
        ...config,
        configId: config.id,
        token: config.token || token, // Pass the specific token or global token
      }),
    }));
  };

  const handleMemberMessage = (member: any) => {
    if (sendMessage) {
      sendMessage({
        role: "user",
        content: `我想给项目成员 ${member.name} (${member.role || "成员"}) 发送一条消息：`,
      });
    }
  };

  const handleMemberDetails = (member: any) => {
    setArtifact((current: any) => ({
      ...current,
      documentId: `member-${member.id}`,
      title: `${member.name} 的个人资料`,
      kind: "document",
      isVisible: true,
      status: "idle",
      content: `# ${member.name}\n\n**职位**: ${member.role || "项目成员"}\n**邮箱**: ${member.email || "未提供"}\n**电话**: ${member.phone || "未提供"}\n\n## 负责任务\n该成员正在参与项目 ${data?.name || "本项目"} 的协作。`,
    }));
  };

  if (!data) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#19be6b]"></div>
      </div>
    );
  }

  const projectName = data.name || data.title || "未命名项目";

  // Helper for task priority badge
  const getPriorityBadge = (priority?: string) => {
    if (!priority || priority === "Low" || priority === "低") return null;

    const isHigh = priority === "High" || priority === "高";
    return (
      <span
        className={cn(
          "px-1.5 py-0.5 rounded text-[9px] font-bold",
          isHigh ? "bg-rose-50 text-rose-500" : "bg-amber-50 text-amber-600",
        )}
      >
        {priority}
      </span>
    );
  };

  // 提取项目成员数据
  const members = data.team || [];

  // 根据成员类型过滤：自由工作者 (freelancer)
  const freelancers = members.filter((m) => m.type === "freelancer");
  // 根据成员类型过滤：邀请员工/内部成员 (employee 或默认)
  const invitedEmployees = members.filter((m) => m.type === "employee" || !m.type);

  // 判断是否处于设置视图
  const isSettingsView = (artifact as any).activeTemplateId === "settings";

  return (
    <div className="relative max-w-4xl mx-auto bg-slate-50/30 min-h-full">
      <div className="bg-white px-8 py-6 border-b sticky top-0 z-50 shadow-sm backdrop-blur-sm bg-white/90">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => {
                if (isSettingsView) {
                  setArtifact((prev) => ({ ...prev, activeTemplateId: undefined }) as any);
                }
              }}
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl shadow-sm transition-all p-0 border-none",
                isSettingsView
                  ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  : "bg-[#f0fff4] text-[#19be6b] hover:bg-[#e0ffed]",
              )}
            >
              {isSettingsView ? <ArrowLeft size={24} /> : <Briefcase size={24} />}
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-slate-800">
                  {isSettingsView ? "项目设置" : projectName}
                </h1>
                {!isSettingsView && (
                  <span
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      data.status === "ACTIVE" || data.status === "进行中"
                        ? "bg-[#f0fff4] text-[#19be6b]"
                        : "bg-slate-100 text-slate-400",
                    )}
                  >
                    {data.status || "规划中"}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-slate-400">
                  {isSettingsView
                    ? `正在配置 ${projectName}`
                    : data.description
                      ? data.description.length > 20
                        ? `${data.description.slice(0, 20)}... 更多`
                        : data.description
                      : "暂无项目描述"}
                </p>
                {isLoading && (
                  <div className="flex items-center gap-1.5 ml-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#19be6b] animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="h-1.5 w-1.5 rounded-full bg-[#19be6b] animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="h-1.5 w-1.5 rounded-full bg-[#19be6b] animate-bounce"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {!isSettingsView && (
              <div className="flex items-center gap-6 mr-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    智能执行
                  </span>
                  <Switch
                    checked={data.isAgentActive || false}
                    onCheckedChange={handleToggleAgent}
                  />
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              onClick={() => {
                const updatedArtifact = {
                  ...artifact,
                  activeTemplateId: isSettingsView ? undefined : "settings",
                };
                setArtifact(updatedArtifact as any);
              }}
              className={cn(
                "p-2.5 rounded-xl transition-all border shadow-none h-auto",
                isSettingsView
                  ? "bg-[#f0fff4] text-[#19be6b] border-[#19be6b]/20 hover:bg-[#e0ffed]"
                  : "hover:bg-slate-100 text-slate-400 hover:text-slate-600 border-transparent hover:border-slate-200",
              )}
              title={isSettingsView ? "返回项目" : "项目设置"}
            >
              <Settings size={20} />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {isSettingsView ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <ProjectSettings
              project={data as any}
              onBack={() =>
                setArtifact((prev) => ({ ...prev, activeTemplateId: undefined }) as any)
              }
              onUpdate={(updates: any) => {
                setData((prev) => (prev ? { ...prev, ...updates } : null));
                if (onSaveContent) {
                  onSaveContent(JSON.stringify({ ...data, ...updates }, null, 2), false);
                }
              }}
              onGenerateSchema={handleGenerateSchema}
            />
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div
                className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm cursor-pointer hover:border-[#19be6b]/30 hover:shadow-md transition-all group"
                onClick={() => {
                  setArtifact((prev) => ({
                    ...prev,
                    kind: "agent-dashboard",
                    title: `${data.name || data.title} 智能看板`,
                    isVisible: true,
                  }));
                }}
              >
                <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center gap-1 group-hover:text-[#19be6b] transition-colors">
                  <Target size={12} />
                  进度
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-slate-800">{data.progress || 0}%</span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-[#19be6b] transition-all duration-500"
                    style={{ width: `${data.progress || 0}%` }}
                  />
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                  <Users size={12} />
                  团队
                </div>
                <div className="text-2xl font-bold text-slate-800">
                  {(data.team?.length || 0) + 5}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">总计成员 (含智能体)</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                  <Tag size={12} />
                  预算
                </div>
                <div className="text-lg font-bold text-slate-800">
                  {data.budgetMin
                    ? `¥${(data.budgetMin / 1000).toFixed(1)}k+`
                    : data.budget || "未设置"}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">预估投入</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                  <CalendarDays size={12} />
                  截止
                </div>
                <div className="text-lg font-bold text-slate-800 truncate">
                  {data.dueDate ? new Date(data.dueDate).toLocaleDateString() : "长期"}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">计划交付</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Requirements */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Rocket size={16} className="text-[#19be6b]" />
                  核心需求
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {data.requirements && data.requirements.length > 0 ? (
                    data.requirements?.map((req: any, index: number) => (
                      <div
                        key={req.id ? `preview-req-${req.id}` : `preview-req-idx-${index}`}
                        className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3"
                      >
                        <div
                          className={cn(
                            "mt-1 h-2 w-2 rounded-full",
                            req.priority === "High" || req.priority === "高"
                              ? "bg-rose-400"
                              : req.priority === "Medium" || req.priority === "中"
                                ? "bg-amber-400"
                                : "bg-emerald-400",
                          )}
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-700">{req.title}</p>
                          <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                            {req.description}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-xl bg-white">
                      <p className="text-xs text-slate-400">暂无关联需求</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tasks */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <ListTodo size={16} className="text-[#19be6b]" />
                  近期任务
                </h4>
                <div className="space-y-2">
                  {data.tasks && data.tasks.length > 0 ? (
                    data.tasks.slice(0, 5).map((task: any, index: number) => {
                      const isCompleted = task.status === "Completed" || task.status === "已完成";
                      const isInProgress =
                        task.status === "In Progress" || task.status === "进行中";

                      return (
                        <div
                          key={task.id ? `preview-task-${task.id}` : `preview-task-idx-${index}`}
                          className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div
                              className={cn(
                                "h-5 w-5 rounded border flex items-center justify-center text-[10px] font-bold shrink-0",
                                isCompleted
                                  ? "bg-[#19be6b] border-[#19be6b] text-white"
                                  : "border-slate-200 text-transparent",
                              )}
                            >
                              ✓
                            </div>
                            <div className="flex flex-wrap items-center gap-2 min-w-0">
                              <span
                                className={cn(
                                  "text-xs truncate",
                                  isCompleted
                                    ? "text-slate-400 line-through"
                                    : "text-slate-700 font-medium",
                                )}
                              >
                                {task.title}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {isInProgress && (
                              <span className="text-[10px] px-2 py-0.5 bg-[#f0fff4] text-[#19be6b] rounded-full font-bold border border-[#19be6b]/20">
                                进行中
                              </span>
                            )}
                            <div className="flex items-center gap-2">
                              {task.assigneeName && (
                                <span className="text-[10px] text-slate-400">
                                  {task.assigneeName}
                                </span>
                              )}
                              {(task.priority === "High" ||
                                task.priority === "Medium" ||
                                task.priority === "高" ||
                                task.priority === "中") &&
                                getPriorityBadge(task.priority)}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-xl bg-white">
                      <p className="text-xs text-slate-400">暂无关联任务</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Admin Management Tables */}
            {data.isAdminEnabled && data.adminConfigs && data.adminConfigs.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Settings size={16} className="text-blue-500" />
                  后台管理集成
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.adminConfigs?.map((config: any, index: number) => (
                    <div
                      key={config.id ? `admin-config-${config.id}` : `admin-config-idx-${index}`}
                      className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                            <Activity size={20} />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-sm font-bold text-slate-700 truncate">
                              {config.name}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">
                              {config.url}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {config.status === "pending" || config.status === "generating" ? (
                            <div className="px-2 py-1 bg-slate-50 text-slate-400 rounded text-[10px] font-bold flex items-center gap-1.5">
                              <Loader2 size={10} className="animate-spin" />
                              生成中...
                            </div>
                          ) : !config.schema ? (
                            <Button
                              variant="ghost"
                              onClick={() => handleGenerateSchema(config.id)}
                              className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-bold hover:bg-blue-100 transition-colors flex items-center gap-1 border-none h-auto"
                            >
                              <Sparkles size={10} />
                              生成 Schema
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              onClick={() => handleAdminTableClick(config)}
                              className="px-2 py-1 bg-[#f0fff4] text-[#19be6b] rounded text-[10px] font-bold hover:bg-[#e0ffed] transition-colors flex items-center gap-1 border-none h-auto"
                            >
                              <Play size={10} />
                              进入管理
                            </Button>
                          )}
                        </div>
                      </div>
                      {config.schema && (
                        <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">Schema 已就绪</span>
                          <Button
                            variant="link"
                            onClick={() => handleGenerateSchema(config.id)}
                            className="text-[9px] text-blue-500 hover:underline p-0 h-auto"
                          >
                            重新生成
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 关联交付文档与反馈 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 近期反馈 */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <MessageSquare size={16} className="text-[#19be6b]" />
                  近期反馈
                </h4>
                <div className="space-y-3">
                  {data.feedbacks && data.feedbacks.length > 0 ? (
                    data.feedbacks.slice(0, 3).map((feedback, index) => (
                      <div
                        key={feedback.id || `feedback-${index}`}
                        className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm space-y-2"
                      >
                        <p className="text-xs text-slate-600 leading-relaxed italic">
                          "{feedback.content}"
                        </p>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                          <span className="text-[10px] font-bold text-slate-700">
                            {feedback.authorName}
                          </span>
                          <span className="text-[9px] text-slate-400">
                            {new Date(feedback.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-xl bg-white">
                      <p className="text-xs text-slate-400">暂无近期反馈</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 关联文档 */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Zap size={16} className="text-[#19be6b]" />
                  关联交付文档
                </h4>
                <div className="space-y-3">
                  {data.relatedDocuments && data.relatedDocuments.length > 0 ? (
                    data.relatedDocuments?.map((doc, index) => (
                      <div
                        key={doc.id ? `preview-doc-${doc.id}` : `preview-doc-idx-${index}`}
                        onClick={() => handleDocumentClick(doc)}
                        className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-[#19be6b]/30 hover:shadow-md transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="flex-shrink-0 h-9 w-9 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-[#f0fff4] group-hover:text-[#19be6b] transition-colors">
                            {doc.status === "creating" ? (
                              <Loader2 size={16} className="animate-spin text-[#19be6b]" />
                            ) : (
                              <Briefcase size={16} />
                            )}
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold text-slate-700 group-hover:text-slate-900 truncate">
                              {doc.title || "未命名文档"}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {doc.status === "creating" ? (
                                <span className="text-[10px] text-[#19be6b] font-medium flex items-center gap-1">
                                  创建中...
                                </span>
                              ) : doc.status === "pending_review" ? (
                                <span className="text-[10px] text-orange-500 font-medium bg-orange-50 px-1.5 py-0.5 rounded">
                                  待审查
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400">已完成</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <ExternalLink
                          size={14}
                          className="text-slate-300 group-hover:text-[#19be6b] transition-colors flex-shrink-0"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-xl bg-white">
                      <p className="text-xs text-slate-400">暂无关联交付文档</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 关联历史对话 */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <MessageSquare size={16} className="text-[#19be6b]" />
                关联历史对话
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.history && data.history.length > 0 ? (
                  data.history?.map((chat, index) => (
                    <a
                      key={chat.id ? `preview-history-${chat.id}` : `preview-history-idx-${index}`}
                      href={`/chat/${chat.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-[#19be6b]/30 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="flex-shrink-0 h-9 w-9 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-[#f0fff4] group-hover:text-[#19be6b] transition-colors">
                          <MessageSquare size={16} />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-slate-700 group-hover:text-slate-900 truncate">
                            {chat.title || "未命名对话"}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Clock size={10} className="text-slate-400" />
                            <span className="text-[10px] text-slate-400">
                              {new Date(chat.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[10px] text-slate-400">
                          {chat.creatorName && chat.creatorName !== "系统"
                            ? `${chat.creatorName} @ `
                            : ""}
                          {chat.agentName || "项目负责人智能体"}
                        </span>
                        <ExternalLink
                          size={14}
                          className="text-slate-300 group-hover:text-[#19be6b] transition-colors"
                        />
                      </div>
                    </a>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 border-2 border-dashed border-slate-100 rounded-xl bg-white">
                    <p className="text-xs text-slate-400">暂无关联历史对话</p>
                  </div>
                )}
              </div>
            </div>

            {/* 团队与智能体集成展示 */}
            <div className="space-y-8 pt-4 border-t border-slate-100">
              {/* 智能体员工部分 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Bot size={16} className="text-[#19be6b]" />
                    智能体员工
                  </h4>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#f0fff4] rounded-full">
                    <div
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        data.isAgentActive ? "bg-[#19be6b] animate-pulse" : "bg-slate-300",
                      )}
                    />
                    <span className="text-[9px] font-bold text-[#19be6b]">
                      {data.isAgentActive ? "运行中" : "已停止"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projectAgents.length > 0 ? (
                    projectAgents.map((agent: any, index: number) => (
                      <div
                        key={agent.id || `preview-agent-${index}`}
                        className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                      >
                        <div className="flex items-start justify-between mb-3 relative z-10">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center shadow-sm overflow-hidden bg-emerald-50 text-emerald-600",
                            )}
                          >
                            {agent.avatar ? (
                              isEmoji(agent.avatar) ? (
                                <span className="text-xl">{agent.avatar}</span>
                              ) : (
                                <img
                                  src={agent.avatar}
                                  alt={agent.name}
                                  className="h-full w-full object-cover"
                                />
                              )
                            ) : (
                              <Bot size={20} />
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="ghost"
                              onClick={handleConfigureAgent}
                              className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-300 transition-colors h-8 w-8 border-none"
                            >
                              <Settings size={14} />
                            </Button>
                            <Switch
                              checked={!!data.isAgentActive}
                              onCheckedChange={handleToggleAgent}
                            />
                          </div>
                        </div>
                        <div className="space-y-2 relative z-10">
                          <h5 className="text-xs font-bold text-slate-800 group-hover:text-[#19be6b] transition-colors">
                            {agent.name}
                          </h5>
                          <p className="text-[10px] text-slate-400 line-clamp-2">
                            {agent.description || `负责项目的 ${agent.name} 相关决策及任务分配。`}
                          </p>
                          <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Bot size={12} className="text-slate-300" />
                              <span className="text-[9px] text-slate-400">
                                {agent.model || "GPT-4o"} 驱动
                              </span>
                            </div>
                            <Button
                              variant="link"
                              className="text-[9px] font-bold text-[#19be6b] hover:underline p-0 h-auto"
                            >
                              运行日志
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-10 px-6 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50 text-center space-y-4">
                      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto text-slate-200">
                        <Sparkles size={32} />
                      </div>
                      <div className="max-w-xs mx-auto space-y-1">
                        <h5 className="text-sm font-bold text-slate-800">尚未配置智能体角色</h5>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          关联智能体角色后，AI
                          将能够根据项目需求自动执行任务、生成文档并协助团队协作。
                        </p>
                      </div>
                      <Button
                        onClick={handleConfigureAgent}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-[#19be6b] text-white rounded-xl text-xs font-bold hover:bg-[#15a35c] transition-all shadow-md active:scale-95 border-none h-auto"
                      >
                        <Plus size={14} />
                        立即关联智能体
                      </Button>
                    </div>
                  )}

                  {projectAgents.length > 0 && (
                    <Button
                      variant="ghost"
                      onClick={handleConfigureAgent}
                      className="border-2 border-dashed border-slate-100 rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-slate-300 hover:border-[#19be6b] hover:text-[#19be6b] transition-all bg-slate-50/30 h-auto"
                    >
                      <Plus size={18} />
                      <span className="text-[10px] font-bold text-[#19be6b]">关联智能体</span>
                    </Button>
                  )}
                </div>

                {/* 工作流预览 */}
                <div className="bg-slate-900 rounded-xl p-4 text-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Bot size={64} />
                  </div>
                  <div className="relative z-10">
                    <h5 className="text-[11px] font-bold mb-3 flex items-center gap-2 text-slate-300">
                      <LineChart size={14} className="text-[#19be6b]" />
                      自动化协作流程预览
                    </h5>
                    <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
                      <WorkflowStep label="需求分析" role="CEO" />
                      <WorkflowArrow />
                      <WorkflowStep label="架构设计" role="研发" />
                      <WorkflowArrow />
                      <WorkflowStep label="任务拆解" role="研发" />
                      <WorkflowArrow />
                      <WorkflowStep label="进度跟踪" role="运营" />
                    </div>
                  </div>
                </div>
              </div>

              {/* 自由职业者部分 */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Users size={16} className="text-[#19be6b]" />
                  自由职业者
                </h4>

                {freelancers.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {freelancers.map((member, index) => (
                        <MemberCard
                          key={member.id || `preview-freelancer-${index}`}
                          member={member}
                          onMessage={handleMemberMessage}
                          onDetails={handleMemberDetails}
                        />
                      ))}
                    </div>
                    <div className="flex justify-center">
                      <Button
                        variant="ghost"
                        className="border-2 border-dashed border-slate-100 rounded-xl px-12 py-3 flex flex-col items-center justify-center gap-1 text-slate-300 hover:border-[#19be6b] hover:text-[#19be6b] transition-all bg-slate-50/30 group h-auto"
                      >
                        <div className="h-7 w-7 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:bg-[#f0fff4] transition-colors">
                          <Plus size={16} className="text-slate-400 group-hover:text-[#19be6b]" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 group-hover:text-[#19be6b]">
                          招募自由职业者
                        </span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="py-10 px-6 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50 text-center space-y-4">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto text-slate-200">
                      <Users size={32} />
                    </div>
                    <div className="max-w-xs mx-auto space-y-1">
                      <h5 className="text-sm font-bold text-slate-800">尚未招募外部专家</h5>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        您可以从外部平台招募专业的自由职业者加入项目，协助完成特定任务。
                      </p>
                    </div>
                    <Button className="inline-flex items-center gap-2 px-6 py-2 bg-[#19be6b] text-white rounded-xl text-xs font-bold hover:bg-[#15a35c] transition-all shadow-md active:scale-95 border-none h-auto">
                      <Plus size={14} />
                      立即招募
                    </Button>
                  </div>
                )}
              </div>

              {/* 项目成员部分 */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <User size={16} className="text-[#19be6b]" />
                  项目成员
                </h4>

                {invitedEmployees.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {invitedEmployees.map((member, index) => (
                        <MemberCard
                          key={member.id || `preview-employee-${index}`}
                          member={member}
                          onMessage={handleMemberMessage}
                          onDetails={handleMemberDetails}
                        />
                      ))}
                    </div>
                    <div className="flex justify-center">
                      <Button
                        variant="ghost"
                        className="border-2 border-dashed border-slate-100 rounded-xl px-12 py-3 flex flex-col items-center justify-center gap-1 text-slate-300 hover:border-[#19be6b] hover:text-[#19be6b] transition-all bg-slate-50/30 group h-auto"
                      >
                        <div className="h-7 w-7 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:bg-[#f0fff4] transition-colors">
                          <Plus size={16} className="text-slate-400 group-hover:text-[#19be6b]" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 group-hover:text-[#19be6b]">
                          邀请新成员
                        </span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="col-span-full py-10 px-6 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50 text-center space-y-4">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto text-slate-200">
                      <User size={32} />
                    </div>
                    <div className="max-w-xs mx-auto space-y-1">
                      <h5 className="text-sm font-bold text-slate-800">尚未邀请团队成员</h5>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        邀请内部员工加入项目，共同协作完成任务并跟进项目进度。
                      </p>
                    </div>
                    <Button className="inline-flex items-center gap-2 px-6 py-2 bg-[#19be6b] text-white rounded-xl text-xs font-bold hover:bg-[#15a35c] transition-all shadow-md active:scale-95 border-none h-auto">
                      <Plus size={14} />
                      立即邀请
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Smart Agent Association */}
            <div className="bg-[#19be6b]/5 rounded-2xl p-6 border border-[#19be6b]/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#19be6b] text-white shadow-md">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#19be6b]">关联智能体</h4>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] text-slate-500">该项目已接入自动执行引擎</p>
                      <div className="flex items-center gap-1.5 ml-2 border-l border-slate-200 pl-2">
                        <span
                          className={cn(
                            "text-[9px] font-bold",
                            data.isAgentActive ? "text-[#19be6b]" : "text-slate-400",
                          )}
                        >
                          {data.isAgentActive ? "已开启自动化" : "未开启"}
                        </span>
                        <Switch
                          checked={!!data.isAgentActive}
                          onCheckedChange={handleToggleAgent}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={handleConfigureAgent}
                  className="bg-white hover:bg-slate-50 text-[#19be6b] border border-[#19be6b]/20 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors h-auto"
                >
                  配置智能体
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/80 p-3 rounded-xl border border-white flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center">
                    <Zap size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-700">自动同步</p>
                    <p className="text-[8px] text-slate-400">每15分钟更新</p>
                  </div>
                </div>
                <div className="bg-white/80 p-3 rounded-xl border border-white flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                    <Globe size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-700">全球协作</p>
                    <p className="text-[8px] text-slate-400">支持多语言环境</p>
                  </div>
                </div>
                <div className="bg-white/80 p-3 rounded-xl border border-white flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center">
                    <Workflow size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-700">任务编排</p>
                    <p className="text-[8px] text-slate-400">运行中</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      {/* 智能体配置弹窗 */}
      <AgentConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        availableAgents={myAgents}
        selectedAgentIds={projectAgentsData
          .map((a: any) => (typeof a === "string" ? a : a.id))
          .filter(Boolean)}
        onSave={handleUpdateProjectAgents}
        isUpdating={isUpdating}
      />
    </div>
  );
}
