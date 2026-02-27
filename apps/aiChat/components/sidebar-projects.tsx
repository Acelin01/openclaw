"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ChevronRight, ChevronDown, Folder, MessageSquare, Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { cn, isEmoji } from "@/lib/utils";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
} from "@uxin/ui";
import { useProjects } from "@/hooks/use-projects";
import { useAuthToken } from "@/hooks/use-auth-token";
import { useHistory } from "@/hooks/use-history";
import { useArtifact } from "@/hooks/use-artifact";

import { useTranslation } from "react-i18next";

export function SidebarProjects() {
  const { t } = useTranslation("sidebar");
  const { state, setOpenMobile } = useSidebar();
  const { token } = useAuthToken();
  const { data: session } = useSession();
  const { id: chatId } = useParams();
  const searchParams = useSearchParams();
  const projectId = searchParams?.get("projectId");
  const { setArtifact } = useArtifact();
  const { data: projects = [], isLoading } = useProjects(token);
  const { data: historyData } = useHistory(token);
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 创建一个对话 ID 到文档的映射，从历史记录中获取
  const chatDocumentsMap = new Map();
  historyData?.pages.forEach(page => {
    page.chats.forEach(chat => {
      chatDocumentsMap.set(chat.id, chat.documents);
    });
  });

  // Auto-expand project if current chat belongs to it
  useEffect(() => {
    if (chatId && projects.length > 0) {
      projects.forEach((project) => {
        const hasChat = project.conversations?.some((c: any) => c.id === chatId);
        if (hasChat) {
          setExpandedProjects((prev) => ({
            ...prev,
            [project.id]: true,
          }));
        }
      });
    }
  }, [chatId, projects]);

  const toggleProject = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedProjects((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleProjectLinkClick = (e: React.MouseEvent, project: any) => {
    setOpenMobile(false);
    
    // 始终手动触发 artifact 项目预览
    e.preventDefault();
    setArtifact({
      documentId: `project-${project.id}`,
      kind: "project",
      content: JSON.stringify(project),
      title: project.name,
      isVisible: true,
      status: "idle",
      initialViewMode: "preview",
      boundingBox: {
        top: 0,
        left: 0,
        width: 0,
        height: 0,
      },
    });
  };

  if (!mounted || isLoading || projects.length === 0) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel asChild className="group/label px-2 py-0">
        <div className="flex items-center justify-between w-full h-8">
          <Link 
            href="/?tab=projects" 
            className="flex-1 text-sm font-medium hover:text-foreground transition-colors cursor-pointer"
            onClick={() => setOpenMobile(false)}
          >
            {t('projects.title')}
          </Link>
          <Link
            href="/?tab=projects&action=new"
            className="flex size-5 items-center justify-center rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors opacity-0 group-hover/label:opacity-100"
            onClick={() => setOpenMobile(false)}
          >
            <Plus className="size-3.5" />
          </Link>
        </div>
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {projects.map((project) => {
            const isExpanded = expandedProjects[project.id];
            const isActive = projectId === project.id;
            const members = project.members || [];
            
            // Filter conversations:
            // 1. If user is owner, show all project conversations
            // 2. If user is member, show their own conversations OR public project conversations
            const conversations = (project.conversations || []).filter((conv: any) => {
              if (project.userId === session?.user?.id) return true;
              return conv.userId === session?.user?.id || conv.visibility === "public";
            });

            return (
              <SidebarMenuItem key={project.id}>
                <div className="flex flex-col">
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    className={cn(
                      "group/project relative flex items-center justify-between px-2 py-1.5 h-9",
                      isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div
                          onClick={(e) => toggleProject(e, project.id)}
                          className="flex size-5 items-center justify-center rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
                        >
                          <Avatar className="size-4">
                            {project.avatarUrl ? (
                              isEmoji(project.avatarUrl) ? (
                                <div className="flex items-center justify-center w-full h-full text-[10px]">{project.avatarUrl}</div>
                              ) : (
                                <AvatarImage src={project.avatarUrl} />
                              )
                            ) : null}
                            <AvatarFallback className="bg-transparent">
                              <Folder className="size-4 text-zinc-500" />
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <Link 
                          href={`/?projectId=${project.id}`}
                          className="truncate font-medium text-sm flex-1 text-left"
                          onClick={(e) => handleProjectLinkClick(e, project)}
                        >
                          {project.name}
                        </Link>
                      </div>

                      <div 
                        className="flex items-center gap-2 shrink-0 ml-2 cursor-pointer"
                        onClick={(e) => toggleProject(e, project.id)}
                      >
                        {/* Member Avatars */}
                        {members.length > 0 && state !== "collapsed" && (
                          <div className="flex -space-x-2 overflow-hidden">
                            {members.slice(0, 3).map((member: any, i: number) => (
                              <Avatar key={i} className="inline-block size-5 border-2 border-background ring-0">
                                {member.user?.avatarUrl ? (
                                  isEmoji(member.user.avatarUrl) ? (
                                    <div className="flex items-center justify-center w-full h-full text-[10px]">{member.user.avatarUrl}</div>
                                  ) : (
                                    <AvatarImage src={member.user.avatarUrl} />
                                  )
                                ) : null}
                                <AvatarFallback className="text-[8px]">
                                  {member.user?.name?.slice(0, 2) || "U"}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {members.length > 3 && (
                              <div className="flex size-5 items-center justify-center rounded-full border-2 border-background bg-muted text-[8px] font-medium">
                                +{members.length - 3}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Expand Toggle Chevron */}
                        {conversations.length > 0 && (
                          <div className="flex size-4 items-center justify-center">
                            {isExpanded ? (
                              <ChevronDown className="size-3 text-zinc-500" />
                            ) : (
                              <ChevronRight className="size-3 text-zinc-500" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </SidebarMenuButton>

                  {/* Conversations Submenu */}
                  {isExpanded && conversations.length > 0 && (
                    <SidebarMenuSub className="ml-4 border-l border-zinc-200 dark:border-zinc-800">
                      {conversations.map((conv: any) => (
                        <SidebarMenuSubItem key={conv.id}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={chatId === conv.id}
                            className="px-2 py-1 h-8"
                          >
                          <Link 
                            href={`/chat/${conv.id}`}
                            className="flex items-center justify-between gap-2 group/conv flex-1 min-w-0"
                            onClick={() => setOpenMobile(false)}
                          >
                            <span className="truncate text-xs text-zinc-600 dark:text-zinc-400">
                              {conv.title || conv.name || t('projects.untitled_chat')}
                            </span>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {/* Pending documents badge */}
                              {(() => {
                                const docs = conv.documents || chatDocumentsMap.get(conv.id) || [];
                                const pendingCount = docs.filter((d: any) => d.status === 'PENDING').length;
                                return pendingCount > 0 ? (
                                  <Badge 
                                    variant="destructive" 
                                    className="h-4 min-w-4 px-1 flex items-center justify-center rounded-full text-[9px]"
                                  >
                                    {pendingCount}
                                  </Badge>
                                ) : null;
                              })()}
                              
                              {/* Show creator avatar if not the current user */}
                              {conv.userId !== session?.user?.id && conv.user && (
                                <Avatar className="size-4">
                                  {conv.user.avatarUrl ? (
                                    isEmoji(conv.user.avatarUrl) ? (
                                      <div className="flex items-center justify-center w-full h-full text-[8px]">{conv.user.avatarUrl}</div>
                                    ) : (
                                      <AvatarImage src={conv.user.avatarUrl} />
                                    )
                                  ) : null}
                                  <AvatarFallback className="text-[6px] bg-muted">
                                    {conv.user.name?.slice(0, 1) || "U"}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                          </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </div>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
