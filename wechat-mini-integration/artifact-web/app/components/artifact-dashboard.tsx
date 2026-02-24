"use client";

import { useEffect, useMemo, useState } from "react";
import type { ProjectData } from "../lib/types";
import { ProjectManagerCard } from "./project-manager-card";

type MessageRole = "user" | "assistant" | "system";

type ChatMessage = {
  id: string;
  role: MessageRole;
  content: string;
  badge?: string;
  createdAt: string;
  kind?: "skill";
  meta?: {
    projectData?: ProjectData;
    title?: string;
  };
};

type ChatResponse = {
  ok: boolean;
  reply?: string;
  steps?: Array<{ role: string; content: string }>;
  skill?: string;
  projectData?: ProjectData;
  error?: string;
};

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const formatTime = () =>
  new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });

export const ArtifactDashboard = ({ initialData }: { initialData: ProjectData }) => {
  const [data, setData] = useState<ProjectData>(initialData);
  const [splitPercent, setSplitPercent] = useState(56);
  const [isDragging, setIsDragging] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: createId(),
      role: "assistant",
      content: "欢迎使用 OpenClaw 项目对话。请描述需求，我会触发项目管理技能并更新看板。",
      badge: "任务规划中",
      createdAt: formatTime(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const sessionId = useMemo(() => createId(), []);

  useEffect(() => {
    if (!isDragging) {
      return;
    }
    const handleMove = (event: MouseEvent) => {
      const width = window.innerWidth;
      if (!width) {
        return;
      }
      const next = Math.min(72, Math.max(38, (event.clientX / width) * 100));
      setSplitPercent(next);
    };
    const handleUp = () => {
      setIsDragging(false);
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [isDragging]);

  const pushMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  const refreshProjectData = async () => {
    const response = await fetch("/api/artifact", { cache: "no-store" });
    if (!response.ok) {
      return;
    }
    const json = (await response.json()) as ProjectData;
    setData(json);
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) {
      return;
    }
    setInput("");
    setIsSending(true);
    pushMessage({
      id: createId(),
      role: "user",
      content: trimmed,
      createdAt: formatTime(),
    });

    pushMessage({
      id: createId(),
      role: "system",
      content: "项目经理正在分析需求并协调团队...",
      createdAt: formatTime(),
    });

    try {
      const response = await fetch("/api/openclaw-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, sessionId }),
      });
      const payload = (await response.json()) as ChatResponse;
      if (!payload.ok) {
        pushMessage({
          id: createId(),
          role: "system",
          content: payload.error || "请求失败，请稍后再试。",
          createdAt: formatTime(),
        });
        setIsSending(false);
        return;
      }

      // 展示编排步骤
      if (payload.steps && payload.steps.length > 0) {
        payload.steps.forEach((step) => {
          pushMessage({
            id: createId(),
            role: "system",
            content: step.content, // 显示完整内容
            badge: step.role, // 使用步骤角色作为徽章
            createdAt: formatTime(),
          });
        });
      }

      if (payload.reply) {
        pushMessage({
          id: createId(),
          role: "assistant",
          content: payload.reply,
          badge: "项目经理",
          createdAt: formatTime(),
        });
      }
      if (payload.skill) {
        pushMessage({
          id: createId(),
          role: "assistant",
          content: payload.skill,
          badge: "技能执行",
          createdAt: formatTime(),
          kind: "skill",
          meta: {
            projectData: payload.projectData,
            title: "项目管理技能结果",
          },
        });
      }
      if (payload.projectData) {
        setData(payload.projectData);
      } else {
        await refreshProjectData();
      }
    } catch {
      pushMessage({
        id: createId(),
        role: "system",
        content: "网络异常，稍后重试。",
        createdAt: formatTime(),
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: `minmax(0, ${splitPercent}fr) 12px minmax(0, ${100 - splitPercent}fr)`,
      }}
    >
      <div className="rounded-3xl border border-slate-200 bg-white shadow-xl flex flex-col h-[calc(100vh-2rem)]">
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-5 shrink-0">
          <div className="text-xl font-semibold text-slate-900">对话与需求处理</div>
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
            <span className="mr-2">⚡️</span>
            AI Team Orchestration
          </div>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
          {messages.map((msg) => {
            if (msg.role === "system") {
              return (
                <div key={msg.id} className="flex justify-center">
                  <div className="rounded-full bg-slate-100 px-4 py-2 text-xs text-slate-500">
                    {msg.content}
                  </div>
                </div>
              );
            }
            const isUser = msg.role === "user";
            if (msg.kind === "skill") {
              return (
                <div key={msg.id} className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                    技能
                  </div>
                  <div className="w-full rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 text-sm text-slate-700 shadow-sm">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-sm font-semibold text-emerald-700">
                        {msg.meta?.title ?? "技能执行结果"}
                      </div>
                      <div className="rounded-full bg-white px-2 py-0.5 text-[11px] text-emerald-600">
                        已完成
                      </div>
                    </div>
                    {msg.meta?.projectData ? (
                      <div className="grid gap-3 text-xs text-slate-600 md:grid-cols-3">
                        <div className="rounded-xl bg-white px-3 py-2">
                          <div className="text-[11px] text-slate-400">需求数量</div>
                          <div className="text-base font-semibold text-slate-900">
                            {msg.meta.projectData.requirements.length}
                          </div>
                        </div>
                        <div className="rounded-xl bg-white px-3 py-2">
                          <div className="text-[11px] text-slate-400">任务数量</div>
                          <div className="text-base font-semibold text-slate-900">
                            {msg.meta.projectData.tasks.length}
                          </div>
                        </div>
                        <div className="rounded-xl bg-white px-3 py-2">
                          <div className="text-[11px] text-slate-400">更新时间</div>
                          <div className="text-sm font-semibold text-slate-900">
                            {msg.createdAt}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded-xl bg-white p-3 text-[12px] text-slate-600">
                        {msg.content}
                      </pre>
                    )}
                    <div className="mt-3 text-[11px] text-slate-400">{msg.createdAt}</div>
                  </div>
                </div>
              );
            }
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
                    AI
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    isUser
                      ? "bg-emerald-500 text-white"
                      : "border border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {!isUser && (
                    <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">项目经理智能体</span>
                      {msg.badge && (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-600">
                          {msg.badge}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                  <div
                    className={`mt-2 text-[11px] ${isUser ? "text-emerald-100" : "text-slate-400"}`}
                  >
                    {msg.createdAt}
                  </div>
                </div>
                {isUser && (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-200 text-xs font-semibold text-emerald-700">
                    我
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="border-t border-slate-100 px-6 py-4">
          <div className="flex items-end gap-3">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500"
            >
              📎
            </button>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void handleSend();
                }
              }}
              placeholder="输入您的需求或指令..."
              rows={1}
              className="min-h-[42px] flex-1 resize-none rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500"
            >
              🎙️
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={isSending}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              ↑
            </button>
          </div>
          <div className="mt-2 text-xs text-slate-400">回车发送，Shift+Enter 换行</div>
        </div>
      </div>
      <div
        className={`hidden cursor-col-resize items-center justify-center lg:flex ${
          isDragging ? "bg-emerald-200" : "bg-slate-200"
        }`}
        onMouseDown={() => setIsDragging(true)}
      >
        <div className="h-16 w-1.5 rounded-full bg-white/70" />
      </div>
      <ProjectManagerCard data={data} />
    </div>
  );
};
