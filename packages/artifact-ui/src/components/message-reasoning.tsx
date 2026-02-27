"use client";

import { BrainIcon, ChevronDownIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "../lib/utils";
import { Reasoning, ReasoningContent, ReasoningTrigger } from "./elements/reasoning";

type MessageReasoningProps = {
  isLoading: boolean;
  reasoning: string;
};

export function MessageReasoning({ isLoading, reasoning }: MessageReasoningProps) {
  return (
    <Reasoning isStreaming={isLoading} className="mb-4">
      <ReasoningTrigger className="thinking-progress-container flex items-center justify-between w-fit gap-2 px-3 py-1 bg-[#edf2f7] dark:bg-zinc-800 rounded-full cursor-pointer hover:bg-[#e2e8f0] transition-colors">
        <div className="flex items-center gap-2">
          <div className={cn("thinking-icon", isLoading && "animate-pulse")}>
            <BrainIcon size={14} className="text-[#2d8cf0]" />
          </div>
          <span className="text-[12px] font-medium text-[#718096] dark:text-zinc-400">
            思考过程
          </span>
        </div>
        <ChevronDownIcon size={12} className="text-[#a0aec0] transition-transform duration-300" />
      </ReasoningTrigger>

      <ReasoningContent className="thinking-content-container mt-2 bg-white dark:bg-zinc-900 border border-[#e2e8f0] dark:border-zinc-800 rounded-lg overflow-hidden shadow-sm p-4 text-[13px] text-[#4a5568] dark:text-zinc-300 leading-relaxed italic whitespace-pre-wrap">
        {reasoning}
      </ReasoningContent>
    </Reasoning>
  );
}
