"use client";

import { Sparkles, Globe, ShieldCheck, Wrench, Info, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import { cn, parseStructuredContent } from "../lib/utils";
import { Mermaid } from "./mermaid";

interface AgentData {
  name: string;
  prompt: string;
  mermaid?: string;
  isCallableByOthers: boolean;
  identifier?: string;
  whenToCall?: string;
  selectedTools: string[];
}

const AVAILABLE_TOOLS = [
  { id: "web_search", label: "联网搜索", description: "允许智能体访问互联网获取实时信息" },
  { id: "document_reader", label: "文档读取", description: "解析和提取上传文档中的内容" },
  { id: "image_generator", label: "图像生成", description: "根据文字描述创作视觉内容" },
  { id: "code_interpreter", label: "代码执行", description: "编写并运行 Python 代码进行数据分析" },
];

export function AgentPreview({ content }: { content: string }) {
  const [data, setData] = useState<AgentData | null>(null);

  useEffect(() => {
    if (!content) return;
    try {
      const parsed = parseStructuredContent<AgentData>(content);
      setData(parsed);
    } catch (e) {
      console.error("Failed to parse agent content for preview", e);
    }
  }, [content]);

  if (!data) return null;

  return (
    <div className="flex flex-col h-full bg-slate-50/50 p-6 overflow-y-auto">
      <div className="max-w-3xl mx-auto w-full space-y-8 pb-12">
        {/* Header */}
        <div className="flex items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="h-16 w-16 bg-[#19be6b] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#19be6b]/20">
            <Sparkles size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{data.name || "未命名智能体"}</h2>
            <p className="text-slate-500 text-sm">智能体配置预览</p>
          </div>
        </div>

        {/* Prompt Section */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-50 pb-4">
            <Info size={18} className="text-[#19be6b]" />
            提示词 (Prompt)
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">
            {data.prompt || "暂无提示词"}
          </div>
        </div>

        {/* Business Process Section */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-50 pb-4">
            <LayoutDashboard size={18} className="text-[#19be6b]" />
            业务流程 (Workflow)
          </div>
          {data.mermaid ? (
            <Mermaid code={data.mermaid} />
          ) : (
            <div className="bg-slate-50 p-8 rounded-2xl text-center">
              <p className="text-sm text-slate-400 italic">未配置业务流程</p>
            </div>
          )}
        </div>

        {/* Configuration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Access Control */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-50 pb-4">
              <Globe size={18} className="text-[#19be6b]" />
              访问权限
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">允许他人调用</span>
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold",
                    data.isCallableByOthers
                      ? "bg-[#19be6b]/10 text-[#19be6b]"
                      : "bg-slate-100 text-slate-400",
                  )}
                >
                  {data.isCallableByOthers ? "已开启" : "已关闭"}
                </span>
              </div>
              {data.isCallableByOthers && (
                <div className="space-y-2">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    英文标识
                  </div>
                  <div className="bg-slate-50 px-3 py-2 rounded-xl text-xs font-mono text-slate-600">
                    {data.identifier || "-"}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tools */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-50 pb-4">
              <Wrench size={18} className="text-[#19be6b]" />
              已启用工具
            </div>
            <div className="flex flex-wrap gap-2">
              {data.selectedTools?.length > 0 ? (
                data.selectedTools.map((toolId) => {
                  const tool = AVAILABLE_TOOLS.find((t) => t.id === toolId);
                  return (
                    <div
                      key={toolId}
                      className="flex items-center gap-2 bg-[#19be6b]/5 border border-[#19be6b]/10 px-3 py-1.5 rounded-full"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-[#19be6b]" />
                      <span className="text-xs text-slate-700">{tool?.label || toolId}</span>
                    </div>
                  );
                })
              ) : (
                <span className="text-xs text-slate-400 italic">未选择工具</span>
              )}
            </div>
          </div>
        </div>

        {/* Logic Description */}
        {data.whenToCall && (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-50 pb-4">
              <ShieldCheck size={18} className="text-[#19be6b]" />
              调用时机
            </div>
            <p className="text-sm text-slate-600 leading-relaxed italic">"{data.whenToCall}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
