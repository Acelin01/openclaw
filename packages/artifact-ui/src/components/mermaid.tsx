"use client";

import { Button } from "@uxin/ui";
import { Maximize2, Minimize2, Copy, Check, RefreshCw } from "lucide-react";
import mermaid from "mermaid";
import React, { useEffect, useRef, useState } from "react";
import { cn } from "../lib/utils";

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
  const containerRef = useRef<HTMLDivElement>(null);
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
      let cleanCode = code
        .replace(/```mermaid/g, "")
        .replace(/```/g, "")
        .trim();

      // If it doesn't start with a graph type, it's probably invalid but let's try to fix common issues
      if (
        !cleanCode.match(
          /^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|gitGraph)/i,
        )
      ) {
        // Default to flowchart if not specified
        cleanCode = "flowchart TD\n" + cleanCode;
      }

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
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-slate-500 hover:text-slate-900"
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
            className="size-7 text-slate-500 hover:text-slate-900"
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
          isMaximized ? "p-12" : "",
        )}
      >
        {error ? (
          <div className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-md border border-red-100 italic">
            {error}
          </div>
        ) : !svg ? (
          <div className="text-sm text-slate-400 italic">等待输入流程代码...</div>
        ) : (
          <div
            ref={containerRef}
            className="mermaid-svg-container max-w-full"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )}
      </div>

      {isMaximized && (
        <div
          className="fixed inset-0 z-[90] bg-black/20 backdrop-blur-sm"
          onClick={() => setIsMaximized(false)}
        />
      )}
    </div>
  );
};
