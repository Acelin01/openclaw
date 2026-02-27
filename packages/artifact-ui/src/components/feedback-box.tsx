"use client";

import { Button } from "@uxin/ui";
import { MessageCircle, CheckCircle2, AlertCircle, Check, X } from "lucide-react";
import React from "react";
import { cn } from "../lib/utils";

interface FeedbackBoxProps {
  title?: string;
  content: string;
  suggestion?: string;
  type?: "success" | "warning" | "info";
  className?: string;
  onAccept?: () => void;
  onReject?: () => void;
  showActions?: boolean;
  statusText?: string;
}

export function FeedbackBox({
  title = "反馈结果",
  content,
  suggestion,
  type = "info",
  className,
  onAccept,
  onReject,
  showActions = false,
  statusText,
}: FeedbackBoxProps) {
  const isInfo = type === "info";
  const isWarning = type === "warning";
  const isSuccess = type === "success";

  return (
    <div
      className={cn(
        "my-3 self-start max-w-[85%] bg-white rounded-[10px] border border-[#edf2f7] shadow-[0_2px_8px_rgba(0,0,0,0.05)] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200 transition-all",
        className,
      )}
    >
      <div
        className={cn(
          "px-4 py-3 flex items-center justify-between bg-[#f8fafc] border-b border-[#e2e8f0]",
          isInfo && "text-[#2d8cf0]",
          isWarning && "text-[#f90]",
          isSuccess && "text-[#19be6b]",
        )}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center text-sm",
              isInfo && "bg-[#f0f9ff] text-[#2d8cf0]",
              isWarning && "bg-[#fff4e6] text-[#f90]",
              isSuccess && "bg-[#f0fff4] text-[#19be6b]",
            )}
          >
            {isInfo ? (
              <MessageCircle size={16} />
            ) : isWarning ? (
              <AlertCircle size={16} />
            ) : (
              <CheckCircle2 size={16} />
            )}
          </div>
          <span className="text-sm font-semibold text-[#2d3748]">{title}</span>
        </div>
        <span
          className={cn(
            "text-[10px] px-2 py-0.5 rounded-full font-bold",
            statusText
              ? "bg-[#f1f5f9] text-[#718096]"
              : isInfo
                ? "bg-[#f0f9ff] text-[#2d8cf0]"
                : isWarning
                  ? "bg-[#fff4e6] text-[#f90]"
                  : "bg-[#f0fff4] text-[#19be6b]",
          )}
        >
          {statusText || (isInfo ? "待处理" : isWarning ? "需注意" : "已就绪")}
        </span>
      </div>

      <div className="p-4 bg-white">
        <p className="text-sm text-[#4a5568] leading-relaxed mb-3">{content}</p>

        {suggestion && (
          <div className="mt-3 p-3 bg-[#fff9db] border-l-4 border-[#fcc419] rounded-r-md">
            <div className="flex items-center gap-2 mb-1.5 text-[#e67700] font-bold text-[13px]">
              <Check size={14} />
              <span>推理建议</span>
            </div>
            <div className="text-xs text-[#495057] leading-relaxed">{suggestion}</div>
          </div>
        )}

        {showActions && (
          <div className="flex gap-3 mt-4">
            <button
              onClick={onAccept}
              className="flex-1 h-9 bg-gradient-to-br from-[#19be6b] to-[#14a858] hover:translate-y-[-1px] text-white rounded-[8px] text-xs font-bold transition-all shadow-[0_2px_8px_rgba(25,190,107,0.2)] flex items-center justify-center gap-1.5 active:scale-[0.98]"
            >
              <Check className="w-3.5 h-3.5" />
              接受建议
            </button>
            <button
              onClick={onReject}
              className="flex-1 h-9 bg-white hover:bg-[#f7fafc] border border-[#e2e8f0] text-[#718096] rounded-[8px] text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
            >
              <X className="w-3.5 h-3.5" />
              拒绝建议
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
