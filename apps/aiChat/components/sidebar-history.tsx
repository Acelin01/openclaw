"use client";

import { isToday, isYesterday, subMonths, subWeeks } from "date-fns";
import { motion } from "framer-motion";
import { ChevronRight, ChevronDown } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import type { User } from "next-auth";
import { useAuthToken } from "@/hooks/use-auth-token";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  useSidebar,
  Button,
} from "@uxin/ui";
import { LoaderIcon } from "./icons";
import { ChatItem } from "./sidebar-history-item";
import { useHistory, type ChatWithDocuments } from "@/hooks/use-history";
import { useProjects } from "@/hooks/use-projects";

type GroupedChats = {
  pinned: ChatWithDocuments[];
  today: ChatWithDocuments[];
  yesterday: ChatWithDocuments[];
  lastWeek: ChatWithDocuments[];
  lastMonth: ChatWithDocuments[];
  older: ChatWithDocuments[];
};

const groupChatsByDate = (chats: ChatWithDocuments[]): GroupedChats => {
  const now = new Date();
  const oneWeekAgo = subWeeks(now, 1);
  const oneMonthAgo = subMonths(now, 1);

  return chats.reduce(
    (groups, chat) => {
      if (chat.isPinned) {
        groups.pinned.push(chat);
        return groups;
      }

      const chatDate = new Date(chat.createdAt);

      if (isToday(chatDate)) {
        groups.today.push(chat);
      } else if (isYesterday(chatDate)) {
        groups.yesterday.push(chat);
      } else if (chatDate > oneWeekAgo) {
        groups.lastWeek.push(chat);
      } else if (chatDate > oneMonthAgo) {
        groups.lastMonth.push(chat);
      } else {
        groups.older.push(chat);
      }

      return groups;
    },
    {
      pinned: [],
      today: [],
      yesterday: [],
      lastWeek: [],
      lastMonth: [],
      older: [],
    } as GroupedChats
  );
};

import { useTranslation } from "react-i18next";

