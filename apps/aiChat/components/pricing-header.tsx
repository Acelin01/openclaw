"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@uxin/ui";

export function PricingHeader() {
  const router = useRouter();

  return (
    <nav className="border-b border-zinc-100 dark:border-zinc-800 px-6 py-4 flex justify-between items-center fixed top-0 left-0 right-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md z-50">
      <Button 
        variant="ghost"
        onClick={() => router.push("/")}
        className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>返回聊天</span>
      </Button>
      <div className="w-20" /> {/* 占位平衡 */}
    </nav>
  );
}
