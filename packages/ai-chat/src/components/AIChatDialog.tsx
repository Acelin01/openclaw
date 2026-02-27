"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Button,
  RightDrawer,
} from "@uxin/ui";
import { useEffect, useRef, useState } from "react";
import { useAIChat } from "../provider/AIChatProvider";
import { MessageList } from "./MessageList";

export function AIChatDialog() {
  const {
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
  } = useAIChat();
  const [text, setText] = useState("");
  const [senderAgentId, setSenderAgentId] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 1024 : false,
  );
  const [drawerWidth, setDrawerWidth] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const v = localStorage.getItem("uxin.admin.drawerWidth");
      const n = Number(v);
      if (Number.isFinite(n) && n >= 360 && n <= 960) return n;
    }
    return 520;
  });
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (!nearBottom) return;
    try {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    } catch {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages.length]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => setIsDesktop(window.innerWidth >= 1024);
    handler();
    window.addEventListener("resize", handler, { passive: true } as any);
    return () => window.removeEventListener("resize", handler);
  }, []);
  const selectedAgent = agents.find((a) => a.id === selectedAgentId);
  const placeholder = selectedAgent ? `向 ${selectedAgent.name} 发送指令` : "请输入需求";

  const isAdmin =
    typeof window !== "undefined" &&
    (window.location.pathname.startsWith("/admin") || window.location.pathname.includes("/admin/"));
  if (isAdmin && isDesktop) {
    return (
      <RightDrawer
        open={open}
        onOpenChange={(o) => setOpen(o)}
        width={drawerWidth}
        minWidth={360}
        maxWidth={960}
        onWidthChange={(w) => {
          setDrawerWidth(w);
          if (typeof window !== "undefined") {
            localStorage.setItem("uxin.admin.drawerWidth", String(w));
          }
        }}
        heading={"AIChat"}
        actions={[{ label: "关闭", variant: "secondary", onClick: () => setOpen(false) }]}
      >
        <div className="relative h-full flex flex-col overflow-hidden">
          <div
            className="flex-1 min-h-0 overflow-auto overscroll-contain p-2"
            ref={listRef}
            onWheelCapture={(e) => {
              e.stopPropagation();
            }}
            onTouchMoveCapture={(e) => {
              e.stopPropagation();
            }}
            style={{ WebkitOverflowScrolling: "touch", overflowY: "auto", touchAction: "pan-y" }}
          >
            <MessageList
              messages={messages}
              onConfirm={confirmAction}
              onCancel={cancelAction}
              scrollContainerRef={listRef}
            />
          </div>
          {agents.length > 0 && (
            <div className="px-2 py-1 border-t flex flex-col gap-1 bg-gray-50">
              <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
                <span className="text-[10px] text-gray-400 font-medium">接收者:</span>
                {agents.map((agent) => (
                  <Button
                    key={agent.id}
                    variant="ghost"
                    onClick={() =>
                      setSelectedAgentId(selectedAgentId === agent.id ? null : agent.id)
                    }
                    className={`h-auto px-3 py-0.5 text-[11px] rounded-full border transition-colors ${
                      selectedAgentId === agent.id
                        ? "bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {agent.name}
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
                <span className="text-[10px] text-gray-400 font-medium">发送者:</span>
                <Button
                  variant="ghost"
                  onClick={() => setSenderAgentId(null)}
                  className={`h-auto px-3 py-0.5 text-[11px] rounded-full border transition-colors ${
                    senderAgentId === null
                      ? "bg-green-100 border-green-300 text-green-700 hover:bg-green-200"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  本人
                </Button>
                {agents.map((agent) => (
                  <Button
                    key={agent.id}
                    variant="ghost"
                    onClick={() => setSenderAgentId(senderAgentId === agent.id ? null : agent.id)}
                    className={`h-auto px-3 py-0.5 text-[11px] rounded-full border transition-colors ${
                      senderAgentId === agent.id
                        ? "bg-green-100 border-green-300 text-green-700 hover:bg-green-200"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {agent.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
          <div
            className="p-2 border-t flex gap-2 flex-shrink-0"
            style={{ position: "sticky", bottom: 0, left: 0, right: 0, backgroundColor: "#ffffff" }}
          >
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              onKeyDown={async (e) => {
                if (e.key === "Enter" && !isComposing) {
                  const v = text.trim();
                  if (v) {
                    await sendText(v, senderAgentId || undefined);
                    setText("");
                  }
                }
              }}
              placeholder={placeholder}
              enterKeyHint="send"
            />
            <Button
              onClick={async () => {
                if (text.trim()) {
                  await sendText(text.trim(), senderAgentId || undefined);
                  setText("");
                }
              }}
            >
              发送
            </Button>
          </div>
        </div>
      </RightDrawer>
    );
  }
  return (
    <Dialog open={open}>
      {open && (
        <DialogContent
          className="rounded-t-xl p-0 border-none shadow-xl overscroll-none"
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            top: "auto",
            transform: "none",
            width: "100%",
            maxWidth: "none",
            height: "60vh",
            maxHeight: "70vh",
            zIndex: 100000,
            backgroundColor: "#ffffff",
          }}
        >
          <div className="relative h-full flex flex-col overflow-hidden">
            <DialogHeader className="px-3 pt-3 flex-shrink-0">
              <DialogTitle>AIChat</DialogTitle>
            </DialogHeader>
            <Button
              aria-label="关闭AIChat"
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 h-8 w-8 rounded-full border-none"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>
            <div
              className="flex-1 min-h-0 overflow-auto overscroll-contain p-2"
              ref={listRef}
              onWheelCapture={(e) => {
                e.stopPropagation();
              }}
              onTouchMoveCapture={(e) => {
                e.stopPropagation();
              }}
              style={{ WebkitOverflowScrolling: "touch", overflowY: "auto", touchAction: "pan-y" }}
            >
              <MessageList
                messages={messages}
                onConfirm={confirmAction}
                onCancel={cancelAction}
                scrollContainerRef={listRef}
              />
            </div>
            {agents.length > 0 && (
              <div className="px-2 py-1 border-t flex flex-col gap-1 bg-gray-50">
                <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
                  <span className="text-[10px] text-gray-400 font-medium">接收者:</span>
                  {agents.map((agent) => (
                    <Button
                      key={agent.id}
                      variant="ghost"
                      onClick={() =>
                        setSelectedAgentId(selectedAgentId === agent.id ? null : agent.id)
                      }
                      className={`h-auto px-3 py-0.5 text-[11px] rounded-full border transition-colors ${
                        selectedAgentId === agent.id
                          ? "bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {agent.name}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
                  <span className="text-[10px] text-gray-400 font-medium">发送者:</span>
                  <Button
                    variant="ghost"
                    onClick={() => setSenderAgentId(null)}
                    className={`h-auto px-3 py-0.5 text-[11px] rounded-full border transition-colors ${
                      senderAgentId === null
                        ? "bg-green-100 border-green-300 text-green-700 hover:bg-green-200"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    本人
                  </Button>
                  {agents.map((agent) => (
                    <Button
                      key={agent.id}
                      variant="ghost"
                      onClick={() => setSenderAgentId(senderAgentId === agent.id ? null : agent.id)}
                      className={`h-auto px-3 py-0.5 text-[11px] rounded-full border transition-colors ${
                        senderAgentId === agent.id
                          ? "bg-green-100 border-green-300 text-green-700 hover:bg-green-200"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {agent.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <div
              className="p-2 border-t flex gap-2 flex-shrink-0"
              style={{
                position: "sticky",
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: "#ffffff",
              }}
            >
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={() => setIsComposing(false)}
                onKeyDown={async (e) => {
                  if (e.key === "Enter" && !isComposing) {
                    const v = text.trim();
                    if (v) {
                      await sendText(v, senderAgentId || undefined);
                      setText("");
                    }
                  }
                }}
                placeholder={placeholder}
                enterKeyHint="send"
              />
              <Button
                onClick={async () => {
                  if (text.trim()) {
                    await sendText(text.trim(), senderAgentId || undefined);
                    setText("");
                  }
                }}
              >
                发送
              </Button>
            </div>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
