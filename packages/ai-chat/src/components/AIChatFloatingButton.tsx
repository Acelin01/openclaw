"use client";

import { Button } from "@uxin/ui";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAIChat } from "../provider/AIChatProvider";

export function AIChatFloatingButton() {
  const { open, setOpen } = useAIChat();
  const [isClient, setIsClient] = useState(false);
  const [hasOverlay, setHasOverlay] = useState(false);
  useEffect(() => {
    setIsClient(true);
    if (typeof window === "undefined") return;
    const check = () => {
      try {
        const overlay = document.body.querySelector("[data-overlay]");
        setHasOverlay(!!overlay);
      } catch {}
    };
    check();
    const observer = new MutationObserver(() => check());
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  if (!isClient || open || hasOverlay) return null;
  return createPortal(
    <div style={{ position: "fixed", bottom: "1rem", right: "1rem", zIndex: 100000 }}>
      <Button
        onClick={() => setOpen(true)}
        size="lg"
        className="rounded-full shadow-lg"
        aria-label="打开AIChat"
      >
        AIChat
      </Button>
    </div>,
    document.body,
  );
}
