"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { LayoutGrid, Bot, Wrench, Plus, MoreHorizontal, Info, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  useSidebar,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@uxin/ui";
import { useUserAIApps } from "@/hooks/use-agents";
import { useAuthToken } from "@/hooks/use-auth-token";
import { AIAppDiscovery } from "./ai-app-discovery";
import { useTranslation } from "react-i18next";

export function SidebarAIApps() {
  const { t } = useTranslation("sidebar");
  const { setOpenMobile, state } = useSidebar();
  const { token } = useAuthToken();
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentAppId = searchParams.get('appId');
  const { data: userApps = [], isLoading } = useUserAIApps(token ?? undefined);
  const [showDiscovery, setShowDiscovery] = useState(false);

  const isCollapsed = state === "collapsed";

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel className="flex items-center justify-between px-2">
          <span>{t('ai_apps.title')}</span>
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDiscovery(true)}
              className="h-5 w-5 hover:bg-sidebar-accent rounded-sm transition-colors"
            >
              <Plus className="size-3.5" />
            </Button>
          )}
        </SidebarGroupLabel>
        <SidebarGroupContent className="px-2 pt-1.5 pb-2">
          {isLoading ? (
             <div className="flex items-center justify-center py-4">
               <div className="size-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
             </div>
          ) : userApps.length === 0 ? (
            <div className="px-2 py-4 text-center">
              <p className="text-xs text-muted-foreground mb-2">{t('ai_apps.empty')}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-[10px] w-full"
                onClick={() => setShowDiscovery(true)}
              >
                {t('ai_apps.discover')}
              </Button>
            </div>
          ) : (
            <SidebarMenu>
              {userApps.map((userApp) => {
                const app = userApp.app;
                const isActive = currentAppId === app.id;
                
                return (
                  <SidebarMenuItem key={app.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        "group/app relative flex items-center gap-3 px-2 py-1.5 h-9",
                        isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                      )}
                    >
                      <Link 
                        href={`/?appId=${app.id}`}
                        onClick={() => setOpenMobile(false)}
                        className="flex items-center gap-2 w-full overflow-hidden"
                      >
                        <div className="flex size-5 items-center justify-center rounded bg-primary/10 text-xs shrink-0">
                          {app.icon || (app.type === 'PROJECT' ? '🚀' : '🛠️')}
                        </div>
                        {!isCollapsed && (
                          <>
                            <span className="truncate font-medium text-sm flex-1">
                              {app.name}
                            </span>
                            {userApp.isDefault && (
                              <Badge variant="outline" className="h-4 px-1 text-[8px] text-green-500 border-green-500/30">
                                {t('ai_apps.default')}
                              </Badge>
                            )}
                          </>
                        )}
                      </Link>
                    </SidebarMenuButton>
                    
                    {!isCollapsed && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <SidebarMenuAction className="opacity-0 group-hover/app:opacity-100 transition-opacity">
                            <MoreHorizontal className="size-4" />
                          </SidebarMenuAction>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="right" align="start" className="w-40">
                          <DropdownMenuItem onClick={() => {
                            const path = app.type === 'PROJECT' ? `/projects/${app.id}` : `/apps/${app.id}`;
                            router.push(path);
                          }}>
                            <Info className="size-4 mr-2" />
                            <span>{t('ai_apps.view_details')}</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/?appId=${app.id}`)}>
                            <ExternalLink className="size-4 mr-2" />
                            <span>{t('ai_apps.run_now')}</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          )}
        </SidebarGroupContent>
      </SidebarGroup>
      <AIAppDiscovery open={showDiscovery} onOpenChange={setShowDiscovery} />
    </>
  );
}
