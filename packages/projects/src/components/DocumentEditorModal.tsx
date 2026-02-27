"use client";

import { Button, Input } from "@uxin/ui";
import {
  X,
  FileText,
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
  Users,
  Clock,
  CheckCircle2,
  Copy,
  ChevronLeft,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { cn } from "./shared-ui";

interface DocumentUser {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  status: "online" | "offline";
  isEditing?: boolean;
}

interface DocumentVersion {
  id: string;
  title: string;
  content: string;
  lastEdited: string;
}

export interface DocumentEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    id: string;
    name: string;
    content?: string;
    updatedAt?: string | Date;
  } | null;
  onSave?: (id: string, updates: { name: string; content: string }) => Promise<void>;
  members?: any[];
}

export const DocumentEditorModal: React.FC<DocumentEditorModalProps> = ({
  isOpen,
  onClose,
  document: initialDoc,
  onSave,
  members = [],
}) => {
  const isEmoji = (str: string | null | undefined) => {
    if (!str) return false;
    return /\p{Emoji}/u.test(str) && str.length <= 8;
  };

  const [docTitle, setDocTitle] = useState(initialDoc?.name || "未命名文档");
  const [content, setContent] = useState(initialDoc?.content || "");
  const [charCount, setCharCount] = useState(0);
  const [lastSaved, setLastSaved] = useState<string>("刚刚");
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<DocumentUser[]>([]);

  const editorRef = useRef<HTMLDivElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize online users from members
  useEffect(() => {
    if (members && members.length > 0) {
      const users: DocumentUser[] = members.map((m, i) => ({
        id: m.id || `user-${i}`,
        name: m.user?.name || m.name || "未知用户",
        avatar: m.user?.avatar,
        color: ["#4CAF50", "#2196F3", "#FF9800", "#9C27B0", "#E91E63"][i % 5],
        status: i === 0 ? "online" : Math.random() > 0.3 ? "online" : "offline",
        isEditing: false,
      }));
      setOnlineUsers(users);

      // Simulate collaboration activity
      const interval = setInterval(() => {
        setOnlineUsers((prev) =>
          prev.map((u) => {
            if (u.id === users[0].id) return u; // Keep current user as is

            // Randomly change status or editing state
            const rand = Math.random();
            if (rand > 0.9)
              return {
                ...u,
                status: u.status === "online" ? "offline" : "online",
                isEditing: false,
              };
            if (u.status === "online" && rand > 0.7) return { ...u, isEditing: !u.isEditing };
            return u;
          }),
        );
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [members]);

  // Sync initial doc
  useEffect(() => {
    if (initialDoc) {
      setDocTitle(initialDoc.name);
      setContent(initialDoc.content || "");
      if (editorRef.current) {
        editorRef.current.innerHTML = initialDoc.content || "";
      }
      setHasUnsavedChanges(false);
    }
  }, [initialDoc]);

  // Auto-save logic
  useEffect(() => {
    if (hasUnsavedChanges) {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(() => {
        handleSave();
      }, 3000); // Auto-save after 3 seconds of inactivity
    }
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [content, docTitle]);

  // Update char count
  useEffect(() => {
    const text = editorRef.current?.innerText || "";
    setCharCount(text.replace(/\s/g, "").length);
  }, [content]);

  if (!isOpen) return null;

  const handleFormat = (command: string, value?: string) => {
    document.execCommand("styleWithCSS", false, "true");
    if (command === "formatBlock") {
      document.execCommand(command, false, value);
    } else {
      document.execCommand(command, false, value);
    }
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
      setHasUnsavedChanges(true);
    }
    editorRef.current?.focus();
  };

  const handleSave = async () => {
    if (!initialDoc || !onSave || !hasUnsavedChanges) return;

    setIsSaving(true);
    try {
      const currentContent = editorRef.current?.innerHTML || "";
      await onSave(initialDoc.id, {
        name: docTitle,
        content: currentContent,
      });
      setLastSaved(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
      setHasUnsavedChanges(true);
    }
  };

  const handleShare = () => {
    const randomId = Math.random().toString(36).substring(2, 8);
    setShareLink(`https://uxin.ai/docs/share/${randomId}`);
    setIsShareModalOpen(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    // Simple notification could be added here
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#f5f7fa] animate-in fade-in duration-200">
      {/* Header */}
      <header className="h-16 bg-white border-b border-zinc-200 px-6 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-zinc-500 hover:bg-zinc-100 rounded-xl border-none"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <input
              type="text"
              value={docTitle}
              onChange={(e) => {
                setDocTitle(e.target.value);
                setHasUnsavedChanges(true);
              }}
              className="text-lg font-bold text-zinc-900 bg-transparent border-none focus:outline-none focus:ring-0 p-0 w-64"
              placeholder="未命名文档"
            />
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span>{charCount} 字</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {members.length > 0 ? members.length : 1} 人协作中
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex -space-x-2 mr-4">
            {onlineUsers
              .filter((u) => u.status === "online")
              .slice(0, 3)
              .map((user) => (
                <div
                  key={user.id}
                  className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold overflow-hidden shadow-sm"
                  style={{ backgroundColor: user.color }}
                  title={user.name}
                >
                  {user.avatar ? (
                    isEmoji(user.avatar) ? (
                      <span className="text-sm">{user.avatar}</span>
                    ) : (
                      <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                    )
                  ) : (
                    <span className="text-white">{user.name[0]}</span>
                  )}
                </div>
              ))}
            {onlineUsers.filter((u) => u.status === "online").length > 3 && (
              <div className="w-8 h-8 rounded-full border-2 border-white bg-zinc-100 flex items-center justify-center text-[10px] font-bold text-zinc-500 shadow-sm">
                +{onlineUsers.filter((u) => u.status === "online").length - 3}
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            className="text-zinc-600 hover:bg-zinc-100 gap-2 border-none h-10 px-4"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>保存</span>
          </Button>

          <Button
            variant="default"
            className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2 border-none h-10 px-4 shadow-md shadow-emerald-500/20"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4" />
            <span>分享</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar - Recent Docs / History */}
        <aside className="w-72 bg-white border-r border-zinc-200 flex flex-col overflow-y-auto hidden md:flex">
          <div className="p-6 space-y-8">
            <section>
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">
                协作动态
              </h3>
              <div className="space-y-4">
                {onlineUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 group">
                    <div className="relative">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white border-2 border-white shadow-sm"
                        style={{ backgroundColor: user.color }}
                      >
                        {user.avatar ? (
                          isEmoji(user.avatar) ? (
                            <span className="text-base">{user.avatar}</span>
                          ) : (
                            <img
                              src={user.avatar}
                              alt=""
                              className="w-full h-full object-cover rounded-full"
                            />
                          )
                        ) : (
                          <span>{user.name[0]}</span>
                        )}
                      </div>
                      <div
                        className={cn(
                          "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white",
                          user.status === "online" ? "bg-emerald-500" : "bg-zinc-300",
                        )}
                      ></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900 truncate">{user.name}</p>
                      <p className="text-xs text-zinc-500">
                        {user.isEditing
                          ? "正在编辑..."
                          : user.status === "online"
                            ? "在线"
                            : "离线"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  版本历史
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 p-0 text-zinc-400 border-none"
                >
                  <Clock className="w-3.5 h-3.5" />
                </Button>
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 cursor-pointer">
                  <p className="text-sm font-bold text-blue-700">当前版本</p>
                  <p className="text-[11px] text-blue-500 mt-0.5">今天 {lastSaved}</p>
                </div>
                <div className="p-3 rounded-xl hover:bg-zinc-50 border border-transparent cursor-pointer transition-colors">
                  <p className="text-sm font-medium text-zinc-700">自动保存版本</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">昨天 18:30</p>
                </div>
              </div>
            </section>
          </div>
        </aside>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Toolbar */}
          <div className="h-12 border-b border-zinc-100 bg-zinc-50/50 flex items-center px-4 gap-1 overflow-x-auto">
            <ToolbarButton
              icon={<Bold className="w-4 h-4" />}
              onClick={() => handleFormat("bold")}
              title="加粗"
            />
            <ToolbarButton
              icon={<Italic className="w-4 h-4" />}
              onClick={() => handleFormat("italic")}
              title="斜体"
            />
            <ToolbarButton
              icon={<Underline className="w-4 h-4" />}
              onClick={() => handleFormat("underline")}
              title="下划线"
            />
            <div className="w-px h-4 bg-zinc-200 mx-1" />
            <ToolbarButton
              icon={<Heading1 className="w-4 h-4" />}
              onClick={() => handleFormat("formatBlock", "H1")}
              title="标题1"
            />
            <ToolbarButton
              icon={<Heading2 className="w-4 h-4" />}
              onClick={() => handleFormat("formatBlock", "H2")}
              title="标题2"
            />
            <ToolbarButton
              icon={<Heading3 className="w-4 h-4" />}
              onClick={() => handleFormat("formatBlock", "H3")}
              title="标题3"
            />
            <div className="w-px h-4 bg-zinc-200 mx-1" />
            <ToolbarButton
              icon={<List className="w-4 h-4" />}
              onClick={() => handleFormat("insertUnorderedList")}
              title="无序列表"
            />
            <ToolbarButton
              icon={<ListOrdered className="w-4 h-4" />}
              onClick={() => handleFormat("insertOrderedList")}
              title="有序列表"
            />
            <div className="w-px h-4 bg-zinc-200 mx-1" />
            <ToolbarButton
              icon={<Undo className="w-4 h-4" />}
              onClick={() => handleFormat("undo")}
              title="撤销"
            />
            <ToolbarButton
              icon={<Redo className="w-4 h-4" />}
              onClick={() => handleFormat("redo")}
              title="重做"
            />
          </div>

          {/* Writing Area */}
          <div className="flex-1 overflow-y-auto p-12 md:p-20 flex justify-center bg-zinc-50/30">
            <div
              ref={editorRef}
              contentEditable
              className="w-full max-w-[800px] bg-white shadow-xl shadow-zinc-200/50 rounded-sm p-[60px] md:p-[80px] min-h-[1000px] outline-none prose prose-zinc prose-lg max-w-none"
              onInput={handleInputChange}
              dangerouslySetInnerHTML={{ __html: initialDoc?.content || "" }}
            />
          </div>

          {/* Footer Stats */}
          <footer className="h-10 border-t border-zinc-100 px-6 flex items-center justify-between text-[11px] text-zinc-400 bg-white">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full animate-pulse",
                    hasUnsavedChanges ? "bg-amber-500" : "bg-emerald-500",
                  )}
                ></div>
                <span>{hasUnsavedChanges ? "正在输入..." : "已连接服务器"}</span>
              </div>
              <span>最后保存: {lastSaved}</span>
            </div>
            <div className="flex items-center gap-4">
              <span>{charCount} 字符</span>
              <span>100% 缩放</span>
            </div>
          </footer>
        </div>
      </main>

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-zinc-900">分享文档</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsShareModalOpen(false)}
                className="text-zinc-400 border-none"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  分享链接
                </label>
                <div className="flex gap-2">
                  <Input
                    value={shareLink}
                    readOnly
                    className="flex-1 bg-zinc-50 border-zinc-200 rounded-xl font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    className="rounded-xl px-3 border-zinc-200 hover:bg-zinc-50"
                    onClick={copyToClipboard}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3">
                <Users className="w-5 h-5 text-blue-500 shrink-0" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  任何拥有此链接的人都可以<strong>查看并编辑</strong>此文档。链接有效期为 7 天。
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="ghost"
                  className="rounded-xl px-6 border-none"
                  onClick={() => setIsShareModalOpen(false)}
                >
                  取消
                </Button>
                <Button
                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-8 border-none"
                  onClick={() => setIsShareModalOpen(false)}
                >
                  完成
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ToolbarButton = ({
  icon,
  onClick,
  title,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  title: string;
}) => (
  <Button
    variant="ghost"
    size="icon"
    onClick={onClick}
    title={title}
    className="w-8 h-8 p-0 text-zinc-500 hover:text-zinc-900 hover:bg-white hover:shadow-sm border-none transition-all"
  >
    {icon}
  </Button>
);
