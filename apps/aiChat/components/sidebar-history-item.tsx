import Link from "next/link";
import { memo, useCallback, useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useArtifact } from "@/hooks/use-artifact";
import { ChatActions } from "@uxin/artifact-ui";
import type { Chat, Document } from "@/lib/db/schema";
import {
  MoreHorizontalIcon,
} from "./icons";
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  Badge,
  Input,
} from "@uxin/ui";

const PureChatItem = ({
  chat,
  isActive,
  onDelete,
  onPin,
  onUpdateChat,
  projects,
  isProjectsLoading,
  setOpenMobile,
}: {
  chat: Chat & { documents?: Document[] };
  isActive: boolean;
  onDelete: (chatId: string) => void;
  onPin: (chatId: string, isPinned: boolean) => void;
  onUpdateChat: (chatId: string, updates: any) => void;
  projects?: any[];
  isProjectsLoading?: boolean;
  setOpenMobile: (open: boolean) => void;
}) => {
  const { setArtifact } = useArtifact();
  const router = useRouter();
  const params = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(chat.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (editedTitle.trim() && editedTitle !== chat.title) {
      onUpdateChat(chat.id, { title: editedTitle });
    }
    setIsEditing(false);
  }, [chat.id, chat.title, editedTitle, onUpdateChat]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditedTitle(chat.title);
      setIsEditing(false);
    }
  }, [chat.title, handleSave]);

  // 统计当前对话中待审核的文档数
  const pendingDocsCount = (chat.documents || []).filter(doc => doc.status === 'PENDING').length;

  const handleChatLinkClick = useCallback((e: React.MouseEvent) => {
    setOpenMobile(false);
    
    const documents = chat.documents || [];
    const hasDocuments = documents.length > 0;
    
    if (hasDocuments) {
      const latestDoc = documents[documents.length - 1];
      
      // 如果当前已经在该对话中，手动触发 artifact 显示
      if (params.id === chat.id) {
        e.preventDefault();
        setArtifact({
          documentId: latestDoc.id,
          kind: (latestDoc.kind as any) ?? "quote",
          title: latestDoc.title,
          isVisible: true,
          status: "idle",
          content: latestDoc.content || "",
          boundingBox: {
            top: 0,
            left: 0,
            width: 0,
            height: 0,
          },
        });
      }
      // 如果不在该对话中，Link 的 href 会处理带参数跳转
    } else {
      // 如果没有文档，确保隐藏 artifact
      setArtifact((prev) => ({ ...prev, isVisible: false }));
    }
  }, [chat.id, chat.documents, params.id, setArtifact, setOpenMobile]);

  const handleDocumentClick = useCallback((e: React.MouseEvent, doc: Document) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenMobile(false);

    if (params.id === chat.id) {
      // If we are in the same chat, just open the artifact
      setArtifact({
        documentId: doc.id,
        kind: (doc.kind as any) ?? "quote",
        title: doc.title,
        isVisible: true,
        status: "idle",
        content: doc.content || "",
        boundingBox: {
          top: 0,
          left: 0,
          width: 0,
          height: 0,
        },
      });
    } else {
      // If different chat, navigate with query params
      router.push(`/chat/${chat.id}?documentId=${doc.id}&kind=${doc.kind ?? "quote"}`);
    }
  }, [chat.id, params.id, router, setArtifact, setOpenMobile]);

  const latestDoc = chat.documents && chat.documents.length > 0 ? chat.documents[chat.documents.length - 1] : null;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} className="data-[active=true]:bg-[#e8f5ef] data-[active=true]:text-[#4caf83] hover:bg-[#f3f9f6] transition-colors group/btn">
        {isEditing ? (
          <div className="flex items-center w-full px-1">
            <Input
              ref={inputRef}
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="h-7 text-xs py-0 px-2 focus-visible:ring-1 focus-visible:ring-[#4caf83] border-[#4caf83]/20 bg-white dark:bg-zinc-900"
            />
          </div>
        ) : (
          <Link 
            href={latestDoc ? `/chat/${chat.id}?documentId=${latestDoc.id}&kind=${latestDoc.kind ?? "quote"}` : `/chat/${chat.id}`} 
            onClick={handleChatLinkClick} 
            onDoubleClick={handleEdit}
            className="flex items-center justify-between w-full group/title"
          >
            <span className="truncate flex-1 font-medium text-[13px]">{chat.title}</span>
            <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover/btn:opacity-100 transition-opacity">
              {pendingDocsCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="h-4 min-w-4 px-1 flex items-center justify-center rounded-full text-[9px] bg-[#4caf83] hover:bg-[#3d8b6d] border-none"
                >
                  {pendingDocsCount}
                </Badge>
              )}
            </div>
          </Link>
        )}
      </SidebarMenuButton>

      {chat.documents && chat.documents.length > 0 && (
        <div className="flex flex-col gap-0.5 pl-7 pb-1.5 mt-0.5">
          {chat.documents.map((doc) => (
            <div
              key={doc.id}
              onClick={(e) => handleDocumentClick(e, doc)}
              className="text-[11px] text-[#9ca3af] hover:text-[#4caf83] cursor-pointer flex items-center gap-2 py-1 transition-colors group/doc"
            >
              <div className="w-1 h-1 rounded-full bg-[#e5e9f0] group-hover/doc:bg-[#4caf83] transition-colors" />
              <span className="truncate">{doc.title}</span>
            </div>
          ))}
        </div>
      )}

      <ChatActions
        chatId={chat.id}
        title={chat.title}
        isPinned={chat.isPinned ?? undefined}
        initialProjectId={chat.projectId ?? undefined}
        projects={projects}
        isProjectsLoading={isProjectsLoading}
        onTitleUpdate={async (title) => onUpdateChat(chat.id, { title })}
        onRenameClick={() => setIsEditing(true)}
        onDelete={async () => {
          onDelete(chat.id);
        }}
        onTogglePin={async () => onPin(chat.id, !chat.isPinned)}
        onAddToProject={async (projectId) => onUpdateChat(chat.id, { projectId })}
        align="end"
        trigger={
          <SidebarMenuAction
            className="mr-0.5 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            showOnHover={true}
          >
            <MoreHorizontalIcon />
            <span className="sr-only">More</span>
          </SidebarMenuAction>
        }
      />
    </SidebarMenuItem>
  );
};

export const ChatItem = memo(PureChatItem, (prevProps, nextProps) => {
  if (prevProps.isActive !== nextProps.isActive) {
    return false;
  }
  if (prevProps.chat.id !== nextProps.chat.id) {
    return false;
  }
  if (prevProps.chat.title !== nextProps.chat.title) {
    return false;
  }
  if (prevProps.chat.isPinned !== nextProps.chat.isPinned) {
    return false;
  }
  if (prevProps.chat.projectId !== nextProps.chat.projectId) {
    return false;
  }
  if (prevProps.projects !== nextProps.projects) {
    return false;
  }
  if (prevProps.isProjectsLoading !== nextProps.isProjectsLoading) {
    return false;
  }
  return true;
});
