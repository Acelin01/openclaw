"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Check, Loader2, AppWindow, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Button,
  Badge,
} from "@uxin/ui";
import { useAIApps, useAddUserAIApp, useUserAIApps } from "@/hooks/use-agents";
import { useAuthToken } from "@/hooks/use-auth-token";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AIAppDiscoveryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AIAppDiscovery({ open, onOpenChange }: AIAppDiscoveryProps) {
  const router = useRouter();
  const { token } = useAuthToken();
  const [searchQuery, setSearchQuery] = useState("");
  const { 
    data: appsData, 
    isLoading: isLoadingAll,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useAIApps({ search: searchQuery }, token ?? undefined);
  const { data: userApps = [] } = useUserAIApps(token ?? undefined);
  const addUserApp = useAddUserAIApp(token ?? undefined);

  const allApps = useMemo(() => appsData?.pages.flat() || [], [appsData]);
  const userAppIds = useMemo(() => new Set(userApps.map(ua => ua.appId)), [userApps]);

  const handleAddApp = async (e: React.MouseEvent, appId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addUserApp.mutateAsync({ appId });
      toast.success("应用已添加到我的应用");
    } catch (error) {
      toast.error("添加应用失败");
    }
  };

  const handleNavigate = (appId: string, type?: string) => {
    // 确保 appId 存在
    if (!appId) return;
    
    // 先执行跳转
    const path = type === 'PROJECT' ? `/projects/${appId}` : `/apps/${appId}`;
    router.push(path);
    
    // 延迟关闭弹窗，确保跳转逻辑已启动
    // 在 Next.js 中，router.push 是异步的，立即关闭弹窗有时会干扰状态更新
    setTimeout(() => {
      onOpenChange(false);
    }, 100);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>发现 AI 应用</DialogTitle>
          <DialogDescription>
            浏览并添加更多 AI 应用到你的工作台。
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="搜索应用名称或描述..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {isLoadingAll ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="size-8 animate-spin mb-4" />
              <p>加载应用中...</p>
            </div>
          ) : allApps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <AppWindow className="size-12 mb-4 opacity-20" />
              <p>未找到相关应用</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4">
                {allApps.map((app) => {
                  const isAdded = userAppIds.has(app.id);

                  return (
                    <div
                      key={app.id}
                      className="flex items-start gap-4 p-4 rounded-xl border bg-card hover:bg-accent/50 transition-colors group relative cursor-pointer"
                      onClick={() => handleNavigate(app.id, app.type)}
                    >
                      <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-2xl shrink-0">
                        {app.icon || (app.type === 'PROJECT' ? '🚀' : '🛠️')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{app.name}</h3>
                          <Badge variant="secondary" className="text-[10px] h-4 px-1">
                            {app.type === 'PROJECT' ? '项目' : '工具'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {app.description || "暂无描述"}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 relative z-10">
                        <Button
                          size="sm"
                          variant={isAdded ? "ghost" : "outline"}
                          disabled={isAdded || addUserApp.isPending}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddApp(e, app.id);
                          }}
                          className={cn(
                            "shrink-0 h-8",
                            isAdded && "text-green-500 hover:text-green-500 hover:bg-transparent"
                          )}
                        >
                          {isAdded ? (
                            <>
                              <Check className="size-4 mr-1" />
                              已添加
                            </>
                          ) : (
                            <>
                              <Plus className="size-4 mr-1" />
                              添加
                            </>
                          )}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 text-[10px] text-muted-foreground"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleNavigate(app.id, app.type);
                          }}
                        >
                          <Info className="size-3 mr-1" />
                          详情
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {hasNextPage && (
                <Button
                  variant="ghost"
                  className="w-full py-4 text-muted-foreground hover:text-foreground"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? (
                    <Loader2 className="size-4 animate-spin mr-2" />
                  ) : (
                    "加载更多..."
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
