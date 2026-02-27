"use client";

import { Button } from "@uxin/ui";
import { Maximize2, Minimize2, Copy, Check, RefreshCw } from "lucide-react";
import mermaid from "mermaid";
import React, { useEffect, useRef, useState } from "react";
import { cn } from "./shared-ui";

// Initialize mermaid
mermaid.initialize({
  startOnLoad: true,
  theme: "neutral",
  securityLevel: "loose",
  fontFamily: "inherit",
});

interface MermaidProps {
  code: string;
  caption?: string;
  className?: string;
}

export const Mermaid = ({ code, caption, className }: MermaidProps) => {
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const id = useRef(`mermaid-${Math.random().toString(36).substring(2, 11)}`);

  const renderChart = async () => {
    if (!code || code.trim() === "") {
      setSvg("");
      setError(null);
      return;
    }

    try {
      setError(null);
      // Clean up the code a bit - sometimes it might have extra backticks or language tags
      const cleanCode = code
        .replace(/```mermaid/g, "")
        .replace(/```/g, "")
        .trim();
      const { svg: renderedSvg } = await mermaid.render(id.current, cleanCode);
      setSvg(renderedSvg);
    } catch (err) {
      console.error("Mermaid rendering failed:", err);
      setError("图表渲染失败，请检查 Mermaid 语法。");
    }
  };

  useEffect(() => {
    renderChart();
  }, [code]);

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-2 w-full rounded-xl border bg-white shadow-sm overflow-hidden transition-all duration-300",
        isMaximized ? "fixed inset-4 z-[100] m-0" : "relative",
        className,
      )}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-5 h-5 bg-[#19be6b]/10 rounded">
            <RefreshCw className="size-3 text-[#19be6b]" />
          </div>
          <span className="text-xs font-semibold text-slate-700">{caption || "业务流程预览"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-500 hover:text-slate-900 transition-colors border-none"
            onClick={copyCode}
            title="复制 Mermaid 代码"
          >
            {isCopied ? (
              <Check className="size-3.5 text-[#19be6b]" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-500 hover:text-slate-900 transition-colors border-none"
            onClick={() => setIsMaximized(!isMaximized)}
            title={isMaximized ? "退出全屏" : "全屏查看"}
          >
            {isMaximized ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div
        className={cn(
          "flex-1 flex items-center justify-center p-6 overflow-auto bg-white min-h-[250px]",
          isMaximized ? "h-full" : "",
        )}
      >
        {error ? (
          <div className="text-red-500 text-sm flex flex-col items-center gap-2">
            <span>{error}</span>
            <pre className="text-[10px] bg-red-50 p-2 rounded max-w-full overflow-x-auto">
              {code}
            </pre>
          </div>
        ) : svg ? (
          <div
            className="mermaid-svg-container w-full h-full flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <div className="animate-pulse flex flex-col items-center gap-2">
            <div className="w-32 h-32 bg-slate-100 rounded-lg" />
            <div className="w-24 h-4 bg-slate-50 rounded" />
          </div>
        )}
      </div>
    </div>
  );
};
