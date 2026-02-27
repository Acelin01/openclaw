"use client";

import { createContext, useContext, useMemo, useState, ReactNode, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { createAgent, queryAgents, updateAgent, deleteAgent } from "../actions/agentActions";
import { createInquiry, queryInquiries, generateInquiryContent } from "../actions/inquiryActions";
import { queryQuotations, generateQuotationContent } from "../actions/quotationActions";
import { createTransaction, updateTransactionStatus } from "../actions/transactionActions";
import { createUser, queryUsers, updateUser } from "../actions/userActions";
import { defaultApiClient } from "../api-client";
import { parseText } from "../parser/basicParser";
import { AIChatMessage, AIChatConfig, ParsedIntent } from "../types/intent.types";

interface AIChatContextType {
  open: boolean;
  setOpen: (v: boolean) => void;
  messages: AIChatMessage[];
  sendText: (text: string, senderAgentId?: string) => Promise<void>;
  confirmAction: (messageId: string) => Promise<void>;
  cancelAction: (messageId: string) => void;
  agents: any[];
  selectedAgentId: string | null;
  setSelectedAgentId: (id: string | null) => void;
  loadingAgents: boolean;
}

const AIChatContext = createContext<AIChatContextType | undefined>(undefined);

export function AIChatProvider({
  children,
  config,
}: {
  children: ReactNode;
  config?: AIChatConfig;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  const apiConfig = useMemo(() => ({ confirmDangerous: true, ...config }), [config]);

  useEffect(() => {
    if (open && agents.length === 0) {
      loadAgents();
    }
  }, [open]);

  const loadMessages = async (chatId: string) => {
    try {
      setCurrentConversationId(chatId);
      const res = await defaultApiClient.get<any>(`/messages/${chatId}`);
      if (res && res.success && Array.isArray(res.data)) {
        const historyMessages: AIChatMessage[] = res.data.map((m: any) => ({
          id: m.id,
          type: "text",
          role: m.senderType === "ME" ? "user" : "assistant",
          content: m.content,
          timestamp: new Date(m.createdAt).getTime(),
          metadata: { chatId: m.chatId },
        }));
        setMessages(historyMessages);
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  useEffect(() => {
    // 检查 URL 中的 conversationId 参数
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const conversationId = searchParams.get("conversationId");
      if (conversationId) {
        setOpen(true);
        loadMessages(conversationId);

        // 清除 URL 中的参数，避免刷新页面时重复触发
        const newUrl =
          window.location.pathname +
          window.location.search.replace(/[?&]conversationId=[^&]+/, "").replace(/^&/, "?");
        window.history.replaceState({}, "", newUrl);
      }
    }

    const handleSwitchConversation = (event: CustomEvent) => {
      const { conversationId } = event.detail;
      if (conversationId) {
        // 1. 确保弹窗打开
        setOpen(true);
        // 2. 加载特定对话历史
        loadMessages(conversationId);
        console.log("Switching to conversation:", conversationId);
      }
    };

    window.addEventListener("switchAIChatConversation" as any, handleSwitchConversation);
    return () => {
      window.removeEventListener("switchAIChatConversation" as any, handleSwitchConversation);
    };
  }, []);

  const loadAgents = async () => {
    setLoadingAgents(true);
    try {
      const res = await queryAgents();
      if (res && (res as any).data && Array.isArray((res as any).data)) {
        setAgents((res as any).data);
      } else if (Array.isArray(res)) {
        setAgents(res);
      }
    } catch (err) {
      console.error("Failed to load agents:", err);
    } finally {
      setLoadingAgents(false);
    }
  };

  const sendText = async (text: string, senderAgentId?: string) => {
    const userMsg: AIChatMessage = {
      id: uuidv4(),
      type: "text",
      role: "user",
      content: text,
      timestamp: Date.now(),
      metadata: senderAgentId ? { senderAgentId } : undefined,
    };
    setMessages((prev) => [...prev, userMsg]);
    const parsed = parseText(text);
    if (!parsed) {
      const isQuotation = /(生成|创建).*?(报价|quotation)/i.test(text);
      const isInquiry = /(生成|创建|发布).*?(询价|需求|inquiry)/i.test(text);
      try {
        if (isQuotation) {
          const gen = await generateQuotationContent({
            title: "AI生成报价",
            description: text,
            category: undefined,
            requirements: [],
          });
          const msg: AIChatMessage = {
            id: uuidv4(),
            type: "result",
            role: "assistant",
            content: gen.message || "已为您生成报价内容",
            data: gen.data,
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, msg]);
          return;
        }
        if (isInquiry) {
          const gen = await generateInquiryContent({
            title: "AI生成询价",
            description: text,
            category: undefined,
            tags: [],
          });
          const msg: AIChatMessage = {
            id: uuidv4(),
            type: "result",
            role: "assistant",
            content: gen.message || "已为您生成询价内容",
            data: gen.data,
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, msg]);
          return;
        }
        const chat = await defaultApiClient.post<any>("/ai/chat", {
          message: text,
          agentId: selectedAgentId,
          senderAgentId: senderAgentId,
          conversationId: currentConversationId || undefined,
        });

        // 如果后端返回了新的 conversationId（例如第一次对话时创建的），记录下来
        if (chat.success && (chat as any).data?.conversationId) {
          setCurrentConversationId((chat as any).data.conversationId);
        }

        const msg: AIChatMessage = {
          id: uuidv4(),
          type: "text",
          role: "assistant",
          content: (chat as any)?.data?.response || chat.message || "已为您生成回复",
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, msg]);
        return;
      } catch {
        const reply: AIChatMessage = {
          id: uuidv4(),
          type: "text",
          role: "assistant",
          content: "未能理解您的意图，请尝试使用更明确的表述",
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, reply]);
        return;
      }
    }
    if (parsed.options?.confirm || apiConfig.confirmDangerous) {
      const actionMsg: AIChatMessage = {
        id: uuidv4(),
        type: "action",
        role: "assistant",
        content: "请确认执行该操作",
        data: parsed,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, actionMsg]);
    } else {
      await executeParsedIntent(parsed);
    }
  };

  const executeParsedIntent = async (parsed: ParsedIntent) => {
    if (parsed.intent === "CREATE_USER") {
      const res = await createUser(parsed.payload as any);
      const reply: AIChatMessage = {
        id: uuidv4(),
        type: "result",
        role: "assistant",
        content: res.message || "创建用户结果",
        data: res.data,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, reply]);
      return;
    }
    if (parsed.intent === "QUERY_USER") {
      const res = await queryUsers(parsed.payload as any);
      const reply: AIChatMessage = {
        id: uuidv4(),
        type: "result",
        role: "assistant",
        content: res.message || "查询结果",
        data: res.data,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, reply]);
      return;
    }
    if (parsed.intent === "UPDATE_USER") {
      const res = await updateUser(parsed.payload as any);
      const reply: AIChatMessage = {
        id: uuidv4(),
        type: "result",
        role: "assistant",
        content: res.message || "更新结果",
        data: res.data,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, reply]);
      return;
    }
    if (parsed.intent === "CREATE_INQUIRY") {
      const res = await createInquiry(parsed.payload as any);
      const link =
        res?.data && (res as any)?.data?.id
          ? { url: `/admin/inquiries/${(res as any).data.id}`, label: "查看询价详情" }
          : undefined;
      const reply: AIChatMessage = {
        id: uuidv4(),
        type: "result",
        role: "assistant",
        content: res.message || "创建询价结果",
        data: { ...(res.data || {}), link },
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, reply]);
      return;
    }
    if (parsed.intent === "QUERY_INQUIRY") {
      const res = await queryInquiries(parsed.payload as any);
      const reply: AIChatMessage = {
        id: uuidv4(),
        type: "result",
        role: "assistant",
        content: res.message || "询价查询结果",
        data: res.data,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, reply]);
      return;
    }
    if (parsed.intent === "QUERY_QUOTATION") {
      const res = await queryQuotations(parsed.payload as any);
      const reply: AIChatMessage = {
        id: uuidv4(),
        type: "result",
        role: "assistant",
        content: res.message || "报价查询结果",
        data: res.data,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, reply]);
      return;
    }
    if (parsed.intent === "CREATE_TRANSACTION") {
      const res = await createTransaction(parsed.payload as any);
      const link = (res as any)?.data?.id
        ? { url: `/admin/transactions/${(res as any).data.id}`, label: "查看交易详情" }
        : undefined;
      const reply: AIChatMessage = {
        id: uuidv4(),
        type: "result",
        role: "assistant",
        content: res.message || "创建交易结果",
        data: { ...(res.data || {}), link },
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, reply]);
      return;
    }
    if (parsed.intent === "UPDATE_TRANSACTION") {
      const res = await updateTransactionStatus(parsed.payload as any);
      const id = (parsed.payload as any)?.id;
      const link = id ? { url: `/admin/transactions/${id}`, label: "查看交易详情" } : undefined;
      const reply: AIChatMessage = {
        id: uuidv4(),
        type: "result",
        role: "assistant",
        content: res.message || "更新交易结果",
        data: { ...(res.data || {}), link },
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, reply]);
      return;
    }
    if (parsed.intent === "CREATE_AGENT") {
      const res = await createAgent(parsed.payload as any);
      const reply: AIChatMessage = {
        id: uuidv4(),
        type: "result",
        role: "assistant",
        content: res.message || "智能体创建成功",
        data: res.data,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, reply]);
      return;
    }
    if (parsed.intent === "QUERY_AGENT") {
      const res = await queryAgents(parsed.payload as any);
      const reply: AIChatMessage = {
        id: uuidv4(),
        type: "result",
        role: "assistant",
        content: res.message || "智能体查询结果",
        data: res.data,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, reply]);
      return;
    }
    if (parsed.intent === "UPDATE_AGENT") {
      const { id, ...data } = parsed.payload as any;
      const res = await updateAgent(id, data);
      const reply: AIChatMessage = {
        id: uuidv4(),
        type: "result",
        role: "assistant",
        content: res.message || "智能体更新结果",
        data: res.data,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, reply]);
      return;
    }
    if (parsed.intent === "DELETE_AGENT") {
      const { id } = parsed.payload as any;
      const res = await deleteAgent(id);
      const reply: AIChatMessage = {
        id: uuidv4(),
        type: "result",
        role: "assistant",
        content: res.message || "智能体已删除",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, reply]);
      return;
    }
  };

  const confirmAction = async (messageId: string) => {
    const msg = messages.find((m) => m.id === messageId);
    if (!msg || msg.type !== "action") return;
    const parsed = msg.data as ParsedIntent;
    try {
      await defaultApiClient.post("/ai/chat", {
        message: `审批通过: ${parsed.intent}`,
        context: { intent: parsed.intent, payload: parsed.payload },
      });
    } catch {}
    await executeParsedIntent(parsed);
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  };

  const cancelAction = (messageId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
    const reply: AIChatMessage = {
      id: uuidv4(),
      type: "text",
      role: "assistant",
      content: "已拒绝/取消执行",
      timestamp: Date.now(),
    };
    try {
      const msg = messages.find((m) => m.id === messageId);
      if (msg?.type === "action") {
        const parsed = msg.data as ParsedIntent;
        defaultApiClient.post("/ai/chat", {
          message: `审批拒绝: ${parsed.intent}`,
          context: { intent: parsed.intent, payload: parsed.payload },
        });
      }
    } catch {}
    setMessages((prev) => [...prev, reply]);
  };

  const value = {
    open,
    setOpen,
    messages,
    sendText,
    confirmAction,
    cancelAction,
    agents,
    selectedAgentId,
    setSelectedAgentId,
    loadingAgents,
  };

  return <AIChatContext.Provider value={value}>{children}</AIChatContext.Provider>;
}

export function useAIChat() {
  const ctx = useContext(AIChatContext);
  if (!ctx) throw new Error("useAIChat must be used within AIChatProvider");
  return ctx;
}
