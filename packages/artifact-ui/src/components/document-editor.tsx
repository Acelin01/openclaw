"use client";

import { Button, Separator } from "@uxin/ui";
import {
  FileText,
  Clock,
  Save,
  Share2,
  Plus,
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Undo,
  Redo,
  Circle,
  AlertCircle,
} from "lucide-react";
import { memo, useState, useEffect } from "react";
import { cn, parseStructuredContent } from "../lib/utils";
import { Editor } from "./text-editor";

interface DocumentData {
  title: string;
  content: string;
  lastUpdated?: string;
  collaborators?: string[];
}

const CollaboratorAvatars = ({ collaborators }: { collaborators: string[] }) => {
  const displayLimit = 5;
  const hasMore = collaborators.length > displayLimit;
  const visibleCollaborators = collaborators.slice(0, displayLimit);
  const remainingCount = collaborators.length - displayLimit;

  return (
    <div className="flex -space-x-2 overflow-hidden">
      {visibleCollaborators.map((user, idx) => (
        <div
          key={`collaborator-${idx}-${user}`}
          className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-zinc-200 flex items-center justify-center text-[10px] font-bold text-zinc-600 shadow-sm transition-transform hover:-translate-y-0.5"
          title={user === "你" ? "你 (当前用户)" : user}
        >
          {user === "你" ? (
            <div className="h-full w-full rounded-full bg-[#4CAF50] flex items-center justify-center text-white">
              你
            </div>
          ) : (
            user.charAt(0)
          )}
        </div>
      ))}
      {hasMore && (
        <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-zinc-100 flex items-center justify-center text-[10px] font-bold text-zinc-500 shadow-sm">
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

export function DocumentEditor(props: React.ComponentProps<typeof Editor>) {
  const { content, onSaveContent, status } = props;
  const [data, setData] = useState<DocumentData>({
    title: "未命名文档",
    content: "",
  });
  const [parseError, setParseError] = useState(false);

  useEffect(() => {
    if (!content) return;
    try {
      const parsed = parseStructuredContent<DocumentData>(content);
      setData(parsed);
      setParseError(false);
    } catch (e) {
      if (status !== "streaming") {
        setParseError(true);
      }
    }
  }, [content, status]);

  const updateData = (updates: Partial<DocumentData>) => {
    const newData = { ...data, ...updates };
    setData(newData);
    onSaveContent(JSON.stringify(newData, null, 2), true);
  };

  if (parseError) {
    return (
      <div className="flex flex-col h-full p-4 gap-4">
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>文档解析失败，已切换至原始文本编辑器模式</span>
        </div>
        <div className="flex-1 border rounded-lg overflow-hidden">
          <Editor {...props} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f5f7fa] overflow-hidden border rounded-xl shadow-lg">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#4b6cb7] to-[#182848] text-white p-4 flex justify-between items-center shadow-md z-10">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-2 rounded-lg">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">{data.title || "在线协作文档"}</h1>
            <div className="text-xs opacity-80 flex items-center gap-2">
              <span>{data.content?.length || 0} 字</span>
              <Separator orientation="vertical" className="h-2 bg-white/30" />
              <span>最后更新: {data.lastUpdated || "刚刚"}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <CollaboratorAvatars collaborators={data.collaborators || ["你"]} />

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 hidden sm:flex"
            >
              <Plus className="w-4 h-4 mr-1" /> 新建
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <Save className="w-4 h-4 mr-1" /> 保存
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="bg-[#4CAF50] hover:bg-[#45a049] text-white border-none"
            >
              <Share2 className="w-4 h-4 mr-1" /> 分享
            </Button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {/* Editor Area */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* Toolbar */}
          <div className="border-b bg-[#f8f9fa] p-1 flex flex-wrap items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Bold className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Italic className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Underline className="w-4 h-4" />
            </Button>
            <Separator orientation="vertical" className="mx-1 h-6" />
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Heading1 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Heading2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Heading3 className="w-4 h-4" />
            </Button>
            <Separator orientation="vertical" className="mx-1 h-6" />
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <List className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ListOrdered className="w-4 h-4" />
            </Button>
            <Separator orientation="vertical" className="mx-1 h-6" />
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Undo className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Redo className="w-4 h-4" />
            </Button>
          </div>

          {/* Main Editor */}
          <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-[#fafafa]">
            <div className="max-w-3xl mx-auto bg-white min-h-[800px] shadow-sm border rounded-sm p-12 focus-within:ring-1 focus-within:ring-[#4b6cb7]/20 transition-all">
              <Editor
                {...props}
                content={data.content}
                onSaveContent={(newContent, debounce) => {
                  updateData({ content: newContent });
                }}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#f8f9fa] border-t px-4 py-2 flex justify-between items-center text-[10px] text-zinc-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Circle
              className={cn(
                "w-2 h-2 fill-current",
                status === "streaming" ? "text-amber-500 animate-pulse" : "text-[#4CAF50]",
              )}
            />
            <span>{status === "streaming" ? "正在同步..." : "已连接"}</span>
          </div>
          <div>最后更新: {data.lastUpdated || "刚刚"}</div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3" />
          <span>版本: 1.0.0 | 协作模式已开启</span>
        </div>
      </footer>
    </div>
  );
}
