"use client";

import { useAIApps, useAddUserAIApp, useUserAIApps } from "@/hooks/use-agents";
import { useAuthToken } from "@/hooks/use-auth-token";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Bot, 
  Wrench, 
  Play, 
  Plus, 
  Check, 
  Clock, 
  Info,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { Button, Badge, Skeleton } from "@uxin/ui";
import { toast } from "sonner";
import Link from "next/link";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

export default function AIAppDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { token } = useAuthToken();
  const { data: allApps = [], isLoading } = useAIApps({}, token ?? undefined);
  const { data: userApps = [] } = useUserAIApps(token ?? undefined);
  const addUserApp = useAddUserAIApp(token ?? undefined);

  const app = useMemo(() => allApps.find(a => a.id === id), [allApps, id]);
  const userApp = useMemo(() => userApps.find(ua => ua.appId === id), [userApps, id]);
  const isAdded = !!userApp;

  const handleAddApp = async () => {
    try {
      await addUserApp.mutateAsync({ appId: id });
      toast.success("应用已添加到我的应用");
    } catch (error) {
      toast.error("添加应用失败");
    }
  };

  const handleLaunch = () => {
    router.push(`/?appId=${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <Skeleton className="size-16 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-2 gap-8">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <Info className="size-12 text-muted-foreground mb-4 opacity-20" />
        <h2 className="text-xl font-semibold mb-2">应用未找到</h2>
        <p className="text-muted-foreground mb-6">该应用可能已被删除或你没有访问权限。</p>
        <Button asChild variant="outline">
          <Link href="/">返回首页</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background/50">
      <div className="max-w-4xl mx-auto p-8">
        {/* Navigation */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            className="-ml-2 text-muted-foreground"
            onClick={() => router.back()}
          >
            <ArrowLeft className="size-4 mr-2" />
            返回
          </Button>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start gap-8 mb-12">
          <div className="flex size-24 items-center justify-center rounded-3xl bg-primary/10 text-5xl shrink-0 shadow-sm border border-primary/5">
            {app.icon || (app.type === 'PROJECT' ? '🚀' : '🛠️')}
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold tracking-tight">{app.name}</h1>
                <Badge variant="secondary" className="px-2 py-0.5">
                  {app.type === 'PROJECT' ? '项目' : '工具'}
                </Badge>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {app.description || "暂无描述"}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {isAdded ? (
                <Button size="lg" onClick={handleLaunch} className="rounded-full px-8 shadow-md hover:shadow-lg transition-all">
                  <Play className="size-4 mr-2 fill-current" />
                  立即运行
                </Button>
              ) : (
                <Button 
                  size="lg" 
                  onClick={handleAddApp} 
                  disabled={addUserApp.isPending}
                  className="rounded-full px-8 shadow-md hover:shadow-lg transition-all"
                >
                  <Plus className="size-4 mr-2" />
                  添加应用
                </Button>
              )}
              <Button variant="outline" size="lg" className="rounded-full px-8">
                分享
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-12">
            {/* Agents */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Bot className="size-5 text-primary" />
                  包含智能体 ({app.agents?.length || 0})
                </h2>
              </div>
              <div className="grid gap-4">
                {app.agents?.map((agent) => (
                  <div 
                    key={agent.id} 
                    className="flex items-center gap-4 p-4 rounded-[20px] border border-slate-100 bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all group cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="size-12 rounded-xl bg-rose-50 flex items-center justify-center text-2xl border border-rose-100 group-hover:scale-105 transition-transform">
                      {agent.avatar || "🤖"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 truncate group-hover:text-rose-600 transition-colors">{agent.name}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1 font-light">
                        {agent.prompt?.substring(0, 100)}
                      </p>
                    </div>
                    <ChevronRight className="size-4 text-slate-300 group-hover:text-rose-400 transition-colors" />
                  </div>
                ))}
                {!app.agents?.length && (
                  <p className="text-sm text-muted-foreground italic bg-muted/30 p-4 rounded-xl text-center">未关联智能体</p>
                )}
              </div>
            </section>

            {/* MCP Tools */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Wrench className="size-5 text-primary" />
                  可用工具 ({app.mcpTools?.length || 0})
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {app.mcpTools?.map((tool) => (
                  <div 
                    key={tool.id} 
                    className="p-4 rounded-[20px] border border-slate-100 bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all group cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center gap-3 mb-2">
                      <div className="size-10 rounded-lg bg-emerald-50 flex items-center justify-center text-xl border border-emerald-100 group-hover:rotate-12 transition-transform">
                        {tool.avatar || "🛠️"}
                      </div>
                      <h4 className="font-bold text-slate-800 truncate group-hover:text-emerald-600 transition-colors">{tool.name}</h4>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-light">
                      {tool.description}
                    </p>
                  </div>
                ))}
                {!app.mcpTools?.length && (
                  <p className="text-sm text-muted-foreground italic bg-muted/30 p-4 rounded-xl text-center col-span-2">未关联工具</p>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            <div className="rounded-2xl border bg-card/50 p-6 space-y-6">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">详情信息</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Clock className="size-4" />
                    发布日期
                  </span>
                  <span className="font-medium">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Info className="size-4" />
                    当前版本
                  </span>
                  <span className="font-medium">v1.0.0</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Check className="size-4" />
                    状态
                  </span>
                  <Badge variant="outline" className="text-green-500 border-green-500/20 bg-green-500/5 h-5">
                    {app.status === 'PUBLISHED' ? '已发布' : '草稿'}
                  </Badge>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50">
                <Button variant="ghost" className="w-full justify-between group h-10 px-0 hover:bg-transparent" asChild>
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    <span className="text-sm">查看开发者信息</span>
                    <ExternalLink className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