export function SidebarHistory({ user }: { user: User | undefined }) {
  const { t } = useTranslation(["sidebar", "common"]);
  const { setOpenMobile } = useSidebar();
  const { id } = useParams();
  const { token } = useAuthToken();

  // 只要有用户且不是游客，就应该尝试获取历史记录
  const shouldFetchHistory = user && user.type !== "guest";

  const {
    data: historyData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
    pinChat,
    deleteChat,
    updateChat
  } = useHistory(token);

  const { data: projects = [], isLoading: isProjectsLoading } = useProjects(token);

  useEffect(() => {
    if (token) {
      refetch();
    }
  }, [token, refetch]);

  const router = useRouter();
  const [isPinnedOpen, setIsPinnedOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePin = async (chatId: string, isPinned: boolean) => {
    toast.promise(pinChat({ chatId, isPinned }), {
      loading: isPinned ? t('history.pinning') : t('history.unpinning'),
      success: isPinned ? t('history.pinned') : t('history.unpinned'),
      error: t('history.pin_failed'),
    });
  };

  const handleUpdateChat = async (chatId: string, updates: any) => {
    toast.promise(updateChat({ chatId, updates }), {
      loading: t('history.updating'),
      success: t('history.updated'),
      error: t('history.update_failed'),
    });
  };

  const handleDelete = async (chatId: string) => {
    toast.promise(deleteChat(chatId), {
      loading: t('history.deleting'),
      success: t('history.deleted'),
      error: t('history.delete_failed'),
    });

    if (chatId === id) {
      router.push("/");
    }
  };

  // 如果还未挂载，渲染一个占位符或 skeleton 以保持服务端和客户端一致
  if (!mounted) {
    return (
      <SidebarGroup>
        <div className="px-2 py-1 text-sidebar-foreground/50 text-xs">
          {t('history.today')}
        </div>
        <SidebarGroupContent>
          <div className="flex flex-col">
            {[44, 32, 28, 64, 52].map((item) => (
              <div
                className="flex h-8 items-center gap-2 rounded-md px-2"
                key={item}
              >
                <div
                  className="h-4 max-w-(--skeleton-width) flex-1 rounded-md bg-sidebar-accent-foreground/10"
                  style={
                    {
                      "--skeleton-width": `${item}%`,
                    } as React.CSSProperties
                  }
                />
              </div>
            ))}
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (!user) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="flex w-full flex-row items-center justify-center gap-2 px-2 text-sm text-zinc-500">
            {t('history.login_to_save')}
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (!shouldFetchHistory) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="flex w-full flex-row items-center justify-center gap-2 px-2 text-sm text-zinc-500">
            {t('history.login_as_guest')}
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (isLoading || !token) {
    return (
      <SidebarGroup>
        <div className="px-2 py-1 text-sidebar-foreground/50 text-xs">
          {t('history.today')}
        </div>
        <SidebarGroupContent>
          <div className="flex flex-col">
            {[44, 32, 28, 64, 52].map((item) => (
              <div
                className="flex h-8 items-center gap-2 rounded-md px-2"
                key={item}
              >
                <div
                  className="h-4 max-w-(--skeleton-width) flex-1 rounded-md bg-sidebar-accent-foreground/10"
                  style={
                    {
                      "--skeleton-width": `${item}%`,
                    } as React.CSSProperties
                  }
                />
              </div>
            ))}
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  const hasEmptyChatHistory = historyData?.pages[0]?.chats.length === 0;

  if (hasEmptyChatHistory) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="flex w-full flex-row items-center justify-center gap-2 px-2 text-sm text-zinc-500">
            {t('history.empty_history')}
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (isError) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="flex w-full flex-row items-center justify-center gap-2 px-2 text-sm text-red-500">
            历史记录加载失败
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80"
              onClick={() => refetch()}
            >
              重试
            </Button>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {historyData &&
              (() => {
                const chatsFromHistory = historyData.pages.flatMap(
                  (page) => page.chats
                );

                const groupedChats = groupChatsByDate(chatsFromHistory);

                return (
                  <div className="flex flex-col gap-6">
                    {groupedChats.pinned.length > 0 && (
                      <div className="space-y-1">
                        <div
                          className="flex cursor-pointer items-center gap-2 px-3 py-2 text-slate-400 text-[11px] font-black uppercase tracking-wider transition-all hover:text-slate-900 group"
                          onClick={() => setIsPinnedOpen(!isPinnedOpen)}
                        >
                          {isPinnedOpen ? (
                            <ChevronDown size={14} className="stroke-[3]" />
                          ) : (
                            <ChevronRight size={14} className="stroke-[3]" />
                          )}
                          <span>置顶对话 ({groupedChats.pinned.length})</span>
                        </div>
                        {isPinnedOpen && (
                          <div className="flex flex-col gap-0.5 px-1">
                            {groupedChats.pinned.map((chat) => (
                              <ChatItem
                                chat={chat}
                                isActive={chat.id === id}
                                key={chat.id}
                                onDelete={handleDelete}
                                onPin={handlePin}
                                onUpdateChat={handleUpdateChat}
                                projects={projects}
                                isProjectsLoading={isProjectsLoading}
                                setOpenMobile={setOpenMobile}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {groupedChats.today.length > 0 && (
                      <div className="space-y-1">
                        <div className="px-3 py-2 text-slate-400 text-[11px] font-black uppercase tracking-wider flex items-center justify-between">
                          <span>今天</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4caf83]/40" />
                        </div>
                        <div className="flex flex-col gap-0.5 px-1">
                          {groupedChats.today.map((chat) => (
                            <ChatItem
                              chat={chat}
                              isActive={chat.id === id}
                              key={chat.id}
                              onDelete={handleDelete}
                              onPin={handlePin}
                              onUpdateChat={handleUpdateChat}
                              projects={projects}
                              isProjectsLoading={isProjectsLoading}
                              setOpenMobile={setOpenMobile}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {groupedChats.yesterday.length > 0 && (
                      <div className="space-y-1">
                        <div className="px-3 py-2 text-slate-400 text-[11px] font-black uppercase tracking-wider">
                          {t('history.yesterday')}
                        </div>
                        <div className="flex flex-col gap-0.5 px-1">
                          {groupedChats.yesterday.map((chat) => (
                            <ChatItem
                              chat={chat}
                              isActive={chat.id === id}
                              key={chat.id}
                              onDelete={handleDelete}
                              onPin={handlePin}
                              onUpdateChat={handleUpdateChat}
                              projects={projects}
                              isProjectsLoading={isProjectsLoading}
                              setOpenMobile={setOpenMobile}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {groupedChats.lastWeek.length > 0 && (
                      <div className="space-y-1">
                        <div className="px-3 py-2 text-slate-400 text-[11px] font-black uppercase tracking-wider">
                          {t('history.last_7_days')}
                        </div>
                        <div className="flex flex-col gap-0.5 px-1">
                          {groupedChats.lastWeek.map((chat) => (
                            <ChatItem
                              chat={chat}
                              isActive={chat.id === id}
                              key={chat.id}
                              onDelete={handleDelete}
                              onPin={handlePin}
                              onUpdateChat={handleUpdateChat}
                              projects={projects}
                              isProjectsLoading={isProjectsLoading}
                              setOpenMobile={setOpenMobile}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {groupedChats.lastMonth.length > 0 && (
                      <div className="space-y-1">
                        <div className="px-3 py-2 text-slate-400 text-[11px] font-black uppercase tracking-wider">
                          {t('history.last_30_days')}
                        </div>
                        <div className="flex flex-col gap-0.5 px-1">
                          {groupedChats.lastMonth.map((chat) => (
                            <ChatItem
                              chat={chat}
                              isActive={chat.id === id}
                              key={chat.id}
                              onDelete={handleDelete}
                              onPin={handlePin}
                              onUpdateChat={handleUpdateChat}
                              projects={projects}
                              isProjectsLoading={isProjectsLoading}
                              setOpenMobile={setOpenMobile}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {groupedChats.older.length > 0 && (
                      <div className="space-y-1">
                        <div className="px-3 py-2 text-slate-400 text-[11px] font-black uppercase tracking-wider">
                          更早
                        </div>
                        <div className="flex flex-col gap-0.5 px-1">
                          {groupedChats.older.map((chat) => (
                            <ChatItem
                              chat={chat}
                              isActive={chat.id === id}
                              key={chat.id}
                              onDelete={handleDelete}
                              onPin={handlePin}
                              onUpdateChat={handleUpdateChat}
                              projects={projects}
                              isProjectsLoading={isProjectsLoading}
                              setOpenMobile={setOpenMobile}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
          </SidebarMenu>

          <motion.div
            onViewportEnter={() => {
              if (!isFetchingNextPage && hasNextPage) {
                fetchNextPage();
              }
            }}
          />

          {isFetchingNextPage && (
            <div className="mt-4 flex flex-row items-center justify-center gap-2 p-2 text-zinc-500 dark:text-zinc-400">
              <div className="animate-spin">
                <LoaderIcon />
              </div>
              <div className="text-xs">{t('history.loading_more')}</div>
            </div>
          )}

          {!hasNextPage &&
            historyData &&
            historyData.pages.flatMap((p) => p.chats).length > 0 && (
              <div className="mt-4 flex w-full flex-row items-center justify-center gap-2 px-2 text-xs text-zinc-500/50">
                {t('history.no_more')}
              </div>
            )}
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}
