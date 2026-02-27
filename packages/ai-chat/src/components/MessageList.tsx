"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter, Button } from "@uxin/ui";
import { useEffect, useRef, useState } from "react";
import { AIChatMessage } from "../types/intent.types";

export function MessageList({
  messages,
  onConfirm,
  onCancel,
  scrollContainerRef,
}: {
  messages: AIChatMessage[];
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const endRef = useRef<HTMLDivElement | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  useEffect(() => {
    const el = scrollContainerRef?.current;
    if (!el) return;
    const handler = () => {
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
      setAutoScroll(nearBottom);
    };
    el.addEventListener("scroll", handler, { passive: true } as any);
    handler();
    return () => {
      el.removeEventListener("scroll", handler);
    };
  }, [scrollContainerRef]);
  useEffect(() => {
    if (autoScroll) endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, autoScroll]);
  return (
    <div className="space-y-3">
      {messages.map((m) => (
        <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
          {m.type === "text" && (
            <Card className="max-w-[80%]">
              <CardContent className="p-3 text-sm">{m.content}</CardContent>
            </Card>
          )}
          {m.type === "action" && (
            <Card className="max-w-[80%]">
              <CardHeader>
                <CardTitle className="text-base">操作审批</CardTitle>
              </CardHeader>
              <CardContent className="p-3 text-sm">
                <div className="mb-2">{m.content}</div>
                <div className="text-xs text-gray-500 mb-2">
                  {JSON.stringify((m.data || {}).payload)}
                </div>
              </CardContent>
              <CardFooter className="gap-2">
                <Button onClick={() => onConfirm(m.id)}>审批通过</Button>
                <Button variant="outline" onClick={() => onCancel(m.id)}>
                  拒绝
                </Button>
              </CardFooter>
            </Card>
          )}
          {m.type === "result" && (
            <Card className="max-w-[80%]">
              <CardHeader>
                <CardTitle className="text-base">结果</CardTitle>
              </CardHeader>
              <CardContent className="p-3 text-sm">
                <div className="mb-2">{m.content}</div>
                <pre className="text-xs overflow-auto max-h-40">
                  {JSON.stringify(m.data, null, 2)}
                </pre>
              </CardContent>
              {"link" in (m.data || {}) && (m.data as any)?.link?.url && (
                <CardFooter>
                  <a
                    href={(m.data as any).link.url}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {(m.data as any).link.label || "跳转详情"}
                  </a>
                </CardFooter>
              )}
            </Card>
          )}
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
