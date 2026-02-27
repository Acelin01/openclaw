"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import type { User } from "next-auth";
import { useAuthToken } from "@/hooks/use-auth-token";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { SidebarHistory } from "@/components/sidebar-history";
import { SidebarUserNav } from "@/components/sidebar-user-nav";
import { FIXED_MODULES } from "@/config/navigation";
import { SidebarToggle } from "@/components/sidebar-toggle";
import { SidebarLeftIcon } from "@/components/icons";
import { useMessageThreads } from "@/hooks/use-message-threads";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  useSidebar,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@uxin/ui";
import { useHistory } from "@/hooks/use-history";
import { SidebarProjects } from "./sidebar-projects";
import { SidebarAIApps } from "./sidebar-ai-apps";
import { useUserTasks } from "@/hooks/use-workbench";
import { useSchedules } from "@/hooks/use-schedules";
import { useContacts } from "@/hooks/use-contacts";

export function AppSidebar({ user }: { user: User | undefined }) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const { setOpenMobile, setOpen, state, openMobile } = useSidebar();
  const { token } = useAuthToken();
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { deleteAllChats } = useHistory(token);
  const { unreadTotal } = useMessageThreads();
  const { data: tasks = [] } = useUserTasks(token);
  const { data: schedules = [] } = useSchedules(token);
  const { data: contacts = [] } = useContacts(token);

  // 待办任务数 (工作台)
  const pendingTasksCount = tasks.filter(t => t.status === 'PENDING').length;
  // 新视频邀约 (日程) - 假设 type 为 VIDEO 且为将来时间或特定标志
  const videoInvitesCount = schedules.filter(s => s.type === 'VIDEO').length;
  // 新增加个人或企业 (通讯录) - 这里暂时用总数演示，实际应根据 createdAt 或 isNew 标志
  const newContactsCount = contacts.length;

  const getBadgeCount = (label: string) => {
    if (!mounted) return 0;
    switch (label) {
      case "工作台": return pendingTasksCount;
      case "日程": return videoInvitesCount;
      case "通讯录": return newContactsCount;
      case "消息": return unreadTotal;
      default: return 0;
    }
  };

  const handleDeleteAll = () => {
    toast.promise(deleteAllChats(), {
      loading: t('common.loading'),
      success: () => {
        router.push("/");
        setShowDeleteAllDialog(false);
        return t('common.success');
      },
      error: t('common.error'),
    });
  };

  const getLabel = (item: typeof FIXED_MODULES[0]) => {
    if (item.action === 'new_chat') return t('chat.newChat');
    if (item.action === 'discovery') return t('navigation.discovery');
    return item.label;
  };

  return (
    <>
      <Sidebar 
        collapsible="offcanvas" 
        className="group-data-[side=left]:border-r-0"
      >
        <SidebarHeader>
          <SidebarMenu>
            <div className="flex flex-row items-center px-0.5 justify-between">
              <div className="group relative flex items-center justify-center">
                <Link
                  className="flex flex-row items-center"
                  href="/"
                  onClick={() => {
                    setOpenMobile(false);
                  }}
                >
                  <div className="bg-emerald-500 text-white w-7 h-7 rounded-lg flex items-center justify-center font-bold transition-all duration-200">
                    UX
                  </div>
                </Link>
              </div>

              <div className="flex flex-row gap-1">
                <SidebarToggle className="h-8 px-2" />
              </div>
            </div>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {FIXED_MODULES.map((item) => {
                  const isActive = item.href === '/' 
                    ? pathname === '/' || pathname.startsWith('/chat')
                    : pathname.startsWith(item.href) || (item.label === '工作台' && (pathname.startsWith('/finance') || pathname.startsWith('/recruitment')));

                  return (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton
                        asChild
                        className={cn(
                          "group-data-[collapsible=icon]:!h-12 group-data-[collapsible=icon]:!w-full group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-1 relative",
                          isActive && "bg-emerald-50 text-emerald-600 font-medium dark:bg-emerald-500/10 dark:text-emerald-500"
                        )}
                        onClick={(e) => {
                          if (state === "collapsed") {
                            e.stopPropagation();
                          }
                          
                          if (item.action === "new_chat") {
                            setOpenMobile(false);
                            // 使用 window.location.href 确保彻底重置并携带正确 cookie
                            window.location.href = "/";
                          } else {
                            // 其他导航项，仅在移动端收起
                            setOpenMobile(false);
                          }
                        }}
                      >
                        <Link href={item.href}>
                          <item.icon className={cn(
                            "group-data-[collapsible=icon]:size-4",
                            isActive ? "text-emerald-500" : "text-zinc-500"
                          )} />
                          {getBadgeCount(item.label) > 0 && (
                            <span className="hidden group-data-[collapsible=icon]:inline-flex absolute top-1 right-1 h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] text-white">
                              {getBadgeCount(item.label)}
                            </span>
                          )}
                          <span className="flex items-center gap-2 group-data-[collapsible=icon]:text-[10px] group-data-[collapsible=icon]:scale-90 group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:leading-none">
                            {getLabel(item)}
                            {getBadgeCount(item.label) > 0 && (
                              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white group-data-[collapsible=icon]:hidden">
                                {getBadgeCount(item.label)}
                              </span>
                            )}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          {(state !== "collapsed" || openMobile) && <SidebarAIApps />}
          {(state !== "collapsed" || openMobile) && <SidebarProjects />}
          {(state !== "collapsed" || openMobile) && <SidebarHistory user={user} />}
        </SidebarContent>
        <SidebarFooter>
          <SidebarUserNav user={user || { email: 'guest', id: 'guest' } as any} />
        </SidebarFooter>
      </Sidebar>

      <AlertDialog
        onOpenChange={setShowDeleteAllDialog}
        open={showDeleteAllDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('settings.deleteAll')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('settings.deleteAllDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAll}>
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
